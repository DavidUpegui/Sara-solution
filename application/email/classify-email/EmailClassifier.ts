import type { EmailClassification } from "@/domain/models/EmailClassification";
import type { ClassifyEmailRequest } from "./ClassifyEmailRequest";

export interface EmailClassifier {
  classify(request: ClassifyEmailRequest): Promise<EmailClassification>;
}