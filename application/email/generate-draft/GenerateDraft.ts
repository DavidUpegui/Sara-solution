import { DraftGenerator } from "./DraftGenerator";
import { DraftRequest } from "./DraftRequest";
import type { GeneratedDraft } from "./GeneratedDraft";

export class GenerateDraft {
  constructor(
    private readonly draftGenerator: DraftGenerator
  ) {}

  execute(request: DraftRequest): Promise<GeneratedDraft> {
    return this.draftGenerator.generate(request);
  }
}