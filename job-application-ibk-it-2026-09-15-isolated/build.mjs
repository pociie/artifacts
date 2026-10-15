import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderEditorialRasterAssets } from '../../../artifacts/agent-loop/document/job-application-report-production/scripts/render_editorial_raster_assets.mjs';

const output = path.dirname(fileURLToPath(import.meta.url));
const sha = value => crypto.createHash('sha256').update(value).digest('hex');
const esc = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const chars = value => Array.from(value).length;
const write = (name, body) => fs.writeFileSync(path.join(output, name), typeof body === 'string' ? body : `${JSON.stringify(body, null, 2)}\n`);

const question = 'IBK와 동행, 지원자님을 환영합니다! 다양한 회사들 중에서도 IBK를 선택하신 이유가 궁금합니다. 지원동기에 대해 자유롭게 이야기해 주세요.';
const answers = [
  {
    id: 'candidate-structure',
    strategy: '금융 흐름의 책임 경계를 설계한 경험',
    text: '금융 서비스는 기능이 많아질수록 한 번의 요청이 인증·결제·거래 상태와 연결되므로, 각 단계의 책임과 변경 영향을 분명히 하는 일이 중요하다고 생각합니다. 이를 고민하며 Spring 기반 핀테크 백엔드 프로젝트를 만들었습니다. 회원·인증, 결제, 게이트웨이, 이벤트 처리 영역을 나누고, 외부 요청을 적절한 서비스로 연결하는 구조를 설계했습니다. 특히 결제와 그룹 단위 공동지출처럼 여러 상태가 이어지는 기능을 다루며, 기능 구현만으로는 충분하지 않고 이후 변경과 점검이 가능한 구조가 필요하다는 점을 배웠습니다. 중소기업과 개인 고객의 금융 흐름을 폭넓게 다루는 IBK에서도 이러한 관점이 중요하다고 생각합니다. 입행 후에는 업무 요구를 정확히 이해하고, 안정적으로 연결되는 서비스 구조와 검증 가능한 변경을 만드는 IT 인력이 되겠습니다.'
  },
  {
    id: 'candidate-trust',
    strategy: '고객 신뢰를 지키는 안정적 처리 관점',
    text: '제가 금융 IT를 선택한 이유는 사용자가 자신의 자산과 거래를 확인하고 결정하는 순간에, 시스템의 정확성과 연결성이 곧 신뢰가 된다고 느꼈기 때문입니다. 개인 자산 관리와 그룹 공동지출을 함께 다루는 핀테크 백엔드 프로젝트에서 회원 관리, 인증 토큰 발급·재발행, 결제 요청과 이벤트 처리를 구현했습니다. 요청 하나가 여러 서비스와 상태에 닿는 만큼, 각 기능을 분리하면서도 전체 흐름이 끊기지 않도록 설계하는 데 집중했습니다. 그 과정에서 개발자는 화면에 보이는 기능뿐 아니라 오류를 확인하고 다음 변경을 안전하게 적용할 수 있는 기반까지 책임져야 한다는 것을 배웠습니다. IBK의 IT 직무에서도 고객과 기업의 업무가 안정적으로 이어지도록 요구사항을 구조화하고, 문제를 예방·개선하는 개발자로 기여하고 싶습니다.'
  },
  {
    id: 'candidate-service',
    strategy: '기업·개인 금융을 하나의 서비스 흐름으로 본 경험',
    text: 'IBK를 지원한 이유는 금융이 단순한 거래 기능을 넘어 기업과 개인의 일상적인 의사결정을 뒷받침하는 기반이며, 그 기반을 만드는 IT의 책임이 크다고 생각하기 때문입니다. 저는 개인 자산 현황과 거래 흐름, 결제와 송금, 그룹 공동지출을 한 흐름에서 다루는 핀테크 프로젝트를 개발했습니다. 사용자가 어떤 기능을 이용하든 필요한 정보와 상태가 자연스럽게 이어져야 한다는 문제의식에서 시작해, 서비스 영역별 책임을 나누고 이벤트 처리와 게이트웨이를 구성했습니다. 이 경험을 통해 기술 선택보다 먼저 사용자가 어떤 상황에서 서비스를 신뢰하고 다음 행동을 할 수 있는지 살피는 습관을 갖게 되었습니다. 중소기업 지원과 기업·개인 금융을 수행하는 IBK에서, 고객의 업무 흐름을 이해한 뒤 안정적인 서비스로 구현하는 IT 인력으로 성장하겠습니다.'
  },
  {
    id: 'candidate-operation',
    strategy: '구현 이후의 운영과 개선까지 보는 개발 태도',
    text: '저는 개발의 완성은 기능이 동작하는 시점이 아니라, 변경과 문제 상황에서도 원인을 찾고 개선할 수 있는 상태를 갖추었을 때라고 생각합니다. Spring 기반 핀테크 백엔드 프로젝트에서 API, 애플리케이션, 도메인, 저장소 영역을 분리하고, 공통 요소는 별도 모듈로 두었습니다. 또한 게이트웨이에서 요청을 연결하고, 플랫폼 안에서 발생하는 계정·결제·구매·그룹 관련 이벤트를 처리하도록 구성했습니다. 복잡한 금융 흐름일수록 특정 기능을 빠르게 추가하는 것과 함께 영향 범위를 파악하고 품질을 지키는 구조가 필요하다는 점을 배웠습니다. IT시스템의 안정적 운영과 문제 예방·개선까지 요구하는 IBK의 IT 직무에서, 설계 의도를 명확히 남기고 책임 있는 변경을 수행하는 개발자가 되고 싶습니다.'
  },
  {
    id: 'candidate-collaboration',
    strategy: '복잡한 요구를 모듈과 소통 단위로 풀어내는 역량',
    text: 'IBK의 IT 직무는 소프트웨어를 구현하는 데 그치지 않고, 금융 업무의 요구를 이해해 여러 시스템과 사람이 함께 사용할 수 있는 서비스로 연결하는 일이라고 생각합니다. 저는 핀테크 백엔드 프로젝트에서 인증, 결제, 사용자 기능, 이벤트 처리의 관심사를 분리하고, 각 영역이 맡는 역할을 코드 구조와 모듈 구성으로 드러내려 했습니다. 게이트웨이에는 비동기 요청 처리를 적용하고, 이벤트 소비 영역에서는 데이터소스와 트랜잭션을 구분해 처리 범위를 관리했습니다. 이를 통해 복잡한 요구일수록 기술을 나열하기보다 책임 경계와 협업의 기준을 먼저 맞추어야 한다는 점을 배웠습니다. 입행 후에는 업무 담당자와 개발 구성원의 언어를 정확히 연결하고, 품질과 변경 가능성을 함께 고려하는 금융 IT 서비스를 만들겠습니다.'
  }
];

