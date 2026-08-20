import { DraftRequest } from "./DraftRequest";
import type { GeneratedDraft } from "./GeneratedDraft";

export interface DraftGenerator {
  generate(request: DraftRequest): Promise<GeneratedDraft>;
}