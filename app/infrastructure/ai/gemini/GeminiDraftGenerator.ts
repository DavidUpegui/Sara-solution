import { GoogleGenAI } from "@google/genai";
import type { DraftGenerator } from "../../../application/email/generate-draft/DraftGenerator";
import type { DraftRequest } from "../../../application/email/generate-draft/DraftRequest";

export class GeminiDraftGenerator implements DraftGenerator {
  private readonly ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });
  }

  async generate(request: DraftRequest): Promise<string> {
    const response = await this.ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `
        Write a draft response to the following email.

        Sender: ${request.sender}
        Subject: ${request.subject}

        Email body:
        ${request.body}
      `,
    });

    const draft = response.text;

  if (!draft) {
    throw new Error("Gemini returned an empty response");
  }

    return response.text as string;
  }
}