import { promises as fs } from "node:fs";
import path from "node:path";
import type { EmailHistoryNode } from "@/domain/models/EmailHistoryNode";
import type { EmailHistoryRepository } from "@/application/email/history/ports/EmailHistoryRepository";
import type { EmailClassification } from "@/domain/models/EmailClassification";

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export class JsonEmailHistoryRepositoryAdapter implements EmailHistoryRepository {
  private readonly filePath = path.join(process.cwd(), "data", "email-history.json");
  private readonly temporaryFilePath = `${this.filePath}.tmp`;
  private writeQueue: Promise<void> = Promise.resolve();

  private async readNodesFromDisk(): Promise<EmailHistoryNode[]> {
    try {
      const file = await fs.readFile(this.filePath, "utf-8");
      const data = JSON.parse(file) as unknown;
      return Array.isArray(data) ? data as EmailHistoryNode[] : [];
    } catch (error: unknown) {
      if (error instanceof Error && "code" in error && error.code === "ENOENT") return [];
      throw error;
    }
  }

  private async readNodes(): Promise<EmailHistoryNode[]> {
    await this.writeQueue;
    return this.readNodesFromDisk();
  }

  async findByEmailId(emailId: number): Promise<EmailHistoryNode | null> {
    const nodes = await this.readNodes();
    return nodes.find((node) => node.emailId === emailId) ?? null;
  }

  async searchSimilar(embedding: number[], limit: number): Promise<EmailHistoryNode[]> {
    const nodes = await this.readNodes();
    return nodes
      .filter((node) => Array.isArray(node.embedding))
      .map((node) => ({ node, score: cosineSimilarity(embedding, node.embedding as number[]) }))
      .sort((left, right) => right.score - left.score)
      .slice(0, limit)
      .map(({ node }) => node);
  }

  async save(node: EmailHistoryNode): Promise<void> {
    this.writeQueue = this.writeQueue.then(async () => {
      const nodes = await this.readNodesFromDisk();
      const nextNodes = nodes.filter((item) => item.emailId !== node.emailId);
      nextNodes.push(node);
      await fs.writeFile(this.temporaryFilePath, `${JSON.stringify(nextNodes, null, 2)}\n`, "utf-8");
      await fs.rename(this.temporaryFilePath, this.filePath);
    });
    return this.writeQueue;
  }

  async clear(): Promise<void> {
    this.writeQueue = this.writeQueue.then(async () => {
      await fs.writeFile(this.temporaryFilePath, "[]\n", "utf-8");
      await fs.rename(this.temporaryFilePath, this.filePath);
    });
    return this.writeQueue;
  }

  async saveClassificationIfMissing(
    emailId: number,
    classification: EmailClassification,
  ): Promise<void> {
    this.writeQueue = this.writeQueue.then(async () => {
      const nodes = await this.readNodesFromDisk();
      const node = nodes.find((item) => item.emailId === emailId);
      if (!node) return;

      const keyValues = node.keyValues ?? {};
      const existing = keyValues.categorizacion as Partial<EmailClassification> | undefined;
      if (existing && typeof existing.risk === "string" && typeof existing.relevance === "string") return;

      const nextNodes = nodes.map((item) => item.emailId === emailId
        ? {
            ...item,
            keyValues: {
              ...keyValues,
              categorizacion: classification,
            },
          }
        : item);
      await fs.writeFile(this.temporaryFilePath, `${JSON.stringify(nextNodes, null, 2)}\n`, "utf-8");
      await fs.rename(this.temporaryFilePath, this.filePath);
    });
    return this.writeQueue;
  }
}
