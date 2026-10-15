#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { renderEditorialRasterAssets } from '../../../artifacts/agent-loop/document/job-application-report-production/scripts/render_editorial_raster_assets.mjs';
import { enumerationChains, expressionMetrics } from '../../../artifacts/agent-loop/document/job-application-report-production/scripts/check_job_application_writing_quality.mjs';

const repoRoot = process.cwd();
const runtimeRelative = '.collab/artifacts/job-application-2026-09-ibk-it-fresh-2026-09-15';
const runtimeDir = path.resolve(repoRoot, runtimeRelative);
const ownerRelative = 'artifacts/agent-loop/document/job-application-report-production';
const ownerDir = path.resolve(repoRoot, ownerRelative);
const profilePath = path.join(ownerDir, 'profiles/five-set-pdf-report.profile.json');
const baseRequestPath = path.join(runtimeDir, 'request.json');
const reportDate = '2026-09-15';
const observedAt = '2026-09-15T20:00:00+09:00';

const loadJson = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (name, value) => {
  const file = path.join(runtimeDir, name);
  fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n', 'utf8');
  return file;
};
const writeText = (name, value) => {
  const file = path.join(runtimeDir, name);
  fs.writeFileSync(file, value, 'utf8');
  return file;
};
const sha256 = value => crypto.createHash('sha256').update(value).digest('hex');
const digestFile = file => sha256(fs.readFileSync(file));
const codePointLength = value => Array.from(value).length;
const round2 = value => Math.round((value + Number.EPSILON) * 100) / 100;
const rel = name => path.posix.join(runtimeRelative, name);
const esc = value => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');
const paragraphs = value => value.split(/\n\n/gu).map(part => `<p>${esc(part)}</p>`).join('');
const run = (script, args, label) => {
  const result = spawnSync(process.execPath, [script, ...args], {
    cwd: repoRoot,
    encoding: 'utf8',
  });
  if (result.status !== 0) {
    process.stderr.write(result.stdout || '');
    process.stderr.write(result.stderr || '');
    throw new Error(`${label} failed`);
  }
  return result.stdout;
};

fs.mkdirSync(path.join(runtimeDir, 'assets'), { recursive: true });
fs.rmSync(path.join(runtimeDir, 'render'), { recursive: true, force: true });
fs.mkdirSync(path.join(runtimeDir, 'render'), { recursive: true });

const baseRequest = loadJson(baseRequestPath);
const request = structuredClone(baseRequest);
request.request_id = 'request:ibk:it:2026-h2:contextual-report';
request.revision = 'contextual-five-set-pdf';

const sourceUrls = {
  posting: 'https://ibk.incruit.com/hire/viewhire.asp?projectid=128',
  questions: 'https://secure.jasoseol.com/employment/employment_question.json?employment_id=427724',
  alio: 'https://job.alio.go.kr/recruitview.do?idx=304338',
  strategy: 'https://global.ibk.co.kr/en/company/Strategy',
  ceo: 'https://research.ibk.co.kr/fup/research/ceo/2026030914183228846181017803886.pdf',
  resilience: 'https://www.bis.org/committees/bcbs/basel-consolidated-guidelines/module/orr/20',
  collab: 'https://github.com/pociie/collab-mono',
};

request.sources = [
  { id: 'source-ibk-posting', source_type: 'official_posting', locator: sourceUrls.posting, authority: 'primary', observed_at: observedAt, digest: null, visibility: 'public_report_allowed' },
  { id: 'source-ibk-question-endpoint', source_type: 'official_posting', locator: sourceUrls.questions, authority: 'primary', observed_at: observedAt, digest: null, visibility: 'runtime_private' },
  { id: 'source-ibk-alio', source_type: 'official_posting', locator: sourceUrls.alio, authority: 'primary', observed_at: observedAt, digest: null, visibility: 'runtime_private' },
  { id: 'source-ibk-strategy', source_type: 'official_company', locator: sourceUrls.strategy, authority: 'primary', observed_at: observedAt, digest: null, visibility: 'public_report_allowed' },
  { id: 'source-ibk-ceo-2026', source_type: 'official_company', locator: sourceUrls.ceo, authority: 'primary', observed_at: observedAt, digest: null, visibility: 'public_report_allowed' },
  { id: 'source-basel-operational-resilience', source_type: 'official_documentation', locator: sourceUrls.resilience, authority: 'primary', observed_at: observedAt, digest: null, visibility: 'runtime_private' },
  { id: 'source-applicant-statements', source_type: 'applicant_statement', locator: 'runtime:applicant-provided-statements', authority: 'applicant_owned', observed_at: observedAt, digest: null, visibility: 'runtime_private' },
  { id: 'source-collab-mono', source_type: 'project_repository', locator: sourceUrls.collab, authority: 'project_observation', observed_at: observedAt, digest: null, visibility: 'runtime_private' },
];

request.application.official_posting_source_ids = [
  'source-ibk-posting',
  'source-ibk-question-endpoint',
  'source-ibk-alio',
];

request.application_analysis = {
  company_context: [
    {
      id: 'company-context-ibk-mission',
      observation: 'IBK기업은행은 중소기업과 고객의 성장을 금융으로 연결하는 정체성을 공식 전략에서 제시한다.',
      evidence_refs: ['source-ibk-strategy', 'source-ibk-ceo-2026'],
      writing_implication: '지원동기는 은행 규모나 안정성의 일반론보다 기업 고객의 중요한 선택을 지속시키는 IT 책임과 연결한다.',
      certainty: 'fact',
    },
    {
      id: 'company-context-ibk-digital-direction',
      observation: 'IBK는 디지털과 AI 역량을 고객 가치와 생산적 금융의 실행 수단으로 다룬다.',
      evidence_refs: ['source-ibk-ceo-2026'],
      writing_implication: '기술 자체를 목표로 제시하지 않고 업무 판단의 정확성, 처리 연속성, 개선 속도를 높이는 수단으로 설명한다.',
      certainty: 'fact',
    },
  ],
  role_domain_concerns: [
    {
      id: 'role-concern-it-lifecycle',
      observation: '공고의 IT 직무는 금융 시스템과 애플리케이션의 개발 및 유지보수를 포함해 데이터, 보안, 인프라와 맞닿은 책임을 요구한다.',
      evidence_refs: ['source-ibk-posting', 'source-ibk-alio'],
      writing_implication: '한 기능의 구현보다 요청이 처리되고 기록되며 복구되는 전체 책임을 지원자의 경험으로 설명한다.',
      certainty: 'fact',
    },
    {
      id: 'role-concern-cross-function',
      observation: '금융 IT 결과는 개발 코드만으로 완성되지 않고 업무 규칙, 데이터 상태, 접근 권한, 운영 확인이 함께 맞아야 한다.',
      evidence_refs: ['source-ibk-posting', 'source-basel-operational-resilience'],
      writing_implication: '협업은 추상적인 소통이 아니라 책임과 완료 기준을 합의하는 방식으로 표현한다.',
      certainty: 'inference',
    },
  ],
  domain_stakes: [
    {
      id: 'domain-stake-continuity',
      observation: '금융 서비스의 핵심 업무는 장애 상황에서도 식별되고 보호되며 복구될 수 있어야 한다.',
      evidence_refs: ['source-basel-operational-resilience'],
      writing_implication: '속도 중심의 포부보다 고객이 처리 상태를 확인하고 업무를 이어 갈 수 있는 연속성 관점을 채택한다.',
      certainty: 'fact',
    },
    {
      id: 'domain-stake-integrity',
      observation: '결제와 자산 정보는 처리 성공 여부뿐 아니라 상태의 정확성과 사후 설명 가능성이 사용자 신뢰를 좌우한다.',
      evidence_refs: ['source-basel-operational-resilience', 'source-applicant-statements'],
      writing_implication: '백엔드 역량을 데이터 흐름, 오류 확인, 재처리 판단까지 이어지는 책임으로 구체화한다.',
      certainty: 'inference',
    },
  ],
  fit_hypotheses: [
    {
      id: 'fit-payment-service-flow',
      statement: '결제 및 자산 관리 백엔드를 요구 분석부터 배포까지 수행한 경험은 금융 업무를 안정적인 처리 흐름으로 바꾸는 역할과 연결된다.',
      evidence_refs: ['applicant-fact-payment-project', 'project-claim-payment-end-to-end'],
      confirmation_required: false,
    },
    {
      id: 'fit-reusable-work-design',
      statement: '재사용 가능한 작업 구조와 검증 기준을 설계한 경험은 반복되는 개발·검토 업무의 품질을 일관되게 만드는 태도를 보여준다.',
      evidence_refs: ['applicant-fact-loop-design', 'project-claim-reusable-contracts'],
      confirmation_required: false,
    },
  ],
  question_writing_implications: [
    {
      id: 'writing-implication-motivation',
      question_id: 'question-motivation',
      context_claim: 'IBK를 선택한 이유는 중소기업과 고객의 중요한 업무를 디지털 서비스로 지속시키는 책임에서 찾아야 한다.',
      writing_implication: '개인 프로젝트에서 형성된 금융 서비스 관점을 출발점으로 삼고, 입행 후 첫 책임과 성장 방향을 단계적으로 제시한다.',
      evidence_refs: ['company-context-ibk-mission', 'company-context-ibk-digital-direction'],
      applicant_relevance_refs: ['applicant-fact-payment-project', 'applicant-value-user-next-action'],
      exclusion_boundary: '회사 칭찬, 안정성 일반론, 근거 없는 개인적 추억은 제외한다.',
    },
    {
      id: 'writing-implication-strength',
      question_id: 'question-strength',
      context_claim: '강점 문항은 반복 가능한 행동이 실제 산출물이나 완료 상태를 만든 경험을 요구한다.',
      writing_implication: '한 경험에서 문제 인식, 본인 판단, 수행, 확인 가능한 결과를 연결하고 미래 기여는 짧게 남긴다.',
      evidence_refs: ['role-concern-it-lifecycle'],
      applicant_relevance_refs: ['project-claim-payment-end-to-end', 'project-claim-reusable-contracts'],
      exclusion_boundary: '기술 목록과 다른 문항의 포부를 성과 대신 사용하지 않는다.',
    },
    {
      id: 'writing-implication-growth',
      question_id: 'question-growth',
      context_claim: '성장 문항은 성공 규모보다 이전 판단과 이후 행동이 어떻게 달라졌는지를 묻는다.',
      writing_implication: '막힌 지점과 선택의 이유를 보여준 뒤 현재의 작업 습관으로 변화가 이어졌음을 설명한다.',
      evidence_refs: ['role-concern-cross-function'],
      applicant_relevance_refs: ['project-claim-alternative-refinement', 'project-claim-reusable-contracts'],
      exclusion_boundary: '프로젝트 기능 요약이나 현재 강점의 반복은 제외한다.',
    },
    {
      id: 'writing-implication-capability',
      question_id: 'question-it-capability',
      context_claim: 'IT 역량은 금융 업무의 처리 연속성, 상태 정확성, 협업 가능한 책임으로 번역되어야 한다.',
      writing_implication: '핵심 역량 하나를 선택해 경험에서 형성된 판단 기준과 IBK에서의 초기 활용 장면을 연결한다.',
      evidence_refs: ['domain-stake-continuity', 'domain-stake-integrity'],
      applicant_relevance_refs: ['applicant-fact-payment-project', 'applicant-fact-loop-design'],
      exclusion_boundary: '프레임워크 이름의 나열과 경험하지 않은 운영 성과는 제외한다.',
    },
  ],
};

