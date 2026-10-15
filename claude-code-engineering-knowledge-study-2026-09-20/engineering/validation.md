# Validation record

Observed 2026-09-20. This is a generated report-only receipt.

## Scoped study validation

| Check | Result |
| --- | --- |
| target clone revision | pass — `2ca5ddabfed5f220812ea11f029eda03b21bc4c1` |
| generator and generic metrics-tool syntax | pass |
| standalone metric reproduction | pass — exact JSON equality after removing timestamps/source receipt |
| claim map | pass — 12 unique claims, 30 code-evidence anchors, knowledge refs and URL syntax |
| report links | pass — 65 code links and 16 local knowledge links; source line ranges checked |
| layout | pass — 111 A4 sheets with no vertical overflow |
| PDF | pass — six PDF headers and object page counts match the manifest |
| visual inspection | pass — all covers and one representative page per volume inspected |
| target clone mutation | none — clone worktree clean |

## Repository knowledge-system fitness

The selected owner checks were run read-only after composition.

- `knowledge-repository-boundary-fitness.mjs`: passed with warnings; 130 pages,
  88 reusable pages and 42 contextual references, with no blocking boundary
  violation. Warnings concern existing legacy projection/verification metadata.
- `artifact-knowledge-fitness.mjs`: failed on the existing
  `artifacts/knowledge/ai/ai-service-engineer-domain-and-evaluation-v5.md`
  page (missing required sections/profile declarations and invalid legacy
  authority vocabulary/source closure).
- `reference-knowledge-fitness.mjs`: failed on existing job-application v5/v6
  reference pages and reported legacy-page warnings.

The failing pages are outside this operation's generated output and were not
modified. The failures are retained as repository-state limitations rather
than silently repaired or attributed to this study set.

## Residual validation limits

- No independent subject-matter reviewer or learner cohort evaluated conceptual
  accuracy or educational benefit.
- External pages were researched and source URLs retained, but the build only
  validates URL syntax; future availability and content drift remain external.
- The reconstructed target was not built or executed because its own README
  identifies missing modules and the available build workflow is not a safe
  completeness oracle for this analysis.
- PDF object/page, layout and visual checks do not establish full tagged-PDF or
  assistive-technology conformance.

