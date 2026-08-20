import { GenerateDraft } from "../application/email/generate-draft/GenerateDraft";
import { GeminiDraftGenerator } from "../infrastructure/ai/gemini/GeminiDraftGenerator";

const draftGenerator = new GeminiDraftGenerator();

export const generateDraft = new GenerateDraft(
  draftGenerator
);