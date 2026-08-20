import { promises as fs } from "node:fs";
import path from "node:path";

import { Email } from "@/app/domain/models/Email";
import { EmailRepository } from "../../../application/email/get-email/EmailRepository";

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
  async findById(id: number): Promise<Email | null> {
    const filePath = path.join(process.cwd(), "data", "emails.json");

    const file = await fs.readFile(filePath, "utf-8");

    const data: EmailJsonData = JSON.parse(file);

    return data.correos.find(email => email.id === id) ?? null;
  }
}