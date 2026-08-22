import { DraftGenerator } from "../ports/DraftGenerator";
import { DraftRequest } from "../dto/DraftRequest";
import type { GeneratedDraft } from "../dto/GeneratedDraft";

export class GenerateDraft {
  constructor(
    private readonly draftGenerator: DraftGenerator
  ) {}

  execute(request: DraftRequest): Promise<GeneratedDraft> {
    return this.draftGenerator.generate(request);
  }
}