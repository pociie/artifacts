# Reusable-artifact resolution

현재 inventory snapshot은 세 direct candidate를 반환했다.

- `work-pattern-context-resolution`: requirement, unknown, evidence와 표현 요구를
  criterion 수준으로 보존하는 데 적용한다.
- `job-application-report-production`: evidence → interpretation → consequence,
  prose freedom, no aggregate score, searchable PDF 검증만 재사용한다. 지원서
  schema, 다섯 후보, reviewer swarm, 점수와 제출 workflow는 제외한다.
- `report-information-design-and-raster-pdf-v6`: 카드 반복 억제, 목적에 맞는 표와
  시각 자산, 색상 외 의미 단서를 재사용한다. 채용 도메인과 output profile은
  제외한다.

Inventory는 일부 owner/scope/consumer/validation 사실을 unresolved로 보고하여
selection disposition을 `require_context`로 유지했다. 따라서 이 후보들은
runtime loop 활성화나 권한 근거로 쓰지 않고, 이미 선택된 task-local PDF
workflow를 해석하는 report-only decision support로만 사용한다. 별도 authority,
acceptance, publication 또는 canonical promotion은 주장하지 않는다.

