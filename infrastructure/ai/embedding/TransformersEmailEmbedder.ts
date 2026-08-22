import { pipeline } from "@huggingface/transformers";
import type { EmailEmbedder } from "@/application/email/history/ports/EmailEmbedder";

const MODEL_ID = "Xenova/paraphrase-multilingual-MiniLM-L12-v2";

type Extractor = (
  text: string,
  options: { pooling: string; normalize: boolean },
) => Promise<{ data: ArrayLike<number> }>;

export class TransformersEmailEmbedder implements EmailEmbedder {
  private _loading: Promise<Extractor> | null = null;

  private get extractor(): Promise<Extractor> {
    this._loading ??= pipeline("feature-extraction", MODEL_ID) as unknown as Promise<Extractor>;
    return this._loading;
  }

  async embed(text: string): Promise<number[]> {
    const extractor = await this.extractor;
    const output = await extractor(text, { pooling: "mean", normalize: true });
    return Array.from(output.data);
  }
}
