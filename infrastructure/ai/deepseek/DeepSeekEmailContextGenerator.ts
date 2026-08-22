import OpenAI from "openai";
import fs from "fs/promises";
import path from "path";
import type { Email } from "@/domain/models/Email";
import type { EmailHistoryNode } from "@/domain/models/EmailHistoryNode";
import type { EmailContextGenerator } from "@/application/email/history/EmailContextGenerator";

export class DeepSeekEmailContextGenerator implements EmailContextGenerator {
  private _client: OpenAI | null = null;

  private get client(): OpenAI {
    this._client ??= new OpenAI({
      apiKey: process.env.DEEPSEEK_API_KEY,
      baseURL: "https://api.deepseek.com/v1",
    });
    return this._client;
  }

  async generate(email: Email, candidates: EmailHistoryNode[]): Promise<EmailHistoryNode> {
    const systemPrompt = await fs.readFile(
      path.join(process.cwd(), "infrastructure", "ai", "prompts", "history-system-prompt.md"),
      "utf-8",
    );
    const userMessage = `
CORREO ACTUAL NO CONFIABLE
id: ${email.id}
remitente: ${email.de}
nombre: ${email.nombre}
fecha: ${email.fecha}
asunto: ${email.asunto}
cuerpo:
${email.cuerpo}
FIN DEL CORREO ACTUAL

NODOS CANDIDATOS DE HISTORIAL
${JSON.stringify(candidates.map((node) => {
  const payload = { ...node };
  delete payload.embedding;
  return payload;
}))}
FIN DE LOS NODOS CANDIDATOS
`;

    try {
      const response = await this.client.chat.completions.create({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        temperature: 0.2,
        max_tokens: 1600,
        response_format: { type: "json_object" },
      });
      const responseText = response.choices[0]?.message?.content;
      if (!responseText) throw new Error("DeepSeek returned an empty history response");
      const parsed = JSON.parse(responseText) as Partial<EmailHistoryNode>;
      return {
        emailId: email.id,
        fechas: Array.isArray(parsed.fechas) ? parsed.fechas.filter((value): value is string => typeof value === "string") : [email.fecha],
        relatedNodes: Array.isArray(parsed.relatedNodes) ? parsed.relatedNodes.filter((value): value is number => typeof value === "number") : [],
        keyValues: parsed.keyValues && typeof parsed.keyValues === "object" ? parsed.keyValues : {},
        context: typeof parsed.context === "string" ? parsed.context : "No se encontró contexto histórico suficiente.",
      };
    } catch (error) {
      console.error("DeepSeek history context error:", error);
      throw new Error(`Failed to generate email history context: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
}
