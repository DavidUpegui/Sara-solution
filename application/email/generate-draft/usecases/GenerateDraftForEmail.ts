import { EmailRepository } from "../../get-email/EmailRepository";
import { DraftGenerator } from "../ports/DraftGenerator";
import { GetEmailContext } from "../../history/usecases/GetEmailContext";
import type { EmailClassification } from "@/domain/models/EmailClassification";

const FRAUD_REASON =
  "Este correo fue marcado como posible fraude. No se recomienda responder ni hacer clic en enlaces.";

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

    const context = await this.getEmailContext.get(email);

    const classification = context.current.keyValues.categorizacion as
      | Partial<EmailClassification>
      | undefined;
    if (classification?.risk === "Fraudulento") {
      return {
        draft: "",
        requiresApproval: false,
        reason: FRAUD_REASON,
        blocked: true,
      };
    }

    const draft = await this.draftGenerator.generate({
      sender: email.de,
      subject: email.asunto,
      body: email.cuerpo,
      date: email.fecha,
      email: email.de,
      context,
    });

    return draft;
  }
}