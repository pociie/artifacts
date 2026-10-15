# Representative-page visual review

Historical baseline reviewed after the earlier 211-page build:

- all six covers and system maps;
- algorithm source and assurance spreads for all six volumes;
- prose baseline from volume 02;
- distinction matrix from volume 04;
- source-evidence index from volume 05.

Checks and results:

- Korean body text and mixed Korean/English identifiers remain legible at A4.
- Exact source excerpts show original line numbers, an explicit omission marker,
  and a pinned source link; omitted ranges are never presented as continuous.
- Algorithm part 1 establishes problem, input, retained state, and decisive code.
  Part 2 continues the same argument through transitions, invariants, cost,
  failure boundary, design decision, and a visibly separate recommendation.
- Prose pages use headings as reading cues rather than independent cards. Tables
  are reserved for comparisons where exact row-to-row distinctions matter.
- The six-volume navigation and accent color show location without replacing the
  shared conceptual map.
- No observed page had clipped code, overlapping text, orphaned headings, or an
  unreadable footer/source link. Automated overflow checks cover every page.

Preview files are retained under `previews/**`; the `qa-*` images record the
additional prose, matrix, and source-index samples used in this review.

## Expanded-report baseline and required follow-up

The historical review above and the seven focused samples selected by
`content/visual-review-samples.json` are baselines only. They do not constitute
a final visual verdict for the expanded report and do not close either the
`visual_explanation` or `publication_integrity` checkpoint. In particular, an
algorithm source page or first page cannot stand in for review of the complete
explanation.

Current focused-sample baseline:

| Preview | Baseline result | Observation |
|---|---|---|
| `02-ui-ref-state-code.png` | risk | No visible clipping or overflow; dense source text still requires physical-A4 confirmation. |
| `03-generator-foundation.png` | pass | The comparison remains readable with no visible clipping or overflow. |
| `03-model-stream-code.png` | risk | No visible clipping or overflow; dense code and long identifiers require physical-A4 confirmation. |
| `04-hook-fanout-code.png` | risk | No visible clipping or overflow; dense code requires physical-A4 confirmation. |
| `04-sandbox-capability-code.png` | correction needed | The title leaves `로 투영` as an awkward short second line. |
| `05-memory-agent-code.png` | correction needed | The title leaves `agent` alone on its second line. |
| `06-remote-reconnect-code.png` | correction needed | The title leaves `reconnect` alone on its second line. |

The next review must use the author's investigation-based durable
specification after its exact path and revision are shared. The specification
must drive a broader narrative model in which code, repository documentation,
project configuration, design decisions, and current implementation state are
connected in explanatory sentences rather than treated as independent page
artifacts.

For every selected algorithm or mechanism, the frozen-build sample set must
cover the whole explanatory sequence:

1. context and reader-question narrative;
2. source/code evidence;
3. state-transition narrative;
4. assurance, failure boundary, and recommendation separation;
5. operation and ownership narrative; and
6. current-state, unknown, and evidence-boundary narrative.

The follow-up record must bind its verdicts to the durable specification path
and revision, the frozen build identifier, and the inspected preview filenames
or digests. It must also record missing sequence coverage, physical-A4
legibility, density, clipping, overflow, headline orphans, and whether prose
actually connects the six narrative stages. Until that review is complete,
the existing seven samples and algorithm first-page checks remain baseline
evidence only.

## Frozen expanded-build whole-sequence review

This review is bound to the frozen build generated at
`2026-09-20T13:43:40.788Z` from source revision
`2ca5ddabfed5f220812ea11f029eda03b21bc4c1`. The evidence inputs were
re-read with these exact SHA-256 digests:

| Evidence | SHA-256 |
|---|---|
| `previews/visual-sample-manifest.json` | `9cfbc7565e0ae166e421775c17cae4321c4feb9a402f38e2541ac34f66269a99` |
| `manifest.json` | `6abccf5fa20567a690c1f716fe0ff70fb376fb5ae9045acbbc0f849861943a3d` |
| `attachments/frozen-build-record.json` | `d246521beb3ff7d0a3f78d1bec3d590d6ac6e9951fd4f429158587e8969f5b2e` |
| `engineering/expanded-algorithm-narrative-spec.md` | `ab7681f6e4b48b2c64a4874966ed739fb614930352cd8165de4a65dbc6a71e2b` |

The sample manifest selects nine whole-algorithm sequences and 67 page
images. Every selected filename was present, every image SHA-256 matched its
manifest entry, every image was `794 × 1123`, every page index was contiguous
within its declared range, and every sequence declared the complete A–K
obligation set. Each image was then inspected at original resolution; the
automated checks and manifest assertions were used only for provenance and
coverage, not as visual or publication acceptance.

Verdict vocabulary is deliberately split. `PASS`, `RISK`, and `FAIL` below are
on-screen verdicts at the original image resolution. The images have an
A4-plausible aspect ratio and were rendered under Chromium print media, but no
physical sheet was printed or measured in this environment; physical-A4 body,
code, annotation, and footer legibility therefore remains **pending** for all
67 images and is not a pass.

### Whole-sequence verdicts

