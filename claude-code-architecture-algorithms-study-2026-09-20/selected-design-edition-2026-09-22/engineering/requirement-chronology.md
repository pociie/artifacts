# Claude Code 스터디 요구사항 연대기

이 문서는 다섯 개 스터디 아티팩트와 후속 단권판·PDF 디자인 워크플로에
남은 sanitized 기록을 시간순 요구 변화로 재구성한 것이다. 원문 프롬프트
transcript가 아니며, 생성 시각은 요구 시각과 동일하다고 가정하지 않는다.
정확한 순서는 기존 T01–T33 원장과 각 산출물이 무효화하거나 보강한 편집
결정을 우선하고, manifest 시각은 동일 파동 안의 생성 증거로만 사용한다.

## W01 — 넓은 소스 학습 기준선

`claude-code-source-study-2026-09-20`은 고정된 제3자 복원 snapshot을 로컬에서
읽고, 저장소·참고 영상·언어 메커니즘·UI·agent loop·권한·실습을 연결한
한국어 학습 PDF를 요구했다. 원격 파일 투어나 영상 요약은 불충분했고, clone
revision, 정적 수치, source link, 재현 가능한 생성기가 필요했다. 결과는 7권
132쪽이었지만, 범주가 기술 주제 중심이라 “무엇이 제품을 성립시키는가”라는
상위 질문을 충분히 고정하지 못했다.

## W02 — 저장소 책임을 따라 읽는 가이드

`claude-code-guided-repository-study-2026-09-20`은 임의의 기술 목록 대신 실제
책임 영역을 따라가도록 요구를 좁혔다. runtime entry, context/session, tools,
permission, surfaces/extensions, configuration/operations의 여섯 권과 source
reading index, 코드·상태·pipeline 시각화가 생겼다. 225개 source reference와
150쪽의 고정된 읽기 경로가 생겼지만, 균일한 25쪽 구조가 내용의 깊이를
결정하는 문제가 남았다.

## W03 — 기능 목록에서 핵심 엔지니어링 문제로

`claude-code-core-engineering-study-2026-09-20`은 feature tour를 폐기하고
context compiler, effect runtime, recoverable conversation transaction,
structure evolution이라는 네 문제로 재구성했다. UI와 generator는 중심축을
설명하는 구현 메커니즘이지 전체 분류가 아니게 되었다. 분석 수치와 도메인
판정을 분리하기 위해 범용 TypeScript 계측기와 task-specific JSON 규칙도
분리했다. 결과는 5권 104쪽이다.

## W04 — 코드 사실을 엔지니어링 지식으로 투영

`claude-code-engineering-knowledge-study-2026-09-20`은 코드 관찰을 개념,
설계 판단, 운영 사용으로 옮기는 방법을 요구했다. source claim, external
background, bounded inference, unknown을 분리하고 claim map, knowledge demand,
operation binding, validation을 reader PDF 밖의 엔지니어링 증거로 유지했다.
결과는 6권 111쪽이며, “파일이 있다”와 “지식이 적용되었다”를 구분했다.

## W05 — 아키텍처·알고리즘·보장 중심의 전면 개편

`claude-code-architecture-algorithms-study-2026-09-20`은 결정적 구현과 시스템
보장을 중심에 두고 보고서 구조를 다시 만들었다. 각 알고리즘은 문제, 입력,
상태, 전이, invariant, complexity, counterexample, 개선의 다음 검증을
연결해야 했다. `yield`는 “여러 번 return”이 아니라 실행 frame을 보존하는
suspension point로 교정되었고, terminal `return`, abrupt `throw`, iterator
consumer와 UI projection까지 이어졌다. 번호 상자·keyword chip·고정 페이지
틀은 거부되고 prose-first 설명, 역할 기반 인과 도식, 이론 분포, 단계별 rubric,
14-domain coverage, builder/content 분리, page cap 없음이 요구되었다. 최종
baseline은 44개 알고리즘과 6권 551쪽이다.

## W06 — 가독성 불만을 반영한 단권 독자판

후속 `book-edition-2026-09-21`은 화면 geometry PASS가 실제 독자 가독성을
증명하지 못한다는 요구를 반영했다. 기존 6권을 바꾸지 않고 별도 단권판을
만들며, 외부 code-reading·architecture documentation·technical-book 방법의
채택과 기각을 기록하고, 33개 요구를 앞부분·본문·부록에 재배치했다. 5부 13장,
44개 알고리즘, 14개 책임 domain, 10개 심층 독해를 103쪽으로 구성했고 tagged
text, outline, source links를 검증했다. 다만 시각 체계는 흰색/청록 reader
edition이어서 다음 파동의 선택 디자인과 일치하지 않았다.

## W07 — Systems Monograph × Evidence Notebook 선택

`book-pdf-artifact-workflow-2026-09-21`은 13개 방향을 비교한 뒤 01 Systems
Monograph와 07 Evidence Notebook을 결합했다. Monograph는 긴 인과 설명을,
Notebook은 claim·source·counterexample·limitation 검토를 맡는다. cream paper,
navy ink, teal 구조선, rust evidence accent, serif display, sans body, mono
utility/code를 사용하고 drop cap과 과도한 카드화를 금지했다. page count는
의미를 줄이는 상한이 아니며, overflow 시 축소가 아니라 semantic boundary에서
페이지를 추가한다. v2 reference PDF는 tagged structure로 PDFKit의 역순 text
추출 결함을 교정했지만 독립 v2 검증, 물리 인쇄, grayscale, assistive technology
검토는 남겼다.

## W08 — 현재 요청

현재 요청은 세 가지를 추가한다. 첫째, W01–W07의 요구 변화를 다섯 스터디와
후속 기록에서 명시적으로 복원한다(T34). 둘째, six-mode routing과 reusable
artifact operation contract로 한 명의 목적 소유자, 범위, 비목표, 성공 증거,
변경 신호, 중단 조건을 바인딩한다(T35). 셋째, W06의 전체 reader content를
보존한 별도 edition에 W07의 선택 디자인을 적용해 실제 PDF를 만든다(T36).

## 현재 활성 요구의 압축 집합

- 고정 source revision과 제3자 복원 한계를 유지한다.
- repository-wide decisive guarantees를 중심에 두고 UI/generator를 전체와
  동일시하지 않는다.
- code → state/ownership/time/effect/failure → assurance의 인과 사슬을 prose로
  완결한다.
- OBSERVED / INFERENCE / RECOMMENDATION / UNKNOWN을 분리한다.
- 44 algorithms, 14 domains, 36 requirements와 source links를 보존한다.
- page cap, shrink-to-fit, keyword substitution, decorative card repetition을
  금지한다.
- Systems Monograph와 Evidence Notebook을 독자 작업에 따라 사용한다.
- tagged searchable PDF, outline, navigation, typography minima, overflow,
  parent digest와 preview를 검증한다.
- 독립 acceptance, physical A4, grayscale, assistive technology와 publication은
  이번 작성자의 완료 주장에 포함하지 않는다.

