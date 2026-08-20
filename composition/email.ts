import { GenerateDraftForEmail } from "@/application/email/generate-draft/GenerateDraftForEmail";
import { GeminiDraftGenerator } from "@/infrastructure/ai/gemini/GeminiDraftGenerator";
import { JsonEmailRepositoryAdapter } from "../infrastructure/data-acces/json/JsonEmailRepositoryAdapter";

const emailRepository = new JsonEmailRepositoryAdapter();
const draftGenerator = new GeminiDraftGenerator();

export const generateDraftForEmail =
  new GenerateDraftForEmail(
    emailRepository,
    draftGenerator
  );