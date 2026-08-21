import type { EmailHistoryRepository } from "./EmailHistoryRepository";
import type { GetEmailContext } from "./GetEmailContext";
import type { ClassifyEmails } from "../classify-email/ClassifyEmails";

export class ResetEmailHistory {
  constructor(
    private readonly historyRepository: EmailHistoryRepository,
    private readonly getEmailContext: GetEmailContext,
    private readonly classifyEmails: ClassifyEmails,
  ) {}

  async execute(): Promise<void> {
    await this.historyRepository.clear();
    this.getEmailContext.clearCache();
    this.classifyEmails.clearCache();
  }
}
