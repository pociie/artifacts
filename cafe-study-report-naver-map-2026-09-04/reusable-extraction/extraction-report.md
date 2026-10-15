# 카페 시각평가 아티팩트 추출·개선 보고서

## 결론

현재 카페 조사 산출물에서 즉시 공용 소스로 승격할 아티팩트는 없다. 기존
`Engineering Decision Rubric`, `Rubric Operation`, `Work Pattern Context
Resolution`, `Reusable Artifact Capability Lifecycle`을 합성하면 대부분의
구조적 책임을 이미 표현할 수 있다.

이번 작업에서는 다음 세 가지를 분리했다.

1. 네이버·중랑구/강동구·카페·가중치·30일 유효기간은 작업 한정
   `visual-rubric.json`에 유지했다.
2. 시각 자료의 적격성, 차원 범위, 비교, 불확실성, 관찰을 분리하는 작은
   공급자·도메인 중립 책임은 `visual-evidence-rubric-definition.candidate.json`
   으로 추출했다.
3. 이 후보는 한 공급자·한 도메인 사례뿐이고 공용 소유자와 독립 검증이
   없으므로 `require_context`로 닫았다. `artifacts/**` 공용 소스에는
   승격하지 않았다.

## 적용한 소유 구성

| 구성 | 이번 작업에서 맡은 책임 | 맡지 않는 책임 |
| --- | --- | --- |
| Artifact Reuse Resolution | 현재 인벤토리에서 관련 소유 후보 선별 | 후보의 진실성·승격·권한 |
| Reusable Artifact Capability Lifecycle | 책임 카드, 재사용 평가, 공백과 처분 | 공용 소스 자동 생성·승격 |
| Engineering Decision Rubric | 필수·자격·비교·관찰의 비보상적 순서 | 카페 선호 가중치와 장소 판정 |
| Rubric Operation | 작업·대상·소비자·모집단·자료원·유효기간·무효화 | 시각 태그의 도메인 의미 |
| Work Pattern Context Resolution | 책임·의존·검증·회복·패턴 중복 판정 | 구체 워커 수나 런타임 배치 |
| Prompt Design Quality Engineering | 결과·증거·정지 조건 중심의 평가 계약 | 프롬프트 본문 저장 또는 권한 부여 |

선택 요청은 현재 재사용 인벤토리 snapshot
`5d19a6069fe964f81fdc944ccdaee77ace3353ba033a264df0d51783ea2656bd`
에 결합했다. 결정적 선택기는 수명주기 루프, Engineering Evaluation 루프,
루브릭·재사용 지식, 프롬프트 품질 지식을 직접 후보로 반환했지만 인벤토리의
scope/effect 사실이 미확정이어서 결과는 `require_context`였다.

## visual-rubric v2 개선

기존 v1은 여섯 항목의 가중합 안에 `시각 근거 충실도`를 포함했다. 이 구조는
사진 수가 많은 장소가 실제 공부 환경의 부족을 일부 보상할 수 있고, 근거
부족·상충·판단 불가를 별도 상태로 보존하기 어렵다.

v2는 다음 순서로 바뀌었다.

1. **필수:** 네이버 내부사진 출처, 지역·카페 카테고리, 비시각 항목 추론 금지.
2. **자격:** 직접 유효한 사진 3장, 작업면 1장, 공간·통로 1장.
3. **비교:** 적격 장소에만 작업면 32, 좌석 21, 공간 21, 채광·뷰 16,
   인테리어 10의 작업 한정 가중치를 적용.
4. **관찰:** 근거 충실도, 배제 자료 분포, 평가자 합의도, 현장 결과 연결을
   순위와 분리.

가중치의 근거는 외부 표준이나 리뷰가 아니라 요청자의 이번 목표다. 따라서
정의가 아니라 작업 프로필에만 존재하고, 목표나 선호가 바뀌면 평가를
무효화한다. `evidenceSufficiency`는 기존 판정값을 보존하지만 총점 기여는
0이다. 정규화 결과 제이식스 상봉점과 투썸플레이스 신내점의 5·6위가
바뀌었고 나머지 순서는 유지됐다.

## 재사용 이외의 여섯 관점 판정

| 관점 | 판정 | 핵심 내용 |
| --- | --- | --- |
| 설계 | 개선 | 공용 정의 후보, 작업 프로필, 적격성, 비교, 관찰, 표현을 분리했다. |
| 개발 | 부분 충족 | 현재 보고서 검사기는 강화했지만 공용 후보 전용 스키마·독립 검사기는 없다. |
| 운영 | 제한부 충족 | 107장 동결, 브라우저 추가 순회 0, 단일 작성자, 실패 지문 정지가 명시됐다. 실제 소요 시간은 미측정이다. |
| 유지보수 | 개선 | revision, 정의 digest, 30일 유효기간, 무효화·롤백·다음 검토 조건을 추가했다. |
| 최적화 | 제한부 충족 | 후보·이미지·워커 상한과 한계효용 정지를 사용했다. 수용 결과와 연결된 시간·비용 효과는 주장하지 않는다. |
| 보안·권리 | 충족 | 공개 원격 URL과 최소 장소 메타데이터만 유지하고 쿠키·토큰·핸들·이미지 바이너리·프롬프트·비공개 추론을 저장하지 않는다. |

