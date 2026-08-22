import type { EmailEmbedder } from "@/application/email/history/ports/EmailEmbedder";

const MODEL_ID = "Xenova/paraphrase-multilingual-MiniLM-L12-v2";

type Extractor = (
  text: string,
  options: { pooling: string; normalize: boolean },
) => Promise<{ data: ArrayLike<number> }>;

export class TransformersEmailEmbedder implements EmailEmbedder {
  private _loading: Promise<Extractor> | null = null;

  private get extractor(): Promise<Extractor> {
    this._loading ??= loadExtractor();
    return this._loading;
  }

  async embed(text: string): Promise<number[]> {
    const extractor = await this.extractor;
    const output = await extractor(text, { pooling: "mean", normalize: true });
    return Array.from(output.data);
  }
}

// Importación dinámica: evita cargar onnxruntime-node (nativo) durante el build
// y lo hace solo cuando realmente se embebe un correo.
async function loadExtractor(): Promise<Extractor> {
  const { pipeline } = await import("@huggingface/transformers");
  return pipeline("feature-extraction", MODEL_ID) as unknown as Promise<Extractor>;
}