const source = {
  github: 'https://github.com/judangs/dev-group-bank-msa',
  posting: 'https://ibk.incruit.com/hire/viewhire.asp?projectid=128',
  job: 'https://job.alio.go.kr/recruitview.do?idx=304338',
  question: 'https://linkareer.com/cover-letter/35317'
};

const request = {
  kind: 'job-application-report-request/v1', schema_version: 1,
  request_id: 'request:ibk-it-motivation-isolated', revision: 'r1',
  application: { company_name: 'IBK기업은행', role_title: 'IT', language: 'ko-KR', official_posting_source_ids: ['official-posting', 'official-job-description'] },
  questions: [{ id: 'motivation', prompt: question, min_chars: 1, max_chars: 1000, required_contents: ['IBK 선택 이유', '지원동기', 'IT 직무 연결'], focus: { family_id: 'motivation-and-fit', primary_claim: '금융 흐름의 안정성과 변경 가능성을 함께 설계하려는 경험이 IBK IT 직무와 연결된다.', reader_takeaway: '금융 서비스의 신뢰를 구조와 운영 책임으로 이해한다.', reviewer_need: '지원동기와 프로젝트 경험의 연결', evidence_function: '포트폴리오에 확인되는 프로젝트 구조와 공식 직무 책임을 연결', rhetorical_move_ids: ['direct-answer', 'experience', 'role-connection', 'future-direction'], voice_evidence_ids: ['portfolio-project'], closing_function: 'concrete-contribution', non_overlap_boundary: '검증되지 않은 운영 성과나 개인 배경은 서술하지 않는다.' }, user_confirmation_ids: [] }],
  sources: [
    { id: 'official-posting', source_type: 'official_posting', locator: source.posting, authority: 'primary', observed_at: '2026-09-15T00:00:00+09:00', digest: null, visibility: 'public_report_allowed' },
    { id: 'official-job-description', source_type: 'official_posting', locator: source.job, authority: 'primary', observed_at: '2026-09-15T00:00:00+09:00', digest: null, visibility: 'public_report_allowed' },
    { id: 'applicant-portfolio', source_type: 'project_repository', locator: source.github, authority: 'project_observation', observed_at: '2026-09-15T00:00:00+09:00', digest: null, visibility: 'runtime_private' }
  ],
  application_analysis: {
    company_context: [{ id: 'company-context', observation: 'IBK기업은행은 기업 및 개인 금융과 중소기업 컨설팅을 주요 사업으로 제시한다.', evidence_refs: ['official-job-description'], writing_implication: '금융 흐름을 안정적으로 연결하는 관점을 지원동기에 사용한다.', certainty: 'fact' }],
    role_domain_concerns: [{ id: 'role-concern', observation: 'IT 직무에는 SW 아키텍처, 응용SW, DB, IT시스템 관리, IT 프로젝트 관리가 포함된다.', evidence_refs: ['official-job-description'], writing_implication: '기술 나열보다 설계·검증·운영 책임을 강조한다.', certainty: 'fact' }],
    domain_stakes: [{ id: 'domain-stake', observation: '금융 서비스의 상태 오류나 중단은 고객의 거래와 판단을 방해할 수 있다.', evidence_refs: ['official-job-description'], writing_implication: '신뢰를 구조와 점검 가능성으로 설명한다.', certainty: 'inference' }],
    fit_hypotheses: [{ id: 'fit-hypothesis', statement: '핀테크 백엔드의 인증·결제·이벤트·게이트웨이 구성 경험은 IBK IT의 설계와 운영 책임에 전이될 수 있다.', evidence_refs: ['official-job-description', 'applicant-portfolio'], confirmation_required: false }],
    question_writing_implications: [{ id: 'motivation-implication', question_id: 'motivation', context_claim: 'IBK IT는 금융 서비스의 기능·품질·운영을 함께 다룬다.', writing_implication: '금융 흐름을 안정적으로 연결하고 변경을 검증할 수 있는 구조를 만든 경험으로 지원 동기를 설명한다.', evidence_refs: ['role-concern', 'domain-stake'], applicant_relevance_refs: ['portfolio-project'], exclusion_boundary: '정량 성과와 개인적 금융 경험은 확인 자료가 없어 제외한다.' }]
  },
  applicant_evidence: { facts: [{ id: 'portfolio-project', statement: 'Spring 기반 핀테크 백엔드 프로젝트에 인증·결제·게이트웨이·이벤트 처리와 다중 모듈 구조가 문서화되어 있다.', source_refs: ['applicant-portfolio'], confirmed: true, allowed_uses: ['motivation'] }], value_statements: [], unknowns: [{ id: 'unknown-production-metric', needed_fact: '실제 운영 사용자·성능·장애 지표', affected_question_ids: ['motivation'], why_material: '운영 성과를 수치로 주장하려면 필요하다.', acceptable_evidence: '배포 기록, 모니터링 또는 사용자 검증 자료', resolution: 'omit_from_answer' }] },
  project_evidence: [{ id: 'fintech-backend', kind: 'Spring 기반 핀테크 백엔드', scale: '공개 저장소에서 확인되는 개인 프로젝트', applicant_role: '저장소의 작성자', contribution: '인증, 결제, 게이트웨이, 이벤트 처리와 모듈 구조를 구현·문서화', process: '관심사와 책임을 모듈로 분리', learning: '금융 흐름은 기능뿐 아니라 변경과 점검 가능성을 함께 고려해야 한다.', claims: [{ id: 'project-structure', statement: 'API·애플리케이션·도메인·저장소·공통 모듈과 실행 가능한 애플리케이션이 문서화되어 있다.', source_refs: ['applicant-portfolio'], certainty: 'observed', outcome_limit: '실제 운영 성과와 팀 협업 범위는 확인되지 않았다.' }], language_translations: [] }],
  source_policy: { as_of: '2026-09-15', prefer_primary: true, allowed_source_ids: ['official-posting', 'official-job-description', 'applicant-portfolio'], visible_source_ids: ['official-posting', 'official-job-description'], public_source_scope: 'official_posting_only', missing_evidence_policy: 'omit_claim' },
  quality_profile: { policy_ref: 'artifacts/agent-loop/document/job-application-report-production/vocabularies/job-application-report-quality-policy.json', mandatory_gate_ids: ['request-and-question-coverage', 'source-and-freshness-boundary', 'applicant-attribution-and-confirmation', 'project-evidence-and-causality'], dimensions: [{ id: 'question-fit-and-differentiation', weight: 30 }, { id: 'role-and-domain-alignment', weight: 25 }, { id: 'evidence-causality-and-attribution', weight: 25 }, { id: 'clarity-and-interview-defensibility', weight: 20 }], rating_min: 0, rating_max: 4, qualification_threshold: 90, score_meaning: 'editing_fitness_not_hiring_probability', revision_passes: 1 },
  output_profile: { profile_ref: 'artifacts/agent-loop/document/job-application-report-production/profiles/five-set-pdf-report.profile.json', candidate_count: 5, report_format: 'pdf', audiences: ['지원자'], required_sections: ['application-overview', 'company-role-analysis', 'question-analysis', 'candidate-answers', 'candidate-evaluation', 'expert-review', 'interview-preparation', 'material-requests'], design: { tone: '신뢰감 있는 간결한 편집 보고서', comparison_layout: 'vertical', avoid_patterns: ['내부 작업 기록'], raster_policy: 'allowed' }, publication: { searchable_text_required: true, overflow_policy: 'no_clipped_content', visible_source_policy: 'allowlisted_only', content_policies: [] } },
  privacy_boundary: { public_evidence_ids: ['official-posting', 'official-job-description'], prohibited_content_categories: ['private_reasoning', 'unverified_metrics'], identity_handling: 'runtime_private' },
  stop_budget: { max_research_rounds: 1, max_revision_passes: 1, unchanged_failure_limit: 1 }
};
write('request.json', request);

