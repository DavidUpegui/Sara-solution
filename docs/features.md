# Features

The challenge defines five mandatory features. Implement them in this order unless a dependency requires otherwise.

## F1 - Email classification

The system analyzes each email and returns:

- `category`
- `urgency`
- `reason`

The category vocabulary must be explicit and stable. The current product document gives examples such as suppliers, buyers/customers, bank, partners, internal communications, and advertising, but the final enum/list should be confirmed before hard-coding it.

Urgency must use a finite vocabulary, for example `low`, `medium`, and `high`, or an equivalent confirmed set. Do not invent additional levels without documenting the decision.

## F2 - Information extraction

The system extracts structured information from the email:

- `amount`
- `deadline`
- `project`
- `sender`
- `request`

Fields may be `null` or explicitly unknown when the email does not contain the information. Do not manufacture values.

## F3 - Draft generation

The system generates a proposed answer using:

1. The original email.
2. Aurora's confirmed tone and communication rules.
3. The classification and extracted information, when available.

The draft must not be treated as an automatically sendable message. It is a proposal that requires human review.

The current API response is `{ draft, requiresApproval, reason }`. When F1 and F2 are implemented, the enriched response schema must be designed deliberately and updated across the application port, adapter, route, and frontend types together.

## F4 - Sara's inbox

Sara must be able to:

1. View emails.
2. Read the original email.
3. See classification.
4. See extracted information.
5. Read the generated draft.
6. Approve the proposal.
7. Edit the draft.
8. Reject the proposal.

The interface should optimize clarity of state and next action. Visual polish is secondary to an understandable workflow.

## F5 - Documentation and demonstration

The repository must contain a README explaining:

- Installation.
- Execution.
- Key decisions.
- Why the chosen solution was used.
- Known limitations.
- What would be built with two additional weeks.
- Uncomfortable or unfinished parts.

A demonstration video should be no longer than five minutes and should explain the workflow in terms Sara can understand.

## Optional extensions

Only build these after the mandatory features are stable:

- Prompt injection defenses and security demonstration.
- Cost estimates for 25 and 500 emails.
- Classification quality metrics.
- Conversation history and follow-up detection.
- Daily management summary.
- A business/pricing model.
