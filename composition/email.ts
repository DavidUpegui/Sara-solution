import { ClassifyEmails } from "@/application/email/classify-email/ClassifyEmails";
import { GenerateDraftForEmail } from "@/application/email/generate-draft/GenerateDraftForEmail";
import { JsonEmailRepositoryAdapter } from "../infrastructure/data-acces/json/JsonEmailRepositoryAdapter";
import { DeepSeekEmailClassifier } from "@/infrastructure/ai/deepseek/DeepSeekEmailClassifier";
import { DeepSeekDraftGenerator } from "@/infrastructure/ai/deepseek/DeepSeekDraftGenerator";
import { DeepSeekEmailContextGenerator } from "@/infrastructure/ai/deepseek/DeepSeekEmailContextGenerator";
import { JsonEmailHistoryRepositoryAdapter } from "@/infrastructure/data-acces/json/JsonEmailHistoryRepositoryAdapter";
import { GetEmailContext } from "@/application/email/history/GetEmailContext";
import { ResetEmailHistory } from "@/application/email/history/ResetEmailHistory";

const emailRepository = new JsonEmailRepositoryAdapter();
const draftGenerator = new DeepSeekDraftGenerator();
const emailClassifier = new DeepSeekEmailClassifier();
const emailHistoryRepository = new JsonEmailHistoryRepositoryAdapter();
const emailContextGenerator = new DeepSeekEmailContextGenerator();
const getEmailContext = new GetEmailContext(
  emailHistoryRepository,
  emailContextGenerator,
);

export const generateDraftForEmail =
  new GenerateDraftForEmail(
    emailRepository,
    draftGenerator,
    getEmailContext,
  );

export const classifyEmails = new ClassifyEmails(emailClassifier, getEmailContext);

export const resetEmailHistory = new ResetEmailHistory(
  emailHistoryRepository,
  getEmailContext,
  classifyEmails,
);

export { emailRepository };