import { ClassifyEmails } from "@/application/email/classify-email/ClassifyEmails";
import { GenerateDraftForEmail } from "@/application/email/generate-draft/GenerateDraftForEmail";
import { GeminiEmailClassifier } from "@/infrastructure/ai/gemini/GeminiEmailClassifier";
import { GeminiDraftGenerator } from "@/infrastructure/ai/gemini/GeminiDraftGenerator";
import { JsonEmailRepositoryAdapter } from "../infrastructure/data-acces/json/JsonEmailRepositoryAdapter";

const emailRepository = new JsonEmailRepositoryAdapter();
const draftGenerator = new GeminiDraftGenerator();
const emailClassifier = new GeminiEmailClassifier();

export const generateDraftForEmail =
  new GenerateDraftForEmail(
    emailRepository,
    draftGenerator
  );

export const classifyEmails = new ClassifyEmails(emailClassifier);

export { emailRepository };