---
name: Frontend Workspace Instructions
description: Guidance for changing the Next.js email workspace UI, its client state, components, and styles.
applyTo: "app/**/*.tsx,app/**/*.css"
---

# Frontend Instructions

## Component boundaries

- `app/page.tsx` is the route entry point and should remain thin.
- `app/email-workspace/EmailWorkspace.tsx` owns client state, sample email loading, search filtering, selected email state, and the draft request lifecycle.
- `EmailList.tsx` renders the searchable email list and emits selection changes.
- `EmailDetail.tsx` renders the selected email and is presentational.
- `DraftWriter.tsx` renders the draft states and controlled textarea; it should not call the API directly.
- Keep UI-only types and formatters in `app/email-workspace/` unless they are genuinely shared outside this feature.

Keep cross-panel state in `EmailWorkspace`. Prefer explicit props and callbacks over duplicating state in child components.

## API boundary

The client calls only `POST /api/emails/draft` with `{ emailId }`. The expected response is `{ draft, requiresApproval, reason }`. Put only `draft` in the editable textarea; display approval metadata separately when appropriate.

Do not import `composition/`, `infrastructure/`, filesystem modules, or server-only environment variables into client components.

## Visual conventions

- Preserve the existing Aurora workspace visual language unless a redesign is requested.
- Keep the interface in Spanish unless the user requests another language.
- Preserve the three-panel desktop layout and responsive tablet/mobile behavior when changing UI.
- Reuse the existing class names and global CSS tokens before introducing a new styling abstraction.
- Keep loading, empty, ready, and error states visible and usable.
- Use accessible labels for inputs and meaningful button text.

## Data assumptions

The JSON under `public/` is a fixture. Do not infer production workflows or business rules from it without confirmation. Static counters or presentational actions must not be described as implemented backend behavior.
