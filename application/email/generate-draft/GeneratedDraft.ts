export interface GeneratedDraft {
  draft: string;
  requiresApproval: boolean;
  reason: string;
  blocked?: boolean;
}