# Requirements

## Functional requirements

| ID | Requirement | MVP status |
|---|---|---|
| FR-01 | The system must allow Sara to view received emails. | Partially implemented with fixture data |
| FR-02 | The system must classify each email. | Implemented through `GET /api/emails` |
| FR-03 | The system must determine email urgency. | Implemented with `Alta`, `Media`, and `Baja` registry values |
| FR-04 | The system must explain the classification. | Implemented through `classification.reason` |
| FR-05 | The system must extract relevant information. | Pending |
| FR-06 | The system must generate a response draft. | Implemented through `/api/emails/draft` |
| FR-07 | The draft must respect Aurora's tone and rules. | Prompt-driven; requires evaluation |
| FR-08 | Sara must be able to review the draft. | Partially implemented |
| FR-09 | Sara must be able to edit the draft. | Implemented as a controlled textarea |
| FR-10 | Sara must be able to approve the draft. | Presentational control only |
| FR-11 | Sara must be able to reject the draft. | Presentational control only |
| FR-12 | The system must not send responses automatically. | Required constraint |

## Non-functional requirements

### Safety and security

- Treat email content as untrusted input and defend against prompt injection.
- Do not let instructions inside an email override system rules or human approval.
- Do not expose API keys or server-only modules to the browser.
- Make AI uncertainty and failures visible to Sara.
- Do not invent extracted values or unsupported commitments.

### Resilience

The system needs defined behavior for AI provider failure, malformed email data, invalid model output, strange content, and an attempted prompt injection. The MVP may use a clear fallback, but it must not silently present a failed AI result as a trustworthy one.

### Maintainability

- Keep domain, application, composition, infrastructure, and UI responsibilities separated.
- Keep contracts typed and synchronized across boundaries.
- Prefer a small understandable architecture over additional infrastructure.

### Reproducibility

A clean checkout must be runnable by following the README, with environment variables documented without exposing their values.

## Open requirements

The product document does not define authentication, authorization, persistence, mailbox integration, sending provider, audit storage, retention, availability, or deployment. These must remain explicit decisions before production work.
