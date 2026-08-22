import { DraftRequest } from "../dto/DraftRequest";
import type { GeneratedDraft } from "../dto/GeneratedDraft";

export interface DraftGenerator {
  generate(request: DraftRequest): Promise<GeneratedDraft>;
}