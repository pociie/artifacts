# Project Analysis Operating Model

## 목적

이 operating model은 복구된 대형 source snapshot을 “읽었다”는 인상 대신, 재현 가능한
관찰·가설·검증 단위로 관리하기 위한 방법이다. 이는 분석 운영 제안이며 저장소의 공식
governance나 acceptance authority가 아니다.

## Artifact 흐름

| 단계 | 입력 | 산출물 | 완료 조건 |
|---|---|---|---|
| 1. Source freeze | remote URL, commit | `source-state.json` | commit/tree/clean state 확인 |
| 2. Prior-work intake | 기존 문서 | `prior-analysis-index.json` | digest와 claim disposition 기록 |
| 3. Mechanical map | 고정 source | `module-topology.json` | analyzer 재실행과 JSON parse 성공 |
| 4. Semantic study | source line | `algorithm-catalog.json` | trigger/state/failure/evidence 완비 |
| 5. Boundary hypothesis | topology + flow | `semantic-module-candidates.json` | 책임·의존·추출 위험 명시 |
| 6. Synthesis | 위 산출물 | `PROJECT-ANALYSIS.md` | 관찰과 추론 분리 |
| 7. Independent check | frozen bundle | contribution report | digest-bound pass/fail/hold |

선행 문서는 source 탐색을 줄이는 데 쓰되 주장 권위를 상속하지 않는다. source revision이
바뀌면 기존 분석을 수정하는 대신 successor run에서 invalidation 여부를 판정한다.

## Work item 계약

각 분석 또는 개선 item은 다음을 가져야 한다.

- 정확한 objective와 결과물 consumer
- source commit/tree와 bounded path
- 관찰할 behavior 또는 invariant
- non-goal과 금지된 side effect
- evidence class와 lifecycle state
- targeted check와 wider check의 순서
- material-change signal과 stop condition
- owner, reviewer, integration owner의 구분

동일 파일을 여러 writer가 동시에 고치지 않는다. 병렬 작업은 알고리즘 조사,
topology 측정, 운영 모델 평가처럼 결과 경계가 분리될 때만 사용하며, fan-in 문서는
coordinator 한 명이 source digest를 확인한 후 합성한다.

## 모듈화 change 관리

모듈화 item은 디렉터리 이름이 아니라 contract seam을 대상으로 한다.

1. 기존 behavior의 input/output/failure fixture를 만든다.
2. 현재 호출자와 concrete dependency를 기록한다.
3. pure policy 또는 codec을 먼저 분리한다.
4. compatibility facade 뒤에서 구현을 교체한다.
5. trace, transcript, tool-result closure를 differential 비교한다.
6. 소비자가 새 경계를 사용한 뒤에만 old surface를 제거한다.

큰 SCC나 높은 fan-in은 우선순위 신호일 뿐 acceptance criterion이 아니다. cycle 감소가
동작 보존보다 우선하면 안 된다.

## 검증 계층

1. **Shape:** JSON/schema/link/source-ref 존재 여부.
2. **Static:** TypeScript, import resolver, package-scoped build.
3. **Contract:** stream reduction, tool pairing, scheduler, transcript round trip fixture.
4. **Differential:** 변경 전후 event/terminal-reason/transcript 비교.
5. **System:** repository-wide fitness와 실제 CLI smoke.

현 snapshot에는 관례적 테스트 corpus가 관찰되지 않았으므로 Contract와 Differential
계층을 먼저 구축하는 것이 필요하다. repository-wide command가 실패하면 candidate
관련, 기존/무관, 환경/도구, unresolved로 귀속하고 raw 실패 자체를 candidate 판정으로
대체하지 않는다.

## 상태와 의사결정

- runtime session start는 Agent artifact activation이 아니다.
- worker contribution은 acceptance가 아니다.
- report 작성은 publication이 아니다.
- Git/worktree clean 또는 worker_done은 settlement 증거가 아니다.

`pass`는 명시된 check가 해당 revision에서 통과했다는 뜻이고, `hold`는 필요한 증거가
없거나 source가 변했다는 뜻이다. `fail`은 재현 가능한 contract 위반에만 사용한다.
선택·승인·배포는 별도 소유자가 별도 기록으로 수행한다.

