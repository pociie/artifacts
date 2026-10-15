# Repository Evidence Discovery Hardening Plan

## Owner

- Native owner: `artifacts/agent-loop/execution-preparation/context-resolution/`
- Objective-owning subject: `artifacts/agents/requirement-realization/agents/artifact-builder.yaml`
- Consumer instruction: `artifacts/agents/agent-operation/skill/context-engineering/SKILL.md`

## Bounded change

Add a provider-neutral `repository-evidence-discovery/v1` contract beneath
Context Resolution. It will classify one repository question, bind a bounded
scope and capability snapshot, route conceptual discovery to semantic
retrieval when admitted, route known symbols to symbol navigation, route
unfamiliar files or modules to structural outline, retain exact-literal search
as a fallback, and reject broad multi-concept OR-regex discovery.

Update only the owning Loop's governance, requirement, functional policy,
operating Skill, and loop descriptor plus the existing context-engineering
consumer Skill. Do not edit adjacent dirty Loop Architecture Components,
install an external tool, or select one provider as the framework default.

## Compatibility

The change is additive and report-only. Existing `context-projection/v2`
consumers remain valid. External adapters such as local semantic indexes,
cloud-backed semantic search, LSP servers, or AST outline tools require their
own current Tool Capability Resolution and privacy/effect admission.

## Validation

- validate the reusable-artifact operation request;
- validate the example against the JSON Schema;
- run checker positive and negative cases, including the reported broad
  `Orca|orca|terminal|...` failure shape;
- run Context Resolution focused tests;
- run the Agent Loop spec checker for the owning descriptor;
- inspect the final diff only for selected paths.

## Rollback and stop

The candidate is reversible by removing the additive sub-contract and its
references. Stop before mutation outside the named owner/consumer paths, on an
unresolved privacy or ownership conflict, when validation repeats the same
fingerprint, or when an existing dirty edit overlaps the selected files.
