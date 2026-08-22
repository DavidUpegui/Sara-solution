import type { Email } from "@/domain/models/Email";
import type { EmailHistoryNode } from "@/domain/models/EmailHistoryNode";
import type { EmailContext } from "../dto/EmailContext";
import type { EmailContextGenerator } from "../ports/EmailContextGenerator";
import type { EmailHistoryRepository } from "../ports/EmailHistoryRepository";
import type { EmailEmbedder } from "../ports/EmailEmbedder";
import type { EmailClassification } from "@/domain/models/EmailClassification";

// Límites del grafo de correos relacionados.
const RELATED_NODES_LIMIT = 5;
const RELATED_DEPTH_LIMIT = 2;

// Texto que se embebe para representar el "significado" de un correo.
function buildEmbeddingText(email: Email): string {
  return `${email.asunto}\n${email.cuerpo}`;
}

export class GetEmailContext {
  // Caché en memoria por emailId. Guarda la Promise (no el valor) para
  // deduplicar llamadas concurrentes al mismo correo.
  private readonly cache = new Map<number, Promise<EmailContext>>();

  constructor(
    private readonly historyRepository: EmailHistoryRepository,
    private readonly contextGenerator: EmailContextGenerator,
    private readonly emailEmbedder: EmailEmbedder,
    private readonly candidateLimit = 8,
  ) {}

  // Devuelve el contexto de un correo, reutilizando el resultado cacheado si existe.
  get(email: Email): Promise<EmailContext> {
    const cached = this.cache.get(email.id);
    if (cached) return cached;

    const contextPromise = this.build(email).catch((error: unknown) => {
      this.cache.delete(email.id);
      throw error;
    });
    this.cache.set(email.id, contextPromise);
    return contextPromise;
  }

  clearCache(): void {
    this.cache.clear();
  }

  // Persiste la clasificación y actualiza el nodo en caché para no re-consultar disco.
  async saveClassificationIfMissing(
    emailId: number,
    classification: EmailClassification,
  ): Promise<void> {
    await this.historyRepository.saveClassificationIfMissing(emailId, classification);
    this.patchCachedClassification(emailId, classification);
  }

  // Construye el contexto: reutiliza el nodo persistido o lo crea desde cero.
  private async build(email: Email): Promise<EmailContext> {
    const existing = await this.historyRepository.findByEmailId(email.id);
    if (existing) return this.contextFromExisting(existing);

    const node = await this.buildNewNode(email);
    await this.historyRepository.save(node);
    await this.backlinkRelatedNodes(node, email.id);

    return { current: node, related: await this.collectRelated(node) };
  }

  // El correo ya fue procesado antes: solo recolecta sus relacionados.
  private async contextFromExisting(node: EmailHistoryNode): Promise<EmailContext> {
    return { current: node, related: await this.collectRelated(node) };
  }

  // Crea un nodo nuevo: embebe, busca candidatos y pide el resumen a la IA.
  private async buildNewNode(email: Email): Promise<EmailHistoryNode> {
    const embedding = await this.emailEmbedder.embed(buildEmbeddingText(email));
    const candidates = await this.historyRepository.searchSimilar(embedding, this.candidateLimit);
    const generated = await this.contextGenerator.generate(email, candidates);

    return {
      ...generated,
      emailId: email.id,
      fechas: generated.fechas.length > 0 ? generated.fechas : [email.fecha],
      relatedNodes: this.sanitizeRelatedIds(generated.relatedNodes, email.id, candidates),
      keyValues: generated.keyValues ?? {},
      context: generated.context.trim(),
      embedding,
    };
  }

  // Conserva solo ids válidos: sin duplicados, sin el propio correo y que
  // existan entre los candidatos (defensa contra ids inventados por el modelo).
  private sanitizeRelatedIds(
    ids: number[],
    ownId: number,
    candidates: EmailHistoryNode[],
  ): number[] {
    return [...new Set(ids)]
      .filter((id) => id !== ownId && candidates.some((candidate) => candidate.emailId === id));
  }

  // Enlace inverso: agrega este correo a los relatedNodes de cada relacionado.
  private async backlinkRelatedNodes(node: EmailHistoryNode, ownId: number): Promise<void> {
    for (const relatedId of node.relatedNodes) {
      const related = await this.historyRepository.findByEmailId(relatedId);
      if (related && !related.relatedNodes.includes(ownId)) {
        await this.historyRepository.save({
          ...related,
          relatedNodes: [...related.relatedNodes, ownId],
        });
      }
    }
  }

  // Actualiza la clasificación del nodo que ya está cacheado en memoria.
  private patchCachedClassification(emailId: number, classification: EmailClassification): void {
    const cached = this.cache.get(emailId);
    if (!cached) return;

    this.cache.set(emailId, cached.then((context) => ({
      ...context,
      current: {
        ...context.current,
        keyValues: {
          ...context.current.keyValues,
          categorizacion: classification,
        },
      },
    })));
  }

  // Recorrido en anchura (BFS) desde el nodo actual: visita los correos
  // relacionados nivel por nivel, hasta maxDepth niveles o maxNodes resultados.
  private async collectRelated(
    node: EmailHistoryNode,
    maxNodes: number = RELATED_NODES_LIMIT,
    maxDepth: number = RELATED_DEPTH_LIMIT,
  ): Promise<EmailHistoryNode[]> {
    const result: EmailHistoryNode[] = [];
    const visited = new Set<number>([node.emailId]);
    let currentLevel = [node.emailId];

    for (let depth = 0; depth < maxDepth && result.length < maxNodes; depth += 1) {
      const nextLevel: number[] = [];

      for (const emailId of currentLevel) {
        // El nodo raíz ya está en memoria; el resto se carga del repositorio.
        const currentNode = emailId === node.emailId
          ? node
          : await this.historyRepository.findByEmailId(emailId);
        if (!currentNode) continue;

        for (const relatedId of currentNode.relatedNodes) {
          if (visited.has(relatedId) || result.length >= maxNodes) continue;
          visited.add(relatedId);

          const related = await this.historyRepository.findByEmailId(relatedId);
          if (!related) continue;

          result.push(related);
          nextLevel.push(relatedId);
        }
      }

      currentLevel = nextLevel;
    }

    return result;
  }
}
