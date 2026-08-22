export interface EmailClassification {
  category: string;
  urgency: string;
  reason: string;
  categoryColor: string;
  urgencyColor: string;
  urgencyRank: number;
  risk: string;
  riskColor: string;
  riskRank: number;
  relevance: string;
  relevanceColor: string;
  relevanceRank: number;
}

export interface ClassifiedEmail {
  id: number;
  de: string;
  nombre: string;
  fecha: string;
  asunto: string;
  cuerpo: string;
  classification: EmailClassification;
}