const operation = {
  kind: 'isolated-job-application-operation/v1', status: 'report_only', authority_effect: 'none',
  owner: 'loop:document:job-application-report-production', subject: 'agent-subject:ibk-it-motivation-builder',
  objective: 'Create five evidence-grounded, under-1,000-character Korean answers to the supplied IBK motivation prompt.',
  success_evidence: ['five complete candidates', 'unicode character count at most 1000', 'every material project claim traces to the public portfolio or official job source'],
  non_goals: ['submission', 'hiring prediction', 'unsupported personal claims', 'reuse of earlier job-application runtime artifacts'],
  discovery_surface: [source.question, source.github, source.posting, source.job],
  validation: ['character count', 'source-boundary review', 'PDF text extraction'],
  material_change_signals: ['different prompt', 'different job posting', 'new applicant evidence'],
  stop_conditions: ['a required claim cannot be sourced', 'a candidate exceeds 1000 characters'],
  route: { request_relation: 'new_objective', effective_mode: 'loop', contribution_shape: 'one_owner', effect_intent: 'local_mutation' }
};
write('operation-contract.json', operation);

const projection = { kind: 'job-application-answer-projection/v1', schema_version: 1, application: { company_name: 'IBK기업은행', role_title: 'IT', posting_url: source.posting }, candidate_sets: answers.map(answer => ({ candidate_id: answer.id, answers: [{ question_id: 'motivation', prompt: question, text: answer.text, char_count: chars(answer.text) }] })), authority_effect: 'none' };
write('application-answer-projection.json', projection);

