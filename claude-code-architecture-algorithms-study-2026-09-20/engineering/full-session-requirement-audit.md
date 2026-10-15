# 전체 세션 요구사항 감사

이 문서는 요청 문장을 축약한 작업 지시서가 아니라, 이번 세션에서 보고서의
목적이 어떻게 교정되었는지를 순서대로 보존하는 요구사항 원장이다. 반복된
요청도 삭제하지 않는다. 같은 요구가 다시 등장한 것은 이전 산출물이 그 기준을
충분히 만족하지 못했다는 품질 신호이기 때문이다.

판정은 `충족`, `부분 충족`, `보강 필요` 세 가지다. 판정은 문서나 코드의 존재가
아니라 독자가 최종 PDF에서 해당 효용을 실제로 얻는지를 기준으로 한다.

| 대화 순서 | 사용자가 고정한 요구 | 현재 판정 | 산출물에서 확인할 위치 | 이번 보강 결정 |
|---|---|---|---|---|
| T01 | 저장소와 두 영상을 함께 조사하되, 언어 메커니즘·프로그래밍 표현·채택 구조·관련 배경지식을 연결한 방대한 학습 PDF를 범주별로 만든다. 교육자료의 정보 디자인을 조사해 적용하고, 추가 분석 범주도 스스로 찾는다. 영상은 결정적 코드를 깊게 설명하는 접근의 참고이지 전체 내용을 대신하지 않는다. | 부분 충족 | 6권 PDF, `research/editorial-design-research.md`, source/theory index | 두 번째 영상에서 유효한 독해 접근을 UI 사례에 적용하되 동일 rubric을 모든 핵심 영역에 적용한다. |
| T02 | 증거 목록이나 주변 관심사가 아니라 저장소를 성립시키는 결정적 구현을 중심에 둔다. UI와 generator는 전체를 대체하지 않는 두 개의 큰 축이다. 설계·프로그래밍·운영 노력과 리팩터링 압력을 함께 읽는다. | 부분 충족 | 01권 기준선, 02권 runtime surface, 03권 generator, 04–06권 effect·durability·operations | UI 축을 React/Ink의 render·state·effect 메커니즘까지 확장하되 6권 전체의 중심은 repository-wide decisive guarantees로 유지한다. |
| T03 | 원격 탐색용 일회성 도구에 의존하지 않고 저장소를 작업공간에 clone해 분석한다. | 충족 | 고정 clone, `content/source-profile.json`, manifest | clone revision·clean state 검증을 계속 publication gate로 둔다. |
| T04 | `artifacts/**`, Loop Architecture, `artifacts/knowledge/**`, `docs/reference/**`의 재사용 체계와 엔지니어링을 무시하지 않는다. 코드 의미 뒤의 이론·분포·배경지식을 추가 조사하되 실행 흐름은 필요할 때만 쓴다. | 충족 | `engineering/operation-binding.md`, `reuse-coverage.md`, theory atlas | 선택된 항목만 유지하고 추가 artifact 탐색은 하지 않는다. |
| T05 | 적절한 분석 에이전트의 목소리로 스터디 구성원에게 설명한다. 형식이 표현을 제한하지 않게 하고, 6권은 저장소가 드러내는 구성으로 나눈다. 실제 연구·분석 문서의 접근법도 참고한다. | 부분 충족 | 권별 독자 질문·해설, 6권 taxonomy, 연구 노트 | 독자와 함께 코드를 읽는 해설자의 역할을 각 권 도입부에서 더 분명히 하고 영상·언어 표준의 접근법을 출처와 함께 연결한다. |
| T06 | 코드·이미지·시각자료·첨부자료를 사용해 직관성을 높이고, 언어 기능 뒤의 런타임 메커니즘을 배경지식과 함께 상세히 설명한다. | 부분 충족 | source spread, system map, trace, matrix, attachments, M01 | UI worked example과 시각자료의 산문 해설을 보강하고 최종 렌더를 다시 검사한다. |
| T07 | 시간순 요구와 작업 이력을 이해한 뒤, 현재 구현·설계·운영을 구분하고 문제와 개선 방향을 상세히 설명한다. | 충족 | current/implementation/operation baseline, observed/inference/recommendation 표식, chronology | 전체 대화 원장과 현재 판정표를 추가해 연속성 증거를 강화한다. |
| T08 | 프로젝트 알고리즘을 알맞은 항목에서 상세히 설명하고, 결정적 보장을 만들기 위해 그 알고리즘을 어떻게 다루는지도 밝힌다. | 충족 | A01–A38의 source·transition·assurance·theory 페이지 | 이론 페이지 분리 후 38개 모두가 렌더되는지 재검증한다. |
| T09 | 디자인 박스가 내용을 잘게 끊지 않게 하고, 공부하는 사람이 문장 흐름으로 자연스럽게 읽을 수 있게 한다. | 충족 | prose-first CSS, 장문 해설, 제한된 표 사용 | 대표 페이지에서 문장 연속성과 orphan/overflow를 다시 확인한다. |
| T10 | 프로젝트 이해, 알고리즘과 코드 수준 통찰, 그리고 결정적 시스템 성질을 어떻게 보장하는지가 보고서의 목적이어야 한다. | 충족 | 권별 promise, algorithm invariant/counterexample, final synthesis | 최종 README와 manifest도 같은 목적 문장으로 정렬한다. |
| T11 | PDF 표현 방법을 조사해 반영하고, 한 문단에서 성급히 끝내지 않으며, 다음 주제로 넘어가기 전에 논리를 충분히 완성한다. 키워드가 아니라 적절한 추상화 수준의 문맥으로 쓴다. | 충족 | editorial research, 다중 페이지 mechanism/algorithm, theory prose | 새 UI mechanism도 정의→작동 예→프로젝트 결합→보장·실패 순서로 완결한다. |
| T12 | `yield`를 “여러 번 반환”으로 설명하지 않는다. suspension point, 보존된 실행 프레임, terminal `return`, abrupt `throw`, iterator result, query·UI 의미를 예제로 설명한다. | 충족 | 03권 M01 | 직접 `next()`, `for await`, `yield*`, throw/return, UI projection 예를 유지한다. |
| T13 | `yield` 설명은 순차적인 예제 케이스와 상세한 이론 부연을 통해 직관적으로 읽혀야 한다. | 충족 | M01의 일곱 페이지 mechanism study | 최종 렌더의 코드 크기와 페이지 연결 문장을 다시 검사한다. |
| T14 | 기존의 한정된 보고서 틀에 내용을 밀어 넣지 말고 구조를 전면 개편한다. | 충족 | content-kind별 가변 page architecture | 여섯 권은 분류 경계로만 유지하고 주제별 페이지 수를 고정하지 않는다. |
| T15 | 이미지·도식도 번호 상자의 나열로 끝내지 말고 산문으로 관계를 설명한다. 해당 설명과 자주 연결·참조되는 이론 범주와 분포를 탐색한다. | 충족 | semantic role label, causal handoff prose, 7-category theory atlas | 동적 bridge 문장과 새 algorithm theory page를 최종 렌더에서 검증한다. |
| T16 | 자기소개서 작성 루프에서 사용한 표현의 자유와 근거→해석→의미 연결법을 가져오되 그 업무 도메인은 가져오지 않는다. | 충족 | operation binding, reuse coverage, prose review | 해당 방법이 실제 문장에 미친 영향만 유지하고 workflow·score·schema는 제외한다. |
| T17 | 관련 artifacts와 Loop Architecture 맥락을 잃지 않고, 시간순 요구·추론·작업을 재점검해 누락이 보고서에 생기지 않게 한다. | 충족 | chronology, operation binding, 본 감사표 | 최종 handoff 전에 모든 행의 산출물 증거를 다시 대조한다. |
| T18 | artifacts 전체를 컨텍스트에 넣지 말고 현재 목표에 실제 재사용되는 항목만 유지한다. 책임과 기능이 맞지 않는 내용은 제외한다. | 충족 | `engineering/reuse-coverage.md`의 selected/excluded 구분 | 새로운 artifact 탐색을 중단하고 이미 선택된 작은 집합만 적용한다. |
| T19 | 분석 내용이 특정 스크립트·코드·도구 안에 하드코딩되는 안티패턴을 만들지 않는다. | 부분 충족 | `content/*.json`과 renderer의 분리, `content.mjs`의 선언적 corpus | builder 금지어 검증과 경계 기록을 추가하고, 분석 corpus를 실행 도구가 아닌 명시적 입력으로 취급하는 검증을 둔다. |
| T20 | 의미를 pattern 하나로 압축하기보다 작업 단계에 맞는 rubric으로 판정한다. | 보강 필요 | `content/report-quality-rubric.json` | checkpoint별 적용 시점·판정·증거·후속 조치를 기록한 실행 로그를 생성하고 aggregate score는 만들지 않는다. |
| T21 | 현재 세션의 요구를 전부 다시 파악하고, 누락 요구를 찾아 보강한 뒤 작업을 이어간다. | 보강 필요 | 이 문서 | 이 감사표의 부분 충족·보강 필요 항목을 수정한 뒤 최종 상태를 다시 판정한다. |
| T22 | 일부 예상 누락만 보는 것이 아니라 대화 전체를 다시 파악해야 한다. | 충족 | T01–T22 원장과 아래 활성 요구 집합 | 후속 검토의 기준을 이 원장 전체로 고정한다. |
| T23 | 프로젝트 분석 범위를 더 넓히고, 중요한 영역이 누락되지 않도록 별도의 적절한 rubric으로 검사한다. | 충족 | 14-domain repository coverage rubric과 coverage audit | model transport, hook, sandbox, session memory, remote/bridge의 심층 장을 추가하고 builder가 evidence kind와 subject를 검증한다. |
| T24 | 분량 상한을 두지 않고, 긴 설명을 요약·함축하지 말며 필요한 상세를 모두 기술한다. | 충족 | coverage rubric의 `pageCap: null`, split policy, 가변 page architecture | page count는 결과로만 사용하고 font shrink·summary substitution을 실패로 검사한다. |

