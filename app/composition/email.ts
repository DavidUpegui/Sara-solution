import { GenerateDraftForEmail } from "@/app/application/email/generate-draft/GenerateDraftForEmail";
import { GeminiDraftGenerator } from "@/app/infrastructure/ai/gemini/GeminiDraftGenerator";
import { JsonEmailRepositoryAdapter } from "../infrastructure/data-acces/json/JsonEmailRepositoryAdapter";

const emailRepository = new JsonEmailRepositoryAdapter();
const draftGenerator = new GeminiDraftGenerator();

export const generateDraftForEmail =
  new GenerateDraftForEmail(
    emailRepository,
    draftGenerator
  );