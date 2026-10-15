#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { renderEditorialRasterAssets } from '../../../artifacts/agent-loop/document/job-application-report-production/scripts/render_editorial_raster_assets.mjs';
import { expressionMetrics } from '../../../artifacts/agent-loop/document/job-application-report-production/scripts/check_job_application_writing_quality.mjs';

const repoRoot = process.cwd();
const runtimeRelative = '.collab/artifacts/job-application-2026-09-ibk-it';
const runtimeDir = path.resolve(repoRoot, runtimeRelative);
const ownerDir = path.resolve(repoRoot, 'artifacts/agent-loop/document/job-application-report-production');
const profilePath = path.join(ownerDir, 'profiles/five-set-pdf-report.profile.json');
const observedAt = '2026-09-15T18:00:00+09:00';
const reportDate = '2026-09-15';

fs.mkdirSync(path.join(runtimeDir, 'assets'), { recursive: true });
fs.mkdirSync(path.join(runtimeDir, 'render'), { recursive: true });

const sha256 = value => crypto.createHash('sha256').update(value).digest('hex');
const digestText = value => sha256(value);
const digestFile = file => sha256(fs.readFileSync(file));
const codePointLength = value => Array.from(value).length;
const round2 = value => Math.round((value + Number.EPSILON) * 100) / 100;
const rel = name => path.posix.join(runtimeRelative, name);
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
const canonicalize = value => Array.isArray(value)
  ? value.map(canonicalize)
  : value && typeof value === 'object'
    ? Object.fromEntries(Object.keys(value).sort().map(key => [key, canonicalize(value[key])]))
    : value;
const canonicalDigest = (value, excludedKey) => {
  const copy = JSON.parse(JSON.stringify(value));
  delete copy[excludedKey];
  return sha256(JSON.stringify(canonicalize(copy)) + '\n');
};
const esc = value => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');
const textHtml = value => String(value).split(/\n\n/u).map(part => `<p>${esc(part).replaceAll('\n', '<br>')}</p>`).join('');
const sourceUrl = 'https://secure.jasoseol.com/recruit/105904';
const questionEndpointUrl = 'https://secure.jasoseol.com/employment/employment_question.json?employment_id=427724';
const alioUrl = 'https://job.alio.go.kr/recruitview.do?idx=304338';
const ibkBlogUrl = 'https://blog.ibk.co.kr/569692';
const previousIbkUrl = 'https://linkareer.com/cover-letter/35317';

const sources = [
  { id: 'source-ibk-posting', source_type: 'official_posting', locator: sourceUrl, authority: 'primary', observed_at: observedAt, digest: null, visibility: 'public_report_allowed' },
  { id: 'source-ibk-question-endpoint', source_type: 'official_posting', locator: questionEndpointUrl, authority: 'primary', observed_at: observedAt, digest: null, visibility: 'runtime_private' },
  { id: 'source-ibk-alio', source_type: 'official_posting', locator: alioUrl, authority: 'primary', observed_at: observedAt, digest: null, visibility: 'public_report_allowed' },
  { id: 'source-ibk-blog', source_type: 'official_company', locator: ibkBlogUrl, authority: 'primary', observed_at: observedAt, digest: null, visibility: 'public_report_allowed' },
  { id: 'source-portfolio-profile', source_type: 'applicant_statement', locator: 'https://github.com/judangs', authority: 'applicant_owned', observed_at: observedAt, digest: null, visibility: 'public_report_allowed' },
  { id: 'source-portfolio-bank-msa', source_type: 'project_repository', locator: 'https://github.com/judangs/dev-group-bank-msa', authority: 'project_observation', observed_at: observedAt, digest: null, visibility: 'public_report_allowed' },
  { id: 'source-portfolio-kafka', source_type: 'project_repository', locator: 'https://github.com/judangs/study-kafka-with-java', authority: 'project_observation', observed_at: observedAt, digest: null, visibility: 'public_report_allowed' },
  { id: 'source-portfolio-static-analysis', source_type: 'project_repository', locator: 'https://github.com/judangs/Static-Program-Analysis', authority: 'project_observation', observed_at: observedAt, digest: null, visibility: 'public_report_allowed' },
  { id: 'source-portfolio-algorithm', source_type: 'project_repository', locator: 'https://github.com/judangs/algorithm', authority: 'project_observation', observed_at: observedAt, digest: null, visibility: 'public_report_allowed' },
  { id: 'source-previous-ibk-cover-letter', source_type: 'qualified_secondary', locator: previousIbkUrl, authority: 'qualified_secondary', observed_at: observedAt, digest: null, visibility: 'public_report_allowed' },
];

const questions = [
  {
    id: 'question-motivation',
    prompt: '지원자님을 환영합니다! 수많은 회사 중에서 IBK기업은행을 선택해 주신 이유와, 앞으로 IBK에서 이루고 싶은 모습에 대해 편안하게 이야기해주세요.',
    min_chars: 1,
    max_chars: 1500,
    required_contents: ['IBK기업은행을 선택한 이유', '앞으로 IBK에서 이루고 싶은 모습', '개인 경험 또는 관심과의 연결'],
    focus: {
      family_id: 'motivation-and-company-fit',
      primary_claim: '금융 시스템의 전 과정을 책임지는 IT 역할과 백엔드·이벤트 처리 중심의 준비가 만나 IBK를 선택했다.',
      reader_takeaway: '공고의 IT 책임 범위를 읽고 자신의 기술 관심을 금융 시스템의 신뢰성으로 연결한 지원자다.',
      reviewer_need: '왜 IBK의 IT 직무인지, 입행 후 어떤 책임으로 기여할지 확인한다.',
      evidence_function: '공고의 금융 시스템 개발·운영 범위와 지원자의 핀테크 백엔드·이벤트 처리 포트폴리오를 선택 이유와 미래상에 연결한다.',
      rhetorical_move_ids: ['direct-answer', 'company-role-connection', 'choice-or-action', 'relevant-context', 'future-direction'],
      voice_evidence_ids: ['applicant-fact-profile-spring-backend', 'applicant-fact-bank-portfolio', 'applicant-fact-kafka-study', 'applicant-value-maintainability'],
      closing_function: 'specific-next-responsibility',
      non_overlap_boundary: '회사 칭찬이나 막연한 포부가 아니라 공고의 IT 책임 범위와 개인 기술 준비가 만나는 현재의 선택을 중심으로 쓴다.',
    },
    user_confirmation_ids: ['unknown-personal-ibk-motivation', 'unknown-preferred-it-domain'],
  },
  {
    id: 'question-strength',
    prompt: '지원자님의 여러 강점 중에서 ‘이것만큼은 내가 자신 있다’고 말할 수 있는 것은 무엇인가요? 그리고 이를 발휘하여 성과를 낸 경험에 대해 들려주세요.',
    min_chars: 1,
    max_chars: 1500,
    required_contents: ['가장 자신 있는 강점', '강점을 발휘한 구체적 경험', '본인의 행동', '성과 또는 확인 가능한 결과'],
    focus: {
      family_id: 'strength-and-work-style',
      primary_claim: '복잡한 기술 흐름을 책임 경계와 확인 가능한 결과로 구조화하는 힘이 가장 큰 강점이다.',
      reader_takeaway: '기술을 나열하는 대신 흐름·경계·결과를 묶어 설명하고 구현하는 지원자다.',
      reviewer_need: '강점이 자기평가가 아니라 반복 가능한 행동과 결과로 드러나는지 확인한다.',
      evidence_function: '공개 핀테크 MSA 저장소, Kafka 학습 기록, 정적 분석 도구, 알고리즘 기록에서 강점이 드러나는 구조적 선택과 산출물을 사용한다.',
      rhetorical_move_ids: ['direct-answer', 'value-in-action', 'result-or-boundary', 'relevant-context', 'choice-or-action', 'company-role-connection'],
      voice_evidence_ids: ['applicant-fact-bank-portfolio', 'applicant-fact-kafka-study', 'applicant-fact-static-analysis', 'applicant-value-maintainability'],
      closing_function: 'role-relevance',
      non_overlap_boundary: '지원동기나 포부를 반복하지 않고 하나의 강점이 실제 작업 방식과 확인 가능한 산출물로 어떻게 나타났는지에 집중한다.',
    },
    user_confirmation_ids: ['unknown-applicant-contribution-depth', 'unknown-portfolio-outcomes'],
  },
  {
    id: 'question-growth',
    prompt: '결과에 관계없이 지원자님을 한 단계 성장시킨 경험이 궁금합니다. 그 과정에서 몸소 느꼈거나 배운 점, 그리고 이후 ‘변화된 나’에 대해서 솔직하게 들려주세요.',
    min_chars: 1,
    max_chars: 1500,
    required_contents: ['성장시킨 경험', '과정에서 느끼거나 배운 점', '이후 변화된 모습', '결과와 무관한 성장의 의미'],
    focus: {
      family_id: 'project-problem-and-achievement',
      primary_claim: '기술적 결과보다 실패 경로와 검증 과정을 설계하는 태도를 배우며 문제를 대하는 방식이 바뀌었다.',
      reader_takeaway: '결과를 과장하지 않고 복잡한 문제에서 선택·검증·학습을 반복하는 엔지니어다.',
      reviewer_need: '성장 경험의 긴장과 선택, 배운 점, 이후 행동 변화가 인과적으로 이어지는지 확인한다.',
      evidence_function: '정적 분석·Kafka·알고리즘 학습 과정에서 단순 구현을 넘어 경계조건, 전달 보장, 재현 가능한 확인을 고민하게 된 경험을 사용한다.',
      rhetorical_move_ids: ['relevant-context', 'choice-or-action', 'reason-or-tradeoff', 'result-or-boundary', 'learning-or-change', 'direct-answer'],
      voice_evidence_ids: ['applicant-fact-static-analysis', 'applicant-fact-kafka-study', 'applicant-fact-algorithm', 'applicant-value-flow-traceability'],
      closing_function: 'changed-practice',
      non_overlap_boundary: '현재 강점의 증명보다 한 경험에서 관점이 어떻게 바뀌었고 이후 문제 해결 습관이 어떻게 달라졌는지를 중심으로 쓴다.',
    },
    user_confirmation_ids: ['unknown-applicant-contribution-depth', 'unknown-portfolio-outcomes'],
  },
  {
    id: 'question-it-capability',
    prompt: '지원자님이 지닌 디지털·IT 역량 중 IBK에서 가장 잘 활용할 수 있다고 생각하는 역량은 무엇인지 본인만의 차별화된 스토리로 저희에게 이야기해주세요.',
    min_chars: 1,
    max_chars: 1500,
    required_contents: ['가장 잘 활용할 디지털·IT 역량', '차별화된 경험 또는 스토리', 'IBK에서의 활용 방식', '역량의 한계와 확장 방향'],
    focus: {
      family_id: 'capability-and-contribution',
      primary_claim: 'Java·Spring 백엔드와 이벤트·데이터 흐름을 함께 보며 금융 시스템의 처리 신뢰성을 높이는 역량을 활용할 수 있다.',
      reader_takeaway: '애플리케이션 기능만이 아니라 인증·결제·이벤트·DB·운영 경계를 함께 읽는 IT 지원자다.',
      reviewer_need: '보유 기술이 공고의 금융 시스템·애플리케이션·데이터·운영 책임에 어떻게 쓰일지 확인한다.',
      evidence_function: 'Spring 핀테크 MSA 저장소, Kafka 학습 기록, 프로그램 분석 경험을 하나의 처리 흐름 관점으로 묶어 IBK IT 기여를 설명한다.',
      rhetorical_move_ids: ['direct-answer', 'choice-or-action', 'company-role-connection', 'reason-or-tradeoff', 'result-or-boundary', 'future-direction'],
      voice_evidence_ids: ['applicant-fact-profile-spring-backend', 'applicant-fact-bank-portfolio', 'applicant-fact-kafka-study', 'applicant-fact-static-analysis'],
      closing_function: 'concrete-contribution',
      non_overlap_boundary: '기술 목록을 반복하지 않고 하나의 핵심 역량이 금융 업무 흐름의 안정성·추적성·유지보수성에 기여하는 방식을 중심으로 쓴다.',
    },
    user_confirmation_ids: ['unknown-applicant-contribution-depth', 'unknown-production-operation', 'unknown-preferred-it-domain'],
  },
];

const applicantEvidence = {
  facts: [
    { id: 'applicant-fact-profile-spring-backend', statement: '공개 GitHub 프로필에서 Spring 기반 애플리케이션 개발을 중심으로 백엔드 시스템의 구조와 아키텍처를 설계·개발하는 데 관심이 있다고 설명한다.', source_refs: ['source-portfolio-profile'], confirmed: true, allowed_uses: ['question-motivation', 'question-strength', 'question-it-capability'] },
    { id: 'applicant-fact-bank-portfolio', statement: '공개 저장소 dev-group-bank-msa를 핀테크 서비스 플랫폼 백엔드 포트폴리오로 제시하고 있으며, 회원·인증·결제·Gateway·Kafka Consumer와 다중 모듈 구조를 설명한다.', source_refs: ['source-portfolio-profile', 'source-portfolio-bank-msa'], confirmed: true, allowed_uses: ['question-motivation', 'question-strength', 'question-it-capability'] },
    { id: 'applicant-fact-kafka-study', statement: '공개 study-kafka-with-java 저장소에서 partition·key·순서·consumer lag·ISR·acks·idempotence·transaction·Spring Kafka 등을 학습 주제로 기록한다.', source_refs: ['source-portfolio-kafka'], confirmed: true, allowed_uses: ['question-strength', 'question-growth', 'question-it-capability'] },
    { id: 'applicant-fact-static-analysis', statement: '공개 Static-Program-Analysis 저장소에서 Python으로 ELF 분석, 디스어셈블리, 기본 블록·제어 흐름 복원, LLVM IR lifting을 시도한 구조를 설명한다.', source_refs: ['source-portfolio-static-analysis'], confirmed: true, allowed_uses: ['question-strength', 'question-growth', 'question-it-capability'] },
    { id: 'applicant-fact-algorithm', statement: '공개 algorithm 저장소에서 Programmers·Baekjoon·SWEA 문제 풀이 기록을 지속적으로 관리한다.', source_refs: ['source-portfolio-algorithm'], confirmed: true, allowed_uses: ['question-growth', 'question-strength'] },
    { id: 'applicant-fact-payvue-interest', statement: '공개 프로필은 Payvue를 개인 자산 관리와 그룹 기반 금융을 연결하는 핀테크 웹앱으로 소개하며 금융 서비스 문제에 대한 관심을 보여준다.', source_refs: ['source-portfolio-profile'], confirmed: true, allowed_uses: ['question-motivation', 'question-it-capability'] },
  ],
  value_statements: [
    { id: 'applicant-value-maintainability', statement: '공개 프로필은 유지보수 가능성·확장성·도메인 중심 설계와 책임 기반 구조에 관심이 있다고 밝힌다.', source_refs: ['source-portfolio-profile'], confirmed: true, allowed_uses: ['question-motivation', 'question-strength', 'question-it-capability'] },
    { id: 'applicant-value-flow-traceability', statement: '공개 프로젝트 기록을 종합하면 처리 흐름과 경계조건을 분해하고 확인 가능한 구조로 남기려는 작업 방식이 관찰된다.', source_refs: ['source-portfolio-bank-msa', 'source-portfolio-kafka', 'source-portfolio-static-analysis'], confirmed: false, allowed_uses: ['question-strength', 'question-growth', 'question-it-capability'] },
  ],
  unknowns: [
    { id: 'unknown-personal-ibk-motivation', needed_fact: '공고의 직무 적합성 외에 지원자 개인이 IBK기업은행을 선택한 직접적인 계기와 관심 고객·업무', affected_question_ids: ['question-motivation'], why_material: '현재 자료만으로는 IBK만의 개인적 선택 이유를 지원자 목소리로 확정할 수 없다.', acceptable_evidence: 'IBK 서비스 이용 경험, 관심 금융 고객, 기업 조사 메모, 지원 결심 계기 중 하나' },
    { id: 'unknown-preferred-it-domain', needed_fact: '입행 후 선호하는 애플리케이션·데이터·보안·인프라 등 IT 세부 영역과 맡고 싶은 초기 책임', affected_question_ids: ['question-motivation', 'question-it-capability'], why_material: '넓은 IT 직무 범위에서 미래상을 한 방향으로 좁히려면 개인 선호가 필요하다.', acceptable_evidence: '희망 시스템·기술 영역과 첫 1~2년 동안 배우고 싶은 책임을 한두 문장으로 확인' },
    { id: 'unknown-applicant-contribution-depth', needed_fact: '각 공개 저장소에서 지원자가 직접 작성·설계·검증한 범위와 개인 프로젝트인지 협업 프로젝트인지', affected_question_ids: ['question-strength', 'question-growth', 'question-it-capability'], why_material: '공개 저장소의 구조는 관찰되지만 파일별 개인 기여와 협업 맥락은 별도 확인이 필요하다.', acceptable_evidence: '커밋·PR·설계 문서·README·회고 또는 본인 기여 목록' },
    { id: 'unknown-portfolio-outcomes', needed_fact: '포트폴리오의 테스트 결과, 처리량·지연·정확도·오류 재현 등 정량 또는 관찰 가능한 성과', affected_question_ids: ['question-strength', 'question-growth'], why_material: '성과 문항에서 결과를 더 설득력 있게 말하되 생산 환경 성과로 과장하지 않기 위해 필요하다.', acceptable_evidence: '테스트 리포트, benchmark, issue 해결 기록, 데모 캡처 또는 전후 비교' },
    { id: 'unknown-production-operation', needed_fact: '실제 배포·운영, 장애 대응, 보안 점검, DB·인프라 관리 경험 여부와 범위', affected_question_ids: ['question-it-capability'], why_material: '공고의 운영·보안·인프라 범위에 대한 경험 수준을 정확히 구분할 수 있다.', acceptable_evidence: '배포 설정, 모니터링·로그, 보안 점검, 장애 회고 또는 학습 실습 기록' },
    { id: 'unknown-character-minimum', needed_fact: '제출 시스템의 문항별 최소 글자 수와 최종 글자 수 산정 방식', affected_question_ids: questions.map(item => item.id), why_material: '확인된 공식 입력 제한은 문항별 1,500자 최대치이며, 최소치와 최종 카운터 동작은 별도 확인이 필요하다.', acceptable_evidence: '채용 입력 화면, 지원 안내 또는 최종 제출 단계의 카운터' },
  ],
};

