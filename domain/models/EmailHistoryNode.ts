export type HistoryKeyValues = Record<string, unknown>;

export interface EmailHistoryNode {
  emailId: number;
  fechas: string[];
  relatedNodes: number[];
  keyValues: HistoryKeyValues;
  context: string;
  embedding?: number[];
}