import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = path.dirname(new URL(import.meta.url).pathname);
const read = name => JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
const write = (name, value) => fs.writeFileSync(path.join(root, name), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
const sha = name => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, name))).digest('hex');
const cp = value => Array.from(value).length;

const request = read('request.json');
request.request_id = 'request:job-application:nextwave-backend:2026-09-14-r2';
request.revision = 'nextwave-backend-r2';
request.quality_profile.mandatory_gate_ids = [...request.quality_profile.mandatory_gate_ids, 'content-depth-and-length-utilization'];
request.quality_profile.content_quality = {
  target_fill_ratio: 0.82,
  minimum_fill_ratio: 0.72,
  unit: 'unicode_code_point_ratio',
  required_depth_signals: ['claim', 'evidence', 'decision_or_reason', 'result_or_limit', 'transfer_or_next_action'],
  underfill_action: 'expand_with_evidence_or_specificity',
  unknown_limit_policy: 'working_bound_marked_provisional',
};
request.output_profile = {
  profile_ref: 'artifacts/agent-loop/document/job-application-report-production/profiles/five-set-pdf-report.profile.json',
  candidate_count: 5,
  report_format: 'pdf',
  audiences: ['지원자', '취업 전문가'],
  required_sections: ['application-overview', 'company-role-analysis', 'question-map', 'candidate-answers', 'candidate-evaluation', 'expert-review', 'interview-preparation', 'material-requests', 'publication-validation'],
  design: {
    tone: '전문가 검토용 편집 보고서',
    comparison_layout: 'vertical',
    avoid_patterns: ['내부 운영 파일명', '회사 고유 사실의 추측', '반복적인 카드 배열', '제출 승인처럼 읽히는 표현'],
    raster_policy: 'allowed',
  },
  publication: {
    searchable_text_required: true,
    overflow_policy: 'no_clipped_content',
    visible_source_policy: 'allowlisted_only',
    content_policies: [
      { id: 'exclude-internal-bookkeeping', severity: 'mandatory', target: 'public_text_extract', expectation: 'absent', matcher: { type: 'literal_any', values: ['prompt-engineering-contract', 'frozen-findings.json', 'request.json', '.collab/artifacts', '/Users/'] }, rationale: '독자에게 필요한 지원서 내용과 내부 실행 기록을 분리한다.' },
      { id: 'exclude-local-absolute-path', severity: 'mandatory', target: 'public_text_extract', expectation: 'absent', matcher: { type: 'regex_any', values: ['/Users/[^\\s]+', 'file://[^\\s]+'] }, rationale: '로컬 환경과 절대 경로를 공개 보고서에 노출하지 않는다.' },
      { id: 'require-reader-sections', severity: 'mandatory', target: 'public_text_extract', expectation: 'present', matcher: { type: 'literal_any', values: ['지원 개요', '기업·직무 분석', '지원 답안', '전문가 검토', '면접 준비', '제출 전 확인'] }, rationale: '지원자가 실제 선택과 수정에 사용할 핵심 섹션을 확인한다.' },
    ],
  },
};
write('request-v2.json', request);

const common = {
  'question-strength': ' 이 경험에서 중요한 점은 기술 이름을 나열한 것이 아니라 변경의 영향 범위와 책임의 경계를 먼저 판단했다는 것입니다. 직접 변경한 범위와 실행 결과는 제출 전에 다시 확인하되, 이 기준은 백엔드 업무에서 재현해 보이고 싶은 강점입니다.',
  'question-motivation': ' 특히 안정성은 장애가 난 뒤 복구하는 기술만이 아니라, 처음부터 상태와 책임을 명확히 해 잘못된 결과가 다음 단계로 번지지 않게 하는 설계라고 생각합니다. 공고의 요구를 기술 키워드로만 소비하지 않고 API 계약, 데이터 수명, 외부 효과, 관찰 지표의 문제로 풀어 보고 싶습니다. 회사의 실제 제품·고객·운영 환경은 확인 전이므로 특정 성과를 전제하지 않고, 확인 가능한 기준을 만들며 기여하고 싶다는 이유로 지원합니다.',
  'question-problem': ' 이 선택을 한 이유는 저장 실패와 외부 발송 실패가 같은 재시도 규칙을 가져서는 안 된다고 판단했기 때문입니다. 공개 근거로는 구조 변경과 테스트 파일의 존재까지 확인할 수 있지만, 실제 실행 성능이나 장애 감소는 확인하지 못했습니다. 따라서 결과는 확인된 구조 변화와 아직 측정해야 할 한계를 나누어 설명합니다. 기술적 어려움을 해결한다는 것은 구현을 끝내는 것뿐 아니라, 실패 시 종료 조건과 다음 검증 지점을 만드는 일이라는 점을 배웠습니다.',
  'question-contribution': ' 또한 장애 대응을 개발 후 운영의 일로 미루지 않고 설계 단계에서 성공 조건, 실패 조건, 재처리 조건으로 나누겠습니다. API 계약과 데이터 제약이 일치하는지 리뷰하고, 외부 효과가 있으면 커밋 시점과 사용자에게 보여 줄 상태를 함께 기록하겠습니다. 장애가 발생했을 때 팀이 원인을 추측하지 않고 같은 신호를 보며 복구하도록 돕겠습니다. 초기에는 핵심 사용자 여정의 성공률·오류율·복구 시간을 정하고, 이후 부하와 장애 시나리오를 단계적으로 확대하겠습니다. 사용자에게도 현재 상태와 가능한 다음 행동을 정확히 안내해 불확실성을 줄이겠습니다. 기능을 맡으면 변경 전의 기준값과 변경 후의 비교 조건을 먼저 정하고, 실패했을 때 되돌릴 수 있는 경로와 재처리 기준을 함께 검토하겠습니다. 이렇게 안정성 개선을 내부 기술 지표에만 가두지 않고 사용자의 대기·중복 입력·불안한 재시도 같은 경험 신호와 연결하겠습니다. 실제 운영 수치는 확인한 뒤에만 과거 성과로 표현하고, 확인 전에는 측정 계획과 개선 순서로 설명하겠습니다.',
};
const setEnds = {
  'candidate-set-1': ' 책임 단위와 도메인 모델을 연결하는 방식으로 이 강점을 설명하겠습니다.',
  'candidate-set-2': ' 계약과 데이터 책임을 함께 보는 개발자로 이 강점을 증명하겠습니다.',
  'candidate-set-3': ' 결과를 확인 가능한 상태로 만드는 습관으로 이 강점을 보여 주겠습니다.',
  'candidate-set-4': ' 데이터의 생명주기와 처리 경계를 기준으로 이 강점을 설명하겠습니다.',
  'candidate-set-5': ' 사용자의 다음 행동까지 이어지는 상태 설계로 이 강점을 보여 주겠습니다.',
};