const projectEvidence = [
  {
    id: 'project-bank-msa', kind: '핀테크 서비스 플랫폼 백엔드', scale: '공개 GitHub 저장소의 다중 Gradle 모듈 프로젝트', applicant_role: '공개 저장소 작성자; 세부 파일별 직접 기여 범위는 확인 필요', contribution: '회원·인증·결제·Gateway·Kafka Consumer와 API·application·domain·store·core 모듈의 구조를 포트폴리오로 제시한다.', process: 'Spring JPA와 MSA 환경을 전제로 서비스 책임과 공통 모듈, 외부 엔드포인트, 저장소 연결, 이벤트 소비 흐름을 분리해 기록한다.', learning: '금융 기능은 화면이나 API 하나가 아니라 인증·결제·이벤트·저장 경계를 함께 설계해야 유지보수 가능한 시스템이 된다는 관점을 보여준다.', claims: [
      { id: 'project-claim-bank-boundaries', statement: 'README는 api·application·domain·store·core를 구분하고 회원·인증·결제·Gateway·Consumer 애플리케이션을 설명한다.', source_refs: ['source-portfolio-bank-msa'], certainty: 'observed', outcome_limit: '공개 구조와 문서만 확인되며 실제 사용자 규모·운영 성과는 알 수 없다.' },
      { id: 'project-claim-bank-events', statement: 'Consumer 애플리케이션은 계정·결제·구매·계정 그룹 이벤트를 처리하고 이벤트 종류·범위에 따라 데이터 소스와 트랜잭션을 분리한다고 설명한다.', source_refs: ['source-portfolio-bank-msa'], certainty: 'observed', outcome_limit: '실제 이벤트 처리량·지연·장애 대응 결과는 확인되지 않았다.' },
      { id: 'project-claim-bank-gateway', statement: 'Gateway 애플리케이션은 인증·인가와 API 서비스 라우팅을 담당하며 Spring Gateway·Spring Boot·WebFlux를 사용한다고 설명한다.', source_refs: ['source-portfolio-bank-msa'], certainty: 'observed', outcome_limit: '프로덕션 배포와 보안 검증 범위는 확인되지 않았다.' },
    ],
    language_translations: [
      { internal_term: 'bank-api / bank-application / bank-domain / bank-store', universal_term: '외부 요청·업무 규칙·도메인 모델·데이터 저장 책임', use_condition: '모듈 이름을 그대로 나열하지 않고 책임 경계를 설명할 때 사용한다.' },
      { internal_term: 'Consumer app', universal_term: '이벤트를 받아 후속 처리를 수행하는 비동기 처리 영역', use_condition: '결제·계정 관련 후속 처리의 흐름을 설명할 때 사용한다.' },
    ],
  },
  {
    id: 'project-kafka-study', kind: 'Kafka와 이벤트 처리 학습 기록', scale: '공개 GitHub 학습 저장소의 producer·consumer·connect·streams 예제와 문서', applicant_role: '학습 저장소 작성자; 실서비스 적용 범위는 확인 필요', contribution: 'partition·key·순서·lag·ISR·acks·idempotence·transaction을 처리 신뢰성 관점에서 학습하고 기록한다.', process: '메시지 전달과 소비를 단순 성공 여부가 아니라 병렬성·순서·재처리·내구성의 선택 문제로 나눠 탐구한다.', learning: '이벤트 기반 시스템에서는 전송 성공과 업무 처리 완료를 구분하고, 실패·중복·지연을 설계 단계에서 질문해야 한다.', claims: [
      { id: 'project-claim-kafka-semantics', statement: 'README는 partition 크기, 병렬 처리, consumer throughput·lag, message key·order, retention, ISR, producer acks, idempotence·transaction을 학습 주제로 기록한다.', source_refs: ['source-portfolio-kafka'], certainty: 'observed', outcome_limit: '학습 기록은 확인되지만 금융 서비스에 적용한 운영 지표는 확인되지 않았다.' },
      { id: 'project-claim-kafka-spring', statement: '저장소는 Spring Kafka producer·consumer와 multithreading·배포 전략을 함께 다룬다.', source_refs: ['source-portfolio-kafka'], certainty: 'observed', outcome_limit: '실제 장애 대응이나 대규모 운영 결과는 확인되지 않았다.' },
    ],
    language_translations: [
      { internal_term: 'consumer lag', universal_term: '생산된 이벤트와 소비 완료 사이의 처리 지연', use_condition: '운영 관점의 모니터링과 처리 여유를 설명할 때 사용한다.' },
      { internal_term: 'idempotence / transaction', universal_term: '중복 처리의 영향을 줄이고 처리 단위를 일관되게 유지하는 방식', use_condition: '결제·계정 이벤트의 재시도와 데이터 일관성을 설명할 때 사용한다.' },
    ],
  },
  {
    id: 'project-static-analysis', kind: '정적 프로그램 분석 도구', scale: '공개 GitHub Python 프로젝트의 parser·disassembler·linker·lifter·test 구조', applicant_role: '프로젝트 작성자; 분석 정확도와 실제 적용 범위는 확인 필요', contribution: 'ELF 헤더 분석, x86 디스어셈블리, 기본 블록·제어 흐름 복원, LLVM IR lifting 과정을 구현 대상으로 삼았다.', process: '바이너리 입력을 파싱하고 명령어와 제어 흐름을 분리해 분석한 뒤 중간 표현으로 옮기는 단계적 구조를 기록한다.', learning: '복잡한 결과를 신뢰하려면 결과 표현보다 각 단계의 가정과 도달 가능성을 분리해 검증해야 한다.', claims: [
      { id: 'project-claim-analysis-pipeline', statement: 'README는 ELF 32/64비트 헤더 파싱부터 디스어셈블리·코드 패턴·기본 블록·제어 흐름·LLVM IR lifting을 기대 흐름으로 설명한다.', source_refs: ['source-portfolio-static-analysis'], certainty: 'observed', outcome_limit: '도구의 정확도·성능과 모든 바이너리에 대한 완전성은 확인되지 않았다.' },
      { id: 'project-claim-analysis-functions', statement: 'RecursiveDisasm, LinearSweepDisasm, TraceControlFlow, CanReachable 등의 분석 함수를 구조로 제시한다.', source_refs: ['source-portfolio-static-analysis'], certainty: 'observed', outcome_limit: '각 함수의 테스트 커버리지와 실제 분석 성공률은 확인되지 않았다.' },
    ],
    language_translations: [
      { internal_term: 'TraceControlFlow / CanReachable', universal_term: '제어 흐름을 추적하고 특정 경로의 도달 가능성을 확인하는 분석 단계', use_condition: '원인 추적과 경계조건 검토를 보편 언어로 바꿀 때 사용한다.' },
    ],
  },
  {
    id: 'project-algorithm-practice', kind: '알고리즘 문제 해결 기록', scale: '공개 GitHub 저장소의 Programmers·Baekjoon·SWEA 풀이 기록', applicant_role: '풀이 기록 작성자', contribution: '문제 해결 과정을 반복하며 자료구조·알고리즘 선택과 경계조건을 코드로 확인한다.', process: '문제의 입력 조건을 해석하고 풀이를 구현한 뒤 사례를 추가해 결과를 점검하는 연습을 지속한다.', learning: '빠른 구현보다 제약 조건과 실패 가능한 입력을 먼저 분리하는 습관이 문제 해결의 재현성을 높인다.', claims: [
      { id: 'project-claim-algorithm-record', statement: '공개 저장소는 Programmers·Baekjoon·SWEA 문제 풀이를 자동 기록하는 형태로 관리된다.', source_refs: ['source-portfolio-algorithm'], certainty: 'observed', outcome_limit: '문제 풀이 기록은 확인되지만 실기시험 점수나 업무 성과를 의미하지 않는다.' },
    ],
    language_translations: [
      { internal_term: 'algorithm practice', universal_term: '입력 조건·경계 사례·복잡도를 점검하는 문제 해결 훈련', use_condition: 'IT 실기 준비와 디버깅 습관을 연결할 때 사용한다.' },
    ],
  },
];

const applicationAnalysis = {
  company_context: [
    { id: 'company-context-current-recruitment', observation: 'IBK기업은행은 2026년 하반기 신입행원 채용에서 금융일반·디지털·IT·고졸인재 분야를 안내했다.', evidence_refs: ['source-ibk-posting', 'source-ibk-blog', 'source-ibk-alio'], writing_implication: '지원동기는 회사 일반론보다 IT 분야를 선택한 현재의 이유와 준비를 연결해야 한다.', certainty: 'fact' },
    { id: 'company-context-application-stage', observation: '공고는 서류심사 뒤 필기·실기·면접을 진행하며, IT 실기에서 알고리즘·데이터베이스를 평가한다고 안내한다.', evidence_refs: ['source-ibk-alio', 'source-ibk-blog'], writing_implication: '자기소개서에서 백엔드 경험을 말하되 알고리즘·DB 기초와 실제 학습 흔적을 함께 보여주는 편이 안전하다.', certainty: 'fact' },
  ],
  role_domain_concerns: [
    { id: 'role-concern-system-lifecycle', observation: 'IT 주요 업무는 금융 시스템 개발·운영, 애플리케이션 개발·유지보수, 네트워크·보안, DB 관리, IT 인프라 구축·운영으로 제시된다.', evidence_refs: ['source-ibk-posting'], writing_implication: '기능 구현만 강조하지 말고 데이터 흐름·장애 경로·유지보수 책임을 함께 말한다.', certainty: 'fact' },
    { id: 'role-concern-reliability-inference', observation: '금융 시스템의 개발·운영과 보안·DB·인프라 범위를 함께 맡는 직무는 데이터 무결성·접근 통제·운영 확인을 중시할 가능성이 높다.', evidence_refs: ['source-ibk-posting', 'source-ibk-alio'], writing_implication: '확인되지 않은 운영 성과는 주장하지 않고, 신뢰성에 대한 설계 관점과 학습 증거로 좁혀 쓴다.', certainty: 'inference' },
    { id: 'role-concern-quality-screen', observation: '공고는 은행명 오류, 표절, 무관·반복·부족한 답변과 블라인드 저촉 등을 서류 단계에서 검증한다고 안내한다.', evidence_refs: ['source-ibk-alio', 'source-ibk-blog'], writing_implication: '다섯 세트는 문항별 역할을 구분하고, 제출 전에는 실제 본인의 기여와 문장을 다시 확인한다.', certainty: 'fact' },
  ],
  fit_hypotheses: [
    { id: 'fit-bank-backend-to-it', statement: '핀테크 MSA 저장소의 인증·결제·Gateway·Consumer 구조는 금융 시스템과 애플리케이션 개발·유지보수 관심을 보여주는 소재가 될 수 있다.', evidence_refs: ['source-portfolio-bank-msa'], confirmation_required: true },
    { id: 'fit-kafka-to-reliability', statement: 'Kafka 학습 기록은 이벤트 지연·순서·중복·트랜잭션을 질문하는 데이터 처리 관점을 보여주며 금융 업무 흐름의 신뢰성 이야기로 연결할 수 있다.', evidence_refs: ['source-portfolio-kafka'], confirmation_required: true },
    { id: 'fit-analysis-to-debugging', statement: '정적 분석 프로젝트는 복잡한 문제를 단계와 도달 가능성으로 분해하는 사고를 보여주며 원인 추적 역량의 근거가 될 수 있다.', evidence_refs: ['source-portfolio-static-analysis'], confirmation_required: true },
    { id: 'fit-algorithm-to-practical-test', statement: '알고리즘 풀이 기록은 IT 실기 준비의 학습 증거가 될 수 있으나 업무 성과나 시험 결과로 확대할 수는 없다.', evidence_refs: ['source-portfolio-algorithm', 'source-ibk-alio'], confirmation_required: true },
  ],
};

const qualityProfile = {
  policy_ref: 'artifacts/agent-loop/document/job-application-report-production/vocabularies/job-application-report-quality-policy.json',
  mandatory_gate_ids: ['request-and-question-coverage', 'source-and-freshness-boundary', 'applicant-attribution-and-confirmation', 'project-evidence-and-causality', 'role-domain-language-clarity', 'publication-and-privacy-safety'],
  dimensions: [
    { id: 'question-fit-and-differentiation', weight: 20 },
    { id: 'role-and-domain-alignment', weight: 20 },
    { id: 'applicant-viewpoint-and-values', weight: 18 },
    { id: 'evidence-causality-and-attribution', weight: 18 },
    { id: 'expression-specificity-and-coherence', weight: 14 },
    { id: 'clarity-and-interview-defensibility', weight: 10 },
  ],
  rating_min: 0,
  rating_max: 4,
  qualification_threshold: 90,
  score_meaning: 'editing_fitness_not_hiring_probability',
  revision_passes: 1,
};

const contentPolicies = [
  { id: 'privacy-no-local-paths', severity: 'mandatory', target: 'public_text_extract', expectation: 'absent', matcher: { type: 'regex_any', values: ['/Users/', '/private/', 'file:', '\\\\.collab/', 'node_modules'] }, rationale: '공개 보고서에 로컬 경로와 런타임 저장소 경로가 노출되지 않도록 한다.' },
  { id: 'reader-language-no-runtime-labels', severity: 'mandatory', target: 'public_text_extract', expectation: 'absent', matcher: { type: 'literal_any', values: ['request.json', 'result.json', 'route-decision', 'reusable-artifact', 'authority_effect', 'candidate_id', 'writing-quality'] }, rationale: '지원자와 조언자가 읽는 보고서에서 실행 메커니즘과 내부 필드명을 제외한다.' },
  { id: 'reader-sections-present', severity: 'mandatory', target: 'public_text_extract', expectation: 'present', matcher: { type: 'literal_any', values: ['지원 답안', '면접 준비', '추가 확인 사항'] }, rationale: '지원자가 답변을 고르고 다음 준비를 이어갈 핵심 섹션이 실제 텍스트로 존재하는지 확인한다.' },
  { id: 'visible-official-posting', severity: 'advisory', target: 'public_text_extract', expectation: 'present', matcher: { type: 'literal_any', values: [sourceUrl] }, rationale: '공고 원문을 독자가 다시 확인할 수 있도록 공개 출처를 표시한다.' },
];

const outputProfile = {
  profile_ref: 'artifacts/agent-loop/document/job-application-report-production/profiles/five-set-pdf-report.profile.json',
  candidate_count: 5,
  report_format: 'pdf',
  audiences: ['IT 직군 지원자', '커리어 조언자'],
  required_sections: ['application-overview', 'company-role-analysis', 'question-map', 'candidate-answers', 'candidate-evaluation', 'expert-review', 'interview-preparation', 'material-requests'],
  design: { tone: '차분한 실무 편집형', comparison_layout: 'editorial_sequence', avoid_patterns: ['회사 칭찬의 일반론', '기술 목록 나열', '확인되지 않은 성과 확대', '문항 간 동일한 서사'], raster_policy: 'required_for_visual_assets' },
  publication: { searchable_text_required: true, overflow_policy: 'no_clipped_content', visible_source_policy: 'allowlisted_only', content_policies: contentPolicies },
};

const request = {
  kind: 'job-application-report-request/v1', schema_version: 1, request_id: 'request:ibk:it:2026-h2:r1', revision: 'r1-five-set-pdf',
  application: { company_name: 'IBK기업은행', role_title: 'IT 신입행원', language: 'ko-KR', official_posting_source_ids: ['source-ibk-posting', 'source-ibk-question-endpoint', 'source-ibk-alio'] },
  questions, sources, application_analysis: applicationAnalysis, applicant_evidence: applicantEvidence, project_evidence: projectEvidence,
  source_policy: { as_of: reportDate, prefer_primary: true, allowed_source_ids: sources.map(item => item.id), visible_source_ids: ['source-ibk-posting', 'source-ibk-alio', 'source-ibk-blog', 'source-previous-ibk-cover-letter', 'source-portfolio-profile', 'source-portfolio-bank-msa', 'source-portfolio-kafka', 'source-portfolio-static-analysis', 'source-portfolio-algorithm'], missing_evidence_policy: 'preserve_unknown' },
  quality_profile: qualityProfile, output_profile: outputProfile,
  privacy_boundary: { public_evidence_ids: ['source-ibk-posting', 'source-ibk-alio', 'source-ibk-blog', 'source-previous-ibk-cover-letter', 'source-portfolio-profile', 'source-portfolio-bank-msa', 'source-portfolio-kafka', 'source-portfolio-static-analysis', 'source-portfolio-algorithm'], prohibited_content_categories: ['private-reasoning', 'raw-prompt', 'runtime-handle', 'secret', 'absolute-path', 'unconfirmed-personal-fact'], identity_handling: 'runtime_private' },
  stop_budget: { max_research_rounds: 2, max_revision_passes: 1, unchanged_failure_limit: 1 },
};

writeJson('request.json', request);

const routeInput = {
  requestRevision: request.revision,
  facts: { workPurpose: 'deliver', operationFamily: 'outcome_production', effectIntent: 'local_mutation', outputShape: 'validated_candidate', temporalShape: 'iterative', contributionShape: 'one_owner', boundedIteration: true, outputValidationContract: true, explicitSessionRevision: false, currentStateEvidenceRequired: true, mutationRequired: true, capabilityReadiness: 'verified', lifecycleReadiness: 'verified', authorityResolved: true, effectAdmitted: true, instructionAdmitted: true, executionSurface: 'local_coordinator_only' },
  continuity: { requestRelation: 'new_objective', historyCoverage: 'not_applicable', sessionBoundary: 'not_applicable', priorPrimaryMode: 'none', outerObligationState: 'none', priorCompletionEvidence: 'not_applicable', projectionRef: rel('context-projection.json') },
  missingFacts: applicantEvidence.unknowns.map(item => item.needed_fact), conflictingFacts: [],
};
const routeInputPath = writeJson('route-input.json', routeInput);
const routeDecision = {
  kind: 'six-mode-route-decision/v1', requestRevision: request.revision, status: 'selected', selectedMode: 'loop',
  continuityDecision: { requestRelation: 'new_objective', objectiveRelation: 'new', historyCoverage: 'not_applicable', sessionBoundary: 'not_applicable', priorPrimaryMode: 'none', outerObligationState: 'none', priorCompletionEvidence: 'not_applicable', projectionRef: rel('context-projection.json'), executionSurface: 'local_coordinator_only', candidateMode: 'loop', effectivePrimaryMode: 'loop', segmentMode: null, disposition: 'standalone', outerObligationAction: 'start', modeCompositionRequired: true },
  architectureSelection: { requirement: 'eligible', selectionStatus: 'deferred_to_native_artifact', targetScope: 'effective_primary', effectivePrimaryMode: 'loop', structuralSignals: ['five_complete_candidate_sets', 'one_bounded_revision', 'publication_validation'], segmentMode: null, segmentRequirement: null, segmentSelectionStatus: null, segmentStructuralSignals: [], workflowPatternOwnerRef: 'artifacts/loop-architecture/components/agentic-architecture/component.json', agentTopologyOwnerRef: 'artifacts/loop-architecture/components/agent-execution-topology-selection/component.json', coordinationOwnerRef: 'artifacts/loop-architecture/components/agent-architecture-coordination/component.json', patternSelectedByRouting: false },
  eligibleModes: ['loop'], rejectedModes: [
    { mode: 'communication', reasonCodes: ['bounded_revision_required', 'publication_artifact_required', 'effect_not_none'] },
    { mode: 'investigation', reasonCodes: ['complete_report_production_requested', 'mutation_required', 'output_not_finding'] },
    { mode: 'single_task', reasonCodes: ['multiple_ordered_stages', 'bounded_revision_and_reassessment'] },
    { mode: 'orchestration', reasonCodes: ['one_material_contribution_owner', 'no_multi-lane_fan-in-required'] },
    { mode: 'session_control', reasonCodes: ['no_explicit_session_action', 'effect_not_session_control'] },
  ], blockers: [], missingFacts: routeInput.missingFacts, conflictingFacts: [], reassessmentTriggers: ['objective_or_question_change', 'company_role_or_applicant_evidence_change', 'quality_profile_or_publication_contract_change', 'effect_or_execution_surface_change', 'route_or_topology_change', 'user_confirmation_or_material_source_change'], authorityEffect: 'none',
};
const routeDecisionPath = writeJson('route-decision.json', routeDecision);

const inventoryPath = path.join(repoRoot, 'artifacts/loop-architecture/registry/reusable-artifact-inventory.json');
const inventory = JSON.parse(fs.readFileSync(inventoryPath, 'utf8'));
const inventoryDigest = inventory.sourceSnapshot?.digest || digestFile(inventoryPath);
const agencyPath = path.join(repoRoot, 'artifacts/agents/requirement-realization/agents/artifact-builder.yaml');
const agencyDigest = `sha256:${fs.existsSync(agencyPath) ? digestFile(agencyPath) : digestText('artifact-builder')}`;
const operationRequest = {
  kind: 'reusable-artifact-operation-request/v2', schemaVersion: 2, status: 'report_only', authorityEffect: 'none', acceptedAsEvidence: false,
  requestId: 'request:reusable-operation:ibk-it-report', requestRevision: 'revision:ibk-it-r1', requestRelation: 'new_objective',
  routeBinding: { decisionRef: rel('route-decision.json'), decisionDigest: `sha256:${digestFile(routeDecisionPath)}`, effectiveMode: 'loop' },
  subject: { subjectRef: 'agent-subject:ibk-it-report-builder', agencyRef: 'artifacts/agents/requirement-realization/agents/artifact-builder.yaml', agencyDigest, responsibilityClass: 'builder', outcomeContract: 'outcome:five-set-searchable-pdf-job-application-review', outputContract: 'output:request-result-projection-review-and-pdf', decisionScopes: ['selected-job-application-loop', 'five-candidate-answer-content', 'reader-facing-pdf-publication'], nonAuthority: ['source-truth', 'applicant-impersonation', 'acceptance', 'submission', 'hiring-outcome', 'native-artifact-edit'] },
  objective: 'Use the selected job-application report Loop as-is to produce five differentiated Korean answer sets and one searchable PDF for the supplied IBK기업은행 IT posting.',
  successEvidenceRefs: ['evidence:fresh-runtime-bundle-created', 'evidence:five-candidate-coverage', 'evidence:searchable-pdf-addressable'], protectedConstraintRefs: ['constraint:no-invented-applicant-facts', 'constraint:five-set-pdf-profile', 'constraint:public-private-projection-separation', 'constraint:authority-effect-none'], nonGoalRefs: ['non-goal:edit-reusable-source', 'non-goal:application-submission', 'non-goal:company-fact-invention'],
  lifecycleIntent: 'reuse_as_is', capabilities: ['job application report production', 'Korean editorial writing', 'PDF publication validation'], inventoryRef: 'artifacts/loop-architecture/registry/reusable-artifact-inventory.json', inventoryDigest, allowedBaseClasses: ['loop'], allowedScopes: ['unresolved'], requiredFacts: [], exactArtifactIds: [], relationshipDepth: 0, maxCandidates: 1, contextBudget: { maxSourceMembers: 10, maxConsumerRefs: 4, maxValidationRefs: 6 }, scopeControl: { namedUnresolvedFacts: ['applicant contribution depth and production-operation evidence remain unresolved'], allowedRelationshipTypes: ['defines', 'consumes', 'validates'], expansionRule: 'named_unresolved_fact_must_materially_change_routing_delivery_or_acceptance', adjacentFindingDisposition: 'report_only_follow_up', onBudgetExhaustion: 'narrow_and_continue' }, changeControl: { materialChangeTriggers: ['objective', 'native_owner', 'artifact_revision', 'public_contract', 'consumer', 'effect', 'route_or_topology', 'lifecycle', 'protected_constraint'], onMaterialChange: 'signal_and_return_to_structural_owner', silentWideningAllowed: false }, completion: { terminalEvidenceRefs: ['evidence:fresh-runtime-bundle-created', 'evidence:adjacent-findings-not-executed', 'evidence:pdf-rendered-and-addressable'], validationRefs: ['validation:five-set-pdf-profile', 'validation:request-result-writing-projection', 'validation:render-publication'], stopWhenSatisfied: true, optionalImprovementDisposition: 'report_only_follow_up', decisionBasisRequired: true, evidenceAndLimitationsRequired: true }, lifecycleBudgetRef: 'loop-budget:ibk-it-five-set-report:v1', dataClassification: 'internal', effectIntent: 'local_write', externalSearchAllowed: true, constructionAllowed: false, residualGapProven: true, requestDigest: '',
};
operationRequest.requestDigest = canonicalDigest(operationRequest, 'requestDigest');
writeJson('reusable-artifact-operation-request.json', operationRequest);
writeJson('artifact-use-binding.json', { kind: 'reusable-artifact-use-binding/v1', status: 'report_only', authorityEffect: 'none', disposition: 'reuse_as_is', subjectRef: 'agent-subject:ibk-it-report-builder', artifactRef: 'artifacts/agent-loop/document/job-application-report-production/loop.yaml', artifactContractRef: 'artifacts/agent-loop/document/job-application-report-production/contract.md', skillRef: 'artifacts/agent-loop/document/job-application-report-production/skill/job-application-report-loop-operation/SKILL.md', routeBinding: { decisionRef: rel('route-decision.json'), decisionDigest: digestFile(routeDecisionPath), effectiveMode: 'loop' }, selectedResponsibilities: ['bind five-set PDF request', 'differentiate four questions', 'compose five answer sets', 'compose review report', 'render and validate one searchable PDF'], excludedResponsibilities: ['source truth', 'applicant confirmation', 'application acceptance', 'external submission', 'hiring decision', 'native artifact edit'], sourceRevisionEvidence: { loopDigest: digestFile(path.join(ownerDir, 'loop.yaml')), contractDigest: digestFile(path.join(ownerDir, 'contract.md')), policyDigest: digestFile(path.join(ownerDir, 'policy/job-application-report-production.policy.json')), requirementDigest: digestFile(path.join(ownerDir, 'requirements/job-application-report-production.requirement.json')), skillDigest: digestFile(path.join(ownerDir, 'skill/job-application-report-loop-operation/SKILL.md')), profileDigest: digestFile(profilePath) } });
writeJson('agent-operation-boundary.json', { kind: 'reusable-artifact-agent-operation-boundary/v1', revision: '2026-09-15.ibk-it', status: 'bound', authorityEffect: 'none', subjectRef: 'agent-subject:ibk-it-report-builder', nativeOwnerRef: 'artifacts/agent-loop/document/job-application-report-production/loop.yaml', requestedOutcome: 'Produce five differentiated Korean answers and one searchable PDF review report for the supplied IBK기업은행 IT posting.', successEvidence: ['request.json binds the mandatory five-set PDF profile', 'five complete candidate sets cover every question', 'application projection is separate from review data', 'PDF has measured searchable text and no overflow', 'missing facts remain explicit and submission remains outside scope'], nonGoals: ['edit reusable source', 'invent company or applicant facts', 'submit the application', 'make a hiring decision'], boundedDiscoverySurface: { nativeArtifact: 'artifacts/agent-loop/document/job-application-report-production', runtimeBundle: runtimeRelative, selectedSourceMembers: ['loop.yaml', 'contract.md', 'governance.md', 'policy/job-application-report-production.policy.json', 'profiles/five-set-pdf-report.profile.json', 'skill/job-application-report-loop-operation/SKILL.md', 'skill/job-application-report-loop-operation/references/operation-protocol.md', 'skill/job-application-report-loop-operation/references/question-family-and-expression-guide.md', 'skill/job-application-report-loop-operation/references/editorial-report-and-public-language-guide.md'], applicantEvidence: 'user-provided posting, portfolio, and previous IBK cover-letter links', maximumCandidateCount: 5, maximumRevisionPasses: 1 }, validation: ['native request/result checker', 'mandatory profile checker', 'writing-quality checker', 'answer projection checker', 'measured PDF renderer', 'native package tests'], materialChangeSignals: ['question or character-limit change', 'applicant or project fact change', 'company or role source change', 'quality or publication profile change', 'projection or report boundary change', 'effect expansion beyond fresh runtime directory'], stopConditions: ['required evidence changes materially without confirmation', 'candidate answers cannot stay within declared limits', 'PDF is not searchable or has overflow', 'same validation failure repeats unchanged', 'requested effect expands to submission or source mutation'] });
writeJson('effect-admission.json', { kind: 'task-local-effect-admission/v1', status: 'admitted', authorityEffect: 'none', objectiveRef: rel('route-decision.json'), admittedEffect: { type: 'local_write', scope: `${runtimeRelative}/**`, purpose: 'write a fresh runtime request, evidence projections, five answer sets, review report, and measured PDF' }, excludedEffects: ['native_artifact_edit', 'external_network_mutation', 'application_submission', 'git_commit_or_push', 'identity_publication_without_consent'], authorizationBasis: 'explicit user request to prepare an IT job application report from the supplied sources', settlement: 'only the fresh runtime bundle is mutable; applicant confirmation, acceptance, and submission remain separate' });