## 후속 요청이 바꾼 해석

- 처음의 “관련 자료를 폭넓게 파악”은 이후 요청에 의해 **자료 자체를 중심에
  두라는 뜻이 아니라**, 결정적 코드를 더 정확히 해석하기 위한 배경지식만
  선택하라는 뜻으로 좁혀졌다.
- “UI와 generator”는 보고서 전체의 분류 기준이 아니라 **프로젝트를 지탱하는
  큰 축 중 두 축**이다. 따라서 03권의 generator 설명만 강화해서는 충분하지
  않고, 02권에서 React/Ink UI가 orchestration과 상태를 결합하는 방식을 같은
  깊이로 다뤄야 한다.
- “6권”은 반복 가능한 여섯 개 템플릿을 뜻하지 않는다. 저장소의 책임 분포를
  나누는 출판 단위이며, 내부 설명 형식과 분량은 대상 메커니즘에 따라 달라진다.
- “artifacts를 무시하지 말라”와 “필요한 artifacts만 유지하라”는 충돌하지
  않는다. 전자는 재사용 체계를 의사결정에 적용하라는 요구이고, 후자는 현재
  목표와 무관한 저장소 지식을 문맥에 쌓지 말라는 범위 제한이다.
- “자유로운 서술”은 무검증 산문을 뜻하지 않는다. 문장 순서는 자유롭되 source,
  mechanism, invariant, counterexample, recommendation의 구별은 rubric으로
  보존해야 한다.

## 현재 보강 대기열

1. 02권에 React/Ink의 render frame, hook state, async turn event projection,
   keyboard/modal interaction을 하나의 상세 사례로 추가하되 보고서 전체를
   대표하는 분류나 증거로 확대하지 않는다.
2. 두 영상은 source truth가 아니라 결정적 코드를 설명하는 접근의 참고로
   표시하고, 각각 generator와 UI 메커니즘이 실제 코드에서 어디까지
   성립하는지 대조한다. 같은 독해 rubric은 나머지 핵심 영역에도 적용한다.
3. 단계별 rubric 적용 기록을 남기고, 실패 항목은 수정 후 재판정한다.
4. 생성기가 분석 주장에 종속되지 않음을 정적 검증하고 content/tool 경계를
   명시한다.
5. 새 algorithm theory page와 coverage 보강 장을 포함해 6권을 다시 빌드하고 모든 페이지의
   overflow, source range, 의미 주장, 대표 시각 품질을 재검증한다.