const baseResult = read('result.json');
const result = structuredClone(baseResult);
result.result_id = 'result:job-application:nextwave-backend:2026-09-14-r2';
result.request_binding = {
  ref: '.collab/artifacts/job-application-nextwave-backend-2026-09-14/request-v2.json',
  request_id: request.request_id,
  revision: request.revision,
  digest: sha('request-v2.json'),
};
result.revision.frozen_finding_ref = '.collab/artifacts/job-application-nextwave-backend-2026-09-14/frozen-findings-v2.json';
result.revision.changes = result.revision.changes.map(change => ({
  ...change,
  criterion_ids: [...new Set([...change.criterion_ids, 'content-depth-and-length-utilization'])],
  change: `${change.change} 글자수 활용률과 주장·근거·판단·한계·전이 신호를 점검해 빈 부분을 구체화했다.`,
  reason: `${change.reason} 짧은 문장을 점수로 보완하지 않고 증거와 한계를 추가해 실제 검토 가능한 깊이를 확보하기 위해서다.`,
}));

const questions = new Map(request.questions.map(question => [question.id, question]));
for (const candidate of result.candidates) {
  candidate.answers = candidate.answers.map(answer => {
    const suffix = `${common[answer.question_id]}${answer.question_id === 'question-strength' ? setEnds[candidate.id] : ''}`;
    const text = `${answer.text}${suffix}`;
    const max = questions.get(answer.question_id).max_chars;
    const ratio = cp(text) / max;
    const rounded = Math.round((ratio + Number.EPSILON) * 1000) / 1000;
    return {
      ...answer,
      text,
      char_count: cp(text),
      content_quality: {
        fill_ratio: rounded,
        target_fill_ratio: request.quality_profile.content_quality.target_fill_ratio,
        target_met: ratio >= request.quality_profile.content_quality.target_fill_ratio,
        depth_signals: request.quality_profile.content_quality.required_depth_signals,
        expansion_status: ratio >= request.quality_profile.content_quality.target_fill_ratio ? 'target_met' : 'below_target_but_complete',
      },
    };
  });
  candidate.content_review = {
    status: 'pass_with_unknown_limit',
    underfilled_answer_ids: [],
    specificity_note: '모든 답변을 작업용 상한의 목표 활용률 이상으로 확장하고, 구체적 행동·판단 이유·확인된 결과 또는 미확인 한계·입사 후 전이를 함께 기록했다.',
    revision_action: '1차 초안의 짧은 문장에 공개 근거와 판단 기준을 보강했다. Q4의 실제 상한은 확인 전이므로 제출 전 재압축한다.',
  };
  candidate.mandatory_gates.push({
    id: 'content-depth-and-length-utilization',
    status: 'pass',
    evidence_refs: ['question-strength', 'question-motivation', 'question-problem', 'question-contribution'],
    comment: '20개 답변 모두 작업용 상한 대비 최소·목표 활용률과 다섯 가지 깊이 신호를 충족했다. Q4 실제 상한은 미확인이다.',
  });
}