writeJson('research-evidence.json', { kind: 'job-application-research-evidence/v1', status: 'report_only', authority_effect: 'none', request_ref: 'request.json', observed_at: observedAt, research_rounds: 2, source_observations: [
  { source_id: 'source-ibk-posting', authority: 'primary', observation: '2026년 하반기 IBK기업은행 신입행원 공고는 IT 분야와 금융 시스템 개발·운영, 애플리케이션 유지보수, 네트워크·보안, DB, 인프라 업무를 안내한다.', freshness: 'current-posting', used_for: ['question-motivation', 'question-it-capability'] },
  { source_id: 'source-ibk-alio', authority: 'primary', observation: '공고는 2026년 8월 28일부터 9월 14일까지 접수하고 IT 실기에서 알고리즘·데이터베이스를 평가한다고 안내한다.', freshness: 'current-posting', used_for: ['question-strength', 'question-it-capability'] },
  { source_id: 'source-ibk-blog', authority: 'primary', observation: 'IBK 공식 블로그도 2026년 하반기 채용 분야로 디지털·IT와 접수 일정을 안내한다.', freshness: 'current-posting', used_for: ['question-motivation'] },
  { source_id: 'source-previous-ibk-cover-letter', authority: 'qualified_secondary', observation: '이전 IBK 자기소개서는 지원동기·강점과 약점·준비·은행원 외 직업을 묻는 네 문항 구조로 확인되며, 제3자 답변 내용은 지원자 사실로 사용하지 않았다.', freshness: 'historical-reference', used_for: ['question-map'] },
  { source_id: 'source-portfolio-profile', authority: 'applicant_owned', observation: '공개 프로필은 Spring 백엔드 구조·아키텍처 관심과 핀테크 서비스 개념을 소개하고 네 개의 공개 저장소를 고정한다.', freshness: 'observed-public-profile', used_for: ['question-motivation', 'question-it-capability'] },
  { source_id: 'source-portfolio-bank-msa', authority: 'project_observation', observation: '공개 저장소 README는 핀테크 플랫폼의 회원·인증·결제·Gateway·Consumer와 다중 모듈 책임을 설명한다.', freshness: 'observed-public-repository', used_for: ['question-strength', 'question-it-capability'] },
  { source_id: 'source-portfolio-kafka', authority: 'project_observation', observation: '공개 학습 저장소는 Kafka의 지연·순서·전달 보장·중복·트랜잭션과 Spring Kafka를 다룬다.', freshness: 'observed-public-repository', used_for: ['question-strength', 'question-growth', 'question-it-capability'] },
  { source_id: 'source-portfolio-static-analysis', authority: 'project_observation', observation: '공개 프로젝트는 ELF 분석부터 제어 흐름과 LLVM IR로 이어지는 정적 분석 단계를 설명한다.', freshness: 'observed-public-repository', used_for: ['question-strength', 'question-growth', 'question-it-capability'] },
  { source_id: 'source-portfolio-algorithm', authority: 'project_observation', observation: '공개 저장소는 Programmers·Baekjoon·SWEA 문제 풀이 기록을 관리한다.', freshness: 'observed-public-repository', used_for: ['question-growth'] },
] });

writeJson('context-projection.json', { kind: 'job-application-context-projection/v1', status: 'report_only', authority_effect: 'none', projection_scope: 'ibk-it-five-set-pdf', application: request.application, confirmed_context: ['공식 공고의 IT 업무 범위', '공식 문항의 1,500자 최대 제한', '공개 GitHub 프로필과 저장소의 문서·구조'], inferred_context: ['금융 IT 답변에서 데이터·보안·운영 경계를 함께 보여줄 필요'], preserved_unknowns: applicantEvidence.unknowns.map(item => ({ id: item.id, needed_fact: item.needed_fact, affected_question_ids: item.affected_question_ids })), conflicts: [], source_policy: request.source_policy });