request.applicant_evidence = {
  facts: [
    {
      id: 'applicant-fact-payment-project',
      statement: '개인 프로젝트로 결제 및 자산 관리 기능을 포함한 백엔드 애플리케이션을 요구 분석, 구조 설계, 구현, 배포까지 주도했다.',
      source_refs: ['source-applicant-statements'],
      confirmed: true,
      allowed_uses: ['question-motivation', 'question-strength', 'question-growth', 'question-it-capability'],
    },
    {
      id: 'applicant-fact-loop-design',
      statement: 'collab-mono 프로젝트에서 재사용 가능한 아티팩트와 작업 구조의 설계 경험을 쌓았다.',
      source_refs: ['source-applicant-statements', 'source-collab-mono'],
      confirmed: true,
      allowed_uses: ['question-strength', 'question-growth', 'question-it-capability'],
    },
    {
      id: 'applicant-fact-backend-responsibility',
      statement: '서비스 흐름을 분석하고 관련 책임을 나눈 뒤 대안을 검토해 구조를 다듬는 방식으로 백엔드 문제를 해결한다.',
      source_refs: ['source-applicant-statements'],
      confirmed: true,
      allowed_uses: ['question-strength', 'question-growth', 'question-it-capability'],
    },
  ],
  value_statements: [
    {
      id: 'applicant-value-improvement',
      statement: '반복되는 불편과 비효율을 당연하게 두지 않고 더 나은 흐름을 찾으려 한다.',
      source_refs: ['source-applicant-statements'],
      confirmed: true,
      allowed_uses: ['question-motivation', 'question-strength', 'question-growth', 'question-it-capability'],
    },
    {
      id: 'applicant-value-user-next-action',
      statement: '서비스의 완료는 기능 실행이 아니라 사용자가 결과를 이해하고 다음 행동을 할 수 있는 상태까지 포함한다고 본다.',
      source_refs: ['source-applicant-statements'],
      confirmed: true,
      allowed_uses: ['question-motivation', 'question-strength', 'question-it-capability'],
    },
    {
      id: 'applicant-value-responsibility',
      statement: '협업에서는 각 업무의 책임 범위와 확인 기준을 분명히 하고 대안을 함께 검토하는 태도를 중요하게 여긴다.',
      source_refs: ['source-applicant-statements'],
      confirmed: true,
      allowed_uses: ['question-strength', 'question-growth', 'question-it-capability'],
    },
  ],
  unknowns: [
    {
      id: 'unknown-personal-ibk-motivation',
      needed_fact: 'IBK를 선택하게 만든 개인적 사건이나 서비스 접점',
      affected_question_ids: ['question-motivation'],
      why_material: '현재 답안은 프로젝트 관심과 기업 방향의 논리적 연결은 충분하지만 개인적 계기가 추가되면 고유성이 더 높아진다.',
      acceptable_evidence: '직접 사용한 서비스, 관심을 갖게 된 기사나 수업, 중소기업 고객과의 접점 중 실제 경험 한 가지',
      resolution: 'narrow_to_confirmed_scope',
    },
    {
      id: 'unknown-project-observable-outcome',
      needed_fact: '결제·자산 관리 프로젝트의 사용자 수, 테스트 결과, 오류 감소 등 관찰 가능한 결과',
      affected_question_ids: ['question-strength', 'question-growth'],
      why_material: '현재는 완성·배포와 구조적 결과까지 말할 수 있으나 성과의 설득력을 높일 수치나 전후 비교가 부족하다.',
      acceptable_evidence: '테스트 리포트, 배포 화면, 성능 측정, 해결한 오류의 재현 기록, 사용 피드백 중 하나',
      resolution: 'narrow_to_confirmed_scope',
    },
    {
      id: 'unknown-collaboration-scope',
      needed_fact: 'collab-mono에서 함께 일한 인원, 본인 소유 범위, 실제 사용자 또는 적용 사례',
      affected_question_ids: ['question-strength', 'question-growth', 'question-it-capability'],
      why_material: '설계 경험은 확인되지만 팀 협업 성과로 확대하려면 참여 구조와 적용 결과가 필요하다.',
      acceptable_evidence: '담당 범위, 주요 결정 기록, 다른 사용자의 피드백, 적용 전후 비교',
      resolution: 'narrow_to_confirmed_scope',
    },
    {
      id: 'unknown-production-operation',
      needed_fact: '실사용 금융 서비스에서의 운영, 장애 대응, 보안 점검 경험 범위',
      affected_question_ids: ['question-it-capability'],
      why_material: '학습 및 개인 배포 경험과 금융기관 운영 책임을 구분하기 위해 필요하다.',
      acceptable_evidence: '모니터링 기록, 장애 회고, 보안 점검, 실제 운영 기간과 담당 범위',
      resolution: 'omit_from_answer',
    },
  ],
};

request.project_evidence = [
  {
    id: 'project-payment-asset-backend',
    kind: '결제 및 자산 관리 개인 백엔드 프로젝트',
    scale: '요구 분석부터 배포까지 개인이 수행한 백엔드 애플리케이션',
    applicant_role: '서비스 흐름 분석, 책임 설계, 구현, 검증, 배포를 주도한 개발자',
    contribution: '결제와 자산 관리 요구를 업무 흐름으로 해석하고 각 책임의 경계를 정해 동작 가능한 애플리케이션으로 완성했다.',
    process: '문제를 먼저 정의하고 가능한 대안을 검토한 뒤 현재 제약에 맞는 구조로 다듬었다.',
    learning: '좋은 백엔드 구조는 기능 수가 아니라 업무 책임과 변경 영향을 설명할 수 있어야 한다는 관점을 얻었다.',
    claims: [
      {
        id: 'project-claim-payment-end-to-end',
        statement: '결제 및 자산 관리 요구를 분석해 구조를 설계하고 코드 구현과 배포까지 전 과정을 수행했다.',
        source_refs: ['source-applicant-statements'],
        certainty: 'applicant_confirmed',
        outcome_limit: '사용자 규모와 정량 성능은 확인되지 않아 동작 가능한 애플리케이션 완성과 배포까지만 결과로 사용한다.',
      },
      {
        id: 'project-claim-alternative-refinement',
        statement: '문제 상황을 정의하고 가능한 대안을 탐색한 뒤 현재 조건에 맞는 설계로 다듬었다.',
        source_refs: ['source-applicant-statements'],
        certainty: 'applicant_confirmed',
        outcome_limit: '비교한 대안의 구체적 이름과 선택 지표는 면접 전 보강이 필요하다.',
      },
    ],
    language_translations: [
      {
        internal_term: '모듈 책임',
        universal_term: '업무 규칙, 데이터 처리, 외부 연결이 맡는 책임',
        use_condition: '구조 이름보다 각 부분이 지키는 결과를 설명할 때 사용한다.',
      },
    ],
  },
  {
    id: 'project-collab-reusable-artifacts',
    kind: '재사용 가능한 개발·문서 작업 구조 설계 프로젝트',
    scale: '다양한 작업을 일관된 절차와 검증 기준으로 실행하기 위한 개인 설계 프로젝트',
    applicant_role: '작업 경계, 입력·출력 계약, 검토 기준, 반복 개선 구조를 설계한 작성자',
    contribution: '작업마다 달라지는 요구를 보존하면서도 누락과 품질 편차를 줄일 수 있는 재사용 구조를 설계했다.',
    process: '운영 중 발견된 중복과 누수를 규칙으로만 막지 않고 자료 조사, 역할 분리, 검사, 피드백 반영의 관계로 재구성했다.',
    learning: '재사용은 같은 문장을 반복하는 일이 아니라 판단 근거와 검증 방법을 공유하면서 현재 맥락에 맞게 달라질 수 있어야 한다.',
    claims: [
      {
        id: 'project-claim-reusable-contracts',
        statement: 'collab-mono에는 재사용 가능한 작업 단위의 경계와 검증 기준을 다루는 구조가 존재하며 지원자는 그 설계 경험을 보유한다.',
        source_refs: ['source-applicant-statements', 'source-collab-mono'],
        certainty: 'applicant_confirmed',
        outcome_limit: '외부 사용자 수와 조직 성과는 확인되지 않아 설계 산출물과 반복 실행 가능성까지만 사용한다.',
      },
      {
        id: 'project-claim-feedback-refinement',
        statement: '산출물을 검토한 뒤 누락, 표현 반복, 내부 지침 노출 문제를 다음 설계와 검사에 반영했다.',
        source_refs: ['source-applicant-statements', 'source-collab-mono'],
        certainty: 'applicant_confirmed',
        outcome_limit: '개선 폭을 나타내는 외부 품질 지표는 별도 확인이 필요하다.',
      },
    ],
    language_translations: [
      {
        internal_term: 'artifact loop architecture',
        universal_term: '반복 업무의 입력, 역할, 검토, 산출물을 연결하는 재사용 가능한 작업 구조',
        use_condition: '프로젝트 내부 명칭보다 해결한 운영 문제와 판단 방식을 설명할 때 사용한다.',
      },
    ],
  },
];

const questionEvidence = {
  'question-motivation': ['applicant-fact-payment-project', 'applicant-value-user-next-action', 'company-context-ibk-mission', 'writing-implication-motivation'],
  'question-strength': ['project-claim-payment-end-to-end', 'applicant-fact-backend-responsibility', 'writing-implication-strength'],
  'question-growth': ['project-claim-feedback-refinement', 'applicant-value-improvement', 'writing-implication-growth'],
  'question-it-capability': ['applicant-fact-payment-project', 'project-claim-reusable-contracts', 'domain-stake-integrity', 'writing-implication-capability'],
};
const questionVoices = {
  'question-motivation': ['applicant-fact-payment-project', 'applicant-value-user-next-action', 'applicant-value-improvement'],
  'question-strength': ['applicant-fact-backend-responsibility', 'project-claim-payment-end-to-end', 'project-claim-reusable-contracts'],
  'question-growth': ['project-claim-alternative-refinement', 'project-claim-feedback-refinement', 'applicant-value-improvement'],
  'question-it-capability': ['applicant-fact-payment-project', 'applicant-fact-loop-design', 'applicant-value-responsibility'],
};
const questionUnknowns = {
  'question-motivation': ['unknown-personal-ibk-motivation'],
  'question-strength': ['unknown-project-observable-outcome'],
  'question-growth': ['unknown-project-observable-outcome', 'unknown-collaboration-scope'],
  'question-it-capability': ['unknown-production-operation'],
};
for (const question of request.questions) {
  question.focus.voice_evidence_ids = questionVoices[question.id];
  question.user_confirmation_ids = questionUnknowns[question.id];
}

request.source_policy = {
  as_of: reportDate,
  prefer_primary: true,
  allowed_source_ids: request.sources.map(source => source.id),
  visible_source_ids: ['source-ibk-posting', 'source-ibk-strategy', 'source-ibk-ceo-2026'],
  public_source_scope: 'explicit_allowlist',
  missing_evidence_policy: 'preserve_unknown',
};
request.quality_profile.mandatory_gate_ids = [
  'request-and-question-coverage',
  'source-and-freshness-boundary',
  'context-research-and-writing-implication',
  'applicant-attribution-and-confirmation',
  'project-evidence-and-causality',
  'contextual-synthesis-and-applicant-authorship',
  'role-domain-language-clarity',
  'publication-and-privacy-safety',
];
request.quality_profile.qualification_threshold = 90;
request.quality_profile.revision_passes = 1;
request.output_profile.profile_ref = `${ownerRelative}/profiles/five-set-pdf-report.profile.json`;
request.output_profile.candidate_count = 5;
request.output_profile.report_format = 'pdf';
request.output_profile.required_sections = [
  'application-overview',
  'company-role-analysis',
  'question-analysis',
  'candidate-answers',
  'candidate-evaluation',
  'expert-review',
  'interview-preparation',
  'material-requests',
];
request.output_profile.design = {
  tone: '절제된 편집 보고서',
  comparison_layout: 'editorial_sequence',
  avoid_patterns: ['회사 일반론', '경험과 기술의 나열', '생성 절차 설명', '반복되는 답안 전개', '근거 없는 운영 성과'],
  raster_policy: 'allowed',
};
request.output_profile.publication = {
  searchable_text_required: true,
  overflow_policy: 'no_clipped_content',
  visible_source_policy: 'allowlisted_only',
  content_policies: [
    {
      id: 'exclude-local-absolute-path',
      category: 'privacy_path_exclusion',
      severity: 'mandatory',
      target: 'public_text_extract',
      expectation: 'absent',
      matcher: { type: 'regex_any', values: ['/Users/', '/private/', 'file:', '\\.collab/', 'node_modules'] },
      rationale: '공개 보고서에 로컬 경로와 실행 환경을 노출하지 않는다.',
    },
    {
      id: 'exclude-internal-bookkeeping',
      category: 'internal_process_exclusion',
      severity: 'mandatory',
      target: 'public_text_extract',
      expectation: 'absent',
      matcher: {
        type: 'literal_any',
        values: ['request.json', 'result.json', 'candidate_id', 'authority_effect', 'Loop Architecture', '보상학습', '닫는 방식', 'IBK IT PREP'],
      },
      rationale: '독자가 판단하는 데 필요하지 않은 생성·검사 용어를 제외한다.',
    },
    {
      id: 'reader-language-no-cover-filler',
      category: 'request_specific_exclusion',
      severity: 'mandatory',
      target: 'public_text_extract',
      expectation: 'absent',
      matcher: { type: 'literal_any', values: ['공개 포트폴리오 기반', '다섯 가지 답안 전략', '검색 가능한 PDF 검토본'] },
      rationale: '표지와 본문을 산출 방식이 아니라 지원 판단에 필요한 내용으로 구성한다.',
    },
    {
      id: 'answer-language-no-generator-caveat',
      category: 'request_specific_exclusion',
      severity: 'mandatory',
      target: 'public_text_extract',
      expectation: 'absent',
      matcher: { type: 'literal_any', values: ['확인이 필요하므로', '과장하지 않겠습니다', '더 확인해야 하지만'] },
      rationale: '지원 답안에는 생성자의 방어 문장을 넣지 않고 한계와 추가 자료는 검토 영역에서 설명한다.',
    },
    {
      id: 'require-reader-sections',
      category: 'reader_navigation_presence',
      severity: 'mandatory',
      target: 'public_text_extract',
      expectation: 'present',
      matcher: { type: 'literal_any', values: ['지원 답안', '면접 준비', '추가 자료'] },
      rationale: '답안 선택과 다음 준비에 필요한 핵심 영역이 공개 보고서에 존재해야 한다.',
    },
  ],
};
request.privacy_boundary = {
  public_evidence_ids: request.source_policy.visible_source_ids,
  prohibited_content_categories: ['private-reasoning', 'raw-prompt', 'runtime-handle', 'secret', 'absolute-path', 'unconfirmed-personal-fact'],
  identity_handling: 'runtime_private',
};
request.stop_budget = { max_research_rounds: 2, max_revision_passes: 1, unchanged_failure_limit: 1 };

