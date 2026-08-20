# Business Context

Status: product context confirmed from the challenge definition on 2026-08-20. Operational and production details that the challenge does not define remain marked as pending.

## Product purpose

- Product name: Aurora AI.
- Purpose: Help Sara analyze, classify, extract information from, and prepare responses to incoming company emails while keeping the final decision with her.
- Problem: Sara receives approximately 110 emails per week and spends about 2.5 hours per day processing them manually. Important or urgent messages may be missed or answered late.
- Product principle: The AI proposes; Sara decides.
- In scope: Analyze emails, classify them, determine urgency, explain classification, extract relevant information, generate drafts, and let Sara review, edit, approve, or reject each proposal.
- Out of scope for the MVP: Gmail integration, OAuth, complex user management, multi-tenancy, billing, microservices, admin dashboards, advanced analytics, fine-tuning, complex RAG, and chatbot behavior.

## Organization and domain

- Legal/company name: Constructora Aurora S.A.S. [Confirmed by the product context; validate against business source before production.]
- Industry: Construction and residential housing development/sales.
- Primary user: Sara, assistant to management.
- Projects/products: The sample context names Torre Aurora, Mirador del Este, and Bosque 47. Treat these as current challenge data unless confirmed as production data.
- Official language: Spanish.
- Response tone: Use “usted”; cordial but direct; avoid unnecessary decoration; confirm date and responsible person when relevant; do not promise unconfirmed accounting figures.
- Customer volume: Approximately 110 incoming emails per week, according to the product definition.

## Actors

### Sara

Sara is the primary human reviewer. She reads the original email, checks the AI classification and extracted information, edits the proposal when needed, and approves or rejects the response.

### AI assistant

The AI analyzes, classifies, extracts, and drafts. It has no authority to send a response automatically. It must be treated as an assistant in a human-reviewed workflow, not as an autonomous agent.

## Email workflow

- MVP source: The 25 fictional emails in `public/correos-ejemplo.json`.
- Real mailbox synchronization: Not required by the challenge and not implemented.
- Required source fields currently available: `id`, `de`, `nombre`, `fecha`, `asunto`, `cuerpo`.
- Intended flow: email received -> AI processing -> inbox -> human review -> approve, edit, or reject.
- Sending provider: Not defined.
- Persistence/history: Not defined for the MVP; currently not implemented.
- Automatic sending: Forbidden.

## Approval rules

- Every AI proposal must remain under human control.
- Information involving money, delivery dates, or contracts must not be sent automatically.
- Approval must be explicit before a response is considered ready to send.
- The exact storage and audit requirements for approval/rejection are pending.

## AI behavior

- Required AI capabilities: classification, urgency, classification reason, information extraction, and draft generation.
- Required classification output: category, urgency, and reason.
- Required extraction output: amount, deadline, project, sender, and request, with nullable/unknown values when information is absent.
- Draft generation context: original email, Aurora communication tone, and confirmed business rules.
- Prompt injection: Email content must be treated as untrusted data, not as instructions that override the system prompt or approval policy.
- Third-party data handling: The policy for sending email content to an AI provider is pending confirmation.
- Provider/model: The current implementation uses `@google/genai`; the production provider and model approval remain pending.

## Pending operational decisions

- Authentication and authorization model.
- Production mailbox or data source.
- Persistence and draft history.
- Actual email sending provider, if sending is added later.
- Approval audit trail.
- Deployment and hosting provider.
- Environment strategy and secret management.
- Logging, observability, retention, rate limits, quotas, availability, and support owner.
- Whether the sample company and project data may be used outside the challenge.
