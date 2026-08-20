# Technical Context

Status: generated from the repository on 2026-08-20. This document describes the current implementation, not a production architecture guarantee.

## Application summary

The repository contains a Next.js App Router application for reviewing email records and generating a response draft through an API endpoint. The current UI uses the sample file `public/correos-ejemplo.json` as its email source.

The confirmed product definition is documented in `docs/product.md`, `docs/features.md`, and `docs/business-context.md`. The repository implements only part of the target MVP; see `docs/requirements.md` for the current status.

## Stack and commands

- Next.js `16.3.1` with App Router
- React `19.2.8`
- TypeScript with strict checking
- Tailwind CSS `4`
- `@google/genai`
- `@/*` TypeScript alias to the repository root

Commands:

```bash
npm run dev
npm run lint
npm run build
npm run start
```

## Directory responsibilities

```text
app/
  page.tsx                         Route entry point for `/`
  layout.tsx                       Root layout, metadata, fonts, language
  globals.css                      Global visual system and responsive styles
  email-workspace/                 Client workspace components
  api/emails/draft/route.ts        HTTP endpoint for draft generation

domain/models/                     Domain models, including Email
application/email/                 Use cases and ports/interfaces
composition/                       Dependency wiring
infrastructure/data-acces/json/   JSON repository adapter
infrastructure/ai/gemini/         Gemini draft generator
infrastructure/ai/prompts/        System prompt used by Gemini
public/                            Public fixture assets
```

The directory name `data-acces` is the current repository spelling and should not be silently renamed as part of an unrelated change.

## Frontend flow

1. `app/page.tsx` renders `EmailWorkspace`.
2. `EmailWorkspace` loads `/correos-ejemplo.json` in the browser.
3. The workspace filters the loaded records locally and tracks the selected email.
4. Selecting an email sends `POST /api/emails/draft` with `{ emailId }`.
5. `DraftWriter` displays the returned `draft` in an editable textarea.
6. `requiresApproval` and `reason` are displayed as approval metadata.

The UI has loading, idle, ready, and error states. The discard and review/send controls are currently presentational and do not send or persist email.

## Server flow

1. `app/api/emails/draft/route.ts` receives `emailId`.
2. `composition/email.ts` provides `GenerateDraftForEmail` with `JsonEmailRepositoryAdapter` and `GeminiDraftGenerator`.
3. `GenerateDraftForEmail` loads the email through the `EmailRepository` port.
4. `GeminiDraftGenerator` reads the system prompt and calls Gemini using the server-only `GEMINI_API_KEY`.
5. The generator parses Gemini's JSON response into `GeneratedDraft`.
6. The API returns the structured generated draft.

## Current contracts

`Email` currently contains:

```ts
interface Email {
  id: number;
  de: string;
  nombre: string;
  fecha: string;
  asunto: string;
  cuerpo: string;
}
```

The generated response currently contains:

```ts
interface GeneratedDraft {
  draft: string;
  requiresApproval: boolean;
  reason: string;
}
```

## Known limitations and unknowns

- F1 classification and F2 information extraction are not implemented yet.
- F4 approval and rejection controls are currently presentational; they do not persist a review decision or send a response.
- F5 README and demonstration deliverables still need to be completed.
- The email JSON is sample/fixture data for the challenge and is not a real mailbox integration.
- No real mailbox synchronization is implemented.
- No send-email operation is implemented.
- No persistence or draft history is implemented.
- Authentication and authorization are not implemented or specified.
- The unread count shown by the UI is not connected to a backend state.
- Deployment, hosting, observability, auditing, rate limiting, retention, and availability requirements are unspecified.
- The intended production Gemini model and provider configuration should be confirmed before deployment.