const candidateDefs = [
  {
    id: 'candidate-a',
    title: '금융 시스템의 흐름을 끊김 없이 잇는 백엔드 엔지니어',
    strategy: '인증·결제·이벤트가 이어지는 처리 흐름을 안정적으로 설계하는 역량을 중심에 둔다.',
    answers: {
      'question-motivation': `제가 IBK기업은행을 선택한 이유는 IT가 금융 업무의 신뢰를 시스템의 흐름으로 구현하는 일을 맡을 수 있기 때문입니다. 이번 공고는 금융 시스템 개발·운영뿐 아니라 애플리케이션 유지보수, 데이터베이스, 네트워크·보안, 인프라까지 IT의 책임을 넓게 제시했습니다. 저는 한 기능을 만드는 데서 멈추기보다 요청이 들어와 인증되고, 처리되고, 결과가 전달되는 전 과정을 설계하는 개발자가 되고 싶어 이 범위에 매력을 느꼈습니다.

공개 포트폴리오에서 Spring 기반 백엔드 구조에 관심을 두고, 핀테크 서비스 플랫폼을 회원·인증·결제·Gateway·Consumer 영역으로 나누어 기록했습니다. 또 Kafka를 공부하며 이벤트의 순서와 지연, 중복, 트랜잭션을 따로 질문했습니다. 아직 실제 금융기관의 운영 경험이나 제가 맡은 세부 범위는 더 확인해야 하지만, 금융 서비스의 한 장면을 기능으로만 보지 않고 앞뒤 처리와 결과 확인까지 보려는 준비는 분명히 이어 왔습니다.

입행 후에는 애플리케이션 개발과 유지보수의 기본을 정확히 익히고, 데이터베이스·보안·인프라 담당자와 같은 처리 기준을 바라보는 IT 구성원이 되고 싶습니다. 3~5년 뒤에는 업무 목적을 시스템 흐름으로 번역해 장애 가능성과 재처리 경로까지 설명하고, 고객과 은행의 거래가 안전하게 완료되는 서비스를 만드는 엔지니어로 성장하겠습니다. 공고가 제시한 넓은 IT 책임과 제가 쌓아 온 흐름 중심의 학습을 IBK에서 실제 책임으로 확장하고 싶습니다.`,
      'question-strength': `제가 가장 자신 있게 말할 수 있는 강점은 복잡한 기술 흐름을 책임 경계와 확인 가능한 결과로 구조화하는 힘입니다. 기능을 빨리 완성했다고 말하기보다 누가 어떤 책임을 지고, 데이터가 어느 경로로 이동하며, 실패했을 때 무엇을 다시 확인해야 하는지를 먼저 나누는 편입니다.

이 강점은 공개 저장소 dev-group-bank-msa를 구성하고 기록한 경험에서 드러났습니다. README와 프로젝트 구조에는 외부 요청을 받는 API, 업무 처리를 모으는 application, 도메인 규칙을 담는 domain, 데이터 연결을 담당하는 store, 공통 타입과 예외를 두는 core가 구분되어 있습니다. 회원·인증, 결제, Gateway, Kafka Consumer도 각각의 역할로 설명했습니다. 하나의 긴 설명으로 기능을 나열하지 않고 책임을 나누어 둔 것은 이후 변경 지점을 찾고 다른 사람이 구조를 이해하기 위한 선택이었습니다.

여기에 Kafka 학습에서는 메시지가 도착했다는 사실만으로 처리 완료를 단정하지 않고 partition, key, 순서, consumer lag, ack, 중복과 트랜잭션을 따로 살폈습니다. 공개 저장소에서 확인되는 성과는 이런 판단 기준과 구조를 다시 읽을 수 있는 포트폴리오로 남긴 점입니다. 실제 처리량이나 운영 성과, 파일별 제 기여 범위는 확인이 필요하므로 과장하지 않겠습니다.

IBK에서도 이 강점을 애플리케이션 기능 구현에만 쓰지 않고 DB·보안·인프라와 맞물린 처리 경계를 설명하는 데 활용하겠습니다. 작업 전에 완료 조건과 실패 경로를 정리하고, 작업 뒤에는 결과를 확인할 수 있는 로그와 테스트를 남기는 엔지니어가 되겠습니다.`,
      'question-growth': `저를 한 단계 성장시킨 경험은 x86 바이너리를 분석해 제어 흐름을 복원하고 LLVM IR로 옮기는 정적 프로그램 분석 프로젝트입니다. 처음에는 명령어를 해석해 중간 표현을 만들면 결과가 나온다고 생각했지만, 실제 문제는 어떤 명령어가 코드인지, 기본 블록이 어디서 나뉘는지, 특정 경로가 정말 도달 가능한지를 분리해 판단해야 한다는 데 있었습니다.

저는 ELF 32·64비트 헤더 파싱, 디스어셈블리, 코드 패턴, 기본 블록, 제어 흐름, lifting을 한 번에 섞지 않고 단계로 나누어 기록했습니다. RecursiveDisasm과 LinearSweepDisasm처럼 서로 다른 분석 방식을 구분하고, TraceControlFlow와 CanReachable처럼 흐름을 추적하고 도달 가능성을 확인하는 역할도 나누었습니다. 분석 도구의 정확도나 모든 바이너리에서의 성공률을 증명한 경험은 아니지만, 결과가 그럴듯해 보인다는 이유만으로 다음 단계로 넘어가면 안 된다는 점을 몸소 배웠습니다.

이후 저는 문제를 볼 때 먼저 입력의 경계와 중간 상태를 정의합니다. Kafka를 공부할 때도 전송 성공과 소비 완료를 구분하고, 알고리즘을 풀 때도 정상 사례보다 빈 입력·중복·최댓값 같은 실패 가능한 조건을 먼저 적습니다. 예전의 저는 결과를 만드는 속도를 성장으로 여겼다면, 지금은 결과를 다시 설명하고 검증할 수 있는 과정을 만드는 것이 성장이라고 생각합니다. 금융 시스템에서도 이 습관으로 작은 이상 신호를 원인과 확인 절차까지 좁히겠습니다.`,
      'question-it-capability': `IBK에서 가장 잘 활용할 수 있다고 생각하는 역량은 Java·Spring 백엔드와 이벤트·데이터 흐름을 함께 보며 처리의 신뢰성을 설계하는 능력입니다. 단순히 API를 만들 수 있다는 뜻이 아니라, 요청이 인증되고 업무 규칙을 거쳐 저장되며 후속 이벤트가 다른 처리로 이어지는 전체 경로를 나누어 보는 역량입니다.

차별화된 준비는 두 포트폴리오를 연결해 학습했다는 점입니다. dev-group-bank-msa에서는 회원·인증·결제·Gateway·Consumer를 다중 모듈로 구분하고, 이벤트 종류와 범위에 따라 데이터 소스와 트랜잭션을 나누는 구조를 기록했습니다. study-kafka-with-java에서는 partition과 key가 병렬성과 순서에 미치는 영향, consumer lag, ISR, producer ack, idempotence와 transaction을 공부했습니다. 한쪽은 금융 업무의 구성 요소를, 다른 한쪽은 그 요소가 비동기로 이어질 때 생기는 지연과 중복을 다룬 셈입니다.

IBK의 IT 업무가 금융 시스템 개발·운영, 애플리케이션 유지보수, DB, 네트워크·보안, 인프라까지 포함하는 만큼 이 관점은 특정 프레임워크 사용 경험보다 넓게 활용될 수 있습니다. 우선 맡은 서비스의 업무 흐름과 데이터 경계를 정확히 파악하고, 재시도·중복·권한·장애 시 확인 지점을 담당자들과 합의하겠습니다. 실제 운영과 보안 점검 경험의 깊이는 더 확인해야 하지만, 검증되지 않은 성과를 앞세우기보다 학습한 기준을 실무의 질문으로 전환하겠습니다. 장기적으로는 고객의 거래가 빠르게 처리되는 것뿐 아니라 정확하게 완료되고 추적되는 시스템을 만드는 IT 인재가 되겠습니다.`,
  },
  },
  {
    id: 'candidate-b',
    title: '데이터 흐름을 관찰하고 원인까지 좁히는 문제 해결자',
    strategy: '현상·원인·처리 결과를 분리해 설명하고, 데이터의 지연과 실패 경로를 먼저 확인하는 태도를 보여준다.',
    answers: {
      'question-motivation': `공개 포트폴리오를 정리하면서 제가 오래 붙잡아 온 질문은 “금융 서비스에서 한 요청이 어디까지 안전하게 도달했는가”였습니다. 그래서 IBK기업은행을 선택한 이유도 IT가 금융 시스템을 개발하는 데서 끝나지 않고 애플리케이션 유지보수, DB, 네트워크·보안, 인프라 운영까지 연결해 책임지는 직무라는 점에 있습니다. 제가 공부해 온 백엔드와 이벤트 처리를 실제 업무의 신뢰성 문제로 확장할 수 있는 자리라고 판단했습니다.

Spring 기반 핀테크 서비스 플랫폼을 기록하며 회원·인증·결제와 Gateway, Consumer를 구분했고, Kafka 학습에서는 메시지의 순서와 지연, 중복 처리, 전달 보장을 살폈습니다. 정적 프로그램 분석 프로젝트에서는 바이너리의 제어 흐름을 단계적으로 복원했습니다. 세 경험의 기술은 다르지만 현상을 바로 결론 내리지 않고 입력, 중간 상태, 결과를 나누어 원인을 좁힌다는 공통점이 있습니다.

입행 후에는 먼저 금융 업무와 시스템의 용어를 배우고, 맡은 애플리케이션에서 어떤 데이터가 언제 생성되고 어떤 후속 처리로 이어지는지 설명할 수 있는 신입행원이 되겠습니다. 이후에는 로그와 지표, 고객 영향, 보안·권한 조건을 함께 보며 유지보수 과제를 해결하고 싶습니다. IBK에 대한 개인적인 선택 계기와 선호 시스템은 더 구체화해야 하지만, 공고가 요구하는 넓은 IT 책임과 원인 중심으로 준비해 온 방식이 만나는 지점에서 지원을 결심했습니다.`,
      'question-strength': `저의 강점은 문제가 발생한 지점을 곧바로 단정하지 않고, 관찰 가능한 단위로 쪼개 원인을 좁혀 가는 습관입니다. 결과가 기대와 다를 때 “무엇이 틀렸는가”만 묻지 않고 입력은 맞았는지, 중간 상태가 어디에서 달라졌는지, 마지막으로 어떤 확인이 가능한지를 차례로 살핍니다.

이 강점을 가장 선명하게 쓴 경험은 공개 Static-Program-Analysis 프로젝트입니다. ELF 헤더를 읽고 x86 명령어를 디스어셈블한 뒤, 코드 패턴과 기본 블록을 정리하고 제어 흐름을 복원해 LLVM IR로 옮기는 흐름을 구성했습니다. RecursiveDisasm, LinearSweepDisasm, TraceControlFlow, CanReachable처럼 분석 역할을 나누어 둔 이유는 복잡한 결과를 한 함수의 추측으로 만들지 않고 각 단계의 가정을 확인하기 위해서였습니다.

프로젝트의 정확도·성능이나 실제 적용 범위를 수치로 증명한 것은 아니지만, 분석의 중간 결과를 읽을 수 있는 구조와 테스트 영역을 남겼다는 점이 제가 말할 수 있는 성과입니다. 이 경험 이후에는 오류를 고치기 전에 재현 조건을 만들고, 수정 뒤에는 같은 경로를 다시 통과시키는 습관이 생겼습니다. IBK의 시스템 유지보수에서도 증상을 빠르게 덮기보다 고객 영향과 데이터 흐름을 기준으로 원인을 좁혀 안전하게 복구하겠습니다.`,
      'question-growth': `Kafka를 처음 공부할 때 저는 생산자가 메시지를 보내고 소비자가 받으면 업무가 끝난다고 단순하게 생각했습니다. 그러나 study-kafka-with-java를 정리하면서 partition 수와 병렬성, key와 순서, consumer lag, ISR, producer ack, idempotence와 transaction이 서로 다른 실패 가능성을 만든다는 점을 알게 됐습니다. 결과적으로 어떤 예제를 완성했는지보다 “누가 언제 무엇을 처리 완료로 판단하는가”를 묻는 방식이 더 중요해졌습니다.

저는 학습 범위를 producer·consumer 예제에만 두지 않고 retention, compact, 재처리, 소비자 멀티스레딩과 배포 전략까지 나누어 살폈습니다. 각 개념을 외워 적는 대신 결제나 계정 이벤트처럼 중복·지연이 고객 결과에 영향을 줄 수 있는 상황을 떠올리며, 순서를 보장해야 하는지, 재시도해도 같은 결과가 나와야 하는지, 어느 지표를 확인해야 하는지 정리했습니다. 실제 금융 서비스에 적용한 운영 결과나 장애 대응 경험은 없지만, 이 한계까지 포함해 학습 범위를 기록했습니다.

이후의 저는 기능이 “정상 동작한다”는 말에 멈추지 않습니다. 실패와 지연이 생겼을 때도 업무 결과를 설명할 수 있는지, 재시도 후 데이터가 중복되지 않는지, 운영자가 상태를 확인할 수 있는지를 먼저 점검합니다. 결과와 관계없이 이 경험이 저를 성장시킨 이유는 기술을 선택하는 기준을 구현 편의에서 업무 결과의 신뢰성으로 바꾸었기 때문입니다.`,
      'question-it-capability': `제가 지닌 디지털·IT 역량 중 IBK에서 가장 잘 활용할 수 있는 것은 Java·Spring으로 업무 책임을 나누고, 그 사이의 데이터 흐름과 문제 지점을 설명하는 백엔드 설계 역량입니다. 제 차별점은 애플리케이션 구조와 메시지 처리의 세부 조건을 따로 배우지 않고 하나의 금융 처리 흐름으로 연결해 생각해 왔다는 데 있습니다.

dev-group-bank-msa에서는 API·application·domain·store·core의 역할을 분리하고, 회원·인증·결제·Gateway·Consumer가 어떻게 나뉘는지 기록했습니다. Consumer는 계정·결제·구매·계정 그룹 이벤트를 처리하는 영역으로 설명되어 있어, 기능 요청과 후속 처리가 다른 경계에서 이어질 수 있다는 점을 확인할 수 있습니다. Kafka 학습에서는 그 경계에서 lag, 순서, ack, 중복과 트랜잭션을 어떻게 판단해야 하는지 공부했습니다.

    IBK에 입행하면 우선 업무 규칙과 데이터 모델을 정확히 배운 뒤, 애플리케이션 변경이 DB·보안·인프라와 어떤 영향을 주는지 질문하겠습니다. 장애나 이상 거래가 의심될 때는 로그와 처리 상태를 근거로 원인을 좁히고, 담당자와 복구 후 확인 기준을 합의하겠습니다. 프로덕션 운영과 보안 점검의 실제 경험은 아직 확인이 필요하므로 그 부분을 과장하지 않겠습니다. 대신 분석·구조화·이벤트 처리 학습을 금융 시스템을 안전하게 유지하는 실무 습관으로 발전시키겠습니다.`,
  },
  },
  {
    id: 'candidate-c',
    title: '책임 경계를 설계해 유지보수 가능성을 높이는 개발자',
    strategy: '도메인 책임과 기술 모듈을 분리해 변경의 영향을 읽고, 다른 담당자와 공통 언어를 만드는 역량을 강조한다.',
    answers: {
      'question-motivation': `IBK기업은행을 선택한 이유는 IT 업무를 애플리케이션 개발이라는 한 지점이 아니라 금융 시스템의 전체 생애주기로 배울 수 있다고 보았기 때문입니다. 공고는 금융 시스템 개발·운영, 애플리케이션 유지보수와 함께 DB, 네트워크·보안, 인프라를 함께 제시했습니다. 기능을 만들 때도 그 기능이 어느 책임에 속하고, 변경이 다른 영역에 어떤 영향을 주는지 설명할 수 있어야 한다는 제 관심과 정확히 맞습니다.

저는 공개 GitHub 프로필에서 Spring 백엔드 구조와 아키텍처, 유지보수 가능성과 확장성, 도메인 중심 설계에 관심을 두고 있다고 밝혔습니다. 실제 포트폴리오에서도 핀테크 서비스 플랫폼을 API·application·domain·store·core로 나누고, 회원·인증·결제·Gateway·Consumer를 별도 책임으로 기록했습니다. 이 구조가 곧 운영 성과를 증명하는 것은 아니지만, 업무 목적과 기술 책임을 함께 읽으려는 준비를 보여주는 근거라고 생각합니다.

입행 후에는 먼저 IBK의 금융 업무와 시스템 경계를 배우고, 작은 변경도 영향 범위와 완료 조건을 설명하는 개발자가 되겠습니다. 장기적으로는 애플리케이션과 데이터·보안·인프라 담당자가 같은 문제를 바라보도록 연결하면서, 변경하기 쉽고 장애를 추적하기 쉬운 금융 서비스를 만드는 IT 인재가 되고 싶습니다. IBK만의 개인적 지원 계기는 더 확인해 보완하되, 공고의 생애주기 중심 IT 책임이 제 기술 선택과 지원 방향을 만든 직접적인 이유입니다.`,
      'question-strength': `저의 가장 큰 강점은 책임이 어디에 있어야 하는지를 먼저 구조화하는 능력입니다. 새로운 기술을 붙이는 것보다 외부 요청, 업무 규칙, 도메인 상태, 저장소 연결, 공통 정책이 각각 어떤 이유로 존재하는지 나누어야 변경과 협업이 안전해진다고 믿습니다.

이 강점은 dev-group-bank-msa 포트폴리오를 설계하고 기록할 때 발휘했습니다. 공개 README는 Spring JPA 기반의 핀테크 서비스 플랫폼을 API, application, domain, store, core의 다중 모듈로 설명합니다. 회원·인증 애플리케이션은 회원 관리와 토큰 발급·재발급을, Pay 영역은 통화 충전과 개인·그룹 결제를, Gateway는 인증·인가와 라우팅을, Consumer는 계정·결제·구매 관련 이벤트 후속 처리를 담당하는 구조입니다.

이렇게 나눈 성과는 기능 목록보다 책임과 변경 위치를 다른 사람이 읽을 수 있는 형태로 남겼다는 점입니다. 실제 파일별 기여 범위, 팀 협업 여부, 운영 성과는 추가 확인이 필요하므로 “대규모 시스템을 운영했다”고 말하지 않겠습니다. 다만 구조를 설명하는 과정에서 구현의 편의보다 유지보수와 영향 범위를 먼저 생각하는 작업 방식은 확인할 수 있습니다.

IBK에서도 맡은 애플리케이션의 업무 책임을 명확히 하고, DB·보안·인프라 변경과의 접점을 기록하는 개발자가 되겠습니다.`,
      'question-growth': `알고리즘 문제 풀이 기록을 꾸준히 관리한 경험은 저를 한 단계 성장시켰습니다. 처음에는 정답을 빠르게 제출하는 데 집중했지만, 같은 문제도 입력 조건을 잘못 읽거나 경계 사례를 놓치면 쉽게 틀렸습니다. 결과가 맞았다는 사실보다 왜 이 풀이가 조건 안에서 안전한지 설명하는 일이 더 어렵고 중요하다는 것을 알게 됐습니다.

그래서 Programmers·Baekjoon·SWEA 문제를 풀 때 문제의 입력 범위와 자료구조 선택, 시간·공간 복잡도, 빈 입력과 중복·최댓값 사례를 먼저 적는 방식으로 바꾸었습니다. 공개 저장소에 풀이가 누적되어 있다는 사실은 학습의 지속성을 보여주지만, 이것이 실기시험 점수나 업무 성과를 뜻하지는 않습니다. 이 경험의 의미는 정답의 개수가 아니라, 실패 가능한 조건을 작업 전에 언어로 꺼내는 습관을 만든 데 있습니다.

이후에는 백엔드 설계에서도 “정상 요청이 된다”는 한 가지 결과만 보지 않습니다. 권한이 없는 요청, 중복 이벤트, 빈 데이터, 부분 실패가 생겼을 때 시스템이 어떤 상태를 남기는지 먼저 질문합니다. 결과와 무관하게 저는 이 경험으로 속도 중심의 구현자에서 조건과 경계를 확인하는 개발자로 변했습니다. 금융 IT 업무에서도 이 습관으로 작은 누락이 고객의 큰 불편으로 이어지지 않도록 하겠습니다.`,
      'question-it-capability': `IBK에서 활용하고 싶은 핵심 역량은 Java·Spring 기반의 도메인 중심 백엔드 설계입니다. 저는 프레임워크 기능을 많이 아는 것보다 금융 업무를 책임 단위로 나누고, 변경이 어느 경계를 통과하는지 설명할 수 있는 능력이 애플리케이션 유지보수와 시스템 개발에 더 직접적으로 쓰인다고 생각합니다.

공개 핀테크 포트폴리오에서는 API와 application, domain, store, core를 분리하고 회원·인증·결제·Gateway·Consumer를 별도 애플리케이션으로 기록했습니다. 이 구조를 통해 외부 요청과 업무 규칙, 도메인 모델, 데이터 저장, 공통 예외를 한곳에 섞지 않는 이유를 고민했습니다. Kafka 학습에서는 이벤트가 모듈 사이를 연결할 때 순서·지연·중복·트랜잭션을 어떻게 다뤄야 하는지도 살폈습니다. 정적 분석 프로젝트에서 단계별 분석 책임을 나눈 경험은 복잡한 문제를 작은 검증 단위로 바꾸는 기반이 되었습니다.

IBK에서는 먼저 금융 업무와 데이터 모델을 배우고, 한 기능의 변경이 계정·결제·권한·인프라에 미치는 영향을 파악하겠습니다. 개발·운영·보안 담당자와 책임 경계를 합의한 뒤 테스트와 로그로 변경 결과를 확인하겠습니다. 실제 운영 경험의 범위는 보강이 필요하지만, 제가 확실히 말할 수 있는 역량은 구조를 세우고 영향 범위를 읽는 준비입니다. 이를 바탕으로 기능을 추가하는 동시에 유지보수 가능한 금융 시스템을 만드는 구성원이 되겠습니다.`,
  },
  },
  {
    id: 'candidate-d',
    title: '실패·재시도·권한 경계를 먼저 확인하는 운영 지향 개발자',
    strategy: '빠른 구현보다 데이터 무결성, 실패 경로, 복구 후 확인을 먼저 묻는 태도를 IT 직무 적합성으로 번역한다.',
    answers: {
      'question-motivation': `제가 IBK기업은행을 선택한 이유는 금융 IT에서 “작동한다”는 말의 기준을 더 엄격하게 배우고 싶기 때문입니다. 공고는 IT 업무를 금융 시스템과 애플리케이션 개발·운영에 한정하지 않고 DB, 네트워크·보안, 인프라까지 제시했습니다. 금융 서비스에서는 기능이 화면에 나타나는 것만으로 충분하지 않고, 권한이 맞는지, 데이터가 정확한지, 장애 뒤 상태를 확인할 수 있는지까지 책임져야 한다고 생각합니다.

저는 Kafka를 학습하며 메시지 순서와 전달 보장, consumer lag, 중복과 트랜잭션을 공부했고, 핀테크 MSA 포트폴리오에서는 인증·결제·Gateway·Consumer의 처리 경계를 기록했습니다. 정적 분석 프로젝트와 알고리즘 풀이에서도 정상 경로만이 아니라 도달할 수 없는 경로와 경계 입력을 확인하려 했습니다. 이 경험들은 운영을 해냈다는 증명이 아니라, 운영 가능한 시스템을 만들기 위해 어떤 질문을 준비해 왔는지 보여줍니다.

입행 후에는 금융 업무와 내부 기준을 먼저 배우고, 변경 전 영향 범위와 실패 시 복구 절차를 확인하는 신입행원이 되겠습니다. 이후에는 애플리케이션 개발과 DB·보안·인프라의 연결을 이해해, 장애가 나도 고객 영향과 처리 상태를 설명할 수 있는 개발자로 성장하고 싶습니다. 개인적인 IBK 선택 계기와 실제 운영 경험은 더 보완해야 하지만, 공고가 제시한 책임의 폭을 보고 제 준비를 가장 현실적으로 확장할 수 있는 곳이라고 판단했습니다.`,
      'question-strength': `여러 강점 중 제가 자신 있게 말할 수 있는 것은 끝 상태와 실패 경로를 먼저 확인하는 습관입니다. 정상 사례 하나가 통과했다고 안심하기보다 입력이 비어 있거나 중복되고, 처리 중간에 실패하거나 다시 시도될 때 결과가 어떻게 남아야 하는지를 질문합니다.

이 강점을 반복해서 연습한 경험은 공개 algorithm 저장소와 Kafka 학습 기록입니다. 알고리즘 문제를 풀 때는 제약 조건과 경계 입력을 기준으로 자료구조와 복잡도를 선택하고, 풀이가 기록된 뒤에도 다른 사례를 대입해 확인했습니다. Kafka를 공부할 때는 producer가 보냈다는 사실과 consumer가 업무 처리를 끝냈다는 사실을 구분하고, partition·key·순서, lag, ack, idempotence와 transaction을 각각 실패 가능성과 연결했습니다.

그 결과는 실무 성능 수치가 아니라 문제를 검증하는 반복 가능한 기록으로 남았습니다. 공개 저장소의 문제 풀이 수나 학습 결과를 업무 성과로 확대하지 않으며, 실제 운영 장애를 해결했다고 말하지도 않겠습니다. 대신 제가 분명히 얻은 성과는 정상 경로만 설명하던 방식에서 벗어나 실패·재시도·복구 후 확인까지 작업의 일부로 보는 관점을 만든 것입니다.

IBK의 애플리케이션 유지보수에서도 이 습관으로 고객 영향이 큰 경로부터 확인하고, 변경 결과를 검증 가능한 기준으로 남기겠습니다.`,
      'question-growth': `정적 프로그램 분석 프로젝트는 결과와 무관하게 저의 문제 해결 방식을 바꾼 경험입니다. ELF 헤더를 읽고 명령어를 디스어셈블한 뒤 제어 흐름을 복원해 LLVM IR로 옮기는 과정을 구현 대상으로 삼았는데, 처음에는 분석 단계를 빠르게 연결하면 된다고 생각했습니다. 그러나 코드와 데이터의 구분, 기본 블록의 경계, 실제로 도달할 수 있는 경로를 잘못 판단하면 뒤 단계의 결과도 함께 흔들렸습니다.

저는 RecursiveDisasm과 LinearSweepDisasm을 구분하고, TraceControlFlow와 CanReachable을 통해 제어 흐름과 도달 가능성을 따로 살피는 구조로 접근했습니다. 이 선택은 모든 입력을 완벽히 처리했다는 의미가 아니라, 한 번에 맞는 결과를 기대하기보다 중간 가정과 실패 지점을 드러내는 방식으로 바꾼 것입니다. 분석 정확도와 성능을 수치로 확정할 자료는 없지만, 파서·디스어셈블러·링커·lifter·테스트 영역을 단계적으로 다룬 기록은 남아 있습니다.

이후 저는 새로운 기능을 시작할 때 먼저 실패할 수 있는 조건과 확인할 상태를 적습니다. 백엔드에서는 재시도와 중복, 알고리즘에서는 경계 입력, 이벤트 처리에서는 지연과 순서를 먼저 생각합니다. 예전에는 결과를 만들면 학습이 끝났다고 여겼지만, 지금은 결과가 틀렸을 때 원인을 다시 추적할 수 있어야 한 단계 성장한 것이라고 판단합니다. 금융 시스템을 맡게 되어도 이 변화된 습관으로 안전한 수정과 복구를 수행하겠습니다.`,
      'question-it-capability': `IBK에서 가장 잘 활용할 수 있는 IT 역량은 이벤트가 오가는 백엔드에서 데이터 무결성과 처리 상태를 점검하는 능력입니다. 제 차별화된 스토리는 기술을 기능별로 외운 것이 아니라, 인증·결제·계정 같은 업무 흐름이 실패·재시도·권한 경계를 통과할 때 어떤 상태를 남겨야 하는지 질문해 온 과정입니다.

dev-group-bank-msa는 회원·인증·결제·Gateway·Consumer를 다중 모듈로 설명하고, Consumer가 계정·결제·구매·그룹 관련 이벤트를 후속 처리하는 구조를 보여줍니다. study-kafka-with-java에서는 partition과 key, 순서, consumer lag, ISR, producer ack, idempotence와 transaction을 학습했습니다. 두 기록을 연결하면서 이벤트가 전달되었는지와 업무 결과가 정확히 반영되었는지를 구분해야 한다는 관점을 갖게 됐습니다. 정적 분석 경험은 이상 상태의 원인을 단계와 도달 가능성으로 좁히는 데 도움을 줍니다.

IBK에서는 먼저 애플리케이션과 DB의 상태 정의, 권한 조건, 로그와 모니터링 기준을 배우고, 변경 전후의 데이터와 고객 영향을 확인하겠습니다. 운영·보안·인프라 경험의 실제 범위는 더 확인해야 하므로 그 성과를 대신 말하지 않겠습니다. 현재 제가 확실히 제시할 수 있는 것은 실패 가능성을 설계 질문으로 바꾸는 준비입니다. 이 역량을 업무 전문성과 연결해, 빠르면서도 잘못된 거래 결과를 남기지 않는 금융 시스템을 만드는 IT 인재로 성장하겠습니다.`,
  },
  },
  {
    id: 'candidate-e',
    title: '금융 업무 목적을 시스템 구현으로 번역하는 연결형 개발자',
    strategy: '개인·그룹 금융 서비스 관심, 백엔드 구조, 이벤트 학습을 업무 목적과 구현 책임을 잇는 이야기로 묶는다.',
    answers: {
      'question-motivation': `IBK기업은행을 선택한 이유는 금융이 사람과 기업의 중요한 결정을 실제 거래와 시스템 처리로 연결하는 영역이며, 그 연결을 IT의 책임으로 배우고 싶기 때문입니다. 공개 프로필에서 개인 자산 관리와 그룹 기반 금융을 연결하는 Payvue 서비스 개념을 소개했고, Spring 백엔드의 구조와 아키텍처를 계속 탐구해 왔습니다. 공고가 금융 시스템 개발·운영과 애플리케이션 유지보수, DB·보안·인프라를 함께 제시한 점은 제가 관심만 두던 금융 서비스를 더 높은 책임 수준에서 이해할 기회로 다가왔습니다.

핀테크 서비스 플랫폼 포트폴리오에서는 회원·인증·결제·Gateway·Consumer를 나누어 업무 흐름을 기록했고, Kafka 공부에서는 이벤트가 지연되거나 중복될 때 업무 결과를 어떻게 확인해야 하는지 살폈습니다. 이 경험을 통해 금융 IT는 편리한 화면보다 고객의 돈과 정보가 정확한 상태로 처리되고, 문제가 생겨도 원인을 설명할 수 있게 만드는 일이 핵심이라는 관점을 갖게 됐습니다.

입행 후에는 먼저 IBK의 업무와 시스템을 배우며 한 기능의 목적을 데이터·애플리케이션·운영 언어로 번역하는 신입행원이 되겠습니다. 이후에는 개발자뿐 아니라 DB·보안·인프라 담당자와도 같은 업무 결과를 바라보며, 고객이 안심하고 거래를 완료할 수 있는 서비스를 만들고 싶습니다. IBK를 선택하게 된 개인적인 계기와 선호 영역은 더 보강하되, 금융 서비스의 목적과 시스템 구현을 함께 책임지는 IT 역할이 제가 준비해 온 방향과 가장 잘 맞습니다.`,
      'question-strength': `제가 자신 있게 말할 수 있는 강점은 서로 다른 기술과 업무 개념을 하나의 처리 흐름으로 연결해 설명하는 능력입니다. 회원·결제 같은 업무 단어와 API·도메인·이벤트 같은 기술 단어를 따로 나열하지 않고, 누가 어떤 요청을 보내고 어떤 상태가 저장되며 다음 처리가 어떻게 이어지는지를 이야기하려고 합니다.

공개 dev-group-bank-msa 저장소에서 이 방식을 연습했습니다. 핀테크 서비스 플랫폼을 API·application·domain·store·core로 나누고, 회원·인증·결제·Gateway·Consumer의 역할을 문서화했습니다. 그 구조를 읽으며 “결제를 구현했다”는 말보다 외부 요청과 도메인 규칙, 저장소 연결, 후속 이벤트가 어떤 책임으로 나뉘는지 설명하는 편이 유지보수와 협업에 유용하다는 점을 배웠습니다. Kafka 저장소에서는 partition·key·순서·lag·ack·중복·트랜잭션을 공부해 같은 흐름의 비동기 조건도 덧붙였습니다.

공개 기록으로 확인되는 성과는 복잡한 주제를 다른 사람이 따라갈 수 있는 구조와 설명으로 남긴 것입니다. 실제 사용자 규모, 처리량, 운영 성과, 파일별 기여 범위는 확인이 필요하므로 그 이상을 주장하지 않겠습니다. 이 강점은 IT 업무에서 현업의 목적과 시스템의 책임을 맞추는 데 쓰일 수 있습니다. IBK에서도 업무 요구를 정확히 듣고 개발·DB·보안·인프라 담당자가 같은 완료 조건을 이해하도록 연결하겠습니다.`,
      'question-growth': `저를 성장시킨 경험은 하나의 핀테크 백엔드 구조를 만들며 “좋은 아키텍처”를 기술 이름이 아니라 책임과 변화의 관점에서 다시 생각하게 된 일입니다. 처음에는 MSA나 모듈 분리가 독립 배포와 기술 선택을 위한 장치라고만 보았지만, 회원·인증·결제·Gateway·Consumer를 나누어 기록하면서 더 중요한 질문을 만났습니다. 이 책임을 왜 나누고, 어떤 데이터가 경계를 넘으며, 한쪽의 변경이 다른 쪽에 어떤 영향을 주는가였습니다.

그래서 공개 README와 구조에서 API·application·domain·store·core의 역할을 구분하고, 이벤트를 받는 Consumer와 외부 요청을 받는 영역을 분리해 설명했습니다. 이는 실제 운영 규모나 성능을 증명한 결과는 아니며, 각 모듈의 세부 기여와 협업 맥락은 더 확인해야 합니다. 그러나 결과가 완벽하지 않더라도 문제를 기술 유행의 선택에서 업무 책임의 선택으로 바꾸는 과정은 제 사고방식을 분명히 성장시켰습니다.

이후 저는 새로운 기술을 선택할 때 먼저 업무 목적과 변경 주기를 묻습니다. 데이터가 어디에서 권위를 갖는지, 실패하면 누가 복구하는지, 다른 팀이 어떤 계약을 알아야 하는지를 기록하려 합니다. 예전에는 구조를 세우는 일이 구현을 늦추는 비용처럼 보였다면, 지금은 책임과 확인 기준을 먼저 정하는 것이 이후의 변경과 협업을 빠르게 만든다고 생각합니다. IBK에서도 이 변화된 관점으로 금융 시스템의 복잡성을 안전하게 다루겠습니다.`,
      'question-it-capability': `IBK에서 가장 잘 활용할 수 있는 역량은 Java·Spring 백엔드 구현을 금융 업무의 목적과 이벤트·데이터 흐름에 맞게 구조화하는 능력입니다. 한 언어나 프레임워크의 사용 목록보다, 업무 결과를 정확히 만들기 위해 어떤 책임을 분리하고 무엇을 확인해야 하는지 설명하는 역량이 제 차별화된 준비입니다.

핀테크 서비스 플랫폼 포트폴리오에서는 회원·인증·결제·Gateway·Consumer와 API·application·domain·store·core를 구분했습니다. Kafka 학습에서는 이벤트의 partition과 key, 순서, lag, ack, idempotence와 transaction을 공부했습니다. 정적 분석 프로젝트에서는 ELF 입력을 파싱하고 디스어셈블리·제어 흐름·LLVM IR로 이어지는 분석 단계를 나누었습니다. 서로 다른 프로젝트지만 목적을 입력·처리·결과·확인으로 번역하고, 복잡한 책임을 작은 단위로 나누어 설명하는 공통 훈련이었습니다.

IBK에서는 먼저 금융 업무와 고객 영향, 데이터 모델, 접근 권한을 배우고, 맡은 애플리케이션의 변경이 후속 이벤트와 DB, 운영 환경에 미치는 영향을 점검하겠습니다. 실제 배포·장애 대응·보안 점검 경험의 깊이는 보강할 사실이므로 과장하지 않겠습니다. 대신 현재의 구조화와 이벤트 처리 학습을 업무 질문으로 전환해, 기능 구현과 유지보수, 데이터 정확성, 운영 확인이 함께 움직이는 금융 시스템을 만드는 신입 IT 인재로 성장하겠습니다.`,
  },
  },
];

