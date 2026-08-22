import type { Email } from "@/domain/models/Email";
import type { EmailContext } from "../../history/dto/EmailContext";

export interface ClassifyEmailRequest {
  email: Email;
  context?: EmailContext;
}