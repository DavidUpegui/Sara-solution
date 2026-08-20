import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function POST() {
  const response = await ai.interactions.create({
    model: "gemini-3.6-flash",
    input: "Explícame qué es inteligencia artificial en una sola frase.",
  });

  return Response.json({
    response: response.output_text,
  });
}