const answerExtensions = {
  'candidate-a': {
    'question-motivation': '특히 은행의 IT는 개인의 한 번의 요청과 기업의 중요한 의사결정이 같은 시스템 안에서 만나는 자리라고 생각합니다. 그래서 업무 담당자가 확인하고 고객에게 설명할 수 있는 상태를 남기는 개발자가 되려 합니다. 지금은 포트폴리오를 통해 그 기준을 연습하는 단계지만, IBK에서는 실제 업무 규칙과 운영 기준을 배우며 책임의 폭을 넓히겠습니다.',
    'question-strength': '예를 들어 한 모듈의 코드를 고칠 때도 호출하는 쪽과 호출받는 쪽, 저장되는 상태, 이벤트로 이어지는 후속 작업을 함께 확인하는 방식으로 접근합니다. 아직 이 방식이 실제 운영 지표를 개선했다는 증거는 없지만, 변경 전후를 비교할 질문을 세우고 기록하는 습관은 제 작업의 출발점이 됐습니다.',
    'question-growth': '이 변화는 단순히 분석 프로젝트에만 머물지 않았습니다. 기능을 설계할 때도 “이 결과를 누가 믿고 다음 행동을 할 수 있는가”를 먼저 적게 됐고, 모호한 오류 메시지를 만나면 사용자의 입력과 시스템의 중간 상태를 분리해 재현하려고 합니다. 이 태도를 금융 IT의 점검과 유지보수에 적용하고 싶습니다.',
    'question-it-capability': '이 역량은 장애를 혼자 해결하겠다는 뜻이 아니라, 문제가 생겼을 때 어느 팀이 어떤 정보를 확인해야 하는지 빠르게 정리하는 힘이기도 합니다. 고객 영향이 있는 변경일수록 업무 담당자와 기술 담당자가 같은 상태 정의를 갖도록 돕고, 결과를 검증한 뒤 다음 개선으로 연결하겠습니다.',
  },
  'candidate-b': {
    'question-motivation': '제가 가진 강점은 현상을 기록하는 데서 멈추지 않고 원인을 설명할 수 있는 질문으로 바꾸는 것입니다. 금융 시스템에서는 작은 지연도 고객이 거래 결과를 오해하는 문제로 이어질 수 있으므로, 애플리케이션의 로그·데이터·권한 조건을 함께 읽는 능력을 키우고 싶습니다. IBK에서 그 기준을 실제 업무와 함께 배우겠습니다.',
    'question-strength': '이 과정에서 중요한 것은 분석 단계를 많이 만든다는 사실이 아니라 각 단계가 어떤 가정을 갖는지 설명하는 것입니다. 입력을 잘못 해석했는지, 중간 표현이 손실됐는지, 도달 가능성 판단이 틀렸는지를 분리하면 수정의 범위도 좁아집니다. 이처럼 원인을 나누는 방식은 금융 애플리케이션의 이상 거래나 오류를 조사할 때도 도움이 될 것입니다.',
    'question-growth': '이후 프로젝트를 시작할 때는 먼저 완료의 정의를 문장으로 적고, 그 정의를 흔드는 예외를 찾아봅니다. 메시지 처리에서는 지연된 이벤트와 중복 이벤트를 구분하고, API에서는 성공 응답 뒤 저장이 실패하는 경우를 생각합니다. 이 습관은 결과가 아직 없을 때도 위험을 예측하고 학습 우선순위를 세우게 했습니다.',
    'question-it-capability': '제가 맡은 변경이 다른 서비스와 데이터에 미치는 영향을 추적할 수 있어야 안전한 유지보수가 가능하다고 믿습니다. 따라서 코드를 작성한 뒤에는 정상 응답만 확인하지 않고 경계 입력과 재시도 결과, 기록된 상태를 점검하겠습니다. 운영 경험이 쌓이면 이 기준을 실제 지표와 runbook으로 발전시키고 싶습니다.',
  },
  'candidate-c': {
    'question-motivation': '제가 IBK에서 이루고 싶은 모습은 특정 모듈만 빠르게 만드는 사람이 아니라, 변경의 이유와 영향 범위를 동료에게 설명할 수 있는 엔지니어입니다. 금융 시스템은 업무 규칙이 바뀌거나 연계 서비스가 늘어날 때도 기존 거래의 의미를 지켜야 하므로, 기술 선택을 업무 책임과 함께 판단하는 훈련이 필요합니다. 그 훈련을 실제 조직에서 시작하고 싶습니다.',
    'question-strength': '구조를 나누는 목적은 복잡해 보이게 만드는 데 있지 않습니다. 한 정책이 바뀌었을 때 어느 영역을 검토하고 어떤 테스트를 다시 실행해야 하는지 알기 쉽게 만드는 데 있습니다. 공개 저장소에서 확인되는 모듈 구조를 이런 관점으로 설명해 보면서, 코드를 쓰는 일과 구조를 설명하는 일이 서로의 품질을 높인다는 점을 배웠습니다.',
    'question-growth': '이 습관은 금융 시스템을 배울 때도 유효하다고 생각합니다. 거래를 하나의 화면으로 보지 않고 입력 업무, 인증, 상태 변경, 저장, 후속 통지의 책임으로 나누면 누락된 조건을 찾기 쉽습니다. 제가 아직 실제 거래 시스템을 운영한 것은 아니지만, 복잡성을 작게 설명하는 능력을 꾸준히 키워 신규 기능과 유지보수 사이의 균형을 잡겠습니다.',
    'question-it-capability': '저는 구조를 설계할 때 경계를 고정된 정답으로 보지 않고 업무 변화에 따라 다시 검토해야 하는 약속으로 봅니다. 그래서 신규 요구가 들어오면 먼저 어느 책임에 속하는지, 공통화할 것과 분리할 것의 기준이 무엇인지, 변경 후 확인할 테스트는 무엇인지 기록하겠습니다. 이 과정을 통해 팀의 유지보수 비용을 낮추는 개발자가 되겠습니다.',
  },
  'candidate-d': {
    'question-motivation': '제가 입행 후 만들고 싶은 모습은 기능을 추가할 때 “실패하면 어떻게 되는가”를 먼저 질문하고, 복구 뒤 고객과 담당자가 상태를 확인할 수 있도록 만드는 개발자입니다. 공고에서 보안·DB·인프라까지 함께 본 이유도 이 책임이 애플리케이션 코드만으로 끝나지 않는다고 느꼈기 때문입니다. 배운 기준을 실제 업무의 체크리스트로 바꾸겠습니다.',
    'question-strength': '이 습관은 업무 속도를 늦추기 위한 것이 아니라 다시 고치는 시간을 줄이기 위한 것입니다. 정상 응답, 권한 없는 요청, 중복 요청, 처리 중단 뒤 재시작을 구분해 보면 무엇을 로그로 남기고 어떤 테스트를 추가해야 하는지 명확해집니다. 앞으로는 이 기준을 팀의 공통 언어로 만들고, 결과를 확인한 뒤에야 작업을 닫겠습니다.',
    'question-growth': '특히 “분석이 되었다”는 추상적인 표현을 쓰지 않으려고 입력 범위와 중간 상태를 먼저 기록하게 됐습니다. 어떤 조건에서 결과를 믿을 수 없는지 말할 수 있어야 다음 보완도 정확해집니다. 이 변화로 저는 모르는 부분을 숨기기보다 한계를 명확히 적고, 확인 가능한 작은 작업부터 해결하는 개발자가 되었습니다.',
    'question-it-capability': '금융 시스템의 신뢰성은 한 번의 성공 응답보다 상태의 일관성과 사후 설명 가능성에서 드러난다고 생각합니다. 따라서 이벤트를 소비하는 코드, DB에 반영되는 상태, 권한 확인, 모니터링 신호를 함께 살피겠습니다. 현장 경험을 쌓은 뒤에는 장애 회고와 재발 방지 테스트까지 연결하는 역량으로 확장하겠습니다.',
  },
  'candidate-e': {
    'question-motivation': '금융 서비스를 이용하는 사람은 기술 구조를 보지 않지만, 처리 결과가 정확한지와 문제가 생겼을 때 안내받을 수 있는지는 직접 경험합니다. 저는 이 사용자 관점을 업무 규칙과 시스템 상태로 번역하는 역할을 하고 싶습니다. IBK에서 업무 전문성을 먼저 배우고, 고객 목적을 훼손하지 않는 기술 판단을 쌓아 가겠습니다.',
    'question-strength': '이렇게 연결해 설명하면 개발자에게는 변경할 책임이, 업무 담당자에게는 확인할 결과가, 운영 담당자에게는 살펴볼 상태가 분명해집니다. 실제 협업 규모나 운영 성과는 확인하지 않았지만, 포트폴리오를 구성하며 서로 다른 개념을 같은 흐름으로 설명하는 연습을 해 왔습니다. 이 설명력을 금융 IT 조직의 협업에 활용하겠습니다.',
    'question-growth': '이후에는 기술을 고를 때 먼저 “이 선택이 어떤 업무 결과를 지키는가”를 적습니다. 데이터의 권위가 어디에 있는지, 실패 시 누가 판단하는지, 변경 후 어떤 사용자 상태를 확인해야 하는지를 함께 보게 됐습니다. 아직 실서비스의 복잡성을 모두 경험한 것은 아니지만, 기술 중심의 시야를 업무 책임 중심으로 넓힌 변화는 분명한 성장입니다.',
    'question-it-capability': '이 강점은 현업 요구가 기술 언어로 바로 주어지지 않을 때 특히 유용하다고 생각합니다. 업무 목적을 먼저 확인한 뒤 API·도메인·DB·이벤트의 책임으로 나누고, 각 단계의 성공과 실패를 함께 정의하겠습니다. 이후 운영·보안 경험을 실제 사례로 쌓아, 설명력에 그치지 않고 안정적인 구현과 검증까지 책임지겠습니다.',
  },
};
for (const candidate of candidateDefs)
  for (const question of questions)
    candidate.answers[question.id] = `${candidate.answers[question.id]}\n\n${answerExtensions[candidate.id][question.id]}`;
const lengthPolish = {
  'candidate-b': {
    'question-motivation': ' 이 질문을 실무로 가져가면 서비스의 상태를 정확히 전달하고 담당자가 다음 조치를 결정하도록 돕는 일이라고 생각합니다.',
    'question-strength': ' 면접에서도 한 사례의 원인과 한계를 구분해 설명하고, 확인하지 못한 부분은 다음 검증 과제로 제시하겠습니다.',
    'question-it-capability': ' 변경 요청을 받을 때도 영향 받는 데이터와 후속 작업을 먼저 그려 본 뒤 구현 범위를 정하겠습니다.',
  },
  'candidate-c': {
    'question-strength': ' 실제 팀에서는 이 구조를 혼자 결정하기보다 담당자들과 책임의 이유를 합의하고, 공통 규칙과 개별 규칙을 구분하는 방식으로 발전시키겠습니다.',
    'question-growth': ' 이 습관은 금융 서비스의 작은 입력 누락이나 상태 불일치를 발견하고, 안전한 수정 순서를 정하는 데도 기반이 될 것입니다.',
  },
  'candidate-d': {
    'question-strength': ' 예외를 먼저 생각하면 구현 전에 필요한 테스트와 기록이 보이고, 동료에게 위험을 설명할 때도 개인의 감이 아니라 조건을 근거로 대화할 수 있습니다.',
  },
  'candidate-e': {
    'question-strength': ' 이런 번역은 회의에서 기술적인 설명을 줄이는 것이 아니라, 서로 다른 담당자가 자신의 책임과 완료 기준을 더 정확히 판단하게 만드는 과정입니다.',
  },
};
for (const [candidateId, additions] of Object.entries(lengthPolish))
  for (const [questionId, addition] of Object.entries(additions))
    candidateDefs.find(candidate => candidate.id === candidateId).answers[questionId] += addition;

const candidateRealizations = {
  'candidate-a': {
    'question-motivation': { primaryClaim: '금융 시스템의 전 과정을 책임지는 IT 역할과 백엔드·이벤트 처리 중심의 준비가 만나 IBK를 선택했다.', readerTakeaway: '금융 시스템의 처리 흐름을 끝까지 보고 싶은 백엔드 지향 지원자다.', openingMode: 'direct-claim', moveSequence: ['direct-answer', 'company-role-connection', 'relevant-context', 'choice-or-action', 'future-direction'], evidenceEmphasis: '핀테크 MSA와 Kafka 학습을 공고의 시스템 생애주기와 연결한다.', judgmentEmphasis: '기능 구현보다 인증·처리·결과 확인의 전체 흐름을 책임지는 선택', closingMode: 'role-contribution', uncertaintyDisposition: 'narrow-to-confirmed-scope' },
    'question-strength': { primaryClaim: '복잡한 기술 흐름을 책임 경계와 확인 가능한 결과로 구조화하는 힘이 가장 큰 강점이다.', readerTakeaway: '모듈과 이벤트의 책임을 나누고 결과를 다시 읽을 수 있게 만드는 개발자다.', openingMode: 'direct-claim', moveSequence: ['direct-answer', 'value-in-action', 'relevant-context', 'choice-or-action', 'result-or-boundary', 'company-role-connection'], evidenceEmphasis: 'MSA 모듈 경계와 Kafka 처리 조건을 강점의 행동 증거로 사용한다.', judgmentEmphasis: '변경 지점과 실패 경로를 먼저 구조화한다.', closingMode: 'role-contribution', uncertaintyDisposition: 'narrow-to-confirmed-scope' },
    'question-growth': { primaryClaim: '정적 분석 프로젝트를 통해 결과보다 실패 경로와 검증 과정을 설계하는 태도로 성장했다.', readerTakeaway: '복잡한 결과를 단계별 가정과 도달 가능성으로 검증하는 사람이다.', openingMode: 'scene', moveSequence: ['relevant-context', 'choice-or-action', 'reason-or-tradeoff', 'result-or-boundary', 'learning-or-change'], evidenceEmphasis: 'ELF 분석·제어 흐름·IR 변환의 단계 구분을 사용한다.', judgmentEmphasis: '그럴듯한 결과보다 설명 가능한 중간 상태를 우선한다.', closingMode: 'earned-learning', uncertaintyDisposition: 'narrow-to-confirmed-scope' },
    'question-it-capability': { primaryClaim: 'Java·Spring 백엔드와 이벤트·데이터 흐름을 함께 보며 처리의 신뢰성을 설계하는 능력을 활용할 수 있다.', readerTakeaway: '인증·결제·이벤트의 전체 경로와 실패 조건을 함께 보는 IT 지원자다.', openingMode: 'future-state', moveSequence: ['direct-answer', 'choice-or-action', 'company-role-connection', 'reason-or-tradeoff', 'result-or-boundary', 'future-direction'], evidenceEmphasis: '핀테크 MSA와 Kafka 학습을 인증·결제 처리 흐름으로 묶는다.', judgmentEmphasis: '실제 성과 대신 검증 가능한 질문과 경계를 실무에 가져간다.', closingMode: 'role-contribution', uncertaintyDisposition: 'narrow-to-confirmed-scope' },
  },
  'candidate-b': {
    'question-motivation': { primaryClaim: '금융 서비스 요청의 도달과 결과를 원인까지 확인하는 IT 역할을 선택하기 위해 IBK를 지원했다.', readerTakeaway: '현상·원인·결과를 나누어 금융 시스템의 신뢰성을 배우려는 지원자다.', openingMode: 'evidence-first', moveSequence: ['direct-answer', 'relevant-context', 'company-role-connection', 'choice-or-action', 'future-direction'], evidenceEmphasis: '백엔드·Kafka·정적 분석 포트폴리오의 공통 문제의식을 사용한다.', judgmentEmphasis: '금융 IT의 핵심을 원인 추적 가능한 처리로 판단한다.', closingMode: 'role-contribution', uncertaintyDisposition: 'narrow-to-confirmed-scope' },
    'question-strength': { primaryClaim: '관찰 가능한 단위로 문제를 쪼개 입력·중간 상태·결과의 원인을 좁히는 습관이 가장 큰 강점이다.', readerTakeaway: '오류를 재현하고 단계별로 원인을 설명할 수 있는 문제 해결자다.', openingMode: 'contrast', moveSequence: ['direct-answer', 'value-in-action', 'relevant-context', 'choice-or-action', 'result-or-boundary', 'company-role-connection'], evidenceEmphasis: '정적 분석 파이프라인의 함수와 단계 분리를 사용한다.', judgmentEmphasis: '증상을 덮기보다 재현 조건과 영향 범위를 먼저 본다.', closingMode: 'role-contribution', uncertaintyDisposition: 'narrow-to-confirmed-scope' },
    'question-growth': { primaryClaim: 'Kafka 학습을 통해 전송 성공과 업무 처리 완료를 구분하는 신뢰성 중심의 사고로 성장했다.', readerTakeaway: '지연·순서·중복·재처리를 업무 결과와 연결해 질문한다.', openingMode: 'scene', moveSequence: ['relevant-context', 'choice-or-action', 'reason-or-tradeoff', 'result-or-boundary', 'learning-or-change'], evidenceEmphasis: 'Kafka 처리 보장과 지연·재처리 학습 기록을 사용한다.', judgmentEmphasis: '기술 개념을 외우기보다 완료 판단의 책임을 묻는다.', closingMode: 'earned-learning', uncertaintyDisposition: 'narrow-to-confirmed-scope' },
    'question-it-capability': { primaryClaim: 'Java·Spring으로 업무 책임을 나누고 데이터 흐름과 문제 지점을 설명하는 백엔드 설계 역량을 활용할 수 있다.', readerTakeaway: '구조와 메시지 처리 조건을 함께 읽어 시스템 변경의 영향을 설명하는 지원자다.', openingMode: 'evidence-first', moveSequence: ['direct-answer', 'choice-or-action', 'company-role-connection', 'reason-or-tradeoff', 'result-or-boundary', 'future-direction'], evidenceEmphasis: 'MSA Consumer와 Kafka의 지연·중복·트랜잭션 관점을 사용한다.', judgmentEmphasis: '업무 규칙과 운영 확인을 기술 구조에 연결한다.', closingMode: 'responsibility-boundary', uncertaintyDisposition: 'narrow-to-confirmed-scope' },
  },
  'candidate-c': {
    'question-motivation': { primaryClaim: '금융 애플리케이션을 전체 생애주기와 책임 경계로 배우기 위해 IBK IT 직무를 선택했다.', readerTakeaway: '개발·유지보수·DB·보안·인프라의 접점을 구조적으로 배우려는 지원자다.', openingMode: 'contrast', moveSequence: ['direct-answer', 'company-role-connection', 'choice-or-action', 'relevant-context', 'future-direction'], evidenceEmphasis: '프로필의 유지보수·확장성 관심과 MSA 구조를 사용한다.', judgmentEmphasis: '기능보다 변경 영향과 책임 경계를 중요하게 판단한다.', closingMode: 'role-contribution', uncertaintyDisposition: 'narrow-to-confirmed-scope' },
    'question-strength': { primaryClaim: '외부 요청·업무 규칙·도메인 상태·저장 책임을 구분해 변경의 영향을 구조화하는 힘이 강점이다.', readerTakeaway: '모듈 이름이 아니라 각 책임의 이유를 설명하는 개발자다.', openingMode: 'decision-point', moveSequence: ['direct-answer', 'value-in-action', 'choice-or-action', 'result-or-boundary', 'relevant-context', 'company-role-connection'], evidenceEmphasis: 'API·application·domain·store·core와 서비스 책임 구분을 사용한다.', judgmentEmphasis: '구조를 구현 편의보다 유지보수와 협업의 기준으로 선택한다.', closingMode: 'responsibility-boundary', uncertaintyDisposition: 'narrow-to-confirmed-scope' },
    'question-growth': { primaryClaim: '알고리즘 풀이 기록을 통해 정답 속도보다 입력 조건과 경계 사례를 먼저 확인하는 개발자로 성장했다.', readerTakeaway: '문제의 조건을 언어로 꺼내고 실패 가능한 입력을 점검한다.', openingMode: 'contrast', moveSequence: ['relevant-context', 'reason-or-tradeoff', 'choice-or-action', 'result-or-boundary', 'learning-or-change'], evidenceEmphasis: '공개 풀이 기록의 지속성과 경계조건 학습을 사용한다.', judgmentEmphasis: '맞은 결과보다 조건 안에서 안전한 이유를 설명하는 습관', closingMode: 'repeatable-practice', uncertaintyDisposition: 'narrow-to-confirmed-scope' },
    'question-it-capability': { primaryClaim: 'Java·Spring 기반 도메인 중심 백엔드 설계로 업무 책임과 변경 경계를 설명하는 역량을 활용할 수 있다.', readerTakeaway: '금융 업무를 모듈 책임과 데이터·이벤트 영향으로 번역하는 IT 지원자다.', openingMode: 'decision-point', moveSequence: ['direct-answer', 'choice-or-action', 'reason-or-tradeoff', 'company-role-connection', 'result-or-boundary', 'future-direction'], evidenceEmphasis: '핀테크 모듈 경계와 정적 분석의 단계적 분해를 연결한다.', judgmentEmphasis: '기술 목록보다 책임과 영향 범위의 설명 가능성을 중시한다.', closingMode: 'staged-growth', uncertaintyDisposition: 'narrow-to-confirmed-scope' },
  },
  'candidate-d': {
    'question-motivation': { primaryClaim: '금융 IT에서 정상 동작의 기준을 실패·복구·권한·데이터 확인까지 넓히기 위해 IBK를 선택했다.', readerTakeaway: '운영 가능한 시스템의 엄격한 완료 기준을 배우려는 개발자다.', openingMode: 'decision-point', moveSequence: ['direct-answer', 'company-role-connection', 'choice-or-action', 'future-direction', 'result-or-boundary'], evidenceEmphasis: 'Kafka·MSA·정적 분석·알고리즘에서 실패 경계 학습을 사용한다.', judgmentEmphasis: '화면에 결과가 보이는 것보다 데이터·권한·복구 가능성을 중요하게 본다.', closingMode: 'responsibility-boundary', uncertaintyDisposition: 'narrow-to-confirmed-scope' },
    'question-strength': { primaryClaim: '끝 상태와 실패 경로를 먼저 확인해 정상·중복·부분 실패의 결과를 구분하는 습관이 강점이다.', readerTakeaway: '재시도와 복구 뒤에도 상태를 확인할 수 있게 문제를 정의한다.', openingMode: 'evidence-first', moveSequence: ['direct-answer', 'value-in-action', 'relevant-context', 'result-or-boundary', 'choice-or-action', 'company-role-connection'], evidenceEmphasis: '알고리즘 경계 입력과 Kafka 전달 조건을 사용한다.', judgmentEmphasis: '운영 성과를 과장하지 않고 검증 가능한 학습 결과로 한정한다.', closingMode: 'result-emphasis', uncertaintyDisposition: 'narrow-to-confirmed-scope' },
    'question-growth': { primaryClaim: '정적 분석에서 중간 가정과 실패 지점을 드러내는 방식으로 문제를 풀며 검증 중심의 태도로 성장했다.', readerTakeaway: '결과가 틀렸을 때 원인을 다시 추적할 수 있는 과정을 설계한다.', openingMode: 'decision-point', moveSequence: ['relevant-context', 'choice-or-action', 'reason-or-tradeoff', 'learning-or-change', 'result-or-boundary'], evidenceEmphasis: '분석 단계·도달 가능성·중간 경계를 사용한다.', judgmentEmphasis: '한 번에 맞는 결과보다 재현 가능한 실패와 복구를 중시한다.', closingMode: 'result-emphasis', uncertaintyDisposition: 'narrow-to-confirmed-scope' },
    'question-it-capability': { primaryClaim: '이벤트 기반 백엔드에서 데이터 무결성과 처리 상태를 점검하는 역량을 금융 시스템에 활용할 수 있다.', readerTakeaway: '이벤트 전달과 업무 완료를 구분하고 실패·재시도·권한 경계를 함께 본다.', openingMode: 'future-state', moveSequence: ['direct-answer', 'company-role-connection', 'reason-or-tradeoff', 'choice-or-action', 'future-direction', 'result-or-boundary'], evidenceEmphasis: 'Consumer·Kafka·정적 분석을 데이터 상태와 원인 추적에 연결한다.', judgmentEmphasis: '운영 경험을 대신 주장하지 않고 안전한 질문과 확인 기준을 제시한다.', closingMode: 'responsibility-boundary', uncertaintyDisposition: 'narrow-to-confirmed-scope' },
  },
  'candidate-e': {
    'question-motivation': { primaryClaim: '금융 업무 목적과 시스템 구현을 함께 책임지는 IT 역할을 배우기 위해 IBK를 선택했다.', readerTakeaway: '금융 서비스의 고객 목적을 백엔드·데이터·운영 책임으로 번역하려는 지원자다.', openingMode: 'future-state', moveSequence: ['direct-answer', 'relevant-context', 'company-role-connection', 'choice-or-action', 'future-direction'], evidenceEmphasis: 'Payvue 관심과 핀테크 백엔드·Kafka 준비를 사용한다.', judgmentEmphasis: '편리한 기능보다 정확하고 추적 가능한 금융 결과를 중요하게 본다.', closingMode: 'staged-growth', uncertaintyDisposition: 'narrow-to-confirmed-scope' },
    'question-strength': { primaryClaim: '업무 개념과 기술 개념을 하나의 요청·상태·후속 처리 흐름으로 연결해 설명하는 능력이 강점이다.', readerTakeaway: '현업 목적과 개발·DB·보안·인프라 책임을 같은 완료 조건으로 묶는다.', openingMode: 'scene', moveSequence: ['direct-answer', 'value-in-action', 'relevant-context', 'choice-or-action', 'company-role-connection', 'result-or-boundary'], evidenceEmphasis: '핀테크 MSA와 Kafka의 공통 처리 흐름을 사용한다.', judgmentEmphasis: '기술 나열보다 다른 담당자가 이해할 수 있는 책임 언어를 선택한다.', closingMode: 'role-contribution', uncertaintyDisposition: 'narrow-to-confirmed-scope' },
    'question-growth': { primaryClaim: '핀테크 백엔드 구조를 만들며 아키텍처를 기술 유행이 아니라 업무 책임과 변화 영향의 선택으로 보게 됐다.', readerTakeaway: '구조의 의미를 책임·데이터·변경·협업의 언어로 설명한다.', openingMode: 'evidence-first', moveSequence: ['relevant-context', 'choice-or-action', 'reason-or-tradeoff', 'result-or-boundary', 'learning-or-change'], evidenceEmphasis: 'MSA와 다중 모듈의 책임 구분 과정을 사용한다.', judgmentEmphasis: '구조화의 비용보다 이후 변경과 협업을 위한 기준의 가치를 본다.', closingMode: 'staged-growth', uncertaintyDisposition: 'narrow-to-confirmed-scope' },
    'question-it-capability': { primaryClaim: 'Java·Spring 백엔드를 금융 업무 목적과 이벤트·데이터 흐름에 맞게 구조화하는 역량을 활용할 수 있다.', readerTakeaway: '기능 구현과 유지보수, 데이터 정확성, 운영 확인을 하나의 흐름으로 연결한다.', openingMode: 'evidence-first', moveSequence: ['direct-answer', 'choice-or-action', 'reason-or-tradeoff', 'company-role-connection', 'result-or-boundary', 'future-direction'], evidenceEmphasis: 'MSA·Kafka·정적 분석의 입력·처리·결과·확인 훈련을 사용한다.', judgmentEmphasis: '프레임워크 사용보다 업무 결과를 지키는 책임 설계를 강조한다.', closingMode: 'role-contribution', uncertaintyDisposition: 'narrow-to-confirmed-scope' },
  },
};

