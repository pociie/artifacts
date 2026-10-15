# Report-only Continuation Roadmap

이 문서는 후속 후보의 순서와 산출물 계약을 보여주는 report-only roadmap이다. 어떤
phase도 활성화·배정·수용되지 않았다. 실행을 선택할 경우 phase마다 별도 plan,
owner, digest-bound transition record가 필요하다.

## Phase 후보 A — Characterization baseline

**질문:** 현재 동작을 가장 작은 재현 단위로 어떻게 고정할 것인가?

산출물 후보:

- turn terminal-reason table과 fixture
- stream event → internal message projection fixture
- tool_use/tool_result pairing corpus
- transcript append/resume/compaction round-trip corpus

종료 기준은 정상·abort·partial stream·orphan tool use·context overflow case가 모두
재현되고, source revision과 fixture provenance가 묶이는 것이다.

## Phase 후보 B — Runtime trace map

**질문:** 정적 graph의 큰 SCC 중 실제 hot path에 존재하는 edge는 무엇인가?

산출물 후보:

- CLI 시작부터 첫 terminal result까지의 bounded trace
- tool permission/hook/execution timeline
- transcript write와 resume read trace
- static edge와 observed runtime edge의 차이

trace instrumentation은 개인정보와 prompt body를 저장하지 않아야 하며, source
snapshot만으로 실행 불가능한 feature는 `unknown`으로 남긴다.

## Phase 후보 C — Contract seams

**질문:** behavior를 보존하면서 어떤 pure policy를 먼저 분리할 수 있는가?

검토 순서:

1. API message normalization과 pairing repair
2. tool concurrency partition policy
3. compaction decision과 retry budget
4. file-edit stale check와 atomic write policy
5. reconnect/backoff policy

각 후보는 caller map, adapter dependency, differential fixture, compatibility facade가
있어야 한다. `query.ts`나 전체 `utils` 이동은 이 phase의 non-goal이다.

## Phase 후보 D — One vertical slice pilot

**질문:** 하나의 surface 또는 extension을 새 경계로 옮겨도 end-to-end 의미가 같은가?

pilot은 단일 surface/extension, 제한된 consumer, 되돌릴 수 있는 facade로 좁힌다.
package boundary, public entry, owner, rollback을 정하고 package-scoped 검증 후 wider
fitness를 실행한다.

## Phase 후보 E — Governance and maintenance

**질문:** 분석이 source 변화와 함께 낡지 않게 어떻게 관리할 것인가?

산출물 후보:

- source revision 변경 시 analyzer 재실행
- algorithm evidence line drift 검사
- module dependency budget 또는 허용 edge 정책
- fixture coverage와 unresolved import 추세
- claim lifecycle와 supersession 기록

이 후보들은 프로젝트 관리 장치이지 현재 source의 공식 규칙이 아니다. 실행 선택은
별도 결정으로 남는다.

