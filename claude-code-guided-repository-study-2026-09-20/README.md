# Claude Code Guided Repository Study

대상 저장소의 실제 책임 영역을 따라 구성한 6권짜리 한국어 스터디 자료다. 보고서의 화자는 코드를 함께 펼쳐보는 시스템 소프트웨어 엔지니어이며, 코드 사실과 해석, 확인 불가능한 추정을 분리한다.

- [01-runtime-entrypoints-and-conversation-engine.pdf](./01-runtime-entrypoints-and-conversation-engine.pdf) — 런타임 진입점과 대화 엔진 (25쪽)
- [02-context-messages-memory-and-session.pdf](./02-context-messages-memory-and-session.pdf) — 컨텍스트, 메시지, 기억과 세션 (25쪽)
- [03-tool-system-and-code-changing-tools.pdf](./03-tool-system-and-code-changing-tools.pdf) — 도구 시스템과 코드를 바꾸는 메커니즘 (25쪽)
- [04-permissions-security-and-effect-control.pdf](./04-permissions-security-and-effect-control.pdf) — 권한, 보안과 효과 통제 (25쪽)
- [05-repl-sdk-extensions-and-agent-features.pdf](./05-repl-sdk-extensions-and-agent-features.pdf) — REPL, SDK, 확장과 에이전트 기능 (25쪽)
- [06-build-configuration-telemetry-and-reconstruction.pdf](./06-build-configuration-telemetry-and-reconstruction.pdf) — 빌드, 구성, 운영과 복원 저장소 읽기 (25쪽)

총 150쪽이다. 각 권은 네 개 장, 장별 네 개의 코드 독해 세션, 시각화된 코드·상태·pipeline 설명, 언어 메커니즘 카드, 소스 탐색 인덱스, 실제 스터디 워크숍으로 구성된다. 분석용 TypeScript 예제는 실제 구현의 symbol과 제어 구조를 보존하면서 설명 목적에 맞게 축약·재작성했으며 원문 전재가 아니다.

- [시각자료·코드 독해 색인](./attachments/visual-and-code-reading-index.md)
- [분류 근거](./research/repository-classification.md)
- [검증 기록](./engineering/validation.md)
- [생성 manifest](./manifest.json)

## Fixed source

- repository: https://github.com/stupidhumans/claude-code-source-code
- local clone: /Users/judangs/project/personal/orca/collab-mono/.collab/sources/stupidhumans/claude-code-source-code
- revision: `2ca5ddabfed5f220812ea11f029eda03b21bc4c1`
- measured: 1,884 TS/TSX files, 512,664 physical lines

대상은 제3자 복원 저장소이며 누락된 feature-gated 모듈과 불완전한 빌드 조건이 있다. 따라서 문서에 실제 코드 관찰, 저장소 문서의 주장, 이 자료의 제한된 해석을 구분했다.

## Reproduction and validation

`node build-study.mjs`

- 고정 revision 확인
- 225개 source reference의 파일/행 범위 확인
- Chromium A4 렌더링과 모든 page 수평·수직 overflow 검사
- PDF 크기와 150쪽 manifest 기록
- 권별 cover, 코드 시각화, 언어 메커니즘, 소스 인덱스 preview 생성

생성 과정의 운영 기록은 `engineering/**`에만 두었고 PDF 본문에는 작업 지침을 넣지 않았다.
