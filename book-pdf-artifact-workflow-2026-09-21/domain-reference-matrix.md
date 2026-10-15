# Domain book reference matrix

이 문서는 특정 책의 지면을 모사하기 위한 목록이 아니다. 공식 출판사 설명에서
확인되는 **교육 구조**를 현재 프로젝트의 독자 여정으로 번역한 것이다.

| Reference | 확인한 구조적 문법 | 이 PDF에 적용하는 방식 | 복제하지 않는 것 |
|---|---|---|---|
| O’Reilly, *Software Architecture: The Hard Parts* | 문제를 분리해 이해한 뒤 다시 결합하고, 반복 사례에서 trade-off를 비교한다. | UI·turn·tool·recovery를 나눈 뒤 하나의 end-to-end turn으로 재결합한다. 각 선택에는 `benefit / cost / failure`를 둔다. | 표지, 색, 도형, 고유 사례 문구 |
| O’Reilly, *Designing Data-Intensive Applications* | 기반 개념 → 분산/파생 문제 → 운영·미래 관점의 part 구조와 명시적 trade-off를 사용한다. | prerequisite → runtime flow → effect/durability 순으로 난도를 높이고 appendix에 glossary/source index를 둔다. | 장 제목, 도해 스타일, 문장 |
| O’Reilly, *AI Engineering* | use case에서 출발해 stack과 lifecycle로 내려간다. | “Enter 뒤 무엇이 일어나는가?”를 독자 질문으로 세우고 UI에서 agent/effect stack으로 내려간다. | 고유 프레임워크 명칭과 편집 디자인 |
| O’Reilly, *Building Evolutionary Architectures, 2e* | mechanics, structure, impact와 fitness function/case study를 연결한다. | 정상 경로뿐 아니라 cancellation, tool denial, reconnect를 testable checkpoint로 배치한다. | 사례와 고유 지표 |
| O’Reilly, *Learning Domain-Driven Design* | strategic → tactical → practice의 단계와 반복 예시를 사용한다. | 먼저 ownership/context boundary를 보여준 후 message와 state의 tactical shape로 이동한다. | 도메인 사례와 원문 |
| Manning, *Grokking Simplicity* | roadmap, high-level tour, 그림, 연습으로 개념을 점진적으로 쌓는다. | 장 첫 면에 전체 lifecycle ribbon을 두고 현재 위치를 강조한다. 장 끝에는 짧은 trace exercise를 둔다. | 캐릭터·삽화·고유 레이아웃 |
| Manning, *AI Agents in Action* | agent 구성 요소와 collaboration을 층별로 다룬다. | UI, orchestration, model, tool/effect, persistence의 ownership lane을 분리한다. | 고유 agent taxonomy와 trade dress |
| Pragmatic Bookshelf, *Design It!* | design thinking, 여러 view, workshop식 질문을 결합한다. | sequence/state/ownership 세 view가 같은 claim을 교차 검증하도록 하고 “확인할 질문” callout을 둔다. | workshop 템플릿의 직접 복제 |

## 원본 링크

- https://www.oreilly.com/library/view/software-architecture-the/9781492086888/
- https://www.oreilly.com/library/view/designing-data-intensive-applications/9781491903063/
- https://www.oreilly.com/library/view/ai-engineering/9781098166298/
- https://www.oreilly.com/library/view/building-evolutionary-architectures/9781492097532/
- https://www.oreilly.com/library/view/learning-domain-driven-design/9781098100124/
- https://www.manning.com/books/grokking-simplicity
- https://www.manning.com/books/ai-agents-in-action
- https://pragprog.com/titles/mkdsa/design-it/

## 편집 적용 원칙

1. 서적의 차례·trade dress가 아니라 독자의 인지 순서와 검증 가능한 설명 장치만
   참고한다.
2. 외부 서적은 구조적 배경이며 프로젝트 fact의 근거가 아니다.
3. 본문은 연속 산문과 도해를 중심으로 하고, dashboard식 카드 모음은 appendix의
   reference matrix에만 제한적으로 허용한다.
4. 한 장마다 `context → mechanism → example → failure → operation → evidence`의
   반복 가능한 리듬을 사용하되, 모든 페이지를 같은 템플릿으로 강제하지 않는다.

