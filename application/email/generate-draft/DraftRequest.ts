import type { EmailContext } from "../history/EmailContext";

export interface DraftRequest {
  sender: string;
  subject: string;
  body: string;
  date: string;
  email: string;
  context?: EmailContext;
}