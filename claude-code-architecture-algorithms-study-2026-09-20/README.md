# Claude Code Architecture & Algorithms Study

프로젝트의 파일 목록이나 기능 개요가 아니라, 실제 코드가 상태·권한·effect·복구를 어떻게 연결하고 그 과정에서 어떤 불변조건을 보장하는지를 공부하기 위한 6권짜리 한국어 보고서다.

- [01-source-truth-and-system-baseline.pdf](./01-source-truth-and-system-baseline.pdf) — 소스 진실과 시스템 기준선 (36쪽, 알고리즘 2개)
- [02-runtime-surfaces-and-state-ownership.pdf](./02-runtime-surfaces-and-state-ownership.pdf) — 실행 표면과 상태 소유권 (73쪽, 알고리즘 4개)
- [03-turn-context-and-streaming-protocol.pdf](./03-turn-context-and-streaming-protocol.pdf) — Turn, Context와 Streaming Protocol (119쪽, 알고리즘 9개)
- [04-tool-effect-permission-and-change-algorithms.pdf](./04-tool-effect-permission-and-change-algorithms.pdf) — Tool, Effect와 Permission 알고리즘 (126쪽, 알고리즘 12개)
- [05-durability-recovery-and-agent-lifecycle.pdf](./05-durability-recovery-and-agent-lifecycle.pdf) — 내구성, 복구와 Agent Lifecycle (103쪽, 알고리즘 9개)
- [06-extension-variability-operations-and-evolution.pdf](./06-extension-variability-operations-and-evolution.pdf) — 확장, 제품 변형, 운영과 구조 진화 (94쪽, 알고리즘 8개)

총 551쪽이며, 44개의 결정적 알고리즘을 기술 서적의 연속 독해 구조로 설명한다. 각 절은 독자의 문제 상황과 owner를 세운 뒤 필요한 언어·런타임 선행 지식, 최소 예제, 고정 source, 상태 전이, 실패와 effect, 현재 관찰·조건부 상태·UNKNOWN, 학습 전이 질문으로 이어진다. 이 구조는 correctness proof를 주장하지 않으며, 현재 구현이 지키려는 조건과 설명이 멈춰야 하는 경계를 함께 보여 준다. 114개 이론 표현은 7개 보장 중심 범주로 분류했다. 코드 발췌는 모두 고정 commit에서 자동 추출했고 가운데 생략은 명시했다. 페이지 수는 목표나 상한이 아니라 필요한 논증을 모두 배치한 뒤 계산된 결과다.

- [전체 알고리즘 색인](./attachments/algorithm-catalog.md)
- [이론 분포 색인](./attachments/theory-distribution.md)
- [동결 빌드 기록](./attachments/frozen-build-record.json)
- [전체 시퀀스 시각 표본 manifest](./previews/visual-sample-manifest.json)
- [전체 세션 요구사항 감사](./engineering/full-session-requirement-audit.md)
- [요구사항 연속성](./engineering/requirement-chronology.md)
- [단계별 rubric 적용](./engineering/rubric-application.md)
- [저장소 분석 범위 감사](./engineering/repository-coverage-audit.md)
- [분석 원고와 생성 도구 경계](./engineering/content-tool-boundary.md)
- [재사용 범위](./engineering/reuse-coverage.md)
- [품질 rubric](./content/report-quality-rubric.json)
- [저장소 coverage rubric](./content/repository-coverage-rubric.json)
- [편집 디자인 조사](./research/editorial-design-research.md)
- [시각 검토](./engineering/visual-review.md)
- [검증 기록](./engineering/validation.md)
- [생성 manifest](./manifest.json)
- [이 작업의 operation binding](./engineering/operation-binding.md)

## Source truth

- repository: https://github.com/stupidhumans/claude-code-source-code
- revision: `2ca5ddabfed5f220812ea11f029eda03b21bc4c1`
- local clone: `/Users/judangs/project/personal/orca/collab-mono/.collab/sources/stupidhumans/claude-code-source-code`
- 이 대상은 npm bundle에서 복원한 제3자 snapshot이다. 보고서는 observed, inference, recommendation, unknown을 분리한다.

## Rebuild

`node build-study.mjs`

빌드는 원본 clone을 수정하지 않는다. 고정 revision과 clean state를 확인한 뒤 162개 source range, 5개 핵심 의미 주장, 14개 repository responsibility domain, 알고리즘별 A–K obligation, 모든 A4 page의 overflow와 PDF page 수를 검사한다.