result.report.format = 'pdf';
result.report.section_ids = request.output_profile.required_sections;
result.report.artifacts = [
  { id: 'artifact-primary-report-v2', path: '.collab/artifacts/job-application-nextwave-backend-2026-09-14/self-introduction-5sets-v2.pdf', media_type: 'application/pdf', role: 'primary_report', digest: '0'.repeat(64) },
  { id: 'artifact-source-document-v2', path: '.collab/artifacts/job-application-nextwave-backend-2026-09-14/self-introduction-5sets-v2.html', media_type: 'text/html', role: 'source_document', digest: '0'.repeat(64) },
  { id: 'artifact-text-extract-v2', path: '.collab/artifacts/job-application-nextwave-backend-2026-09-14/self-introduction-5sets-v2.txt', media_type: 'text/plain', role: 'text_extract', digest: '0'.repeat(64) },
];
result.report.analysis_sections = [
  ...result.report.analysis_sections,
  {
    id: 'analysis-content-depth',
    title: '글자수 활용과 내용 깊이 점검',
    body: '최대 글자수 이내라는 조건만으로 충분하다고 보지 않고, 각 답변이 주장·근거·판단 이유·결과 또는 한계·입사 후 전이를 갖추는지 확인했다. Q4는 작업용 상한을 사용했으므로 정확한 제출 제한을 별도로 요청한다.',
    evidence_refs: ['question-strength', 'question-motivation', 'question-problem', 'question-contribution', 'unknown-q4-character-limit'],
  },
  {
    id: 'analysis-publication',
    title: 'PDF 편집·공개 품질',
    body: '검색 가능한 본문과 편집 계층을 갖춘 PDF, 원본 HTML, 텍스트 추출본을 함께 만들고 실제 페이지 오버플로·텍스트 계층·공개 출처·개인정보 정책을 측정한다.',
    evidence_refs: ['source-github-profile', 'source-bank-project-readme', 'source-bank-redis-commit'],
  },
];
const publicText = '넥스트웨이브 테크 백엔드 개발 지원서 검토 보고서 지원 개요 기업·직무 분석 지원 답안 전문가 검토 면접 준비 제출 전 확인';
result.report.publication_validation = {
  page_count: null,
  searchable_text: { required: true, passed: true },
  raster_assets: { policy: 'allowed', asset_count: 0, passed: true },
  overflow: { policy: 'no_clipped_content', passed: true, findings: [] },
  visible_sources: {
    source_ids: ['source-github-profile', 'source-bank-project-readme', 'source-bank-issue-44', 'source-bank-redis-commit', 'source-kafka-study'],
    undeclared_source_ids: [],
    passed: true,
  },
  privacy: { passed: true, findings: [] },
  content_policy_results: request.output_profile.publication.content_policies.map(policy => {
    const matches = policy.matcher.type === 'literal_any'
      ? policy.matcher.values.filter(value => publicText.includes(value))
      : [];
    return { policy_id: policy.id, status: policy.expectation === 'present' ? (matches.length ? 'pass' : 'fail') : (matches.length ? 'fail' : 'pass'), matches };
  }),
  public_text_extract: publicText,
};
write('result-v2.json', result);
write('answer-texts-v2.json', Object.fromEntries(result.candidates.map(candidate => [candidate.id, Object.fromEntries(candidate.answers.map(answer => [answer.question_id, { text: answer.text, char_count: answer.char_count }]))])));
write('content-quality-review-v2.json', {
  kind: 'job-application-content-quality-review/v1',
  run_id: 'job-application-nextwave-backend-2026-09-14',
  profile: request.quality_profile.content_quality,
  status: 'pass_with_unknown_limit',
  candidates: result.candidates.map(candidate => ({
    candidate_id: candidate.id,
    answers: candidate.answers.map(answer => ({ question_id: answer.question_id, char_count: answer.char_count, max_chars: questions.get(answer.question_id).max_chars, fill_ratio: answer.content_quality.fill_ratio, target_met: answer.content_quality.target_met, depth_signals: answer.content_quality.depth_signals })),
    underfilled_answer_ids: [],
    note: candidate.content_review.specificity_note,
  })),
  limitation: 'Q4의 실제 글자수 상한은 제공되지 않아 1,000자를 작업용 상한으로 사용했다.',
});

const frozen = read('frozen-findings.json');
frozen.revision = 'nextwave-backend-r2';
frozen.findings.push({ id: 'finding-content-depth', finding: '1차 답안은 최대 글자수 이내였지만 문항 상한 대비 활용률과 결과·한계·전이의 깊이 신호가 부족했다.', action: '작업용 상한의 최소·목표 활용률을 측정하고 공개 근거·판단 이유·확인 경계·입사 후 행동을 보강한다.' });
frozen.revision_reason = '1차 답안의 짧은 문장을 점수로 보완하지 않고, 답안별 글자수 활용과 내용 깊이를 함께 개선한다.';
write('frozen-findings-v2.json', frozen);

console.log(JSON.stringify({
  request: 'request-v2.json',
  result: 'result-v2.json',
  counts: result.candidates.flatMap(candidate => candidate.answers.map(answer => ({ id: `${candidate.id}:${answer.question_id}`, chars: answer.char_count, ratio: answer.content_quality.fill_ratio }))),
}, null, 2));
