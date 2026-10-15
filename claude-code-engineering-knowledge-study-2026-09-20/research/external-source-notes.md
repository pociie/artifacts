# External primary-source notes

Observed 2026-09-20. These sources fill named gaps after local reusable
knowledge selection; they are not a free-standing bibliography.

| Source | Used for | Material limitation in this study |
| --- | --- | --- |
| [Anthropic prompt caching](https://platform.claude.com/docs/en/build-with-claude/prompt-caching) | tools → system → messages prefix hierarchy, cache-breakpoint and ordering sensitivity | current provider behavior; does not prove this clone's production hit rate |
| [ECMAScript AsyncGenerator Objects](https://tc39.es/ecma262/multipage/control-abstraction-objects.html#sec-asyncgenerator-objects) | suspended/executing/completed states, queued `next`/`return`/`throw` requests | language semantics do not supply durable workflow, effect cancellation, or bounded buffering |
| [Node.js AbortController](https://nodejs.org/api/globals.html#class-abortcontroller) | one-shot cooperative cancellation signal | individual APIs choose whether and how to honor it |
| [WHATWG Streams](https://streams.spec.whatwg.org/) | producer/consumer queues, cancellation, backpressure and high-water marks | query uses async generators and provider adapters, not necessarily WHATWG streams end to end |
| [React render and commit](https://react.dev/learn/render-and-commit) | projection calculation versus committed UI update | browser-oriented teaching model; Ink has terminal-specific lifecycle constraints |
| [Ink owner repository](https://github.com/vadimdemedes/ink) | React-based terminal rendering, TTY and alternate-screen constraints | current upstream Ink may differ from the embedded reconstructed implementation |
| [JSON Schema 2020-12](https://json-schema.org/draft/2020-12) | structural validation vocabulary and the separation of syntax from application semantics | target uses Zod-style schemas; standards are conceptual comparison, not implementation identity |
| [MCP server primitives](https://modelcontextprotocol.io/specification/2025-06-18/server) | distinction among user-controlled prompts, application-controlled resources and model-controlled tools | protocol control category does not grant local authority or trust |
| [NIST SP 800-207](https://csrc.nist.gov/pubs/sp/800/207/final) | per-request policy enforcement, least privilege and shrinking implicit trust | enterprise zero-trust architecture is not the target product architecture |
| [Kung & Robinson, optimistic concurrency control](https://db.cs.cmu.edu/papers/1981/kung-tods1981.pdf) | read/compute/validate/write shape without a long-held lock | FileEdit is not a serializable database transaction |
| [CWE-367 TOCTOU](https://cwe.mitre.org/data/definitions/367.html) | resource property changing between check and use | identifies a weakness class, not proof that every async gap is exploitable |
| [Garcia-Molina & Salem, Sagas](https://www.cs.princeton.edu/techreports/1987/070.pdf) | long-lived work split into steps and compensation after partial completion | query/tool recovery is not the original database saga protocol |
| [OWASP OS Command Injection Defense](https://cheatsheetseries.owasp.org/cheatsheets/OS_Command_Injection_Defense_Cheat_Sheet.html) | command/data separation, allowlisting, least privilege and defense in depth | guidance cannot prove completeness of the target shell parser/policy |
| [LLVM IR](https://llvm.org/docs/LangRef.html) and [MLIR](https://mlir.llvm.org/docs/LangRef/) | common intermediate representation and analyzable/lowerable transformations | context assembly lacks the full formal semantics of these compiler IRs |
| [W3C PROV-O](https://www.w3.org/TR/prov-o/) | entities, activities, derivation, responsibility and invalidation lineage | provenance supports assessment but does not establish truth or authority |
| [SEI FODA](https://www.sei.cmu.edu/library/feature-oriented-domain-analysis-foda-feasibility-study/) | commonality/variability and feature constraints across product variants | the clone provides no complete feature model or build configuration space |
| [SEI QAW](https://www.sei.cmu.edu/library/quality-attribute-workshops-qaws-third-edition/) | source–stimulus–environment–artifact–response–measure scenarios | this report does not run a stakeholder workshop or select acceptance thresholds |