| Algorithm / sequence | Shape and stress exercised | Pages / images | A–K | On-screen verdict | Physical A4 | Sequence evidence |
|---|---|---:|---|---|---|---|
| A39 `stream-state-machine` | `stream_state_machine`; long source, late state, worked example | 60–67 / 8 | complete | PASS | pending | Context, prerequisite model, example, source, transition, assurance, operation, and current-state/transfer pages form one continuous explanation. |
| A42 `permission-effect` | `permission_effect`; parallel authority, worked example | 67–74 / 8 | complete | PASS | pending | Authority and effect boundaries carry from the reader question through the trace, code, operational consequences, and state ledger. |
| A17 `concurrency-merge` | `concurrency_merge`; completion-versus-commit order, worked example | 19–26 / 8 | complete | **FAIL** | pending | The argument is continuous, but page 26 visually merges the `NEXT READ` label into the preceding `UNKNOWN` row; correction is required. |
| A23 `optimistic-edit` | `effect_commit_window`; counterexample, worked example | 96–103 / 8 | complete | PASS | pending | The counterexample bridges into source and transition semantics, followed by assurance, operation, and a distinct current-state ledger. |
| A26 `durability-recovery` | `durability_recovery`; graph repair, long current state | 15–21 / 7 | complete | PASS | pending | Graph-repair context advances through source, transition, assurance, and aftermath into a readable long current-state/transfer page. |
| A41 `restricted-agent` | `capability_lifecycle`; ownership boundary, worked example | 57–64 / 8 | complete | PASS | pending | Capability ownership remains traceable across the example, source, transition, assurance, operation, and current-state questions. |
| A32 `pure-mapping` | `pure_mapping`; compact layout, namespace collision | 5–9 / 5 | complete | PASS | pending | The compact sequence still connects context, source, transition, assurance, and the combined operation/current-state close without a missing bridge. |
| A35 `configuration-migration` | `configuration_migration`; remote unknown, long headline | 42–48 / 7 | complete | PASS | pending | The long headline wraps without an orphan; remote uncertainty remains distinct through transition, operation, current-state, and transfer questions. |
| A44 `bounded-reconnect` | `transport_recovery`; timer race, unknown server contract | 21–28 / 8 | complete | PASS | pending | The timer-race example connects to code and transition semantics, then to assurance, operational aftermath, server-contract unknowns, and transfer questions. |

Across the nine sequences, the on-screen sequence count is **8 PASS / 0 RISK
/ 1 FAIL**. No selected page showed visible clipping, overflow, headline
orphaning, running-head collision, footer collision, or a broken source-link
footer. Dense source blocks and small secondary transition annotations were
readable on screen at original resolution, but their physical-A4 legibility is
included in the pending print check rather than inferred from the raster.

The stage order reads like a connected book explanation rather than a set of
independent source pages: context and ownership establish the reader question;
prerequisite/example pages supply an execution model where needed; source and
transition pages bridge code to state; assurance and operation pages separate
guarantees, counterexamples, effects, and aftermath; and the closing ledger
records present evidence and transfer questions. `OBSERVED`, conditional
claims, `UNKNOWN`, and recommendations/next reads remain visually and
linguistically distinct in 66 images; the A17 failure below is the sole observed
exception.

### Per-image ledger

