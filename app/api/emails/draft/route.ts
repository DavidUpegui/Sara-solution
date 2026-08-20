import { generateDraft } from "../../../composition/email";

export async function POST(request: Request) {
  const body = await request.json();

  const draft = await generateDraft.execute({
    sender: body.sender,
    subject: body.subject,
    body: body.body,
  });

  return Response.json({
    draft,
  });
}