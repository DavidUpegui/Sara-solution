import { ClassifyEmails } from "@/application/email/classify-email/ClassifyEmails";
import { GenerateDraftForEmail } from "@/application/email/generate-draft/GenerateDraftForEmail";
import { JsonEmailRepositoryAdapter } from "../infrastructure/data-acces/json/JsonEmailRepositoryAdapter";
import { DeepSeekEmailClassifier } from "@/infrastructure/ai/deepseek/DeepSeekEmailClassifier";
import { DeepSeekDraftGenerator } from "@/infrastructure/ai/deepseek/DeepSeekDraftGenerator";

const emailRepository = new JsonEmailRepositoryAdapter();
const draftGenerator = new DeepSeekDraftGenerator();
const emailClassifier = new DeepSeekEmailClassifier();

export const generateDraftForEmail =
  new GenerateDraftForEmail(
    emailRepository,
    draftGenerator
  );

export const classifyEmails = new ClassifyEmails(emailClassifier);

export { emailRepository };