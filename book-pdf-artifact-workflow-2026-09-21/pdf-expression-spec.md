# PDF expression specification

## 선택한 편집 방향

내용의 spine은 `13-turn-lifecycle-anatomy.png`에서 확인한 “한 번의 Enter가 UI
event에서 durability/recovery로 이어지는 시간축”이다. 실제 지면의 주 시각 문법은
사용자가 선택한 01과 07을 역할별로 결합한다.

- 01 Systems Monograph: 장 opener, 연속 산문, 전체 시스템/ownership 도해,
  worked trace, 장 결론처럼 “이해를 전진시키는 면”에 사용한다.
- 07 Evidence Notebook: source excerpt, claim→source, unknown, inference,
  uncertainty, limitation처럼 “설명을 검증하는 면”에 사용한다.
- 09: 정상 경로 뒤에 failure/recovery를 붙이는 casebook 구조
- 11: glossary, source index, claim-to-source map의 handbook 부록

02의 trade-off ledger와 08의 algorithm recipe는 특정 절의 보조 페이지로 쓸 수
있지만 책 전체의 기본 페이지는 아니다. 04·10처럼 운영 정보를 여러 카드에
나누는 방향은 탐색 시안으로만 남기며 최종 본문 구조로 선택하지 않는다.

두 주 문법은 무작위로 섞지 않는다. Monograph 면에서 독자가 메커니즘을 이해한
직후, facing Evidence Notebook 면에서 그 설명의 source와 한계를 검증하도록
짝을 만든다. 장 전체의 약 70%는 Monograph, 30%는 Evidence Notebook을 시작
비율로 삼는다.

## 독자 여정과 장 구조

| Stage | 독자 질문 | 필수 페이지 장치 | handoff |
|---|---|---|---|
| 1. User event | Enter를 누른 순간 무엇이 생기는가? | event anatomy, prerequisite callout | event payload |
| 2. React snapshot/update queue | handler가 보는 state와 다음 render는 왜 다른가? | four-beat timeline: event/snapshot/queue/render | UI intent + queued state |
| 3. Message/context | 입력은 어떤 message와 context로 정규화되는가? | ownership map, context provenance strip | normalized turn input |
| 4. Generator turn | 어디서 pause/resume/cancel/error/cleanup 되는가? | state diagram, `next/throw/return` margin note | yielded event / terminal result |
| 5. Streaming | partial event는 어떻게 identity와 순서를 유지하는가? | sequence diagram, replace/append example | progressive observations |
| 6. Tool/permission/effect | 요청, 허가, 실제 effect는 누가 소유하는가? | separated lanes, permission gate, tool_result return | effect result / denial |
| 7. Durability/recovery | 중단 후 무엇이 남고 어디서 재개하는가? | failure path, recovery ledger, checkpoint | durable state + recovery decision |

각 장은 `왜 필요한가 → 선행 개념 → observed source → external background →
project inference → worked trace → failure path → 운영/검증` 순서로 쓴다.

## 반복 시각 문법

### Evidence label

- `OBSERVED SOURCE FACT`: 채운 원 + 실선 테두리
- `EXTERNAL BACKGROUND`: 열린 책 glyph + 이중선 테두리
- `PROJECT INFERENCE`: 점선 마름모 + “검증 필요” 꼬리표
- 색은 보조 채널이다. grayscale 출력에서도 label과 shape만으로 구분돼야 한다.

### Ownership map

UI, message/context, generator/orchestrator, model stream, permission/effect,
persistence를 세로 lane으로 둔다. 화살표에는 동사가 아니라 전달되는 값이나
effect (`queued update`, `assistant delta`, `tool_result`, `checkpoint`)를 쓴다.

### Sequence/state diagram

- sequence diagram은 주체 간 전달과 시간 순서를 담당한다.
- state diagram은 generator turn의 suspended/running/completed와
  cancel/error/cleanup을 담당한다.
- 두 도해를 한 그림에 억지로 합치지 않는다.
- 모든 도해 아래에 `claim refs`, `source refs`, `limitations`를 한 줄씩 둔다.

### Prerequisite callout

본문을 시작하기 전 필요한 JavaScript/React 개념만 4–6줄로 설명하고, 더 자세한
내용은 appendix로 보낸다. prerequisite는 프로젝트 source fact처럼 보이면 안 된다.

## 페이지 시스템

- 최종 판형: A4 portrait, 210×297 mm.
- facing-page 기준 안쪽 20 mm, 바깥쪽 16 mm, 위 17 mm, 아래 20 mm를 시작값으로
  사용한다. binding 방식이 정해지면 안쪽 margin을 재검증한다.
- 본문 10.5 pt/15–16 pt, code·note 최소 8.5 pt/12 pt, label·folio 최소 7.5 pt.
- 본문 한 줄은 한글 기준 약 38–48자를 목표로 한다. 긴 코드와 표는 landscape
  appendix 또는 2-page spread로 보낸다.
- headings, paragraphs, tables, source index는 selectable text로 유지한다.
  raster 이미지는 설명용 삽화와 preview에만 사용한다.
- 핵심 다이어그램에는 대체 텍스트와 바로 아래 prose equivalent를 둔다.
- 색 대비, grayscale, 100% zoom, print crop, orphan/widow, table overflow를 검증한다.

## 페이지 유형

1. Part opener: lifecycle 전체와 이번 part의 활성 stage
2. Chapter opener: 독자 질문, 선행 개념, ownership slice — Monograph
3. Prose page: 한 개의 주장과 한 개의 supporting diagram — Monograph
4. Worked trace spread: 한 요청을 7단계로 추적 — Monograph
5. Evidence spread: observed/background/inference와 claim→source — Notebook
6. Unknown/limitation page: 미확인 항목과 검증 계획 — Notebook
7. Failure/recovery spread: 정상 경로와 실패 경로 비교 — Monograph + Notebook
8. Reference page: glossary, source index, claim/source matrix — Notebook

## 시안에서 PDF로 옮길 때

현재 PNG는 비주얼 방향 보드다. 그대로 페이지 배경으로 확대하지 않는다. 실제
PDF에서는 CSS/SVG/HTML의 벡터 shape와 live text로 재구성하고, PNG는 승인 전
visual reference로만 사용한다. 모든 시안에 보이는 작은 글자는 내용 source가
아니므로 실제 집필 단계에서 `source-to-claim-packet.json`의 claim으로 교체한다.

## 인계 전 gate

- source fact/background/inference 표기가 claim packet과 일치하는가?
- Enter event와 turn completion이 같은 사건처럼 그려지지 않았는가?
- model의 tool request와 client effect/permission이 분리됐는가?
- generator의 cancel/error/finally와 durability/recovery가 빠지지 않았는가?
- 장이 카드 카탈로그가 아니라 원인–전환–결과를 따라 읽히는가?
- 독립 validator가 frozen PDF와 source/visual digest를 함께 받았는가?