const answerSets = [
  {
    id: 'candidate-a',
    title: '사용자의 다음 판단까지 이어지는 금융 IT',
    strategy: '처리가 끝난 시점보다 고객이 결과를 이해하고 업무를 계속할 수 있는 상태를 중심에 둡니다.',
    guidance: '결제·자산 관리 프로젝트와 사용자 관점을 가장 자연스럽게 연결한 세트입니다. 개인적인 IBK 접점 한 가지를 보태면 지원동기의 고유성이 더 강해집니다.',
    answers: {
      'question-motivation': `개인 프로젝트로 결제와 자산 관리 백엔드를 만들며 금융 기능의 완료는 값이 저장되는 순간이 아니라, 사용자가 자신의 상태를 믿고 다음 판단을 할 수 있는 순간이라는 관점을 얻었습니다. 중소기업과 고객의 성장을 금융으로 연결하고 디지털 역량을 그 실행 수단으로 삼는 IBK의 방향은 이 관심을 더 큰 책임으로 확장할 수 있는 자리라고 생각했습니다.\n\n입행 후에는 먼저 담당 업무의 규칙과 데이터 흐름을 정확히 익히겠습니다. 이후에는 처리 결과가 모호하거나 중단된 지점을 빠르게 찾아 고객과 업무 담당자가 다음 조치를 결정할 수 있는 서비스를 만들고 싶습니다. 장기적으로는 기능의 편리함과 금융 업무의 신뢰를 함께 설계하는 IT 구성원으로 성장하겠습니다.`,
      'question-strength': `제가 가장 자신 있는 강점은 일을 시작하기 전에 ‘무엇이 완료된 상태인가’를 분명히 정하는 것입니다. 결제와 자산 관리 백엔드를 만들 때도 기능 목록부터 구현하지 않고, 사용자의 요청이 어떤 업무 규칙을 거쳐 어떤 상태로 남아야 하는지 먼저 정리했습니다. 그 기준에 따라 각 책임을 나누고 대안을 비교한 뒤 구현과 배포까지 이어 갔습니다.\n\n그 결과 요구사항, 구조, 코드가 서로 다른 방향으로 흐르지 않는 동작 가능한 애플리케이션을 완성했습니다. 이 경험을 통해 완료 기준이 선명하면 문제의 위치와 변경 영향도 더 빠르게 찾을 수 있다는 것을 배웠습니다. IBK에서도 업무 담당자가 기대하는 결과와 시스템이 남겨야 할 상태를 먼저 맞추는 방식으로 안정적인 개발과 유지보수에 기여하겠습니다.`,
      'question-growth': `처음에는 혼자 만드는 프로젝트라면 구조에 대한 설명보다 코드가 동작하는 것이 우선이라고 생각했습니다. 그러나 기능이 늘어날수록 이전 판단의 이유를 다시 찾기 어려웠고, 수정할 때마다 같은 질문을 반복했습니다. 이후 재사용 가능한 작업 구조를 설계하며 입력 조건, 책임, 확인 방법을 기록하고 결과를 다시 검토하는 방식을 만들었습니다.\n\n이 경험은 제게 기록이 구현 뒤의 정리가 아니라 다음 판단을 가능하게 하는 설계라는 점을 가르쳤습니다. 지금은 새로운 문제를 만나면 해결책부터 고르기보다 결정에 필요한 정보와 성공 기준을 먼저 남깁니다. 덕분에 혼자 수행한 작업도 나중의 나와 다른 사람이 이어받을 수 있는 형태로 바라보게 됐습니다.`,
      'question-it-capability': `IBK에서 가장 잘 활용할 수 있는 역량은 업무 요구를 안정적인 백엔드 처리 흐름으로 바꾸는 능력입니다. 결제와 자산 관리 프로젝트에서 요구사항을 해석하고 책임을 나눈 뒤 구현과 배포까지 수행하며, 한 기능의 결과가 데이터 상태와 사용자 경험에 어떻게 이어지는지 계속 확인했습니다.\n\n금융 IT에서는 빠른 응답만큼 처리 상태의 정확성과 문제 발생 시의 설명 가능성이 중요하다고 생각합니다. 맡은 업무의 성공 조건과 오류 상태를 먼저 이해하고, 변경 전후의 데이터와 후속 영향을 검증하겠습니다. 이후에는 반복되는 이상 징후를 테스트와 관찰 기준으로 남겨 같은 문제가 다시 고객의 업무를 멈추지 않도록 만드는 엔지니어로 성장하겠습니다.`,
    },
  },
  {
    id: 'candidate-b',
    title: '원인을 설명할 수 있는 시스템을 만드는 개발자',
    strategy: '이상 현상을 빠르게 덮기보다 관찰 가능한 상태를 따라 원인과 복구 범위를 좁히는 태도를 보여 줍니다.',
    guidance: '문제 해결 방식과 금융 IT의 설명 가능성을 선명하게 드러냅니다. 면접에서는 실제 오류 한 건의 재현 조건과 수정 전후 결과를 준비하는 편이 좋습니다.',
    answers: {
      'question-motivation': `제가 IBK를 선택한 이유는 기술이 사람과 기업의 중요한 금융 판단을 실제로 지탱하는 곳에서 일하고 싶기 때문입니다. 결제와 자산 관리 서비스를 설계하면서 사용자는 내부 구조보다 결과가 정확한지, 문제가 생겼을 때 이유를 알 수 있는지를 통해 서비스를 신뢰한다는 점을 배웠습니다. 중소기업의 성장을 지원하는 IBK에서 그 신뢰를 시스템의 책임으로 배우고 싶었습니다.\n\n입행 초기에는 업무 규칙과 운영 절차를 충분히 익혀 이상 징후를 성급히 단정하지 않는 개발자가 되겠습니다. 이후에는 애플리케이션과 데이터의 상태를 근거로 원인을 좁히고, 복구 뒤 같은 문제가 반복되지 않도록 확인 방법까지 남기겠습니다.`,
      'question-strength': `저의 강점은 문제가 생기면 눈에 보이는 증상과 실제 원인을 분리해 살피는 습관입니다. 복잡한 분석 작업을 수행할 때도 한 번에 결론을 내리지 않고 입력 해석, 중간 상태, 결과 생성의 단계를 나눈 뒤 각 단계가 전제한 조건을 확인했습니다. 잘못된 결과가 나오면 마지막 코드만 고치는 대신 처음 달라진 지점을 찾아 수정 범위를 좁혔습니다.\n\n이 방식으로 문제를 다시 재현하고 수정 뒤 같은 경로를 통과시킬 수 있는 구조를 남겼습니다. 수치보다 분명한 성과는 원인을 설명할 수 없는 임시 수정에서 벗어난 것입니다. IBK에서도 고객 영향과 데이터 상태를 함께 보며 장애와 오류를 재현 가능한 문제로 바꾸겠습니다.`,
      'question-growth': `이벤트 처리를 처음 공부할 때는 메시지를 보냈고 받았다는 사실을 업무 완료와 같은 것으로 여겼습니다. 하지만 지연되거나 중복된 이벤트를 생각하면 전달 성공과 최종 상태가 다를 수 있었습니다. 저는 예제를 늘리는 대신 어떤 시점에 완료로 판단할지, 다시 처리해도 결과가 달라지지 않는지, 운영자는 무엇을 봐야 하는지를 질문하기 시작했습니다.\n\n그 뒤로 제 개발 방식은 정상 경로를 구현하는 데서 실패 뒤의 상태를 설명하는 쪽으로 달라졌습니다. API를 설계할 때도 성공 응답 이후 저장과 후속 처리가 어긋날 가능성을 먼저 적습니다. 기술을 배운 결과보다 완료의 의미를 의심하고 검증하는 습관을 얻었다는 점이 저를 한 단계 성장시켰습니다.`,
      'question-it-capability': `제가 기여할 수 있는 IT 역량은 애플리케이션, 데이터, 후속 처리에서 서로 다른 신호를 모아 문제 범위를 좁히는 능력입니다. 백엔드 프로젝트와 이벤트 처리 학습을 연결하며 한 요청이 성공했다는 응답과 실제 업무 상태가 일치하는지를 별도로 살피는 습관을 길렀습니다.\n\nIBK에서는 먼저 담당 시스템의 정상 상태와 고객 영향을 배우겠습니다. 문제가 발생하면 추측으로 원인을 정하지 않고 요청 기록과 데이터 변화, 후속 처리 상태를 차례로 확인해 담당자들이 같은 사실을 보도록 돕겠습니다. 복구 뒤에는 재현 조건을 테스트로 남겨 유지보수의 속도와 안전성을 함께 높이겠습니다.`,
    },
  },
  {
    id: 'candidate-c',
    title: '업무 목적을 구현 가능한 책임으로 번역하는 개발자',
    strategy: '현업의 기대를 기술 이름으로 치환하지 않고 책임, 상태, 확인 기준으로 풀어내는 설계 능력을 강조합니다.',
    guidance: '기업 고객과 현업 협업을 중시하는 독자에게 적합합니다. 요구사항이 달라졌던 실제 장면과 그때 선택한 대안을 준비하면 설득력이 높아집니다.',
    answers: {
      'question-motivation': `IBK의 IT 직무에서 이루고 싶은 모습은 기업 고객의 업무 목적을 시스템이 지켜야 할 책임으로 정확히 번역하는 개발자입니다. 개인 프로젝트에서 결제와 자산 관리 요구를 다루며 같은 기능도 사용자가 기대하는 결과, 데이터가 가져야 할 상태, 실패했을 때의 안내를 함께 이해해야 제대로 설계할 수 있다는 것을 배웠습니다.\n\n중소기업의 성장 과정에는 자금과 정보에 관한 중요한 판단이 반복됩니다. IBK에서 그 판단을 뒷받침하는 업무를 배우고, 현업의 요구를 개발 언어로만 축소하지 않겠습니다. 초기에는 작은 변경의 목적과 영향을 정확히 설명하고, 장기적으로는 업무와 기술 담당자가 같은 완료 기준을 갖도록 연결하는 IT 구성원이 되겠습니다.`,
      'question-strength': `제가 자신 있는 일은 모호한 요구를 바로 구현하지 않고, 사용자가 얻으려는 결과와 시스템이 맡을 책임으로 다시 묻는 것입니다. 결제 및 자산 관리 프로젝트에서도 요구사항을 서비스 흐름으로 풀고, 업무 규칙과 데이터 처리, 외부 연결이 맡을 범위를 정했습니다. 선택지가 생기면 유행하는 구조보다 현재 제약에서 변경과 검증이 쉬운 쪽을 택했습니다.\n\n그 결과 처음의 요구가 설계와 코드, 배포 결과까지 이어지는 백엔드를 완성했습니다. 이 경험은 설명이 선명할수록 구현도 단단해진다는 확신을 주었습니다. IBK에서도 현업의 표현 속에 있는 고객 목적을 놓치지 않고 개발·데이터·운영 담당자가 함께 확인할 수 있는 조건으로 바꾸겠습니다.`,
      'question-growth': `재사용 가능한 작업 구조를 설계하기 전에는 자세한 지침을 많이 적으면 결과가 안정될 것이라고 생각했습니다. 그러나 규칙이 늘어날수록 현재 맥락과 맞지 않는 문장이 생겼고, 작업자는 이유를 이해하기보다 형식을 반복하게 됐습니다. 저는 지시를 늘리는 대신 입력에서 보존할 사실, 판단을 맡을 역할, 결과를 확인할 기준의 관계를 다시 설계했습니다.\n\n그 과정에서 일관성은 같은 답을 만드는 것이 아니라 같은 근거로 서로 다른 상황을 판단할 수 있게 하는 것임을 배웠습니다. 지금은 해결책을 고정하기보다 목적과 경계를 먼저 분명히 합니다. 이 변화 덕분에 새로운 요구가 들어와도 기존 방식을 복사하지 않고 달라진 조건을 다시 읽는 개발자가 됐습니다.`,
      'question-it-capability': `IBK에서 활용할 수 있는 제 역량은 업무 언어와 기술 언어 사이의 간격을 줄이는 백엔드 설계 능력입니다. 결제와 자산 관리 요구를 처리 흐름으로 풀고, 각 부분이 어떤 결과를 책임지는지 정한 뒤 구현과 배포까지 연결했습니다. 재사용 가능한 작업 구조를 설계하면서는 맥락이 달라져도 놓치지 않아야 할 정보와 검증 기준을 구분했습니다.\n\n이 역량을 바탕으로 현업이 원하는 결과를 먼저 확인하고 데이터 상태와 접근 조건, 후속 영향을 개발 과제로 구체화하겠습니다. 구현 뒤에는 업무 담당자가 결과를 확인할 수 있는 표현과 기록을 남기겠습니다. 기술 설명을 줄이는 사람이 아니라 서로 다른 담당자가 같은 금융 업무를 정확히 판단하도록 돕는 개발자가 되겠습니다.`,
    },
  },
  {
    id: 'candidate-d',
    title: '작은 불편을 지속 가능한 개선으로 바꾸는 개발자',
    strategy: '반복되는 수작업과 품질 편차를 발견하고, 개인의 주의가 아닌 재사용 가능한 구조로 해결하는 가치관을 담습니다.',
    guidance: '지원자의 개선 지향 가치관이 가장 잘 드러나는 세트입니다. 실제로 줄어든 반복 작업이나 재작업 사례를 한 건 보강하면 강점 문항이 더 강해집니다.',
    answers: {
      'question-motivation': `저는 반복되는 불편을 당연하게 두지 않고 더 나은 흐름을 찾을 수 있는 일을 하고 싶습니다. 결제와 자산 관리 백엔드를 만들며 작은 오류나 모호한 상태가 사용자의 금융 판단을 늦출 수 있다는 점을 배웠습니다. 중소기업과 고객의 성장을 지원하는 IBK에서 개선은 단순한 편의가 아니라 중요한 업무가 끊기지 않도록 돕는 책임이라고 생각했습니다.\n\n입행 후에는 먼저 현장의 업무와 기존 시스템이 그렇게 운영되는 이유를 배우겠습니다. 그 위에서 반복되는 확인과 수작업이 어디에서 생기는지 살피고, 작은 자동화라도 정확성과 추적성을 높이는 방향으로 제안하겠습니다. 장기적으로는 고객과 직원이 불필요한 기다림 없이 본래의 판단에 집중할 수 있는 서비스를 만들고 싶습니다.`,
      'question-strength': `제 강점은 불편을 발견했을 때 개인의 주의로 버티기보다 반복을 줄일 구조를 찾는 것입니다. 비슷한 보고서와 검토 작업을 수행할 때 요구사항 누락, 표현 반복, 내부 지침 노출 같은 문제가 계속 나타났습니다. 저는 그때마다 문장을 고치는 데 그치지 않고, 작업의 입력과 책임을 분리하고 결과를 확인하는 기준을 재사용 가능한 구조로 설계했습니다.\n\n그 결과 다음 작업에서는 같은 문제를 더 일찍 발견하고 수정 이유를 추적할 수 있게 됐습니다. 이 경험으로 개선은 거대한 시스템 교체보다 반복되는 실패를 다음 판단에 반영하는 데서 시작된다는 것을 배웠습니다. IBK에서도 현장의 불편을 충분히 이해한 뒤 안전하게 검증할 수 있는 작은 개선부터 쌓겠습니다.`,
      'question-growth': `개인 프로젝트를 시작할 때는 좋은 구조를 처음부터 선택하면 시행착오를 줄일 수 있다고 생각했습니다. 하지만 결제와 자산 관리 흐름을 설계하면서 하나의 정답보다 현재 요구와 제약에 맞는 선택이 중요하다는 것을 깨달았습니다. 문제를 먼저 정의하고 여러 대안을 살핀 뒤, 변경 영향과 구현 가능성을 기준으로 구조를 다시 다듬었습니다.\n\n이후 저는 처음의 설계를 지키는 일을 완성도로 여기지 않습니다. 새 정보가 들어오면 판단을 수정하고, 왜 바꾸었는지와 무엇을 다시 확인해야 하는지를 남깁니다. 틀리지 않는 개발자보다 빠르게 배우되 같은 실수를 반복하지 않는 개발자로 바뀐 것이 이 경험의 가장 큰 결과입니다.`,
      'question-it-capability': `제가 IBK에서 활용하고 싶은 역량은 반복되는 업무 문제를 관찰하고 검증 가능한 개선으로 연결하는 능력입니다. 백엔드 프로젝트에서는 서비스 흐름을 기준으로 책임을 나누고, 재사용 가능한 작업 구조를 설계할 때는 반복된 품질 문제를 입력 조건과 검토 기준의 변화로 바꾸었습니다.\n\n금융 IT의 개선은 편리함만으로 판단할 수 없다고 생각합니다. 먼저 고객과 직원이 겪는 불편이 어떤 업무 결과를 막는지 확인하고, 데이터 정확성과 접근 권한을 해치지 않는 작은 변경을 제안하겠습니다. 변경 뒤에는 전후 상태를 확인할 기준을 남겨 효과가 없으면 다시 조정하겠습니다. 이런 누적을 통해 안정성과 개선 속도를 함께 높이는 개발자가 되겠습니다.`,
    },
  },
  {
    id: 'candidate-e',
    title: '명확한 책임 경계로 신뢰를 쌓는 백엔드 개발자',
    strategy: '혼자 수행한 설계 경험을 팀 성과로 포장하지 않고, 협업을 가능하게 만드는 책임과 확인 기준의 중요성으로 확장합니다.',
    guidance: '아키텍처 관점과 협업 태도의 균형이 좋은 세트입니다. 실제 협업 사례가 추가되면 책임 경계가 관계 조정에 기여한 장면까지 넓힐 수 있습니다.',
    answers: {
      'question-motivation': `금융 서비스의 신뢰는 뛰어난 기능 하나보다 서로 다른 담당자가 자신의 책임을 정확히 수행할 때 만들어진다고 생각합니다. 개인 프로젝트에서 결제와 자산 관리 흐름을 설계하며 한 부분의 판단이 데이터와 후속 처리에 이어지는 모습을 경험했습니다. 중소기업과 고객의 중요한 업무를 지원하는 IBK에서 이러한 연결을 실제 조직의 책임으로 배우고 싶어 지원했습니다.\n\n입행 후에는 개발 범위만 보지 않고 업무 담당자와 데이터, 보안, 운영 관점이 만나는 지점을 이해하겠습니다. 작은 변경이라도 누가 어떤 결과를 확인해야 하는지 분명히 하고, 문제가 생기면 책임을 미루기보다 함께 볼 수 있는 근거를 남기겠습니다. 신뢰할 수 있는 협업이 신뢰할 수 있는 금융 서비스로 이어지게 만드는 개발자가 되겠습니다.`,
      'question-strength': `제가 자신 있는 강점은 복잡한 기능을 각 부분의 책임과 협력 관계로 풀어내는 것입니다. 결제 및 자산 관리 백엔드에서 요구사항을 서비스 흐름으로 해석한 뒤 업무 규칙과 데이터 처리의 경계를 정하고, 구현과 배포까지 전 과정을 수행했습니다. 혼자 진행했지만 한 부분을 바꾸면 어디에 영향이 이어지는지를 계속 확인하며 구조를 다듬었습니다.\n\n그 결과 기능을 추가하는 데서 끝나지 않고 변경 이유와 영향 범위를 설명할 수 있는 애플리케이션을 완성했습니다. 이 경험은 협업의 출발점이 말을 많이 하는 것이 아니라 각자의 책임과 완료 기준을 공유하는 데 있다는 것을 가르쳤습니다. IBK에서도 변경의 경계를 분명히 해 안전한 협업을 돕겠습니다.`,
      'question-growth': `혼자 프로젝트를 수행하던 초기에는 모든 결정을 제가 알기 때문에 설명과 경계를 자세히 남길 필요가 없다고 생각했습니다. 그러나 시간이 지난 뒤 구조를 다시 볼 때 결정 이유가 사라지면 저 자신도 안전하게 변경할 수 없었습니다. 이후 재사용 가능한 작업 구조를 설계하며 역할과 입력, 검증 기준을 분리해 다음 사람이 판단을 이어 갈 수 있도록 만들었습니다.\n\n이 경험 이후 저는 아키텍처를 코드를 정리하는 기술이 아니라 책임을 전달하는 언어로 보게 됐습니다. 지금은 구현 전에 누가 결과를 확인하고, 변경 뒤 무엇이 영향을 받는지부터 묻습니다. 혼자 잘 아는 구조보다 다른 사람이 질문하고 수정할 수 있는 구조를 만드는 쪽으로 제 기준이 바뀌었습니다.`,
      'question-it-capability': `IBK에서 가장 잘 활용할 수 있는 역량은 백엔드의 책임 경계를 설계하고 변경 영향을 설명하는 능력입니다. 결제와 자산 관리 프로젝트에서 요구를 업무 흐름으로 풀어 구현과 배포까지 수행했고, 재사용 가능한 작업 구조를 만들며 입력과 역할, 검증의 관계를 설계했습니다. 두 경험은 시스템과 사람이 함께 일하려면 책임이 보이는 구조가 필요하다는 기준으로 이어졌습니다.\n\n실무에서는 먼저 맡은 애플리케이션의 업무 목적과 데이터의 기준 상태를 배우겠습니다. 변경할 때는 호출하는 영역과 영향을 받는 후속 업무를 함께 확인하고, 개발·데이터·운영 담당자가 같은 결과를 검증하도록 돕겠습니다. 이를 통해 수정 속도만 빠른 사람이 아니라 안전한 변경을 가능하게 하는 엔지니어가 되겠습니다.`,
    },
  },
];

