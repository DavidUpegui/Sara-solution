import { promises as fs } from "node:fs";
import path from "node:path";
import OpenAI from 'openai';

import type { EmailClassification } from "@/domain/models/EmailClassification";
import type { ClassifyEmailRequest } from "@/application/email/classify-email/ClassifyEmailRequest";
import type { EmailClassifier } from "@/application/email/classify-email/EmailClassifier";

interface ClassificationRegistry {
  categories: Array<{ value: string; color: string }>;
  urgencyLevels: Array<{ value: string; color: string; rank: number }>;
}

const fallbackCategory = "Sin proyecto identificado";
const fallbackUrgency = "Media";

export class DeepSeekEmailClassifier implements EmailClassifier {
  private readonly client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.DEEPSEEK_API_KEY,
      baseURL: 'https://api.deepseek.com/v1',
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

    const userMessage = `
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
    `;

    try {
      const response = await this.client.chat.completions.create({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: userMessage
          }
        ],
        temperature: 0.3, // Temperatura más baja para clasificación precisa
        max_tokens: 1000,
        response_format: { type: "json_object" },
      });

      const responseText = response.choices[0]?.message?.content;

      if (!responseText) {
        throw new Error("DeepSeek returned an empty classification response");
      }

      let result: Partial<EmailClassification>;
      try {
        result = JSON.parse(responseText) as Partial<EmailClassification>;
      } catch {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            result = JSON.parse(jsonMatch[0]) as Partial<EmailClassification>;
          } catch {
            throw new Error("DeepSeek returned invalid classification JSON");
          }
        } else {
          throw new Error("DeepSeek returned invalid classification JSON");
        }
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

    } catch (error) {
      console.error('DeepSeek API Error:', error);
      throw new Error(`Failed to classify email: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}