| Preview | Algorithm | PDF page | Stage | On-screen | Physical A4 |
|---|---:|---:|---|---|---|
| `sequence-stream-state-machine-01-context.png` | A39 | 60 | context | PASS | pending |
| `sequence-stream-state-machine-02-prerequisites.png` | A39 | 61 | prerequisites | PASS | pending |
| `sequence-stream-state-machine-03-example.png` | A39 | 62 | example | PASS | pending |
| `sequence-stream-state-machine-04-source.png` | A39 | 63 | source | PASS | pending |
| `sequence-stream-state-machine-05-transition.png` | A39 | 64 | transition | PASS | pending |
| `sequence-stream-state-machine-06-assurance.png` | A39 | 65 | assurance | PASS | pending |
| `sequence-stream-state-machine-07-operation.png` | A39 | 66 | operation | PASS | pending |
| `sequence-stream-state-machine-08-current-state.png` | A39 | 67 | current state | PASS | pending |
| `sequence-permission-effect-01-context.png` | A42 | 67 | context | PASS | pending |
| `sequence-permission-effect-02-prerequisites.png` | A42 | 68 | prerequisites | PASS | pending |
| `sequence-permission-effect-03-example.png` | A42 | 69 | example | PASS | pending |
| `sequence-permission-effect-04-source.png` | A42 | 70 | source | PASS | pending |
| `sequence-permission-effect-05-transition.png` | A42 | 71 | transition | PASS | pending |
| `sequence-permission-effect-06-assurance.png` | A42 | 72 | assurance | PASS | pending |
| `sequence-permission-effect-07-operation.png` | A42 | 73 | operation | PASS | pending |
| `sequence-permission-effect-08-current-state.png` | A42 | 74 | current state | PASS | pending |
| `sequence-concurrency-merge-01-context.png` | A17 | 19 | context | PASS | pending |
| `sequence-concurrency-merge-02-prerequisites.png` | A17 | 20 | prerequisites | PASS | pending |
| `sequence-concurrency-merge-03-example.png` | A17 | 21 | example | PASS | pending |
| `sequence-concurrency-merge-04-source.png` | A17 | 22 | source | PASS | pending |
| `sequence-concurrency-merge-05-transition.png` | A17 | 23 | transition | PASS | pending |
| `sequence-concurrency-merge-06-assurance.png` | A17 | 24 | assurance | PASS | pending |
| `sequence-concurrency-merge-07-operation.png` | A17 | 25 | operation | PASS | pending |
| `sequence-concurrency-merge-08-current-state.png` | A17 | 26 | current state | **FAIL** | pending |
| `sequence-optimistic-edit-01-context.png` | A23 | 96 | context | PASS | pending |
| `sequence-optimistic-edit-02-prerequisites.png` | A23 | 97 | prerequisites | PASS | pending |
| `sequence-optimistic-edit-03-example.png` | A23 | 98 | example | PASS | pending |
| `sequence-optimistic-edit-04-source.png` | A23 | 99 | source | PASS | pending |
| `sequence-optimistic-edit-05-transition.png` | A23 | 100 | transition | PASS | pending |
| `sequence-optimistic-edit-06-assurance.png` | A23 | 101 | assurance | PASS | pending |
| `sequence-optimistic-edit-07-operation.png` | A23 | 102 | operation | PASS | pending |
| `sequence-optimistic-edit-08-current-state.png` | A23 | 103 | current state | PASS | pending |
| `sequence-durability-recovery-01-context.png` | A26 | 15 | context | PASS | pending |
| `sequence-durability-recovery-02-prerequisites.png` | A26 | 16 | prerequisites | PASS | pending |
| `sequence-durability-recovery-03-source.png` | A26 | 17 | source | PASS | pending |
| `sequence-durability-recovery-04-transition.png` | A26 | 18 | transition | PASS | pending |
| `sequence-durability-recovery-05-assurance.png` | A26 | 19 | assurance | PASS | pending |
| `sequence-durability-recovery-06-operation.png` | A26 | 20 | operation | PASS | pending |
| `sequence-durability-recovery-07-current-state.png` | A26 | 21 | current state | PASS | pending |
| `sequence-restricted-agent-01-context.png` | A41 | 57 | context | PASS | pending |
| `sequence-restricted-agent-02-prerequisites.png` | A41 | 58 | prerequisites | PASS | pending |
| `sequence-restricted-agent-03-example.png` | A41 | 59 | example | PASS | pending |
| `sequence-restricted-agent-04-source.png` | A41 | 60 | source | PASS | pending |
| `sequence-restricted-agent-05-transition.png` | A41 | 61 | transition | PASS | pending |
| `sequence-restricted-agent-06-assurance.png` | A41 | 62 | assurance | PASS | pending |
| `sequence-restricted-agent-07-operation.png` | A41 | 63 | operation | PASS | pending |
| `sequence-restricted-agent-08-current-state.png` | A41 | 64 | current state | PASS | pending |
| `sequence-pure-mapping-01-context.png` | A32 | 5 | context | PASS | pending |
| `sequence-pure-mapping-02-source.png` | A32 | 6 | source | PASS | pending |
| `sequence-pure-mapping-03-transition.png` | A32 | 7 | transition | PASS | pending |
| `sequence-pure-mapping-04-assurance.png` | A32 | 8 | assurance | PASS | pending |
| `sequence-pure-mapping-05-operation-current-state.png` | A32 | 9 | operation/current state | PASS | pending |
| `sequence-configuration-migration-01-context.png` | A35 | 42 | context | PASS | pending |
| `sequence-configuration-migration-02-prerequisites.png` | A35 | 43 | prerequisites | PASS | pending |
| `sequence-configuration-migration-03-source.png` | A35 | 44 | source | PASS | pending |
| `sequence-configuration-migration-04-transition.png` | A35 | 45 | transition | PASS | pending |
| `sequence-configuration-migration-05-assurance.png` | A35 | 46 | assurance | PASS | pending |
| `sequence-configuration-migration-06-operation.png` | A35 | 47 | operation | PASS | pending |
| `sequence-configuration-migration-07-current-state.png` | A35 | 48 | current state | PASS | pending |
| `sequence-bounded-reconnect-01-context.png` | A44 | 21 | context | PASS | pending |
| `sequence-bounded-reconnect-02-prerequisites.png` | A44 | 22 | prerequisites | PASS | pending |
| `sequence-bounded-reconnect-03-example.png` | A44 | 23 | example | PASS | pending |
| `sequence-bounded-reconnect-04-source.png` | A44 | 24 | source | PASS | pending |
| `sequence-bounded-reconnect-05-transition.png` | A44 | 25 | transition | PASS | pending |
| `sequence-bounded-reconnect-06-assurance.png` | A44 | 26 | assurance | PASS | pending |
| `sequence-bounded-reconnect-07-operation.png` | A44 | 27 | operation | PASS | pending |
| `sequence-bounded-reconnect-08-current-state.png` | A44 | 28 | current state | PASS | pending |

The per-image on-screen count is **66 PASS / 0 RISK / 1 FAIL**; physical-A4
confirmation is **0 confirmed / 67 pending**.

### Required correction and open acceptance

- **Correction required — A17, PDF page 26,
  `sequence-concurrency-merge-08-current-state.png`:** the `NEXT READ` label is
  placed at the end of the `UNKNOWN` row while its value wraps beneath it. This
  weakens the intended separation between an unknown current-state claim and a
  transfer/revalidation prompt. Give `NEXT READ` its own visually bounded row
  with label and value aligned like the other ledger entries.
- Because a changed page digest invalidates its whole sampled sequence, a
  corrected frozen build must publish a new manifest and the complete A17
  eight-image sequence must be rehashed and re-reviewed, not only page 26.
- A physical-A4 print inspection must confirm body, code, secondary annotation,
  running-head, source-link, and footer legibility for the selected pages. The
  raster inspection cannot supply that evidence.

