# Claude Code Engineering Knowledge Study

이 판은 코드와 기술 항목을 나열하지 않고 각 핵심 주제를 **성립 조건 → 이론 렌즈 → 코드 구체화 → 실패 반례 → 설계 의미**로 설명한다. 실행 흐름은 pairing, race, settlement처럼 시간 순서 자체가 불변조건인 경우에만 사용한다.

## Reports

- [00-reading-code-as-engineering-knowledge.pdf](./00-reading-code-as-engineering-knowledge.pdf) — 코드를 엔지니어링 지식으로 읽는 법 (16쪽)
- [01-context-compiler-and-representation.pdf](./01-context-compiler-and-representation.pdf) — Context Compiler와 표현의 경제학 (19쪽)
- [02-effect-interpreter-and-safety.pdf](./02-effect-interpreter-and-safety.pdf) — Effect Interpreter와 안전한 코드 변경 (20쪽)
- [03-turn-semantics-recovery-and-durability.pdf](./03-turn-semantics-recovery-and-durability.pdf) — Turn Semantics, 복구, 내구성 (20쪽)
- [04-projections-repl-sdk-and-ui.pdf](./04-projections-repl-sdk-and-ui.pdf) — Projection, REPL, SDK, UI (17쪽)
- [05-structural-evolution-and-engineering-operation.pdf](./05-structural-evolution-and-engineering-operation.pdf) — 구조 진화와 엔지니어링 운영 (19쪽)

총 111쪽이다.

## Engineering and knowledge composition

- [Operation binding](./engineering/operation-binding.md)
- [Generated knowledge projection and bias ledger](./engineering/knowledge-projection.md)
- [Validation record](./engineering/validation.md)
- [Knowledge demand and gap register](./research/knowledge-demand.md)
- [Claim/source/limitation map](./research/claim-map.json)
- [External primary-source notes](./research/external-source-notes.md)
- [Generated evidence metrics](./metrics/evidence-metrics.json)
- [Generation manifest](./manifest.json)

저장소의 six-mode routing, artifact reuse resolution, progressive knowledge acquisition, knowledge projection/contextualization, repository bias control, architecture characteristic/tradeoff rubric, Engineering Operating Model, reference lifecycle, PDF information-design 지식을 우선 사용했다. 외부 조사는 이 reusable coverage가 남긴 기술 이론 gap에 한정했다.

이 디렉터리는 generated project-purpose projection이다. canonical `artifacts/knowledge/**`, `docs/reference/**`, Loop Architecture unit을 수정하거나 대체하지 않는다.

## Fixed source

- clone: `/Users/judangs/project/personal/orca/collab-mono/.collab/sources/stupidhumans/claude-code-source-code`
- upstream: https://github.com/stupidhumans/claude-code-source-code
- revision: `2ca5ddabfed5f220812ea11f029eda03b21bc4c1`
- measured: 1,884 TypeScript/TSX files, 512,664 physical lines

대상은 제3자 복원 저장소이며 incomplete build와 missing modules가 있다. 분석 중 대상 build/runtime은 실행하지 않았다.

## Reproduction

`build-study.mjs`는 서술과 PDF를 만들며, AST/lexical 계측은 이전 판에서 만든 범용 설정 기반 분석기를 재사용한다. 분석기에는 이 저장소 이름이나 분류가 하드코딩되어 있지 않다.

```sh
node build-study.mjs
```

## Validation

- fixed clone revision 확인
- claim map JSON과 source/local link 존재 및 source line anchor 범위 확인
- 65개 code link와 16개 local knowledge link 검증
- Chromium A4 rendering, 각 sheet 수직 overflow, PDF header와 object page count 확인
- cover 및 각 권 대표 본문 페이지 visual inspection

분포 수치는 설명 질문을 선택하기 위한 evidence이지 중요도, 결함 수, 품질 점수가 아니다.
