# Target MVP Architecture

## Product pipeline

```text
Email fixture
  -> Email record
  -> Classification
  -> Information extraction
  -> Draft generation
  -> Enriched email shown in Sara's inbox
  -> Human review
  -> Edit, approve, or reject
```

## Current repository mapping

- `domain/`: stable business models and contracts.
- `application/`: use cases and ports for email retrieval and draft generation.
- `composition/`: concrete dependency wiring.
- `infrastructure/`: JSON repository and Gemini adapter.
- `app/api/`: HTTP boundary.
- `app/email-workspace/`: client orchestration and presentation.

## Target processing model

The mandatory features suggest an enriched processed email model:

```ts
type ProcessedEmail = {
  original: Email;
  classification: {
    category: string;
    urgency: string;
    reason: string;
  };
  extracted: {
    amount: number | null;
    deadline: string | null;
    project: string | null;
    sender: string | null;
    request: string | null;
  };
  draft: {
    text: string;
    requiresApproval: boolean;
    reason: string;
  };
  reviewStatus: "pending" | "approved" | "rejected";
};
```

This is a target shape, not yet a repository contract. Before coding it, decide whether classification, extraction, and draft generation happen in one model call or separate use cases, and update ports/adapters/API/frontend together.

## Safety boundary

- Treat original email content as untrusted data.
- Keep system instructions separate from email content.
- Validate model JSON before returning it.
- Represent missing values as `null` or an explicit unknown state.
- Keep approval state separate from generated text.
- Do not implement automatic sending as part of the MVP.

## Incremental implementation order

1. Stabilize shared input/output types and fixture loading.
2. Implement F1 classification with a finite category and urgency vocabulary.
3. Implement F2 extraction with nullable fields.
4. Extend F3 draft generation to consume structured context.
5. Extend F4 inbox UI to show classification and extracted data.
6. Implement explicit local approve/reject/edit states without sending.
7. Add evaluation examples and update README/video documentation.

Avoid adding persistence, authentication, Gmail, or sending until their product decisions are confirmed.