`visual_explanation` remains **OPEN** because one sampled page fails the
on-screen status-boundary check and physical-A4 evidence is pending.
`publication_integrity` remains **OPEN** for the same correction and print
evidence. A new author correction cycle is required; automated-check success
does not close either checkpoint.

## Superseding cache-safe review — frozen build 2026-09-20T14:22:38.665Z

This section supersedes the applicability of the 13:43 review above; it does
not delete or rewrite that historical evidence. The corpus and generated build
changed, producing new manifest, sample-manifest, frozen-record, PDF/page, and
image digests and moving several sampled page ranges. In addition, the earlier
inspection used stable preview basenames, while the image-view layer can return
pixels cached by basename. Its page-level visual verdicts therefore must not be
carried into this build.

### Frozen evidence binding

| Evidence | SHA-256 |
|---|---|
| `manifest.json` | `d0657732c4b3bf9c6f3b21db21dcf721a50aad42a6cf81d6838c550218f790df` |
| `previews/visual-sample-manifest.json` | `0db48eb0d23318ce8624321eede82ef5b35dfd93c8dbdb67d91df3aec81fc002` |
| `attachments/frozen-build-record.json` | `c8249b4a0c7699889b5d8d2f5c706765b052103585f5effba196630557a70aa0` |
| `engineering/expanded-algorithm-narrative-spec.md` | `ab7681f6e4b48b2c64a4874966ed739fb614930352cd8165de4a65dbc6a71e2b` |

The bound source revision is
`2ca5ddabfed5f220812ea11f029eda03b21bc4c1`; `generatedAt` is
`2026-09-20T14:22:38.665Z`. The full manifest reports 44 algorithms and 551
pages. The sample manifest selects nine complete algorithm sequences and 67
images and requires A–K.

### Cache-safe inspection method and display behavior

All 67 selected PNGs were copied to a fresh temporary directory. Each copy used
the synthetic form `qa-<01..67>-<first12sha>.png`; no synthetic basename
contained an original sequence/stage filename or `sequence-*`. A separate
mapping associated each synthetic name with the original manifest filename,
expected full SHA-256, algorithm, page, and stage. Before viewing, every copied
file was hashed, and all 67 hashes exactly equaled their manifest SHA-256. Only
these synthetic-basename copies were inspected, at original detail; no verdict
below was made from a stable `previews/*` display path.

Two first displays appeared to omit their upper page region. Per the cache-safe
contract, each byte-identical file was copied again under a completely different
nonce basename and rechecked before judgment:

- `qa-59-1c38a975c9e3.png` maps to
  `sequence-configuration-migration-07-current-state.png` (page 65). Its first
  display omitted the running header and algorithm label. The identical bytes,
  SHA-256
  `1c38a975c9e300621ad7eb0aec2d18885738478c4a1d8a15bf8f5b5f46744c65`,
  displayed completely as `nonce-z9-e3c95b5f8c1a.png`.
- `qa-60-26fbdc334824.png` maps to
  `sequence-bounded-reconnect-01-context.png` (page 21). Its first display
  omitted the same upper region. The identical bytes, SHA-256
  `26fbdc3348246cc77f1f3e08ff4eb910ebb5a797fee4f455893808beecefaa18`,
  displayed completely as `nonce-k2-18aa875f4ebb.png`.

The complete second displays prove view/cache contamination rather than source
image defects; neither event is counted as a page failure. No other displayed
page appeared incomplete.

The sample manifest declares `794 × 1123` for every image. Direct PNG IHDR
inspection found 35 images at `794 × 1123` and 32 at `794 × 1124`; the exact
actual dimension is recorded per image below. Because the bytes and SHA-256
match the frozen manifest and the extra row produced no clipping or collision,
this is not an on-screen visual failure. It is, however, a manifest-metadata
integrity discrepancy that the author should reconcile before describing pixel
dimensions as exact.

### Verdict boundary and complete-sequence result

`PASS`, `RISK`, and `FAIL` in this section apply only to the final on-screen
display at original detail. Every page was checked for the running header;
algorithm/stage label; h2 and lead where applicable; main prose, code, table,
trace, or state ledger; bottom evidence links, footer, and page number; and
clipping, overflow, and overlap. Sequence continuity was then judged across the
complete page range. A check mark in the per-image ledger means that region was
present, readable on screen, and clear of collision; it does not mean physical
print legibility.

