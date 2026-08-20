import { Email } from "@/app/domain/models/Email";

export interface EmailRepository {
  findById(id: number): Promise<Email | null>;
}