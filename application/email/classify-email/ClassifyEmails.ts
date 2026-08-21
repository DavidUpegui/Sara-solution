import type { Email } from "@/domain/models/Email";
import type { EmailClassification } from "@/domain/models/EmailClassification";
import type { EmailClassifier } from "./EmailClassifier";

export class ClassifyEmails {
  private readonly cachedClassifications = new Map<
    number,
    Promise<EmailClassification>
  >();

  constructor(
    private readonly emailClassifier: EmailClassifier,
    private readonly maxConcurrentClassifications = 3,
  ) {}

  private classifyWithCache(email: Email): Promise<EmailClassification> {
    const cachedClassification = this.cachedClassifications.get(email.id);

    if (cachedClassification) return cachedClassification;

    const classification = this.emailClassifier
      .classify({ email })
      .catch((error: unknown) => {
        this.cachedClassifications.delete(email.id);
        throw error;
      });

    this.cachedClassifications.set(email.id, classification);
    return classification;
  }

  async execute(emails: Email[]): Promise<Array<Email & { classification: EmailClassification }>> {
    const classifications = new Array<EmailClassification>(emails.length);
    let nextEmailIndex = 0;

    const classifyNextEmail = async () => {
      while (nextEmailIndex < emails.length) {
        const emailIndex = nextEmailIndex++;
        classifications[emailIndex] = await this.classifyWithCache(emails[emailIndex]);
      }
    };

    const workerCount = Math.min(
      this.maxConcurrentClassifications,
      emails.length,
    );

    await Promise.all(
      Array.from({ length: workerCount }, () => classifyNextEmail()),
    );

    return emails.map((email, index) => ({
      ...email,
      classification: classifications[index],
    }));
  }
}