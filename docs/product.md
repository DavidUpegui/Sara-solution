# Product Definition

## Vision

Aurora AI is an AI-assisted email management tool for Constructora Aurora. It analyzes incoming emails, classifies them, extracts relevant information, and proposes response drafts while leaving the final decision with Sara.

> The AI proposes. Sara decides.

## Problem

Sara receives approximately 110 emails per week from suppliers, buyers/customers, banks, partners, internal teams, and advertisers. She currently spends about 2.5 hours per day reading, classifying, and answering them manually. The product should reduce mechanical work and the risk of overlooking important or urgent messages without removing human control.

## Primary user

Sara, assistant to management.

## MVP experience

```text
Email fixture
  -> AI analysis
  -> Classification and extraction
  -> Draft proposal
  -> Sara's inbox
  -> Read, edit, approve, or reject
```

The MVP uses the 25 fictional records in `public/correos-ejemplo.json`. It does not need Gmail integration.

## Product boundaries

The MVP does not include Gmail/OAuth integration, complex user management, multi-tenancy, billing, microservices, an administrative dashboard, advanced analytics, fine-tuning, complex RAG, or chatbot behavior.

Actual email delivery, persistence, authentication, and deployment details are not defined by the product document and must not be invented during implementation.

## Success criteria for the challenge

- A reviewer can understand the flow without guessing.
- The five required features work end to end.
- Sara remains the final decision-maker.
- AI failures, malformed data, and unsafe content have understandable behavior.
- The code and README explain the solution and its limitations.
- The application can be reproduced from a clean clone using the documented commands.
