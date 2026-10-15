# Claude Code Source Code 프로젝트 분석

## 분석 기준

이 문서는 별도 읽기 전용 작업공간
`/Users/judangs/project/personal/orca/claude-code-source-code-analysis`의 고정된
Git revision `2ca5ddabfed5f220812ea11f029eda03b21bc4c1`과 tree
`1b6b4ab07d0d7b795129852183137c28099c5550`을 기준으로 한다. 분석 대상은
공개 저장소의 복구된 소스 스냅샷이며, Anthropic의 공식 설계 문서나 완전한 제품
소스라고 가정하지 않는다.

저장소 안의 한국어 선행 분석 5개는 탐색 지도로만 사용했다. 제품 의도, 향후
기능, 비공개 구현에 관한 서술은 현재 소스에서 다시 확인되지 않는 한
`repository-authored` 상태로 남겼다. 정확한 목록과 digest는
`prior-analysis-index.json`에 있다.

## 한 문장 구조

이 스냅샷은 “사용자 입력을 모델 스트림으로 전환하고, 모델이 제안한 tool use를
권한·hook·동시성 정책 아래 실행한 뒤, 결과를 transcript와 다음 turn으로 되먹임하는
상태 기계”를 중심으로 CLI/UI, 세션 복구, 확장 시스템, 원격 transport가 결합된
대형 TypeScript 애플리케이션이다.

## 결정적인 실행 흐름

1. `src/query.ts`의 generator 기반 turn loop가 메시지, turn 수, compaction,
   tool 결과, 중단·오류 상태를 보유한다.
2. `src/claude.ts`가 provider 스트림을 정규화하고 content block, usage, 종료 이유를
   내부 이벤트로 투영한다.
3. `src/services/tools/toolExecution.ts`와 `toolOrchestration.ts`가 schema, hook,
   permission, 직렬·병렬 정책을 거쳐 효과를 실행한다.
4. tool 결과는 누락 없이 `tool_result`로 닫혀 transcript와 다음 model turn으로
   다시 들어가야 한다.
5. `src/utils/sessionStorage.ts`, `src/resume.ts`, `src/services/compact/**`가 append,
   parent chain 복구, compaction과 resume repair를 담당한다.

이 흐름에서 중요한 것은 개별 함수보다 경계 불변식이다. tool proposal과 결과의
짝, 실패한 fallback 결과의 폐기, abort 시 미완료 tool result의 합성, bounded retry,
append 후 복구 가능한 parent topology가 시스템의 일관성을 지탱한다.

## 우선 이해할 알고리즘

`algorithm-catalog.json`은 12개 알고리즘을 trigger, state, transition, invariant,
failure/recovery, 표현 방식, source line으로 나눈다. 학습과 문서화 순서는 다음이
효율적이다.

| 우선순위 | 알고리즘 | 이해해야 할 핵심 |
|---|---|---|
| 1 | Turn loop | 계속/종료 상태, turn budget, tool 결과 재주입 |
| 2 | Effect interpreter | hook·permission·execution의 순서와 권한 경계 |
| 3 | Stream reducer | provider event가 내부 메시지로 수렴하는 규칙 |
| 4 | Transcript append/resume | append-only 기록과 parent-linked 복구의 왕복 불변식 |
| 5 | Tool scheduler | 직렬 요구 tool과 bounded 병렬 실행의 충돌 방지 |
| 6 | Compaction migration | token pressure에서 보존할 정보와 retry 한계 |
| 7 | File edit commit | stale-file 방지와 atomic write fallback |
| 8 | Remote reconnect | backoff, reconnect, 종료 조건 |

문서 표현은 긴 함수 설명보다 상태 전이표, sequence diagram, terminal-reason matrix,
failure/recovery table이 적합하다. 특히 turn loop와 resume는 정상 경로만 그리면 핵심
동작을 놓치므로 abort, partial stream, orphan tool use, context overflow를 같이
표현해야 한다.

## 코드와 모듈 구조

