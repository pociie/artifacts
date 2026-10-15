# 분석 원고와 생성 도구의 경계

`build-study.mjs`는 이 저장소에 대한 결론을 내리는 분석기가 아니다. 이미
작성된 분석 corpus와 검증 명세를 입력으로 받아 고정된 로컬 source range를
추출하고, 공통 page kind를 렌더링하고, PDF·색인·manifest를 만들고, 범용
publication check를 수행하는 생성기다.

대상 프로젝트에 한정된 다음 정보는 입력에만 존재한다.

- 권·장·주제의 논지와 한국어 해설;
- source path와 line range;
- observed·inference·recommendation 판정;
- 알고리즘의 입력, working state, 전이, 불변조건, 반례, 개선;
- 외부 학습 자료와 영상의 제한된 역할;
- source와 보고서에서 확인할 semantic claim.

생성기는 다음 메커니즘만 소유한다.

- local clone에서 line range를 읽고 중간 생략을 표시하는 일;
- prose, source reading, matrix, trace, algorithm, mechanism study 같은
  page kind를 동일한 규칙으로 조판하는 일;
- overflow, code clipping, font size, page count, semantic label을 검사하는
  일;
- 선언된 rubric과 theory classification이 완전한지 확인하는 일.

이 경계는 “원고가 JavaScript 문법으로 선언되어 있다”는 사실과 “생성 도구가
분석 결론을 하드코딩한다”는 문제를 구분한다. `content.mjs`는 네트워크를
탐색하거나 판단을 실행하지 않는 출판 입력 corpus다. renderer를 다른 corpus에
적용할 때 target-specific 결론을 수정해야 한다면 그 결론은 builder가 아니라
입력에 있어야 한다. `content/tool-boundary.json`의 금지 문구 검사는 대표적인
분석 주장이 builder로 역류하는 회귀를 차단한다.

## 금지한 안티패턴

- GitHub HTML 구조나 현재 원격 응답에 결합된 scraper;
- 특정 source symbol을 발견하면 결론 문장을 자동 선택하는 heuristic;
- renderer 안에서 REPL, QueryEngine, generator, permission의 의미를 판정하는
  조건문;
- source line 수나 키워드 빈도를 설계 품질 점수로 바꾸는 계산;
- 분석 원고를 바꾸기 위해 layout·PDF 생성 코드를 수정해야 하는 구조.

## 현재 남겨 둔 선택

분석 corpus는 반복되는 구조를 오타 없이 표현하고 exact source range 객체를
재사용하기 위해 선언적 JavaScript module로 유지한다. 이 module에는 파일 쓰기,
명령 실행, 네트워크 접근, source discovery, 자동 판정이 없다. 이후 다른 authoring
format이 필요하더라도 변환은 입력 형식의 문제이며 PDF 생성기의 분석 책임을
확대할 이유가 되지 않는다.