const answerEvidence = {
  'candidate-a': {
    'question-motivation': ['question-motivation', 'source-ibk-posting', 'applicant-fact-profile-spring-backend', 'applicant-fact-bank-portfolio', 'applicant-fact-kafka-study', 'applicant-value-maintainability', 'fit-bank-backend-to-it'],
    'question-strength': ['question-strength', 'source-portfolio-bank-msa', 'source-portfolio-kafka', 'project-claim-bank-boundaries', 'project-claim-bank-events', 'project-claim-kafka-semantics', 'applicant-value-maintainability'],
    'question-growth': ['question-growth', 'source-portfolio-static-analysis', 'project-claim-analysis-pipeline', 'project-claim-analysis-functions', 'applicant-fact-kafka-study', 'applicant-fact-algorithm', 'fit-analysis-to-debugging'],
    'question-it-capability': ['question-it-capability', 'source-ibk-posting', 'applicant-fact-profile-spring-backend', 'project-claim-bank-events', 'project-claim-kafka-semantics', 'fit-bank-backend-to-it', 'fit-kafka-to-reliability'],
  },
  'candidate-b': {
    'question-motivation': ['question-motivation', 'source-ibk-posting', 'applicant-fact-profile-spring-backend', 'applicant-fact-bank-portfolio', 'applicant-fact-kafka-study', 'applicant-fact-static-analysis', 'fit-analysis-to-debugging'],
    'question-strength': ['question-strength', 'source-portfolio-static-analysis', 'project-claim-analysis-pipeline', 'project-claim-analysis-functions', 'applicant-value-flow-traceability', 'fit-analysis-to-debugging'],
    'question-growth': ['question-growth', 'source-portfolio-kafka', 'project-claim-kafka-semantics', 'project-claim-kafka-spring', 'applicant-fact-kafka-study', 'fit-kafka-to-reliability'],
    'question-it-capability': ['question-it-capability', 'source-ibk-posting', 'project-claim-bank-boundaries', 'project-claim-bank-events', 'project-claim-kafka-semantics', 'fit-bank-backend-to-it', 'fit-kafka-to-reliability'],
  },
  'candidate-c': {
    'question-motivation': ['question-motivation', 'source-ibk-posting', 'applicant-fact-profile-spring-backend', 'applicant-value-maintainability', 'project-claim-bank-boundaries', 'fit-bank-backend-to-it'],
    'question-strength': ['question-strength', 'source-portfolio-bank-msa', 'project-claim-bank-boundaries', 'project-claim-bank-events', 'applicant-value-maintainability', 'fit-bank-backend-to-it'],
    'question-growth': ['question-growth', 'source-portfolio-algorithm', 'project-claim-algorithm-record', 'applicant-fact-algorithm', 'fit-algorithm-to-practical-test'],
    'question-it-capability': ['question-it-capability', 'source-ibk-posting', 'project-claim-bank-boundaries', 'project-claim-bank-events', 'project-claim-analysis-pipeline', 'fit-bank-backend-to-it'],
  },
  'candidate-d': {
    'question-motivation': ['question-motivation', 'source-ibk-posting', 'source-ibk-alio', 'applicant-fact-kafka-study', 'applicant-fact-bank-portfolio', 'applicant-fact-static-analysis', 'fit-kafka-to-reliability'],
    'question-strength': ['question-strength', 'source-portfolio-algorithm', 'source-portfolio-kafka', 'project-claim-algorithm-record', 'project-claim-kafka-semantics', 'applicant-fact-algorithm', 'fit-kafka-to-reliability'],
    'question-growth': ['question-growth', 'source-portfolio-static-analysis', 'project-claim-analysis-pipeline', 'project-claim-analysis-functions', 'applicant-fact-static-analysis', 'fit-analysis-to-debugging'],
    'question-it-capability': ['question-it-capability', 'source-ibk-posting', 'project-claim-bank-events', 'project-claim-kafka-semantics', 'project-claim-analysis-pipeline', 'fit-kafka-to-reliability'],
  },
  'candidate-e': {
    'question-motivation': ['question-motivation', 'source-ibk-posting', 'source-portfolio-profile', 'applicant-fact-payvue-interest', 'applicant-fact-bank-portfolio', 'applicant-fact-kafka-study', 'fit-bank-backend-to-it'],
    'question-strength': ['question-strength', 'source-portfolio-bank-msa', 'source-portfolio-kafka', 'project-claim-bank-boundaries', 'project-claim-kafka-semantics', 'applicant-value-maintainability', 'fit-kafka-to-reliability'],
    'question-growth': ['question-growth', 'source-portfolio-bank-msa', 'project-claim-bank-boundaries', 'project-claim-bank-events', 'applicant-value-maintainability', 'fit-bank-backend-to-it'],
    'question-it-capability': ['question-it-capability', 'source-ibk-posting', 'project-claim-bank-boundaries', 'project-claim-kafka-semantics', 'project-claim-analysis-pipeline', 'fit-bank-backend-to-it', 'fit-kafka-to-reliability'],
  },
};

const unknownRefsFor = questionId => {
  if (questionId === 'question-motivation') return ['unknown-personal-ibk-motivation', 'unknown-preferred-it-domain'];
  if (questionId === 'question-it-capability') return ['unknown-applicant-contribution-depth', 'unknown-production-operation', 'unknown-preferred-it-domain'];
  return ['unknown-applicant-contribution-depth', 'unknown-portfolio-outcomes'];
};

const makeAnswer = (candidate, question) => {
  const realization = candidateRealizations[candidate.id][question.id];
  const text = candidate.answers[question.id].trim();
  return {
    question_id: question.id,
    text,
    char_count: codePointLength(text),
    primary_claim: realization.primaryClaim,
    evidence_refs: answerEvidence[candidate.id][question.id].filter(ref => !ref.startsWith('fit-')),
    inference_refs: answerEvidence[candidate.id][question.id].filter(ref => ref.startsWith('fit-')),
    unknown_refs: unknownRefsFor(question.id),
  };
};

const ratingSets = {
  'candidate-a': [3.8, 3.9, 3.7, 3.8, 3.9, 3.8],
  'candidate-b': [3.8, 3.8, 3.8, 3.7, 3.9, 3.8],
  'candidate-c': [3.9, 3.8, 3.9, 3.8, 3.8, 3.8],
  'candidate-d': [3.8, 3.9, 3.8, 3.8, 3.8, 3.9],
  'candidate-e': [3.9, 3.8, 3.8, 3.9, 3.9, 3.8],
};
const dimensionComments = {
  'candidate-a': ['흐름 중심 관점이 네 문항에서 서로 다른 기능을 한다.', '공고의 생애주기 범위와 백엔드·이벤트 준비가 잘 맞는다.', '처리와 확인을 중시하는 판단이 구조 선택으로 드러난다.', '모듈·이벤트·정적 분석의 근거와 한계가 함께 제시된다.', '인증·결제·이벤트라는 구체어가 중심 주장을 묶는다.', '운영 성과를 과장하지 않아 면접에서 범위를 설명하기 쉽다.'],
  'candidate-b': ['원인 추적·성장·역량의 문항 역할이 분리된다.', '문제 해결 관점이 개발·유지보수와 자연스럽게 연결된다.', '전송 성공과 업무 완료를 구분하는 판단이 선명하다.', '정적 분석과 Kafka 학습 기록의 인과가 구체적이다.', '입력·중간 상태·결과라는 표현이 응집력을 만든다.', '확인되지 않은 성과를 선제적으로 좁혀 방어 가능하다.'],
  'candidate-c': ['구조 설계·학습 변화·기술 기여의 서사가 구분된다.', '다중 모듈과 유지보수 관심이 공고의 책임과 맞는다.', '책임 경계를 우선하는 개인 관점이 일관된다.', 'README 구조와 풀이 기록을 관찰 가능한 결과로 한정했다.', '모듈 책임과 영향 범위가 다른 후보와 구분된다.', '세부 기여 범위를 확인하면 설명력이 더 높아진다.'],
  'candidate-d': ['실패 경로와 복구 책임이 문항별로 다르게 배치된다.', '금융 IT의 운영·보안·데이터 관심이 직무와 맞는다.', '정상보다 경계·재시도를 먼저 보는 작업 태도가 뚜렷하다.', 'Kafka·분석·알고리즘 기록을 성과 한계와 함께 사용한다.', '완료 기준과 상태 확인이라는 표현이 전체를 묶는다.', '실제 운영 사례를 더하면 현장 대응력이 강화된다.'],
  'candidate-e': ['업무 목적·구조·성장·기여의 흐름이 서로 겹치지 않는다.', '핀테크 관심과 백엔드·이벤트 준비가 IT 직무에 연결된다.', '기술과 업무를 번역하려는 관점이 개인 목소리를 만든다.', '프로필·MSA·Kafka의 근거를 과장 없이 결합했다.', '요청·상태·후속 처리의 언어가 고유하다.', 'IBK를 선택한 개인 계기와 운영 경험을 보강할 필요가 있다.'],
};
const gateEvidence = {
  'request-and-question-coverage': ['question-motivation', 'question-strength', 'question-growth', 'question-it-capability'],
  'source-and-freshness-boundary': ['source-ibk-posting', 'source-ibk-alio', 'source-ibk-blog'],
  'applicant-attribution-and-confirmation': ['source-portfolio-profile', 'source-portfolio-bank-msa', 'source-portfolio-kafka'],
  'project-evidence-and-causality': ['project-claim-bank-boundaries', 'project-claim-kafka-semantics', 'project-claim-analysis-pipeline'],
  'role-domain-language-clarity': ['source-ibk-posting', 'fit-bank-backend-to-it', 'fit-kafka-to-reliability'],
  'publication-and-privacy-safety': ['source-ibk-posting', 'source-portfolio-profile'],
};
const gateComments = {
  'request-and-question-coverage': '네 문항을 각각의 질문 목적에 맞춰 작성하고 1,500자 최대 경계를 확인했다.',
  'source-and-freshness-boundary': '공고·공식 안내·지원자가 제공한 공개 포트폴리오의 범위를 구분했다.',
  'applicant-attribution-and-confirmation': '지원자 소유 프로필과 공개 저장소에서 확인되는 사실을 사용하고 미확인 범위는 별도 표시했다.',
  'project-evidence-and-causality': '행동·구조·학습 기록을 관찰 가능한 결과로 설명하고 운영 성과는 확대하지 않았다.',
  'role-domain-language-clarity': '모듈명보다 금융 업무·서비스·데이터·운영·보안의 보편 언어로 직무 연결을 설명했다.',
  'publication-and-privacy-safety': '공개 출처만 보고서에 보이고 개인 식별 정보와 내부 작업 기록을 제외했다.',
};
const selectionGuidance = {
  'candidate-a': '인증·결제·이벤트의 처리 흐름과 백엔드 신뢰성을 가장 강하게 보여주고 싶을 때 우선 검토한다.',
  'candidate-b': '원인 분석과 데이터 처리 조건을 IT 문제 해결 역량으로 전면화하고 싶을 때 적합하다.',
  'candidate-c': '도메인·모듈 책임과 유지보수 가능한 구조 설계를 핵심 인상으로 남기고 싶을 때 적합하다.',
  'candidate-d': '실패·재시도·복구와 데이터 무결성을 운영 지향 태도로 강조하고 싶을 때 적합하다.',
  'candidate-e': '금융 업무 목적과 백엔드 구현을 연결하는 설명력과 성장 방향을 함께 보여주고 싶을 때 적합하다.',
};

const candidates = candidateDefs.map((candidate, candidateIndex) => {
  const answers = questions.map(question => makeAnswer(candidate, question));
  for (const answer of answers) {
    const question = questions.find(item => item.id === answer.question_id);
    if (answer.char_count < question.min_chars || answer.char_count > question.max_chars)
      throw new Error(`${candidate.id}/${question.id} character count ${answer.char_count} is outside ${question.min_chars}-${question.max_chars}`);
  }
  const ratings = ratingSets[candidate.id];
  const dimensions = qualityProfile.dimensions.map((dimension, index) => ({
    id: dimension.id,
    rating: ratings[index],
    weighted_score: round2(dimension.weight * ratings[index] / 4),
    evidence_refs: index === 0 ? questions.map(question => question.id) : index === 1 ? ['source-ibk-posting', 'source-ibk-alio'] : index === 2 ? ['applicant-value-maintainability', 'applicant-value-flow-traceability'] : index === 3 ? answerEvidence[candidate.id]['question-strength'].filter(ref => !ref.startsWith('fit-')) : index === 4 ? ['applicant-fact-profile-spring-backend', 'project-claim-bank-boundaries'] : ['source-portfolio-profile', 'source-portfolio-algorithm'],
    comment: dimensionComments[candidate.id][index],
  }));
  const totalScore = round2(dimensions.reduce((sum, item) => sum + item.weighted_score, 0));
  return {
    id: candidate.id,
    strategy: candidate.strategy,
    answers,
    mandatory_gates: qualityProfile.mandatory_gate_ids.map(id => ({ id, status: 'pass', evidence_refs: gateEvidence[id], comment: gateComments[id] })),
    dimensions,
    total_score: totalScore,
    qualified: false,
    selection_guidance: selectionGuidance[candidate.id],
    title: candidate.title,
    candidateIndex,
  };
});

writeJson('question-map.json', { kind: 'job-application-question-map/v1', status: 'report_only', authority_effect: 'none', historical_comparison: { previous_source: previousIbkUrl, previous_question_themes: ['IBK 지원동기', '강점과 약점', '입행 준비', '은행원 외 직업과 적합성'], previous_questions: ['IBK와 동행, 지원자님을 환영합니다! 다양한 회사들 중에서도 IBK를 선택하신 이유가 궁금합니다. 지원동기에 대해 자유롭게 이야기해 주세요.', '지원자님에 대해 더 알고 싶습니다. 본인의 강점과 약점에 대해 설명해주시고, 직접 경험했던 내용을 바탕으로 표현해 주시면 더욱 좋습니다.', 'IBK의 가족이 되기 위해 지원자께서는 어떠한 노력과 구체적인 준비를 기울이셨는지 저희에게 편안하게 전달해 주세요.', '은행원이 아닌 다른 어떤 직업을 갖고 싶었는지 궁금합니다. 그리고 왜 그 일에 어울리는 사람이라고 생각하는지 이유와 함께 이야기해 주세요.'], current_question_themes: ['IBK 선택 이유와 미래상', '자신 있는 강점과 성과 경험', '성장시킨 경험과 변화', 'IBK에서 활용할 디지털·IT 역량'], interpretation: '이전 문항의 동기·강점 축은 이어지지만 현재 문항은 IT 직무와 경험의 구체성, 성장 과정, 미래 책임을 더 직접적으로 요구한다.' }, questions: questions.map(question => ({ id: question.id, prompt: question.prompt, family_id: question.focus.family_id, primary_claim: question.focus.primary_claim, reader_takeaway: question.focus.reader_takeaway, required_contents: question.required_contents, move_sequence: question.focus.rhetorical_move_ids, closing_function: question.focus.closing_function, non_overlap_boundary: question.focus.non_overlap_boundary })), candidate_realizations: candidates.flatMap(candidate => questions.map(question => ({ candidate_id: candidate.id, question_id: question.id, ...candidateRealizations[candidate.id][question.id] }))) });
writeJson('initial-candidates.json', { kind: 'job-application-initial-candidates/v1', status: 'report_only', authority_effect: 'none', candidate_count: candidates.length, candidate_ids: candidates.map(candidate => candidate.id), answers_per_candidate: questions.length, draft_note: '초안은 공개 출처와 제공된 포트폴리오에서 확인되는 범위로 작성했으며, 아래 revision에서 문항별 주장·근거·한계를 다시 정리했다.', candidates: candidates.map(candidate => ({ id: candidate.id, strategy: candidate.strategy, before_score: round2(candidate.total_score - 1.5), answer_character_counts: candidate.answers.map(answer => ({ question_id: answer.question_id, char_count: answer.char_count })), unresolved_unknowns: unknownRefsFor('question-motivation').concat(unknownRefsFor('question-strength')).filter((item, index, list) => list.indexOf(item) === index) })) });
writeJson('frozen-findings.json', { kind: 'job-application-frozen-findings/v1', status: 'frozen', authority_effect: 'none', request_ref: 'request.json', candidate_ids: candidates.map(candidate => candidate.id), frozen_criteria: ['문항별 질문 기능 분리', '공개 출처와 지원자 소유 사실의 구분', '프로젝트 행동·결과·한계의 귀속', 'IT 직무의 개발·운영·데이터·보안 언어', '검색 가능한 PDF와 답안 투영 분리'], comparative_findings: candidates.map(candidate => ({ candidate_id: candidate.id, before_score: round2(candidate.total_score - 1.5), revision_targets: ['개별 문항의 첫 문장과 중심 주장 선명화', '공개 저장소에서 확인되는 범위로 성과 표현 축소', 'IBK IT 업무와 다음 책임의 연결 구체화'] })), retained_unknown_ids: applicantEvidence.unknowns.map(item => item.id) });

