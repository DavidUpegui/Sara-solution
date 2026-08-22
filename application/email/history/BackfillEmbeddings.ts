import type { EmailRepository } from "../get-email/EmailRepository";
import type { EmailEmbedder } from "./EmailEmbedder";
import type { EmailHistoryRepository } from "./EmailHistoryRepository";

export class BackfillEmbeddings {
  constructor(
    private readonly emailRepository: EmailRepository,
    private readonly emailEmbedder: EmailEmbedder,
    private readonly historyRepository: EmailHistoryRepository,
  ) {}

  async execute(): Promise<number> {
    const emails = await this.emailRepository.findAll();
    let updated = 0;

    for (const email of emails) {
      const node = await this.historyRepository.findByEmailId(email.id);
      if (!node) continue;

      const embedding = await this.emailEmbedder.embed(
        `${email.asunto}\n${email.cuerpo}`,
      );
      await this.historyRepository.save({ ...node, embedding });
      updated += 1;
    }

    return updated;
  }
}
