import { DraftRequest } from "./DraftRequest";

export interface DraftGenerator {
  generate(request: DraftRequest): Promise<string>;
}