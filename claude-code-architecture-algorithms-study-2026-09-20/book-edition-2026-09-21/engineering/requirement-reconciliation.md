# 독자판 요구사항 재조정

## 이 기록이 증명하는 것과 증명하지 않는 것

이 문서는 새 독자판이 무엇을 고치려 하는지 시간순 요구와 최종 책 위치로
연결한다. 기계적 원장은 `content/requirement-ledger.json`이며 T01–T24는 부모
산출물의 세션 감사에서, T25–T33은 후속 협업·독자판 dispatch에서 가져왔다.
Orca 이전의 raw transcript 전체는 현재 작업공간에 없고, 보존된 자료는
sanitized projection이다. 따라서 T01–T33이 현재 확인 가능한 요구를 빠짐없이
포함하는지는 검사할 수 있지만, 과거 대화의 완전한 복원을 증명할 수는 없다.

## 시간에 따라 바뀐 중심

초기 요구는 저장소와 관련 자료를 넓게 조사해 여섯 범주의 학습 PDF를 만드는
것이었다. 이후 사용자는 증거와 기술 관심사의 나열이 프로젝트의 결정적 코드를
가렸다고 교정했다. UI와 generator는 큰 축의 일부이지만 전체를 대신하지
않으며, 코드가 필요한 이유와 언어 메커니즘, 채택 구조, 운영 경계를 함께
설명해야 했다. 다시 말해 분석 범위는 넓어졌지만 설명의 중심은 더 선명해졌다.

중간 단계에서 알고리즘 페이지는 source·transition·assurance·theory를 넓게
포함했지만, 같은 A–K sequence와 화면상 sheet 디자인이 독서 흐름을 끊었다.
preview geometry PASS가 있어도 사용자가 실제로 읽기 어렵다고 말한 시점에 그
판정은 출판 목표를 닫을 수 없게 되었다. T33은 새 독자판이 기존 HTML/PDF를
수정하지 않고 별도 subtree에서 자연 흐름 A4와 서적형 서술을 다시 만드는
이유다.

## 새 독자판에서의 재배치

새 책은 여섯 baseline PDF를 합치는 작업이 아니다. 다섯 Part의 질문 중심
본문에서 열 개 대표 알고리즘을 깊게 읽고, A01–A44 전체는 부록 atlas와 source
index에서 접근한다. 본문은 사례 연구와 코드 독해를, 부록은 빠른 참조를 맡는다.
이 분리는 모든 알고리즘을 같은 페이지 수와 같은 카드 순서에 넣지 않으면서도
coverage를 잃지 않게 한다.

T12–T13의 generator 요구는 Part II의 언어 메커니즘 interlude에서 다시
설명한다. `yield`는 여러 번 반환하는 문법이 아니라 실행 frame을 보존하는
suspension point이고, `return`은 `{value, done:true}`로 terminal을 만들며,
`throw`는 generator 내부 catch 또는 소비자의 실패 경로로 이어진다. 작은
`next()` 예제 뒤에는 query event와 UI projection으로 돌아와 partial visibility와
turn terminal을 구분한다.

T23의 넓은 범위는 부모의 14-domain rubric을 부록에 그대로 추적하되 본문에서는
entry/runtime, turn/stream, tool/effect, durability/recovery,
extension/operations라는 책임 흐름으로 재구성한다. coverage가 넓다는 사실을
모든 영역이 같은 깊이라는 주장으로 바꾸지 않는다.

## 외부 방법 조사 요구의 판정 변경

T32의 초기 외부 연구 요구는 과거 baseline에 링크와 편집 메모가 일부 있었어도
실제 방법, 채택·기각 결정, 정확한 페이지와 validator를 한 durable record로
연결하지 못했으므로 그 시점에는 `unmet`이었다. 새 독자판에서는
`research/codebase-study-methods.md`와 `content/research-adoption.json`이 AOSA,
500 Lines, Code Reading Club, GitHub code navigation, arc42, C4, Diátaxis,
O'Reilly 지침을 책의 구조·도식·cross-reference·code 규칙에 연결한다. 이 파일의
존재만으로는 충분하지 않으며, build validator가 실제 anchor와 규칙을 확인할
때만 이번 edition의 충족으로 기록한다.

## 소유권과 acceptance

부모의 6개 PDF, content/build source, HTML, preview, attachment, manifest, README,
`engineering/visual-review.md`는 read-only다. 독자판은 새 subtree만 쓴다. build는
전후 SHA-256으로 부모 보존을 검사하고 새 manifest에 그 결과를 고정한다.

독자판 author lane은 PDF·HTML·preview와 기계 검증을 만들지만 독립 시각 verdict,
publication approval, physical A4 acceptance를 소유하지 않는다. 마지막 단계는
`engineering/visual-review-request.md`의 digest와 cache-safe 절차를 다른
reviewer가 읽는 일이다. screen evidence가 물리 인쇄 결과를 대신하지 않는다.

## 최종 reconciliation rubric

- T01–T33이 중복 없이 시간순으로 존재하고 각 항목에 source, 상태, 책 위치,
  검증 증거, owner, limitation이 있는가.
- 모든 `finalBookLocation`이 실제 HTML anchor 또는 manifest/README 산출물에
  대응하는가.
- `OBSERVED`, `INFERENCE`, `RECOMMENDATION`, `UNKNOWN`이 문장 수준에서
  섞이지 않는가.
- 44개 알고리즘과 14개 domain이 본문 또는 부록에서 모두 도달 가능한가.
- 외부 연구가 링크 목록이 아니라 책의 구체적 편집 결정과 validator로
  나타나는가.
- 사용자의 가독성 불만을 과거 geometry PASS로 기각하지 않고 독립 재검토를
  요청하는가.

합산 점수는 만들지 않는다. 한 항목이라도 빠지면 그 항목의 상태와 residual
limit을 따로 기록한다.