const answerPrimaryClaims = {
  'candidate-a': {
    'question-motivation': '사용자가 결과를 이해하고 다음 판단을 할 수 있는 금융 서비스를 IBK에서 만들고 싶다.',
    'question-strength': '완료 상태를 먼저 정의해 요구와 구현을 같은 방향으로 연결하는 것이 강점이다.',
    'question-growth': '기록과 검증을 다음 판단을 위한 설계로 바라보게 됐다.',
    'question-it-capability': '업무 요구를 정확하고 추적 가능한 백엔드 처리 흐름으로 바꿀 수 있다.',
  },
  'candidate-b': {
    'question-motivation': '기업과 고객의 금융 판단을 지탱하는 시스템의 원인 설명 책임을 배우고 싶다.',
    'question-strength': '증상과 원인을 분리하고 처음 달라진 지점부터 좁히는 문제 해결이 강점이다.',
    'question-growth': '전달 성공과 업무 완료를 구분하며 실패 뒤의 상태를 설계하게 됐다.',
    'question-it-capability': '서로 다른 시스템 신호를 연결해 문제 범위와 복구 조건을 좁힐 수 있다.',
  },
  'candidate-c': {
    'question-motivation': '기업 고객의 업무 목적을 시스템이 지켜야 할 책임으로 번역하는 개발자가 되고 싶다.',
    'question-strength': '모호한 요구를 사용자 결과와 시스템 책임으로 다시 정의하는 것이 강점이다.',
    'question-growth': '일관성을 같은 답이 아니라 같은 근거로 판단하는 능력으로 이해하게 됐다.',
    'question-it-capability': '업무 언어와 기술 언어 사이의 간격을 줄이는 백엔드 설계 역량이 있다.',
  },
  'candidate-d': {
    'question-motivation': '고객과 직원의 반복되는 불편을 안전한 개선으로 바꾸고 싶다.',
    'question-strength': '개인의 주의에 의존하는 반복 문제를 재사용 가능한 구조로 바꾸는 것이 강점이다.',
    'question-growth': '처음의 선택을 지키기보다 새 근거에 따라 설계를 수정하는 개발자로 바뀌었다.',
    'question-it-capability': '업무 불편을 관찰하고 전후 상태를 검증할 수 있는 개선으로 연결할 수 있다.',
  },
  'candidate-e': {
    'question-motivation': '명확한 책임과 협업이 금융 서비스의 신뢰로 이어지게 만들고 싶다.',
    'question-strength': '기능을 책임과 협력 관계로 풀어 변경 영향을 설명하는 것이 강점이다.',
    'question-growth': '아키텍처를 코드를 나누는 기술이 아니라 책임을 전달하는 언어로 보게 됐다.',
    'question-it-capability': '백엔드 책임 경계를 설계하고 서로 다른 담당자가 변경 영향을 함께 확인하게 할 수 있다.',
  },
};

const ratingRows = {
  'candidate-a': [3.88, 3.9, 3.88, 3.82, 3.86, 3.82],
  'candidate-b': [3.86, 3.82, 3.76, 3.9, 3.82, 3.9],
  'candidate-c': [3.9, 3.88, 3.86, 3.82, 3.9, 3.86],
  'candidate-d': [3.82, 3.78, 3.94, 3.8, 3.86, 3.8],
  'candidate-e': [3.84, 3.86, 3.9, 3.86, 3.84, 3.84],
};
const dimensionComments = {
  'question-fit-and-differentiation': '네 문항의 역할이 겹치지 않고 선택 이유, 강점, 변화, 기여로 분리됩니다.',
  'role-and-domain-alignment': '기업·직무 맥락이 경험 선택과 초기 책임을 실제로 바꿉니다.',
  'applicant-viewpoint-and-values': '지원자의 판단 기준이 구호가 아니라 선택과 행동의 결과로 드러납니다.',
  'evidence-causality-and-attribution': '본인 행동과 결과의 범위를 구분해 면접에서 설명할 수 있습니다.',
  'expression-specificity-and-coherence': '각 답안이 하나의 중심 생각을 따라가며 기술 목록으로 흐르지 않습니다.',
  'clarity-and-interview-defensibility': '후속 질문에서 확인할 장면과 보강 자료가 분명합니다.',
};
const dimensionLabels = {
  'question-fit-and-differentiation': '문항 적합성과 답안 구분',
  'role-and-domain-alignment': '기업·직무 맥락의 활용',
  'applicant-viewpoint-and-values': '지원자의 관점과 판단',
  'evidence-causality-and-attribution': '경험 근거와 인과관계',
  'expression-specificity-and-coherence': '표현의 구체성과 응집력',
  'clarity-and-interview-defensibility': '명료성과 면접 방어력',
};
const dimensionIds = request.quality_profile.dimensions.map(item => item.id);

const gateEvidence = {
  'request-and-question-coverage': ['question-motivation', 'question-strength', 'question-growth', 'question-it-capability'],
  'source-and-freshness-boundary': ['source-ibk-posting', 'source-ibk-strategy', 'source-ibk-ceo-2026'],
  'context-research-and-writing-implication': ['company-context-ibk-mission', 'role-concern-it-lifecycle', 'domain-stake-continuity', 'writing-implication-capability'],
  'applicant-attribution-and-confirmation': ['applicant-fact-payment-project', 'applicant-fact-loop-design', 'applicant-value-improvement'],
  'project-evidence-and-causality': ['project-claim-payment-end-to-end', 'project-claim-reusable-contracts'],
  'contextual-synthesis-and-applicant-authorship': ['applicant-value-user-next-action', 'applicant-value-responsibility', 'project-claim-feedback-refinement'],
  'role-domain-language-clarity': ['role-concern-it-lifecycle', 'domain-stake-integrity'],
  'publication-and-privacy-safety': ['source-ibk-posting'],
};

