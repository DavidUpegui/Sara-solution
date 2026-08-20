import { DraftGenerator } from "./DraftGenerator";
import { DraftRequest } from "./DraftRequest";

export class GenerateDraft {
  constructor(
    private readonly draftGenerator: DraftGenerator
  ) {}

  execute(request: DraftRequest): Promise<string> {
    return this.draftGenerator.generate(request);
  }
}