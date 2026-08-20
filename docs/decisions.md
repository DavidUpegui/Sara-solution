# Architecture And Product Decisions

## Accepted decisions

### D-001 - Human-in-the-loop workflow

- Status: accepted
- Date: 2026-08-20
- Decision: The AI generates proposals; Sara makes the final decision. The system must not send automatically.
- Reason: This is the fundamental product rule and protects communications involving money, dates, and contracts.

### D-002 - Fixture-backed MVP

- Status: accepted
- Date: 2026-08-20
- Decision: Use the 25 fictional emails in `public/correos-ejemplo.json` for the MVP.
- Reason: Gmail integration is not required by the challenge and would add scope without improving the core demonstration.

### D-003 - Simple layered architecture

- Status: accepted
- Date: 2026-08-20
- Decision: Keep domain, application, composition, infrastructure, API, and UI responsibilities separated.
- Reason: The project values understandable, maintainable code over unnecessary technology.

### D-004 - Structured AI output

- Status: accepted
- Date: 2026-08-20
- Decision: AI output must be parsed and represented as typed structured data, not passed through as an opaque string.
- Reason: Classification, extraction, approval, reason, and draft content need reliable UI and validation.

## Pending decisions

### D-P001 - Category vocabulary

- Owner: `[complete]`
- Status: pending
- Question: What exact category values and labels should F1 use?

### D-P002 - Urgency vocabulary

- Owner: `[complete]`
- Status: pending
- Question: Which finite urgency values and thresholds should be used?

### D-P003 - Approval and rejection persistence

- Owner: `[complete]`
- Status: pending
- Question: Should approval/rejection be persisted, and what audit information is required?

### D-P004 - Sending behavior

- Owner: `[complete]`
- Status: pending
- Question: Will a later version send email, through which provider, and only after what approval checks?

### D-P005 - Production data and identity

- Owner: `[complete]`
- Status: pending
- Question: What is the real mailbox source, authentication provider, and authorization model?

### D-P006 - AI provider and data policy

- Owner: `[complete]`
- Status: pending
- Question: Which model/provider is approved, and what email data may leave Aurora systems?
