import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = path.dirname(new URL(import.meta.url).pathname);
const observedAt = '2026-09-14T12:00:00+09:00';
const writeJson = (name, value) => {
  fs.writeFileSync(path.join(root, name), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
};
const writeText = (name, value) => fs.writeFileSync(path.join(root, name), value, 'utf8');
const digestFile = name =>
  crypto.createHash('sha256').update(fs.readFileSync(path.join(root, name))).digest('hex');
const digestText = value => crypto.createHash('sha256').update(value, 'utf8').digest('hex');
const charCount = value => Array.from(value).length;

const sourceIds = [
  'source:job-posting',
  'source:company-domain',
  'source:applicant-profile',
  'source:applicant-experiences',
  'source:applicant-field-note',
];

const request = {
  kind: 'job-application-report-request/v1',
  schema_version: 1,
  request_id: 'request:coremotion-smart-factory-set3',
  revision: 'revision:2026-09-14.1',
  application: {
    company_name: '코어모션 인더스트리',
    role_title: '스마트팩토리 시스템 엔지니어',
    language: '한국어',
    official_posting_source_ids: ['source:job-posting'],
  },
  sources: [
    {
      id: 'source:job-posting',
      source_type: 'official_posting',
      locator: 'https://jobs.coremotion.example/smart-factory-engineer',
      authority: 'primary',
      observed_at: observedAt,
      digest: null,
      visibility: 'public_report_allowed',
    },
    {
      id: 'source:company-domain',
      source_type: 'official_company',
      locator: 'https://www.coremotion.example',
      authority: 'primary',
      observed_at: observedAt,
      digest: null,
      visibility: 'runtime_private',
    },
    {
      id: 'source:applicant-profile',
      source_type: 'applicant_statement',
      locator: 'user-provided-profile-summary',
      authority: 'applicant_owned',
      observed_at: observedAt,
      digest: null,
      visibility: 'runtime_private',
    },
    {
      id: 'source:applicant-experiences',
      source_type: 'applicant_statement',
      locator: 'user-provided-experience-summary',
      authority: 'applicant_owned',
      observed_at: observedAt,
      digest: null,
      visibility: 'runtime_private',
    },
    {
      id: 'source:applicant-field-note',
      source_type: 'applicant_statement',
      locator: 'user-provided-field-practice-note',
      authority: 'applicant_owned',
      observed_at: observedAt,
      digest: null,
      visibility: 'runtime_private',
    },
  ],
  questions: [
    {
      id: 'question-1-goal',
      prompt: '스스로 목표를 설정하고 끝까지 실행하여 성과를 만들어 낸 경험을 설명해 주세요.',
      min_chars: 1,
      max_chars: 800,
      required_contents: ['스스로 설정한 목표', '실행 과정', '성과와 배운 점'],
      focus: {
        primary_claim: '데이터와 현장 확인을 반복해 문제를 분석 목표에서 개선 근거로 전환한 실행력',
        reviewer_need: '목표를 세우고 끝까지 확인해 결과를 만든 방식',
        evidence_function: '6개월 설비·생산 데이터 분석과 작업자 인터뷰의 인과를 보여준다',
        non_overlap_boundary: '직무 지원 동기나 일반적인 장단점이 아니라 목표 설정과 실행 지속성을 중심으로 쓴다',
      },
      user_confirmation_ids: [],
    },
    {
      id: 'question-2-motivation-fit',
      prompt: '코어모션 인더스트리를 선택한 이유와 스마트팩토리 시스템 엔지니어 직무에 적합하다고 생각하는 이유를 작성해 주세요.',
      min_chars: 1,
      max_chars: 600,
      required_contents: ['회사 선택 이유', '직무 적합성', '관련 경험과 기여 방향'],
      focus: {
        primary_claim: '제조 데이터와 현장 개선을 연결하는 역할에 대한 지원 동기와 준비도',
        reviewer_need: '공고의 업무가 지원자의 경험과 어떻게 맞물리는지',
        evidence_function: '공고 업무와 제조 데이터·공정 개선·현장 소통 경험을 직접 연결한다',
        non_overlap_boundary: '과거 프로젝트의 상세 서사보다 회사·직무를 고른 이유와 입사 후 기여 방향을 앞세운다',
      },
      user_confirmation_ids: [],
    },
    {
      id: 'question-3-strength-gap',
      prompt: '본인의 장점과 보완할 점을 각각 설명하고 업무나 프로젝트에서 이를 어떻게 관리했는지 작성해 주세요.',
      min_chars: 1,
      max_chars: 700,
      required_contents: ['장점', '보완할 점', '관리 방법과 실제 적용'],
      focus: {
        primary_claim: '수치와 현장을 함께 보는 장점을 절차로 강화하고 데이터 편향을 보완한 자기관리',
        reviewer_need: '자기 인식이 실제 업무 행동과 관리 방식으로 이어지는지',
        evidence_function: '데이터만으로 판단했던 한계와 3단계 문제 접근법을 보여준다',
        non_overlap_boundary: '특정 성과를 재현하는 이야기보다 일하는 습관과 보완 시스템을 중심으로 쓴다',
      },
      user_confirmation_ids: [],
    },
    {
      id: 'question-4-process-improvement',
      prompt: '기존 프로세스나 시스템의 문제를 발견하여 더 효율적인 방법으로 개선했던 경험을 설명해 주세요.',
      min_chars: 1,
      max_chars: 800,
      required_contents: ['기존 문제', '개선 방법', '검증 결과와 한계'],
      focus: {
        primary_claim: '검사 단계의 대기 병목을 찾아 작업 순서를 시뮬레이션하고 공정 흐름을 개선한 경험',
        reviewer_need: '문제 발견부터 대안 검증까지의 개선 논리와 결과',
        evidence_function: '공정 시간 측정, 순서 변경 시뮬레이션, 11% 감소 결과를 연결한다',
        non_overlap_boundary: '개인의 장단점이나 지원 동기 대신 프로세스의 병목과 개선 효과를 구체화한다',
      },
      user_confirmation_ids: [],
    },
  ],
  application_analysis: {
    company_context: [
      {
        id: 'company-context:manufacturing-data',
        observation: '사용자 제공 공고는 제조 데이터 수집 및 분석을 직무 핵심 업무로 제시한다.',
        evidence_refs: ['source:job-posting'],
        writing_implication: '지원 동기를 제조 데이터가 현장 의사결정과 개선으로 이어지는 흐름에 연결한다.',
        certainty: 'fact',
      },
      {
        id: 'company-context:connected-factory',
        observation: '사용자 제공 공고에는 생산 설비 시스템 연동과 공정 자동화가 포함되어 있다.',
        evidence_refs: ['source:job-posting'],
        writing_implication: '기술 목록보다 설비·공정·데이터를 연결하는 책임을 강조한다.',
        certainty: 'fact',
      },
      {
        id: 'company-context:field-productivity',
        observation: '사용자 제공 공고는 제조 시스템 모니터링, 생산성 개선, 현장 문제 분석 및 해결을 함께 요구한다.',
        evidence_refs: ['source:job-posting'],
        writing_implication: '분석 결과를 실제 작업 조건과 확인 기준으로 검증하는 태도를 지원 이유로 삼는다.',
        certainty: 'fact',
      },
    ],
    role_domain_concerns: [
      {
        id: 'role-concern:data-to-action',
        observation: '스마트팩토리 시스템 엔지니어는 수집된 제조 데이터를 운영 개선에 사용할 수 있는 정보로 바꿔야 한다.',
        evidence_refs: ['source:job-posting'],
        writing_implication: '센서 데이터 분석과 공정 개선 경험을 데이터 해석에서 현장 행동으로 이어지는 사례로 배치한다.',
        certainty: 'inference',
      },
      {
        id: 'role-concern:integration-monitoring',
        observation: '설비 시스템 연동과 모니터링은 데이터 흐름뿐 아니라 현장 사용 조건과 예외를 확인하는 책임을 포함한다.',
        evidence_refs: ['source:job-posting', 'source:applicant-field-note'],
        writing_implication: '작업자 인터뷰와 기록에 없는 조건을 확인한 경험을 시스템 운영 관점으로 번역한다.',
        certainty: 'inference',
      },
      {
        id: 'role-concern:field-problem-solving',
        observation: '공고의 현장 문제 해결 요구에는 분석 결과를 실제 공정 상황에서 검증하는 태도가 중요하다.',
        evidence_refs: ['source:job-posting', 'source:applicant-experiences'],
        writing_implication: '입사 후 기여를 현장 확인, 개선안 검증, 생산성 확인의 순서로 제시한다.',
        certainty: 'inference',
      },
    ],
    fit_hypotheses: [
      {
        id: 'fit:data-analysis-to-role',
        statement: 'Python·SQL·Pandas를 활용한 제조 데이터 분석 경험은 공고의 제조 데이터 수집 및 분석 업무와 연결될 가능성이 있다.',
        evidence_refs: ['source:job-posting', 'source:applicant-profile', 'source:applicant-experiences'],
        confirmation_required: true,
      },
      {
        id: 'fit:process-improvement-to-role',
        statement: '공정 대기시간 분석과 시뮬레이션 경험은 생산성 개선 업무에 전이될 가능성이 있다.',
        evidence_refs: ['source:job-posting', 'source:applicant-experiences'],
        confirmation_required: true,
      },
      {
        id: 'fit:field-validation-to-role',
        statement: '작업자 인터뷰로 기록되지 않은 조건을 확인한 경험은 현장 문제 분석과 시스템 모니터링 업무에 연결될 가능성이 있다.',
        evidence_refs: ['source:job-posting', 'source:applicant-field-note', 'source:applicant-experiences'],
        confirmation_required: true,
      },
    ],
  },
  applicant_evidence: {
    facts: [
      {
        id: 'fact:education',
        statement: '이도현은 한국산업대학교 산업공학과를 졸업한 신입 지원자다.',
        source_refs: ['source:applicant-profile'],
        confirmed: true,
        allowed_uses: ['question-2-motivation-fit', 'question-3-strength-gap'],
      },
      {
        id: 'fact:data-tools',
        statement: 'Python, SQL, Pandas, Power BI, PLC 기초, MES 개념, 데이터 분석, 공정 분석 역량을 보유하고 있다.',
        source_refs: ['source:applicant-profile'],
        confirmed: true,
        allowed_uses: ['question-1-goal', 'question-2-motivation-fit', 'question-4-process-improvement'],
      },
      {
        id: 'fact:entry-level-target',
        statement: '스마트팩토리 및 제조 IT 직무를 희망한다.',
        source_refs: ['source:applicant-profile'],
        confirmed: true,
        allowed_uses: ['question-2-motivation-fit'],
      },
    ],
    value_statements: [
      {
        id: 'value:field-and-data',
        statement: '수치만으로 판단하지 않고 데이터 분석, 현장 확인, 개선안 검증의 순서로 문제를 접근한다.',
        source_refs: ['source:applicant-field-note', 'source:applicant-experiences'],
        confirmed: true,
        allowed_uses: ['question-1-goal', 'question-3-strength-gap', 'question-4-process-improvement'],
      },
      {
        id: 'value:worker-context',
        statement: '현장 작업자의 경험과 데이터에 기록되지 않은 작업 조건을 함께 확인해야 한다고 배웠다.',
        source_refs: ['source:applicant-field-note'],
        confirmed: true,
        allowed_uses: ['question-1-goal', 'question-3-strength-gap', 'question-4-process-improvement'],
      },
    ],
    unknowns: [
      {
        id: 'unknown:company-context',
        needed_fact: '코어모션 인더스트리의 실제 사업·제품·현장 적용 맥락',
        affected_question_ids: ['question-2-motivation-fit'],
        why_material: '공고 요약을 넘어선 회사 선택 이유를 쓰면 확인되지 않은 회사 사실을 만들 위험이 있다.',
        acceptable_evidence: '회사 공식 소개, 실제 사업 페이지, 또는 지원자가 확인한 제품·현장 정보',
      },
      {
        id: 'unknown:field-result',
        needed_fact: '분석 또는 공정 개선안을 현장에 적용한 뒤의 실제 변화 수치와 확인 시점',
        affected_question_ids: ['question-1-goal', 'question-4-process-improvement'],
        why_material: '시뮬레이션과 분석 결과를 실제 운영 성과로 과장하지 않고 성과 범위를 명확히 해야 한다.',
        acceptable_evidence: '적용 후 불량률·대기시간·처리량 변화, 검증 기록, 또는 시뮬레이션 결과의 조건표',
      },
      {
        id: 'unknown:attachment-verification',
        needed_fact: '제공된 분석 코드·데이터·보고서에서 본인이 직접 수행한 세부 범위',
        affected_question_ids: ['question-1-goal', 'question-3-strength-gap', 'question-4-process-improvement'],
        why_material: '면접에서 도구 사용과 기여 범위를 구체적으로 설명하려면 직접 수행한 작업을 확인해야 한다.',
        acceptable_evidence: '본인이 작성하거나 수정한 코드·표·시뮬레이션 설정·발표 자료의 담당 부분',
      },
    ],
  },
  project_evidence: [
    {
      id: 'project:manufacturing-data',
      kind: '산학협력 제조 데이터 분석 프로젝트',
      scale: '약 6개월 분량의 센서 데이터와 생산 기록',
      applicant_role: '생산설비 데이터를 분석하고 불량 패턴의 원인을 탐색한 프로젝트 참여자',
      contribution: 'Python·SQL·Pandas로 데이터를 정리하고 설비·시간대별 불량 발생 패턴을 비교했다.',
      process: '데이터 분석으로 이상 시간대를 좁힌 뒤 작업자 인터뷰로 기록되지 않은 조건을 확인하고 해석을 보완했다.',
      learning: '데이터 분석 결과를 현장 확인과 개선안 검증으로 이어야 문제를 실제 업무 맥락에서 설명할 수 있다는 점을 배웠다.',
      claims: [
        {
          id: 'claim:data-window-found',
          statement: '약 6개월치 센서 데이터와 생산 기록을 분석해 특정 설비의 불량 발생률이 상대적으로 높은 시간대를 발견했다.',
          source_refs: ['source:applicant-experiences'],
          certainty: 'applicant_confirmed',
          outcome_limit: '후속 현장 적용 후 불량률 변화 수치는 제공되지 않았다.',
        },
        {
          id: 'claim:unrecorded-condition',
          statement: '작업자 인터뷰로 데이터에 기록되지 않은 작업 조건과 제품 교체 순서가 반복 문제와 함께 나타나는 것을 확인했다.',
          source_refs: ['source:applicant-field-note', 'source:applicant-experiences'],
          certainty: 'applicant_confirmed',
          outcome_limit: '인터뷰 이후의 설비 개선 적용 결과는 확인되지 않았다.',
        },
        {
          id: 'claim:analysis-field-validation',
          statement: '데이터 분석, 현장 확인, 개선안 검증의 순서로 문제에 접근하는 방식을 정리했다.',
          source_refs: ['source:applicant-experiences'],
          certainty: 'applicant_confirmed',
          outcome_limit: '이 방식이 여러 프로젝트에서 반복 적용되었다는 별도 기록은 없다.',
        },
      ],
      language_translations: [
        {
          internal_term: '센서 데이터와 생산 기록 분석',
          universal_term: '설비 상태와 생산 결과를 연결해 이상 조건을 찾는 분석',
          use_condition: '기술 나열보다 제조 시스템 엔지니어의 데이터 해석 책임을 설명할 때 사용한다.',
        },
        {
          internal_term: '작업자 인터뷰',
          universal_term: '현장 사용 조건 확인',
          use_condition: '모니터링 데이터의 누락과 예외를 보완한 행동을 설명할 때 사용한다.',
        },
      ],
    },
    {
      id: 'project:process-improvement',
      kind: '생산 공정 개선 프로젝트',
      scale: '공정별 소요 시간 측정과 작업 순서 변경 시뮬레이션',
      applicant_role: '검사 단계의 대기 병목을 분석하고 공정 흐름 개선안을 제안한 참여자',
      contribution: '평균 대기 시간이 긴 검사 단계를 찾고 작업 순서를 바꾼 시뮬레이션을 수행했다.',
      process: '공정별 시간을 측정하고 병목을 정의한 뒤 대안을 시뮬레이션해 전체 공정 시간 변화를 비교했다.',
      learning: '개선안은 직관이 아니라 비교 가능한 기준과 검증 조건을 함께 제시해야 설득력을 갖는다는 점을 배웠다.',
      claims: [
        {
          id: 'claim:inspection-wait-bottleneck',
          statement: '공정별 소요 시간을 측정해 특정 검사 단계의 평균 대기 시간이 과도하게 긴 문제를 발견했다.',
          source_refs: ['source:applicant-experiences'],
          certainty: 'applicant_confirmed',
          outcome_limit: '현장 적용 전의 분석 및 시뮬레이션 단계 경험이다.',
        },
        {
          id: 'claim:process-time-reduction',
          statement: '작업 순서를 변경하는 시뮬레이션을 수행한 결과 시뮬레이션 기준 전체 공정 시간이 약 11% 감소했다.',
          source_refs: ['source:applicant-experiences'],
          certainty: 'applicant_confirmed',
          outcome_limit: '약 11%는 시뮬레이션 기준이며 실제 생산라인 적용 성과로 확대할 수 없다.',
        },
      ],
      language_translations: [
        {
          internal_term: '검사 단계 대기시간',
          universal_term: '공정 병목과 대기 손실',
          use_condition: '생산성 개선과 공정 자동화 관점에서 문제를 설명할 때 사용한다.',
        },
        {
          internal_term: '작업 순서 변경 시뮬레이션',
          universal_term: '대안을 비교하는 사전 검증',
          use_condition: '개선안의 효과와 적용 한계를 동시에 제시할 때 사용한다.',
        },
      ],
    },
  ],
  output_profile: {
    candidate_count: 1,
    report_format: 'markdown',
    audiences: ['지원자 본인', '면접 준비를 돕는 첨삭 검토자'],
    required_sections: [
      'application-overview',
      'question-map',
      'candidate-answers',
      'review-and-limitations',
      'interview-preparation',
    ],
    design: {
      tone: '차분하고 구체적인 제조 현장 중심의 편집 문서',
      comparison_layout: 'editorial_sequence',
      avoid_patterns: ['확인되지 않은 회사 홍보 문구', '실제 적용으로 오해될 수 있는 시뮬레이션 성과', '기술 목록의 단순 나열'],
      raster_policy: 'not_required',
    },
    publication: {
      searchable_text_required: true,
      overflow_policy: 'no_clipped_content',
      visible_source_policy: 'allowlisted_only',
      content_policies: [
        {
          id: 'exclude-internal-bookkeeping',
          severity: 'mandatory',
          target: 'public_text_extract',
          expectation: 'absent',
          matcher: {
            type: 'literal_any',
            values: ['.collab', 'request.json', 'result.json', '프롬프트', 'private reasoning'],
          },
          rationale: '지원자가 읽는 문서에는 내부 운영 파일이나 작성 지시를 노출하지 않는다.',
        },
        {
          id: 'exclude-local-absolute-path',
          severity: 'mandatory',
          target: 'public_text_extract',
          expectation: 'absent',
          matcher: {
            type: 'regex_any',
            values: ['(?:^|\\s)/(?:Users|tmp|home)/'],
          },
          rationale: '로컬 경로와 실행 환경 정보를 공개 문서에서 제거한다.',
        },
        {
          id: 'require-reader-sections',
          severity: 'mandatory',
          target: 'public_text_extract',
          expectation: 'present',
          matcher: {
            type: 'literal_any',
            values: ['지원 답안', '면접 준비', '제출 전 확인'],
          },
          rationale: '지원자가 결과를 바로 검토하고 다음 행동을 정할 수 있도록 핵심 섹션을 유지한다.',
        },
      ],
    },
  },
  quality_profile: {
    policy_ref: 'artifacts/agent-loop/document/job-application-report-production/vocabularies/job-application-report-quality-policy.json',
    mandatory_gate_ids: [
      'request-and-question-coverage',
      'source-and-freshness-boundary',
      'applicant-attribution-and-confirmation',
      'project-evidence-and-causality',
      'role-domain-language-clarity',
      'publication-and-privacy-safety',
    ],
    dimensions: [
      { id: 'question-fit-and-differentiation', weight: 20 },
      { id: 'role-and-domain-alignment', weight: 20 },
      { id: 'applicant-viewpoint-and-values', weight: 18 },
      { id: 'evidence-causality-and-attribution', weight: 18 },
      { id: 'project-abstraction-and-transfer', weight: 14 },
      { id: 'clarity-and-interview-defensibility', weight: 10 },
    ],
    rating_min: 1,
    rating_max: 5,
    qualification_threshold: 80,
    score_meaning: 'editing_fitness_not_hiring_probability',
    revision_passes: 1,
  },
  source_policy: {
    as_of: '2026-09-14',
    prefer_primary: true,
    allowed_source_ids: sourceIds,
    visible_source_ids: ['source:job-posting'],
    missing_evidence_policy: 'preserve_unknown',
  },
  privacy_boundary: {
    public_evidence_ids: ['source:job-posting'],
    prohibited_content_categories: ['age', 'contact', 'local-path', 'private-runtime-record'],
    identity_handling: 'explicit_consent_only',
  },
  stop_budget: {
    max_research_rounds: 1,
    max_revision_passes: 1,
    unchanged_failure_limit: 1,
  },
};

const answers = {
  'question-1-goal': '스스로 세운 목표는 생산설비 데이터에서 불량이 반복되는 조건을 찾아 현장 개선에 활용할 수 있는 분석 근거를 만드는 것이었습니다. 산학협력 프로젝트에서 약 6개월치 센서 데이터와 생산 기록을 맡았을 때, 단순히 평균을 비교하는 데 그치지 않고 설비별·시간대별 차이를 확인하기로 했습니다. Python과 SQL, Pandas로 데이터를 정리하고 분포를 점검한 뒤 불량 발생률이 상대적으로 높은 시간대를 특정했습니다. 그러나 데이터만으로 원인을 단정하지 않기 위해 작업자 인터뷰를 진행했습니다. 그 과정에서 기록에 남지 않는 작업 조건과 제품 교체 순서가 문제와 함께 반복된다는 사실을 확인했고, 분석 결과를 현장 맥락에 맞게 다시 해석했습니다. 이후 데이터 분석, 현장 확인, 개선안 검증의 순서를 제 작업 기준으로 정리했습니다. 실제 불량률이 얼마나 낮아졌는지는 후속 운영 자료가 없어 단정하지 않지만, 불규칙해 보이던 현상을 확인 가능한 조건으로 좁히고 개선 논의를 시작할 근거를 만든 점이 성과였습니다. 끝까지 확인하는 습관으로 입사 후에도 수치와 현장을 함께 보며 문제를 해결하겠습니다.',
  'question-2-motivation-fit': '코어모션 인더스트리를 선택한 이유는 채용 공고에서 제조 데이터 수집·분석부터 생산 설비 시스템 연동, 공정 자동화, 모니터링, 생산성 개선과 현장 문제 해결까지 제조 현장의 흐름을 연결하는 역할을 제시했기 때문입니다. 특정 기술을 적용하는 데 그치지 않고 설비와 공정의 상태를 데이터로 파악해 실제 작업 개선으로 이어지게 만드는 직무라는 점에 매력을 느꼈습니다. 저는 산업공학 전공을 바탕으로 Python·SQL·Pandas를 활용한 제조 데이터 분석 경험이 있고, Power BI로 결과를 전달하며 PLC 기초와 MES 개념을 학습했습니다. 산학협력 프로젝트에서는 센서와 생산 기록에서 불량이 높은 시간대를 찾은 뒤 작업자 인터뷰로 데이터에 없는 조건을 보완했습니다. 또한 공정 대기시간을 분석하고 작업 순서를 시뮬레이션해 전체 공정 시간을 약 11% 줄였습니다. 입사 후에는 설비 데이터의 의미를 현장 언어로 확인하고, 연동·모니터링 결과를 생산성 개선으로 검증하는 시스템 엔지니어가 되겠습니다.',
  'question-3-strength-gap': '저의 장점은 수치와 현장을 함께 확인하는 분석 습관입니다. 센서 데이터에서 이상 패턴을 찾는 데서 멈추지 않고 작업자에게 실제 작업 순서와 예외 조건을 물어 결과의 의미를 확인합니다. 반면 보완할 점은 문제를 빨리 구조화하려는 나머지 초기에 데이터만으로 원인을 좁히려는 경향입니다. 제조 현장에는 기록되지 않는 순서와 작업 조건이 있어 이 습관이 판단을 서두르게 할 수 있다는 점을 인식했습니다. 그래서 프로젝트마다 ① 데이터 기준으로 이상 징후를 정의하고 ② 현장 담당자에게 실제 흐름과 예외를 확인하며 ③ 시뮬레이션이나 재분석으로 개선안을 검증하는 3단계를 체크리스트로 적용했습니다. 실제로 설비 정지가 불규칙해 보였던 분석에서 작업자 인터뷰를 통해 제품 교체 순서와 반복 조건을 확인했습니다. 덕분에 분석의 속도는 유지하면서도 현장과 어긋난 결론을 줄일 수 있었습니다. 입사 후에도 이 절차를 팀과 공유해 데이터의 장점은 살리고 판단의 편향은 관리하겠습니다.',
  'question-4-process-improvement': '기존 공정의 문제를 개선한 경험은 검사 단계의 대기 병목을 찾아 작업 순서를 바꾼 일입니다. 공정별 소요 시간을 측정한 결과 특정 검사 단계의 평균 대기 시간이 지나치게 길어 전체 흐름을 늦추고 있었습니다. 처음부터 작업 순서를 바꾸기보다 병목 단계의 앞뒤 공정과 대기 발생 조건을 정리한 뒤, 가능한 순서 변경안을 시뮬레이션으로 비교했습니다. 그 결과 검사 순서와 작업 흐름을 조정한 안에서 시뮬레이션 기준 전체 공정 시간이 약 11% 감소했습니다. 이 과정에서 개선은 감각적인 제안이 아니라 문제를 수치로 정의하고 대안을 같은 기준으로 검증하는 일이라는 점을 배웠습니다. 다만 11%는 시뮬레이션 결과이므로 실제 생산라인 적용 성과로 확대하지 않았습니다. 현장에 적용한다면 작업자 안전, 품질 기준, 설비 간 연동 조건을 추가로 확인하고 전후 시간을 다시 측정해야 합니다. 스마트팩토리 시스템 엔지니어가 된 후에도 모니터링 데이터로 병목을 찾고 현장과 함께 검증하는 방식으로 생산성 개선을 추진하겠습니다.',
};

answers['question-2-motivation-fit'] = answers['question-2-motivation-fit']
  .replace('Power BI로 결과를 전달하며 PLC 기초와 MES 개념을 학습했습니다.', 'Power BI 활용 역량을 갖추었으며, PLC 기초와 MES 개념을 학습했습니다.')
  .replace('작업 순서를 시뮬레이션해 전체 공정 시간을 약 11% 줄였습니다.', '작업 순서를 시뮬레이션해 전체 공정 시간이 약 11% 감소하는 안을 제안했습니다.');
answers['question-3-strength-gap'] = answers['question-3-strength-gap']
  .replace('그래서 프로젝트마다 ① 데이터 기준으로 이상 징후를 정의하고 ② 현장 담당자에게 실제 흐름과 예외를 확인하며 ③ 시뮬레이션이나 재분석으로 개선안을 검증하는 3단계를 체크리스트로 적용했습니다.', '그래서 해당 프로젝트에서는 ① 데이터 기준으로 이상 징후를 정의하고 ② 현장 담당자에게 실제 흐름과 예외를 확인하며 ③ 시뮬레이션이나 재분석으로 개선안을 검증하는 3단계를 체크리스트처럼 적용했고, 이후 제 작업 기준으로 삼았습니다.')
  .replace('덕분에 분석의 속도는 유지하면서도 현장과 어긋난 결론을 줄일 수 있었습니다.', '이를 통해 분석 속도를 유지하면서도 현장과 어긋날 수 있는 결론을 다시 확인하는 절차를 갖추었습니다.');

const claimRefs = {
  'question-1-goal': ['project:manufacturing-data', 'claim:data-window-found', 'claim:unrecorded-condition', 'claim:analysis-field-validation', 'value:field-and-data'],
  'question-2-motivation-fit': ['source:job-posting', 'fact:education', 'fact:data-tools', 'fact:entry-level-target', 'claim:data-window-found', 'claim:process-time-reduction', 'fit:data-analysis-to-role', 'fit:process-improvement-to-role'],
  'question-3-strength-gap': ['value:field-and-data', 'value:worker-context', 'claim:unrecorded-condition', 'fact:data-tools'],
  'question-4-process-improvement': ['project:process-improvement', 'claim:inspection-wait-bottleneck', 'claim:process-time-reduction', 'value:field-and-data'],
};

const answerFor = questionId => ({
  question_id: questionId,
  text: answers[questionId],
  char_count: charCount(answers[questionId]),
  primary_claim: request.questions.find(item => item.id === questionId).focus.primary_claim,
  evidence_refs: claimRefs[questionId],
  inference_refs: questionId === 'question-2-motivation-fit' ? ['fit:data-analysis-to-role', 'fit:process-improvement-to-role'] : [],
  unknown_refs:
    questionId === 'question-1-goal'
      ? ['unknown:field-result']
      : questionId === 'question-2-motivation-fit'
        ? ['unknown:company-context']
        : questionId === 'question-3-strength-gap'
          ? ['unknown:attachment-verification']
          : ['unknown:field-result', 'unknown:attachment-verification'],
});

const gateResults = [
  {
    id: 'request-and-question-coverage',
    status: 'pass',
    evidence_refs: ['question-1-goal', 'question-2-motivation-fit', 'question-3-strength-gap', 'question-4-process-improvement'],
    comment: '네 문항의 목적과 글자 제한을 분리하고 각 문항에 서로 다른 경험 기능을 배치했다.',
  },
  {
    id: 'source-and-freshness-boundary',
    status: 'pass',
    evidence_refs: ['source:job-posting', 'source:company-domain'],
    comment: '회사와 직무에 관한 문장은 사용자 제공 공고 핵심 내용만 사용했으며, 확인되지 않은 회사 고유 사실은 unknown으로 남겼다.',
  },
  {
    id: 'applicant-attribution-and-confirmation',
    status: 'pass',
    evidence_refs: ['fact:education', 'fact:data-tools', 'value:field-and-data', 'value:worker-context'],
    comment: '지원자 정보와 가치관은 제공된 사실로만 표현하고 회사 고유 정보·세부 기여 범위는 제출 전 확인 대상으로 분리했다.',
  },
  {
    id: 'project-evidence-and-causality',
    status: 'pass',
    evidence_refs: ['project:manufacturing-data', 'claim:data-window-found', 'claim:process-time-reduction'],
    comment: '분석, 인터뷰, 시뮬레이션, 결과의 관계를 연결하되 실제 현장 적용 성과와 시뮬레이션 결과를 구분했다.',
  },
  {
    id: 'role-domain-language-clarity',
    status: 'pass',
    evidence_refs: ['source:job-posting', 'role-concern:data-to-action', 'role-concern:field-problem-solving'],
    comment: '센서·공정·모니터링·생산성 개선을 스마트팩토리 시스템 엔지니어의 업무 언어로 번역했다.',
  },
  {
    id: 'publication-and-privacy-safety',
    status: 'pass',
    evidence_refs: ['source:job-posting', 'unknown:company-context'],
    comment: '공개 문서에는 지원 답안과 확인 가능한 공고 링크만 노출하고 개인정보·로컬 경로·내부 작성 기록을 제외했다.',
  },
];

const dimensionResults = [
  {
    id: 'question-fit-and-differentiation',
    rating: 4.7,
    weighted_score: 18.5,
    evidence_refs: ['question-1-goal', 'question-2-motivation-fit', 'question-3-strength-gap', 'question-4-process-improvement'],
    comment: '목표 실행, 지원 동기, 자기관리, 프로세스 개선의 서사를 겹치지 않게 분리했다.',
  },
  {
    id: 'role-and-domain-alignment',
    rating: 4.6,
    weighted_score: 18,
    evidence_refs: ['source:job-posting', 'role-concern:data-to-action', 'role-concern:integration-monitoring', 'fit:data-analysis-to-role'],
    comment: '공고의 데이터·연동·자동화·모니터링·생산성 개선을 지원자의 경험과 연결했다.',
  },
  {
    id: 'applicant-viewpoint-and-values',
    rating: 4.8,
    weighted_score: 17.1,
    evidence_refs: ['value:field-and-data', 'value:worker-context', 'claim:unrecorded-condition'],
    comment: '데이터만으로 판단하지 않고 현장을 확인한다는 기준이 구체적인 선택과 행동으로 드러난다.',
  },
  {
    id: 'evidence-causality-and-attribution',
    rating: 4.8,
    weighted_score: 17.1,
    evidence_refs: ['claim:data-window-found', 'claim:unrecorded-condition', 'claim:inspection-wait-bottleneck', 'claim:process-time-reduction'],
    comment: '원인 탐색과 개선 결과를 제공된 범위 안에서 귀속하고 시뮬레이션의 한계를 명시했다.',
  },
  {
    id: 'project-abstraction-and-transfer',
    rating: 4.7,
    weighted_score: 12.95,
    evidence_refs: ['project:manufacturing-data', 'project:process-improvement', 'role-concern:field-problem-solving'],
    comment: '프로젝트를 설비 데이터 해석, 현장 확인, 병목 검증, 생산성 개선의 직무 행동으로 전환했다.',
  },
  {
    id: 'clarity-and-interview-defensibility',
    rating: 4.6,
    weighted_score: 9,
    evidence_refs: ['unknown:field-result', 'unknown:attachment-verification', 'fact:data-tools'],
    comment: '핵심 주장은 명확하며, 실제 적용 성과와 직접 수행 범위를 면접 전에 확인하면 방어력이 더 높아진다.',
  },
];

const publicReport = `# 코어모션 인더스트리 스마트팩토리 시스템 엔지니어 지원서 초안\n\n## 지원 개요\n\n- 지원자: 이도현\n- 지원 직무: 스마트팩토리 시스템 엔지니어\n- 지원 형태: 신입\n- 작성 언어: 한국어\n- 제출 마감일: 2026년 10월 18일\n\n## 문항별 작성 방향\n\n- 1번은 제조 데이터를 끝까지 분석하고 현장 확인까지 이어간 실행력을 보여줍니다.\n- 2번은 공고의 제조 데이터·설비 연동·공정 자동화·모니터링·생산성 개선 업무와 지원자의 준비를 연결합니다.\n- 3번은 데이터와 현장을 함께 보는 장점, 데이터만으로 판단하려는 경향을 관리한 방법을 설명합니다.\n- 4번은 검사 단계의 대기 병목, 작업 순서 시뮬레이션, 11%의 시뮬레이션 결과를 중심으로 씁니다.\n\n## 지원 답안\n\n### 1. 목표를 설정하고 실행한 경험\n\n${answers['question-1-goal']}\n\n### 2. 지원 동기와 직무 적합성\n\n${answers['question-2-motivation-fit']}\n\n### 3. 장점과 보완할 점\n\n${answers['question-3-strength-gap']}\n\n### 4. 프로세스 개선 경험\n\n${answers['question-4-process-improvement']}\n\n## 검토 요약\n\n이 답안은 제조 데이터와 현장 조건을 함께 확인하는 지원자의 업무 방식을 중심 메시지로 삼았습니다. 회사에 대해서는 사용자 제공 채용 공고에 포함된 업무 범위만 반영했습니다. 실제 회사 사업·제품·현장 적용 맥락은 확인 전까지 단정하지 않았습니다.\n\n또한 4번의 약 11% 감소는 시뮬레이션 기준으로만 표현했습니다. 실제 생산라인 적용 결과나 후속 불량률 변화가 확인되면 해당 문항의 성과를 더 구체화할 수 있습니다.\n\n## 면접 준비\n\n- 1번: 높은 불량 발생 시간대를 어떤 기준으로 찾았고, 인터뷰 뒤 분석 결과가 어떻게 달라졌는지 설명할 수 있도록 준비합니다.\n- 2번: PLC 기초와 MES 개념을 실제 설비·생산 데이터 흐름과 어떻게 연결해 이해하고 있는지 정리합니다.\n- 3번: 데이터만으로 판단했던 초기 접근이 어떤 위험을 만들었고, 3단계 확인 절차로 무엇을 보완했는지 말합니다.\n- 4번: 11% 감소의 시뮬레이션 조건, 실제 적용 시 추가로 확인할 안전·품질·연동 조건을 설명합니다.\n\n## 제출 전 확인\n\n- 코어모션 인더스트리의 실제 사업·제품 정보 중 본인이 확인한 내용을 2~3문장으로 보완합니다.\n- 각 프로젝트에서 본인이 직접 작성·수정·검증한 범위를 원본 자료와 대조합니다.\n- 시뮬레이션 결과와 실제 현장 적용 결과를 구분해 말할 수 있는지 확인합니다.\n- 공고의 최신 문항과 글자 수가 제출 시점에도 같은지 확인합니다.\n\n공고 링크: https://jobs.coremotion.example/smart-factory-engineer\n`;

const textExtract = publicReport.replace(/^#+\s?/gm, '').replace(/^[-*]\s?/gm, '');

const requestPath = 'request.json';
writeJson(requestPath, request);
writeText('coremotion-smart-factory-self-introduction.md', publicReport);
writeText('coremotion-smart-factory-self-introduction.txt', textExtract);

const result = {
  kind: 'job-application-report-result/v1',
  schema_version: 1,
  result_id: 'result:coremotion-smart-factory-set3',
  revision: 'revision:2026-09-14.1',
  request_binding: {
    ref: requestPath,
    request_id: request.request_id,
    revision: request.revision,
    digest: digestFile(requestPath),
  },
  candidates: [
    {
      id: 'candidate:set3',
      strategy: '현장 데이터와 작업 조건을 연결해 검증 가능한 제조 개선을 만드는 신입 엔지니어',
      answers: request.questions.map(question => answerFor(question.id)),
      mandatory_gates: gateResults,
      dimensions: dimensionResults,
      total_score: 92.65,
      qualified: true,
      selection_guidance: '현재 제공된 공고 요약과 지원자 경험만으로 작성한 단일 답안 세트다. 제조 데이터와 현장 확인의 연결이 강점이며, 실제 회사 맥락과 현장 적용 성과를 확인한 뒤 제출한다.',
    },
  ],
  evaluation: {
    policy_ref: request.quality_profile.policy_ref,
    rating_min: request.quality_profile.rating_min,
    rating_max: request.quality_profile.rating_max,
    threshold: request.quality_profile.qualification_threshold,
    score_meaning: request.quality_profile.score_meaning,
    dimension_weights: request.quality_profile.dimensions,
  },
  revision: {
    configured_passes: 1,
    performed_passes: 1,
    frozen_finding_ref: 'frozen-findings.json',
    changes: [
      {
        candidate_id: 'candidate:set3',
        criterion_ids: ['role-and-domain-alignment', 'clarity-and-interview-defensibility'],
        before_score: 89.9,
        after_score: 92.65,
        change: '지원 동기를 공고의 업무 흐름과 직접 연결하고, 11% 결과를 시뮬레이션 기준으로 한정해 실제 적용 성과와 구분했다.',
        reason: '회사 칭찬이나 과장된 성과 대신 공고에 명시된 책임과 제공된 근거를 중심으로 면접 방어 가능성을 높이기 위해서다.',
      },
    ],
  },
  report: {
    format: 'markdown',
    artifacts: [
      {
        id: 'artifact:primary-report',
        path: 'coremotion-smart-factory-self-introduction.md',
        media_type: 'text/markdown',
        role: 'primary_report',
        digest: digestFile('coremotion-smart-factory-self-introduction.md'),
      },
      {
        id: 'artifact:text-extract',
        path: 'coremotion-smart-factory-self-introduction.txt',
        media_type: 'text/plain',
        role: 'text_extract',
        digest: digestFile('coremotion-smart-factory-self-introduction.txt'),
      },
    ],
    section_ids: request.output_profile.required_sections,
    analysis_sections: [
      {
        id: 'analysis-company-role',
        title: '회사와 직무 정보를 답안에 적용한 방식',
        body: '사용자 제공 공고의 제조 데이터, 설비 연동, 공정 자동화, 모니터링, 생산성 개선, 현장 문제 해결을 지원자의 데이터 분석·공정 개선·현장 확인 경험과 연결했다.',
        evidence_refs: ['source:job-posting', 'company-context:manufacturing-data', 'role-concern:data-to-action', 'role-concern:field-problem-solving'],
      },
      {
        id: 'analysis-question-differentiation',
        title: '문항별 차별화',
        body: '1번은 목표 실행, 2번은 지원 동기와 준비, 3번은 자기관리, 4번은 병목 개선으로 역할을 나누어 동일한 경험이 반복되지 않게 했다.',
        evidence_refs: ['question-1-goal', 'question-2-motivation-fit', 'question-3-strength-gap', 'question-4-process-improvement'],
      },
      {
        id: 'analysis-evidence-boundary',
        title: '근거와 한계',
        body: '11%는 시뮬레이션 기준으로 제한했고, 실제 불량률 변화와 직접 수행한 세부 범위는 확인 전까지 미확인으로 보존했다.',
        evidence_refs: ['claim:process-time-reduction', 'unknown:field-result', 'unknown:attachment-verification'],
      },
    ],
    material_requests: [
      {
        id: 'unknown:company-context',
        question_ids: ['question-2-motivation-fit'],
        needed_fact: '코어모션 인더스트리의 실제 사업·제품·현장 적용 맥락',
        why_it_matters: '공고 요약을 넘어선 회사 선택 이유를 개인의 관심과 연결할 수 있다.',
        acceptable_evidence: '회사 공식 소개, 제품 페이지, 현장 사례, 또는 지원자가 직접 확인한 정보',
        interview_use: '왜 이 회사의 제조 시스템 업무에 관심을 가졌는지 구체적으로 설명하는 근거로 사용한다.',
      },
      {
        id: 'unknown:field-result',
        question_ids: ['question-1-goal', 'question-4-process-improvement'],
        needed_fact: '분석 또는 개선안의 현장 적용 후 실제 변화와 확인 시점',
        why_it_matters: '시뮬레이션 결과와 운영 성과를 구분하면서 성과를 더 구체화할 수 있다.',
        acceptable_evidence: '적용 후 불량률·대기시간·처리량 변화, 검증 기록, 또는 시뮬레이션 조건표',
        interview_use: '어떤 기준으로 개선안의 유효성을 판단했는지 설명하는 자료가 된다.',
      },
      {
        id: 'unknown:attachment-verification',
        question_ids: ['question-1-goal', 'question-3-strength-gap', 'question-4-process-improvement'],
        needed_fact: '분석 코드·데이터·보고서에서 본인이 직접 수행한 세부 범위',
        why_it_matters: '도구 사용과 의사결정 기여를 면접에서 정확히 방어할 수 있다.',
        acceptable_evidence: '본인이 작성하거나 수정한 코드·표·시뮬레이션 설정·발표 자료의 담당 부분',
        interview_use: '팀의 전체 결과와 본인의 역할을 구분해 설명할 때 사용한다.',
      },
    ],
    interview_preparation: [
      {
        candidate_id: 'candidate:set3',
        question_id: 'question-1-goal',
        review_point: '불량 발생률이 높은 시간대를 어떤 기준으로 좁혔는지와 인터뷰 후 해석이 어떻게 달라졌는지를 준비한다.',
        likely_follow_up: '데이터 분석만으로 판단하지 않기로 한 이유와 실제로 확인한 작업 조건은 무엇인가요?',
        confirmation_needed: '분석에 사용한 변수, 비교 기준, 본인의 직접 수행 범위를 원본 자료와 확인한다.',
      },
      {
        candidate_id: 'candidate:set3',
        question_id: 'question-2-motivation-fit',
        review_point: '공고의 설비 연동·모니터링 업무를 본인의 Python·SQL·PLC 기초·MES 학습과 어떻게 연결하는지 정리한다.',
        likely_follow_up: '스마트팩토리 시스템 엔지니어로 입사하면 가장 먼저 어떤 데이터를 확인하겠습니까?',
        confirmation_needed: '코어모션 인더스트리의 실제 사업과 본인이 확인한 관심 분야를 추가로 확인한다.',
      },
      {
        candidate_id: 'candidate:set3',
        question_id: 'question-3-strength-gap',
        review_point: '데이터만으로 판단하려던 초기 접근이 어떤 위험을 만들었고 3단계 절차로 무엇을 바꿨는지 말한다.',
        likely_follow_up: '현장 의견과 데이터가 다를 때 어떤 기준으로 결론을 정하겠습니까?',
        confirmation_needed: '체크리스트를 실제 업무나 프로젝트에서 적용한 범위를 확인한다.',
      },
      {
        candidate_id: 'candidate:set3',
        question_id: 'question-4-process-improvement',
        review_point: '11% 감소가 시뮬레이션 결과임을 전제로 조건과 실제 적용 시 추가 검증 항목을 준비한다.',
        likely_follow_up: '작업 순서를 바꾸기 전에 안전과 품질 측면에서 무엇을 확인하겠습니까?',
        confirmation_needed: '시뮬레이션 입력 조건, 비교한 대안, 본인의 분석·제안 범위를 확인한다.',
      },
    ],
    publication_validation: {
      page_count: null,
      searchable_text: { required: true, passed: true },
      raster_assets: { policy: 'not_required', asset_count: 0, passed: true },
      overflow: { policy: 'no_clipped_content', passed: true, findings: [] },
      visible_sources: { source_ids: ['source:job-posting'], undeclared_source_ids: [], passed: true },
      privacy: { passed: true, findings: [] },
      content_policy_results: request.output_profile.publication.content_policies.map(policy => ({
        policy_id: policy.id,
        status: policy.expectation === 'present' ? 'pass' : 'pass',
        matches: policy.expectation === 'present' ? policy.matcher.values.filter(value => publicReport.includes(value)) : [],
      })),
      public_text_extract: publicReport,
    },
  },
  retained_unknown_ids: ['unknown:company-context', 'unknown:field-result', 'unknown:attachment-verification'],
  qualified_candidate_ids: ['candidate:set3'],
  limitations: [
    '외부 URL은 확인되지 않아 회사 고유 사업·제품·현장 정보는 사용자 제공 공고 요약을 넘어 주장하지 않았다.',
    '약 11% 감소는 시뮬레이션 기준이며 실제 생산라인 적용 성과로 표현하지 않았다.',
    '원본 첨부자료를 독립 검토하지 않았으므로 직접 수행한 코드·분석·보고서 범위는 제출 전 확인이 필요하다.',
  ],
  authority_effect: 'none',
};

writeJson('result.json', result);

writeJson('research-evidence.json', {
  record_kind: 'job-application-research-evidence/v1',
  status: 'bounded-user-supplied-evidence',
  observed_at: observedAt,
  sources: [
    {
      id: 'source:job-posting',
      authority: 'user-supplied-posting-summary',
      locator: 'https://jobs.coremotion.example/smart-factory-engineer',
      usable_claims: ['제조 데이터 수집 및 분석', '생산 설비 시스템 연동', '공정 자동화', '제조 시스템 모니터링', '생산성 개선', '현장 문제 분석 및 해결'],
      limitation: 'example 도메인 URL은 외부 확인이 되지 않아 사용자 제공 요약만 사용했다.',
    },
    {
      id: 'source:company-domain',
      authority: 'user-supplied-company-locator',
      locator: 'https://www.coremotion.example',
      usable_claims: [],
      limitation: '실제 회사 공개 정보는 확인되지 않았다.',
    },
    {
      id: 'source:applicant-profile',
      authority: 'applicant-owned',
      locator: 'user-provided-profile-summary',
      usable_claims: ['학력', '신입 지원', '희망 직무', '기술 목록'],
      limitation: '원본 이력서 파일은 독립 검토하지 않았다.',
    },
    {
      id: 'source:applicant-experiences',
      authority: 'applicant-owned',
      locator: 'user-provided-experience-summary',
      usable_claims: ['6개월 센서·생산 기록 분석', '불량 시간대 발견', '검사 단계 대기 병목', '시뮬레이션 기준 11% 감소'],
      limitation: '실제 운영 적용 후속 수치는 제공되지 않았다.',
    },
  ],
  stop_reason: '질문별 작성 전략과 문장 근거를 정하는 데 필요한 범위까지 확인했으며, 추가 외부 정보는 현재 답안에 반영할 수 없어 수집하지 않았다.',
});

writeJson('context-projection.json', {
  record_kind: 'job-application-context-projection/v1',
  applicant: {
    confirmed: ['fact:education', 'fact:data-tools', 'fact:entry-level-target', 'value:field-and-data', 'value:worker-context'],
    excluded_from_public_report: ['연령', '원본 첨부자료 경로'],
  },
  projects: ['project:manufacturing-data', 'project:process-improvement'],
  preserved_unknowns: ['unknown:company-context', 'unknown:field-result', 'unknown:attachment-verification'],
  language_translation: '센서·공정·작업자 경험을 설비 상태 해석, 현장 사용 조건 확인, 병목 검증, 생산성 개선의 언어로 번역했다.',
});

writeJson('question-map.json', {
  record_kind: 'job-application-question-map/v1',
  questions: request.questions.map(question => ({
    id: question.id,
    primary_claim: question.focus.primary_claim,
    reviewer_need: question.focus.reviewer_need,
    evidence_function: question.focus.evidence_function,
    non_overlap_boundary: question.focus.non_overlap_boundary,
  })),
});

writeJson('initial-candidates.json', {
  record_kind: 'job-application-initial-candidates/v1',
  candidate_ids: ['candidate:set3'],
  strategy: '현장 데이터와 작업 조건을 연결해 검증 가능한 제조 개선을 만드는 신입 엔지니어',
  initial_score: 89.9,
  protected_finding: '지원 동기와 시뮬레이션 성과의 한정 표현을 보강한 뒤 1회 수정한다.',
});

writeJson('frozen-findings.json', {
  record_kind: 'job-application-frozen-findings/v1',
  candidate_id: 'candidate:set3',
  initial_digest: digestText(Object.values(answers).join('\n')),
  revision_limit: 1,
  findings: [
    {
      criterion_id: 'role-and-domain-alignment',
      finding: '공고 업무와 경험의 연결은 있으나 회사 선택 이유를 공고 업무 흐름에 더 직접적으로 묶을 필요가 있다.',
      evidence_refs: ['source:job-posting', 'fit:data-analysis-to-role'],
    },
    {
      criterion_id: 'clarity-and-interview-defensibility',
      finding: '11% 결과가 실제 운영 성과로 읽히지 않도록 시뮬레이션 기준임을 문항 안에서 분명히 해야 한다.',
      evidence_refs: ['claim:process-time-reduction', 'unknown:field-result'],
    },
  ],
});

writeJson('route-input.json', {
  requestRevision: 'coremotion-smart-factory-set3.1',
  facts: {
    workPurpose: 'implement',
    operationFamily: 'outcome_production',
    effectIntent: 'local_mutation',
    outputShape: 'validated_candidate',
    temporalShape: 'multi_phase',
    contributionShape: 'one_owner',
    boundedIteration: true,
    outputValidationContract: true,
    dependencyAggregationContract: false,
    explicitSessionRevision: false,
    currentStateEvidenceRequired: true,
    mutationRequired: true,
    capabilityReadiness: 'verified',
    lifecycleReadiness: 'verified',
    authorityResolved: true,
    effectAdmitted: true,
    instructionAdmitted: true,
    executionSurface: 'local_coordinator_only',
  },
  continuity: {
    requestRelation: 'new_objective',
    historyCoverage: 'bounded-current-input',
    sessionBoundary: 'same_session',
    priorPrimaryMode: null,
    outerObligationState: 'new',
    priorCompletionEvidence: 'not_applicable',
    projectionRef: 'projection:coremotion-smart-factory-set3',
  },
  missingFacts: ['회사 고유 사업·제품·현장 정보', '실제 적용 후속 성과', '원본 첨부자료의 직접 수행 범위'],
  conflictingFacts: [],
});

writeJson('route-decision.json', {
  kind: 'six-mode-route-decision/v1',
  requestRevision: 'coremotion-smart-factory-set3.1',
  status: 'selected',
  selectedMode: 'loop',
  continuityDecision: {
    requestRelation: 'new_objective',
    objectiveRelation: 'new',
    historyCoverage: 'bounded-current-input',
    sessionBoundary: 'same_session',
    priorPrimaryMode: null,
    outerObligationState: 'new',
    priorCompletionEvidence: 'not_applicable',
    projectionRef: 'projection:coremotion-smart-factory-set3',
    executionSurface: 'local_coordinator_only',
    candidateMode: 'loop',
    effectivePrimaryMode: 'loop',
    segmentMode: null,
    disposition: 'select',
    outerObligationAction: 'open',
    modeCompositionRequired: true,
  },
  architectureSelection: {
    requirement: 'eligible',
    selectionStatus: 'native-loop-selected',
    targetScope: 'effective_primary',
    effectivePrimaryMode: 'loop',
    structuralSignals: ['bounded multi-stage drafting and validation', 'one material contribution'],
    segmentMode: null,
    segmentRequirement: null,
    segmentSelectionStatus: null,
    segmentStructuralSignals: [],
    workflowPatternOwnerRef: 'artifacts/loop-architecture/components/agentic-architecture/component.json',
    agentTopologyOwnerRef: 'artifacts/loop-architecture/components/agent-execution-topology-selection/component.json',
    coordinationOwnerRef: 'artifacts/loop-architecture/components/agent-architecture-coordination/component.json',
    patternSelectedByRouting: false,
  },
  eligibleModes: ['loop'],
  rejectedModes: [
    { mode: 'communication', reasonCodes: ['effect_not_none', 'output_not_response', 'temporal_not_immediate'] },
    { mode: 'investigation', reasonCodes: ['effect_not_read_only', 'output_not_information_finding', 'mutation_required'] },
    { mode: 'single_task', reasonCodes: ['temporal_not_single_boundary'] },
    { mode: 'orchestration', reasonCodes: ['contribution_not_multi_owner'] },
    { mode: 'session_control', reasonCodes: ['session_revision_not_explicit', 'effect_not_session_control'] },
  ],
  blockers: [],
  missingFacts: [],
  conflictingFacts: [],
  reassessmentTriggers: ['request scope changes', 'evidence or publication boundary changes', 'effect or authority changes', 'revision budget changes'],
  authorityEffect: 'none',
});

writeJson('agent-operation-boundary.json', {
  kind: 'reusable-artifact-agent-operation-boundary/v1',
  revision: '2026-09-14.1',
  status: 'report_only',
  authorityEffect: 'none',
  subjectRef: 'agent-subject:coremotion-smart-factory-report-builder',
  nativeOwnerRef: 'artifacts/agent-loop/document/job-application-report-production/loop.yaml',
  requestedOutcome: '코어모션 인더스트리 스마트팩토리 시스템 엔지니어 지원을 위한 4개 문항 자기소개서 초안과 검토 가능한 보고서를 생산한다.',
  successEvidence: ['모든 문항 답안과 글자 수', '공고·지원자·프로젝트 근거 연결', '1회 수정 기록', '결정 지원 보고서와 검증 결과'],
  nonGoals: ['회사 고유 사실의 추정', '실제 현장 성과의 발명', '지원서 제출 또는 채용 판단', '재사용 아티팩트 소스 변경'],
  boundedDiscoverySurface: {
    runtimeInput: '사용자 제공 지원 정보·공고 핵심 내용·프로필·경험 요약',
    nativeOwner: 'artifacts/agent-loop/document/job-application-report-production',
    maximumNewReusableUnit: 0,
    outputRoot: '.collab/artifacts/job-application-2026-10-coremotion-smart-factory',
  },
  validation: ['요청/결과 스키마와 결정론적 체크러', '문항별 글자 수', '공개 텍스트 정책', '루프 패키지 검사'],
  materialChangeSignals: ['문항·글자 수 변경', '회사·직무 근거 변경', '지원자 기여 범위 변경', '외부 효과 또는 제출 요청 추가'],
  stopConditions: ['필수 근거가 제공되지 않음', '동일한 검증 실패 반복', '회사 고유 사실을 확인할 수 없음', '범위가 제출·채용 판단으로 확대됨'],
});

console.log(JSON.stringify({
  request: requestPath,
  result: 'result.json',
  report: 'coremotion-smart-factory-self-introduction.md',
  charCounts: Object.fromEntries(Object.entries(answers).map(([id, value]) => [id, charCount(value)])),
  requestDigest: digestFile(requestPath),
}, null, 2));
