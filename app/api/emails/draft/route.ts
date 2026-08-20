import { generateDraftForEmail } from "@/composition/email";

export async function POST(request: Request) {
  const body = await request.json();

  const result = await generateDraftForEmail.execute(body.emailId);

  return Response.json(result);
}
