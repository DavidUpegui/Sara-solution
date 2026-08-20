import { Email } from "@/domain/models/Email";

export interface EmailRepository {
  findById(id: number): Promise<Email | null>;
}