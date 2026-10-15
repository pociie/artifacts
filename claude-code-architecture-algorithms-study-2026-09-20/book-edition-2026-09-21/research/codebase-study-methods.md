# 코드베이스 학습 방법 조사와 독자판 채택 기록

## 조사 질문

이 조사의 목적은 유명 방법론의 이름을 보고서에 더하는 것이 아니다. 낯선
코드베이스를 읽는 독자가 파일 목록을 외우지 않고도 “왜 이 결정점이 여기
있는가”, “어떤 상태와 소유권이 바뀌는가”, “현재 자료로 어디까지 말할 수
있는가”를 점점 더 잘 설명하도록 만드는 편집 방법을 찾는 것이다. 외부 자료의
문장이나 도식을 복제하지 않고, 관찰한 학습 방법을 이 책의 서술·도식·검증
규칙으로 바꾸었다.

## 사례 연구는 구성요소 목록이 아니라 설계 질문을 따라간다

[The Architecture of Open Source Applications](https://aosabook.org/en/)는
서로 다른 시스템을 하나의 카드 틀에 밀어 넣기보다, 각 시스템의 주요
구성요소가 어떻게 상호작용하며 왜 그 구조가 생겼는지를 사례 저자의 언어로
설명한다. 이 독자판은 그 접근을 받아들여 다섯 Part를 “프로세스는 누가
소유하는가”, “한 turn은 언제 완성되는가”, “effect는 어디서 허가되고
정산되는가” 같은 질문으로 연다. 반대로 모든 파일을 component 표에 넣거나
복원 snapshot을 upstream의 공식 아키텍처로 보이게 하는 단순화는 채택하지
않았다.

[500 Lines or Less](https://aosabook.org/en/500L/introduction.html)는 제한된
구현을 통해 제약, 추상화, 분해 결정을 드러내고 독자가 먼저 해결 방법을
상상하게 한다. 이 책의 심층 독해는 같은 학습 원리를 사용한다. 독자 질문과
선행 개념을 먼저 제시하고, 작은 예제로 메커니즘을 분리한 뒤, 반드시 실제
source range로 돌아간다. 작은 예제는 원 프로젝트를 증명하지 않으며, 차이를
숨기지 않는 연결 장치다. `deepWalkthroughCount`, `exampleReturnsToCode`,
`sourceRangesExist` 검사는 이 채택이 장식에 머물지 않게 한다.

## 코드 읽기는 수동 해설이 아니라 관찰과 가설의 반복이다

[Code Reading Club](https://codereading.club/)과
[공개 Resources 저장소](https://github.com/CodeReadingClubs/Resources)는 작은
그룹이 짧은 code selection을 함께 읽고, 탐색 exercise와 회고를 반복하는
방식을 제공한다. 중요한 점은 “좋은 코드”를 골라 정답을 듣는 데 있지 않고,
낯선 코드에서 관찰을 말하고 질문을 개선하는 연습에 있다.

독자판의 10분·60분·심층 경로는 같은 PDF를 서로 다른 깊이의 스터디에 쓸 수
있게 한다. 심층 독해에는 source를 보기 전의 reader question과 독해 뒤의
transfer question이 있다. 거대한 code dump나 repository 전체의 선형 읽기는
기각했다. source excerpt는 결정점 주변으로 제한하고, 생략한 범위와 다른
소비자는 source index에서 이어 읽게 한다.

## 정의와 참조를 오가되 검색 결과를 ownership으로 착각하지 않는다

[GitHub의 code navigation 문서](https://docs.github.com/en/repositories/working-with-files/using-files/navigating-code-on-github)는
symbol의 정의와 repository 안의 참조를 오가는 탐색을 설명한다. 독자판은 모든
알고리즘에 파일·행 범위를 붙이고, source index에서 같은 파일에 속한 결정점을
다시 찾을 수 있게 했다. 그러나 검색 hit 수, 파일 이름, import 하나만으로
runtime owner나 production activation을 판정하지 않는다. 본문의 ownership은
정의, 호출 맥락, 유지하는 state, 결과 소비자를 함께 읽은 제한된 해석이다.

## 계층적 정적 관점과 동적 관점을 필요한 만큼만 쓴다

[arc42 overview](https://arc42.org/overview/)는 목표·제약·context·building
block·runtime·decision·risk·glossary 같은 관점을 제공하며 필요에 맞게
재단하도록 한다. 독자판은 앞부분의 evidence boundary와 system context,
Part별 building block, 필요한 알고리즘의 runtime view, 결론의 tension과
risk, 부록 glossary를 채택했다. 전체 템플릿을 빈칸 없이 복제하거나 이 문서를
공식 설계 문서로 가장하는 방식은 기각했다.

[C4 model](https://c4model.com/)의 유용한 지점은 한 도식에 모든 세부를 넣지
않고 context에서 더 작은 책임으로 확대하는 데 있다. 전체 시스템 지도는 진입,
query, stream, effect, durability, extension의 관계만 보여 준다. 이어서 state
ownership, 한 turn, permission/effect, transcript/recovery,
extension/control-plane을 별도 그림으로 확대한다. 각 그림 뒤에는 번호 목록이
아니라 관계가 왜 중요한지 설명하는 산문이 따른다. 공식 배포 container를 알 수
없는 복원 소스에 container label을 억지로 붙이지 않았다.

## 설명과 참조는 함께 제공하되 같은 페이지 역할로 섞지 않는다

[Diátaxis](https://diataxis.fr/)는 독자가 이해를 원하는지 빠른 정보를 원하는지에
따라 문서의 역할이 달라진다는 점을 명시한다. 본문은 결정적 코드가 필요한
이유, 선행 지식, 상태 전이, 실패와 운영 결과를 잇는 explanation이다. 부록의
A01–A44 atlas, 14-domain coverage, source index, glossary, requirement ledger,
research trace는 다시 찾기 위한 reference다. 네 유형의 문서를 동일 템플릿으로
반복하지 않고, 본문과 부록 사이의 anchor와 backlink로 이동 가능하게 했다.

## 기술 서적의 인쇄 규칙은 의미를 보존하는 제약이다

[O'Reilly production style guide](https://oreillymedia.github.io/production-resources/styleguide/)에서
채택한 핵심은 특정 페이지 위치에 의존하지 않는 cross-reference, 이름 있는
figure·table·example, 관리 가능한 code line length, 하나의 원천에서 print와
electronic output을 만드는 원칙이다. 독자판은 “위 그림” 대신 그림 제목 링크를
사용하고, code display를 72자 이내로 분할·표시하며, 자연 흐름 HTML 하나에서
PDF와 preview를 만든다. 코드를 작은 글꼴로 눌러 넣거나 외부 시각 자산을
복제하는 방식은 기각했다.

## 채택 결과를 검증하는 방법

연구의 효용은 링크 수가 아니라 산출물의 변화로 판정한다. 책은 다섯 Part의
질문 중심 사례 연구, 열 개의 안내식 심층 독해, 여섯 개의 계층·동적 도식,
본문/참조 부록 분리, 정의·source range 추적, figure cross-reference와 72자
code 규칙을 가져야 한다. `content/research-adoption.json`은 각 자료의 관찰,
채택, 기각, 정확한 적용 위치와 validator를 기계적으로 연결한다. 초기 6권
baseline에서 외부 방법 조사가 충분히 durable하게 남지 않았던 요구는 그때는
미충족이었고, 새 독자판에서 이 기록과 실제 페이지 적용이 함께 있을 때만
충족으로 바뀐다.

## 남는 제한

이 조사는 공개 페이지에서 확인 가능한 방법을 편집 관점으로 해석한 것이다.
각 공동체의 모든 운영 경험이나 출판사의 전체 production workflow를 대표하지
않는다. 또한 화면과 기계 검사는 실제 독자의 이해를 자동으로 증명하지 않는다.
독립 reviewer는 digest가 고정된 PDF와 대표 preview를 읽고, 설명이 source로
되돌아오는지와 본문/부록의 이동이 자연스러운지를 별도로 판정해야 한다.