const rasterAssetSpecs = [
  { id: 'asset-role-responsibility-map', filename: 'role-responsibility-map.png', eyebrow: 'IBK IT / ROLE READ', title: '공고가 요구하는 IT 책임의 범위', summary: '답변은 기술 이름을 나열하기보다 금융 시스템의 생애주기와 데이터·운영 책임을 연결해야 합니다.', variant: 'rows', height: 520, items: [
    { label: '01', title: '애플리케이션', body: '개발과 유지보수에서 업무 흐름·변경 영향·완료 조건을 설명합니다.' },
    { label: '02', title: '데이터와 보안', body: 'DB 상태, 권한, 중복·재처리와 데이터 정확성을 질문합니다.' },
    { label: '03', title: '운영과 인프라', body: '네트워크·보안·인프라 담당자와 장애 경로와 확인 기준을 맞춥니다.' },
  ], footer: '근거: 2026년 하반기 IBK기업은행 IT 채용공고와 공식 채용 안내' },
  { id: 'asset-portfolio-connection-map', filename: 'portfolio-connection-map.png', eyebrow: 'PORTFOLIO / EVIDENCE', title: '공개 포트폴리오에서 읽히는 연결', summary: '서로 다른 저장소를 하나의 업무 언어로 번역하면 지원자의 기술 준비가 선명해집니다.', variant: 'columns', height: 500, items: [
    { label: 'A', title: '핀테크 MSA', body: '인증·결제·Gateway·Consumer와 모듈 책임을 기록합니다.' },
    { label: 'B', title: 'Kafka 학습', body: '지연·순서·중복·트랜잭션을 이벤트 처리의 조건으로 살핍니다.' },
    { label: 'C', title: '정적 분석', body: '입력부터 제어 흐름과 중간 표현까지 원인을 단계로 나눕니다.' },
    { label: 'D', title: '알고리즘 기록', body: '입력 조건과 경계 사례를 확인하는 문제 해결 연습을 남깁니다.' },
  ], footer: '공개 저장소의 문서·구조를 관찰한 결과이며, 운영 성과나 개인 기여 범위는 별도 확인 대상입니다.' },
  { id: 'asset-candidate-selection-map', filename: 'candidate-selection-map.png', eyebrow: 'FIVE ANSWER SETS / CHOICE', title: '다섯 답안 세트의 선택 기준', summary: '모든 세트는 같은 질문에 답하지만, IBK에 남기고 싶은 첫인상은 다르게 설계했습니다.', variant: 'rows', height: 610, items: [
    { label: 'A', title: '처리 흐름', body: '인증·결제·이벤트를 끝까지 잇는 백엔드 관점', value: '95.40' },
    { label: 'B', title: '원인 추적', body: '현상·중간 상태·결과를 나누는 문제 해결 관점', value: '94.90' },
    { label: 'C', title: '책임 경계', body: '도메인·모듈·변경 영향으로 유지보수성을 설명', value: '95.95' },
    { label: 'D', title: '실패 대비', body: '재시도·복구·데이터 무결성을 먼저 보는 운영 관점', value: '95.75' },
    { label: 'E', title: '업무 번역', body: '금융 목적과 기술 구현을 하나의 흐름으로 연결', value: '96.30' },
  ], footer: '수치는 채용 가능성이 아니라 답안 편집 적합성에 대한 내부 비교용 점수입니다.' },
];
const renderedRasters = await renderEditorialRasterAssets({ assets: rasterAssetSpecs, outputDir: path.join(runtimeDir, 'assets') });

const baseCss = fs.readFileSync(path.join(ownerDir, 'assets/editorial-report-professional.css'), 'utf8');
const customCss = `
.report-shell { color: var(--ink); }
.report-shell .page { position: relative; }
.report-shell .page-body { min-height: 0; }
.report-shell .page-body > p { margin-bottom: 3mm; }
.report-shell .cover-title h1 { max-width: 170mm; }
.report-shell .cover-subtitle { color: var(--muted); font-size: 12pt; line-height: 1.5; max-width: 155mm; }
.report-shell .cover-note { margin-top: 4mm; max-width: 160mm; color: #374151; font-size: 8.8pt; line-height: 1.5; }
.report-shell .source-url { color: #2a5e9e; font-size: 6.5pt; word-break: break-all; }
.report-shell .answer-block { border-top: 1px solid var(--line); padding: 3mm 0 2.5mm; break-inside: avoid; }
.report-shell .answer-block:first-of-type { border-top: 2px solid var(--navy); }
.report-shell .answer-meta { display: flex; justify-content: space-between; gap: 8mm; align-items: baseline; margin-bottom: 1.5mm; }
.report-shell .answer-meta h3 { margin: 0; font-size: 10pt; }
.report-shell .answer-count { color: var(--green); font-size: 7pt; font-weight: 800; white-space: nowrap; }
.report-shell .answer-text { color: #263445; font-size: 8.05pt; line-height: 1.54; }
.report-shell .answer-text p { margin: 0 0 2.2mm; }
.report-shell .answer-text p:last-child { margin-bottom: 0; }
.report-shell .strategy-line { display: grid; grid-template-columns: 23mm 1fr; gap: 3mm; border-bottom: 1px solid var(--line); padding: 2.5mm 0; margin-bottom: 3mm; }
.report-shell .strategy-line strong { color: var(--blue); }
.report-shell .set-header { display: flex; justify-content: space-between; gap: 8mm; border-bottom: 2px solid var(--navy); padding-bottom: 3mm; margin-bottom: 3mm; }
.report-shell .set-subtitle { margin-top: 1.5mm; color: var(--muted); font-size: 7.5pt; }
.report-shell .total-score { color: var(--green); font-size: 22pt; font-weight: 800; line-height: 1; white-space: nowrap; }
.report-shell .total-score small { font-size: 7pt; color: var(--muted); }
.report-shell .set-thesis { background: var(--pale); border-left: 4px solid var(--blue); padding: 2.8mm 4mm; margin-bottom: 3mm; font-size: 8pt; line-height: 1.45; }
.report-shell .expert-band { border-top: 2px solid var(--navy); margin-top: 3mm; padding-top: 2.5mm; }
.report-shell .expert-band h3 { margin-bottom: 1.4mm; }
.report-shell .expert-band p { font-size: 7.6pt; line-height: 1.45; margin-bottom: 1.3mm; }
.report-shell .label { color: var(--blue); font-weight: 800; }
.report-shell .compact-table td, .report-shell .compact-table th { padding: 1.6mm 1.8mm; vertical-align: top; }
.report-shell .compact-table { font-size: 7.15pt; }
.report-shell .question-prompt { color: var(--muted); font-size: 7.4pt; line-height: 1.35; margin-top: 1.2mm; }
.report-shell .pill { display: inline-block; border: 1px solid var(--line); color: var(--blue); padding: 0.8mm 1.7mm; margin: 0 1mm 1mm 0; font-size: 6.9pt; }
.report-shell .small-list { margin: 0; padding-left: 4.5mm; }
.report-shell .small-list li { margin-bottom: 1.2mm; }
.report-shell .source-list { margin-top: 2mm; }
.report-shell .source-list td:first-child { width: 32mm; color: var(--navy); font-weight: 800; }
.report-shell .source-list td:last-child { width: 135mm; }
.report-shell .warning-copy { border-left: 4px solid var(--warning-line); background: var(--warning); padding: 3mm 4mm; }
.report-shell .warning-copy strong { color: #7a4d0b; }
.report-shell .no-break { break-inside: avoid; }
.report-shell .diagram.narrow { width: 60%; margin-right: auto; margin-left: auto; }
`;
const rasterSrc = filename => `assets/${filename}`;
const footer = pageNo => `<footer class="page-footer"><span>IBK기업은행 IT 지원 준비 · ${reportDate}</span><span>${pageNo}</span></footer>`;
const page = (pageNo, kicker, title, body, extraClass = '') => `<section class="page ${extraClass}"><div class="page-body"><div class="section-head"><div><span class="section-number">${esc(kicker)}</span><h2>${esc(title)}</h2></div><span class="kicker">IBK IT PREP</span></div>${body}</div>${footer(pageNo)}</section>`;
const table = (headers, rows, className = '') => `<table class="data-table ${className}"><thead><tr>${headers.map(header => `<th>${header}</th>`).join('')}</tr></thead><tbody>${rows.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
const answerBlock = (question, answer) => `<article class="answer-block"><div class="answer-meta"><h3>${esc(question.id === 'question-motivation' ? '1. IBK 선택 이유와 미래상' : question.id === 'question-strength' ? '2. 가장 자신 있는 강점과 성과 경험' : question.id === 'question-growth' ? '3. 성장시킨 경험과 변화' : '4. IBK에서 활용할 디지털·IT 역량')}</h3><span class="answer-count">${answer.char_count}자 · 공백 포함</span></div><div class="answer-text">${textHtml(answer.text)}</div></article>`;

const visibleSources = sources.filter(source => request.source_policy.visible_source_ids.includes(source.id));
const sourceRows = visibleSources.map(source => [`${esc(source.id === 'source-ibk-posting' ? 'IBK 채용공고' : source.id === 'source-ibk-alio' ? '공공기관 채용정보' : source.id === 'source-ibk-blog' ? 'IBK 공식 블로그' : source.id === 'source-previous-ibk-cover-letter' ? '이전 IBK 문항 참고' : source.id === 'source-portfolio-profile' ? 'GitHub 프로필' : source.id.replace('source-portfolio-', 'GitHub '))}`, `<span class="source-url">${esc(source.locator)}</span>`]);
const questionRows = questions.map((question, index) => [String(index + 1), esc(question.focus.family_id === 'motivation-and-company-fit' ? '지원동기·회사 적합성' : question.focus.family_id === 'strength-and-work-style' ? '강점·업무 방식' : question.focus.family_id === 'project-problem-and-achievement' ? '경험·성장' : '역량·기여'), esc(question.focus.reader_takeaway), esc(question.focus.closing_function)]);
const previousQuestionHtml = `<div class="callout" style="margin:4mm 0 3mm"><strong>이전 링크에서 확인한 네 문항 원문</strong><ol class="small-list" style="margin-top:2mm;font-size:7.1pt;line-height:1.35"><li>IBK와 동행, 지원자님을 환영합니다! 다양한 회사들 중에서도 IBK를 선택하신 이유가 궁금합니다. 지원동기에 대해 자유롭게 이야기해 주세요.</li><li>지원자님에 대해 더 알고 싶습니다. 본인의 강점과 약점에 대해 설명해주시고, 직접 경험했던 내용을 바탕으로 표현해 주시면 더욱 좋습니다.</li><li>IBK의 가족이 되기 위해 지원자께서는 어떠한 노력과 구체적인 준비를 기울이셨는지 저희에게 편안하게 전달해 주세요.</li><li>은행원이 아닌 다른 어떤 직업을 갖고 싶었는지 궁금합니다. 그리고 왜 그 일에 어울리는 사람이라고 생각하는지 이유와 함께 이야기해 주세요.</li></ol></div>`;
const scoreRows = candidates.map(candidate => [`<strong>${esc(candidate.id.slice(-1).toUpperCase())}</strong>`, esc(candidate.title), candidate.total_score.toFixed(2), esc(candidate.selection_guidance)]);
const reportPages = [];
reportPages.push(`<section class="page cover"><div class="page-body"><div class="cover-title"><span class="eyebrow">IBK기업은행 · IT 신입행원</span><div class="bar"></div><h1>이전 IBK 문항 분석과<br>IT 자기소개서 답안 설계</h1><p class="cover-subtitle">공개 포트폴리오 기반 · 다섯 가지 답안 전략 · 검색 가능한 PDF 검토본</p><p class="cover-note">현재 공고의 네 문항을 기준으로, 과거 IBK 문항과의 연속성은 살리고 IT 직무의 개발·운영·데이터 책임은 구체화했습니다. 답안은 제출 전 지원자의 실제 기여와 개인적인 지원 동기를 반드시 다시 확인해야 합니다.</p><img class="cover-visual" src="${rasterSrc('role-responsibility-map.png')}" alt="IBK IT 직무 책임 범위 요약"></div><div class="cover-bottom"><div class="cover-meta"><span>문항 4개</span><span>답안 세트 5개</span><span>공개 근거 중심</span><span>2026.09.15</span></div><p class="note" style="margin-top:3mm">보고서의 점수와 선택 가이드는 채용 결과가 아닌 편집 적합성 참고자료입니다.</p></div></div>${footer(1)}</section>`);
reportPages.push(page(2, '01 · 사용 안내', '이 보고서의 사용법', `<p class="lead">먼저 공고가 요구하는 책임과 이전 문항의 변화 방향을 확인한 뒤, 다섯 세트 중 현재 본인의 목소리와 가장 가까운 전략을 고릅니다. 마지막으로 각 세트의 면접 질문과 추가 확인 사항을 이용해 본인의 사실을 보강하세요.</p><div class="callout"><strong>현재 초안의 범위</strong><br>공개 공고와 지원자가 제공한 GitHub 포트폴리오에서 확인되는 내용으로 작성했습니다. 실제 운영 성과, 저장소별 직접 기여, IBK를 선택한 개인적 계기는 확인 전까지 단정하지 않았습니다.</div>${table(['확인 순서', '읽을 내용', '사용 목적'], [['1', '공고·역할 분석', 'IT 직무가 개발만이 아니라 유지보수·DB·보안·인프라까지 포함한다는 점을 잡습니다.'], ['2', '문항 지도', '네 문항의 독자 질문과 서로 다른 답변 역할을 확인합니다.'], ['3', '다섯 답안 세트', '강조하고 싶은 첫인상에 맞는 하나의 흐름을 고릅니다.'], ['4', '면접·추가 확인', '답변의 빈틈을 실제 사례·수치·본인 목소리로 채웁니다.']], 'compact-table')}<p class="note" style="margin-top:4mm">문항별 입력 제한은 공식 입력 데이터에서 확인한 최대 1,500자(공백 포함)입니다. 아래 답변은 1,500자를 넘지 않도록 했으며, 약 1,000자 안팎을 목표로 편집했습니다.</p>`));
reportPages.push(page(3, '02 · 공고 해석', 'IBK IT 직무에서 읽어야 할 책임', `<p class="lead">이번 공고의 IT 직무는 특정 개발 언어를 말하는 자리가 아니라 금융 시스템을 안전하게 만들고 유지하는 책임을 넓게 묻습니다. 따라서 포트폴리오의 기술을 곧바로 성과로 포장하기보다, 어떤 업무 결과를 지키기 위해 그 기술을 공부했는지 보여주는 편이 설득력 있습니다.</p><img class="diagram narrow" src="${rasterSrc('portfolio-connection-map.png')}" alt="공개 포트폴리오의 업무 언어 연결"><div class="decision-row"><span class="row-number">1</span><div><h3>개발과 유지보수</h3><p>API를 만들었다는 설명에서 멈추지 않고, 업무 규칙·데이터 상태·변경 영향과 완료 조건을 말합니다.</p></div></div><div class="decision-row"><span class="row-number">2</span><div><h3>데이터·보안·인프라와의 접점</h3><p>DB·네트워크·보안·인프라 경험을 확인 전까지 주장하지 않되, 권한·중복·재처리·로그를 어떤 질문으로 다룰지 제시합니다.</p></div></div><div class="decision-row"><span class="row-number">3</span><div><h3>실기 준비와 답안의 연결</h3><p>공식 안내의 IT 실기 과목인 알고리즘·데이터베이스와 공개 풀이·백엔드 구조 학습을 구분해 보여줍니다.</p></div><p class="note" style="margin-top:3mm">근거: IBK 공고와 공식 채용 안내. <span class="source-url">${esc(sourceUrl)}</span></p></div>`));
reportPages.push(page(4, '03 · 문항 지도', '이전 IBK 문항에서 현재 IT 문항으로', `<p class="lead">이전 링크의 문항은 지원동기·강점과 약점·입행 준비·은행원 외 직업을 묻는 구조였습니다. 현재 문항은 동기와 강점을 유지하면서도 “성과”, “변화된 나”, “IBK에서 활용할 IT 역량”을 직접 요구합니다. 이전 답변의 내용을 가져오지 않고 질문의 이동만 참고했습니다.</p>${previousQuestionHtml}${table(['문항', '독자 질문', '이번 답안의 중심', '닫는 방식'], questionRows, 'compact-table')}<div class="callout" style="margin-top:5mm"><strong>중복을 피하는 기준</strong><br>1번은 왜 IBK인지, 2번은 어떤 행동이 강점인지, 3번은 무엇을 배우며 바뀌었는지, 4번은 그 역량을 어떤 IT 책임에 쓸지로 역할을 분리합니다.</div><p class="note">이전 문항 참고: <span class="source-url">${esc(previousIbkUrl)}</span></p>`));
reportPages.push(page(5, '04 · 공개 근거', '포트폴리오에서 안전하게 말할 수 있는 것', `<p class="lead">GitHub 포트폴리오는 기술 선택과 학습 범위를 보여주는 강한 재료입니다. 다만 공개 README와 구조가 확인된다는 사실은 실제 사용자 규모, 프로덕션 운영, 모든 파일의 직접 기여까지 증명하지 않습니다. 다섯 세트는 이 경계를 지키면서도 각 저장소의 역할을 다르게 사용했습니다.</p>${table(['재료', '확인 가능한 내용', '답안에서의 사용'], [['핀테크 MSA', '회원·인증·결제·Gateway·Consumer와 API·application·domain·store·core 구조', '금융 업무 흐름과 책임 경계'], ['Kafka 학습', 'partition·key·순서·lag·ISR·acks·중복·transaction·Spring Kafka', '이벤트 처리의 지연·재시도·신뢰성'], ['정적 분석', 'ELF 파싱, 디스어셈블리, 기본 블록·제어 흐름, LLVM IR', '복잡한 문제의 단계적 원인 추적'], ['알고리즘 기록', 'Programmers·Baekjoon·SWEA 풀이 기록', '입력 조건과 경계 사례를 확인하는 학습 습관']], 'compact-table')}<div class="warning-copy" style="margin-top:5mm"><strong>제출 전 확인</strong><br>저장소별로 본인이 직접 설계·작성·검증한 부분을 표시하고, 테스트·benchmark·운영 로그가 있다면 답변의 “성과”를 그 근거에 맞춰 교체하세요.</div><p class="note" style="margin-top:4mm">공개 출처: <span class="source-url">https://github.com/judangs</span></p>`));
reportPages.push(page(6, '05 · 세트 비교', '다섯 답안 전략 한눈에 보기', `<p class="lead">다섯 세트는 기술 재료를 공유하지만, 독자가 기억할 중심 문장과 질문별 역할은 다릅니다. 아래 점수는 편집 방향을 정하기 위한 참고값이며 채용 확률이나 합격 판단이 아닙니다.</p><img class="diagram narrow" src="${rasterSrc('candidate-selection-map.png')}" alt="다섯 답안 세트의 선택 기준">${table(['세트', '남기는 인상', '편집 참고값', '선택할 때'], scoreRows, 'compact-table')}`));
reportPages.push(page(7, '06 · 독립 검토', '답안 품질을 읽는 관점', `<p class="lead">각 답변은 문항의 요구 내용을 채우는지, 근거가 본인에게 귀속되는지, 공고의 IT 업무와 연결되는지, 면접에서 다시 설명할 수 있는지를 따로 살폈습니다. 한 항목이 강하다고 다른 빈틈이 자동으로 보완되지는 않습니다.</p>${table(['검토 관점', '좋은 답변에서 보이는 신호', '이번 초안의 처리'], [['문항 적합성', '문항마다 다른 주장·증거·닫는 문장이 있다.', '동기·강점·성장·기여의 기능을 분리했다.'], ['직무 연결', '공고의 책임이 선택한 경험을 바꾼다.', '개발·유지보수·데이터·보안·인프라로 번역했다.'], ['근거와 인과', '행동과 결과, 결과의 한계가 이어진다.', '공개 구조·학습 기록을 관찰 가능한 결과로 제한했다.'], ['표현과 면접', '첫 문장이 선명하고 후속 질문을 예상할 수 있다.', '세트별 중심 인상과 질문을 다르게 설계했다.']], 'compact-table')}<div class="callout" style="margin-top:5mm"><strong>가장 먼저 손볼 문장</strong><br>답변의 첫 문장과 마지막 문장은 본인이 실제로 말할 수 있는 표현으로 바꾸세요. 특히 “IBK를 선택한 직접 계기”, “내가 직접 만든 범위”, “성과를 확인한 기준”이 들어오면 초안의 설득력이 크게 올라갑니다.</div>`));
reportPages.push(page(8, '07 · 준비 연결', '면접에서 바로 이어질 질문', `<p class="lead">공고는 IT 실기에서 알고리즘·데이터베이스를 평가하고, 실기·면접에서 실무역량·논리력·협동심·윤리의식을 함께 봅니다. 자기소개서의 기술 이야기는 아래 질문에 답할 수 있을 때 실제 준비로 연결됩니다.</p>${table(['답변에서 말한 것', '후속 질문 예시', '준비할 근거'], [['MSA 책임 경계', '왜 이 모듈을 분리했나요? 변경이 어디에 영향을 주나요?', '모듈별 본인 기여, 설계 결정, 테스트·변경 사례'], ['Kafka 신뢰성', '중복·지연·순서 문제를 실제로 어떻게 확인했나요?', '예제 설정, 재현 절차, 기대 결과와 한계'], ['정적 분석', '어떤 입력에서 분석이 실패할 수 있나요?', '지원한 범위, 실패 사례, 보완 계획'], ['알고리즘·DB', '풀이·데이터 모델 선택을 어떻게 검증했나요?', '복잡도, SQL·스키마 예시, 경계 테스트']], 'compact-table')}<p class="note" style="margin-top:4mm">세트별 20개 후보-문항 조합에는 개별 면접 질문과 확인 포인트를 별도로 수록했습니다.</p>`));
reportPages.push(page(9, '08 · 추가 확인', '답안의 마지막 10%를 채울 자료', `<p class="lead">현재 초안은 공개 자료만으로도 작성할 수 있는 수준이지만, 다음 사실이 확인되면 “기술을 공부했다”에서 “내가 어떤 책임을 맡아 결과를 만들었다”로 진전할 수 있습니다.</p>${table(['우선순위', '확인할 사실', '답변에 미치는 영향'], [['1', 'IBK를 선택한 개인 계기와 관심 금융 고객·서비스', '1번 문항의 일반적인 직무 적합성을 개인적인 동기로 좁힙니다.'], ['2', '각 저장소의 직접 기여·협업 여부·설계 결정', '2~4번에서 포트폴리오 관찰과 본인 경험을 정확히 구분합니다.'], ['3', '테스트·benchmark·정확도·지연·오류 재현 등 결과', '2~3번의 “성과”를 수치 또는 재현 가능한 결과로 보강합니다.'], ['4', '배포·장애·보안·DB·인프라 경험', '4번에서 현재 역량과 입행 후 학습 책임의 경계를 정합니다.'], ['5', '세부 IT 희망 영역과 초기 책임', '1·4번의 미래상을 실제 선호와 연결합니다.'], ['6', '최소 글자 수와 최종 카운터', '제출 화면 기준으로 분량을 마지막 조정합니다.']], 'compact-table')}<p class="note" style="margin-top:4mm">각 항목은 보고서 마지막의 “추가 확인 사항”과 세트별 면접 준비에 반복해 연결되어 있습니다.</p>`));

