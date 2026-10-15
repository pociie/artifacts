# PDF flow and content-continuity supplement

Status: `candidate_not_activated`  
Revision: `book-pdf-flow-continuity/1`  
Owner role: `role:visual-pdf-spec-builder`  
Authority effect: `none`

This task-local supplement governs how prerequisite explanations, examples,
worked traces, diagrams and failure cases continue across pages. It does not
reopen or replace prototype-v3 or handoff revision
`book-pdf-recipient-handoff/4`.

## Bound read-only references

- Shared environment binding:
  `.collab/artifacts/book-pdf-artifact-workflow-2026-09-21/coordination-v3/shared-environment-binding-v1.json`
  at `sha256:12c0588f148700803a390c781e92c8a47f1d739a05ef922457e343c86862f7cb`.
- Project-context enrichment skill:
  `artifacts/agents/agent-operation/skill/project-context-enrichment/SKILL.md`
  at `sha256:f2cca2fd15eca3e0498a17b575d5d6ba94344f05d044ffecbad4e1b11ae0df7d`.
- Analysis lenses:
  `artifacts/agents/agent-operation/skill/project-context-enrichment/references/analysis-lenses.md`
  at `sha256:2eadd38c56d12adb077141863753abf15c9b90d719fed0cc4e54111a2c8fdc56`.
- Enrichment packet contract:
  `artifacts/agents/agent-operation/skill/project-context-enrichment/references/enrichment-packet.md`
  at `sha256:efdada7520c1b35c747b10ef0e1be8e6c10b1a898d99c6d201ab0cb045042cbf`.

These references narrow and clarify quality requirements. They do not expand
the visual owner's role, write boundary, activation, acceptance, publication
or settlement authority.

## Governing principle

Page count is a forecast and production cost, not a semantic limit. When a
reader needs more explanation, the document adds pages or moves bounded
optional depth to an appendix. It must not reduce type below the declared
minimum, compress leading, rasterize prose, omit evidence, weaken a claim,
merge evidence classes or remove a necessary example merely to satisfy a page
target.

If an external deliverable later introduces a hard page maximum, the owner
must record it as a changed requirement and hold for scope or editorial
resolution. Automatic truncation and shrink-to-fit are prohibited.

## Content units

### Explanation bridge

An explanation bridge preserves this complete sequence:

1. `observed_project_fact` — what the bounded project snapshot directly shows;
2. `external_background` — the prerequisite concept and its applicable source;
3. `project_inference` — the explicit connection between the two;
4. `why_it_matters` — the consequence for the named reader;
5. `unresolved` or limitation when support is incomplete.

A bridge may span pages, but no continuation may erase or reorder these
epistemic labels. External background never becomes proof of project behavior.

### Worked example or trace

A worked example has a question, initial state, ordered steps, intermediate
state, result, interpretation and limitation. When it exceeds a page, allocate
a dedicated multi-page sequence. Repeat the example identifier and a short
state recap in the continuation header; do not restart numbering or silently
drop intermediate steps.

### Visual unit

A diagram stays with its purpose statement and interpretive caption. A figure
may move to the following page, but it must not be separated from the caption
that states what the reader should conclude. Large diagrams may use a full
page followed by an interpretation page.

### Evidence review unit

A claim, evidence-class label, source locator, applicability statement and
limitation form one review unit. If the unit must split, the next page repeats
the claim identifier and evidence class before continuing.

## Placement resolver

Every enrichment item receives exactly one primary placement. Cross-references
may point to it, but the same tutorial block is not duplicated across pages.

| Placement | Use when | Do not use when |
| --- | --- | --- |
| Introduction | The concept changes how the whole report must be read. | It serves only one later example. |
| Prerequisite callout | A short concept must be known before the adjacent argument. | The explanation needs multiple steps or pages. |
| Glossary | A stable term needs concise lookup support. | The reader needs causal explanation. |
| Inline example | One compact example resolves a local ambiguity. | The example has meaningful intermediate state. |
| Worked trace | Ordered state or control changes are the teaching device. | Only a definition is required. |
| Diagram | Spatial, temporal or ownership relationships are clearer visually. | Decoration would merely repeat prose. |
| Failure case | A boundary becomes clear through denial, error or recovery. | The failure does not change the reader's model. |
| Appendix | Optional depth supports verification or later reference. | The prerequisite is mandatory for the main argument. |

Interesting adjacent context that does not change the current understanding
goal is excluded and recorded as such; it is not used to fill pages.

## Pagination rules

1. Split at a semantic boundary, never at an arbitrary physical height.
2. Keep a heading with the first meaningful paragraph beneath it.
3. Keep a figure with its interpretive caption and a source label with the
   claim it qualifies.
4. Avoid a single orphaned line at the top or bottom of a page. Reflow first;
   add a page rather than compressing the type system.
5. Use `continued` labels carrying section, bridge, example or trace identity
   whenever a unit crosses a page.
6. Start a new page for a multi-step prerequisite, long worked trace, large
   diagram or failure comparison when the remaining space cannot support the
   complete reading unit.
7. Preserve the Systems Monograph mode for causal explanation and the Evidence
   Notebook mode for claim review even when either mode spans several pages.
8. Recompute page numbers, cross-references, table of contents and artifact
   digest after any reflow.

## Layout backpressure

| Condition | Required response | Prohibited response |
| --- | --- | --- |
| Block exceeds remaining page | Move the unit or continue it with identity and state recap. | Clip, scale down or delete content. |
| Section needs more prerequisite depth | Add a prerequisite sequence or route optional depth to an appendix. | Replace explanation with keywords. |
| Diagram becomes unreadable | Give it a full page or divide overview and detail views. | Reduce labels below the type minimum. |
| Page becomes dense after source notes | Add a page and retain source applicability and limitation. | Remove provenance or merge evidence classes. |
| Requested maximum conflicts with required understanding | Hold and request scope resolution. | Alter claim meaning or authority. |

## Required validation evidence

- content-unit inventory before pagination;
- placement record for each included enrichment bridge;
- before/after content identity comparison showing no unexplained omissions;
- browser geometry report with no clipping or overflow;
- computed type-size and leading report proving no shrink-to-fit;
- continuation audit for every split bridge, example, trace and evidence unit;
- PDF page-count and selectable-text inspection;
- contact-sheet review for abrupt density, stranded headings and mislabeled
  evidence classes;
- independent review pending for physical A4, grayscale, accessibility,
  reading order and reader comprehension.

No result from this supplement activates an Agent, accepts a report, publishes
a PDF or settles the work.
