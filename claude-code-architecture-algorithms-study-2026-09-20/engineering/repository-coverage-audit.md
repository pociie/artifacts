# 저장소 분석 범위 감사

이 감사는 파일·폴더 수를 보고서 품질 점수로 바꾸지 않는다. 저장소를 실제로
성립시키는 책임과 보장 질문을 14개 영역으로 나누고, 각 영역이 reader-facing
PDF에서 어느 정도 깊이로 다뤄지는지를 판정한다. 세부 criterion과 evidence
title은 `content/repository-coverage-rubric.json`이 소유하며 builder가 누락을
검사한다.

## 이번 감사에서 발견한 중요한 공백

기존 317쪽 edition은 turn loop, tool effect, permission, transcript recovery,
agent lifecycle, extension/configuration을 넓게 다뤘지만 다음 영역은 같은 깊이에
도달하지 못했다.

- provider stream은 “typed event transport”라는 결론만 있었고,
  `content_block_start/delta/stop`, partial tool JSON, 늦게 도착하는 usage와
  stop reason, idle watchdog의 실제 reconstruction algorithm이 없었다.
- hook는 tool pipeline의 한 단계로만 언급되어, workspace trust, matcher,
  command/prompt/agent/HTTP adapter, parallel fan-out, updated input, context,
  deny-overrides 합성이 설명되지 않았다.
- sandbox는 permission 비교표에만 있어, source별 path 문법, managed-only
  policy, filesystem/network capability projection, live config update와
  excluded-command heuristic의 비권위적 성격이 빠져 있었다.
- compaction과 transcript는 상세했지만 session memory가 별도 restricted agent,
  threshold scheduler, bounded-stale derived state라는 사실과 CLAUDE.md와의
  authority 차이가 없었다.
- remote는 surface 표에만 있었고 WebSocket close classification, bounded
  reconnect, SDK→local lossy adapter, bridge inbound command authority가 없었다.

## 보강 결과

| 책임 영역 | reader-facing 심층 근거 | 보강 뒤 판정 |
|---|---|---|
| Source truth와 reconstruction | 복원 build, stub, feature exclusion, 주장 수준 | 충족 |
| Process composition과 실행 표면 | CLI route, dynamic import, REPL/headless owner | 충족 |
| Interactive UI와 input | QueryGuard, ref/state, event coalescing, useInput authority | 충족 |
| Input·context·message model | input dispatch, prompt composition, runtime schema, projection | 충족 |
| Turn·generator protocol | suspension/terminal, query state, tool pairing | 충족 |
| Model transport | partial block reducer, late metadata aliasing, watchdog | 이번 edition에서 보강 |
| Tool runtime·concurrency | generic/runtime schema, batching, deterministic merge | 충족 |
| Authority·hook·sandbox | rule precedence, hook fan-out, HTTP trust, runtime capability | 이번 edition에서 보강 |
| File effect | Read precondition, optimistic Edit, committed-unobserved state | 충족 |
| Durability·compaction·memory | journal/DAG, cancellation, restore, restricted memory agent | 이번 edition에서 보강 |
| Agent·Task | nested query, sidechain filtering, parent/task/child truth | 충족 |
| Extension·remote·bridge | MCP/plugin/skill, bounded reconnect, SDK adapter | 이번 edition에서 보강 |
| Configuration·variability | build/runtime gate, precedence, remote policy, migration | 충족 |
| Operations·evolution | retry, telemetry, batching, replay oracle, refactor ordering | 충족 |

“충족”은 저장소의 모든 leaf command와 component를 설명했다는 뜻이 아니다. 해당
영역을 이해하고 변경 영향을 예측하는 데 필요한 owner, decisive transition,
mechanism, invariant, failure, operation/recovery, unknown 경계를 모두 갖췄다는
뜻이다. leaf 기능은 이 보장 모델을 바꾸는 경우에만 별도 심층 주제가 된다.

## 분량 정책

이 감사에는 page budget이 없다. 필수 논증이 길면 새 source reading이나
algorithm/theory page로 분리한다. 글자 크기 축소, code clipping, 한 문단 요약,
키워드 표로 필수 설명을 대신하는 것은 실패다. PDF 페이지 수는 모든 criterion을
충족한 뒤 계산되는 결과이며 coverage 선택 기준이 아니다.

## 남아 있는 검증 경계

고정 snapshot은 공식 upstream history, production feature value, remote server의
replay contract, OS별 sandbox-runtime 내부 구현 전체, 실제 telemetry backend를
제공하지 않는다. 이 공백은 더 많은 prose로 채우지 않고 UNKNOWN으로 남긴다.
중요한 것은 분량을 늘려 추측을 확장하는 일이 아니라, 관찰 가능한 client-side
algorithm과 확인 불가한 외부 contract의 경계를 더 정확히 만드는 일이다.