| Algorithm / sequence | Shape and stress | Pages / images | Manifest A–K | On-screen | Continuity |
|---|---|---:|---|---|---|
| A39 `stream-state-machine` | `stream_state_machine`; long source, late state, worked example | 75–82 / 8 | complete | PASS | Context → prerequisite model → example → source → transition → assurance → operation → current-state/transfer reads continuously. |
| A42 `permission-effect` | `permission_effect`; parallel authority, worked example | 73–80 / 8 | complete | PASS | Authority and effect boundaries remain connected from the reader question through the final ledger. |
| A17 `concurrency-merge` | `concurrency_merge`; completion-versus-commit order, worked example | 19–26 / 8 | complete | PASS | Completion/merge ordering carries through the example, code, state transition, assurance, operation, and transfer questions. |
| A23 `optimistic-edit` | `effect_commit_window`; counterexample, worked example | 102–109 / 8 | complete | PASS | The counterexample bridges to source and commit-window state, then to assurance, operation, and current-state limits. |
| A26 `durability-recovery` | `durability_recovery`; graph repair, long current state | 15–21 / 7 | complete | PASS | Recovery ownership advances from context and source through transition, assurance, aftermath, and the current-state ledger. |
| A41 `restricted-agent` | `capability_lifecycle`; ownership boundary, worked example | 57–64 / 8 | complete | PASS | Capability attenuation and filesystem-identity risk remain traceable through all stages and closing questions. |
| A32 `pure-mapping` | `pure_mapping`; compact layout, namespace collision | 5–9 / 5 | complete | PASS | The compact sequence preserves the code-to-prose bridge and closes with combined operation/current-state evidence. |
| A35 `configuration-migration` | `configuration_migration`; remote unknown, long headline | 59–65 / 7 | complete | PASS | Remote uncertainty remains distinct from observed local lifecycle and from recommendations through the final ledger. |
| A44 `bounded-reconnect` | `transport_recovery`; timer race, unknown server contract | 21–28 / 8 | complete | PASS | The timer-race example connects to code, retry transitions, assurance, aftermath, server-contract unknowns, and transfer questions. |

The manifest's A–K declarations are complete for all nine sequences, with
contiguous page indices matching each declared range. That establishes sample
coverage only; it is not visual or publication acceptance. The on-screen
sequence count is **9 PASS / 0 RISK / 0 FAIL**.

### Superseding per-image ledger

`RH+label` covers the running header and algorithm/stage label. `h2/lead` covers
the principal headline and lead where that page type supplies one. `main`
covers the applicable prose, code, trace, table, or ledger. `bottom` covers
evidence links, footer, and page number.