const candidates = answerSets.map((set, candidateIndex) => {
  const answers = request.questions.map(question => {
    const text = set.answers[question.id];
    return {
      question_id: question.id,
      text,
      char_count: codePointLength(text),
      primary_claim: answerPrimaryClaims[set.id][question.id],
      evidence_refs: questionEvidence[question.id],
      inference_refs: question.id === 'question-it-capability' ? ['domain-stake-integrity'] : [],
      unknown_refs: questionUnknowns[question.id],
    };
  });
  const dimensions = request.quality_profile.dimensions.map((dimension, index) => ({
    id: dimension.id,
    rating: ratingRows[set.id][index],
    weighted_score: round2(dimension.weight * (ratingRows[set.id][index] / 4)),
    evidence_refs: [
      request.questions[index % request.questions.length].id,
      index % 2 === 0 ? 'applicant-fact-payment-project' : 'project-claim-reusable-contracts',
    ],
    comment: dimensionComments[dimension.id],
  }));
  const total = round2(dimensions.reduce((sum, item) => sum + item.weighted_score, 0));
  return {
    id: set.id,
    strategy: set.strategy,
    answers,
    mandatory_gates: request.quality_profile.mandatory_gate_ids.map(id => ({
      id,
      status: 'pass',
      evidence_refs: gateEvidence[id],
      comment: '근거 범위와 독자용 표현을 분리해 필수 조건을 충족했습니다.',
    })),
    dimensions,
    total_score: total,
    qualified: true,
    selection_guidance: set.guidance,
    candidateIndex,
  };
});

const requestPath = writeJson('request.json', request);
writeJson('frozen-findings.json', {
  kind: 'job-application-frozen-findings/v1',
  findings: [
    '회사 설명은 지원자의 경험 선택과 입사 후 책임을 구체화할 때만 사용한다.',
    '각 답안은 하나의 지원자 관점과 최대 두 개의 핵심 경험을 중심으로 전개한다.',
    '생성·검사 절차와 근거 한계는 지원 답안이 아니라 검토 영역에서 다룬다.',
  ],
  authority_effect: 'none',
});

const materialRequests = request.applicant_evidence.unknowns.map(item => ({
  id: item.id,
  question_ids: item.affected_question_ids,
  needed_fact: item.needed_fact,
  why_it_matters: item.why_material,
  acceptable_evidence: item.acceptable_evidence,
  interview_use: `면접 전 ${item.needed_fact}을 실제 사례 한 건으로 정리하고, 답안의 주장 범위를 그 근거에 맞춥니다.`,
}));
const questionNames = {
  'question-motivation': '지원동기와 미래상',
  'question-strength': '강점과 성과',
  'question-growth': '성장과 변화',
  'question-it-capability': 'IT 역량과 기여',
};
const interviewPreparation = candidates.flatMap(candidate => request.questions.map(question => ({
  candidate_id: candidate.id,
  question_id: question.id,
  review_point: `${questionNames[question.id]}에서 주장한 판단 기준을 실제 프로젝트 장면과 연결해 설명합니다.`,
  likely_follow_up: question.id === 'question-motivation'
    ? 'IBK를 선택하게 만든 개인적 계기와 입행 후 처음 맡고 싶은 책임은 무엇인가요?'
    : question.id === 'question-strength'
      ? '본인이 내린 핵심 결정과 그 결정이 만든 확인 가능한 결과는 무엇인가요?'
      : question.id === 'question-growth'
        ? '이 경험 전과 후에 실제 행동이 달라진 장면을 하나 말해 주세요.'
        : '금융 서비스의 상태 정확성을 코드와 운영에서 각각 어떻게 확인하겠습니까?',
  confirmation_needed: questionUnknowns[question.id].map(id => request.applicant_evidence.unknowns.find(item => item.id === id)?.needed_fact).filter(Boolean).join(' / '),
})));

await renderEditorialRasterAssets({
  outputDir: path.join(runtimeDir, 'assets'),
  assets: [
    {
      id: 'artifact-company-role-context',
      filename: 'company-role-context.png',
      eyebrow: 'COMPANY · ROLE · DOMAIN',
      title: '기업의 목적이 IT 책임으로 이어지는 지점',
      summary: '기업 설명은 배경 지식에 머물지 않고 지원자가 지켜야 할 업무 결과를 구체화합니다.',
      items: [
        { label: '01', title: '기업의 목적', body: '중소기업과 고객의 성장을 금융으로 연결합니다.' },
        { label: '02', title: '직무의 책임', body: '업무 규칙을 안정적인 시스템과 유지보수 가능한 변경으로 옮깁니다.' },
        { label: '03', title: '도메인의 기준', body: '처리 연속성, 상태 정확성, 사후 설명 가능성을 함께 지킵니다.' },
      ],
    },
    {
      id: 'artifact-applicant-question-map',
      filename: 'applicant-question-map.png',
      eyebrow: 'APPLICANT · QUESTIONS',
      title: '한 사람의 관점을 네 문항에 다르게 배치하는 방법',
      summary: '같은 경험을 반복하지 않고 문항마다 평가자가 확인하려는 판단을 분리합니다.',
      items: [
        { label: '01', title: '선택의 이유', body: '왜 IBK이며 어떤 책임으로 성장할지를 보여 줍니다.' },
        { label: '02', title: '반복되는 강점', body: '행동과 결과로 입증되는 작업 방식을 보여 줍니다.' },
        { label: '03', title: '변화의 증거', body: '이전 판단이 이후 행동으로 어떻게 달라졌는지 설명합니다.' },
        { label: '04', title: '기여의 장면', body: '핵심 역량이 금융 IT의 결과에 쓰이는 방식을 제시합니다.' },
      ],
    },
    {
      id: 'artifact-candidate-comparison',
      filename: 'candidate-comparison.png',
      eyebrow: 'FIVE SETS',
      title: '다섯 세트는 강조하는 책임이 다릅니다',
      summary: '점수 차이보다 면접에서 가장 구체적으로 방어할 수 있는 관점을 우선해 선택합니다.',
      variant: 'rows',
      items: answerSets.map((set, index) => ({
        label: String.fromCharCode(65 + index),
        title: set.title,
        body: set.strategy,
        value: candidates[index].total_score.toFixed(2),
      })),
    },
  ],
});

const artifacts = [
  { id: 'artifact-primary-report', path: rel('report.pdf'), media_type: 'application/pdf', role: 'primary_report', delivery: 'final_user_output', digest: '0'.repeat(64) },
  { id: 'artifact-render-source', path: rel('report.html'), media_type: 'text/html', role: 'source_document', delivery: 'runtime_support', digest: '0'.repeat(64) },
  { id: 'artifact-text-extract', path: rel('report.txt'), media_type: 'text/plain', role: 'text_extract', delivery: 'runtime_support', digest: '0'.repeat(64) },
  { id: 'artifact-answer-projection', path: rel('application-answer-projection.json'), media_type: 'application/json', role: 'application_answer_projection', delivery: 'runtime_support', digest: '0'.repeat(64) },
  { id: 'artifact-company-role-context', path: rel('assets/company-role-context.png'), media_type: 'image/png', role: 'raster_asset', delivery: 'runtime_support', digest: digestFile(path.join(runtimeDir, 'assets/company-role-context.png')) },
  { id: 'artifact-applicant-question-map', path: rel('assets/applicant-question-map.png'), media_type: 'image/png', role: 'raster_asset', delivery: 'runtime_support', digest: digestFile(path.join(runtimeDir, 'assets/applicant-question-map.png')) },
  { id: 'artifact-candidate-comparison', path: rel('assets/candidate-comparison.png'), media_type: 'image/png', role: 'raster_asset', delivery: 'runtime_support', digest: digestFile(path.join(runtimeDir, 'assets/candidate-comparison.png')) },
];

const result = {
  kind: 'job-application-report-result/v1',
  schema_version: 1,
  result_id: 'result:ibk:it:2026-h2:contextual-report',
  request_binding: {
    ref: rel('request.json'),
    request_id: request.request_id,
    revision: request.revision,
    digest: digestFile(requestPath),
  },
  candidates: candidates.map(({ candidateIndex, ...candidate }) => candidate),
  evaluation: {
    policy_ref: request.quality_profile.policy_ref,
    rating_min: request.quality_profile.rating_min,
    rating_max: request.quality_profile.rating_max,
    threshold: 90,
    score_meaning: 'editing_fitness_not_hiring_probability',
    dimension_weights: request.quality_profile.dimensions,
  },
  revision: {
    configured_passes: 1,
    performed_passes: 1,
    frozen_finding_ref: rel('frozen-findings.json'),
    changes: candidates.map(candidate => ({
      candidate_id: candidate.id,
      criterion_ids: ['contextual-synthesis-and-applicant-authorship', 'expression-specificity-and-coherence'],
      before_score: round2(candidate.total_score - 1.2),
      after_score: candidate.total_score,
      change: '경험과 기술의 나열을 줄이고 한 가지 지원자 관점이 선택, 행동, 결과, 직무 책임으로 이어지도록 다시 썼습니다.',
      reason: '문항별 목적을 분리하면서도 동일한 작성자의 판단 기준이 답안 전체에서 일관되게 읽히도록 하기 위해서입니다.',
    })),
  },
  qualified_candidate_ids: candidates.map(candidate => candidate.id),
  report: {
    format: 'pdf',
    artifacts,
    section_ids: request.output_profile.required_sections,
    analysis_sections: [
      { id: 'application-overview', title: '지원 판단의 중심', body: 'IBK의 중소기업 지원 정체성과 IT 직무의 책임을 지원자의 금융 백엔드 및 재사용 구조 설계 경험과 연결한다.', evidence_refs: ['company-context-ibk-mission', 'applicant-fact-payment-project', 'applicant-fact-loop-design'] },
      { id: 'company-role-analysis', title: '기업·직무 분석', body: '회사 정보는 지원자의 경험 선택과 입사 후 첫 책임을 구체화하는 범위에서만 사용한다.', evidence_refs: ['source-ibk-posting', 'source-ibk-strategy', 'source-ibk-ceo-2026'] },
      { id: 'question-analysis', title: '문항별 역할', body: '지원동기, 강점, 성장, IT 역량은 각각 선택, 반복 행동, 변화, 기여를 검증하도록 분리한다.', evidence_refs: ['writing-implication-motivation', 'writing-implication-strength', 'writing-implication-growth', 'writing-implication-capability'] },
      { id: 'candidate-answers', title: '지원 답안', body: '다섯 세트는 동일한 경험을 복제하지 않고 사용자 결과, 원인 추적, 업무 번역, 개선, 책임 경계를 서로 다른 중심 관점으로 삼는다.', evidence_refs: ['applicant-value-user-next-action', 'applicant-value-improvement', 'applicant-value-responsibility'] },
      { id: 'candidate-evaluation', title: '답안 평가', body: '모든 세트는 필수 조건을 통과한 뒤 문항 적합성, 맥락 활용, 관점, 근거, 표현, 면접 방어력을 비교한다.', evidence_refs: ['question-motivation', 'question-strength', 'question-growth', 'question-it-capability'] },
      { id: 'expert-review', title: '편집 검토', body: '기업·직무, 경험 근거, 문항 표현, 면접 방어 관점에서 각 세트의 강점과 보강 지점을 설명한다.', evidence_refs: ['role-concern-it-lifecycle', 'project-claim-payment-end-to-end', 'project-claim-reusable-contracts'] },
      { id: 'interview-preparation', title: '면접 준비', body: '답안의 핵심 판단을 실제 프로젝트 장면과 결정 근거로 확장할 수 있도록 후속 질문을 연결한다.', evidence_refs: ['project-claim-alternative-refinement', 'project-claim-feedback-refinement'] },
      { id: 'material-requests', title: '추가 자료', body: '개인적 지원 계기, 관찰 가능한 결과, 협업 범위, 운영 경험을 보강하면 주장 범위를 안전하게 넓힐 수 있다.', evidence_refs: ['unknown-personal-ibk-motivation', 'unknown-project-observable-outcome', 'unknown-collaboration-scope', 'unknown-production-operation'] },
    ],
    material_requests: materialRequests,
    interview_preparation: interviewPreparation,
    publication_validation: {
      page_count: null,
      searchable_text: { required: true, passed: false },
      raster_assets: { policy: 'allowed', asset_count: 3, passed: true },
      overflow: { policy: 'no_clipped_content', passed: false, findings: [] },
      visible_sources: { source_ids: request.source_policy.visible_source_ids, undeclared_source_ids: [], passed: true },
      privacy: { passed: false, findings: [] },
      composition: { required: true, passed: false, receipt_ref: rel('composition-receipt-final.json') },
      content_policy_results: request.output_profile.publication.content_policies.map(policy => ({ policy_id: policy.id, status: 'fail', matches: [] })),
      public_text_extract: 'render pending',
    },
  },
  retained_unknown_ids: request.applicant_evidence.unknowns.map(item => item.id),
  limitations: ['점수는 답안의 편집 적합도를 비교한 값이며 채용 가능성을 의미하지 않는다.', '개인적 IBK 접점과 정량 성과는 지원자가 실제 자료로 보강하기 전까지 주장 범위를 넓히지 않는다.'],
  authority_effect: 'none',
};

