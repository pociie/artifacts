# 단계별 품질 rubric 적용 기록

이 기록은 하나의 총점으로 보고서 품질을 압축하지 않는다. 각 checkpoint는 그
판단이 필요한 시점에 따로 적용하며, 실패는 다음 단계에서 상쇄되지 않고 수정
대상으로 남는다.

| 적용 시점 | checkpoint | 최초 판정과 근거 | 교정 | 재판정 증거 |
|---|---|---|---|---|
| 전체 대화를 다시 읽은 직후 | `requirement_readiness` | **수정 필요.** 기존 chronology는 요청을 17개 합성 항목으로만 보존해, 반복된 불만과 영상의 제한된 역할, timely rubric, content/tool 경계를 독립적으로 추적하지 못했다. | T01–T22 전체 세션 원장과 R18–R22를 추가하고 선택 artifact 범위를 동결했다. | `full-session-requirement-audit.md`, `requirement-chronology.md`, `reuse-coverage.md`. |
| 분석 범위를 선택하고 닫기 전 | `repository_coverage` | **수정 필요.** 기존 edition은 provider stream reconstruction, hook fan-out, sandbox capability projection, session memory, remote transport가 표나 단일 문장 수준에 머물렀다. | 14개 responsibility domain rubric을 만들고 5개 공백에 source reading·알고리즘·matrix·failure analysis를 추가했다. page cap과 summary 대체를 금지했다. | `repository-coverage-rubric.json`, `repository-coverage-audit.md`, A39–A44와 관련 code reading. |
| UI 사례를 쓰기 전과 각 code reading을 검토할 때 | `source_and_mechanism` | **부분 충족.** generator는 상세했지만 UI는 “React callback”과 “Ink projection” 수준이어서 문법 아래의 시간·상태 메커니즘이 부족했다. | QueryGuard/useSyncExternalStore, eager ref projection, event coalescing, useInput authority를 exact source로 추가했다. 영상은 접근 참고로만 표시했다. | 02권의 새 장, 03권 M01, source range validator. |
| algorithm 원고가 갖춰진 뒤 | `algorithm_assurance` | **수정 필요.** A01–A38은 입력·전이·불변조건·반례를 가졌지만 theory 설명을 assurance page 하단에 압축해 읽기와 논증을 약화했다. | 각 알고리즘을 문제·source, state transition, assurance, theory application의 네 movement로 분리했다. | 38개 algorithm theory page, content contract, representative render review. |
| theory term을 배치할 때 | `theory_applicability` | **충족.** 용어 빈도를 중요도 점수로 사용하지 않고 7개 보장 질문에 정확히 하나씩 분류했다. | 각 theory page에서 특정 invariant와 failure에 다시 연결했다. | `theory-distribution.md`, exact-one-category check. |
| 첫 prose pass 뒤 | `narrative_expression` | **수정 필요.** 이전 도식의 번호 label과 반복 bridge 문장이 관계를 스스로 설명하지 못했다. | 번호 대신 책임 label을 쓰고, 현재 단계의 보장이 다음 단계의 어떤 조건이 되는지 동적 산문으로 바꿨다. 영상·artifact 작업 맥락은 reader-facing 본문에서 제외했다. | system map, walkthrough, transition page의 searchable prose; excluded-phrase scan. |
| HTML render 직후 | `visual_explanation` | **재검증 대기.** 이전 268쪽 build의 대표 페이지는 통과했지만 새 algorithm theory page와 UI 장은 아직 최종 render review 전이다. | overflow와 inner clipping을 먼저 자동 검사하고, 새 UI code spread·algorithm theory·system map을 육안 검토한다. | 최종 build 후 `visual-review.md`에 갱신한다. |
| handoff 직전 | `publication_integrity` | **재검증 대기.** 고정 clone과 source range 검증은 유지되지만 새 원고를 포함한 PDF page count와 대표 시각 검토가 필요하다. | 6권 전체 rebuild, semantic checks, page parity, target clone clean check를 다시 실행한다. | 최종 manifest와 `validation.md`로 닫는다. |

현재 “재검증 대기”는 실패를 숨기지 않기 위한 상태다. 최종 빌드가 성공하더라도
각 checkpoint의 근거를 따로 남기며 aggregate score는 만들지 않는다.
