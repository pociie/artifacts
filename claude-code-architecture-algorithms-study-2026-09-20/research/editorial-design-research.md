# Editorial design research and applied decisions

This note records the external design and language references used for the
Architecture & Algorithms Edition. It is implementation provenance, not report
content or acceptance authority.

## Research findings

1. Technical paragraphs should answer what the reader must understand, why it
   matters, and how the claim can be used or verified. A succession of
   one-sentence paragraphs usually indicates a broken explanation structure.
   Source: [Google Technical Writing — Paragraphs](https://developers.google.com/tech-writing/one/paragraphs).
2. Lists and tables need an introductory sentence that establishes what the
   reader is comparing. Ordered lists are reserved for order-dependent steps;
   cells and list items should stay logically parallel.
   Source: [Google Technical Writing — Lists and tables](https://developers.google.com/tech-writing/one/lists-and-tables).
3. Worked examples are especially useful for readers who do not yet have a
   stable schema for a problem. Process-oriented examples should show the
   decisions and intermediate state, not only the final answer. They should
   avoid forcing the reader to mentally integrate distant, redundant sources.
   Source: [Cognitive Architecture and Instructional Design: 20 Years Later](https://doi.org/10.1007/s10648-019-09465-5).
4. Meaningful segmentation improves learning when a long mechanism is divided
   into coherent, reader-paced units. Segments must still preserve the causal
   relation between earlier and later state.
   Source: [A Meta-analysis of the Segmenting Effect](https://doi.org/10.1007/S10648-018-9456-4).
5. Signaling is useful when the same visual cue identifies corresponding parts
   of text and a diagram or code example. Color should indicate a stable
   semantic role, not merely decorate a card.
   Source: [Signaling text-picture relations in multimedia learning](https://doi.org/10.1016/j.edurev.2015.12.003).
6. Tables are appropriate for genuine two-dimensional relationships and need
   explicit headers. They should not be used as a general page-layout device.
   Source: [W3C WAI Tables Tutorial](https://www.w3.org/WAI/tutorials/tables/).
7. For generators, `yield`, `return`, and `throw` are distinct completion
   paths. `IteratorResult` uses `done` to distinguish yielded and returned
   values, while async iterator operations return promises. `yield*` delegates
   intermediate iteration and receives the delegated return value.
   Sources: [ECMAScript GeneratorYield](https://tc39.es/ecma262/2025/multipage/control-abstraction-objects.html),
   [MDN yield](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/yield),
   [TypeScript stricter generators](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-6.html).
8. The linked video/article provides a useful beginner intuition—one resumable
   function can stream events to a consumer—but its simplified language needs
   to be reconciled with the exact snapshot's iterator return channel,
   `yield*`, state object, abort behavior, and surface consumers.
   Source: [Claude Code async-generator analysis](https://productengineer.info/community/articles/ko/claude-code-async-generator).
9. The React/Ink video/article is useful as an example of how to begin from a
   decisive code path and expose the framework mechanism underneath it. Its
   layer diagram and simplified `setState` narrative are not treated as this
   report's architecture truth. The fixed snapshot is checked for external
   store subscription, render snapshots, synchronous refs, event coalescing,
   input propagation, and application orchestration before a conclusion is
   written.
   Sources: [video](https://www.youtube.com/watch?v=W83jWFwEnTU&t=61s),
   [companion analysis](https://productengineer.info/community/articles/ko/claude-code-react-app),
   [React `useSyncExternalStore`](https://react.dev/reference/react/useSyncExternalStore),
   [React state update queue](https://react.dev/learn/queueing-a-series-of-state-updates),
   [Ink repository and `useInput` reference](https://github.com/vadimdemedes/ink).

## How the videos are admitted

The videos are explanatory references, not the organizing source or the
evidence authority for the six volumes. Their useful contribution is a reading
move: select a decisive implementation, explain the language or runtime
mechanism hidden by concise syntax, identify the responsibility assigned to
that mechanism in this repository, and test the explanation against an
invariant and a failure case. The same move is applied to turn execution,
permission, file effects, persistence, agent lifecycle, and product
variability. A video claim that conflicts with the pinned source is retained
only as a misconception or comparison point.

## Applied report architecture

- Six volumes remain because they follow repository responsibilities, not
  because every volume must repeat the same chapter template.
- A chapter opening presents the argument path and source starting points. It
  is navigation for a causal explanation, not a table of keywords.
- Algorithm subjects use four connected movements:
  1. why the problem exists and where the decisive source transition occurs;
  2. precondition, working state, ordered transition, and postcondition;
  3. invariant argument, counterexample/failure boundary, current decision,
     and separately marked improvement;
  4. theory terms reconnected to one of the algorithm's invariants and a
     falsifying scenario.
- A language mechanism may use as many pages as the concept requires. The
  `yield` study uses concept correction, comparison, three worked examples,
  actual `query()` delegation, REPL consumption, and guarantee boundaries.
- Exact source excerpts and their explanation stay on the same page whenever
  possible. An explicit omission line replaces silent clipping.
- Tables have a prose introduction and a prose conclusion. Tables compress
  exact relationships; they do not substitute for explanation.
- Accent colors identify the active repository domain consistently across
  prose, source evidence, and transition labels. They are not independent card
  categories.
- Observed implementation, inference, recommendation, and unknown remain
  visually and verbally distinct.
