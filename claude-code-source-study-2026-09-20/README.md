# Claude Code v2.1.88 소스 학습 자료

고정 대상: [https://github.com/stupidhumans/claude-code-source-code](https://github.com/stupidhumans/claude-code-source-code) @ `2ca5ddabfed5f220812ea11f029eda03b21bc4c1`  
생성일: 2026-09-20

> 이 자료는 제3자 복원 저장소를 분석한 교육·연구용 파생 자료입니다. Anthropic의 공식 소스·공식 아키텍처 문서가 아닙니다. 저장소에 LICENSE 파일이 없고 README가 비상업적 학습 용도를 명시하므로, 원문 소스의 재배포·상업적 이용을 전제로 하지 않습니다.

| 권 | 제목 | PDF 페이지 | 파일 |
|---|---|---:|---|
| 00 | 학습 지도와 분석 범위 | 13 | [PDF](00-study-roadmap-and-scope.pdf) · [HTML](html/00-study-roadmap-and-scope.html) |
| 01 | 시스템 지도와 코드 아틀라스 | 17 | [PDF](01-system-map-and-code-atlas.pdf) · [HTML](html/01-system-map-and-code-atlas.html) |
| 02 | 언어 메커니즘과 프로그래밍 표현 | 23 | [PDF](02-language-mechanisms-and-programming-expressions.pdf) · [HTML](html/02-language-mechanisms-and-programming-expressions.html) |
| 03 | 에이전트 루프·스트리밍·도구 런타임 | 20 | [PDF](03-agent-loop-streaming-and-tool-runtime.pdf) · [HTML](html/03-agent-loop-streaming-and-tool-runtime.html) |
| 04 | React·Ink 터미널 UI | 18 | [PDF](04-react-ink-terminal-ui.pdf) · [HTML](html/04-react-ink-terminal-ui.html) |
| 05 | 권한·보안·확장성 | 18 | [PDF](05-permissions-security-and-extensibility.pdf) · [HTML](html/05-permissions-security-and-extensibility.html) |
| 06 | 실습·리뷰·스터디 가이드 | 23 | [PDF](06-labs-review-and-study-guide.pdf) · [HTML](html/06-labs-review-and-study-guide.html) |

## 추천 순서

00 → 01 → 02 → 03 → 04 → 05 → 06. 빠른 스터디는 00, 02, 03, 04, 06을 먼저 읽으세요.

## 범주 설계

- 00은 자료의 신뢰 수준, 범위, 두 참고 영상과의 연결, 학습 경로를 정의합니다.
- 01은 디렉터리·의존성·상태 소유권·확장 계층을 시스템 지도로 만듭니다.
- 02는 async generator, yield/return, union, generic, schema, AbortSignal, using 등 언어 메커니즘을 제품 요구와 연결합니다.
- 03은 query loop, streaming, context 관리, tool scheduling, recovery, terminal settlement를 다룹니다.
- 04는 입력 이벤트부터 React/Ink reconciler, Yoga layout, ANSI diff, Static scrollback까지 추적합니다.
- 05는 permission, capability/effect, hooks, MCP, plugin/skill 신뢰 경계를 분석합니다.
- 06은 8주 운영안, 12개 실습, 리뷰 체크리스트, 평가 루브릭을 제공합니다.

## 정적 분석 요약

- TypeScript/TSX 파일: 1,884개
- 물리 라인: 512,664줄
- async generator: 50개
- for-await: 65개
- feature() 호출: 935개
- React useState 호출: 596개

## 재현과 검증

생성기는 소스 경로를 인자로 받습니다: `node build-study-pack.mjs /path/to/checked-out-repository`. 고정 커밋을 checkout한 뒤 실행해야 링크와 수치가 맞습니다. 생성 과정은 모든 HTML sheet의 A4 PDF 변환과 manifest 기록을 포함합니다.

재현용 분석 수치는 [metrics/source-metrics.json](metrics/source-metrics.json), 산출물 manifest는 [study-pack-manifest.json](study-pack-manifest.json), 생성 코드는 [build-study-pack.mjs](build-study-pack.mjs)에 있습니다.
