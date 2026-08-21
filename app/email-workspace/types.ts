import type { ClassifiedEmail } from "@/domain/models/EmailClassification";

export type EmailData = { emails: ClassifiedEmail[] };
export type ClassifiedEmailItem = ClassifiedEmail;
export type DraftStatus = "idle" | "loading" | "ready" | "error";

export type DraftResponse = {
	draft: string;
	requiresApproval: boolean;
	reason: string;
};