import type { EmailHistoryNode } from "@/domain/models/EmailHistoryNode";

export interface EmailContext {
  current: EmailHistoryNode;
  related: EmailHistoryNode[];
}
