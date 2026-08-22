import { backfillEmbeddings } from "@/composition/email";

export async function POST() {
  try {
    const updated = await backfillEmbeddings.execute();
    return Response.json({ updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[POST /api/emails/history/backfill] Backfill failed:", message);
    return Response.json(
      { message: "No fue posible generar los embeddings del historial." },
      { status: 500 },
    );
  }
}
