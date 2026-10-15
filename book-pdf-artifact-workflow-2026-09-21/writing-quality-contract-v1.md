# Technical report writing quality contract v1

## 목적

이 계약은 보고서를 키워드 기억 보조물이나 기능 카탈로그가 아니라, 독자가 낯선
시스템의 구조를 이해하고 다른 사례에도 적용할 수 있는 설명으로 만들기 위한
task-local writing contract다.

## 핵심 원칙

### 개념을 먼저, 고유명사를 나중에

React, generator, tool result 같은 이름으로 문단을 시작하지 않는다. 먼저 그
기술이 해결하는 상위 문제를 제시한다.

- React 이전의 문제: 사용자 사건을 현재 화면 상태와 다음 화면 상태로 어떻게
  나눌 것인가.
- Generator 이전의 문제: 실행을 끝내지 않고 중간 관찰을 어떻게 노출할 것인가.
- Permission 이전의 문제: 요청과 실제 외부 effect 사이의 책임을 어떻게 나눌 것인가.
- Transcript 이전의 문제: 중단 뒤에 무엇이 실제로 일어났는지 어떻게 판별할 것인가.

고유 기술은 이 문제에 대한 현재 프로젝트의 한 구현 선택으로 소개한다.

### 추상화 사다리

모든 material section은 다음 네 높이를 오르내린다.

1. **Human problem** — 사용자가 겪는 현상과 질문
2. **System principle** — 시간, state, ownership, effect, durability 같은 상위 개념
3. **Project mechanism** — 현재 snapshot의 구체적 type, event, call 또는 module
4. **Operational consequence** — 실패, 관측, 재시도, 복구에서 달라지는 판단

한 높이에만 머무르지 않는다. 고유명사만 계속되는 문단은 위로 올리고, 추상적
원칙만 있는 문단은 project trace로 다시 내려온다.

## section 구성

각 section은 다음을 포함한다.

1. 독자의 질문
2. 질문이 중요한 이유와 상위 맥락
3. 한 문장의 thesis
4. 인과관계를 설명하는 연속 문단
5. 구체적인 worked trace 또는 counterexample
6. source와 inference의 구분
7. 적용 한계
8. 다음 section으로 넘기는 값이나 질문

정의·특징·장점 목록은 section을 대체할 수 없다.

## keyword decoupling test

초고에서 framework, library, class, function 이름을 잠시 가린다. 다음이 여전히
설명돼야 한다.

- 어떤 상태가 누구에게 속하는가.
- 어떤 사건이 무엇을 바꾸는가.
- 어느 경계에서 값이나 authority가 전달되는가.
- 정상 경로와 실패 경로가 어디서 갈라지는가.
- 독자가 다른 interactive/streaming system에 옮겨갈 수 있는 원칙은 무엇인가.

설명이 무너지면 그 section은 keyword에 과결합된 것이므로 상위 개념과 인과관계를
다시 작성한다. 고유명사는 삭제 대상이 아니라 **증거와 사례의 자리**로 되돌린다.

## 이해 가능성 gate

다음 형태는 reject한다.

- 명사구나 굵은 키워드가 연속되고 동작 관계가 없다.
- “A, B, C가 있다”로 끝나며 왜 필요한지 설명하지 않는다.
- 독자가 이미 framework를 안다고 가정한 채 API 이름으로 결론을 대신한다.
- bullet 순서가 실제 lifecycle 순서처럼 보이지만 전달되는 값이 없다.
- diagram의 node 이름은 많지만 질문과 결론이 없다.
- source excerpt가 reasoning 없이 배치된다.
- inference를 evidence badge만으로 정당화한다.

## transfer test

장 끝에서 독자가 다음 질문에 답할 수 있어야 한다.

> 같은 문제가 web UI, terminal UI, background worker 또는 다른 agent runtime에서
> 나타난다면 어떤 state·effect·durability 경계를 먼저 찾을 것인가?

특정 기술을 그대로 복제하라는 답이 아니라, 관찰해야 할 원칙과 trade-off를
설명해야 한다.

## 문체

- 문단 첫 문장은 역할 또는 인과관계를 제시한다.
- 한 문단은 하나의 논리적 이동만 수행한다.
- “따라서”, “그러나”, “이 때문에” 같은 연결은 실제 evidence 관계가 있을 때만 쓴다.
- 단정의 강도를 source strength에 맞춘다.
- 전문 용어는 첫 사용 시 독자 문제와 함께 설명한다.
- 용어집은 탐색을 돕지만 본문의 설명 책임을 대신하지 않는다.

## 디자인과의 계약

- Systems Monograph 면은 이 계약의 상위 맥락과 인과 설명을 보존한다.
- Evidence Notebook 면은 한 thesis의 source, reasoning, counterexample과 limitation을
  검토한다.
- 디자이너는 산문을 카드로 분해해 의미 관계를 잃게 만들지 않는다.
- 저자는 빈 레이아웃을 채우기 위해 키워드나 callout을 추가하지 않는다.

## 상태

이 문서는 task-local candidate다. 글쓰기 품질을 위한 입력일 뿐 activation,
acceptance, publication, settlement 또는 promotion을 부여하지 않는다.

