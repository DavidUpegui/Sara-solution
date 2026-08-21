import { classifyEmails, emailRepository } from "@/composition/email";

export async function GET() {
  try {
    const emails = await emailRepository.findAll();
    const classifiedEmails = await classifyEmails.execute(emails);

    return Response.json({ emails: classifiedEmails });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[GET /api/emails] Classification failed:", message);

    return Response.json(
      { error: "No fue posible clasificar los correos." },
      { status: 500 },
    );
  }
}