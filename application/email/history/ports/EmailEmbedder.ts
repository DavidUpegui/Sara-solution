export interface EmailEmbedder {
  embed(text: string): Promise<number[]>;
}
