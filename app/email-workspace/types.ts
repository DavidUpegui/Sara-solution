import type { ClassifiedEmail } from "@/domain/models/EmailClassification";

export type EmailData = { emails: ClassifiedEmail[] };
export type EmailClassificationStreamEvent =
	| { type: "progress"; processed: number; total: number }
	| { type: "email"; email: ClassifiedEmail; processed: number; total: number }
	| { type: "complete"; processed: number; total: number }
	| { type: "error"; message: string; processed: number; total: number };
export type ClassifiedEmailItem = ClassifiedEmail;
export type DraftStatus = "idle" | "loading" | "ready" | "error";

export type DraftResponse = {
  draft: string;
  requiresApproval: boolean;
  reason: string;
  blocked?: boolean;
};