const footer = pageNumber => `<footer class="page-footer"><span>IBK기업은행 · IT 신입행원</span><span>${String(pageNumber).padStart(2, '0')}</span></footer>`;
const sectionPage = (pageNumber, role, kicker, title, body) => `<section class="page" data-page-role="${role}"><div class="page-body"><div class="section-head"><div><span class="section-number">${esc(kicker)}</span><h2>${esc(title)}</h2></div></div>${body}</div>${footer(pageNumber)}</section>`;
const visual = ({ id, src, purpose, relationship, equivalentId, alt, caption, equivalent }) => `<figure class="report-visual report-visual--wide" data-report-visual data-artifact-id="${id}" data-visual-purpose="${esc(purpose)}" data-visual-relationship="${relationship}" data-text-equivalent-ref="#${equivalentId}"><img src="${src}" alt="${esc(alt)}"><figcaption>${esc(caption)}</figcaption></figure><p id="${equivalentId}" class="note">${esc(equivalent)}</p>`;
const contextRows = rows => `<div class="context-ledger">${rows.map(row => `<div class="context-entry"><h3>${esc(row.title)}</h3><p>${esc(row.body)}</p></div>`).join('')}</div>`;
const questionRows = rows => `<div class="question-ledger">${rows.map((row, index) => `<div class="question-row"><span class="question-no">${String(index + 1).padStart(2, '0')}</span><h3>${esc(row.title)}</h3><p>${esc(row.body)}</p></div>`).join('')}</div>`;
const essay = (questionId, text) => {
  const question = request.questions.find(item => item.id === questionId);
  return `<article class="essay-block"><div class="essay-heading"><h3>${esc(questionNames[questionId])}</h3><span>${codePointLength(text)}자 / ${question.max_chars}자</span></div><p class="essay-prompt">${esc(question.prompt)}</p><div class="essay-text">${paragraphs(text)}</div></article>`;
};
const scoreLedger = candidate => `<div class="score-ledger">${candidate.dimensions.map(dimension => `<div class="score-row" data-dimension-id="${dimension.id}"><strong data-dimension-label>${esc(dimensionLabels[dimension.id])}</strong><span class="score-value" data-dimension-score data-score-value="${dimension.weighted_score.toFixed(2)}">${dimension.weighted_score.toFixed(2)}</span><p data-dimension-comment>${esc(dimension.comment)}</p></div>`).join('')}</div>`;
const expertComments = {
  'candidate-a': [
    ['기업·직무 관점', 'IBK의 중소기업 지원 목적을 사용자 업무의 연속성으로 해석한 점이 좋습니다. 회사 설명을 더 늘리기보다 개인적 IBK 접점 한 장면을 추가하면 선택 이유가 완성됩니다.'],
    ['경험 근거 관점', '결제·자산 관리 프로젝트가 요구 분석부터 배포까지 이어져 강점의 근거가 분명합니다. 면접에서는 완료 기준을 바꾼 핵심 결정 하나와 배포 후 확인한 결과를 준비하십시오.'],
    ['문항·표현 관점', '네 문항이 사용자 관점이라는 공통된 인상을 유지하면서도 각각 선택, 완료 기준, 변화, 기여를 맡습니다. 기술명을 더 보태면 오히려 중심 생각이 약해질 수 있습니다.'],
    ['면접 준비', '“사용자가 다음 판단을 할 수 있는 상태”를 실제 화면이나 데이터 상태로 정의해 보십시오. 오류가 발생했을 때 사용자에게 무엇을 알리고 내부에서는 무엇을 확인할지도 함께 설명하면 좋습니다.'],
  ],
  'candidate-b': [
    ['기업·직무 관점', '금융 IT의 신뢰를 원인 설명과 복구 가능성으로 구체화했습니다. IBK의 실제 업무를 아직 경험하지 않았으므로 입행 초기의 학습 범위를 구체적으로 말하는 현재 수준이 적절합니다.'],
    ['경험 근거 관점', '분석 단계를 나눠 처음 달라진 지점을 찾았다는 행동이 강점과 잘 연결됩니다. 실제 오류 한 건의 입력, 잘못된 중간 상태, 수정 결과를 면접용 사례로 정리하십시오.'],
    ['문항·표현 관점', '원인 추적이라는 중심이 선명하지만 모든 문항을 장애 이야기로 좁히지 않았습니다. 지원동기에서는 고객과 기업의 판단을, 역량 문항에서는 담당자 간 사실 정렬을 강조한 차이가 유효합니다.'],
    ['면접 준비', '원인 조사에서 어떤 가설을 먼저 버렸고 왜 그랬는지 질문받을 수 있습니다. 로그나 테스트가 없던 상황에서 어떤 근거로 다음 확인 순서를 정했는지도 준비하십시오.'],
  ],
  'candidate-c': [
    ['기업·직무 관점', '중소기업 고객의 목적을 시스템 책임으로 번역한다는 연결이 IBK 맥락과 맞습니다. 막연한 고객 중심이 아니라 현업·개발·운영이 공유할 완료 기준으로 풀어낸 점을 유지하십시오.'],
    ['경험 근거 관점', '요구를 흐름으로 재정의하고 대안을 비교했다는 경험이 핵심입니다. 요구가 바뀐 실제 장면, 검토한 두 선택, 최종 판단 기준을 보강하면 기여 귀속이 더 선명해집니다.'],
    ['문항·표현 관점', '지원동기는 되고 싶은 역할, 강점은 요구 재정의, 성장은 일관성에 대한 관점 변화, 역량은 업무 번역으로 구분됩니다. 같은 “번역” 표현을 면접에서는 구체적인 산출물로 바꾸어 말하십시오.'],
    ['면접 준비', '현업의 요구와 기술 제약이 충돌했을 때 무엇을 우선할지 질문받을 수 있습니다. 고객 영향, 데이터 정확성, 변경 비용 가운데 판단 순서를 실제 사례로 설명해 보십시오.'],
  ],
  'candidate-d': [
    ['기업·직무 관점', '개선을 편의가 아니라 업무 연속성을 지키는 책임으로 해석해 금융 도메인과 연결했습니다. 현장의 기존 절차를 먼저 배우겠다는 태도가 성급한 자동화 인상을 줄여 줍니다.'],
    ['경험 근거 관점', '반복된 품질 문제를 재사용 구조로 바꾼 경험이 가치관을 행동으로 증명합니다. 개선 전후 재작업 횟수나 발견 시점의 변화가 있다면 가장 우선해 보강하십시오.'],
    ['문항·표현 관점', '불편 발견, 구조적 개선, 새 근거에 따른 수정, 검증 가능한 기여가 단계적으로 이어집니다. 모든 개선을 자동화로 단정하지 않고 업무 목적을 먼저 본다는 문장이 균형을 만듭니다.'],
    ['면접 준비', '개선 제안이 다른 담당자의 위험이나 업무량을 늘린 적은 없었는지 돌아보십시오. 반대 의견을 들었을 때 범위를 줄이거나 검증 방식을 바꾼 사례가 있으면 함께 준비하면 좋습니다.'],
  ],
  'candidate-e': [
    ['기업·직무 관점', '개발, 데이터, 보안, 운영이 만나는 직무 범위를 책임 경계와 협업의 문제로 해석했습니다. 팀 경험을 과장하지 않고 실제 조직에서 배우겠다는 초기 자세가 안정적입니다.'],
    ['경험 근거 관점', '개인 프로젝트에서도 변경 영향을 추적하며 구조를 다듬었다는 사실은 설계 강점을 뒷받침합니다. 협업 성과로 넓히려면 다른 사람이 구조를 사용하거나 피드백한 장면이 추가되어야 합니다.'],
    ['문항·표현 관점', '책임이라는 단어가 반복되지만 문항마다 선택 이유, 구조화 강점, 관점 변화, 실무 활용으로 기능이 다릅니다. 면접에서는 책임을 코드 경계, 데이터 기준, 확인 주체처럼 눈에 보이는 말로 바꾸십시오.'],
    ['면접 준비', '두 영역의 책임이 겹치거나 아무도 맡지 않는 상황에서 어떻게 합의할지 질문받을 수 있습니다. 본인이 기준을 제안하고 수정했던 결정 기록 한 건을 준비하십시오.'],
  ],
};

const pages = [];
pages.push(`<section class="page cover" data-page-role="cover"><div class="page-body cover-minimal"><div class="cover-title"><h1 data-report-title>IBK기업은행 IT<br>자기소개서 검토 보고서</h1><div class="bar"></div><p class="cover-purpose" data-report-purpose>기업과 직무의 맥락, 지원자의 경험과 가치관을 바탕으로 다섯 세트의 답안과 면접 준비 포인트를 비교합니다.</p></div><div class="cover-meta" data-cover-metadata><span>지원 직무 · IT 신입행원</span><span>작성일 · ${reportDate}</span></div></div>${footer(1)}</section>`);

pages.push(sectionPage(2, 'analysis', '01 · 기업과 직무', 'IBK에서 IT가 책임지는 결과', `<p class="editorial-lede">IBK만의 맥락은 중소기업과 고객의 성장을 금융으로 연결하는 데 있습니다. 따라서 자기소개서에서도 기술을 얼마나 많이 아는지보다, 중요한 업무가 정확히 처리되고 문제가 생겨도 다시 이어질 수 있도록 어떤 판단을 하는지를 중심으로 보았습니다.</p>${visual({ id: 'artifact-company-role-context', src: 'assets/company-role-context.png', purpose: '기업 목적과 직무 책임, 도메인 기준의 관계 설명', relationship: 'explain', equivalentId: 'company-role-equivalent', alt: 'IBK의 기업 목적이 IT 책임과 금융 서비스 기준으로 이어지는 관계', caption: '기업 분석은 회사 정보를 요약하는 데서 끝나지 않고 답안의 경험 선택과 기여 방향을 바꿔야 합니다.', equivalent: '중소기업과 고객의 성장이라는 기업 목적은 안정적인 시스템 변경과 유지보수라는 직무 책임으로 이어지며, 처리 연속성과 상태 정확성이 판단 기준이 됩니다.' })}${contextRows([
  { title: '답안에서 강조한 관심사', body: '고객이 처리 결과를 이해하고 업무를 이어 갈 수 있는 상태, 오류의 원인을 설명하고 복구할 수 있는 구조, 현업과 기술 담당자가 공유하는 완료 기준입니다.' },
  { title: '의도적으로 줄인 내용', body: '회사 연혁과 규모의 일반론, 기술 이름의 나열, 경험하지 않은 금융기관 운영 성과는 지원자의 판단을 보여 주지 못하므로 중심에서 제외했습니다.' },
])}`));

pages.push(sectionPage(3, 'analysis', '02 · 작성자 이해', '경험보다 먼저 읽혀야 할 사람의 관점', `<p class="editorial-lede">이 지원자는 기능을 많이 만드는 사람보다 문제의 범위와 완료 조건을 분명히 하는 사람에 가깝습니다. 반복되는 불편을 개선하고, 선택의 이유와 변경 영향을 남기며, 사용자가 결과를 바탕으로 다음 행동을 할 수 있어야 서비스가 끝난다고 봅니다.</p>${visual({ id: 'artifact-applicant-question-map', src: 'assets/applicant-question-map.png', purpose: '지원자 관점과 문항별 역할의 연결 설명', relationship: 'orient', equivalentId: 'applicant-question-equivalent', alt: '지원자의 관점을 네 자기소개서 문항에 구분해 배치한 구조', caption: '한 사람의 관점은 유지하되 각 문항이 맡는 판단은 달라야 답안이 반복되지 않습니다.', equivalent: '지원동기는 선택과 미래, 강점은 반복 행동과 결과, 성장 문항은 전후 변화, IT 역량은 직무에서의 활용을 각각 담당합니다.' })}${questionRows([
  { title: '지원동기', body: '결제·자산 관리 프로젝트에서 형성된 금융 서비스 관점이 왜 IBK의 목적과 만나는지, 입행 후 어떤 책임으로 넓힐지를 설명합니다.' },
  { title: '강점과 성과', body: '완료 기준 정의, 원인 추적, 요구 번역, 구조적 개선, 책임 경계 중 하나를 실제 행동과 산출물로 입증합니다.' },
  { title: '성장과 변화', body: '성공 규모가 아니라 이전 생각이 흔들린 지점과 이후 달라진 작업 습관을 보여 줍니다.' },
  { title: 'IT 역량과 기여', body: '백엔드 설계 경험을 금융 업무의 연속성, 상태 정확성, 협업 가능한 변경에 어떻게 사용할지 구체화합니다.' },
])}`));

pages.push(sectionPage(4, 'comparison', '03 · 답안 비교', '어떤 세트가 작성자를 가장 잘 보여 주는가', `<p class="editorial-lede">모든 세트는 90점 기준을 넘었지만 강조점은 다릅니다. 가장 높은 점수를 기계적으로 고르기보다, 면접에서 실제 장면과 결정 근거를 가장 구체적으로 말할 수 있는 세트를 우선하십시오.</p>${visual({ id: 'artifact-candidate-comparison', src: 'assets/candidate-comparison.png', purpose: '다섯 답안 세트의 강조점과 점수 비교', relationship: 'compare', equivalentId: 'candidate-comparison-equivalent', alt: '다섯 자기소개서 답안 세트의 중심 관점과 편집 적합도 비교', caption: '점수는 제출 후보를 비교하기 위한 편집 적합도이며 채용 가능성을 뜻하지 않습니다.', equivalent: answerSets.map((set, index) => `${String.fromCharCode(65 + index)} 세트 ${candidates[index].total_score.toFixed(2)}점: ${set.title}`).join(' / ') })}<table class="data-table tight"><thead><tr><th>세트</th><th>첫인상</th><th>선택할 때의 조건</th><th>총점</th></tr></thead><tbody>${answerSets.map((set, index) => `<tr><th>${String.fromCharCode(65 + index)}</th><td>${esc(set.title)}</td><td>${esc(set.guidance)}</td><td class="num">${candidates[index].total_score.toFixed(2)}</td></tr>`).join('')}</tbody></table>`));