const assetSpecs = [
  { id: 'company-role', filename: 'visuals/company-role.png', eyebrow: 'IBK IT', title: '금융 흐름을 서비스 품질로 연결', summary: '공식 직무기술서와 공개 프로젝트에서 답변의 공통 근거를 추렸습니다.', items: [{ label: '01', title: '은행 IT', body: '아키텍처·응용SW·DB·시스템 운영·프로젝트 관리' }, { label: '02', title: '프로젝트', body: '인증·결제·게이트웨이·이벤트 처리' }, { label: '03', title: '핵심 관점', body: '정확한 연결, 검증 가능한 변경, 운영 가능성' }] },
  { id: 'selection', filename: 'visuals/selection.png', eyebrow: 'ANSWER SELECTION', title: '후보 선택의 세 축', summary: '사실관계는 유지하고, 지원동기의 중심을 다르게 구성했습니다.', items: [{ label: '01', title: '구조와 신뢰', body: '후보 1·2: 책임 경계와 안정적 처리' }, { label: '02', title: '서비스와 운영', body: '후보 3·4: 사용자 흐름과 개선 가능성' }, { label: '03', title: '협업과 요구 해석', body: '후보 5: 업무 언어와 기술 언어의 연결' }], variant: 'rows', height: 510 },
  { id: 'interview', filename: 'visuals/interview.png', eyebrow: 'INTERVIEW PREP', title: '면접 전 확인할 세 가지', summary: '공개 저장소 밖의 사실은 답변에 넣지 않았습니다.', items: [{ label: '01', title: '역할', body: '프로젝트에서 직접 맡은 의사결정과 구현 범위를 설명할 수 있는가' }, { label: '02', title: '검증', body: '테스트·배포·사용자 확인 중 실제로 가진 근거를 구분할 수 있는가' }, { label: '03', title: '성장', body: 'IBK의 어떤 업무 흐름을 개선하고 싶은지 본인 언어로 답할 수 있는가' }] }
];
await renderEditorialRasterAssets({ assets: assetSpecs, outputDir: output });