| Synthetic copy | Original manifest filename | Algorithm / page / stage | RH+label | h2/lead | main | bottom | Geometry | Actual px | Screen | Physical A4 |
|---|---|---|---|---|---|---|---|---:|---|---|
| `qa-01-6c2f1996c493.png` | `sequence-stream-state-machine-01-context.png` | A39 / 75 / context | ✓ | ✓ | ✓ | ✓ | no clip/overflow/overlap | 794×1123 | PASS | pending |
| `qa-02-2e7d926f4441.png` | `sequence-stream-state-machine-02-prerequisites.png` | A39 / 76 / prerequisites | ✓ | ✓ | ✓ | ✓ | no clip/overflow/overlap | 794×1124 | PASS | pending |
| `qa-03-2468b4beacb7.png` | `sequence-stream-state-machine-03-example.png` | A39 / 77 / example | ✓ | ✓ | ✓ | ✓ | no clip/overflow/overlap | 794×1123 | PASS | pending |
| `qa-04-0cf1f043f5f3.png` | `sequence-stream-state-machine-04-source.png` | A39 / 78 / source | ✓ | ✓ | ✓ | ✓ | no clip/overflow/overlap | 794×1124 | PASS | pending |
| `qa-05-fbb3491c9c76.png` | `sequence-stream-state-machine-05-transition.png` | A39 / 79 / transition | ✓ | ✓ | ✓ | ✓ | no clip/overflow/overlap | 794×1123 | PASS | pending |
| `qa-06-966efe029722.png` | `sequence-stream-state-machine-06-assurance.png` | A39 / 80 / assurance | ✓ | ✓ | ✓ | ✓ | no clip/overflow/overlap | 794×1124 | PASS | pending |
| `qa-07-e0738f9bcd98.png` | `sequence-stream-state-machine-07-operation.png` | A39 / 81 / operation | ✓ | ✓ | ✓ | ✓ | no clip/overflow/overlap | 794×1123 | PASS | pending |
| `qa-08-705274eb1b28.png` | `sequence-stream-state-machine-08-current-state.png` | A39 / 82 / current-state | ✓ | ✓ | ✓ | ✓ | no clip/overflow/overlap | 794×1124 | PASS | pending |
| `qa-09-15ae8f7aca11.png` | `sequence-permission-effect-01-context.png` | A42 / 73 / context | ✓ | ✓ | ✓ | ✓ | no clip/overflow/overlap | 794×1123 | PASS | pending |
| `qa-10-05b3843c7838.png` | `sequence-permission-effect-02-prerequisites.png` | A42 / 74 / prerequisites | ✓ | ✓ | ✓ | ✓ | no clip/overflow/overlap | 794×1124 | PASS | pending |
| `qa-11-962c99cd9e5d.png` | `sequence-permission-effect-03-example.png` | A42 / 75 / example | ✓ | ✓ | ✓ | ✓ | no clip/overflow/overlap | 794×1123 | PASS | pending |
| `qa-12-6cab85e8ae87.png` | `sequence-permission-effect-04-source.png` | A42 / 76 / source | ✓ | ✓ | ✓ | ✓ | no clip/overflow/overlap | 794×1124 | PASS | pending |
| `qa-13-bc359ebc764f.png` | `sequence-permission-effect-05-transition.png` | A42 / 77 / transition | ✓ | ✓ | ✓ | ✓ | no clip/overflow/overlap | 794×1123 | PASS | pending |
| `qa-14-2a5bec23feb5.png` | `sequence-permission-effect-06-assurance.png` | A42 / 78 / assurance | ✓ | ✓ | ✓ | ✓ | no clip/overflow/overlap | 794×1124 | PASS | pending |
| `qa-15-014a6fd54de0.png` | `sequence-permission-effect-07-operation.png` | A42 / 79 / operation | ✓ | ✓ | ✓ | ✓ | no clip/overflow/overlap | 794×1123 | PASS | pending |
| `qa-16-59a1866cf187.png` | `sequence-permission-effect-08-current-state.png` | A42 / 80 / current-state | ✓ | ✓ | ✓ | ✓ | no clip/overflow/overlap | 794×1124 | PASS | pending |
| `qa-17-d1352e83bc8b.png` | `sequence-concurrency-merge-01-context.png` | A17 / 19 / context | ✓ | ✓ | ✓ | ✓ | no clip/overflow/overlap | 794×1123 | PASS | pending |
| `qa-18-cd814dba6ff9.png` | `sequence-concurrency-merge-02-prerequisites.png` | A17 / 20 / prerequisites | ✓ | ✓ | ✓ | ✓ | no clip/overflow/overlap | 794×1124 | PASS | pending |
| `qa-19-aebb65152012.png` | `sequence-concurrency-merge-03-example.png` | A17 / 21 / example | ✓ | ✓ | ✓ | ✓ | no clip/overflow/overlap | 794×1123 | PASS | pending |
| `qa-20-91cbd01b9730.png` | `sequence-concurrency-merge-04-source.png` | A17 / 22 / source | ✓ | ✓ | ✓ | ✓ | no clip/overflow/overlap | 794×1124 | PASS | pending |
| `qa-21-b2cb68f1d041.png` | `sequence-concurrency-merge-05-transition.png` | A17 / 23 / transition | ✓ | ✓ | ✓ | ✓ | no clip/overflow/overlap | 794×1123 | PASS | pending |
| `qa-22-9296fb55771d.png` | `sequence-concurrency-merge-06-assurance.png` | A17 / 24 / assurance | ✓ | ✓ | ✓ | ✓ | no clip/overflow/overlap | 794×1124 | PASS | pending |
| `qa-23-ec543f313c6c.png` | `sequence-concurrency-merge-07-operation.png` | A17 / 25 / operation | ✓ | ✓ | ✓ | ✓ | no clip/overflow/overlap | 794×1123 | PASS | pending |
| `qa-24-c2c59663d72d.png` | `sequence-concurrency-merge-08-current-state.png` | A17 / 26 / current-state | ✓ | ✓ | ✓ | ✓ | no clip/overflow/overlap | 794×1124 | PASS | pending |
| `qa-25-9fe65d5bde81.png` | `sequence-optimistic-edit-01-context.png` | A23 / 102 / context | ✓ | ✓ | ✓ | ✓ | no clip/overflow/overlap | 794×1123 | PASS | pending |
| `qa-26-2fbd8d689501.png` | `sequence-optimistic-edit-02-prerequisites.png` | A23 / 103 / prerequisites | ✓ | ✓ | ✓ | ✓ | no clip/overflow/overlap | 794×1124 | PASS | pending |
| `qa-27-608219c404b3.png` | `sequence-optimistic-edit-03-example.png` | A23 / 104 / example | ✓ | ✓ | ✓ | ✓ | no clip/overflow/overlap | 794×1123 | PASS | pending |
| `qa-28-bd9aa2cd24e7.png` | `sequence-optimistic-edit-04-source.png` | A23 / 105 / source | ✓ | ✓ | ✓ | ✓ | no clip/overflow/overlap | 794×1124 | PASS | pending |
| `qa-29-4920f59b452f.png` | `sequence-optimistic-edit-05-transition.png` | A23 / 106 / transition | ✓ | ✓ | ✓ | ✓ | no clip/overflow/overlap | 794×1123 | PASS | pending |
| `qa-30-8e1a2d1de9fd.png` | `sequence-optimistic-edit-06-assurance.png` | A23 / 107 / assurance | ✓ | ✓ | ✓ | ✓ | no clip/overflow/overlap | 794×1124 | PASS | pending |
| `qa-31-e27d7e1814d8.png` | `sequence-optimistic-edit-07-operation.png` | A23 / 108 / operation | ✓ | ✓ | ✓ | ✓ | no clip/overflow/overlap | 794×1123 | PASS | pending |
| `qa-32-cd79e724b382.png` | `sequence-optimistic-edit-08-current-state.png` | A23 / 109 / current-state | ✓ | ✓ | ✓ | ✓ | no clip/overflow/overlap | 794×1124 | PASS | pending |
| `qa-33-597d617c2a19.png` | `sequence-durability-recovery-01-context.png` | A26 / 15 / context | ✓ | ✓ | ✓ | ✓ | no clip/overflow/overlap | 794×1123 | PASS | pending |
| `qa-34-abbbb3285676.png` | `sequence-durability-recovery-02-prerequisites.png` | A26 / 16 / prerequisites | ✓ | ✓ | ✓ | ✓ | no clip/overflow/overlap | 794×1124 | PASS | pending |
| `qa-35-ee090208eda3.png` | `sequence-durability-recovery-03-source.png` | A26 / 17 / source | ✓ | ✓ | ✓ | ✓ | no clip/overflow/overlap | 794×1123 | PASS | pending |
| `qa-36-c01c9dc8b8d0.png` | `sequence-durability-recovery-04-transition.png` | A26 / 18 / transition | ✓ | ✓ | ✓ | ✓ | no clip/overflow/overlap | 794×1124 | PASS | pending |
| `qa-37-ff5b6f2619a7.png` | `sequence-durability-recovery-05-assurance.png` | A26 / 19 / assurance | ✓ | ✓ | ✓ | ✓ | no clip/overflow/overlap | 794×1123 | PASS | pending |
| `qa-38-846aae0ee1af.png` | `sequence-durability-recovery-06-operation.png` | A26 / 20 / operation | ✓ | ✓ | ✓ | ✓ | no clip/overflow/overlap | 794×1124 | PASS | pending |
| `qa-39-b27989c7ed12.png` | `sequence-durability-recovery-07-current-state.png` | A26 / 21 / current-state | ✓ | ✓ | ✓ | ✓ | no clip/overflow/overlap | 794×1123 | PASS | pending |
| `qa-40-388fb427f5e3.png` | `sequence-restricted-agent-01-context.png` | A41 / 57 / context | ✓ | ✓ | ✓ | ✓ | no clip/overflow/overlap | 794×1124 | PASS | pending |
| `qa-41-06d88e41efd3.png` | `sequence-restricted-agent-02-prerequisites.png` | A41 / 58 / prerequisites | ✓ | ✓ | ✓ | ✓ | no clip/overflow/overlap | 794×1123 | PASS | pending |
| `qa-42-ba60b8210367.png` | `sequence-restricted-agent-03-example.png` | A41 / 59 / example | ✓ | ✓ | ✓ | ✓ | no clip/overflow/overlap | 794×1124 | PASS | pending |
| `qa-43-cb65543f842c.png` | `sequence-restricted-agent-04-source.png` | A41 / 60 / source | ✓ | ✓ | ✓ | ✓ | no clip/overflow/overlap | 794×1123 | PASS | pending |
| `qa-44-4caab6d246b5.png` | `sequence-restricted-agent-05-transition.png` | A41 / 61 / transition | ✓ | ✓ | ✓ | ✓ | no clip/overflow/overlap | 794×1124 | PASS | pending |
| `qa-45-dd50e2bfebfb.png` | `sequence-restricted-agent-06-assurance.png` | A41 / 62 / assurance | ✓ | ✓ | ✓ | ✓ | no clip/overflow/overlap | 794×1123 | PASS | pending |
| `qa-46-72d5049eea55.png` | `sequence-restricted-agent-07-operation.png` | A41 / 63 / operation | ✓ | ✓ | ✓ | ✓ | no clip/overflow/overlap | 794×1124 | PASS | pending |
| `qa-47-08d879f6399b.png` | `sequence-restricted-agent-08-current-state.png` | A41 / 64 / current-state | ✓ | ✓ | ✓ | ✓ | no clip/overflow/overlap | 794×1123 | PASS | pending |
| `qa-48-7058396afbc5.png` | `sequence-pure-mapping-01-context.png` | A32 / 5 / context | ✓ | ✓ | ✓ | ✓ | no clip/overflow/overlap | 794×1123 | PASS | pending |
| `qa-49-e1d9a2f5ab37.png` | `sequence-pure-mapping-02-source.png` | A32 / 6 / source | ✓ | ✓ | ✓ | ✓ | no clip/overflow/overlap | 794×1124 | PASS | pending |
| `qa-50-f425e1c0e33c.png` | `sequence-pure-mapping-03-transition.png` | A32 / 7 / transition | ✓ | ✓ | ✓ | ✓ | no clip/overflow/overlap | 794×1123 | PASS | pending |
| `qa-51-11553c22d264.png` | `sequence-pure-mapping-04-assurance.png` | A32 / 8 / assurance | ✓ | ✓ | ✓ | ✓ | no clip/overflow/overlap | 794×1124 | PASS | pending |
| `qa-52-fc26f7ef11b1.png` | `sequence-pure-mapping-05-operation-current-state.png` | A32 / 9 / operation-current-state | ✓ | ✓ | ✓ | ✓ | no clip/overflow/overlap | 794×1123 | PASS | pending |
| `qa-53-2899b2fe0244.png` | `sequence-configuration-migration-01-context.png` | A35 / 59 / context | ✓ | ✓ | ✓ | ✓ | no clip/overflow/overlap | 794×1124 | PASS | pending |
| `qa-54-ec3c4905800a.png` | `sequence-configuration-migration-02-prerequisites.png` | A35 / 60 / prerequisites | ✓ | ✓ | ✓ | ✓ | no clip/overflow/overlap | 794×1123 | PASS | pending |
| `qa-55-aa9feec8e224.png` | `sequence-configuration-migration-03-source.png` | A35 / 61 / source | ✓ | ✓ | ✓ | ✓ | no clip/overflow/overlap | 794×1124 | PASS | pending |
| `qa-56-d847d518187c.png` | `sequence-configuration-migration-04-transition.png` | A35 / 62 / transition | ✓ | ✓ | ✓ | ✓ | no clip/overflow/overlap | 794×1123 | PASS | pending |
| `qa-57-68424202ecd4.png` | `sequence-configuration-migration-05-assurance.png` | A35 / 63 / assurance | ✓ | ✓ | ✓ | ✓ | no clip/overflow/overlap | 794×1124 | PASS | pending |
| `qa-58-52159d7ee113.png` | `sequence-configuration-migration-06-operation.png` | A35 / 64 / operation | ✓ | ✓ | ✓ | ✓ | no clip/overflow/overlap | 794×1123 | PASS | pending |
| `qa-59-1c38a975c9e3.png` | `sequence-configuration-migration-07-current-state.png` | A35 / 65 / current-state | ✓ | ✓ | ✓ | ✓ | no clip/overflow/overlap | 794×1123 | PASS¹ | pending |
| `qa-60-26fbdc334824.png` | `sequence-bounded-reconnect-01-context.png` | A44 / 21 / context | ✓ | ✓ | ✓ | ✓ | no clip/overflow/overlap | 794×1123 | PASS¹ | pending |
| `qa-61-3df9119588c0.png` | `sequence-bounded-reconnect-02-prerequisites.png` | A44 / 22 / prerequisites | ✓ | ✓ | ✓ | ✓ | no clip/overflow/overlap | 794×1124 | PASS | pending |
| `qa-62-9d68e6ffdee3.png` | `sequence-bounded-reconnect-03-example.png` | A44 / 23 / example | ✓ | ✓ | ✓ | ✓ | no clip/overflow/overlap | 794×1123 | PASS | pending |
| `qa-63-11163840f139.png` | `sequence-bounded-reconnect-04-source.png` | A44 / 24 / source | ✓ | ✓ | ✓ | ✓ | no clip/overflow/overlap | 794×1124 | PASS | pending |
| `qa-64-411815d31c4a.png` | `sequence-bounded-reconnect-05-transition.png` | A44 / 25 / transition | ✓ | ✓ | ✓ | ✓ | no clip/overflow/overlap | 794×1123 | PASS | pending |
| `qa-65-03b23a72ee89.png` | `sequence-bounded-reconnect-06-assurance.png` | A44 / 26 / assurance | ✓ | ✓ | ✓ | ✓ | no clip/overflow/overlap | 794×1124 | PASS | pending |
| `qa-66-739f041a571d.png` | `sequence-bounded-reconnect-07-operation.png` | A44 / 27 / operation | ✓ | ✓ | ✓ | ✓ | no clip/overflow/overlap | 794×1123 | PASS | pending |
| `qa-67-a9cad7f8d26c.png` | `sequence-bounded-reconnect-08-current-state.png` | A44 / 28 / current-state | ✓ | ✓ | ✓ | ✓ | no clip/overflow/overlap | 794×1124 | PASS | pending |