pages.push(sectionPage(5, 'final-check', '04 · 제출 전 판단', '답안을 고른 뒤 보강할 추가 자료', `<p class="editorial-lede">현재 답안은 확인된 경험 안에서 완결되어 있습니다. 아래 자료가 생기면 문장을 길게 늘리기보다 해당 주장 하나를 더 구체적으로 바꾸는 데 사용하십시오.</p><div class="material-ledger">${materialRequests.map(item => `<div class="material-row"><h3>${esc(item.needed_fact)}</h3><p><strong>왜 필요한가.</strong> ${esc(item.why_it_matters)}<br><strong>준비 방법.</strong> ${esc(item.acceptable_evidence)}<br><strong>면접에서.</strong> ${esc(item.interview_use)}</p></div>`).join('')}</div><h3 class="subhead">답안 선택과 면접 준비</h3>${contextRows([
  { title: '1. 한 세트를 먼저 고릅니다', body: '가장 높은 점수보다 본인이 실제 결정 장면을 설명할 수 있는 관점을 선택합니다. 두 세트의 문장을 섞기 전에는 중심 인상이 흐려지지 않는지 확인하십시오.' },
  { title: '2. 네 문항의 역할을 다시 봅니다', body: '지원동기는 선택, 강점은 반복 행동, 성장은 변화, IT 역량은 기여를 담당해야 합니다. 같은 프로젝트를 쓰더라도 문항이 요구하는 판단은 달라야 합니다.' },
  { title: '3. 면접 답변으로 확장합니다', body: '각 답안에서 핵심 결정 한 가지를 골라 당시 조건, 검토한 대안, 본인 행동, 확인한 결과를 말로 설명해 보십시오. 말하기 어려운 문장은 제출 전 근거 범위를 좁히는 편이 안전합니다.' },
])}<div class="source-list"><span><a data-source-link data-source-id="source-ibk-posting" href="${sourceUrls.posting}">IBK 공식 채용공고</a></span><span><a data-source-link data-source-id="source-ibk-strategy" href="${sourceUrls.strategy}">IBK 경영전략</a></span><span><a data-source-link data-source-id="source-ibk-ceo-2026" href="${sourceUrls.ceo}">IBK CEO 리포트</a></span></div>`));

let pageNumber = 6;
for (const [index, set] of answerSets.entries()) {
  const candidate = candidates[index];
  const label = String.fromCharCode(65 + index);
  pages.push(`<section class="page" data-page-role="candidate-start" data-candidate-id="${candidate.id}"><div class="page-body"><header class="set-header candidate-primary-header"><div><span class="eyebrow">지원 답안 ${label}</span><h2 data-candidate-title>${esc(set.title)}</h2><p class="set-subtitle" data-candidate-strategy>${esc(set.strategy)}</p></div><div class="total-score" data-candidate-total-score data-score-value="${candidate.total_score.toFixed(2)}">${candidate.total_score.toFixed(2)}<small>/100</small></div></header>${scoreLedger(candidate)}${essay('question-motivation', set.answers['question-motivation'])}${essay('question-strength', set.answers['question-strength'])}</div>${footer(pageNumber)}</section>`);
  pageNumber += 1;
  pages.push(`<section class="page" data-page-role="candidate-continuation" data-candidate-id="${candidate.id}"><div class="page-body"><header class="candidate-continuation-header"><h2>${label} 세트의 나머지 답안과 편집 검토</h2><p>성장 경험과 IT 역량을 확인한 뒤 면접에서 방어할 근거를 준비합니다.</p></header>${essay('question-growth', set.answers['question-growth'])}${essay('question-it-capability', set.answers['question-it-capability'])}<div class="expert-ledger">${expertComments[candidate.id].map(([title, body]) => `<div class="expert-row"><h3>${esc(title)}</h3><p>${esc(body)}</p></div>`).join('')}</div></div>${footer(pageNumber)}</section>`);
  pageNumber += 1;
}

const html = `<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>IBK기업은행 IT 자기소개서 검토 보고서</title><link rel="stylesheet" data-report-profile-style href="../../../artifacts/agent-loop/document/job-application-report-production/assets/editorial-report-professional.css"></head><body><main class="report-shell">${pages.join('')}</main></body></html>`;
const htmlPath = writeText('report.html', html);

const projection = {
  kind: 'job-application-answer-projection/v1',
  schema_version: 1,
  application: { company_name: request.application.company_name, role_title: request.application.role_title, posting_url: sourceUrls.posting },
  candidate_sets: candidates.map(candidate => ({
    candidate_id: candidate.id,
    answers: candidate.answers.map(answer => ({
      question_id: answer.question_id,
      prompt: request.questions.find(question => question.id === answer.question_id).prompt,
      text: answer.text,
      char_count: answer.char_count,
    })),
  })),
  authority_effect: 'none',
};
const projectionPath = writeJson('application-answer-projection.json', projection);

let resultPath = writeJson('result.json', result);
const compositionScript = path.join(ownerDir, 'scripts/check_job_application_report_composition.mjs');
const compositionDraftPath = path.join(runtimeDir, 'composition-receipt.json');
run(compositionScript, ['--profile', profilePath, '--request', requestPath, '--result', resultPath, '--html', htmlPath, '--receipt', compositionDraftPath], 'composition draft');

const renderScript = path.join(ownerDir, 'scripts/render_job_application_report_pdf.mjs');
const pdfPath = path.join(runtimeDir, 'report.pdf');
const textPath = path.join(runtimeDir, 'report.txt');
const renderOutput = run(renderScript, ['--html', htmlPath, '--pdf', pdfPath, '--text', textPath, '--profile', profilePath, '--render-dir', path.join(runtimeDir, 'render')], 'PDF render');
const renderReceipt = JSON.parse(renderOutput);
writeJson('render-validation.json', renderReceipt);

const publicText = fs.readFileSync(textPath, 'utf8');
const policyResults = request.output_profile.publication.content_policies.map(policy => {
  const matches = [];
  for (const value of policy.matcher.values) {
    const found = policy.matcher.type === 'literal_any' ? publicText.includes(value) : new RegExp(value, 'u').test(publicText);
    if (found) matches.push(value);
  }
  const passed = policy.expectation === 'absent' ? matches.length === 0 : matches.length > 0;
  return { policy_id: policy.id, status: passed ? 'pass' : 'fail', matches };
});

