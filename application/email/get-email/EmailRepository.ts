import { Email } from "@/domain/models/Email";

export interface EmailRepository {
  findAll(): Promise<Email[]>;
  findById(id: number): Promise<Email | null>;
}