¹ Final verdict comes from the byte-identical second nonce display described
above, not from the incomplete first display.

The superseding per-image on-screen count is **67 PASS / 0 RISK / 0 FAIL**.
Body text, code, small transition annotations, status labels, evidence links,
and page numbers were readable at original on-screen detail. `OBSERVED`,
conditional state, `UNKNOWN`, and recommendation/next-read language remained
distinct. In particular, A17 page 26 now places `UNKNOWN` and `NEXT READ` in
separate aligned rows, so the 13:43 failure is not present in this build.

### Physical-A4 and follow-up status

There is no actual physical-print evidence in this environment. Playwright
print media and original-detail PNG inspection are not physical print, so
physical-A4 status is **0 confirmed / 67 pending**. No claim is made about
unmagnified physical body/code legibility, print scaling, paper margins, or
printer-specific clipping.

No author correction cycle is required for **on-screen visual evidence**: no
genuine page defect remained after nonce-basename confirmation. The on-screen
portion of `visual_explanation` passes for this exact frozen build. Author
follow-up is still required to reconcile the 32 per-image height metadata
discrepancies, and `publication_integrity` remains open until that provenance
issue and physical-A4 evidence are resolved. Automated-check status does not
alter either boundary.

## Final provenance reconciliation — frozen build 2026-09-20T14:41:11.891Z