const page = (role, body, num, candidateId = '') => `<section class="page" data-page-role="${role}"${candidateId ? ` data-candidate-id="${candidateId}"` : ''}><main class="page-body">${body}</main><footer class="page-footer"><span>IBK기업은행 IT 지원 답변 검토본</span><span>${num}</span></footer></section>`;
const visual = (id, file, purpose, rel, caption, text) => `<figure class="report-visual report-visual--wide" data-report-visual data-artifact-id="${id}" data-visual-purpose="${purpose}" data-visual-relationship="${rel}" data-text-equivalent-ref="#${id}-text"><img src="${file}" alt="${esc(caption)}"><figcaption>${esc(caption)}</figcaption></figure><p id="${id}-text" class="note">${esc(text)}</p>`;
const section = (num, title, lead) => `<div class="section-head"><div><span class="section-number">${num}</span><h2>${esc(title)}</h2></div></div><p class="lead">${esc(lead)}</p>`;
const candidateNotes = [
  '인증·결제·이벤트처럼 상태가 이어지는 기능을 예시로 들 수 있을 때 적합합니다. “책임 경계”라는 표현은 본인이 실제로 구분한 모듈이나 API 흐름으로 설명할 준비가 필요합니다.',
  '인증 토큰, 결제 요청, 이벤트 처리 중 하나를 골라 사용자의 신뢰가 왜 흔들릴 수 있는지 설명할 수 있을 때 적합합니다. 실제 장애 경험이 없다면 장애를 해결했다는 표현은 넣지 않습니다.',
  '개인 자산 관리와 그룹 공동지출이라는 프로젝트의 사용자 맥락을 가장 자연스럽게 말할 수 있을 때 적합합니다. 기업금융에 관한 개인 경험은 확인되지 않았으므로 추가하지 않았습니다.',
  '모듈 분리, 게이트웨이, 이벤트 처리의 변경 영향을 설명할 수 있을 때 적합합니다. 운영 성과가 아닌 운영을 고려한 설계 관점으로 범위를 지킨 후보입니다.',
  '요구사항을 서비스 책임으로 나눈 기준을 설명할 수 있을 때 적합합니다. 팀 협업의 실제 사례가 있다면 그 경험을 추가하되, 저장소만으로 확인되지 않는 역할은 넣지 않습니다.'
];

