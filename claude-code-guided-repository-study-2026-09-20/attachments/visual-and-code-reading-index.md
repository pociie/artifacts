# Visual and code-reading index

PDF 안의 코드 패널·상태도·pipeline·비교표와 언어 메커니즘 카드, 소스 탐색 시작점을 권별로 빠르게 찾기 위한 첨부 색인이다.

## 01. 런타임 진입점과 대화 엔진

### Visual explanations

- async generator는 turn의 시간을 타입에 넣는다 — code
- AbortSignal은 취소 요청이지 자동 롤백이 아니다 — flow
- 루프보다 먼저 protocol state를 찾는다 — state
- retry와 fallback은 같은 요청의 반복이 아닐 수 있다 — compare

### Language/runtime cards

- async generator
- for await…of
- AbortController
- class private state
- structural typing
- dynamic import / adapter

### Source starts

- `src/entrypoints/cli.tsx` — 진입 함수와 import 경계
- `src/main.tsx` — mode 분기와 dependency 생성
- `src/QueryEngine.ts` — private fields와 submitMessage
- `src/query.ts` — async generator와 stop branch
- `src/query/tokenBudget.ts` — 검사 함수와 호출 시점
- `src/services/api/claude.ts` — request lowering과 stream adapter
- `src/utils/queryContext.ts` — ordered transformation
- `src/utils/abortController.ts` — signal 생성·결합

## 02. 컨텍스트, 메시지, 기억과 세션

### Visual explanations

- attachment는 부가 파일이 아니라 context의 typed source다 — flow
- discriminated union이 가능한 상태를 제한한다 — code
- compact는 요약 기능이 아니라 lossy state migration이다 — compare
- resume는 저장 파일을 읽는 일이 아니라 일관된 과거를 만드는 일이다 — flow

### Language/runtime cards

- discriminated union
- normalization
- tagged persistence record
- lazy projection
- memoization/cache
- lossy compaction

### Source starts

- `src/utils/processUserInput/processUserInput.ts` — 입력 종류 판별
- `src/utils/processUserInput/processSlashCommand.tsx` — command lookup/dispatch
- `src/utils/messages.ts` — message/attachment switch
- `src/utils/queryContext.ts` — API projection
- `src/memdir/findRelevantMemories.ts` — 관련성 선택
- `src/services/compact/compact.ts` — 요약 입력과 boundary
- `src/services/compact/microCompact.ts` — tool result 축소
- `src/utils/sessionStorage.ts` — append/load/version

## 03. 도구 시스템과 코드를 바꾸는 메커니즘

### Visual explanations

- Tool 타입은 실행 가능한 capability descriptor다 — code
- buildTool은 런타임 기본값과 정적 추론을 합친다 — code
- 실행 전 단계의 순서는 보안 의미를 갖는다 — flow
- 동시성 안전성은 도구 이름이 아니라 구체 입력의 속성이다 — state
- Edit는 read-before-write를 낙관적 잠금으로 사용한다 — flow
- critical window 안의 await 하나가 TOCTOU를 다시 연다 — code

### Language/runtime cards

- generic factory
- runtime schema
- async iterator composition
- input-dependent concurrency
- optimistic concurrency
- event-loop critical window

### Source starts

- `src/Tool.ts` — Tool/ToolDef/BuiltTool
- `src/tools.ts` — tool pool assembly
- `src/services/tools/toolExecution.ts` — processedInput pipeline
- `src/services/tools/toolOrchestration.ts` — partitionToolCalls
- `src/tools/FileReadTool/FileReadTool.ts` — readFileState update
- `src/tools/FileEditTool/FileEditTool.ts` — stale check/patch/write
- `src/tools/BashTool/bashSecurity.ts` — parse와 unknown 처리
- `src/tools/GrepTool/GrepTool.ts` — narrow schema/result

## 04. 권한, 보안과 효과 통제

### Visual explanations

- deny, ask, allow는 위험 점수의 세 구간이 아니다 — code
- 규칙 출처의 precedence가 조직 정책을 실제로 만든다 — flow
- TOCTOU는 permission과 effect 사이에도 존재한다 — flow
- sandbox는 authority가 아니라 containment다 — compare

### Language/runtime cards

- immutable context snapshot
- pattern matcher
- result algebra
- reference monitor
- sandbox adapter
- TOCTOU identity

### Source starts

- `src/types/permissions.ts` — context/result variants
- `src/utils/permissions/permissions.ts` — precedence와 matcher
- `src/utils/permissions/filesystem.ts` — path/root 판정
- `src/tools/BashTool/bashPermissions.ts` — prefix rule 추출
- `src/tools/BashTool/bashSecurity.ts` — parser fallback
- `src/utils/sandbox/sandbox-adapter.ts` — platform adapter
- `src/hooks` — permission-related hook
- `src/services/remoteManagedSettings/index.ts` — poll/cache/apply

## 05. REPL, SDK, 확장과 에이전트 기능

### Visual explanations

- React render는 effect execution과 분리되어야 한다 — flow
- Context provider는 dependency injection이면서 rerender boundary다 — state
- SDK message는 내부 event의 공개 projection이다 — flow
- MCP adapter는 외부 capability를 Tool 언어로 번역한다 — flow
- AgentTool은 새 conversation engine을 여는 도구다 — state

### Language/runtime cards

- React render/commit
- context provider
- async iterator protocol
- runtime validation schema
- adapter normalization
- child runtime isolation

### Source starts

- `src/screens/REPL.tsx` — state/effect/provider wiring
- `src/components/PromptInput/PromptInput.tsx` — input mode/key handler
- `src/context` — provider value와 command
- `src/entrypoints/sdk/coreSchemas.ts` — public event union
- `src/entrypoints/sdk/controlSchemas.ts` — request/response id
- `src/services/mcp/normalization.ts` — name/schema/result mapping
- `src/services/plugins/PluginInstallationManager.ts` — install/update lifecycle
- `src/tools/AgentTool/runAgent.ts` — child config/result

## 06. 빌드, 구성, 운영과 복원 저장소 읽기

### Visual explanations

- feature()는 runtime if가 아니라 build-time variability다 — code
- prepare와 build script는 서로 다른 복원 전략을 보인다 — compare
- feature flag 이름보다 evaluation site를 읽는다 — flow
- analytics pipeline은 event 생산과 sink를 분리한다 — flow
- 큰 파일은 책임 분포를 찾는 지도이지 자동 분해 명령이 아니다 — compare

### Language/runtime cards

- compile-time intrinsic
- dead-code elimination
- ESM module graph
- configuration precedence
- idempotent migration
- batched telemetry exporter

### Source starts

- `README_KR.md` — 출처/누락/통계
- `scripts/prepare-src.mjs` — in-place transform
- `scripts/build.mjs` — copy/transform/stub
- `stubs/bun-bundle.ts` — feature fallback
- `src/utils/settings` — merge/source metadata
- `src/migrations` — version transform
- `src/services/analytics/metadata.ts` — 공통 metadata
- `docs/ko` — symbol-led claims
