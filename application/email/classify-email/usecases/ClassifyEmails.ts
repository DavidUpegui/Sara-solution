import type { Email } from "@/domain/models/Email";
import type { EmailClassification } from "@/domain/models/EmailClassification";
import type { EmailClassifier } from "../ports/EmailClassifier";
import type { GetEmailContext } from "../../history/usecases/GetEmailContext";

function readPersistedClassification(
  value: unknown,
): EmailClassification | null {
  if (!value || typeof value !== "object") return null;

  const candidate = value as Partial<EmailClassification>;
  if (
    typeof candidate.category !== "string" ||
    typeof candidate.urgency !== "string" ||
    typeof candidate.reason !== "string" ||
    typeof candidate.categoryColor !== "string" ||
    typeof candidate.urgencyColor !== "string" ||
    typeof candidate.urgencyRank !== "number" ||
    typeof candidate.risk !== "string" ||
    typeof candidate.riskColor !== "string" ||
    typeof candidate.riskRank !== "number" ||
    typeof candidate.relevance !== "string" ||
    typeof candidate.relevanceColor !== "string" ||
    typeof candidate.relevanceRank !== "number"
  ) {
    return null;
  }

  return candidate as EmailClassification;
}

export class ClassifyEmails {
  private readonly cachedClassifications = new Map<
    number,
    Promise<EmailClassification>
  >();

  constructor(
    private readonly emailClassifier: EmailClassifier,
    private readonly getEmailContext: GetEmailContext,
    private readonly maxConcurrentClassifications = 3,
  ) {}

  clearCache(): void {
    this.cachedClassifications.clear();
  }

  private classifyWithCache(email: Email): Promise<EmailClassification> {
    const cachedClassification = this.cachedClassifications.get(email.id);

    if (cachedClassification) return cachedClassification;

    const classification = Promise.resolve()
      .then(async () => {
        const context = await this.getEmailContext.get(email);
        const persisted = readPersistedClassification(
          context.current.keyValues.categorizacion,
        );
        if (persisted) return persisted;

        const generated = await this.emailClassifier.classify({
          email,
          context,
        });
        await this.getEmailContext.saveClassificationIfMissing(email.id, generated);
        return generated;
      })
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

  async *executeSequential(
    emails: Email[],
  ): AsyncGenerator<Email & { classification: EmailClassification }> {
    const orderedEmails = [...emails].sort(
      (left, right) => new Date(left.fecha).getTime() - new Date(right.fecha).getTime(),
    );

    for (const email of orderedEmails) {
      yield {
        ...email,
        classification: await this.classifyWithCache(email),
      };
    }
  }
}