import { EmailRepository } from "../get-email/EmailRepository";
import { DraftGenerator } from "./DraftGenerator";
import { GetEmailContext } from "../history/GetEmailContext";

export class GenerateDraftForEmail {
  constructor(
    private readonly emailRepository: EmailRepository,
    private readonly draftGenerator: DraftGenerator,
    private readonly getEmailContext: GetEmailContext,
  ) {}

  async execute(emailId: number) {
    const email = await this.emailRepository.findById(emailId);

    if (!email) {
      throw new Error(`Email with id ${emailId} not found`);
    }

    const draft = await this.draftGenerator.generate({
      sender: email.de,
      subject: email.asunto,
      body: email.cuerpo,
      date: email.fecha,
      email: email.de,
      context: await this.getEmailContext.get(email),
    });

    return draft;
  }
}