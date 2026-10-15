# Validation

## Source and scope

- target repository: `https://github.com/stupidhumans/claude-code-source-code`
- fixed revision: `2ca5ddabfed5f220812ea11f029eda03b21bc4c1`
- target clone remained clean after analysis
- target build was not run because the repository documents missing
  feature-gated modules and build-time Bun intrinsics

## Generated set

- six PDFs
- 25 pages per volume, 150 pages total
- 28 source-connected code, state, flow, or comparison visual pages
- 36 language/runtime mechanism cards and 48 source-reading index entries
- 225 source references checked for path existence and line-range bounds
- 1,884 TS/TSX files and 512,664 physical lines measured with the existing
  generic, configuration-driven TypeScript architecture analyzer

## Rendering checks

- Chromium A4 rendering with print backgrounds
- all 150 `.sheet` elements checked for horizontal and vertical overflow
- each PDF checked for the `%PDF-` header
- rendered PDF page-object count checked against the expected 25 pages
- cover, annotated code/diagram, mechanism-card, and source-index pages visually
  inspected across the six volume styles
- Korean glyphs, source links, footer references, code typography, and margins
  were visible without clipping in the inspected pages

## Content checks

- no Loop Architecture, routing, operation-binding, or report-generation
  instructions appear in PDF content
- the six classifications follow repository responsibility areas rather than
  analysis methods or generic technology themes
- repository-authored `docs/ko/**` claims are treated as study inputs and are
  not promoted to verified upstream intent or production activation
- videos are used inside the REPL/SDK/runtime explanation rather than as
  independent organizing axes
- source observations, bounded engineering interpretations, and unknowns are
  separated wherever the reconstruction boundary matters

## Known limitations

- external links were syntax-checked but not all network-fetched during the
  final render
- this validation does not claim the reconstructed source can build or behave
  identically to Anthropic's unpublished source tree
- page-count inspection uses PDF page objects emitted by Chromium; the local
  environment did not provide `pdfinfo` or `pdftotext`
