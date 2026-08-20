# Project Instructions

## Project

This repository is a Next.js App Router application named `sara-solution`.

Treat the current implementation as the source of truth. Do not present fixture data, prompt text, or UI labels as confirmed production business requirements unless the user explicitly confirms them.

## Stack

- Next.js `16.3.1`
- React `19.2.8`
- TypeScript with `strict: true`
- Tailwind CSS `4`
- `@google/genai`
- TypeScript alias: `@/*` maps to the repository root

Before changing Next.js code, follow the repository guidance in `AGENTS.md` and consult the relevant documentation under `node_modules/next/dist/docs/` when the change depends on Next.js behavior.

## Commands

- `npm run dev`: start the development server
- `npm run lint`: run ESLint
- `npm run build`: create a production build
- `npm run start`: start the production server

Run `npm run lint` and `npm run build` after code changes when possible. Do not commit changes unless explicitly requested.

## Architecture

- `app/`: Next.js routes, layouts, API routes, global CSS, and frontend components.
- `app/email-workspace/`: client-side email workspace components and UI-specific types/helpers.
- `domain/`: business models and domain contracts.
- `application/`: use cases and ports/interfaces.
- `composition/`: dependency wiring and composition root.
- `infrastructure/`: concrete adapters such as JSON data access and Gemini integration.
- `public/`: publicly served fixture assets, including `correos-ejemplo.json`.

Preserve dependency direction: domain should not depend on infrastructure; application should depend on ports rather than concrete adapters; composition wires implementations; infrastructure implements ports.

## Client/server boundary

Keep Gemini, filesystem access, repository adapters, environment variables, and other server-only code out of client components. The browser may call the existing API route, but must not import `composition/` or `infrastructure/` modules.

Never expose `GEMINI_API_KEY` to the browser, JSX, public assets, logs, or API responses.

## Current draft flow

The browser loads `/correos-ejemplo.json` and sends:

```http
POST /api/emails/draft
Content-Type: application/json

{"emailId": 1}
```

The response contract is:

```json
{
  "draft": "string",
  "requiresApproval": true,
  "reason": "string"
}
```

The Gemini adapter reads `infrastructure/ai/prompts/draft-system-prompt.md`, requests JSON, and parses the model response. Keep this contract synchronized across the application port, adapter, API route, and frontend types.

## Data and scope

`public/correos-ejemplo.json` is sample data unless the user confirms otherwise. The current UI has presentational discard and review/send buttons; actual sending, persistence, authentication, authorization, and mailbox synchronization are not implemented.

When requirements are unclear, identify the uncertainty and ask for or create an explicit placeholder instead of inventing business rules.

## Product context

Before implementing product behavior, read the relevant documents under `docs/`:

- `docs/product.md`: product vision, user, boundaries, and MVP success criteria.
- `docs/features.md`: the five mandatory features and optional extensions.
- `docs/requirements.md`: functional and non-functional requirements with current implementation status.
- `docs/business-rules.md`: human approval, communication, and AI safety rules.
- `docs/architecture.md`: target MVP pipeline and incremental implementation order.
- `docs/decisions.md`: accepted and pending product/architecture decisions.
- `docs/business-context.md`: confirmed context and unresolved operational details.

Implement mandatory features incrementally. Do not add Gmail, automatic sending, authentication, persistence, or other pending capabilities without an explicit product decision.