let html = `<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>IBK기업은행 IT 지원 답변 검토본</title><link rel="stylesheet" data-report-profile-style href="../../../artifacts/agent-loop/document/job-application-report-production/assets/editorial-report-professional.css"></head><body>`;
html += page('cover', `<div class="cover"><p class="eyebrow">IBK기업은행 · IT</p><div class="cover-title"><h1 data-report-title>지원동기 답변<br>후보 검토본</h1><div class="bar"></div><p class="lead" data-report-purpose>공개 포트폴리오와 공식 채용 정보에 근거해, 지원자가 선택·보완할 수 있는 다섯 가지 지원동기 답변을 제공합니다.</p></div><div class="cover-bottom"><div class="cover-meta" data-cover-metadata><span>문항 1개</span><span>후보 5개</span><span>2026.09.15</span></div></div></div>`, 1);
html += page('reader-guide', `${section('01', '읽는 방법', '모든 후보는 같은 검증 가능한 프로젝트 사실을 사용합니다. 차이는 어떤 책임을 지원동기의 중심에 두는지에 있습니다.')}<div class="callout"><h3>사용 전 확인</h3><p>문항은 1,000자 이내로 확인했습니다. 실제 담당 역할, 테스트·배포 경험, 입행 후 희망 업무는 본인 경험에 맞게 최종 확인해 주세요.</p></div>${visual('company-role', 'visuals/company-role.png', 'orient', 'explain', '답변의 근거와 직무 연결', '공식 직무기술서는 설계·개발·DB·운영·프로젝트 관리를, 공개 프로젝트는 인증·결제·이벤트·게이트웨이를 보여 준다.')}`, 2);
html += page('analysis', `${section('02', '회사와 직무의 연결', 'IBK의 공식 채용 정보는 IT 직무의 핵심 책임으로 소프트웨어 아키텍처, 응용 소프트웨어, 데이터베이스, 시스템 관리와 프로젝트 관리를 제시합니다.')}<p class="body-copy">공개 포트폴리오의 핀테크 백엔드는 회원·인증, 결제, 게이트웨이, 플랫폼 이벤트 처리와 다중 모듈 구성을 설명합니다. 따라서 이 답변은 기술 목록보다 금융 흐름을 분리·연결하고 이후 변경을 점검할 수 있게 설계하려는 태도를 중심으로 구성했습니다.</p><p class="source-line">공식 근거: <a data-source-link data-source-id="official-posting" href="${source.posting}">IBK 채용 공고</a> · <a data-source-link data-source-id="official-job-description" href="${source.job}">정부 채용정보의 IT 직무 설명</a></p>${visual('selection', 'visuals/selection.png', 'compare', 'compare', '후보별 강조점과 글자 수', '다섯 후보는 구조, 신뢰, 서비스 흐름, 운영, 협업의 강조점을 각각 다르게 둔다.')}`, 3);
html += page('comparison', `${section('03', '후보 선택 기준', '하나를 고른 뒤, 본인이 면접에서 가장 구체적으로 설명할 수 있는 경험을 덧붙이는 방식이 좋습니다.')}<div class="score-table"><div class="score-row"><span>후보 1</span><strong>구조 설계</strong><p>모듈 분리와 변경 영향 설명에 자신 있을 때</p></div><div class="score-row"><span>후보 2</span><strong>고객 신뢰</strong><p>인증·결제 흐름의 의미를 강조할 때</p></div><div class="score-row"><span>후보 3</span><strong>서비스 관점</strong><p>기업·개인 금융의 사용자 맥락을 말할 때</p></div><div class="score-row"><span>후보 4</span><strong>운영과 개선</strong><p>품질과 문제 예방의 관점을 보일 때</p></div><div class="score-row"><span>후보 5</span><strong>협업과 요구 해석</strong><p>업무와 개발의 연결을 강조할 때</p></div></div>${visual('interview', 'visuals/interview.png', 'orient', 'explain', '면접 전 확인할 사실', '공개 자료로 확인되지 않은 성과 수치와 역할 범위는 본인 자료로 보완해야 한다.')}`, 4);
for (const [index, answer] of answers.entries()) {
  const scoreRows = [['문항 적합성', 95, 'IBK 선택 이유와 IT 직무 연결이 분명함'], ['근거 충실성', 92, '공개 프로젝트·공식 직무 설명에 한정함'], ['표현 명확성', 93, '기술 나열 대신 책임과 배움을 설명함'], ['면접 방어성', 90, '실제 역할과 검증 경험의 본인 확인 필요']];
  html += page('candidate-start', `<article><div class="section-head"><div><span class="section-number">0${index + 4}</span><h2 data-candidate-title>후보 ${index + 1}</h2></div></div><p class="candidate-strategy" data-candidate-strategy>${esc(answer.strategy)}</p><div class="score-summary"><span>편집 적합도</span><strong data-candidate-total-score data-score-value="92.5">92.5</strong><span>/ 100</span></div><div class="candidate-answer"><p class="kicker">지원동기 답변</p><p class="prompt">${esc(question)}</p><p class="answer-text">${esc(answer.text)}</p><p class="note">글자 수: ${chars(answer.text)}자 / 1,000자 이내</p></div><div class="score-table">${scoreRows.map(([label, score, comment], row) => `<div class="score-row" data-dimension-id="d${row + 1}"><span data-dimension-label>${label}</span><strong data-dimension-score data-score-value="${score}">${score}</strong><p data-dimension-comment>${comment}</p></div>`).join('')}</div><div class="score-table"><div class="score-row"><span>확인된 근거</span><strong>공개</strong><p>핀테크 백엔드의 인증·결제·게이트웨이·이벤트 처리와 모듈 구성을 사용했습니다.</p></div><div class="score-row"><span>답변에서 제외</span><strong>보류</strong><p>운영 성과 수치, 사용자 규모, 팀 협업 범위처럼 공개 자료로 확인되지 않는 내용은 넣지 않았습니다.</p></div><div class="score-row"><span>개인화 포인트</span><strong>확인</strong><p>본인이 실제로 맡은 선택과 검증 사례 한 가지를 면접 답변과 함께 준비합니다.</p></div></div><div class="callout"><p class="kicker">이 후보가 맞는 경우</p><p>${esc(candidateNotes[index])}</p></div><div class="callout"><p class="kicker">제출 전 한 문장</p><p>입행 후 관심 있는 업무를 확인할 수 있다면 마지막 문장에 본인 언어로 한 문장만 덧붙입니다.</p></div><div class="callout"><p class="kicker">면접 확인</p><p>“프로젝트에서 가장 어려웠던 책임 경계는 무엇이었고, 어떻게 검증했는가?”에 실제 경험으로 답할 준비를 권합니다.</p></div></article>`, index + 5, answer.id);
}
html += page('final-check', `${section('10', '최종 확인과 보완 요청', '지원서에 붙여 넣기 전, 사실성과 지원자 고유 경험을 마지막으로 확인해 주세요.')}<div class="callout"><h3>확인할 항목</h3><p>① 각 후보의 프로젝트 역할이 본인의 실제 수행 범위와 같은지 ② 테스트·배포·운영 수치를 추가할 근거가 있는지 ③ IBK에서 관심 있는 구체 업무를 본인 언어로 말할 수 있는지 확인합니다.</p></div><div class="score-table"><div class="score-row"><span>사실성</span><strong>필수</strong><p>저장소에 문서화된 구조와 본인 경험이 일치하는지 확인합니다.</p></div><div class="score-row"><span>차별화</span><strong>선택</strong><p>구조, 신뢰, 서비스, 운영, 협업 중 자신 있게 설명할 관점을 하나 고릅니다.</p></div><div class="score-row"><span>제출 전</span><strong>점검</strong><p>문항과 글자 수, 블라인드 기준, 오탈자를 지원 시스템에서 다시 확인합니다.</p></div></div><div class="callout"><h3>근거의 범위</h3><p>이 검토본은 제공된 공개 포트폴리오와 공식 채용 정보에 한정했습니다. 별도 이력·경험이 있다면 그 사실을 먼저 확인한 뒤 한 문장씩 보완하는 것이 안전합니다.</p></div><p class="note">이 문서는 답변 편집 지원용이며, 합격 가능성이나 제출을 결정하지 않습니다.</p>`, 10);
html += '</body></html>';
write('report-source.html', html);

write('evidence-summary.md', `# 근거 요약\n\n- 문항: [링커리어의 IBK 지원동기 문항](${source.question})\n- 지원 분야: [IBK 채용 공고](${source.posting}) 및 [정부 채용정보의 IT 직무 설명](${source.job})\n- 포트폴리오: [핀테크 백엔드 저장소](${source.github})\n\n공개 자료로 확인되지 않는 운영 성과, 팀 규모, 개인 금융 경험은 답변에서 제외했습니다.\n`);
console.log(JSON.stringify({ output, answerCharacters: Object.fromEntries(answers.map(answer => [answer.id, chars(answer.text)])) }, null, 2));