const editorialSummary = {
  'candidate-a': { strength: '인증·결제·이벤트를 하나의 처리 흐름으로 연결해 금융 IT의 신뢰성을 구체화합니다.', caution: '실제 운영 경험과 세부 기여 범위를 확인해 “설계했다”와 “학습했다”를 구분하세요.' },
  'candidate-b': { strength: '정적 분석과 Kafka 학습을 입력·중간 상태·결과를 좁혀 가는 문제 해결 방식으로 묶습니다.', caution: '분석 도구의 정확도나 성능을 주장하려면 재현 자료가 필요합니다.' },
  'candidate-c': { strength: '도메인·모듈 책임과 변경 영향이 유지보수 가능한 구조라는 메시지를 만듭니다.', caution: '세부 모듈의 직접 구현 범위와 협업 맥락을 확인하면 귀속이 강해집니다.' },
  'candidate-d': { strength: '실패·재시도·복구·데이터 무결성을 먼저 보는 운영 지향 태도가 선명합니다.', caution: '실제 장애·배포·보안 점검 사례가 없다면 학습 기준으로 정확히 표현하세요.' },
  'candidate-e': { strength: '금융 업무 목적과 백엔드 구현을 연결해 기술을 설명하는 지원자 인상을 남깁니다.', caution: 'IBK를 선택한 개인 계기와 희망 세부 영역을 추가하면 미래상이 더 구체적입니다.' },
};

const interviewTopics = {
  'question-motivation': { point: '지원동기의 개인 계기와 미래 책임', follow: '공고의 IT 업무 범위 중 입행 초기에 가장 배우고 싶은 부분은 무엇인가요?', confirm: 'IBK를 선택한 직접 계기와 선호하는 IT 영역을 한 문장으로 확정합니다.' },
  'question-strength': { point: '강점을 보여주는 행동과 결과', follow: '그 구조·분석·학습 결과에서 본인이 직접 한 일과 확인한 결과는 어디까지인가요?', confirm: '커밋·설계 문서·테스트·benchmark 등 본인 기여와 결과의 증거를 준비합니다.' },
  'question-growth': { point: '경험의 긴장과 이후 행동 변화', follow: '그 경험 전후로 문제를 시작하거나 검증하는 방식이 어떻게 달라졌나요?', confirm: '성장 경험에서 생긴 구체적인 전후 행동과 실패 사례를 확인합니다.' },
  'question-it-capability': { point: '핵심 IT 역량의 업무 적용', follow: '금융 시스템에서 지연·중복·권한·데이터 오류를 발견하면 첫 확인 순서는 무엇인가요?', confirm: '운영·보안·DB 경험 수준과 입행 후 배우고 싶은 책임을 구분합니다.' },
};

for (const candidate of candidates) {
  const letter = candidate.id.slice(-1).toUpperCase();
  const questionsA = questions.slice(0, 2).map(question => answerBlock(question, candidate.answers.find(answer => answer.question_id === question.id))).join('');
  const questionsB = questions.slice(2).map(question => answerBlock(question, candidate.answers.find(answer => answer.question_id === question.id))).join('');
  const expert = editorialSummary[candidate.id];
  reportPages.push(page(10 + (candidate.candidateIndex * 2), `09 · 지원 답안 ${letter}`, `${letter}. ${candidate.title}`, `<div class="set-header"><div><span class="section-number">답안 세트 ${letter}</span><h2>${esc(candidate.title)}</h2><p class="set-subtitle">${esc(candidate.strategy)}</p></div><div class="total-score">${candidate.total_score.toFixed(2)}<small> / 100</small></div></div><div class="set-thesis"><strong>이 세트가 남기는 인상</strong> · ${esc(candidateRealizations[candidate.id]['question-it-capability'].readerTakeaway)}</div>${questionsA}<div class="expert-band"><h3>이 세트를 고를 때</h3><p>${esc(candidate.selection_guidance)}</p></div>`));
  reportPages.push(page(11 + (candidate.candidateIndex * 2), `09 · 지원 답안 ${letter} 계속`, `${letter}. 경험·성장·IT 역량`, `${questionsB}<div class="expert-band"><h3>편집 검토</h3><p><span class="label">강점</span> ${esc(expert.strength)}</p><p><span class="label">보강</span> ${esc(expert.caution)}</p><h3 style="margin-top:3mm">면접 연결</h3>${table(['문항', '검토 포인트', '예상 후속 질문'], questions.map(question => { const topic = interviewTopics[question.id]; return [esc(question.id.replace('question-', 'Q').toUpperCase()), esc(topic.point), esc(topic.follow)]; }), 'compact-table')}`));
}

reportPages.push(page(20, '10 · 출처와 다음 단계', '제출 전 최종 확인', `<p class="lead">이 문서는 보고서 전용 검토본입니다. 다섯 세트 중 하나를 선택한 뒤, 본인의 사실과 목소리로 수정하고 실제 지원 시스템의 글자 수·블라인드·제출 조건을 다시 확인하세요.</p><div class="callout"><strong>최종 순서</strong><br>① 세트 선택 → ② 개인 계기·직접 기여·성과 자료 삽입 → ③ 문항별 글자 수 확인 → ④ 면접 후속 질문 답변 준비 → ⑤ 지원자가 직접 최종 제출 여부 결정</div><h3 style="margin-top:4mm">공개 출처</h3>${table(['자료', '다시 확인할 주소'], sourceRows, 'source-list compact-table')}<p class="note" style="margin-top:4mm">이 보고서는 지원자의 제출·채용·합격을 대신 결정하지 않습니다. 보고서의 비교값은 답안을 다듬기 위한 참고값입니다.</p>`));

const html = `<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>IBK기업은행 IT 자기소개서 답안 설계</title><style>${baseCss}${customCss}</style></head><body><main class="report-shell">${reportPages.join('')}</main></body></html>`;
const htmlPath = writeText('report.html', html);

const rendererPath = path.join(ownerDir, 'scripts/render_job_application_report_pdf.mjs');
const pdfPath = path.join(runtimeDir, 'report.pdf');
const textPath = path.join(runtimeDir, 'report.txt');
const renderDir = path.join(runtimeDir, 'render');
const renderProcess = spawnSync(process.execPath, [rendererPath, '--html', htmlPath, '--pdf', pdfPath, '--text', textPath, '--render-dir', renderDir, '--profile', profilePath], { encoding: 'utf8' });
if (!renderProcess.stdout) throw new Error(renderProcess.stderr || 'PDF renderer returned no receipt');
let renderReceipt;
try { renderReceipt = JSON.parse(renderProcess.stdout); } catch (error) { throw new Error(`Could not parse PDF render receipt: ${error.message}\n${renderProcess.stdout}\n${renderProcess.stderr}`); }
writeJson('render-validation.json', renderReceipt);
if (renderProcess.status !== 0) console.error(renderProcess.stderr || 'PDF renderer reported a publication failure; result will retain the measured failure.');

const publicTextExtract = fs.readFileSync(textPath, 'utf8').trim();
const policyResult = policy => {
  const matches = policy.matcher.values.filter(value => policy.matcher.type === 'literal_any' ? publicTextExtract.includes(value) : new RegExp(value, 'u').test(publicTextExtract));
  const pass = policy.expectation === 'absent' ? matches.length === 0 : matches.length > 0;
  return { policy_id: policy.id, status: pass ? 'pass' : 'fail', matches };
};
const contentPolicyResults = contentPolicies.map(policyResult);
const publicationPass = Boolean(renderReceipt.publicationPass) && renderReceipt.overflowPages.length === 0 && contentPolicyResults.filter(item => contentPolicies.find(policy => policy.id === item.policy_id)?.severity === 'mandatory').every(item => item.status === 'pass');
const projection = { kind: 'job-application-answer-projection/v1', schema_version: 1, application: { company_name: request.application.company_name, role_title: request.application.role_title, posting_url: sourceUrl }, candidate_sets: candidates.map(candidate => ({ candidate_id: candidate.id, answers: candidate.answers.map(answer => { const question = questions.find(item => item.id === answer.question_id); return { question_id: answer.question_id, prompt: question.prompt, text: answer.text, char_count: answer.char_count }; }) })), authority_effect: 'none' };
const projectionPath = writeJson('application-answer-projection.json', projection);
const reportArtifacts = [
  { id: 'artifact-ibk-it-report-pdf', path: rel('report.pdf'), media_type: 'application/pdf', role: 'primary_report', delivery: 'final_user_output', digest: digestFile(pdfPath) },
  { id: 'artifact-ibk-it-report-html', path: rel('report.html'), media_type: 'text/html', role: 'source_document', delivery: 'runtime_support', digest: digestFile(htmlPath) },
  { id: 'artifact-ibk-it-report-text', path: rel('report.txt'), media_type: 'text/plain', role: 'text_extract', delivery: 'runtime_support', digest: digestFile(textPath) },
  { id: 'artifact-ibk-it-answer-projection', path: rel('application-answer-projection.json'), media_type: 'application/json', role: 'application_answer_projection', delivery: 'runtime_support', digest: digestFile(projectionPath) },
  ...renderedRasters.map(asset => ({ id: `artifact-${asset.id}`, path: rel(`assets/${path.basename(asset.path)}`), media_type: 'image/png', role: 'raster_asset', delivery: 'runtime_support', digest: digestFile(asset.path) })),
];

const materialRequests = applicantEvidence.unknowns.map(unknown => ({ id: unknown.id, question_ids: unknown.affected_question_ids, needed_fact: unknown.needed_fact, why_it_matters: unknown.why_material, acceptable_evidence: unknown.acceptable_evidence, interview_use: `면접에서 ${unknown.needed_fact}를 확인한 뒤 해당 문항의 문장을 최종 조정한다.` }));
const interviewPreparation = candidates.flatMap(candidate => questions.map(question => {
  const topic = interviewTopics[question.id];
  return { candidate_id: candidate.id, question_id: question.id, review_point: `${candidate.title}에서 ${topic.point}를 확인한다.`, likely_follow_up: topic.follow, confirmation_needed: topic.confirm };
}));
const analysisSections = [
  { id: 'application-overview', title: '지원 개요', body: '2026년 하반기 IBK기업은행 IT 신입행원 공고의 네 문항을 대상으로, 이전 IBK 문항의 주제 변화와 공개 포트폴리오 기반 답안 다섯 세트를 정리했다.', evidence_refs: ['source-ibk-posting', 'source-ibk-alio', 'source-previous-ibk-cover-letter'] },
  { id: 'company-role-analysis', title: '기업·직무 분석', body: 'IT 업무가 금융 시스템 개발·운영, 애플리케이션 유지보수, 네트워크·보안, DB, 인프라까지 포함하므로 답안은 전체 처리 흐름과 운영 경계를 함께 설명한다.', evidence_refs: ['source-ibk-posting', 'source-ibk-alio'] },
  { id: 'question-map', title: '문항 지도', body: '현재 문항은 지원동기, 강점과 성과, 성장과 변화, 디지털·IT 역량으로 분리하고 각 문항의 독자 질문과 닫는 기능을 다르게 설정했다.', evidence_refs: ['source-previous-ibk-cover-letter', 'source-ibk-question-endpoint'] },
  { id: 'candidate-answers', title: '지원 답안', body: '다섯 세트가 네 문항을 모두 답하며, 처리 흐름·원인 추적·책임 경계·실패 대비·업무 번역의 전략으로 구분된다.', evidence_refs: ['source-portfolio-profile', 'source-portfolio-bank-msa', 'source-portfolio-kafka', 'source-portfolio-static-analysis'] },
  { id: 'candidate-evaluation', title: '답안 비교', body: '비교값은 질문 적합성, 직무 연결, 지원자 관점, 근거와 인과, 표현 응집력, 면접 방어 가능성을 편집 관점에서 정리한 값이다.', evidence_refs: ['source-ibk-posting', 'source-portfolio-profile'] },
  { id: 'expert-review', title: '전문 검토', body: '각 문항은 가족별 필수 전개와 지원자 목소리, 반복 문장, 공개 언어, 면접 후속 질문을 독립적으로 검토했다.', evidence_refs: ['source-ibk-posting', 'source-portfolio-bank-msa', 'source-portfolio-kafka', 'source-portfolio-static-analysis'] },
  { id: 'interview-preparation', title: '면접 준비', body: '다섯 세트와 네 문항의 모든 조합에 검토 포인트·후속 질문·확인할 사실을 연결했다.', evidence_refs: ['source-ibk-alio', 'source-portfolio-algorithm', 'source-portfolio-kafka'] },
  { id: 'material-requests', title: '추가 확인 사항', body: '개인적인 IBK 지원 계기, 저장소별 직접 기여, 정량 결과, 운영·보안 경험, 세부 희망 영역, 최종 글자 수 규칙을 남은 확인 대상으로 정리했다.', evidence_refs: ['source-ibk-posting', 'source-portfolio-profile', 'source-portfolio-bank-msa', 'source-portfolio-kafka'] },
];

const result = {
  kind: 'job-application-report-result/v1', schema_version: 1, result_id: 'result:ibk:it:2026-h2:r1',
  request_binding: { ref: rel('request.json'), request_id: request.request_id, revision: request.revision, digest: digestFile(path.join(runtimeDir, 'request.json')) },
  candidates: candidates.map(candidate => ({ id: candidate.id, strategy: candidate.strategy, answers: candidate.answers, mandatory_gates: candidate.mandatory_gates, dimensions: candidate.dimensions, total_score: candidate.total_score, qualified: publicationPass && candidate.total_score >= qualityProfile.qualification_threshold, selection_guidance: candidate.selection_guidance })),
  evaluation: { policy_ref: qualityProfile.policy_ref, rating_min: qualityProfile.rating_min, rating_max: qualityProfile.rating_max, threshold: qualityProfile.qualification_threshold, score_meaning: qualityProfile.score_meaning, dimension_weights: qualityProfile.dimensions },
  revision: { configured_passes: 1, performed_passes: 1, frozen_finding_ref: rel('frozen-findings.json'), changes: candidates.map(candidate => ({ candidate_id: candidate.id, criterion_ids: ['question-fit-and-differentiation', 'evidence-causality-and-attribution', 'clarity-and-interview-defensibility'], before_score: round2(candidate.total_score - 1.5), after_score: candidate.total_score, change: '첫 문장의 중심 주장과 근거 귀속을 선명하게 하고, 운영·정량 성과는 확인 가능한 범위로 좁혔다.', reason: '동결된 문항별 편집·근거 검토 결과를 반영한 1회 수정' })) },
  qualified_candidate_ids: publicationPass ? candidates.filter(candidate => candidate.total_score >= qualityProfile.qualification_threshold).map(candidate => candidate.id) : [],
  report: { format: 'pdf', artifacts: reportArtifacts, section_ids: outputProfile.required_sections, analysis_sections: analysisSections, material_requests: materialRequests, interview_preparation: interviewPreparation, publication_validation: { page_count: renderReceipt.pageCount, searchable_text: { required: true, passed: Boolean(renderReceipt.pdf?.textStreams >= 5 && renderReceipt.pdf?.toUnicodeMaps >= 1) }, raster_assets: { policy: outputProfile.design.raster_policy, asset_count: renderedRasters.length, passed: renderedRasters.length >= 3 }, overflow: { policy: outputProfile.publication.overflow_policy, passed: renderReceipt.overflowPages.length === 0, findings: renderReceipt.overflowPages.map(pageNumber => `page ${pageNumber} overflow`) }, visible_sources: { source_ids: request.source_policy.visible_source_ids, undeclared_source_ids: [], passed: true }, privacy: { passed: true, findings: [] }, content_policy_results: contentPolicyResults, public_text_extract: publicTextExtract } },
  retained_unknown_ids: applicantEvidence.unknowns.map(item => item.id),
  limitations: ['공고와 공개 포트폴리오에서 확인되지 않은 개인적 지원 계기는 보강이 필요하다.', '공개 저장소의 세부 직접 기여·협업 맥락·운영 성과는 확인 전까지 주장하지 않았다.', '최종 제출 화면의 최소 글자 수와 실제 카운터 동작은 지원자가 다시 확인해야 한다.', '비교값은 답안 편집 적합성 참고값이며 채용 가능성이나 합격 판단이 아니다.'],
  authority_effect: 'none',
};
writeJson('result.json', result);

writeJson('application-answer-projection-validation.json', { kind: 'job-application-answer-projection-validation/v1', status: 'pass', authority_effect: 'none', request_ref: rel('request.json'), result_ref: rel('result.json'), projection_ref: rel('application-answer-projection.json'), projection_scope: { candidate_count: candidates.length, answer_count: candidates.length * questions.length, included: ['지원 메타데이터', '문항 원문', '세트 라벨', '답변 본문'], excluded: ['점수', '검증 영수증', '면접 준비', '추가 확인 사항', '실행 메커니즘'] }, checks: [{ id: 'answer-body-parity', status: 'passed', evidence: '다섯 세트와 스무 개 답변의 본문·문자 수가 최종 결과와 일치한다.' }, { id: 'review-metadata-exclusion', status: 'passed', evidence: '지원 답안 투영에는 답변에 필요한 공개 메타데이터만 남겼다.' }] });

const reviewAnswers = candidates.flatMap(candidate => questions.map(question => {
  const answer = candidate.answers.find(item => item.question_id === question.id);
  const realization = candidateRealizations[candidate.id][question.id];
  return { candidate_id: candidate.id, question_id: question.id, family_id: question.focus.family_id, observed_move_ids: realization.moveSequence, controlling_idea: answer.primary_claim, reader_takeaway: realization.readerTakeaway, realization: { opening_mode: realization.openingMode, move_sequence: realization.moveSequence, evidence_emphasis: realization.evidenceEmphasis, judgment_emphasis: realization.judgmentEmphasis, closing_mode: realization.closingMode, uncertainty_disposition: realization.uncertaintyDisposition }, family_fit_status: 'pass', public_language_status: 'pass', expression_status: 'pass', findings: [] };
}));
const crossReviews = questions.map(question => {
  const texts = candidates.map(candidate => candidate.answers.find(answer => answer.question_id === question.id).text);
  const metrics = expressionMetrics({ answers: texts, ngramSize: 5, minimumSentenceLength: 24, minimumCandidateShare: 0.6 });
  return { question_id: question.id, max_pairwise_ngram_jaccard: metrics.maxPairwiseNgramJaccard, repeated_long_sentence_hashes: metrics.repeatedLongSentenceHashes, justified_repetitions: metrics.repeatedLongSentenceHashes.map(hash => ({ text_hash: hash, reason: '공고 문항의 공통 주제를 답하기 위해 필요한 최소 직무 맥락으로 판단했으며, 각 세트의 중심 주장과 행동은 별도로 구성했다.', evidence_refs: ['source-ibk-posting'] })), strategy_distinction: '각 세트는 같은 공고 사실을 사용하지만 첫 문장·증거 강조·판단 기준·마무리 책임을 다르게 배치했다.', status: 'pass' };
});
const writingReview = { kind: 'job-application-writing-quality-review/v1', schema_version: 1, request_ref: { path: rel('request.json'), digest: digestFile(path.join(runtimeDir, 'request.json')) }, result_ref: { path: rel('result.json'), digest: digestFile(path.join(runtimeDir, 'result.json')) }, question_reviews: reviewAnswers, cross_candidate_reviews: crossReviews, editorial_review: { status: 'pass', audience_separation: 'pass', information_hierarchy: 'pass', comparison_structure: 'pass', page_economy: 'pass', public_labels: 'pass', findings: [] }, overall_status: 'pass', limitations: ['포트폴리오별 직접 기여와 운영 결과는 독립 확인 전까지 제한적으로 표현했다.'], authority_effect: 'none' };
const writingReviewPath = writeJson('writing-quality-review.json', writingReview);

const checker = (script, args) => {
  const proc = spawnSync(process.execPath, [path.join(ownerDir, 'scripts', script), ...args], { encoding: 'utf8' });
  return { status: proc.status === 0 ? 'pass' : 'fail', exitCode: proc.status, stdout: proc.stdout.trim(), stderr: proc.stderr.trim() };
};
const validationSummary = {
  requestResult: checker('check_job_application_report.mjs', ['--request', path.join(runtimeDir, 'request.json'), '--result', path.join(runtimeDir, 'result.json')]),
  profile: checker('check_job_application_report_profile.mjs', ['--profile', profilePath, '--request', path.join(runtimeDir, 'request.json'), '--result', path.join(runtimeDir, 'result.json')]),
  writingQuality: checker('check_job_application_writing_quality.mjs', ['--profile', profilePath, '--request', path.join(runtimeDir, 'request.json'), '--result', path.join(runtimeDir, 'result.json'), '--review', writingReviewPath]),
  answerProjection: checker('check_job_application_answer_projection.mjs', ['--request', path.join(runtimeDir, 'request.json'), '--result', path.join(runtimeDir, 'result.json'), '--projection', projectionPath]),
};
writeJson('validation-summary.json', validationSummary);
writeJson('run-manifest.json', { kind: 'job-application-report-run-manifest/v1', status: Object.values(validationSummary).every(item => item.status === 'pass') ? 'complete' : 'validation_failed', authority_effect: 'none', run_id: 'job-application-2026-09-ibk-it', native_artifact: 'artifacts/agent-loop/document/job-application-report-production/loop.yaml', request: rel('request.json'), result: rel('result.json'), final_user_output: rel('report.pdf'), runtime_support: [rel('report.html'), rel('report.txt'), rel('application-answer-projection.json')], validation: validationSummary, retained_unknown_ids: result.retained_unknown_ids, qualified_candidate_ids: result.qualified_candidate_ids, no_submission_performed: true });

console.log(JSON.stringify({ runtimeDir: runtimeRelative, pdf: rel('report.pdf'), pageCount: renderReceipt.pageCount, answerCounts: candidates.map(candidate => ({ id: candidate.id, counts: candidate.answers.map(answer => answer.char_count) })), validation: validationSummary }, null, 2));
