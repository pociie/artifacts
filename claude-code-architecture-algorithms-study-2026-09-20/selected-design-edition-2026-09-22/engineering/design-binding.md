# 선택된 보고서 형식·디자인 바인딩

## 선택

최종 edition은 `book-pdf-artifact-workflow-2026-09-21`의 결론인 **Systems
Monograph × Evidence Notebook**을 사용한다. 13개 mockup 전체를 섞지 않는다.
Systems Monograph는 독자의 질문에서 원리·메커니즘·운영 결과로 이어지는 긴
설명을 담당한다. Evidence Notebook은 source excerpt, algorithm decision,
상태 trace, counterexample, epistemic status와 limitation을 검토한다.

## 표현 토큰

- paper: `#f6f1e7`, secondary paper: `#f1ebdf`
- ink: `#102d43`, teal: `#2d6972`, rust: `#a84f3c`
- display: Noto Serif KR / AppleMyungjo / Georgia 계열
- body: Pretendard / SUIT / Noto Sans KR / Apple SD Gothic Neo 계열
- utility/code: SFMono / Menlo / Consolas 계열
- opening paragraph는 본문과 같은 크기이며 drop cap을 사용하지 않는다.
- 색상·bold·uppercase만으로 의미를 전달하지 않는다.

## 페이지 역할

- cover, front matter, part opener, chapter prose, conclusion은 Monograph다.
- deep walkthrough, current-state/status review, algorithm/domain/source/
  requirement/research appendix는 Notebook이다.
- Notebook은 7mm grid를 사용하되 산문과 source가 중심이고 grid는 검토 모드의
  보조 신호다.
- box는 비교·trace·code처럼 경계가 실제 의미를 가질 때만 사용하며 radius와
  dashboard 장식을 줄인다.

## 연속성과 backpressure

설명·예제·도식·evidence unit은 의미 경계에서만 나눈다. 내용이 넘치면 페이지를
추가하고 body/code type을 최소값 아래로 줄이지 않는다. figure와 해석 caption,
claim과 source/limitation을 분리하지 않는다. reflow 후 page count, internal link,
outline, searchable text와 digest를 다시 계산한다.

## 검증 경계

작성자 측 검증은 design token 적용, no-drop-cap, typography minima, clipping,
tagged text order, source/navigation, representative previews와 contact sheet를
다룬다. physical A4, grayscale, assistive technology, reader comprehension와
publication acceptance는 독립 검증 전까지 PENDING이다.