## 아티팩트 책임과 처분

| 책임 단위 | 파일 | 처분 | 이유 |
| --- | --- | --- | --- |
| 외부 증거 snapshot | `naver-map-raw-image-manifest.json` | 작업 한정 | 장소·URL·관찰 시점에 결합된 실행 증거 |
| 카페 작업 프로필 | `visual-rubric.json` | 작업 한정 개선 | 공급자·지역·선호·임계값·유효기간을 소유 |
| 시각 증거 커널 후보 | `visual-evidence-rubric-definition.candidate.json` | `require_context` | 안정 책임은 보이나 교차 맥락·소유자·독립 검증 없음 |
| 평가 결과 | `evaluation.json` | 작업 한정 | 정확한 장소·이미지·rubric revision에 결합 |
| 실행 토폴로지 | `optimized-agent-architecture.json` | 기존 구성 합성 | pipeline + bounded read-only fan-out + single-writer fan-in으로 충분 |
| 네이버 수집·복구 helper | `collect-*`, `recover-*` | 작업 한정 | 공급자 동작과 한 번의 복구 사례에 결합 |
| 통합·검사 | `integrate-*`, `validate-*` | 작업 한정 후보 | 결정적 부분은 유용하지만 카페 ID·태그·문구·호스트에 결합 |
| HTML 생성·결과 | `build-report.mjs`, HTML | 작업 한정 view | 생성 결과이며 카페 도메인 표현에 결합 |
| 라우팅·lane 판정 | routing/lane JSON | 실행 증거 | 현재 요청 revision과 worker lane에 결합 |

기계 판독 가능한 전체 표는 `artifact-disposition-matrix.json`에 있다.

## 에이전트 아키텍처 판정

재사용 단위는 “3개 워커”가 아니다. 안정된 부분은 다음 책임 그래프다.

```text
source collector (no scoring)
  -> immutable image manifest
  -> disjoint read-only visual evaluators (no shared writes)
  -> single integration owner
  -> deterministic source/gate/arithmetic/report validation
```

따라서 신규 Agent Architecture를 만들지 않고 기존 pipeline,
fan-out/fan-in, single-writer 경계를 합성했다. 같은 이미지를 두 평가자가
독립 판정하지 않았기 때문에 평가자 합의도와 오탐·미탐은 `unavailable`로
남겼다. 워커 이름, 워커 수, 워커당 장소 수, 네이버 탭 구조는 재사용
정체성에서 제외했다.

## 현재 구조가 아직 표현·검증하지 못하는 공백

시각 증거 단위의 `relevance`, `duplicate`, `occlusion`, `dimension coverage`,
`source-to-subject lineage`를 공용 도메인 중립 프로필로 표현하는 승인된 계약은
현재 인벤토리에서 확인하지 못했다. 그러나 이것이 곧 새 공용 구성의 필요성을
증명하지는 않는다. 기존 Engineering Rubric 소유자가 additive profile
adapter로 수용할지, 별도 contract/checker가 될지, 작업 프로필에 남을지는
공용 소유자와 두 번째 독립 맥락이 생긴 뒤 결정해야 한다.

공백 기록은 `visual-evidence-rubric.capability-gap.json`에 있으며
`residualGapProven: false`, `disposition: require_context`다.

## 승격 전 필요한 근거

- 다른 공급자 또는 다른 시각 선택 도메인의 독립 사례
- 동일 이미지의 독립 이중 판정과 평가자 합의도
- 양성·음성·모호·상충·중복·가림·실패·복구·무효화 케이스
- 오탐·미탐과 실제 사용 결과의 연결
- 공용 소유자·유지보수자·스키마·독립 검사기
- 마이그레이션·롤백·폐기와 기존 rubric family의 호환성 판정

이 조건 전에는 `.collab/artifacts/**`의 보고 전용 후보로만 유지한다.

## 생성·검증 기록

- `visual-rubric.json`: v2 작업 프로필
- `visual-evidence-rubric-definition.candidate.json`: 공용 책임 가설
- `visual-evidence-rubric.responsibility-card.json`: 기존 lifecycle schema 통과
- `visual-evidence-rubric.assessment.json`: 기존 assessment checker 통과,
  최종 `require_context`
- `visual-evidence-rubric.capability-gap.json`: 기존 gap checker 통과,
  `residualGapProven: false`
- `reusable-artifact-operation-request.json`: 현재 inventory digest에 결합,
  request checker 통과
- `reusable-artifact-selection-report.json`: 결정적 선택 결과
- `artifact-disposition-matrix.json`: 다관점 책임·처분 표
- `naver-map-cafe-study-report.html`: v2 점수와 관찰 지표로 재생성

모든 기록은 `authorityEffect: none`이며 공용 승격, 런타임 권한, 사용자 최종
선택 또는 실제 카페 적합성을 승인하지 않는다.
