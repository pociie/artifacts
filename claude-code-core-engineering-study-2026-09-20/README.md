# Claude Code 핵심 엔지니어링 스터디

이 개정판은 기능 목록이나 탐색 증거를 중심에 놓지 않는다. 저장소가 실제로 해결해야 하는 핵심 개발 문제를 다음 네 축으로 재구성한다.

1. 문맥을 모델 요청으로 컴파일하는 과정
2. 모델 제안을 권한 있는 저장소 효과로 바꾸는 tool runtime
3. streaming·중단·복구·resume를 포함해 한 turn을 정합적으로 닫는 conversation transaction
4. 이 의미를 보존하면서 구조를 진화시키는 refactoring 및 운영 방법

UI와 async generator는 독립적인 중심 주제가 아니라, 이 네 축에서 상태를 투영하고 시간 순서를 표현하는 구현 메커니즘으로 다룬다.

## PDF

- [00-core-product-model.pdf](./00-core-product-model.pdf) — Claude Code의 핵심 제품 모델 (19쪽)
- [01-context-as-program.pdf](./01-context-as-program.pdf) — 문맥을 프로그램으로 만드는 법 (20쪽)
- [02-effect-runtime-and-code-change.pdf](./02-effect-runtime-and-code-change.pdf) — 제안을 코드 효과로 바꾸는 런타임 (22쪽)
- [03-conversation-transaction-and-recovery.pdf](./03-conversation-transaction-and-recovery.pdf) — Turn을 복구 가능한 거래로 닫는 법 (22쪽)
- [04-structure-refactoring-and-product-operations.pdf](./04-structure-refactoring-and-product-operations.pdf) — 구조를 진화시키는 법 (21쪽)

총 104쪽이다. 모든 코드 링크는 clone의 고정 revision `2ca5ddabfed5f220812ea11f029eda03b21bc4c1`을 가리킨다.

## 분석 원본

- clone: `/Users/judangs/project/personal/orca/collab-mono/.collab/sources/stupidhumans/claude-code-source-code`
- upstream: https://github.com/stupidhumans/claude-code-source-code
- version 표기: v2.1.88
- 성격: 제3자 복원/교육용 저장소. README가 밝힌 누락 모듈과 불완전한 빌드 한계를 유지한다.

## 재현

`build-core-study.mjs`는 이 보고서 세트의 서술과 레이아웃을 생성한다. 소스 계측은 별도의 범용 도구로 분리했다.

```sh
node tools/typescript-architecture-metrics.mjs \
  --source ../../sources/stupidhumans/claude-code-source-code \
  --config study-config.json \
  --output metrics/core-architecture-metrics.json

node build-core-study.mjs
```

`typescript-architecture-metrics.mjs`에는 이 저장소의 이름·경로·분류가 하드코딩되어 있지 않다. source root와 JSON 규칙을 입력받아 다른 TypeScript/TSX 코드베이스에도 재사용할 수 있다. 이 프로젝트에만 해당하는 책임 분류와 검색어는 `study-config.json`에 선언한다.

## 계측 요약

- TypeScript/TSX 파일: 1,884개
- 물리 줄 수: 512,664줄
- async function: 2,953개
- generator / async generator: 55 / 50개
- await / yield: 5,238 / 204개

## 검증 범위

- clone revision 일치 확인
- 보고서 내부 source link의 파일 존재 및 line anchor 범위 확인
- 각 HTML sheet의 수직 overflow 검사
- Chromium PDF 렌더링 및 PDF header 확인
- cover preview 이미지 생성

분석 수치는 lexical/AST 계측 결과이지 제품 활성 기능 수나 조직적 중요도의 직접 척도가 아니다.
