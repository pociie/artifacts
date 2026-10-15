# Book PDF artifact workflow — task-local run bundle

이 디렉터리는 Claude Code 재구성 프로젝트를 서적형 PDF로 설명하기 위한
sanitized, report-only 산출물 묶음이다. 원문 프롬프트, private reasoning,
provider/runtime handle, mutable assignment/acknowledgement는 포함하지 않는다.

## 현재 결론

- 13개의 독립적인 PNG 시안을 유지한다. 모두 1536×1024이며, 특정 서적의
  trade dress를 복제하지 않은 합성 편집 방향이다.
- 선택된 본문 모드는 01의 Systems Monograph와 07의 Evidence Notebook이다.
  01은 긴 호흡의 설명, 07은 claim·source·불확실성 검토를 맡는다. 13의
  turn-lifecycle은 표지 스타일이 아니라 전체 장 순서를 검토하는 참조로만 쓴다.
- 장의 순서는 `user event → React snapshot/update queue → message/context →
  generator turn → streaming → tool/permission/effect → durability/recovery`다.
- 아키텍처 후보는 순차 의존성이 있는 ordered handoff pipeline이며, 마지막
  Fact/Visual Validator는 저자·디자이너와 독립적이어야 한다.
- 이 묶음은 activation, assignment, acknowledgement, acceptance, publication,
  promotion을 수행하거나 암시하지 않는다.

## Claim-led v2

초기 prototype의 keyword·feature-card 중심 표현을 보완한 현재 권장 후보는
`prototype-v2/claim-led-book-pdf-prototype.pdf`다. 15쪽 전체가 한 요청을 따라가며,
각 장은 상위 문제와 시스템 원칙을 먼저 설명한 뒤 React, generator, tool 같은
프로젝트 메커니즘을 사례로 배치한다.

- 글쓰기 계약: `writing-quality-contract-v1.md`
- authoring loop 후보: `report-authoring-loop-candidate.json`
- 비가중 필수 rubric: `editorial-quality-rubric-v1.json`
- 등록 skill과 task-local capability/tool 결합:
  `dynamic-artifact-capability-bindings-v2.json`
- 개정 dynamic team: `dynamic-team-blueprint-v2.json`
- author-side 검증: `editorial-validation-candidate-v2.json`
- 새 digest-bound handoff: `recipient-handoff-candidate-v2.json`

## Typography-clean v3

현재 최신 후보는 `prototype-v3/claim-led-book-pdf-prototype.pdf`다. v2의
15쪽 인과적 서사와 근거 경계는 그대로 두고, 확대 첫 글자(drop cap)를 모두
제거했다. 문단 시작은 본문과 같은 크기·기준선을 사용하며 제목, 본문, utility,
code 역할은 공통 토큰으로 관리한다. 대문자화·색상·크기만으로 의미를 전달하는
페이지는 authoring loop에서 보류 대상으로 취급한다.

- 타이포그래피와 페이지 시스템: `typography-and-page-system-v1.json`
- authoring loop 보강: `authoring-loop-typography-extension-v1.json`
- typography 필수 rubric: `editorial-quality-rubric-typography-extension-v1.json`
- 역할별 품질 책임 후보: `dynamic-team-blueprint-v3.json`
- author-side 검증: `editorial-validation-candidate-v3.json`
- source review와 visual/writing evidence의 결합 후보:
  `recipient-handoff-candidate-v3.json`
- 독립 검증과 수신 확인 전 pending 상태: `settlement-status-v3.json`

브라우저 계산값 기준으로 8개 시작 문단의 첫 글자는 모두 본문과 같은 13.6px,
`float: none`이었다. 15쪽 모두 페이지 넘침이 없고 PDFKit이 선택 가능한 글자
19,537자를 확인했다. 이는 독립 검증이나 수신 승인·출판·settlement가 아니라
동일 작성자가 수행한 후보 검증이다.

## 저장 경계

- `.collab/artifacts/**`: 이 디렉터리의 sanitized blueprint, architecture
  selection, source-to-claim packet, PDF expression spec, handoff, validation,
  settlement evidence.
- `.collab/memory/**`: 향후 runtime owner가 활성화할 때의 mutable state,
  assignment, acknowledgement. 이번 작업에서는 쓰지 않았다.
- `artifacts/loop-architecture/**`: canonical contract/component의 참조만 사용했고
  수정하지 않았다.
- `AGENTS.md`: 대상이 아니며 수정하지 않았다.

## 주요 산출물

- `registered-profile-lookup.json`: 등록 프로필 선조회와 coverage gap
- `dynamic-team-blueprint.json`: 5개 후보 역할과 handoff 경계
- `architecture-selection.json`: ordered-handoff 선택 근거
- `source-to-claim-packet.json`: 출처·claim·집필/시각 함의
- `domain-reference-matrix.md`: 도메인 서적에서 차용한 구조적 문법
- `pdf-expression-spec.md`: 책 구조, 페이지 문법, 도해 및 인쇄 명세
- `mockup-manifest.json`: 13개 시안의 해시·용도·채택 판단
- `recipient-handoff-candidate.json`: source review와 visual evidence의 단일
  revision/digest 결합 후보
- `validation-candidate.json`: 저자 측 예비 검증이며 독립 검증이 아님
- `settlement-status.json`: 독립 검증·수신 확인 전까지 pending인 상태 기록