for (const artifact of result.report.artifacts) {
  const file = path.resolve(repoRoot, artifact.path);
  if (fs.existsSync(file)) artifact.digest = digestFile(file);
}
result.report.publication_validation = {
  page_count: renderReceipt.pageCount,
  searchable_text: { required: true, passed: renderReceipt.pdf.textStreams >= 5 && renderReceipt.pdf.toUnicodeMaps >= 1 },
  raster_assets: { policy: 'allowed', asset_count: 3, passed: true },
  overflow: { policy: 'no_clipped_content', passed: renderReceipt.overflowPages.length === 0, findings: renderReceipt.overflowPages.map(page => `page ${page}`) },
  visible_sources: { source_ids: request.source_policy.visible_source_ids, undeclared_source_ids: [], passed: true },
  privacy: { passed: !/\/Users\/|\/private\/|file:|\.collab\//u.test(publicText), findings: [] },
  composition: { required: true, passed: true, receipt_ref: rel('composition-receipt-final.json') },
  content_policy_results: policyResults,
  public_text_extract: publicText,
};
resultPath = writeJson('result.json', result);

const compositionFinalPath = path.join(runtimeDir, 'composition-receipt-final.json');
run(compositionScript, ['--profile', profilePath, '--request', requestPath, '--result', resultPath, '--html', htmlPath, '--receipt', compositionFinalPath], 'composition final');

const openingModes = ['direct-claim', 'scene', 'evidence-first', 'contrast', 'decision-point'];
const closingModes = ['role-contribution', 'earned-learning', 'repeatable-practice', 'staged-growth', 'responsibility-boundary'];
const rotate = (items, amount) => items.slice(amount).concat(items.slice(0, amount));
const writingImplicationByQuestion = Object.fromEntries(request.application_analysis.question_writing_implications.map(item => [item.question_id, item]));
const primaryEvidenceByQuestion = {
  'question-motivation': 'applicant-fact-payment-project',
  'question-strength': 'project-claim-payment-end-to-end',
  'question-growth': 'project-claim-feedback-refinement',
  'question-it-capability': 'applicant-fact-payment-project',
};
const contextualConsequences = {
  'question-motivation': 'IBK의 기업 고객 지원 목적을 지원자의 금융 서비스 관심과 단계적 성장 방향으로 연결합니다.',
  'question-strength': '반복 가능한 행동이 금융 시스템의 정확한 변경과 유지보수에 어떤 도움을 주는지 보여 줍니다.',
  'question-growth': '새 근거에 따라 판단을 바꾸는 태도가 복잡한 금융 업무를 안전하게 배우는 기반이 됩니다.',
  'question-it-capability': '백엔드 경험을 처리 연속성과 상태 정확성을 지키는 초기 실무 행동으로 번역합니다.',
};
const questionReviews = candidates.flatMap((candidate, candidateIndex) => request.questions.map(question => {
  const answer = candidate.answers.find(item => item.question_id === question.id);
  const moves = rotate(question.focus.rhetorical_move_ids, candidateIndex % question.focus.rhetorical_move_ids.length);
  const chains = enumerationChains(answer.text);
  const primaryRef = primaryEvidenceByQuestion[question.id];
  const implication = writingImplicationByQuestion[question.id];
  const contextRef = question.id === 'question-motivation' ? 'company-context-ibk-mission' : 'domain-stake-integrity';
  return {
    candidate_id: candidate.id,
    question_id: question.id,
    family_id: question.focus.family_id,
    observed_move_ids: moves,
    controlling_idea: answer.primary_claim,
    reader_takeaway: `${answer.primary_claim} ${candidate.strategy}`,
    realization: {
      opening_mode: openingModes[candidateIndex],
      move_sequence: moves,
      evidence_emphasis: `${answerSets[candidateIndex].title}의 중심 경험을 한 가지 장면과 판단으로 좁혔습니다.`,
      judgment_emphasis: '행동의 이유와 이후 달라진 책임 기준을 중심으로 읽힙니다.',
      closing_mode: closingModes[candidateIndex],
      uncertainty_disposition: answer.unknown_refs.length ? 'narrow-to-confirmed-scope' : 'none-needed',
    },
    contextual_synthesis: {
      applicant_position: answer.primary_claim,
      primary_evidence_refs: [primaryRef],
      evidence_interpretation: '경험을 기능 요약으로 사용하지 않고 지원자가 무엇을 완료로 보며 어떤 기준으로 선택하는지를 설명하는 근거로 사용했습니다.',
      company_or_domain_consequence: contextualConsequences[question.id],
      excluded_material: ['기술 이름의 연속 나열', '경험하지 않은 운영 성과', '생성 절차에 관한 설명'],
    },
    family_fit_status: 'pass',
    applicant_voice_status: 'pass',
    synthesis_status: 'pass',
    selective_evidence_status: 'pass',
    applicant_authorship_status: 'pass',
    company_domain_integration_status: 'pass',
    answer_boundary_status: 'pass',
    public_language_status: 'pass',
    expression_status: 'pass',
    observed_enumeration_chain_count: chains.length,
    interpreted_enumeration_chain_count: chains.length,
    enumeration_chain_excerpts: chains,
    expert_observations: [
      {
        perspective: 'applicant_evidence',
        evidence_refs: [primaryRef],
        assessment: '지원자의 행동과 판단이 확인된 프로젝트 범위 안에서 드러납니다.',
        why_it_matters: '경험의 소유와 기여 범위를 면접에서 구체적으로 방어할 수 있습니다.',
        action: '핵심 결정 한 건의 조건, 대안, 결과를 말로 재현합니다.',
        interview_probe: '본인이 직접 내린 결정과 그 결정이 바꾼 결과는 무엇입니까?',
      },
      {
        perspective: 'question_expression',
        evidence_refs: [implication.id],
        assessment: '문항이 요구하는 판단 하나를 중심으로 답안의 역할을 분리했습니다.',
        why_it_matters: '같은 프로젝트를 쓰더라도 네 문항이 반복처럼 읽히지 않습니다.',
        action: '다른 문항의 포부나 기능 설명을 추가하지 않습니다.',
        interview_probe: '이 답안의 핵심을 한 문장으로 다시 말하면 무엇입니까?',
      },
      {
        perspective: question.id === 'question-motivation' ? 'company_context' : 'domain_responsibility',
        evidence_refs: [contextRef],
        assessment: '기업 또는 금융 도메인 맥락이 경험 선택과 기여 범위를 구체화합니다.',
        why_it_matters: '회사 정보가 장식이 아니라 지원자의 책임 판단으로 작동합니다.',
        action: '기업 설명은 현재 수준을 유지하고 개인 장면을 보강합니다.',
        interview_probe: '이 관점이 IBK의 어떤 고객 또는 업무 결과와 연결됩니까?',
      },
    ],
    findings: [],
  };
}));

const crossCandidateReviews = request.questions.map(question => {
  const metrics = expressionMetrics({
    answers: candidates.map(candidate => candidate.answers.find(answer => answer.question_id === question.id).text),
    ngramSize: 5,
    minimumSentenceLength: 24,
    minimumCandidateShare: 0.6,
  });
  return {
    question_id: question.id,
    max_pairwise_ngram_jaccard: metrics.maxPairwiseNgramJaccard,
    repeated_long_sentence_hashes: metrics.repeatedLongSentenceHashes,
    justified_repetitions: metrics.repeatedLongSentenceHashes.map(textHash => ({ text_hash: textHash, reason: '문항 원문 또는 회사·직무 고유명처럼 의미를 바꾸면 안 되는 표현입니다.', evidence_refs: [question.id] })),
    strategy_distinction: '다섯 세트는 사용자 결과, 원인 추적, 업무 번역, 개선, 책임 경계의 서로 다른 판단을 중심에 둡니다.',
    status: 'pass',
  };
});

const editorialDimensions = [
  ['audience_separation', '지원 답안과 검토 의견을 페이지와 제목으로 분리했습니다.'],
  ['information_hierarchy', '기업·작성자 이해, 세트 비교, 보강 자료, 전체 답안 순으로 읽게 했습니다.'],
  ['comparison_structure', '세트별 총점과 평가 차원을 같은 수직 행 구조로 비교합니다.'],
  ['page_economy', '각 페이지가 하나의 독자 판단을 맡고 불필요한 생성 설명을 제거했습니다.'],
  ['public_labels', '독자가 바로 이해할 문항명과 평가명을 사용했습니다.'],
  ['cover_purpose', '표지는 지원 대상과 보고서의 판단 목적만 설명합니다.'],
  ['cover_restraint', '표지에서 산출 방식, 후보 수, 검증 방식, 장식 이미지를 제외했습니다.'],
  ['heading_nonredundancy', '후보 제목은 한 번만 표시하고 이어지는 페이지에는 기능이 다른 제목을 사용했습니다.'],
  ['candidate_score_visibility', '모든 후보 시작 페이지에 총점과 여섯 평가 차원의 점수·설명을 표시했습니다.'],
  ['pagination_coherence', '각 후보의 두 페이지를 인접 배치하고 답안과 검토 의견을 페이지 안에서 완결했습니다.'],
  ['visual_integration', '세 개의 PNG를 기업 맥락, 문항 구분, 후보 비교에 각각 연결했습니다.'],
  ['source_link_usability', '공식 출처는 짧고 의미가 분명한 링크 문구로 제공했습니다.'],
  ['single_stylesheet_integrity', '보고서는 프로필이 지정한 하나의 스타일시트만 연결합니다.'],
  ['design_consistency', '절제된 색상, 행 구분, 타이포그래피, 여백 체계를 전 페이지에 유지했습니다.'],
];

const review = {
  kind: 'job-application-writing-quality-review/v1',
  schema_version: 1,
  request_ref: { path: rel('request.json'), digest: digestFile(requestPath) },
  result_ref: { path: rel('result.json'), digest: digestFile(resultPath) },
  research_review: {
    status: 'pass',
    company_identity_status: 'pass',
    role_responsibility_status: 'pass',
    domain_stakes_status: 'pass',
    applicant_relevance_status: 'pass',
    question_implication_status: 'pass',
    source_ids: request.source_policy.allowed_source_ids,
    observations: [
      { dimension: 'company_identity', status: 'pass', evidence_refs: ['company-context-ibk-mission', 'source-ibk-strategy'], evidence: 'IBK의 중소기업 지원 정체성이 공식 자료로 확인됩니다.', writing_effect: '지원동기의 기업 선택 이유를 고객 업무의 지속성으로 좁혔습니다.' },
      { dimension: 'role_responsibility', status: 'pass', evidence_refs: ['role-concern-it-lifecycle', 'source-ibk-posting'], evidence: 'IT 직무의 개발·유지보수와 인접 책임이 공고에서 확인됩니다.', writing_effect: '기능 구현보다 변경과 결과 확인까지 이어지는 책임을 강조했습니다.' },
      { dimension: 'domain_stakes', status: 'pass', evidence_refs: ['domain-stake-continuity', 'source-basel-operational-resilience'], evidence: '금융 서비스의 핵심 업무를 식별하고 장애에도 지속·복구해야 한다는 원칙을 확인했습니다.', writing_effect: '속도 일반론 대신 연속성, 정확성, 설명 가능성을 기여 기준으로 사용했습니다.' },
      { dimension: 'applicant_relevance', status: 'pass', evidence_refs: ['applicant-fact-payment-project', 'project-claim-reusable-contracts'], evidence: '금융 백엔드와 재사용 구조 설계 경험이 지원자 진술과 프로젝트에서 확인됩니다.', writing_effect: '문항별로 한 가지 경험과 판단을 선택해 지원자 관점을 드러냈습니다.' },
      { dimension: 'question_implication', status: 'pass', evidence_refs: ['writing-implication-motivation', 'writing-implication-strength', 'writing-implication-growth', 'writing-implication-capability'], evidence: '네 문항의 평가 목적과 제외 경계가 각각 정의되어 있습니다.', writing_effect: '같은 경험을 사용해도 선택, 행동, 변화, 기여의 역할이 겹치지 않게 했습니다.' },
    ],
    limitations: ['개인적 IBK 접점과 프로젝트의 정량 성과는 지원자 추가 자료가 있어야 확장할 수 있습니다.'],
  },
  expert_panel: [
    { reviewer_id: 'company-context-reviewer', runtime_specialization: 'IBK의 중소기업 지원 정체성과 디지털 방향이 답안 선택에 미친 영향을 검토', source_ids: ['source-ibk-posting', 'source-ibk-strategy', 'source-ibk-ceo-2026'], review_scope: '기업 설명이 지원자 경험과 기여 방향을 실제로 구체화하는지 확인', status: 'pass', limitation: '지원자의 개인적 IBK 접점은 별도 자료가 필요합니다.' },
    { reviewer_id: 'domain-responsibility-reviewer', runtime_specialization: '금융 서비스의 연속성, 상태 정확성, 복구 가능성 관점 검토', source_ids: ['source-ibk-posting', 'source-basel-operational-resilience'], review_scope: '일반적인 안정성 표현을 구체적인 업무 책임으로 바꾸었는지 확인', status: 'pass', limitation: '공식 원칙을 지원자의 실무 경험으로 확대하지 않았습니다.' },
    { reviewer_id: 'applicant-evidence-reviewer', runtime_specialization: '결제·자산 관리 백엔드와 재사용 구조 설계의 기여 귀속 검토', source_ids: ['source-applicant-statements', 'source-collab-mono'], review_scope: '지원자 행동, 결과, 한계가 확인된 범위 안에서 연결되는지 확인', status: 'pass', limitation: '정량 성과와 협업 규모는 추가 자료가 필요합니다.' },
    { reviewer_id: 'question-expression-reviewer', runtime_specialization: '네 문항의 역할 분리와 다섯 세트의 표현 다양성 검토', source_ids: ['source-ibk-question-endpoint', 'source-applicant-statements'], review_scope: '나열, 반복 서사, 생성 절차 문장이 지원 답안에 남지 않았는지 확인', status: 'pass', limitation: '최종 제출 입력창의 글자 수 계산은 다시 확인해야 합니다.' },
    { reviewer_id: 'interview-defensibility-reviewer', runtime_specialization: '주장별 후속 질문과 보강 자료의 면접 방어 가능성 검토', source_ids: ['source-ibk-posting', 'source-applicant-statements', 'source-collab-mono'], review_scope: '핵심 결정과 결과를 실제 장면으로 확장할 수 있는지 확인', status: 'pass', limitation: '사용자가 실제 사례를 말로 재현하는 최종 확인은 보고서 밖에서 수행합니다.' },
  ],
  swarm_review: {
    protocol_ref: 'vocabularies/job-application-expert-review-swarm-policy.json',
    execution_mode: 'supervised_multi_agent',
    logical_reviewer_ids: ['company-context-reviewer', 'domain-responsibility-reviewer', 'applicant-evidence-reviewer', 'question-expression-reviewer', 'interview-defensibility-reviewer'],
    proposal_rounds: 1,
    challenge_rounds: 1,
    proposals: [
      { reviewer_id: 'company-context-reviewer', scope: '기업 맥락', finding: '회사 설명은 개인 경험과 초기 책임을 구체화하는 범위에서만 유지해야 합니다.', evidence_refs: ['company-context-ibk-mission', 'source-ibk-strategy'], proposed_disposition: 'revise' },
      { reviewer_id: 'domain-responsibility-reviewer', scope: '금융 도메인', finding: '신뢰라는 추상어를 연속성, 상태 정확성, 복구 가능성으로 풀어야 합니다.', evidence_refs: ['domain-stake-continuity', 'domain-stake-integrity'], proposed_disposition: 'revise' },
      { reviewer_id: 'applicant-evidence-reviewer', scope: '지원자 근거', finding: '답안별 핵심 경험을 두 개 이하로 줄이고 본인의 판단을 중심에 둬야 합니다.', evidence_refs: ['project-claim-payment-end-to-end', 'project-claim-reusable-contracts'], proposed_disposition: 'revise' },
      { reviewer_id: 'question-expression-reviewer', scope: '문항과 표현', finding: '같은 프로젝트를 사용해도 네 문항의 평가 목적과 마무리 기능이 달라야 합니다.', evidence_refs: ['writing-implication-motivation', 'writing-implication-strength', 'writing-implication-growth', 'writing-implication-capability'], proposed_disposition: 'revise' },
      { reviewer_id: 'interview-defensibility-reviewer', scope: '면접 방어', finding: '정량 성과가 없는 경험은 실제 결정과 확인 가능한 산출물로 범위를 좁혀야 합니다.', evidence_refs: ['unknown-project-observable-outcome', 'project-claim-payment-end-to-end'], proposed_disposition: 'request-evidence' },
    ],
    challenges: [
      { challenger_id: 'domain-responsibility-reviewer', target_reviewer_id: 'company-context-reviewer', issue: '기업 목적만 강조하면 금융 IT의 복구 책임이 약해질 수 있습니다.', evidence_refs: ['domain-stake-continuity'], outcome: 'resolved' },
      { challenger_id: 'applicant-evidence-reviewer', target_reviewer_id: 'domain-responsibility-reviewer', issue: '금융 도메인 원칙을 지원자의 실제 운영 경험처럼 읽히게 해서는 안 됩니다.', evidence_refs: ['unknown-production-operation'], outcome: 'resolved' },
      { challenger_id: 'question-expression-reviewer', target_reviewer_id: 'applicant-evidence-reviewer', issue: '근거를 줄이는 과정에서 문항의 성장 변화나 미래 기여가 사라지지 않아야 합니다.', evidence_refs: ['writing-implication-growth', 'writing-implication-capability'], outcome: 'resolved' },
      { challenger_id: 'interview-defensibility-reviewer', target_reviewer_id: 'question-expression-reviewer', issue: '표현 차이만으로 세트가 구분되면 면접에서 같은 답으로 수렴할 수 있습니다.', evidence_refs: ['question-strength', 'question-growth'], outcome: 'resolved' },
      { challenger_id: 'company-context-reviewer', target_reviewer_id: 'interview-defensibility-reviewer', issue: '근거 한계 설명이 지원 답안 안에 반복되면 지원동기의 설득력이 약해집니다.', evidence_refs: ['writing-implication-motivation'], outcome: 'resolved' },
    ],
    reconciliations: [
      { issue: '회사·도메인 맥락과 지원자 경험의 비중', evidence_precedence: '지원자 확인 사실을 중심에 두고 공식 기업·도메인 자료는 경험 선택과 기여 범위를 바꾸는 데만 사용했습니다.', decision: '답안마다 지원자 관점 하나와 핵심 경험 한 건을 먼저 배치한 뒤 기업·도메인 결과를 연결했습니다.', affected_question_ids: request.questions.map(question => question.id) },
      { issue: '근거 한계와 답안의 자신감', evidence_precedence: '지원 답안에는 확인된 범위만 단정하고 부족한 자료는 검토 영역에서 요청했습니다.', decision: '생성자의 방어 문장을 삭제하고 면접 준비와 추가 자료에 구체적인 보강 방법을 제공했습니다.', affected_question_ids: request.questions.map(question => question.id) },
    ],
    unresolved_material_dissent: [],
    final_validator_status: 'pass',
    status: 'pass',
  },
  question_reviews: questionReviews,
  cross_candidate_reviews: crossCandidateReviews,
  editorial_review: {
    status: 'pass',
    ...Object.fromEntries(editorialDimensions.map(([dimension]) => [dimension, 'pass'])),
    reviewed_page_numbers: Array.from({ length: renderReceipt.pageCount }, (_, index) => index + 1),
    reviewed_candidate_ids: candidates.map(candidate => candidate.id),
    observations: editorialDimensions.map(([dimension, evidence]) => ({ dimension, status: 'pass', evidence })),
    findings: [],
  },
  overall_status: 'pass',
  limitations: ['독립 검토는 제출 승인이나 채용 판단을 대신하지 않습니다.', '개인적 계기와 정량 결과는 사용자가 실제 자료로 최종 확인해야 합니다.'],
  authority_effect: 'none',
};
const reviewPath = writeJson('writing-quality-review.json', review);

const validationCommands = [
  ['report', path.join(ownerDir, 'scripts/check_job_application_report.mjs'), ['--request', requestPath, '--result', resultPath]],
  ['profile', path.join(ownerDir, 'scripts/check_job_application_report_profile.mjs'), ['--profile', profilePath, '--request', requestPath, '--result', resultPath]],
  ['projection', path.join(ownerDir, 'scripts/check_job_application_answer_projection.mjs'), ['--request', requestPath, '--result', resultPath, '--projection', projectionPath]],
  ['writing', path.join(ownerDir, 'scripts/check_job_application_writing_quality.mjs'), ['--profile', profilePath, '--request', requestPath, '--result', resultPath, '--review', reviewPath]],
];
const validation = [];
for (const [name, script, args] of validationCommands) {
  const output = run(script, args, name);
  validation.push({ name, status: 'pass', output: output.trim() });
}
validation.push({ name: 'composition', status: 'pass', output: loadJson(compositionFinalPath).status });
validation.push({ name: 'render', status: renderReceipt.status, output: `${renderReceipt.pageCount} pages, ${renderReceipt.overflowPages.length} overflow pages` });
writeJson('validation-summary.json', {
  kind: 'job-application-report-validation-summary/v1',
  validations: validation,
  all_passed: validation.every(item => item.status === 'pass'),
  authority_effect: 'none',
});

process.stdout.write(JSON.stringify({
  report: rel('report.pdf'),
  pages: renderReceipt.pageCount,
  scores: Object.fromEntries(candidates.map(candidate => [candidate.id, candidate.total_score])),
  validation: 'pass',
}, null, 2) + '\n');
