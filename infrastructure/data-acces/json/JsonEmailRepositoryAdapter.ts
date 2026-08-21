import { promises as fs } from "node:fs";
import path from "node:path";

import { Email } from "@/domain/models/Email";
import { EmailRepository } from "@/application/email/get-email/EmailRepository";

interface EmailJsonData {
  empresa: {
    nombre: string;
    ciudad: string;
    que_hace: string;
    quien_lee_el_correo: string;
    tono_de_las_respuestas: string;
    reglas_del_negocio: string[];
  };
  correos: Email[];
}

export class JsonEmailRepositoryAdapter implements EmailRepository {
  private async readEmails(): Promise<Email[]> {
    const filePath = path.join(
      process.cwd(),
      "public",
      "correos-ejemplo.json"
    );

    const file = await fs.readFile(filePath, "utf-8");
    const data: EmailJsonData = JSON.parse(file);

    return data.correos;
  }

  async findAll(): Promise<Email[]> {
    return this.readEmails();
  }

  async findById(id: number): Promise<Email | null> {
    const emails = await this.readEmails();

    return emails.find((email) => email.id === id) ?? null;
  }
}