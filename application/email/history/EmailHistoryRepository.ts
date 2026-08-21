import type { EmailHistoryNode } from "@/domain/models/EmailHistoryNode";
import type { EmailClassification } from "@/domain/models/EmailClassification";

export interface EmailHistoryRepository {
  findByEmailId(emailId: number): Promise<EmailHistoryNode | null>;
  searchByTerms(terms: string[], limit: number): Promise<EmailHistoryNode[]>;
  save(node: EmailHistoryNode): Promise<void>;
  saveClassificationIfMissing(
    emailId: number,
    classification: EmailClassification,
  ): Promise<void>;
}
