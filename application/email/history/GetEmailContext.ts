import type { Email } from "@/domain/models/Email";
import type { EmailHistoryNode } from "@/domain/models/EmailHistoryNode";
import type { EmailContext } from "./EmailContext";
import type { EmailContextGenerator } from "./EmailContextGenerator";
import type { EmailHistoryRepository } from "./EmailHistoryRepository";
import type { EmailClassification } from "@/domain/models/EmailClassification";

const stopWords = new Set([
  "para", "como", "desde", "sobre", "entre", "este", "esta", "correo",
  "buenos", "buenas", "dias", "días", "usted", "solicitud", "gracias",
]);

function extractTerms(email: Email): string[] {
  const text = `${email.de} ${email.nombre} ${email.asunto} ${email.cuerpo}`
    .toLocaleLowerCase("es")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  return [...new Set(text.match(/[a-z0-9][a-z0-9@._-]{3,}/g) ?? [])]
    .filter((term) => !stopWords.has(term))
    .slice(0, 30);
}

export class GetEmailContext {
  private readonly cache = new Map<number, Promise<EmailContext>>();

  constructor(
    private readonly historyRepository: EmailHistoryRepository,
    private readonly contextGenerator: EmailContextGenerator,
    private readonly candidateLimit = 8,
  ) {}

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

  async saveClassificationIfMissing(
    emailId: number,
    classification: EmailClassification,
  ): Promise<void> {
    await this.historyRepository.saveClassificationIfMissing(emailId, classification);

    const cached = this.cache.get(emailId);
    if (cached) {
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
  }

  private async build(email: Email): Promise<EmailContext> {
    const existing = await this.historyRepository.findByEmailId(email.id);
    if (existing) {
      return {
        current: existing,
        related: await this.collectRelated(existing, 5, 2),
      };
    }

    const terms = extractTerms(email);
    const candidates = await this.historyRepository.searchByTerms(terms, this.candidateLimit);
    const generated = await this.contextGenerator.generate(email, candidates);
    const relatedIds = [...new Set(generated.relatedNodes)]
      .filter((id) => id !== email.id && candidates.some((candidate) => candidate.emailId === id));
    const node: EmailHistoryNode = {
      ...generated,
      emailId: email.id,
      fechas: generated.fechas.length > 0 ? generated.fechas : [email.fecha],
      relatedNodes: relatedIds,
      keyValues: generated.keyValues ?? {},
      context: generated.context.trim(),
    };

    await this.historyRepository.save(node);

    for (const relatedId of relatedIds) {
      const related = await this.historyRepository.findByEmailId(relatedId);
      if (related && !related.relatedNodes.includes(email.id)) {
        await this.historyRepository.save({
          ...related,
          relatedNodes: [...related.relatedNodes, email.id],
        });
      }
    }

    const related = await this.collectRelated(node, 5, 2);
    return { current: node, related };
  }

  private async collectRelated(
    node: EmailHistoryNode,
    maxNodes: number,
    maxDepth: number,
  ): Promise<EmailHistoryNode[]> {
    const result: EmailHistoryNode[] = [];
    const visited = new Set<number>([node.emailId]);
    let frontier = [node.emailId];

    for (let depth = 0; depth < maxDepth && result.length < maxNodes; depth += 1) {
      const nextFrontier: number[] = [];
      for (const emailId of frontier) {
        const current = emailId === node.emailId
          ? node
          : await this.historyRepository.findByEmailId(emailId);
        if (!current) continue;

        for (const relatedId of current.relatedNodes) {
          if (visited.has(relatedId) || result.length >= maxNodes) continue;
          visited.add(relatedId);
          const related = await this.historyRepository.findByEmailId(relatedId);
          if (!related) continue;
          result.push(related);
          nextFrontier.push(relatedId);
        }
      }
      frontier = nextFrontier;
    }

    return result;
  }
}
