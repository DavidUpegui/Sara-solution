import { DraftGenerator } from "@/application/email/generate-draft/DraftGenerator";
import { DraftRequest } from "@/application/email/generate-draft/DraftRequest";
import type { GeneratedDraft } from "@/application/email/generate-draft/GeneratedDraft";
import { GoogleGenAI } from "@google/genai";

import { promises as fs } from "node:fs";
import path from "node:path";

export class GeminiDraftGenerator implements DraftGenerator {
  private readonly ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });
  }

  async generate(request: DraftRequest): Promise<GeneratedDraft> {

    const promptPath = path.join(
        process.cwd(),
        "infrastructure",
        "ai",
        "prompts",
        "draft-system-prompt.md"
        );

    const systemPrompt = await fs.readFile(
      promptPath,
      "utf-8"
    );

    const response = await this.ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: `
        CORREO RECIBIDO

        Remitente: ${request.sender}
        Dirección: ${request.email}
        Fecha: ${request.date}
        Asunto: ${request.subject}

        Cuerpo:
        ${request.body}
      `,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
      },
    });

    const responseText = response.text;

    if (!responseText) {
      throw new Error("Gemini returned an empty response");
    }

    try {
      return JSON.parse(responseText) as GeneratedDraft;
    } catch {
      throw new Error("Gemini returned an invalid draft JSON response");
    }
  }
}