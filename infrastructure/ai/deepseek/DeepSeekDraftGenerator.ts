import OpenAI from "openai";
import fs from "fs/promises";
import path from "path";
import type { DraftGenerator } from "@/application/email/generate-draft/DraftGenerator";
import type { DraftRequest } from "@/application/email/generate-draft/DraftRequest";
import type { GeneratedDraft } from "@/application/email/generate-draft/GeneratedDraft";

export class DeepSeekDraftGenerator implements DraftGenerator {
  private readonly client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.DEEPSEEK_API_KEY,
      baseURL: "https://api.deepseek.com/v1", // URL base de DeepSeek
    });
  }

  async generate(request: DraftRequest): Promise<GeneratedDraft> {
    const promptPath = path.join(
      process.cwd(),
      "infrastructure",
      "ai",
      "prompts",
      "draft-system-prompt.md",
    );

    const systemPrompt = await fs.readFile(promptPath, "utf-8");

    const userMessage = `
CORREO RECIBIDO

Remitente: ${request.sender}
Dirección: ${request.email}
Fecha: ${request.date}
Asunto: ${request.subject}

Cuerpo:
${request.body}

CONTEXTO HISTÓRICO DE REFERENCIA
${JSON.stringify(request.context ?? { current: null, related: [] })}
FIN DEL CONTEXTO HISTÓRICO
    `;

    try {
      const response = await this.client.chat.completions.create({
        model: "deepseek-chat", 
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: userMessage,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
        response_format: { type: "json_object" }, 
      });

      const responseText = response.choices[0]?.message?.content;

      if (!responseText) {
        throw new Error("DeepSeek returned an empty response");
      }

      try {
        return JSON.parse(responseText) as GeneratedDraft;
      } catch {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]) as GeneratedDraft;
        }
        throw new Error("DeepSeek returned an invalid draft JSON response");
      }
    } catch (error) {
      console.error("DeepSeek API Error:", error);
      throw new Error(
        `Failed to generate draft: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }
}
