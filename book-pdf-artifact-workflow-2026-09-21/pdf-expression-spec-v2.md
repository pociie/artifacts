# PDF expression specification v2 — claim-led book report

## 수정 이유

초기 prototype은 01과 07의 표면 문법을 옮겼지만 일부 페이지가 큰 제목, 짧은
키워드, 특징 상자만으로 구성됐다. 그 결과 “책처럼 보이는 슬라이드”가 되었고,
독자가 한 요청의 인과관계와 근거를 따라가는 보고서가 되지 못했다.

v2는 페이지가 아니라 **주장 단위**를 먼저 설계한다. 디자인은 이미 작성된
주장의 기능을 드러내는 수단이며, 빈 공간을 채우거나 키워드를 강조하기 위한
템플릿이 아니다.

## 두 디자인의 책임

### 01 Systems Monograph — 설명을 전진시키는 면

다음 내용에만 사용한다.

- 장의 중심 질문과 thesis
- 원인과 결과를 잇는 연속 산문
- 한 요청을 따라가는 worked trace
- ownership, sequence, state transition처럼 본문 논증에 필요한 도해
- 앞 장의 결과가 다음 장의 입력이 되는 전환

한 면에는 하나의 중심 주장만 둔다. 제목 아래에는 최소 두 개의 완결된 설명
문단이 먼저 오며, 도해 앞 문단은 “왜 이 그림이 필요한가”, 도해 뒤 문단은
“그림에서 무엇을 결론 내리는가”를 말해야 한다.

### 07 Evidence Notebook — 설명을 검증하는 면

다음 내용에만 사용한다.

- observed source fact와 source excerpt
- external background의 적용 범위
- claim → source → reasoning 연결
- counterexample, unknown, limitation
- project inference가 사실보다 강해지지 않았는지 확인하는 기록

Notebook 면은 특징 목록이 아니다. 하나의 material claim을 골라 `claim → evidence
→ reasoning → competing explanation → limitation → disposition`까지 완결한다.

## 서술 단위 계약

각 장은 다음 일곱 요소를 순서대로 갖는다.

1. **Reader question** — 독자가 현재 해결하려는 질문
2. **Thesis** — 이 장이 증명하려는 한 문장
3. **Causal explanation** — 최소 두 문단으로 원인·전환·결과를 설명
4. **Worked trace** — 실제 입력·state·event·effect가 어떻게 이동하는지 추적
5. **Evidence notebook** — source, background, inference, unknown을 분리
6. **Failure path** — 정상 경로와 다른 결과가 생기는 조건
7. **Transition** — 이번 결과가 다음 장에 넘기는 값이나 미해결 질문

장 제목과 label을 지워도 본문만으로 주장을 이해할 수 있어야 한다.

## keyword/card anti-pattern gate

다음 중 하나라도 발생하면 지면을 다시 쓴다.

- 페이지의 핵심 의미가 큰 키워드나 3개 이상의 독립 상자에만 존재한다.
- 제목 아래 첫 본문이 정의가 아니라 특징 나열이다.
- 서로 인과관계가 있는 항목을 bullet list로 분해했다.
- 도해가 본문에서 질문되거나 해석되지 않는다.
- callout을 제거하면 주장·근거 연결이 사라진다.
- 한 페이지가 “무엇이 있다”만 말하고 “왜 그 경계가 필요한가”를 설명하지 않는다.
- 색과 badge가 evidence status의 유일한 표현이다.

본문 페이지에서 callout·label·상자 영역은 원칙적으로 가용 면적의 25%를 넘지
않는다. sequence나 lifecycle은 card grid 대신 방향이 있는 단일 도해로 표현한다.

## 이번 보고서의 서사

보고서는 “기능 목록”이 아니라 한 사용자의 Enter를 끝까지 따라간다.

1. Enter는 전송 명령 이전에 UI mode와 guard를 통과한다.
2. handler가 읽는 state snapshot과 다음 render의 값은 다르다.
3. 입력은 message와 현재 context로 정규화되어 turn의 시작값이 된다.
4. async generator는 frame을 보존하며 partial event와 terminal을 분리한다.
5. streaming event는 UI에 투영되지만 canonical message는 별도 정산된다.
6. tool request는 validation, permission, hook, sandbox, executor를 통과해야 effect가 된다.
7. transcript와 checkpoint는 재시작이 아니라 복구 결정을 가능하게 한다.

각 단계는 앞 단계가 넘긴 **값**을 다음 단계가 받아들이는 방식으로 연결한다.

## 도해 계약

- ownership diagram: 누가 무엇을 소유하는가를 답한다.
- sequence diagram: 어떤 값이 어떤 순서로 이동하는가를 답한다.
- state diagram: generator가 언제 suspended/running/completed인지 답한다.
- recovery diagram: 어떤 사실을 확인한 뒤 resume/compensate/abort를 고르는지 답한다.
- 한 그림에 두 질문을 섞지 않는다.
- caption은 그림의 이름이 아니라 그림에서 얻는 결론을 한 문장으로 쓴다.

## 페이지 리듬

- Monograph 설명 2면 뒤 Notebook 검증 1면을 기본 호흡으로 사용한다.
- 새 장은 이전 장의 terminal value 또는 unresolved question에서 시작한다.
- 장문 산문, worked trace, evidence page, failure path가 반복되도록 한다.
- reference matrix와 glossary만 표·목록 중심 표현을 허용한다.

## 제작·검증 요구

- A4 portrait, live/selectable text, vector/CSS diagram을 사용한다.
- 본문 10.5–11 pt, 15–17 pt leading을 시작값으로 한다.
- 페이지별 overflow와 PDF page count를 자동 검사한다.
- PDF text extraction으로 이미지화된 본문이나 누락 페이지를 탐지한다.
- contact sheet는 장간 리듬과 빈 페이지/과도한 card 사용을 검토하는 데 쓴다.
- source fact, background, inference는 text label과 border shape로 중복 부호화한다.
- 물리 인쇄, grayscale, screen reader, factual truth는 독립 validator에게 남긴다.

## 완료가 아닌 상태

이 명세와 prototype은 candidate다. 등록 skill이나 tool의 사용은 activation,
acceptance, publication, settlement 또는 promotion을 뜻하지 않는다.

