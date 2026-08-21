import type { Email } from "@/domain/models/Email";
import type { EmailContext } from "../history/EmailContext";

export interface ClassifyEmailRequest {
  email: Email;
  context?: EmailContext;
}