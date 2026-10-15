# Claude Code 시스템 해부 — 한국어 독자판

고정 복원 소스를 한 권의 자연 흐름 IT 서적으로 재편집한 별도 edition이다. 기존 6권 PDF와 부모 evidence 파일은 변경하지 않는다.

## 출력

- [PDF](./claude-code-system-anatomy-reader-edition-ko.pdf) — 103쪽, SHA-256 `ec8ec57ce6363f396d8b34f6387b38df18f385e0675d351393aa675310dd79c7`
- [HTML](./html/claude-code-system-anatomy-reader-edition-ko.html) — linked TOC와 source/algorithm/glossary anchor 포함
- [manifest](./manifest.json) — source, parent, content, research, requirement, PDF/HTML/preview digest binding
- [visual sample manifest](./previews/visual-sample-manifest.json) — 11개 대표 PNG
- [validation](./engineering/validation.md)
- [independent review request](./engineering/visual-review-request.md)
- [research method](./research/codebase-study-methods.md)
- [requirement reconciliation](./engineering/requirement-reconciliation.md)

## 재생성

```sh
node --check build-book.mjs
node build-book.mjs
```

## 읽기 경계

OBSERVED / INFERENCE / RECOMMENDATION / UNKNOWN을 분리한다. upstream intent, production activation, server protocol, telemetry backend, external effect settlement는 고정 evidence를 넘어서 단정하지 않는다. 독립 시각 검토와 physical A4 인쇄 확인은 아직 PENDING이다.

## 보존된 baseline PDF

- `../01-source-truth-and-system-baseline.pdf` — `c83309f4e04274a09a57e350a66828aa1060e6ff5a8735ff96862efcd92b2d65`
- `../02-runtime-surfaces-and-state-ownership.pdf` — `602bc13234eb5430276b93c3ad4f7a06a6363a3055010ebb0ce7d421f6344b10`
- `../03-turn-context-and-streaming-protocol.pdf` — `11849c3758feb9c93ab47de5c4b8a8a7d9d1482b4fc82773a0b76cf6138c1710`
- `../04-tool-effect-permission-and-change-algorithms.pdf` — `e7acf927f6e2a4f81b3447d6a1da26b9353ae967ebe26241b7de88550a3477eb`
- `../05-durability-recovery-and-agent-lifecycle.pdf` — `c39b499035d27edc5fbe1415c1a31bd0d1cbba947ca7f0900fe36ad1bfa56d92`
- `../06-extension-variability-operations-and-evolution.pdf` — `aee56833347ede082acffb572d7919073241b1f157662c094362f7bad7d661d3`
