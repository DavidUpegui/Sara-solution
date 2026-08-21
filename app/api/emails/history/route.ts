import { resetEmailHistory } from "@/composition/email";

export async function DELETE() {
  try {
    await resetEmailHistory.execute();
    return new Response(null, { status: 204 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[DELETE /api/emails/history] Reset failed:", message);
    return Response.json(
      { message: "No fue posible borrar el historial." },
      { status: 500 },
    );
  }
}
