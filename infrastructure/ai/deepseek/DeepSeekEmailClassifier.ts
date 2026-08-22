import { promises as fs } from "node:fs";
import path from "node:path";
import OpenAI from 'openai';

import type { EmailClassification } from "@/domain/models/EmailClassification";
import type { ClassifyEmailRequest } from "@/application/email/classify-email/dto/ClassifyEmailRequest";
import type { EmailClassifier } from "@/application/email/classify-email/ports/EmailClassifier";

interface ClassificationRegistry {
  categories: Array<{ value: string; color: string }>;
  urgencyLevels: Array<{ value: string; color: string; rank: number }>;
  riskLevels: Array<{ value: string; color: string; rank: number }>;
  relevanceLevels: Array<{ value: string; color: string; rank: number }>;
}

const fallbackCategory = "Sin proyecto identificado";
const fallbackUrgency = "Media";
const fallbackRisk = "Sospechoso";
const fallbackRelevance = "Relevante";

export class DeepSeekEmailClassifier implements EmailClassifier {
  private _client: OpenAI | null = null;

  private get client(): OpenAI {
    this._client ??= new OpenAI({
      apiKey: process.env.DEEPSEEK_API_KEY,
      baseURL: 'https://api.deepseek.com/v1',
    });
    return this._client;
  }

  async classify({ email, context }: ClassifyEmailRequest): Promise<EmailClassification> {
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
    const risks = new Set(registry.riskLevels.map((item) => item.value));
    const relevances = new Set(registry.relevanceLevels.map((item) => item.value));

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

              CONTEXTO HISTÓRICO DE REFERENCIA
              ${JSON.stringify(context ?? { current: null, related: [] })}
              FIN DEL CONTEXTO HISTÓRICO
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

      const risk = result.risk && risks.has(result.risk)
        ? result.risk
        : fallbackRisk;

      const relevance = result.relevance && relevances.has(result.relevance)
        ? result.relevance
        : fallbackRelevance;

      // Regla determinista de seguridad: un correo fraudulento jamás puede
      // quedar con urgencia baja.
      const finalUrgency = risk === "Fraudulento" ? "Alta" : urgency;

      const reason = typeof result.reason === "string" && result.reason.trim()
        ? result.reason.trim()
        : "No fue posible obtener una razón de clasificación confiable.";

      const categoryMetadata = registry.categories.find((item) => item.value === category)
        ?? registry.categories.find((item) => item.value === fallbackCategory);
      
      const urgencyMetadata = registry.urgencyLevels.find((item) => item.value === finalUrgency)
        ?? registry.urgencyLevels.find((item) => item.value === fallbackUrgency);

      const riskMetadata = registry.riskLevels.find((item) => item.value === risk)
        ?? registry.riskLevels.find((item) => item.value === fallbackRisk);

      const relevanceMetadata = registry.relevanceLevels.find((item) => item.value === relevance)
        ?? registry.relevanceLevels.find((item) => item.value === fallbackRelevance);

      if (!categoryMetadata || !urgencyMetadata || !riskMetadata || !relevanceMetadata) {
        throw new Error("Classification registry is missing fallback metadata");
      }

      return {
        category,
        urgency: finalUrgency,
        reason,
        categoryColor: categoryMetadata.color,
        urgencyColor: urgencyMetadata.color,
        urgencyRank: urgencyMetadata.rank,
        risk,
        riskColor: riskMetadata.color,
        riskRank: riskMetadata.rank,
        relevance,
        relevanceColor: relevanceMetadata.color,
        relevanceRank: relevanceMetadata.rank,
      };

    } catch (error) {
      console.error('DeepSeek API Error:', error);
      throw new Error(`Failed to classify email: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}