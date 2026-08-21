import type { Email } from "@/domain/models/Email";
import type { EmailHistoryNode } from "@/domain/models/EmailHistoryNode";

export interface EmailContextGenerator {
  generate(
    email: Email,
    candidates: EmailHistoryNode[],
  ): Promise<EmailHistoryNode>;
}
