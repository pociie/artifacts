# Repository-led six-volume classification

The classification was derived from the fixed source tree and the change
responsibilities visible in its primary owners.

| Volume | Primary owners | Why this is a report boundary |
| --- | --- | --- |
| 01 Runtime and conversation engine | `entrypoints`, `main.tsx`, `QueryEngine.ts`, `query.ts`, `services/api` | process composition, session lifetime, turn protocol, and provider normalization |
| 02 Context, messages, memory, session | `processUserInput`, `messages.ts`, `memdir`, `compact`, `sessionStorage` | creation and durable reconstruction of the model-visible world |
| 03 Tool system and code-changing tools | `Tool.ts`, `tools.ts`, `services/tools`, concrete tools | translation of structured model proposals into validated effects and observations |
| 04 Permission, security, effect control | `utils/permissions`, Bash security, sandbox, policy and managed settings | authority, target identity, isolation, and safety controls around effects |
| 05 REPL, SDK, extensions, agents | `screens`, `components`, `entrypoints/sdk`, MCP, plugins, skills, AgentTool/tasks, remote | human/host projections and extension adapters around the core runtime |
| 06 Build, configuration, operations, reconstruction | root scripts/stubs, feature gates, migrations, analytics, repository reports | build-time variability, configuration evolution, operational observation, and evidence limitations |

The target repository's five Korean reports use a symbol-led discovery method:
start from a distinctive endpoint, flag, codename, or prompt marker; follow its
definition and call sites; then assemble a topical claim. The generated study
set retains that useful tracing technique but does not let novelty-driven topics
replace the runtime-responsibility map. Strong roadmap and activation claims are
kept as repository-authored interpretations unless the fixed source directly
establishes them.