정적 분석 대상은 TS/TSX 구현 파일 1,884개다. 파일 import occurrence 13,219개 중
8,626개(65.25%)가 top-level group을 넘는다. type-inclusive graph에서는 1,436개
파일이 순환 SCC에 포함되고 최대 SCC가 1,433개이며, type-only edge를 제외한
runtime-like 휴리스틱에서도 633개 파일, 최대 591개 파일의 순환 SCC가 관찰된다.
top-level group graph는 36개 중 35개가 한 SCC에 들어간다.

이 수치는 “코드가 잘못됐다”는 판정이 아니라 다음 작업 방식의 근거다.

- 디렉터리 이동을 먼저 하면 blast radius를 예측하기 어렵다.
- `utils`는 564개 파일이며 components, tools, services, commands에서 집중적으로
  참조된다. 하나의 응집된 모듈로 취급하면 안 된다.
- root composition, context object, UI presenter와 effect runtime이 넓게 얽혀 있어
  package 추출 전에 contract와 관찰 가능한 동작을 고정해야 한다.
- 617개의 unresolved internal import occurrence는 누락된 feature-gated source,
  resolver 한계, 생성 모듈 가능성을 함께 포함하므로 곧바로 결함 수로 해석하면 안
  된다.

현재 이해를 위한 의미 모듈 후보는 8개다: composition-routing, turn-engine,
effect-runtime, built-in-effects-and-presenters, session-recovery, extension-runtime,
surface-adapters, platform-adapters. 이는 현행 package 경계나 공식 bounded context가
아니라 책임 기반 분석 가설이다. 정확한 경로와 위험은
`semantic-module-candidates.json`에 있다.

## 모듈화 방향

안전한 순서는 “이동”보다 “관찰과 계약”이 먼저다.

1. turn, tool, transcript, resume의 정상·실패 결과를 characterization fixture로
   고정한다.
2. 순수 codec, pairing repair, scheduling policy, compaction decision을 I/O에서
   분리한다.
3. filesystem, provider, process, UI를 port 뒤의 adapter로 밀어낸다.
4. 한 번에 한 concrete dependency를 역전하고 compatibility facade를 유지한다.
5. surface 또는 extension 하나를 vertical slice로 이동한다.
6. differential trace가 같음을 확인한 뒤 barrel과 shim을 제거한다.

첫 추출 후보는 import 수가 적다는 이유가 아니라 입력·출력·실패 상태를 완전히
기술할 수 있는 leaf policy여야 한다. 반대로 `query.ts`, `utils`, root composition을
처음부터 package로 분리하는 것은 높은 위험을 가진다.

## 프로젝트 관리와 검증

이 저장소 스냅샷에서는 관례적 test/spec 파일을 확인하지 못했다. 따라서 구조 변경의
첫 산출물은 리팩터링 PR이 아니라 재현 가능한 fixture와 evidence ledger가 되어야
한다. 권장 work item 단위는 다음과 같다.

- 하나의 관찰 가능한 contract 또는 불변식
- 정확한 source revision과 evidence line
- success와 failure fixture
- 소유 모듈과 소비 모듈
- 허용된 변경 경계와 non-goal
- package-scoped check, differential trace, wider fitness의 순서
- rollback 또는 compatibility 기간

주요 claim은 `source-observed`, `repository-authored`, `bounded-inference`, `unknown`으로
분리하고, 상태는 `pending`, `observed`, `corroborated`, `candidate`, `rejected`,
`superseded`로 관리한다. 코드 변경과 문서 변경이 같은 revision/digest를 가리키지
않으면 한쪽을 최신으로 간주하지 않는다.

## 현재 결론과 보류

현재 가장 강한 결론은 turn engine, effect runtime, stream normalization,
session recovery가 시스템의 결정적 축이라는 점과, 현행 directory graph가 큰
상호의존 덩어리라는 점이다. 반면 공식 모듈 소유권, 전체 production feature set,
runtime hot path, 실제 장애율, safe extraction order는 이 스냅샷만으로 확정할 수
없다.

따라서 이 분석은 구현·리팩터링·출판의 승인 문서가 아니다. `continuation-roadmap.md`
는 다음 조사와 실험 후보를 제시할 뿐이며, 각 단계는 별도 실행 계약과 독립 검증을
받아야 한다.

