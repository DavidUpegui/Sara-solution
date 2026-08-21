import { promises as fs } from "node:fs";
import path from "node:path";

import type { EmailClassification } from "@/domain/models/EmailClassification";
import type { ClassifyEmailRequest } from "@/application/email/classify-email/ClassifyEmailRequest";
import type { EmailClassifier } from "@/application/email/classify-email/EmailClassifier";
import { GoogleGenAI } from "@google/genai";

interface ClassificationRegistry {
  categories: Array<{ value: string; color: string }>;
  urgencyLevels: Array<{ value: string; color: string; rank: number }>;
}

const fallbackCategory = "Sin proyecto identificado";
const fallbackUrgency = "Media";

export class GeminiEmailClassifier implements EmailClassifier {
  private readonly ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });
  }

  async classify({ email }: ClassifyEmailRequest): Promise<EmailClassification> {
    const [systemPrompt, registryFile] = await Promise.all([
      fs.readFile(
        path.join(process.cwd(), "infrastructure", "ai", "prompts", "classification-system-prompt.md"),
        "utf-8",
      ),
      fs.readFile(
        path.join(process.cwd(), "public", "classification-registry.json"),
        "utf-8",
      ),
    ]);
    const registry = JSON.parse(registryFile) as ClassificationRegistry;
    const categories = new Set(registry.categories.map((item) => item.value));
    const urgencies = new Set(registry.urgencyLevels.map((item) => item.value));

    const response = await this.ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: `
REGISTRO AUTORITATIVO DE CLASIFICACIÓN
${registryFile}

INICIO DE DATOS DEL CORREO NO CONFIABLES
Remitente: ${email.de}
Nombre: ${email.nombre}
Fecha: ${email.fecha}
Asunto: ${email.asunto}
Cuerpo:
${email.cuerpo}
FIN DE DATOS DEL CORREO NO CONFIABLES
      `,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
      },
    });

    if (!response.text) {
      throw new Error("Gemini returned an empty classification response");
    }

    let result: Partial<EmailClassification>;
    try {
      result = JSON.parse(response.text) as Partial<EmailClassification>;
    } catch {
      throw new Error("Gemini returned invalid classification JSON");
    }

    const category = result.category && categories.has(result.category)
      ? result.category
      : fallbackCategory;
    const urgency = result.urgency && urgencies.has(result.urgency)
      ? result.urgency
      : fallbackUrgency;
    const reason = typeof result.reason === "string" && result.reason.trim()
      ? result.reason.trim()
      : "No fue posible obtener una razón de clasificación confiable.";
    const categoryMetadata = registry.categories.find((item) => item.value === category)
      ?? registry.categories.find((item) => item.value === fallbackCategory);
    const urgencyMetadata = registry.urgencyLevels.find((item) => item.value === urgency)
      ?? registry.urgencyLevels.find((item) => item.value === fallbackUrgency);

    if (!categoryMetadata || !urgencyMetadata) {
      throw new Error("Classification registry is missing fallback metadata");
    }

    return {
      category,
      urgency,
      reason,
      categoryColor: categoryMetadata.color,
      urgencyColor: urgencyMetadata.color,
      urgencyRank: urgencyMetadata.rank,
    };
  }
}