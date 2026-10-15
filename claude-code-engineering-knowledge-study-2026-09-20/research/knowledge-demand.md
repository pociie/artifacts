# Knowledge demand and gap register

This is a generated research-control record, not a canonical knowledge page.

## Competency questions

| ID | Question the study material must answer | Required explanatory relation |
| --- | --- | --- |
| CQ-01 | Why is Claude Code better modeled as a controlled interpreter of model-proposed effects than as a chat application? | language/runtime theory ↔ tool contract ↔ authority boundary |
| CQ-02 | Why is context construction a compiler problem, and which properties must its intermediate representation preserve? | compiler/IR ↔ prompt cache ↔ provenance ↔ compaction |
| CQ-03 | What makes a tool invocation valid beyond JSON-schema conformance? | representation validity ↔ semantic validity ↔ authority ↔ current-state validity |
| CQ-04 | Why do file edits and shell commands require different consistency and security models? | optimistic concurrency/TOCTOU ↔ shell language semantics ↔ reference monitor |
| CQ-05 | In what precise sense is one model turn transaction-like, and where does the database analogy fail? | state machine/event log/saga ↔ partial external effects ↔ resume |
| CQ-06 | What does an async generator contribute that Promise or callback designs do not, and what obligations remain outside it? | coroutine semantics ↔ temporal protocol ↔ cancellation/backpressure |
| CQ-07 | Why are REPL and SDK not merely two UIs, but competing projections and possible state owners? | projection/view model ↔ canonical state ↔ race/convergence |
| CQ-08 | Which code distributions reveal real engineering pressure rather than importance by file size? | change pressure ↔ lexical evidence ↔ quality scenarios ↔ limitations |
| CQ-09 | Which refactor order preserves behavior under recovery, caching, compatibility, and feature variability? | seams ↔ characterization oracle ↔ product-line variability ↔ migration |
| CQ-10 | How should a learner test understanding without repeating the report's terminology? | falsifiable scenario ↔ counterexample ↔ code experiment ↔ design consequence |

## Initial reusable coverage and residual gaps

| Gap | Local coverage | Residual external evidence required |
| --- | --- | --- |
| research and knowledge composition | progressive knowledge, projection, bias-control artifacts | none beyond their cited primary foundations |
| quality/tradeoff reasoning | engineering operating model, architecture-characteristic and rubric knowledge | original quality-scenario and decision-analysis sources where needed |
| context as compiler | prompt/LLM engineering knowledge partially covers context | compiler IR/provenance and provider prompt-cache semantics |
| controlled effects | local authority/effect engineering covers governance semantics | protection/reference-monitor, TOCTOU/OCC, command-injection primary sources |
| turn transaction | local operation/convergence knowledge covers settlement | state machine, saga/logging, idempotency and streaming specifications |
| async generator/UI projection | target code and videos motivate the question | ECMAScript, Node cancellation, React/Ink owner documentation |
| structural evolution | local architecture/reuse knowledge covers evaluation | feature variability and characterization/migration evidence |

## Evidence admission

- Prefer standards, language/runtime specifications, original research papers,
  official provider/runtime documentation, and owner repositories.
- Secondary explanations may orient search but do not carry a decisive claim.
- Each source is recorded with the exact claim it supports and a limitation;
  citation count is not treated as importance.
- External sources may change the conceptual model, but cannot override direct
  observations of the fixed source snapshot or fill missing reconstructed code.

