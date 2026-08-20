import { EmailRepository } from "../get-email/EmailRepository";
import { DraftGenerator } from "./DraftGenerator";

export class GenerateDraftForEmail {
  constructor(
    private readonly emailRepository: EmailRepository,
    private readonly draftGenerator: DraftGenerator
  ) {}

  async execute(emailId: number): Promise<string> {
    const email = await this.emailRepository.findById(emailId);

    if (!email) {
      throw new Error(`Email with id ${emailId} not found`);
    }

    const draft = await this.draftGenerator.generate({
      sender: email.de,
      subject: email.asunto,
      body: email.cuerpo,
    });

    return draft;
  }
}