This addendum binds the existing cache-safe visual review to the final refrozen
build at source revision
`2ca5ddabfed5f220812ea11f029eda03b21bc4c1`. The builder SHA-256 is
`996e8eed8feef46c09f3a774d9ace4d17e1c167fe12905deffe7289f1d1c11ef`;
the final manifest, sample-manifest, and frozen-record SHA-256 values are
`880a7e7648d5659e41e1f427cd49d97aa0142ab6239e2a2f993284d62ae1d0e3`,
`e61c43f3c0b2b4d41fa5c512fcca19ae67d8a71cb150b6260e5329ba549a54ac`,
and `f7ce29526cd2c4c06d1ceabd89cfc97179a53f245a5338fa67503a7624f13967`.

The previously reviewed sample manifest, preserved at
`/tmp/visual-sample-manifest-20260920T142238665Z.json`, hashes to
`0db48eb0d23318ce8624321eede82ef5b35dfd93c8dbdb67d91df3aec81fc002`.
Filename-set and full-SHA comparison found **67/67 identical PNG byte hashes,
0 added, and 0 removed**. Sequence identity, page/stage mapping, and A–K
coverage are unchanged, so repeating the visual inspection would not add new
pixel evidence; the prior cache-safe per-image verdict applies to these exact
bytes.

The final manifest reports nine sequences, 67 images, 44 algorithms, 551 total
pages, and report page counts `36 / 73 / 119 / 126 / 103 / 94`. Its
`dimensionsSource` is now `validated PNG IHDR width and height in raster
pixels`. Direct IHDR and hash verification found 35 images at `794 × 1123`,
32 at `794 × 1124`, and zero dimension or hash mismatches. The former
32-image height-metadata discrepancy is therefore **reconciled and closed**.

The on-screen verdict remains **67 PASS / 0 RISK / 0 FAIL**, and no author
follow-up remains. Physical-A4 evidence remains **0 confirmed / 67 pending**;
`publication_integrity` remains open only on that physical-print boundary.
