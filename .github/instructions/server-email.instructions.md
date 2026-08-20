---
name: Server Email Instructions
description: Guidance for changing the email domain, application use cases, API route, composition root, repositories, and Gemini adapter.
applyTo: ["app/api/**/*.ts", "application/**/*.ts", "domain/**/*.ts", "composition/**/*.ts", "infrastructure/**/*.ts"]
---

# Server And Email Instructions

## Dependency direction

- `domain/` contains models and domain-level contracts and must remain framework- and infrastructure-independent.
- `application/` contains use cases and ports/interfaces.
- `composition/` creates concrete implementations and wires the application.
- `infrastructure/` contains adapters for JSON data and Gemini.
- `app/api/` translates HTTP requests and responses; it should not contain repository or model-provider logic.

Prefer changing a port and its implementations together when a contract changes. Search all implementations and consumers before editing a shared interface.

## Draft contract

The draft generator returns:

```ts
interface GeneratedDraft {
  draft: string;
  requiresApproval: boolean;
  reason: string;
}
```

`POST /api/emails/draft` accepts `{ emailId }`, obtains the email through the configured repository, invokes the generator, and returns the structured result. Avoid double-serializing the generated object as a string.

`GeminiDraftGenerator` reads `infrastructure/ai/prompts/draft-system-prompt.md`, requests JSON from Gemini, validates that a response exists, and parses the JSON before returning it. Preserve useful errors for empty or invalid model responses.

## Security

- Read `GEMINI_API_KEY` only on the server.
- Never return secrets, raw environment values, or sensitive provider details to the client.
- Do not log complete email bodies or model responses unless explicitly required and reviewed.
- Do not assume authentication, authorization, rate limiting, auditing, or retention exist; these are currently unspecified.

## Fixtures and business rules

`public/correos-ejemplo.json` is a fixture and current email source for the UI/repository adapter. Its company context and business rules must be treated as provisional until confirmed by the user.

The prompt is part of the model behavior. Changes to its output format require synchronized changes to `GeneratedDraft`, the generator, API response, and frontend types.

## Validation

After server changes, run `npm run lint` and `npm run build`. Do not add production claims, integrations, or deployment assumptions that are not present in the repository or explicitly provided by the user.
