import { classifyEmails, emailRepository } from "@/composition/email";

export async function GET() {
  const encoder = new TextEncoder();
  const emails = (await emailRepository.findAll()).sort(
    (left, right) => new Date(left.fecha).getTime() - new Date(right.fecha).getTime(),
  );

  const stream = new ReadableStream({
    async start(controller) {
      const write = (event: unknown) => {
        controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
      };
      let processed = 0;

      write({ type: "progress", processed: 0, total: emails.length });

      try {
        for await (const email of classifyEmails.executeSequential(emails)) {
          processed += 1;
          write({ type: "email", email, processed, total: emails.length });
          write({ type: "progress", processed, total: emails.length });
        }
        write({ type: "complete", processed: emails.length, total: emails.length });
        controller.close();
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("[GET /api/emails] Classification failed:", message);
        write({ type: "error", message: "No fue posible clasificar todos los correos.", processed, total: emails.length });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Cache-Control": "no-cache, no-transform",
      "Content-Type": "application/x-ndjson; charset=utf-8",
    },
  });
}