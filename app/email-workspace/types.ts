import type { Email } from "@/domain/models/Email";

export type EmailData = { correos: Email[] };
export type DraftStatus = "idle" | "loading" | "ready" | "error";

export type DraftResponse = {
	draft: string;
	requiresApproval: boolean;
	reason: string;
};