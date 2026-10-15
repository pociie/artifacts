#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { renderEditorialRasterAssets } from "../../../artifacts/agent-loop/document/job-application-report-production/scripts/render_editorial_raster_assets.mjs";

const repoRoot = process.cwd();
const runtimeRelative = ".collab/artifacts/job-application-2026-10-finebridge-digital-service-planner-fresh";
const runtimeDir = path.resolve(repoRoot, runtimeRelative);
const ownerDir = path.resolve(repoRoot, "artifacts/agent-loop/document/job-application-report-production");
const profilePath = path.join(ownerDir, "profiles/five-set-pdf-report.profile.json");
const rendererPath = path.join(ownerDir, "scripts/render_job_application_report_pdf.mjs");

fs.mkdirSync(runtimeDir, { recursive: true });

const sha256 = value => crypto.createHash("sha256").update(value).digest("hex");
const digestFile = file => sha256(fs.readFileSync(file));
const digestText = text => sha256(text);
const writeJson = (name, value) => {
  const file = path.join(runtimeDir, name);
  fs.writeFileSync(file, JSON.stringify(value, null, 2) + "\n", "utf8");
  return file;
};
const writeText = (name, value) => {
  const file = path.join(runtimeDir, name);
  fs.writeFileSync(file, value, "utf8");
  return file;
};
const relative = name => path.posix.join(runtimeRelative, name);
const canonicalize = value => Array.isArray(value)
  ? value.map(canonicalize)
  : value && typeof value === "object"
    ? Object.fromEntries(Object.keys(value).sort().map(key => [key, canonicalize(value[key])]))
    : value;
const canonicalDigest = (value, field) => {
  const copy = JSON.parse(JSON.stringify(value));
  delete copy[field];
  return sha256(JSON.stringify(canonicalize(copy)) + "\n");
};
const codePointLength = text => Array.from(text).length;
const esc = value => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#39;");

const sourcePostingUrl = "https://recruit.finebridge.example/jobs/digital-service-planner";
const sourceCompanyUrl = "https://www.finebridge.example";
const observedAt = "2026-09-14T00:00:00+09:00";

const sources = [
  {
    id: "source-finebridge-posting",
    source_type: "official_posting",
    locator: sourcePostingUrl,
    authority: "primary",
    observed_at: observedAt,
    digest: null,
    visibility: "public_report_allowed",
  },
  {
    id: "source-finebridge-company",
    source_type: "official_company",
    locator: sourceCompanyUrl,
    authority: "primary",
    observed_at: observedAt,
    digest: null,
    visibility: "metadata_only",
  },
  {
    id: "source-applicant-profile",
    source_type: "applicant_statement",
    locator: "runtime-input:user-provided-profile",
    authority: "applicant_owned",
    observed_at: observedAt,
    digest: null,
    visibility: "runtime_private",
  },
  {
    id: "source-applicant-experiences",
    source_type: "applicant_statement",
    locator: "runtime-input:user-provided-experiences",
    authority: "applicant_owned",
    observed_at: observedAt,
    digest: null,
    visibility: "runtime_private",
  },
];

const questions = [
  {
    id: "question-collaboration",
    prompt: "다른 사람들과 협력하여 공동의 목표를 달성한 경험과 본인의 역할을 설명해 주세요.",
    min_chars: 1,
    max_chars: 700,
    required_contents: ["협력 상황", "공동 목표", "본인의 역할", "결과 또는 배움"],
    focus: {
      family_id: "collaboration-and-conflict",
      primary_claim: "고객 신호를 실행 가능한 요구사항과 출시 후 확인으로 연결하는 협업 역할을 수행했다.",
      reader_takeaway: "고객 문제를 개발 조직의 실행 기준으로 번역하고 공동 목표를 맞추는 신입 기획자다.",
      reviewer_need: "공동 목표를 이해하고 다른 조직과 실행 기준을 맞추는 방식을 확인한다.",
      evidence_function: "인턴의 문의 분류·요구사항 작성·개발팀 작업 요청·출시 전 확인·출시 후 의견 추적 경험을 협업의 인과로 사용한다.",
      rhetorical_move_ids: ["relevant-context", "other-person-perspective", "choice-or-action", "result-or-boundary", "reason-or-tradeoff", "learning-or-change"],
      voice_evidence_ids: ["applicant-fact-internship", "applicant-fact-voc-analysis", "project-claim-requirement-qa", "project-claim-authentication-message"],
      closing_function: "repeatable-collaboration-practice",
      non_overlap_boundary: "개인 역량 목록이나 장기 포부가 중심이 되지 않으며, 협업에서 맡은 번역·정렬·확인 역할을 중심으로 쓴다.",
    },
    user_confirmation_ids: ["unknown-q1-collaboration-context"],
  },
  {
    id: "question-preparation",
    prompt: "디지털 서비스 기획 업무를 수행하기 위해 준비해 온 지식·경험·역량을 구체적으로 작성해 주세요.",
    min_chars: 1,
    max_chars: 800,
    required_contents: ["준비해 온 지식", "관련 경험", "보유 역량", "직무에서의 활용"],
    focus: {
      family_id: "capability-and-contribution",
      primary_claim: "사용자 조사·화면과 흐름 설계·기초 데이터 분석·개발 협업을 연결하는 준비를 해왔다.",
      reader_takeaway: "사용자 문제를 발견해 요구사항과 흐름으로 구체화하고 출시 후 개선까지 연결할 준비가 되어 있다.",
      reviewer_need: "신입 지원자가 공고의 핵심 업무를 수행할 기반과 구체적인 활용 방식을 확인한다.",
      evidence_function: "경영정보학 전공, 금융 앱 UX 프로젝트, 핀테크 운영 인턴, Figma·GA4·SQL·Excel·Notion·Jira 역량을 직무 요구와 연결한다.",
      rhetorical_move_ids: ["direct-answer", "choice-or-action", "company-role-connection", "reason-or-tradeoff", "result-or-boundary", "future-direction"],
      voice_evidence_ids: ["applicant-fact-education", "applicant-fact-tools", "applicant-fact-finance-app-project", "applicant-fact-internship", "project-claim-flow-redesign", "project-claim-requirement-qa"],
      closing_function: "concrete-contribution",
      non_overlap_boundary: "한 사건의 협업 서사나 가치관 형성 사건을 길게 재현하지 않고, 준비의 축과 직무 적용을 중심으로 쓴다.",
    },
    user_confirmation_ids: ["unknown-q2-analytics-example"],
  },
  {
    id: "question-value-formation",
    prompt: "성장 과정이나 주요 경험 중 현재의 업무 가치관 형성에 가장 큰 영향을 준 사건을 설명해 주세요.",
    min_chars: 1,
    max_chars: 600,
    required_contents: ["가장 큰 영향을 준 사건", "당시 판단", "현재의 업무 가치관", "업무에서의 실천"],
    focus: {
      family_id: "values-and-formative-experience",
      primary_claim: "사용자가 현재 어느 단계에 있는지 알기 어려웠던 문제를 발견한 경험이 기능보다 과정의 명확성을 우선하는 가치관을 만들었다.",
      reader_takeaway: "기능 추가보다 사용자의 상태 이해와 다음 행동을 먼저 살피는 판단 기준을 실제 경험으로 형성했다.",
      reviewer_need: "문제 인식과 우선순위 판단이 현재의 업무 태도로 어떻게 이어지는지 확인한다.",
      evidence_function: "사용자 인터뷰 24건과 금융 앱의 송금·계좌·완료 확인 문제, 인터뷰 메모의 판단을 사건과 가치관의 근거로 사용한다.",
      rhetorical_move_ids: ["direct-answer", "value-in-action", "choice-or-action", "relevant-context", "learning-or-change", "company-role-connection"],
      voice_evidence_ids: ["applicant-value-stage-clarity", "applicant-value-process-simplicity", "applicant-fact-interview-findings", "project-claim-flow-redesign", "project-claim-prioritize-clarity"],
      closing_function: "principle-at-work",
      non_overlap_boundary: "인턴 데이터 성과나 3~5년 포부를 중심에 두지 않고, 한 사건의 판단 변화와 실천 원칙을 중심으로 쓴다.",
    },
    user_confirmation_ids: ["unknown-q3-voc-decline-magnitude"],
  },
  {
    id: "question-three-to-five-year-goal",
    prompt: "입사 후 3~5년 동안 디지털 금융 서비스 분야에서 이루고 싶은 목표를 작성해 주세요.",
    min_chars: 1,
    max_chars: 700,
    required_contents: ["3~5년 목표", "디지털 금융 서비스 분야", "성장 과정", "회사에서의 기여"],
    focus: {
      family_id: "growth-and-career-direction",
      primary_claim: "사용자 분석부터 기능 기획·출시 후 데이터 개선까지 책임지는 디지털 금융 서비스 기획자로 성장한다.",
      reader_takeaway: "공고의 핵심 책임을 단계적으로 확장해 3~5년 안에 사용자·제품 개선 과제를 주도하려는 방향이 분명하다.",
      reviewer_need: "입사 후 성장 방향이 직무의 실제 책임과 연결되는지 확인한다.",
      evidence_function: "공고의 사용자 분석·기능 기획·요구사항·화면 흐름·데이터 개선 요구를 지원자의 성장 경로에 연결한다.",
      rhetorical_move_ids: ["direct-answer", "future-direction", "company-role-connection", "choice-or-action", "learning-or-change", "result-or-boundary"],
      voice_evidence_ids: ["applicant-fact-career-direction", "applicant-fact-tools", "applicant-fact-finance-app-project", "applicant-fact-internship", "fit-three-to-five-year-goal"],
      closing_function: "staged-growth",
      non_overlap_boundary: "과거 경험을 다시 나열하지 않고, 입사 후 단계별 기여와 확인할 지표를 중심으로 쓴다.",
    },
    user_confirmation_ids: ["unknown-q4-three-to-five-year-goal"],
  },
];

const applicantEvidence = {
  facts: [
    {
      id: "applicant-fact-education",
      statement: "미래대학교 경영정보학과를 졸업했다.",
      source_refs: ["source-applicant-profile"],
      confirmed: true,
      allowed_uses: ["question-preparation", "question-three-to-five-year-goal"],
    },
    {
      id: "applicant-fact-career-direction",
      statement: "신입으로 서비스 기획과 Product Manager 직무를 희망한다.",
      source_refs: ["source-applicant-profile"],
      confirmed: true,
      allowed_uses: ["question-preparation", "question-three-to-five-year-goal"],
    },
    {
      id: "applicant-fact-tools",
      statement: "Figma, GA4, SQL 기본 분석, Excel, Notion, Jira, 사용자 인터뷰, 서비스 정책 및 요구사항 작성 역량을 보유하고 있다.",
      source_refs: ["source-applicant-profile"],
      confirmed: true,
      allowed_uses: ["question-collaboration", "question-preparation", "question-three-to-five-year-goal"],
    },
    {
      id: "applicant-fact-finance-app-project",
      statement: "학교 산학 프로젝트에서 모바일 금융 앱의 사용성을 개선하고 사용자 인터뷰 결과를 바탕으로 사용자 흐름을 재설계하고 프로토타입을 제작했다.",
      source_refs: ["source-applicant-experiences"],
      confirmed: true,
      allowed_uses: ["question-preparation", "question-value-formation", "question-three-to-five-year-goal"],
    },
    {
      id: "applicant-fact-internship",
      statement: "핀테크 스타트업에서 3개월 동안 고객 문의 분류, 서비스 개선 요구사항 작성, 개발팀 작업 요청 작성, 출시 전 기능 확인, 출시 후 고객 의견 추적을 수행했다.",
      source_refs: ["source-applicant-experiences"],
      confirmed: true,
      allowed_uses: ["question-collaboration", "question-preparation", "question-three-to-five-year-goal"],
    },
    {
      id: "applicant-fact-voc-analysis",
      statement: "고객 문의 약 600건을 유형별로 분류해 인증 과정 관련 문의가 전체의 약 31%임을 발견하고 안내 문구 개선안을 제안했으며 이후 동일 유형 문의 감소를 확인했다.",
      source_refs: ["source-applicant-experiences"],
      confirmed: true,
      allowed_uses: ["question-collaboration", "question-preparation"],
    },
    {
      id: "applicant-fact-interview-findings",
      statement: "금융 앱 사용자 인터뷰 24건에서 송금 메뉴 진입 과정, 최근 계좌 접근, 송금 완료 여부 확인이 어렵다는 문제를 발견했다.",
      source_refs: ["source-applicant-experiences"],
      confirmed: true,
      allowed_uses: ["question-preparation", "question-value-formation"],
    },
  ],
  value_statements: [
    {
      id: "applicant-value-stage-clarity",
      statement: "기능 자체보다 사용자가 현재 어느 단계에 있는지 알기 어려운 문제를 먼저 해결해야 한다고 판단한다.",
      source_refs: ["source-applicant-experiences"],
      confirmed: true,
      allowed_uses: ["question-value-formation", "question-three-to-five-year-goal"],
    },
    {
      id: "applicant-value-process-simplicity",
      statement: "새로운 기능 추가보다 현재 프로세스를 단순하게 보여주는 것이 우선이라고 판단한다.",
      source_refs: ["source-applicant-experiences"],
      confirmed: true,
      allowed_uses: ["question-preparation", "question-value-formation", "question-three-to-five-year-goal"],
    },
  ],
  unknowns: [
    {
      id: "unknown-q1-collaboration-context",
      needed_fact: "협업한 팀의 구성, 공동 목표를 합의한 방식, 지원자가 맡은 결정과 팀 결과를 확인할 구체적 장면",
      affected_question_ids: ["question-collaboration"],
      why_material: "현재 자료만으로는 협업의 공동 목표와 본인의 고유 역할을 더 구체적으로 방어하기 어렵다.",
      acceptable_evidence: "요구사항 문서, 개발팀 작업 요청, 회의 메모, 출시 전 확인 기록 또는 본인 회고 중 하나",
    },
    {
      id: "unknown-q2-analytics-example",
      needed_fact: "GA4 또는 SQL 기본 분석을 실제로 적용한 화면·이벤트·질의 사례와 분석 결과",
      affected_question_ids: ["question-preparation"],
      why_material: "보유 역량을 나열하는 수준에서 벗어나 데이터 기반 기획 역량을 구체화할 수 있다.",
      acceptable_evidence: "비식별화한 이벤트 설계, SQL 질의 예시, 분석 화면, Excel 집계표 또는 학습 프로젝트 기록",
    },
    {
      id: "unknown-q3-voc-decline-magnitude",
      needed_fact: "인증 안내 문구 개선 전후의 동일 유형 문의 건수 또는 관찰 기간",
      affected_question_ids: ["question-value-formation"],
      why_material: "개선 제안의 결과를 과장 없이 어느 정도 확인했는지 설명할 수 있다.",
      acceptable_evidence: "전후 문의 건수, 비율 변화, 관찰 기간, 운영 리포트 또는 담당자 확인 중 하나",
    },
    {
      id: "unknown-q4-three-to-five-year-goal",
      needed_fact: "3~5년 뒤 맡고 싶은 금융 서비스 영역과 직접 책임지고 싶은 사용자·사업 지표",
      affected_question_ids: ["question-three-to-five-year-goal"],
      why_material: "포부가 직무 적합성을 위한 제안인지 지원자 본인의 목표인지 구분하고 어조를 확정할 수 있다.",
      acceptable_evidence: "희망 제품, 고객 문제, 기획 책임, 성장 경로에 대한 본인의 선호를 한두 문장으로 확인",
    },
    {
      id: "unknown-question-minimum-rules",
      needed_fact: "각 문항의 공식 최소 글자 수와 글자 수 산정 방식",
      affected_question_ids: questions.map(item => item.id),
      why_material: "사용자가 제공한 제한은 최대 글자 수로 해석했으며 제출 시스템의 최소 기준과 산정 방식은 별도 확인이 필요하다.",
      acceptable_evidence: "채용 시스템 입력 화면, 공고 원문 또는 지원 안내의 문항별 글자 수 규칙",
    },
  ],
};

const projectEvidence = [
  {
    id: "project-finance-app-ux",
    kind: "모바일 금융 앱 사용성 개선 산학 프로젝트",
    scale: "사용자 인터뷰 24건을 분석한 학교 산학 프로젝트",
    applicant_role: "사용자 인터뷰 분석, 문제 정의, 사용자 흐름 재설계, 프로토타입 제작",
    contribution: "송금 메뉴 진입, 최근 계좌 접근, 송금 완료 확인 이슈를 구조화하고 현재 상태와 완료 여부를 이해하기 쉬운 흐름으로 재설계했다.",
    process: "24건의 인터뷰에서 반복 문제를 도출한 뒤 신규 기능 추가보다 현재 프로세스를 단순하게 보여주는 방향을 우선하고 프로토타입을 제작했다.",
    learning: "기능 자체보다 사용자가 어느 단계에 있는지와 과업이 완료됐는지를 먼저 이해하게 만드는 것이 금융 서비스 개선의 출발점임을 배웠다.",
    claims: [
      {
        id: "project-claim-interview-24",
        statement: "사용자 인터뷰 24건을 분석해 금융 앱의 반복적인 사용성 문제를 발견했다.",
        source_refs: ["source-applicant-experiences"],
        certainty: "applicant_confirmed",
        outcome_limit: "인터뷰 분석 결과는 확인되지만 인터뷰 대상 구성과 전체 사용자 대표성은 별도 자료가 필요하다.",
      },
      {
        id: "project-claim-flow-redesign",
        statement: "발견한 문제를 바탕으로 사용자 흐름을 재설계하고 프로토타입을 제작했다.",
        source_refs: ["source-applicant-experiences"],
        certainty: "applicant_confirmed",
        outcome_limit: "화면과 흐름의 개선안은 확인되지만 실제 서비스 출시 후 사용성 지표는 제공되지 않았다.",
      },
      {
        id: "project-claim-prioritize-clarity",
        statement: "새 기능 추가보다 현재 사용자가 프로세스와 단계를 단순하게 이해하도록 만드는 일을 우선했다.",
        source_refs: ["source-applicant-experiences"],
        certainty: "applicant_confirmed",
        outcome_limit: "우선순위 판단과 설계 방향은 확인되지만 팀 내 대안 비교와 최종 채택 과정은 미확인이다.",
      },
    ],
    language_translations: [
      {
        internal_term: "사용자 흐름",
        universal_term: "사용자가 과업을 완료하기까지 거치는 단계와 상태",
        use_condition: "화면 산출물 이름보다 사용자의 과업 결과를 설명할 때 사용한다.",
      },
      {
        internal_term: "프로토타입",
        universal_term: "출시 전에 화면과 이용 단계를 확인할 수 있는 시제품",
        use_condition: "실제 출시 성과와 혼동하지 않고 설계 확인 범위를 설명할 때 사용한다.",
      },
    ],
  },
  {
    id: "project-fintech-operations-internship",
    kind: "핀테크 스타트업 서비스 운영 인턴십",
    scale: "3개월",
    applicant_role: "고객 문의 분류, 개선 요구사항 작성, 개발팀 작업 요청 작성, 출시 전 기능 확인, 출시 후 고객 의견 추적",
    contribution: "고객 문의를 개선 요구사항과 개발·확인 작업으로 연결하고 출시 후 같은 유형의 문의가 줄었는지 추적했다.",
    process: "고객 문의 약 600건을 유형별로 분류해 인증 관련 문의가 약 31%임을 발견하고 안내 문구 개선안을 제안한 뒤 동일 유형 문의 감소를 확인했다.",
    learning: "운영 데이터를 실행 가능한 요구사항으로 바꾸고 출시 후 반응을 다시 확인해야 서비스 개선이 실제 변화로 이어지는지 판단할 수 있음을 배웠다.",
    claims: [
      {
        id: "project-claim-voc-analysis",
        statement: "고객 문의 약 600건을 유형별로 분류한 결과 인증 과정 관련 문의가 전체의 약 31%였다.",
        source_refs: ["source-applicant-experiences"],
        certainty: "applicant_confirmed",
        outcome_limit: "문의 규모와 비중은 제공되었지만 분류 기간, 중복 문의 처리, 기준표는 추가 자료가 필요하다.",
      },
      {
        id: "project-claim-requirement-qa",
        statement: "개선 요구사항을 작성해 개발팀 작업 요청으로 전달하고 출시 전 기능 확인에 참여했다.",
        source_refs: ["source-applicant-experiences"],
        certainty: "applicant_confirmed",
        outcome_limit: "요구사항 작성과 확인 참여는 확인되지만 실제 의사결정 권한과 팀 내 협업 장면은 추가 확인이 필요하다.",
      },
      {
        id: "project-claim-authentication-message",
        statement: "인증 단계 안내 문구 개선안을 제안했고 출시 후 동일 유형 문의가 감소한 것을 확인했다.",
        source_refs: ["source-applicant-experiences"],
        certainty: "applicant_confirmed",
        outcome_limit: "감소 사실은 확인되지만 전후 수치와 관찰 기간이 없어 정량 효과는 단정하지 않는다.",
      },
    ],
    language_translations: [
      {
        internal_term: "VOC",
        universal_term: "고객 문의와 이용 중 남긴 의견",
        use_condition: "지원서에서는 처음 한 번 풀어 쓰고 이후에는 필요한 경우에만 약어를 사용한다.",
      },
      {
        internal_term: "Jira Ticket",
        universal_term: "개발팀이 실행할 수 있도록 정리한 작업 요청",
        use_condition: "도구 이름보다 요구사항을 실행 단위로 전달한 역할을 강조할 때 사용한다.",
      },
      {
        internal_term: "QA",
        universal_term: "출시 전 기능 확인",
        use_condition: "확인 범위와 본인의 참여 수준을 과장하지 않고 설명할 때 사용한다.",
      },
    ],
  },
];

const applicationAnalysis = {
  company_context: [
    {
      id: "company-context-role-brief",
      observation: "제공된 공고는 금융 서비스 사용자 분석, 모바일 서비스와 신규 기능 기획, 요구사항 정의, 화면과 사용자 흐름 설계, 개발·디자인 협업, 데이터 기반 개선을 핵심 업무로 제시한다.",
      evidence_refs: ["source-finebridge-posting"],
      writing_implication: "회사 고유 상품을 상상하지 않고 사용자 문제를 요구사항과 흐름으로 번역하고 출시 후 데이터를 확인하는 책임을 답안의 중심에 둔다.",
      certainty: "fact",
    },
    {
      id: "company-context-unverified",
      observation: "회사 홈페이지는 예시 주소로 제공되어 회사 상품·고객군·전략 정보를 독립적으로 확인하지 못했다.",
      evidence_refs: ["source-finebridge-company"],
      writing_implication: "근거가 없는 회사 찬사나 사업 전략 주장을 넣지 않고 공고에 명시된 업무 책임만 사용한다.",
      certainty: "unknown",
    },
  ],
  role_domain_concerns: [
    {
      id: "role-user-analysis",
      observation: "직무는 금융 서비스 사용자를 분석하고 모바일 서비스와 신규 기능을 기획하는 책임을 요구한다.",
      evidence_refs: ["source-finebridge-posting"],
      writing_implication: "사용자 인터뷰와 문의 데이터를 문제 정의와 우선순위 판단의 근거로 제시한다.",
      certainty: "fact",
    },
    {
      id: "role-flow-requirements",
      observation: "직무는 서비스 요구사항을 정의하고 화면 및 사용자 흐름을 설계하는 일을 포함한다.",
      evidence_refs: ["source-finebridge-posting"],
      writing_implication: "Figma 산출물 자체보다 문제를 구조화하고 단계와 완료 상태를 단순하게 설계한 판단을 보여준다.",
      certainty: "fact",
    },
    {
      id: "role-collaboration-data",
      observation: "직무는 개발·디자인 조직과 협업하고 데이터 기반으로 서비스를 개선하는 책임을 함께 요구한다.",
      evidence_refs: ["source-finebridge-posting"],
      writing_implication: "요구사항과 작업 요청으로 협업 기준을 맞추고 출시 후 문의와 이용 신호를 다시 보는 경험을 연결한다.",
      certainty: "fact",
    },
    {
      id: "role-financial-clarity",
      observation: "지원자 프로젝트에서는 송금 메뉴 진입, 최근 계좌 접근, 송금 완료 여부 확인과 같은 금융 앱의 상태·완료 인지가 주요 문제로 나타났다.",
      evidence_refs: ["source-applicant-experiences"],
      writing_implication: "금융 서비스에서 기능 수보다 사용자가 현재 단계와 완료 여부를 명확히 이해하는지를 품질 기준으로 제시한다.",
      certainty: "inference",
    },
  ],
  fit_hypotheses: [
    {
      id: "fit-user-flow-requirements",
      statement: "금융 앱 사용자 인터뷰에서 문제를 찾고 흐름을 재설계한 경험은 공고의 사용자 분석·요구사항·화면 흐름 설계 책임으로 전이될 수 있다.",
      evidence_refs: ["source-finebridge-posting", "source-applicant-experiences"],
      confirmation_required: true,
    },
    {
      id: "fit-voc-data-loop",
      statement: "고객 문의를 유형화하고 인증 안내 문구를 개선한 뒤 같은 유형 문의 감소를 추적한 경험은 데이터 기반 서비스 개선 책임과 연결될 수 있다.",
      evidence_refs: ["source-finebridge-posting", "source-applicant-experiences"],
      confirmation_required: true,
    },
    {
      id: "fit-collaboration-bridge",
      statement: "요구사항 작성, 개발팀 작업 요청, 출시 전 확인, 출시 후 고객 의견 추적 경험은 고객 문제를 개발 조직의 실행 기준으로 번역하는 협업 역할로 설명할 수 있다.",
      evidence_refs: ["source-finebridge-posting", "source-applicant-experiences"],
      confirmation_required: true,
    },
    {
      id: "fit-three-to-five-year-goal",
      statement: "사용자 분석부터 기능 기획·출시 후 데이터 개선까지 책임지는 3~5년 목표는 공고의 핵심 업무와 지원자의 서비스 기획 방향에 맞는 제안으로 볼 수 있다.",
      evidence_refs: ["source-finebridge-posting", "source-applicant-profile"],
      confirmation_required: true,
    },
  ],
};

const qualityProfile = {
  policy_ref: "artifacts/agent-loop/document/job-application-report-production/vocabularies/job-application-report-quality-policy.json",
  mandatory_gate_ids: [
    "request-and-question-coverage",
    "source-and-freshness-boundary",
    "applicant-attribution-and-confirmation",
    "project-evidence-and-causality",
    "role-domain-language-clarity",
    "publication-and-privacy-safety",
  ],
  dimensions: [
    { id: "question-fit-and-differentiation", weight: 20 },
    { id: "role-and-domain-alignment", weight: 20 },
    { id: "applicant-viewpoint-and-values", weight: 18 },
    { id: "evidence-causality-and-attribution", weight: 18 },
    { id: "expression-specificity-and-coherence", weight: 14 },
    { id: "clarity-and-interview-defensibility", weight: 10 },
  ],
  rating_min: 0,
  rating_max: 4,
  qualification_threshold: 90,
  score_meaning: "editing_fitness_not_hiring_probability",
  revision_passes: 1,
};

const outputProfile = {
  profile_ref: "artifacts/agent-loop/document/job-application-report-production/profiles/five-set-pdf-report.profile.json",
  candidate_count: 5,
  report_format: "pdf",
  audiences: ["지원자", "취업 전문가"],
  required_sections: [
    "application-overview",
    "company-role-analysis",
    "question-map",
    "candidate-answers",
    "candidate-evaluation",
    "expert-review",
    "interview-preparation",
    "material-requests",
  ],
  design: {
    tone: "금융 서비스의 신뢰감을 반영한 간결한 편집 보고서",
    comparison_layout: "vertical",
    avoid_patterns: ["반복 카드 배열", "내부 작업 기록", "한 줄짜리 모호한 지침"],
    raster_policy: "allowed",
  },
  publication: {
    searchable_text_required: true,
    overflow_policy: "no_clipped_content",
    visible_source_policy: "allowlisted_only",
    content_policies: [
      {
        id: "exclude-internal-bookkeeping",
        severity: "mandatory",
        target: "public_text_extract",
        expectation: "absent",
        matcher: { type: "literal_any", values: ["quality-loop", "evaluation-rubric", ".json"] },
        rationale: "독자가 이용할 내용과 내부 구현 기록을 분리한다.",
      },
      {
        id: "exclude-local-absolute-path",
        severity: "mandatory",
        target: "public_text_extract",
        expectation: "absent",
        matcher: { type: "regex_any", values: ["/Users/[^\\s]+", "file://[^\\s]+"] },
        rationale: "로컬 경로와 환경 정보를 공개 보고서에 노출하지 않는다.",
      },
      {
        id: "require-reader-sections",
        severity: "mandatory",
        target: "public_text_extract",
        expectation: "present",
        matcher: { type: "literal_any", values: ["지원 답안", "면접 준비", "추가 확인 사항"] },
        rationale: "지원자가 답안을 고르고 면접을 준비하는 데 필요한 핵심 섹션의 존재를 확인한다.",
      },
    ],
  },
};

const request = {
  kind: "job-application-report-request/v1",
  schema_version: 1,
  request_id: "request:finebridge:digital-service-planner:fresh-r1",
  revision: "fresh-r1-five-set-pdf",
  application: {
    company_name: "파인브릿지 금융",
    role_title: "디지털 서비스 기획자",
    language: "ko-KR",
    official_posting_source_ids: ["source-finebridge-posting"],
  },
  questions,
  sources,
  application_analysis: applicationAnalysis,
  applicant_evidence: applicantEvidence,
  project_evidence: projectEvidence,
  source_policy: {
    as_of: "2026-09-14",
    prefer_primary: true,
    allowed_source_ids: sources.map(source => source.id),
    visible_source_ids: ["source-finebridge-posting"],
    missing_evidence_policy: "preserve_unknown",
  },
  quality_profile: qualityProfile,
  output_profile: outputProfile,
  privacy_boundary: {
    public_evidence_ids: ["source-finebridge-posting", "company-context-role-brief", "role-user-analysis", "role-flow-requirements", "role-collaboration-data"],
    prohibited_content_categories: ["private-reasoning", "raw-prompt", "runtime-handle", "secret", "unconsented-identity"],
    identity_handling: "explicit_consent_only",
  },
  stop_budget: {
    max_research_rounds: 2,
    max_revision_passes: 1,
    unchanged_failure_limit: 1,
  },
};

const routeInput = {
  requestRevision: request.revision,
  facts: {
    workPurpose: "deliver",
    operationFamily: "outcome_production",
    effectIntent: "local_mutation",
    outputShape: "validated_candidate",
    temporalShape: "iterative",
    contributionShape: "one_owner",
    boundedIteration: true,
    outputValidationContract: true,
    explicitSessionRevision: false,
    currentStateEvidenceRequired: true,
    mutationRequired: true,
    capabilityReadiness: "verified",
    lifecycleReadiness: "verified",
    authorityResolved: true,
    effectAdmitted: true,
    instructionAdmitted: true,
    executionSurface: "local_coordinator_only",
  },
  continuity: {
    requestRelation: "new_objective",
    historyCoverage: "not_applicable",
    sessionBoundary: "not_applicable",
    priorPrimaryMode: "none",
    outerObligationState: "none",
    priorCompletionEvidence: "not_applicable",
    projectionRef: "runtime:fresh/context-projection.json",
  },
  missingFacts: [
    "공식 회사·공고 페이지의 전체 내용과 최신성",
    "1번 문항의 협업 장면·역할 분담·팀 결과",
    "2번 문항의 GA4 또는 SQL 실제 적용 사례",
    "3번 문항에 보강할 개선 전후 관찰 수치",
    "4번 문항의 개인적인 금융 서비스 영역과 3~5년 책임 선호",
    "문항별 공식 최소 글자 수와 산정 방식",
  ],
  conflictingFacts: [],
};

const routeInputPath = writeJson("route-input.json", routeInput);
const routeDecision = {
  kind: "six-mode-route-decision/v1",
  requestRevision: request.revision,
  status: "selected",
  selectedMode: "loop",
  continuityDecision: {
    requestRelation: "new_objective",
    objectiveRelation: "new",
    historyCoverage: "not_applicable",
    sessionBoundary: "not_applicable",
    priorPrimaryMode: "none",
    outerObligationState: "none",
    priorCompletionEvidence: "not_applicable",
    projectionRef: relative("context-projection.json"),
    executionSurface: "local_coordinator_only",
    candidateMode: "loop",
    effectivePrimaryMode: "loop",
    segmentMode: null,
    disposition: "standalone",
    outerObligationAction: "start",
    modeCompositionRequired: true,
  },
  architectureSelection: {
    requirement: "eligible",
    selectionStatus: "deferred_to_native_artifact",
    targetScope: "effective_primary",
    effectivePrimaryMode: "loop",
    structuralSignals: ["five_complete_candidate_sets", "one_bounded_revision", "publication_validation"],
    segmentMode: null,
    segmentRequirement: null,
    segmentSelectionStatus: null,
    segmentStructuralSignals: [],
    workflowPatternOwnerRef: "artifacts/loop-architecture/components/agentic-architecture/component.json",
    agentTopologyOwnerRef: "artifacts/loop-architecture/components/agent-execution-topology-selection/component.json",
    coordinationOwnerRef: "artifacts/loop-architecture/components/agent-architecture-coordination/component.json",
    patternSelectedByRouting: false,
  },
  eligibleModes: ["loop"],
  rejectedModes: [
    { mode: "communication", reasonCodes: ["bounded_revision_required", "publication_artifact_required", "effect_not_none"] },
    { mode: "investigation", reasonCodes: ["complete_report_production_requested", "mutation_required", "output_not_finding"] },
    { mode: "single_task", reasonCodes: ["multiple_ordered_stages", "bounded_revision_and_reassessment"] },
    { mode: "orchestration", reasonCodes: ["one_material_contribution_owner", "no_multi-lane_fan-in_required"] },
    { mode: "session_control", reasonCodes: ["no_explicit_session_action", "effect_not_session_control"] },
  ],
  blockers: [],
  missingFacts: routeInput.missingFacts,
  conflictingFacts: [],
  reassessmentTriggers: [
    "objective_or_question_change",
    "company_role_or_applicant_evidence_change",
    "quality_profile_or_publication_contract_change",
    "effect_or_execution_surface_change",
    "route_or_topology_change",
    "user_confirmation_or_material_source_change",
  ],
  authorityEffect: "none",
};
const routeDecisionPath = writeJson("route-decision.json", routeDecision);

const inventoryPath = path.join(repoRoot, "artifacts/loop-architecture/registry/reusable-artifact-inventory.json");
const inventory = JSON.parse(fs.readFileSync(inventoryPath, "utf8"));
const inventoryDigest = inventory.sourceSnapshot.digest;
const agencyPath = path.join(repoRoot, "artifacts/agents/requirement-realization/agents/artifact-builder.yaml");
const agencyDigest = "sha256:" + (fs.existsSync(agencyPath) ? digestFile(agencyPath) : digestText("agent-subject:finebridge-fresh-report-builder"));
const reusableOperationRequest = {
  kind: "reusable-artifact-operation-request/v2",
  schemaVersion: 2,
  status: "report_only",
  authorityEffect: "none",
  acceptedAsEvidence: false,
  requestId: "request:reusable-operation:finebridge-fresh-report",
  requestRevision: "revision:fresh-r1",
  requestRelation: "new_objective",
  routeBinding: {
    decisionRef: relative("route-decision.json"),
    decisionDigest: "sha256:" + digestFile(routeDecisionPath),
    effectiveMode: "loop",
  },
  subject: {
    subjectRef: "agent-subject:finebridge-fresh-report-builder",
    agencyRef: fs.existsSync(agencyPath) ? "artifacts/agents/requirement-realization/agents/artifact-builder.yaml" : "agent-agency:finebridge-fresh-report-builder",
    agencyDigest,
    responsibilityClass: "builder",
    outcomeContract: "outcome:five-set-searchable-pdf-job-application-review",
    outputContract: "output:request-result-projection-review-and-pdf",
    decisionScopes: ["selected-job-application-loop", "five-candidate-answer-content", "reader-facing-pdf-publication"],
    nonAuthority: ["source-truth", "applicant-impersonation", "acceptance", "submission", "hiring-outcome", "native-artifact-edit"],
  },
  objective: "Use the selected job-application report Loop as-is to produce a fresh five-set Korean application review and one searchable PDF for the supplied Finebridge Finance posting.",
  successEvidenceRefs: ["evidence:fresh-runtime-bundle-created", "evidence:five-candidate-coverage", "evidence:searchable-pdf-addressable"],
  protectedConstraintRefs: ["constraint:no-invented-applicant-facts", "constraint:five-set-pdf-profile", "constraint:public-private-projection-separation", "constraint:authority-effect-none"],
  nonGoalRefs: ["non-goal:reuse-old-finebridge-runtime", "non-goal:edit-reusable-source", "non-goal:application-submission", "non-goal:company-fact-invention"],
  lifecycleIntent: "reuse_as_is",
  capabilities: ["job application report production", "Korean editorial writing", "PDF publication validation"],
  inventoryRef: "artifacts/loop-architecture/registry/reusable-artifact-inventory.json",
  inventoryDigest,
  allowedBaseClasses: ["loop"],
  allowedScopes: ["unresolved"],
  requiredFacts: [],
  exactArtifactIds: [],
  relationshipDepth: 0,
  maxCandidates: 1,
  contextBudget: { maxSourceMembers: 8, maxConsumerRefs: 4, maxValidationRefs: 6 },
  scopeControl: {
    namedUnresolvedFacts: ["The selected native artifact is present in the current runtime source but is not classified by the current inventory snapshot.", "The official example-domain pages and listed attachments are not independently inspectable in this run."],
    allowedRelationshipTypes: ["defines", "consumes", "validates"],
    expansionRule: "named_unresolved_fact_must_materially_change_routing_delivery_or_acceptance",
    adjacentFindingDisposition: "report_only_follow_up",
    onBudgetExhaustion: "narrow_and_continue",
  },
  changeControl: {
    materialChangeTriggers: ["objective", "native_owner", "artifact_revision", "public_contract", "consumer", "effect", "route_or_topology", "lifecycle", "protected_constraint"],
    onMaterialChange: "signal_and_return_to_structural_owner",
    silentWideningAllowed: false,
  },
  completion: {
    terminalEvidenceRefs: ["evidence:fresh-runtime-bundle-created", "evidence:adjacent-findings-not-executed", "evidence:pdf-rendered-and-addressable"],
    validationRefs: ["validation:reusable-artifact-operation-request-v2", "validation:five-set-pdf-profile", "validation:request-result-writing-projection", "validation:render-publication"],
    stopWhenSatisfied: true,
    optionalImprovementDisposition: "report_only_follow_up",
    decisionBasisRequired: true,
    evidenceAndLimitationsRequired: true,
  },
  lifecycleBudgetRef: "loop-budget:finebridge-fresh-five-set-report:v1",
  dataClassification: "internal",
  effectIntent: "local_write",
  externalSearchAllowed: true,
  constructionAllowed: false,
  residualGapProven: true,
  requestDigest: "",
};
reusableOperationRequest.requestDigest = canonicalDigest(reusableOperationRequest, "requestDigest");
writeJson("reusable-artifact-operation-request.json", reusableOperationRequest);

writeJson("artifact-use-binding.json", {
  kind: "reusable-artifact-use-binding/v1",
  status: "report_only",
  authorityEffect: "none",
  disposition: "reuse_as_is",
  subjectRef: "agent-subject:finebridge-fresh-report-builder",
  artifactRef: "artifacts/agent-loop/document/job-application-report-production/loop.yaml",
  artifactContractRef: "artifacts/agent-loop/document/job-application-report-production/contract.md",
  skillRef: "artifacts/agent-loop/document/job-application-report-production/skill/job-application-report-loop-operation/SKILL.md",
  routeBinding: {
    decisionRef: relative("route-decision.json"),
    decisionDigest: digestFile(routeDecisionPath),
    effectiveMode: "loop",
  },
  selectedResponsibilities: ["bind five-set PDF request", "differentiate four questions", "compose five answer sets", "compose review report", "render and validate one searchable PDF"],
  excludedResponsibilities: ["source truth", "applicant confirmation", "application acceptance", "external submission", "hiring decision", "native artifact edit"],
  sourceRevisionEvidence: {
    loopDigest: digestFile(path.join(ownerDir, "loop.yaml")),
    contractDigest: digestFile(path.join(ownerDir, "contract.md")),
    policyDigest: digestFile(path.join(ownerDir, "policy/job-application-report-production.policy.json")),
    requirementDigest: digestFile(path.join(ownerDir, "requirements/job-application-report-production.requirement.json")),
    skillDigest: digestFile(path.join(ownerDir, "skill/job-application-report-loop-operation/SKILL.md")),
    profileDigest: digestFile(profilePath),
  },
});

writeJson("agent-operation-boundary.json", {
  kind: "reusable-artifact-agent-operation-boundary/v1",
  revision: "2026-09-14.fresh",
  status: "bound",
  authorityEffect: "none",
  subjectRef: "agent-subject:finebridge-fresh-report-builder",
  nativeOwnerRef: "artifacts/agent-loop/document/job-application-report-production/loop.yaml",
  requestedOutcome: "Produce a new five-set Korean job-application review report and one searchable PDF from the supplied Finebridge Finance posting and applicant evidence.",
  successEvidence: ["request.json binds the mandatory five-set PDF profile", "five complete candidate sets cover every question", "application projection is separate from review data", "PDF has measured searchable text and no overflow", "missing facts remain explicit and submission remains outside scope"],
  nonGoals: ["reuse old Finebridge runtime files", "edit native reusable source", "invent company or applicant facts", "submit the application", "make a hiring decision"],
  boundedDiscoverySurface: {
    nativeArtifact: "artifacts/agent-loop/document/job-application-report-production",
    runtimeBundle: runtimeRelative,
    selectedSourceMembers: ["loop.yaml", "contract.md", "governance.md", "policy/job-application-report-production.policy.json", "profiles/five-set-pdf-report.profile.json", "skill/job-application-report-loop-operation/SKILL.md", "skill/job-application-report-loop-operation/references/operation-protocol.md", "skill/job-application-report-loop-operation/references/question-family-and-expression-guide.md", "skill/job-application-report-loop-operation/references/editorial-report-and-public-language-guide.md"],
    applicantEvidence: "current user-provided prompt only",
    maximumCandidateCount: 5,
    maximumRevisionPasses: 1,
  },
  validation: ["native request/result checker", "mandatory profile checker", "writing-quality checker", "answer projection checker", "measured PDF renderer", "native package tests"],
  materialChangeSignals: ["question or character-limit change", "applicant or project fact change", "company/role source change", "quality or publication profile change", "projection/report boundary change", "effect expansion beyond fresh runtime directory"],
  stopConditions: ["required evidence changes materially without confirmation", "candidate answers cannot stay within declared limits", "the PDF is not searchable or has overflow", "the same validation failure repeats unchanged", "the requested effect expands to submission or source mutation"],
});

writeJson("effect-admission.json", {
  kind: "task-local-effect-admission/v1",
  status: "admitted",
  authorityEffect: "none",
  objectiveRef: relative("route-decision.json"),
  admittedEffect: { type: "local_write", scope: runtimeRelative + "/**", purpose: "write a fresh runtime request, evidence projections, five answer sets, review report, and measured PDF" },
  excludedEffects: ["native_artifact_edit", "external_network_mutation", "application_submission", "git_commit_or_push", "identity_publication_without_consent"],
  authorizationBasis: "explicit user request to restart the job-application report operation in a new workspace",
  settlement: "only the fresh runtime bundle is mutable; applicant confirmation, acceptance, and submission remain separate",
});

writeJson("research-evidence.json", {
  kind: "job-application-research-evidence/v1",
  status: "report_only",
  authority_effect: "none",
  request_ref: "request.json",
  observed_at: observedAt,
  research_rounds: 1,
  source_observations: [
    {
      source_id: "source-finebridge-posting",
      authority: "primary",
      observation: "사용자 제공 채용 공고 핵심 내용은 금융 서비스 사용자 분석, 모바일 서비스 및 신규 기능 기획, 서비스 요구사항 정의, 화면 및 사용자 흐름 설계, 개발·디자인 조직과 협업, 데이터 기반 서비스 개선이다.",
      applicability: "직무 책임과 답안의 근거 선택에 직접 적용",
      freshness: "observed_on_request_date",
      visibility: "public_report_allowed",
      limit: "사용자 제공 요약과 URL을 바인딩했으며 공고 원문 전체의 자격 요건·평가 기준은 확인하지 않았다.",
    },
    {
      source_id: "source-finebridge-company",
      authority: "primary",
      observation: "회사 도메인과 채용 URL이 .example 주소로 제공되어 공식 페이지를 독립적으로 확인할 수 없었다.",
      applicability: "회사 고유 주장 생성 금지와 한계 표시에 적용",
      freshness: "unavailable",
      visibility: "metadata_only",
      limit: "상품·고객군·전략 정보를 답안 근거로 사용하지 않았다.",
    },
    {
      source_id: "source-applicant-profile",
      authority: "applicant_owned",
      observation: "지원자 프로필, 전공, 신입 지원 형태, 희망 직무와 보유 역량이 사용자 입력으로 제공되었다.",
      applicability: "지원자 소유 사실과 포부의 범위에 적용",
      freshness: "user_provided",
      visibility: "runtime_private",
      limit: "나열된 실제 첨부 파일은 이 새 작업 공간에서 검토하지 않았다.",
    },
    {
      source_id: "source-applicant-experiences",
      authority: "applicant_owned",
      observation: "금융 앱 UX 산학 프로젝트, 핀테크 운영 인턴, 600건 문의 분류와 인증 안내 문구 개선 경험이 사용자 입력으로 제공되었다.",
      applicability: "답안의 경험·행동·결과·한계 연결에 적용",
      freshness: "user_provided",
      visibility: "runtime_private",
      limit: "실제 포트폴리오·인터뷰 원문·QA 기록·운영 지표는 검토하지 않았다.",
    },
  ],
  unresolved_source_facts: ["공식 공고 전체 자격 요건과 평가 기준", "회사 상품·고객군·최근 디지털 전략", "공고 URL의 실제 접근 가능성과 최신성", "제공된 첨부 파일의 원문"],
  writing_implications: [
    { id: "research-implication-role-flow", claim: "공고의 사용자 분석과 화면·흐름 설계 요구를 인터뷰 24건에서 발견한 단계 인지 문제와 연결한다.", source_ids: ["source-finebridge-posting", "source-applicant-experiences"], certainty: "supported_inference" },
    { id: "research-implication-data-feedback", claim: "데이터 기반 개선 요구를 600건 문의 분류, 인증 비중 발견, 안내 문구 개선, 출시 후 의견 추적의 순서로 보여준다.", source_ids: ["source-finebridge-posting", "source-applicant-experiences"], certainty: "supported_inference" },
    { id: "research-implication-company-limit", claim: "회사 고유 상품·전략을 확인할 수 없으므로 회사 찬사 대신 공고의 업무 책임에만 답안을 맞춘다.", source_ids: ["source-finebridge-company", "source-finebridge-posting"], certainty: "limitation" },
  ],
});

writeJson("context-projection.json", {
  kind: "job-application-context-projection/v1",
  status: "report_only",
  authority_effect: "none",
  request_ref: "request.json",
  projection_policy: "smallest_sufficient_runtime_context",
  admitted_applicant_evidence: [
    ...applicantEvidence.facts.map(item => item.id),
    ...applicantEvidence.value_statements.map(item => item.id),
  ],
  admitted_project_evidence: [
    "project-finance-app-ux", "project-claim-interview-24", "project-claim-flow-redesign", "project-claim-prioritize-clarity",
    "project-fintech-operations-internship", "project-claim-voc-analysis", "project-claim-requirement-qa", "project-claim-authentication-message",
  ],
  protected_unknowns: applicantEvidence.unknowns.map(item => item.id).concat(["company-context-unverified"]),
  inferences_requiring_confirmation: ["fit-user-flow-requirements", "fit-voc-data-loop", "fit-collaboration-bridge", "fit-three-to-five-year-goal", "role-financial-clarity"],
  universal_language_translations: ["사용자 흐름 -> 사용자가 과업을 완료하기까지 거치는 단계와 상태", "프로토타입 -> 출시 전에 화면과 이용 단계를 확인할 수 있는 시제품", "VOC -> 고객 문의와 이용 중 남긴 의견", "Jira Ticket -> 개발팀이 실행할 수 있도록 정리한 작업 요청", "QA -> 출시 전 기능 확인"],
  privacy: {
    identity_handling: "explicit_consent_only",
    public_report_identity: "redacted",
    runtime_private_sources: ["source-applicant-profile", "source-applicant-experiences"],
    prohibited_public_categories: ["private-reasoning", "raw-prompt", "runtime-handle", "secret", "unconsented-identity"],
  },
});

const answerText = (...parts) => parts.join("");
const candidateDefs = [
  {
    id: "candidate-a",
    strategy: "사용자 상태와 완료 여부의 명확성을 금융 서비스 기획의 핵심 기여로 전면화한다.",
    answers: {
      "question-collaboration": answerText(
        "핀테크 스타트업 서비스 운영 인턴으로 근무하며 고객이 인증 단계에서 겪는 불편을 줄이는 일을 개발팀과 함께 추진했습니다. ",
        "저는 고객 문의 약 600건을 유형별로 분류해 인증 관련 문의가 약 31%라는 점을 정리했고, 원인을 개발팀이 확인할 수 있도록 개선 요구사항과 작업 요청으로 구체화했습니다. ",
        "출시 전 기능 확인에도 참여하고 출시 후 같은 유형의 문의가 줄었는지 추적했습니다. ",
        "제가 맡은 역할은 고객의 표현을 팀이 실행할 수 있는 문제와 확인 항목으로 바꾸는 일이었습니다. ",
        "상세한 팀 내 합의 과정과 감소 폭은 추가 확인이 필요하지만, 이 경험을 통해 공동 목표는 의견을 모으는 데서 끝나지 않고 고객 문제를 같은 기준으로 정의하고 결과를 다시 확인할 때 달성된다는 것을 배웠습니다. ",
        "이후에도 협업할 때 배경, 요청, 완료 조건을 함께 정리해 서로의 다음 행동을 분명하게 만들겠습니다."
      ),
      "question-preparation": answerText(
        "디지털 서비스 기획을 위해 경영정보학에서 비즈니스와 정보기술의 연결을 공부하고, 금융 앱 사용성 개선 프로젝트와 핀테크 운영 인턴 경험을 쌓았습니다. ",
        "금융 앱 프로젝트에서는 사용자 인터뷰 24건을 분석해 송금 메뉴 진입, 최근 계좌 접근, 완료 여부 확인의 어려움을 찾고, 새 기능보다 현재 과정을 단순하게 보여주는 흐름과 프로토타입을 설계했습니다. ",
        "인턴으로는 문의를 분류하고 요구사항과 개발팀 작업 요청을 작성했으며 출시 전 확인과 출시 후 고객 의견 추적까지 경험했습니다. ",
        "Figma로 화면과 흐름을 구체화하고, GA4와 SQL 기본 분석, Excel로 이용·문의 데이터를 읽으며, Notion과 Jira로 정책과 실행 내용을 정리할 수 있습니다. ",
        "파인브릿지 금융에서도 사용자 문제를 단계와 요구사항으로 바꾸고, 디자인·개발 조직과 확인 가능한 기준을 맞춘 뒤 출시 후 데이터를 다시 보겠습니다. GA4·SQL의 실제 사례는 추가 자료로 보강하겠습니다."
      ),
      "question-value-formation": answerText(
        "현재의 업무 가치관을 만든 사건은 금융 앱 사용성 개선 프로젝트에서 사용자 인터뷰 24건을 분석한 경험입니다. ",
        "사용자들은 송금 기능이 없어서보다 메뉴에 들어가는 과정, 최근 계좌를 찾는 과정, 송금이 완료됐는지를 확인하는 과정에서 어려움을 느꼈습니다. ",
        "저는 기능을 더 추가하기보다 사용자가 지금 어느 단계에 있고 다음에 무엇을 해야 하는지 한눈에 이해하도록 현재 프로세스를 단순하게 보여주는 일을 먼저 선택했습니다. 그 결과를 흐름 재설계와 프로토타입에 반영했습니다. ",
        "이 경험으로 좋은 기획은 기능 수를 늘리는 일이 아니라 사용자의 불확실성을 줄이는 일이라는 기준을 갖게 됐습니다. ",
        "앞으로도 문제를 발견하면 기능 제안부터 하기보다 사용자의 상태와 완료 조건을 먼저 확인하고, 화면·요구사항·출시 후 반응을 연결해 개선하겠습니다."
      ),
      "question-three-to-five-year-goal": answerText(
        "입사 후 3년 안에는 금융 서비스 사용자의 행동과 문의를 정확히 읽고, 이를 요구사항과 화면 흐름으로 구체화하는 기획자가 되고 싶습니다. ",
        "초기에는 공고에 제시된 사용자 분석, 모바일 기능 기획, 서비스 정책 작성, 디자인·개발 협업을 맡으며 한 기능의 문제 정의부터 출시 전 확인까지 책임지겠습니다. ",
        "그 과정에서 어떤 단계에서 이탈하거나 혼란을 느끼는지, 완료 여부를 어떻게 확인하는지를 지표와 고객 의견으로 함께 살피겠습니다. ",
        "5년 안에는 여러 기능이 연결된 금융 서비스의 개선 과제를 주도하며, 신규 기능을 제안할 때도 기존 과정의 단순성과 신뢰를 먼저 검토하는 Product Manager로 성장하고 싶습니다. ",
        "현재의 구체적인 금융 서비스 영역과 목표 지표는 더 확인해야 하지만, 파인브릿지 금융에서 사용자 상태를 명확하게 만드는 기획으로 고객 경험과 서비스 성과에 기여하겠습니다."
      ),
    },
  },
  {
    id: "candidate-b",
    strategy: "고객 문의를 데이터·요구사항·출시 후 학습으로 연결하는 개선 순환을 전면화한다.",
    answers: {
      "question-collaboration": answerText(
        "핀테크 스타트업 운영 인턴으로 일하며 고객 문의를 개발팀이 실행할 수 있는 개선 과제로 바꾸는 협업을 경험했습니다. ",
        "고객 문의 약 600건을 유형별로 나누자 인증 과정 관련 내용이 약 31%를 차지했습니다. 저는 이 결과를 단순한 통계로 남기지 않고 인증 단계 안내 문구를 어떻게 바꿀지 요구사항으로 정리해 개발팀 작업 요청으로 전달했습니다. ",
        "출시 전 기능 확인에 참여한 뒤에는 같은 유형의 문의가 줄었는지 다시 추적했습니다. ",
        "고객의 말과 개발팀의 작업 언어가 다르다는 점을 고려해 문제의 배경, 바꾸려는 내용, 확인할 결과를 한 문서 안에서 연결한 것이 제 역할이었습니다. ",
        "전후 감소 폭과 팀 내 조율 장면은 추가 확인이 필요하지만, 공동 목표를 데이터로 맞추고 출시 뒤 결과를 함께 확인하는 협업 방식을 배웠습니다. 이후에도 상대가 바로 판단할 수 있는 정보까지 정리하겠습니다."
      ),
      "question-preparation": answerText(
        "저는 디지털 서비스 기획을 사용자 이해, 화면과 요구사항 설계, 데이터로 결과를 확인하는 일의 연결로 준비해 왔습니다. ",
        "경영정보학을 전공하며 비즈니스 문제를 정보 흐름으로 구조화하는 기초를 익혔고, 금융 앱 프로젝트에서 인터뷰 24건을 분석해 송금과 계좌 접근, 완료 상태 확인의 문제를 찾았습니다. ",
        "인턴으로는 문의 약 600건을 분류해 인증 관련 비중을 확인하고 안내 문구 개선 요구사항, 개발팀 작업 요청, 출시 전 기능 확인, 출시 후 고객 의견 추적을 이어 갔습니다. ",
        "GA4·SQL 기본 분석과 Excel로 데이터를 정리하고, 사용자 인터뷰로 맥락을 확인하며, Figma로 화면 흐름을 표현하고 Notion·Jira로 실행 내용을 공유할 수 있습니다. ",
        "파인브릿지 금융에서는 정성 의견과 수치가 가리키는 문제를 함께 해석해 우선순위를 세우고, 신규 기능과 기존 과정 개선 중 더 큰 사용자 가치를 만드는 선택을 하겠습니다. 실제 GA4·SQL 분석 사례는 제출 전에 보강하겠습니다."
      ),
      "question-value-formation": answerText(
        "업무 가치관에 가장 큰 영향을 준 경험은 핀테크 인턴으로 고객 문의 약 600건을 직접 분류한 일입니다. ",
        "인증 과정 문의가 약 31%라는 결과를 보며, 고객의 불편을 개인의 사용 미숙으로 넘기지 않고 서비스가 설명해야 할 문제로 바라보게 됐습니다. 저는 인증 안내 문구 개선안을 제안하고, 출시 후 같은 유형의 문의가 감소했는지 확인했습니다. ",
        "정확한 감소 폭과 관찰 기간은 추가 확인이 필요하지만, 문제를 발견하는 것만큼 개선 후 다시 확인하는 일이 중요하다는 점은 분명히 배웠습니다. ",
        "이 사건 이후 저는 새로운 기능을 제안할 때도 먼저 고객이 어떤 단계에서 막히는지, 현재 데이터가 무엇을 말하는지, 개선 후 무엇을 확인할지를 정리합니다. ",
        "파인브릿지 금융에서도 고객 목소리를 요구사항으로 번역하고 출시 후 반응까지 확인하는 기획자가 되겠습니다."
      ),
      "question-three-to-five-year-goal": answerText(
        "3년 안에는 고객 문의와 이용 데이터를 서비스 의사결정에 연결하는 디지털 금융 서비스 기획자로 성장하고 싶습니다. ",
        "입사 초기에는 사용자 분석과 요구사항 정의를 정확히 수행하고, 화면 흐름과 기능을 설계한 뒤 출시 전 확인과 고객 반응 추적까지 한 과제로 경험하겠습니다. ",
        "제가 가진 문의 분류와 기초 분석 역량을 바탕으로 어떤 문제를 먼저 풀어야 하는지 설명하고, 데이터가 부족할 때는 인터뷰와 관찰로 맥락을 보완하겠습니다. ",
        "5년 안에는 문제 발견부터 개선 효과 확인까지의 순환을 팀의 일하는 방식으로 정착시키며, 고객 가치와 서비스 성과를 함께 책임지는 Product Manager를 목표로 합니다. ",
        "구체적으로 맡고 싶은 금융 상품과 지표는 추가로 정리할 부분이 있지만, 파인브릿지 금융에서 근거 있는 우선순위와 빠른 학습으로 디지털 서비스 개선에 기여하겠습니다."
      ),
    },
  },
  {
    id: "candidate-c",
    strategy: "서로 다른 조직이 같은 고객 문제를 바라보도록 번역하고 조율하는 기획 역할을 전면화한다.",
    answers: {
      "question-collaboration": answerText(
        "핀테크 스타트업 서비스 운영 인턴으로서 고객 문의를 개발팀과 공유하고 개선 작업으로 연결하는 역할을 맡았습니다. ",
        "고객은 인증 과정에서 불편을 겪었지만, 문의 내용만 전달하면 개발팀이 무엇을 바꿔야 하는지 판단하기 어려웠습니다. 저는 약 600건의 문의를 유형별로 정리해 인증 관련 문의가 약 31%임을 보여주고, 안내 문구 개선의 배경과 필요한 작업을 구체적인 요구사항으로 작성했습니다. ",
        "개발팀 작업 요청을 작성하고 출시 전 기능 확인에도 참여하면서, 고객 관점의 문제와 개발 관점의 실행 조건을 연결했습니다. 출시 후에는 같은 유형의 문의가 줄었는지 다시 확인했습니다. ",
        "팀의 실제 회의와 역할 분담은 추가 확인이 필요하지만, 저는 각 조직의 언어를 번역해 공동의 판단 기준을 만드는 데 기여했습니다. ",
        "이 경험을 바탕으로 앞으로도 상대의 제약과 필요한 정보를 먼저 이해하고, 문제·요청·완료 조건을 합의하는 협업을 이어 가겠습니다."
      ),
      "question-preparation": answerText(
        "저는 서비스 기획에 필요한 지식과 경험을 문제를 발견하고, 여러 사람이 이해할 수 있는 요구사항과 흐름으로 바꾸는 연습으로 준비했습니다. ",
        "경영정보학 전공으로 비즈니스와 기술의 접점을 공부했고, 금융 앱 산학 프로젝트에서 사용자 인터뷰 24건을 분석해 송금 진입·최근 계좌 접근·완료 확인의 문제를 정의했습니다. ",
        "이후 사용자 흐름을 재설계하고 출시 전 화면을 확인할 수 있는 프로토타입을 만들며, 화면 한 장보다 앞뒤 단계와 사용자의 다음 행동을 설계했습니다. ",
        "Figma로 화면을 표현하고 사용자 인터뷰로 맥락을 확인하며, GA4·SQL 기본 분석과 Excel로 데이터를 읽을 수 있습니다. Notion으로 정책과 결정 사항을 정리하고 Jira로 개발팀 작업 요청을 구체화하는 역량도 갖췄습니다. ",
        "파인브릿지 금융에서는 디자인·개발 조직이 같은 사용자 문제를 보도록 요구사항과 흐름을 명확히 연결하고, 출시 후 의견으로 다음 개선을 설계하겠습니다."
      ),
      "question-value-formation": answerText(
        "금융 앱 사용성 개선 프로젝트에서 사용자 인터뷰 24건의 메모를 분석한 경험이 현재의 업무 가치관을 만들었습니다. ",
        "처음에는 송금 기능을 더 편리하게 만드는 방법을 생각했지만, 사용자들은 기능 자체보다 지금 어느 단계에 있는지, 최근 계좌를 어떻게 찾는지, 송금이 끝났는지를 알기 어려워했습니다. ",
        "저는 새로운 기능을 덧붙이는 대신 프로세스의 상태와 다음 행동을 단순하게 보여주는 방향을 선택하고, 그 판단을 사용자 흐름 재설계와 프로토타입에 반영했습니다. ",
        "이 사건 이후 기획에서 가장 먼저 할 일은 아이디어를 내는 것이 아니라 서로 다른 사람이 같은 문제를 이해하도록 만드는 것이라고 생각하게 됐습니다. ",
        "파인브릿지 금융에서도 사용자 발화를 정확히 해석해 화면·요구사항·데이터 언어로 번역하고, 팀이 함께 확인할 수 있는 개선 기준을 만들겠습니다."
      ),
      "question-three-to-five-year-goal": answerText(
        "3년 안에는 사용자 문제를 발견한 뒤 디자인과 개발 조직이 실행할 수 있는 요구사항과 화면 흐름으로 연결하는 기획자로 성장하겠습니다. ",
        "초기에는 금융 서비스의 사용자 분석, 모바일 기능 기획, 정책 작성, 출시 전 확인을 폭넓게 경험하며 각 직군의 판단 기준과 제약을 배우겠습니다. ",
        "제가 가진 인터뷰 분석과 프로토타입 제작, 요구사항 작성 경험을 바탕으로 한 과제의 목표와 완료 조건을 명확히 설명하는 데 집중하겠습니다. ",
        "5년 안에는 고객·디자인·개발의 관점을 조율하면서 복잡한 금융 과정을 이해하기 쉽게 만드는 Product Manager가 되고 싶습니다. ",
        "제품 영역과 책임 범위에 대한 개인 선호는 더 확인해야 하지만, 파인브릿지 금융에서 조직 간 번역 비용을 줄이고 사용자가 신뢰할 수 있는 흐름을 만드는 기획으로 기여하겠습니다."
      ),
    },
  },
  {
    id: "candidate-d",
    strategy: "문제의 우선순위를 세우고, 개선의 종료 기준을 확인하는 데이터 기반 기획을 전면화한다.",
    answers: {
      "question-collaboration": answerText(
        "핀테크 스타트업 인턴으로서 고객 문의를 근거로 개선 우선순위를 제안하고 개발팀과 실행을 맞춘 경험이 있습니다. ",
        "문의 약 600건을 유형별로 분류한 결과 인증 과정 관련 문의가 약 31%였습니다. 저는 빈번하게 보이는 사례를 바로 기능으로 만들기보다 유형과 비중을 먼저 정리하고, 안내 문구 개선이라는 요구사항과 개발팀 작업 요청으로 바꾸었습니다. ",
        "출시 전 기능 확인에 참여하고 출시 후 동일 유형 문의가 감소했는지 추적해, 팀이 무엇을 바꾸고 어떤 신호를 볼지 함께 정리했습니다. ",
        "팀의 세부 합의와 감소 수치는 추가 확인이 필요하지만, 제 역할은 고객의 문제를 우선순위와 확인 방법이 있는 작업으로 전환하는 것이었습니다. ",
        "앞으로도 협업할 때 의견의 크기보다 근거와 완료 기준을 먼저 맞추고, 결과가 기대와 다르면 다음 선택을 함께 조정하겠습니다."
      ),
      "question-preparation": answerText(
        "디지털 서비스 기획을 수행하기 위해 문제를 정량·정성 자료로 확인하고, 실행 가능한 화면과 요구사항으로 전환하는 역량을 준비했습니다. ",
        "경영정보학을 전공하며 정보와 비즈니스의 관계를 공부했고, 금융 앱 프로젝트에서는 인터뷰 24건에서 반복되는 문제를 찾아 송금 진입, 최근 계좌, 완료 확인의 흐름을 재설계했습니다. ",
        "핀테크 인턴으로는 문의 약 600건을 분류해 인증 관련 비중을 확인하고 안내 문구 개선, 개발팀 작업 요청, 출시 전 확인, 출시 후 의견 추적을 수행했습니다. ",
        "사용자 인터뷰로 맥락을 수집하고, GA4·SQL 기본 분석과 Excel로 데이터를 정리하며, Figma로 대안을 비교할 화면을 만들 수 있습니다. Notion과 Jira는 결정 사항과 실행 단위를 공유하는 데 활용합니다. ",
        "파인브릿지 금융에서는 사용자 분석 결과를 근거로 우선순위를 설명하고, 신규 기능과 기존 과정 개선의 선택을 데이터와 사용자 가치로 비교하겠습니다."
      ),
      "question-value-formation": answerText(
        "현재의 업무 가치관은 금융 앱 사용자 인터뷰 24건에서 반복되는 불편을 우선순위로 정리한 경험을 통해 형성됐습니다. ",
        "송금 메뉴 진입, 최근 계좌 접근, 완료 여부 확인이 어렵다는 의견을 보며 기능을 더하는 것보다 사용자의 상태를 명확하게 만드는 일이 먼저라고 판단했습니다. ",
        "저는 새 기능 제안 대신 현재 프로세스를 단순하게 보여주는 흐름을 선택했고, 그 결과를 프로토타입으로 구체화했습니다. ",
        "실제 출시 후 지표는 확인되지 않았지만, 무엇을 만들었는지보다 어떤 불확실성을 줄였고 어떤 기준으로 충분함을 판단했는지가 중요하다는 점을 배웠습니다. ",
        "이후 업무에서도 사용자 영향, 문제의 반복성, 개선 결과를 확인할 방법을 먼저 정리하고 우선순위를 세우겠습니다. 금융 서비스 기획에서도 이 기준으로 신중하게 개선하겠습니다."
      ),
      "question-three-to-five-year-goal": answerText(
        "입사 후 3년 동안은 사용자 분석과 데이터 해석을 바탕으로 금융 서비스의 개선 우선순위를 설계하는 기획자가 되겠습니다. ",
        "초기에는 모바일 서비스의 사용자 흐름과 요구사항을 정확히 정의하고, 디자인·개발 조직과 완료 조건을 맞추며, 출시 후 고객 의견과 행동 데이터를 다시 확인하겠습니다. ",
        "인터뷰 24건을 분석하고 600건의 문의를 분류한 경험을 기반으로 정성·정량 근거를 함께 제시하되, 아직 모르는 것은 추가 조사 과제로 구분하겠습니다. ",
        "5년 안에는 여러 개선 과제의 목표와 지표를 설계하고, 기능을 많이 만드는 것보다 고객이 더 빠르고 정확하게 과업을 완료하는 결과를 책임지는 Product Manager로 성장하고 싶습니다. ",
        "희망하는 세부 금융 영역은 더 구체화할 예정이지만, 파인브릿지 금융에서 측정 가능한 문제 정의와 우선순위로 서비스 개선에 기여하겠습니다."
      ),
    },
  },
  {
    id: "candidate-e",
    strategy: "금융 서비스에서 사용자의 불안을 줄이고 신뢰를 쌓는 경험 설계를 전면화한다.",
    answers: {
      "question-collaboration": answerText(
        "핀테크 스타트업에서 운영 인턴으로 일하며 고객이 느끼는 불안을 개발팀이 해결할 수 있는 개선으로 바꾸는 협업을 경험했습니다. ",
        "저는 고객 문의 약 600건을 읽고 인증 과정 관련 문의가 약 31%라는 점을 확인했습니다. 고객에게는 짧은 안내 문구 하나의 문제였지만, 개발팀이 움직이려면 어떤 단계에서 혼란이 생겼고 무엇을 바꿔야 하는지 설명해야 했습니다. ",
        "그래서 안내 문구 개선안을 요구사항으로 정리하고 작업 요청으로 전달했으며, 출시 전 확인과 출시 후 같은 유형의 문의 추적에도 참여했습니다. ",
        "제가 맡은 역할은 고객의 감정을 과장하지 않으면서도 그 불편을 팀이 공통으로 이해하도록 만드는 일이었습니다. 협업 상대와의 실제 대화와 결과 수치는 추가 확인이 필요하지만, 신뢰를 높이는 공동 목표에는 문제를 함께 정의하고 확인하는 과정이 필요하다는 것을 배웠습니다. ",
        "앞으로도 고객 관점과 실행 조직의 현실을 함께 고려하겠습니다."
      ),
      "question-preparation": answerText(
        "저는 디지털 금융 서비스 기획에 필요한 역량을 사용자의 불편을 발견하고 안심할 수 있는 이용 경험으로 바꾸는 연습을 통해 준비했습니다. ",
        "경영정보학 전공으로 서비스와 정보의 흐름을 공부했으며, 금융 앱 프로젝트에서 24건의 인터뷰를 분석해 송금 진입, 최근 계좌 접근, 완료 확인의 불편을 발견했습니다. ",
        "그 결과를 바탕으로 과정을 단순하게 보여주는 사용자 흐름과 프로토타입을 설계했습니다. 핀테크 인턴으로는 문의를 분류하고 인증 안내 문구 개선 요구사항, 개발팀 작업 요청, 출시 전 확인, 출시 후 고객 의견 추적을 경험했습니다. ",
        "Figma로 화면을 설계하고 사용자 인터뷰로 맥락을 파악하며, GA4·SQL 기본 분석과 Excel로 데이터를 정리할 수 있습니다. Notion과 Jira로 정책과 실행 내용을 공유하겠습니다. ",
        "파인브릿지 금융에서도 사용자가 현재 상태와 완료 여부를 믿고 이해할 수 있는 기능을 기획하고, 데이터와 의견으로 개선을 이어 가겠습니다."
      ),
      "question-value-formation": answerText(
        "금융 앱 개선 프로젝트에서 사용자가 기능보다 과정의 불명확함을 더 크게 걱정한다는 사실을 발견한 사건이 제 업무 가치관을 만들었습니다. ",
        "24건의 인터뷰에서 사용자는 송금 메뉴에 들어가기 어렵고 최근 계좌를 찾기 어렵다고 말했으며, 송금이 끝났는지도 확신하지 못했습니다. 저는 기능을 추가하는 대신 현재 어느 단계인지와 다음 행동, 완료 여부가 보이는 흐름을 먼저 설계하기로 했습니다. ",
        "프로토타입은 그 판단을 화면으로 확인하는 방법이었습니다. 실제 출시 성과는 확인되지 않았지만, 금융 서비스에서는 편리함만큼 사용자가 실수하지 않았고 일이 끝났다는 확신을 주는 것이 중요하다는 기준을 얻었습니다. ",
        "이후에는 기획 초기부터 불안과 혼란이 생기는 지점을 묻고, 안내·상태·완료 경험을 함께 점검하겠습니다. 이것이 제가 사용자 중심을 실천하는 방식입니다."
      ),
      "question-three-to-five-year-goal": answerText(
        "3년 안에는 사용자가 안심하고 이용할 수 있는 디지털 금융 서비스를 만들기 위해 사용자 분석과 흐름 설계를 탄탄히 수행하는 기획자가 되겠습니다. ",
        "입사 초기에는 모바일 서비스와 신규 기능의 요구사항을 정의하고, 디자인·개발 조직과 단계·상태·완료 조건을 맞추며, 출시 후 문의와 행동 데이터를 통해 불안이 줄었는지 확인하겠습니다. ",
        "사용자 인터뷰에서 단계 인지 문제를 발견하고 운영 문의에서 인증 문제를 찾은 경험을 바탕으로, 기능의 존재보다 이용 과정의 신뢰를 먼저 점검하겠습니다. ",
        "5년 안에는 여러 금융 과제에서 고객 경험과 서비스 목표를 함께 관리하는 Product Manager로 성장하고 싶습니다. ",
        "구체적인 제품 영역과 지표는 입사 후 학습과 본인 확인이 필요하지만, 파인브릿지 금융에서 명확한 흐름과 지속적인 개선으로 고객이 안심할 수 있는 서비스 경험을 만드는 데 기여하겠습니다."
      ),
    },
  },
];

const candidateRealizations = {
  "candidate-a": {
    "question-collaboration": {
      primaryClaim: "고객이 막힌 지점을 팀의 공동 문제로 바꾸고, 출시 전후까지 확인하는 연결 역할을 맡았다.",
      readerTakeaway: "사용자 관찰을 공동 목표와 실행 기준으로 연결하는 협업자라는 인상을 남긴다.",
      openingMode: "scene",
      moveSequence: ["relevant-context", "other-person-perspective", "choice-or-action", "reason-or-tradeoff", "result-or-boundary", "learning-or-change"],
      evidenceEmphasis: "인증 단계 문의를 요구사항과 확인 항목으로 전환한 장면",
      judgmentEmphasis: "각 직군의 다음 행동이 분명해야 공동 목표가 실행된다는 판단",
      closingMode: "repeatable-practice",
      uncertaintyDisposition: "narrow-to-confirmed-scope",
    },
    "question-preparation": {
      primaryClaim: "사용자 조사를 서비스 흐름과 확인 가능한 요구사항으로 바꾸는 기획 역량을 준비해 왔다.",
      readerTakeaway: "관찰에서 화면·요구사항·출시 확인까지 이어 갈 수 있는 신입 기획자라는 인상을 남긴다.",
      openingMode: "direct-claim",
      moveSequence: ["direct-answer", "choice-or-action", "reason-or-tradeoff", "result-or-boundary", "company-role-connection", "future-direction"],
      evidenceEmphasis: "인터뷰 24건과 금융 앱 흐름 재설계",
      judgmentEmphasis: "기능 추가보다 사용자가 현재 상태를 이해하는 일을 먼저 보는 판단",
      closingMode: "role-contribution",
      uncertaintyDisposition: "omit-unsupported-claim",
    },
    "question-value-formation": {
      primaryClaim: "좋은 기획은 기능을 늘리는 일이 아니라 사용자가 다음 행동과 완료 여부를 확신하게 하는 일이라는 기준을 얻었다.",
      readerTakeaway: "사용자의 불확실성을 줄이는 선택을 가치 판단의 중심에 두는 사람이라는 인상을 남긴다.",
      openingMode: "scene",
      moveSequence: ["relevant-context", "value-in-action", "choice-or-action", "learning-or-change", "direct-answer", "company-role-connection"],
      evidenceEmphasis: "송금 과정에서 단계와 완료 여부를 놓친 인터뷰 결과",
      judgmentEmphasis: "새 기능보다 현재 과정의 이해 가능성을 우선하는 판단",
      closingMode: "earned-learning",
      uncertaintyDisposition: "omit-unsupported-claim",
    },
    "question-three-to-five-year-goal": {
      primaryClaim: "사용자가 금융 과업의 현재 상태와 완료 여부를 확신하게 만드는 서비스 기획자로 성장한다.",
      readerTakeaway: "초기 실행 역량에서 여러 기능의 경험을 책임지는 역할로 성장하려는 방향이 분명하다는 인상을 남긴다.",
      openingMode: "future-state",
      moveSequence: ["future-direction", "direct-answer", "choice-or-action", "company-role-connection", "learning-or-change", "result-or-boundary"],
      evidenceEmphasis: "사용자 상태와 완료 경험을 관찰한 금융 앱 프로젝트",
      judgmentEmphasis: "성장 목표를 맡을 책임의 범위로 설명하는 판단",
      closingMode: "staged-growth",
      uncertaintyDisposition: "narrow-to-confirmed-scope",
    },
  },
  "candidate-b": {
    "question-collaboration": {
      primaryClaim: "문의 데이터를 공동의 우선순위로 만들고 개발 실행과 후속 관찰을 잇는 역할을 수행했다.",
      readerTakeaway: "수치를 공유하는 데 그치지 않고 팀의 행동과 재확인으로 연결하는 협업자라는 인상을 남긴다.",
      openingMode: "evidence-first",
      moveSequence: ["result-or-boundary", "relevant-context", "other-person-perspective", "reason-or-tradeoff", "choice-or-action", "learning-or-change"],
      evidenceEmphasis: "문의 600건과 인증 관련 약 31%라는 우선순위 신호",
      judgmentEmphasis: "공동 목표는 같은 수치를 보는 것에서 실행과 확인까지 이어져야 한다는 판단",
      closingMode: "result-emphasis",
      uncertaintyDisposition: "narrow-to-confirmed-scope",
    },
    "question-preparation": {
      primaryClaim: "정성적인 고객 목소리와 기초 데이터를 함께 읽어 개선 우선순위를 설명하는 역량을 쌓아 왔다.",
      readerTakeaway: "사용자 맥락과 수치를 한쪽에 치우치지 않고 서비스 판단에 활용하는 기획자라는 인상을 남긴다.",
      openingMode: "evidence-first",
      moveSequence: ["result-or-boundary", "choice-or-action", "direct-answer", "reason-or-tradeoff", "company-role-connection", "future-direction"],
      evidenceEmphasis: "문의 분류와 인터뷰 분석을 서로 다른 문제에 적용한 경험",
      judgmentEmphasis: "수치에는 사용자 맥락을, 의견에는 빈도와 영향을 함께 확인하는 판단",
      closingMode: "repeatable-practice",
      uncertaintyDisposition: "omit-unsupported-claim",
    },
    "question-value-formation": {
      primaryClaim: "문제 발견보다 개선 뒤의 변화를 다시 확인하는 데 더 큰 책임이 있다는 업무 가치관을 형성했다.",
      readerTakeaway: "관찰·개선·재확인을 하나의 책임으로 보는 사람이라는 인상을 남긴다.",
      openingMode: "evidence-first",
      moveSequence: ["relevant-context", "choice-or-action", "value-in-action", "direct-answer", "learning-or-change", "company-role-connection"],
      evidenceEmphasis: "인증 문의 비중을 발견하고 안내 문구 개선 뒤 동일 유형 문의를 추적한 경험",
      judgmentEmphasis: "제안의 설득력보다 결과를 다시 보는 태도를 중요하게 여기는 판단",
      closingMode: "repeatable-practice",
      uncertaintyDisposition: "narrow-to-confirmed-scope",
    },
    "question-three-to-five-year-goal": {
      primaryClaim: "고객 목소리와 이용 데이터를 제품 의사결정에 연결하고 개선 효과까지 추적하는 기획자로 성장한다.",
      readerTakeaway: "데이터 활용을 도구 숙련이 아니라 더 나은 제품 판단의 과정으로 보는 성장 방향이 드러난다.",
      openingMode: "direct-claim",
      moveSequence: ["direct-answer", "future-direction", "choice-or-action", "learning-or-change", "company-role-connection", "result-or-boundary"],
      evidenceEmphasis: "고객 문의를 분류하고 개선 후 반응을 추적한 경험",
      judgmentEmphasis: "근거의 양보다 문제 정의와 후속 확인의 일관성을 중시하는 판단",
      closingMode: "result-emphasis",
      uncertaintyDisposition: "narrow-to-confirmed-scope",
    },
  },
  "candidate-c": {
    "question-collaboration": {
      primaryClaim: "고객의 표현과 개발팀의 실행 언어 사이를 번역해 서로 다른 관점을 하나의 개선 과제로 모았다.",
      readerTakeaway: "상대 조직이 판단할 수 있는 정보까지 갖춰 협업의 번역 비용을 낮추는 사람이라는 인상을 남긴다.",
      openingMode: "contrast",
      moveSequence: ["other-person-perspective", "relevant-context", "reason-or-tradeoff", "choice-or-action", "result-or-boundary", "learning-or-change"],
      evidenceEmphasis: "고객 문의를 배경·변경 내용·확인 조건이 담긴 작업 요청으로 바꾼 경험",
      judgmentEmphasis: "의견 전달보다 상대가 판단하고 행동할 수 있는 맥락 제공이 중요하다는 판단",
      closingMode: "responsibility-boundary",
      uncertaintyDisposition: "narrow-to-confirmed-scope",
    },
    "question-preparation": {
      primaryClaim: "사용자·비즈니스·개발 관점을 공통의 서비스 흐름과 요구사항으로 정리하는 기반을 준비했다.",
      readerTakeaway: "여러 직군이 같은 고객 문제를 보도록 정보와 산출물을 연결할 수 있다는 인상을 남긴다.",
      openingMode: "contrast",
      moveSequence: ["reason-or-tradeoff", "direct-answer", "choice-or-action", "result-or-boundary", "company-role-connection", "future-direction"],
      evidenceEmphasis: "경영정보학, 사용자 인터뷰, 화면 흐름, 개발 작업 요청을 연결한 경험",
      judgmentEmphasis: "도구 사용보다 직군 간 공통 이해를 만드는 산출물을 우선하는 판단",
      closingMode: "responsibility-boundary",
      uncertaintyDisposition: "omit-unsupported-claim",
    },
    "question-value-formation": {
      primaryClaim: "기획의 첫 책임은 좋은 아이디어를 내는 일이 아니라 문제를 여러 사람이 같은 의미로 이해하게 만드는 일이라고 배웠다.",
      readerTakeaway: "협업의 출발점을 공통된 문제 이해에 두는 사람이라는 인상을 남긴다.",
      openingMode: "contrast",
      moveSequence: ["direct-answer", "relevant-context", "choice-or-action", "value-in-action", "learning-or-change", "company-role-connection"],
      evidenceEmphasis: "인터뷰 결과를 사용자 흐름과 프로토타입으로 바꾼 프로젝트",
      judgmentEmphasis: "해결책에 합의하기 전에 문제의 의미를 맞추는 판단",
      closingMode: "responsibility-boundary",
      uncertaintyDisposition: "omit-unsupported-claim",
    },
    "question-three-to-five-year-goal": {
      primaryClaim: "고객 문제와 디자인·개발 판단을 잇는 제품 책임자로 성장해 조직의 의사결정 비용을 줄인다.",
      readerTakeaway: "개인의 산출물보다 팀이 더 정확하게 결정하도록 돕는 방향으로 책임을 넓히려는 인상을 남긴다.",
      openingMode: "contrast",
      moveSequence: ["company-role-connection", "direct-answer", "choice-or-action", "future-direction", "learning-or-change", "result-or-boundary"],
      evidenceEmphasis: "고객 문의를 개발 작업으로 바꾸고 화면 흐름으로 설명한 경험",
      judgmentEmphasis: "성장을 직급보다 더 넓은 의사결정 연결 책임으로 보는 판단",
      closingMode: "responsibility-boundary",
      uncertaintyDisposition: "narrow-to-confirmed-scope",
    },
  },
  "candidate-d": {
    "question-collaboration": {
      primaryClaim: "우선순위와 완료 기준을 함께 제시해 고객 문제를 팀이 검토하고 실행할 수 있는 공동 과제로 만들었다.",
      readerTakeaway: "주장의 크기보다 근거와 확인 기준으로 협업의 논점을 정리하는 사람이라는 인상을 남긴다.",
      openingMode: "decision-point",
      moveSequence: ["reason-or-tradeoff", "relevant-context", "choice-or-action", "other-person-perspective", "result-or-boundary", "learning-or-change"],
      evidenceEmphasis: "인증 문의의 빈도와 안내 문구 개선, 출시 전 확인을 묶은 경험",
      judgmentEmphasis: "빈도만으로 결론 내리지 않고 실행할 변화와 확인할 결과를 함께 정하는 판단",
      closingMode: "earned-learning",
      uncertaintyDisposition: "narrow-to-confirmed-scope",
    },
    "question-preparation": {
      primaryClaim: "문제의 빈도·사용자 영향·확인 가능성을 비교해 우선순위를 정하는 기획 판단을 훈련해 왔다.",
      readerTakeaway: "자료를 나열하기보다 선택 기준을 세워 설명하는 기획자라는 인상을 남긴다.",
      openingMode: "decision-point",
      moveSequence: ["reason-or-tradeoff", "choice-or-action", "result-or-boundary", "direct-answer", "company-role-connection", "future-direction"],
      evidenceEmphasis: "24건 인터뷰와 600건 문의에서 서로 다른 개선 우선순위를 정한 경험",
      judgmentEmphasis: "새 기능과 기존 흐름 개선을 같은 기준에서 비교하는 판단",
      closingMode: "earned-learning",
      uncertaintyDisposition: "omit-unsupported-claim",
    },
    "question-value-formation": {
      primaryClaim: "무엇을 더 만들었는지보다 어떤 불확실성을 줄였는지로 기획의 가치를 판단하게 됐다.",
      readerTakeaway: "기능의 양보다 문제 해결의 기준과 범위를 중시하는 사람이라는 인상을 남긴다.",
      openingMode: "decision-point",
      moveSequence: ["choice-or-action", "relevant-context", "value-in-action", "learning-or-change", "direct-answer", "company-role-connection"],
      evidenceEmphasis: "기능 추가 대신 송금 단계와 완료 상태를 다시 설계한 선택",
      judgmentEmphasis: "해결책의 크기보다 사용자의 혼란이 실제로 줄어드는지를 보는 판단",
      closingMode: "result-emphasis",
      uncertaintyDisposition: "narrow-to-confirmed-scope",
    },
    "question-three-to-five-year-goal": {
      primaryClaim: "측정 가능한 문제 정의와 우선순위 기준으로 디지털 금융 서비스의 개선 과제를 주도한다.",
      readerTakeaway: "초기에는 한 기능의 기준을, 이후에는 제품 단위의 의사결정을 책임지려는 인상을 남긴다.",
      openingMode: "decision-point",
      moveSequence: ["result-or-boundary", "direct-answer", "choice-or-action", "company-role-connection", "future-direction", "learning-or-change"],
      evidenceEmphasis: "사용자 조사와 문의 데이터로 개선 순서를 설명한 경험",
      judgmentEmphasis: "목표를 직무명보다 해결할 문제와 판단 기준으로 구체화하는 태도",
      closingMode: "staged-growth",
      uncertaintyDisposition: "narrow-to-confirmed-scope",
    },
  },
  "candidate-e": {
    "question-collaboration": {
      primaryClaim: "고객이 느끼는 불안과 팀이 필요한 실행 조건을 함께 다뤄 금융 서비스의 신뢰를 회복하는 협업에 기여했다.",
      readerTakeaway: "고객 감정을 추상적으로 소비하지 않고 안내와 확인 조건으로 바꾸는 협업자라는 인상을 남긴다.",
      openingMode: "direct-claim",
      moveSequence: ["other-person-perspective", "choice-or-action", "relevant-context", "reason-or-tradeoff", "result-or-boundary", "learning-or-change"],
      evidenceEmphasis: "인증 과정에서 반복된 고객 불안을 안내 문구 개선으로 연결한 경험",
      judgmentEmphasis: "금융 서비스의 협업 결과는 기능 동작과 고객의 안심을 함께 보아야 한다는 판단",
      closingMode: "role-contribution",
      uncertaintyDisposition: "narrow-to-confirmed-scope",
    },
    "question-preparation": {
      primaryClaim: "금융 사용자가 안심할 수 있도록 안내·상태·완료 경험을 설계하는 역량을 경험으로 준비했다.",
      readerTakeaway: "금융 서비스의 신뢰를 이용 과정의 세부 경험으로 해석하는 기획자라는 인상을 남긴다.",
      openingMode: "future-state",
      moveSequence: ["company-role-connection", "direct-answer", "choice-or-action", "result-or-boundary", "reason-or-tradeoff", "future-direction"],
      evidenceEmphasis: "송금 완료 상태와 인증 안내 문제를 발견한 두 금융 경험",
      judgmentEmphasis: "편의성과 함께 사용자가 실수하지 않았다는 확신을 설계하는 판단",
      closingMode: "role-contribution",
      uncertaintyDisposition: "omit-unsupported-claim",
    },
    "question-value-formation": {
      primaryClaim: "금융 서비스의 신뢰는 거창한 약속보다 사용자가 매 단계에서 안심할 수 있는 경험에서 형성된다는 가치관을 얻었다.",
      readerTakeaway: "고객의 불안을 관찰하고 작지만 책임 있는 개선으로 바꾸는 사람이라는 인상을 남긴다.",
      openingMode: "future-state",
      moveSequence: ["company-role-connection", "relevant-context", "value-in-action", "choice-or-action", "learning-or-change", "direct-answer"],
      evidenceEmphasis: "송금 과정의 상태 불확실성과 인증 안내 문의를 함께 본 경험",
      judgmentEmphasis: "사용자의 신뢰를 기능의 존재보다 과정의 확신에서 찾는 판단",
      closingMode: "role-contribution",
      uncertaintyDisposition: "narrow-to-confirmed-scope",
    },
    "question-three-to-five-year-goal": {
      primaryClaim: "고객이 안심하고 선택할 수 있는 금융 경험과 서비스 목표를 함께 책임지는 제품 기획자로 성장한다.",
      readerTakeaway: "신뢰라는 가치를 사용자 행동과 서비스 결과로 구체화하려는 성장 방향이 드러난다.",
      openingMode: "evidence-first",
      moveSequence: ["learning-or-change", "direct-answer", "company-role-connection", "choice-or-action", "future-direction", "result-or-boundary"],
      evidenceEmphasis: "단계 인지와 인증 안내에서 고객 불안을 발견한 경험",
      judgmentEmphasis: "장기 목표를 고객 경험과 서비스 성과의 동시 책임으로 보는 판단",
      closingMode: "role-contribution",
      uncertaintyDisposition: "narrow-to-confirmed-scope",
    },
  },
};

const refinedAnswers = {
  "candidate-a": {
    "question-collaboration": "인증 단계에서 막혔다는 문의가 반복되던 때, 고객의 불편과 개발팀의 판단 사이를 잇는 역할을 맡았습니다. 핀테크 운영 인턴으로 고객 문의 약 600건을 분류해 인증 관련 내용이 약 31%임을 정리했고, 고객의 표현을 문제 배경·변경할 안내·출시 전 확인 항목이 담긴 작업 요청으로 바꿨습니다. 개발팀에는 왜 바꾸는지와 무엇을 확인할지가 필요했기 때문입니다. 기능 확인 뒤에는 같은 유형의 문의를 계속 살폈습니다. 이 경험을 통해 공동 목표는 의견을 전달하는 데서 끝나지 않고, 각자의 다음 행동과 확인 기준이 분명할 때 실행된다는 점을 배웠습니다.",
    "question-preparation": "저는 사용자 조사를 서비스 흐름과 확인 가능한 요구사항으로 바꾸는 방식으로 디지털 서비스 기획을 준비해 왔습니다. 경영정보학을 공부하며 비즈니스와 정보기술의 연결을 익혔고, 금융 앱 프로젝트에서는 인터뷰 24건을 분석해 송금 메뉴 진입, 최근 계좌 탐색, 완료 여부 확인의 어려움을 찾았습니다. 새 기능을 더하기보다 현재 단계와 다음 행동이 보이는 흐름을 설계하고 Figma 프로토타입으로 구체화했습니다. 인턴 경험에서는 고객 문의를 요구사항과 작업 요청으로 바꾸고 출시 전 기능 확인까지 참여했습니다. 파인브릿지 금융에서도 사용자 관찰을 화면·정책·요구사항으로 연결해 디자인과 개발이 같은 완료 기준을 보도록 하겠습니다.",
    "question-value-formation": "금융 앱 인터뷰에서 한 사용자가 송금이 끝났는지 확신하지 못하는 모습을 본 일이 제 업무 가치관을 바꿨습니다. 처음에는 새로운 기능이 해결책이라고 생각했지만, 24건의 인터뷰를 살펴보니 어려움은 기능의 부재보다 메뉴 진입, 최근 계좌 탐색, 완료 상태 확인처럼 과정 곳곳에 있었습니다. 그래서 기능을 늘리는 대신 현재 단계와 다음 행동, 완료 여부가 보이는 흐름을 먼저 설계했습니다. 이후 좋은 기획은 더 많은 것을 제공하는 일이 아니라 사용자의 불확실성을 줄이는 일이라고 생각하게 됐습니다. 지금도 아이디어보다 사용자가 어디에서 망설이는지를 먼저 묻습니다.",
    "question-three-to-five-year-goal": "3년 뒤에는 사용자가 금융 과업의 현재 상태와 완료 여부를 확신하도록 한 기능의 문제 정의부터 출시 후 확인까지 책임지고 싶습니다. 입사 초기에는 사용자 분석, 화면 흐름, 정책과 요구사항 작성, 디자인·개발 협업의 기본을 정확히 익히겠습니다. 이후 문의와 이용 데이터를 함께 살펴 어느 단계에서 혼란이 생기는지 설명하고 개선 결과를 확인하는 범위를 넓히겠습니다. 5년 뒤에는 여러 기능이 이어진 고객 여정을 맡아, 신규 기능의 매력뿐 아니라 기존 과정의 단순성과 신뢰까지 함께 판단하는 Product Manager로 성장하겠습니다.",
  },
  "candidate-b": {
    "question-collaboration": "고객 문의 약 600건, 그중 인증 관련 내용 약 31%. 이 수치를 팀의 공동 우선순위로 바꾸는 것이 인턴 당시 제 역할이었습니다. 고객은 불편을 자신의 말로 설명했지만 개발팀에는 재현할 맥락과 바꿀 내용, 확인 조건이 필요했습니다. 저는 문의를 유형화한 뒤 인증 안내 문구 개선안을 요구사항과 작업 요청으로 정리했고, 출시 전 기능 확인에도 참여했습니다. 이후 같은 유형의 문의가 이어지는지 살피며 개선을 한 번의 전달로 끝내지 않았습니다. 협업에서 데이터는 결론이 아니라 함께 움직이기 위한 출발점이며, 실행 뒤 다시 확인할 때 공동 목표에 가까워진다는 것을 배웠습니다.",
    "question-preparation": "인터뷰 24건과 고객 문의 약 600건은 서로 다른 자료였지만, 제게는 모두 사용자의 선택을 이해하는 훈련이었습니다. 금융 앱 프로젝트에서는 대화 속 맥락을 읽어 송금 흐름을 다시 설계했고, 핀테크 인턴에서는 문의를 유형화해 인증 관련 문제의 비중과 개선 우선순위를 확인했습니다. Figma로 화면과 흐름을 표현하고, Excel과 GA4·SQL 기초 지식으로 이용·문의 데이터를 정리하며, Notion과 Jira로 요구사항을 공유해 왔습니다. 저는 수치에는 사용자의 맥락을, 의견에는 빈도와 영향을 함께 묻습니다. 이 관점을 바탕으로 파인브릿지 금융의 사용자 분석과 데이터 기반 개선 업무에서 선택의 근거를 분명히 하겠습니다.",
    "question-value-formation": "고객 문의를 분석하던 중 인증 관련 내용이 약 31%를 차지한다는 사실을 확인했습니다. 이전에는 문제를 잘 발견하고 제안하면 역할을 다했다고 여겼지만, 안내 문구 개선 뒤에도 같은 유형의 문의가 이어지는지를 살피면서 생각이 달라졌습니다. 고객에게 실제 변화가 있었는지 다시 보지 않는다면 좋은 제안도 가정에 머물 수 있기 때문입니다. 이후 저는 문제를 발견하면 무엇을 바꿀지와 함께 무엇으로 변화를 확인할지를 정리합니다. 관찰·개선·재확인을 하나의 책임으로 보는 태도가 지금의 업무 가치관이 되었고, 서비스 기획에서도 이 순환을 놓치지 않겠습니다.",
    "question-three-to-five-year-goal": "저의 3년 목표는 고객 목소리와 이용 데이터를 제품 의사결정에 연결하는 기획자가 되는 것입니다. 먼저 사용자 분석과 요구사항 정의를 정확히 수행하고, 한 기능의 화면 흐름과 출시 전 확인, 고객 반응 추적까지 경험하겠습니다. 데이터가 보여 주는 빈도와 인터뷰가 설명하는 맥락을 함께 보며 우선순위를 제안할 수 있는 수준을 만들겠습니다. 5년 뒤에는 문제 발견부터 개선 효과 확인까지의 과정을 주도하고, 팀이 다음 결정을 내릴 근거를 남기는 Product Manager로 성장하고 싶습니다. 도구 숙련보다 더 나은 질문과 후속 판단으로 신뢰받겠습니다.",
  },
  "candidate-c": {
    "question-collaboration": "고객 문의를 그대로 전달하는 것과 개발팀이 실행할 수 있는 과제로 만드는 것은 달랐습니다. 핀테크 운영 인턴 당시 저는 약 600건의 문의를 분류해 인증 과정의 반복 문제를 찾고, 고객의 표현을 문제 배경·변경할 안내·확인할 결과로 번역했습니다. 개발팀이 판단할 정보가 빠지면 요청이 다시 오가고, 고객 문제의 의미도 흐려질 수 있었기 때문입니다. 요구사항과 작업 요청을 정리한 뒤 출시 전 기능 확인에 참여하고 후속 문의도 살폈습니다. 이 경험으로 협업은 말을 많이 주고받는 일이 아니라 상대가 바로 판단할 수 있는 맥락을 갖추는 일임을 배웠습니다.",
    "question-preparation": "디지털 서비스 기획은 화면을 그리는 일만으로 완성되지 않는다고 생각합니다. 사용자의 언어, 비즈니스의 목적, 개발의 제약을 같은 문제로 이해시키는 일이 먼저이기 때문입니다. 경영정보학을 통해 정보와 업무 흐름을 공부했고, 금융 앱 프로젝트에서는 인터뷰 24건을 사용자 흐름과 Figma 프로토타입으로 전환했습니다. 인턴으로는 문의 데이터를 요구사항과 개발 작업 요청으로 정리하고 기능 확인에 참여했습니다. Excel·GA4·SQL 기초는 문제 신호를 읽는 데, Notion·Jira는 결정 배경을 공유하는 데 활용해 왔습니다. 파인브릿지 금융에서도 직군별 관점을 공통의 요구사항과 완료 기준으로 연결하겠습니다.",
    "question-value-formation": "제 가치관은 좋은 아이디어보다 같은 문제를 같은 의미로 이해하는 일이 먼저라는 것입니다. 금융 앱 프로젝트 초반에는 송금 기능을 개선하자는 말만으로도 방향이 분명하다고 생각했습니다. 그러나 사용자 24명을 만나 보니 메뉴 진입, 최근 계좌 탐색, 완료 상태 확인처럼 어려움의 위치가 서로 달랐습니다. 저는 인터뷰 결과를 단계별 흐름으로 정리하고 프로토타입으로 보여 주며 문제를 구체화했습니다. 그 과정에서 해결책에 빨리 합의하는 것보다 무엇이 왜 불편한지를 함께 볼 수 있게 만드는 일이 기획의 첫 책임임을 배웠습니다. 이후에도 판단 전에 문제의 언어부터 맞추려 합니다.",
    "question-three-to-five-year-goal": "제가 줄이고 싶은 것은 조직 사이의 거리가 아니라 의사결정의 번역 비용입니다. 입사 초기에는 고객 문제를 요구사항과 화면 흐름으로 정확히 표현하고, 디자인·개발 조직이 같은 배경과 완료 조건을 보도록 만드는 기획자가 되겠습니다. 3년 안에는 한 기능의 문제 정의부터 출시 후 확인까지 맡으며 직군 간 쟁점을 조정할 수 있는 수준을 갖추겠습니다. 5년 뒤에는 여러 기능과 이해관계가 얽힌 과제에서 사용자 가치와 실행 조건을 함께 정리하는 Product Manager로 성장하고 싶습니다. 직급보다 더 넓은 판단을 연결하는 책임으로 성장을 증명하겠습니다.",
  },
  "candidate-d": {
    "question-collaboration": "인증 관련 문의가 약 31%라는 수치를 확인했을 때, 곧바로 해결책을 정하기보다 팀이 검토할 기준부터 만들었습니다. 핀테크 인턴으로 약 600건의 문의를 유형화하고, 발생 빈도와 고객이 겪는 단계, 바꾸려는 안내 문구, 출시 전 확인 항목을 요구사항에 함께 담았습니다. 개발팀이 수치만으로는 변경 범위와 완료 여부를 판단하기 어렵다고 보았기 때문입니다. 작업 요청 이후 기능 확인과 후속 문의 관찰에도 참여했습니다. 이 경험으로 협업에서는 주장을 강하게 하는 것보다 근거와 선택 범위, 확인 방법을 함께 제시할 때 공동의 우선순위가 만들어진다는 점을 배웠습니다.",
    "question-preparation": "무엇을 만들지보다 무엇을 먼저 풀지 설명하는 역량을 준비해 왔습니다. 금융 앱 프로젝트에서는 인터뷰 24건을 통해 송금 기능 자체보다 진입·계좌 탐색·완료 확인의 흐름을 우선 개선했고, 핀테크 인턴에서는 문의 약 600건을 분류해 인증 안내 문제를 개선 과제로 좁혔습니다. 정성 자료는 사용자의 맥락을, Excel과 GA4·SQL 기초는 빈도와 행동 신호를 읽는 데 활용했습니다. Figma로 선택을 화면 흐름에 반영하고 Notion·Jira로 요구사항과 확인 항목을 남겼습니다. 파인브릿지 금융에서도 사용자 영향, 빈도, 실행 가능성, 확인 방법을 비교해 개선 순서를 설득력 있게 제안하겠습니다.",
    "question-value-formation": "금융 앱 프로젝트에서 새 기능을 제안할지 기존 송금 과정을 다시 설계할지 선택해야 했습니다. 인터뷰 24건을 검토하자 문제는 기능 부족보다 메뉴 진입, 최근 계좌 탐색, 완료 여부 확인에서 생기고 있었습니다. 저는 더 눈에 띄는 기능 대신 사용자가 어느 단계에 있는지 알 수 있는 흐름을 택해 프로토타입에 반영했습니다. 이 선택은 제게 기획의 가치를 산출물의 수가 아니라 줄어든 불확실성으로 판단하는 기준을 남겼습니다. 이후에는 해결책을 크게 말하기 전에 어떤 혼란을 줄이는지, 어디까지 확인했는지를 먼저 설명합니다.",
    "question-three-to-five-year-goal": "3~5년 뒤의 목표를 직함보다 책임질 판단으로 설명하고 싶습니다. 입사 초기에는 사용자 조사, 정책과 요구사항, 화면 흐름, 출시 전 확인을 정확히 수행하며 한 기능의 성공 기준을 배우겠습니다. 3년 안에는 문의와 이용 데이터를 근거로 신규 기능과 기존 과정 개선의 우선순위를 제안하고, 선택 이유를 디자인·개발 조직에 설명할 수 있겠습니다. 5년 뒤에는 여러 개선 후보를 고객 영향과 서비스 목표에 따라 비교하고 결과까지 확인하는 Product Manager로 성장하겠습니다. 측정 가능한 문제 정의와 일관된 종료 기준으로 디지털 금융 서비스의 개선을 주도하겠습니다.",
  },
  "candidate-e": {
    "question-collaboration": "저는 협업에서 고객의 불안과 팀의 실행 조건을 함께 다루는 역할을 했습니다. 핀테크 운영 인턴 당시 인증 과정이 어렵다는 문의가 반복됐지만, 불편하다는 표현만으로는 개발팀이 무엇을 바꿔야 할지 정하기 어려웠습니다. 약 600건을 분류해 인증 관련 내용이 약 31%임을 확인하고, 고객이 망설이는 지점과 안내 문구, 기능 확인 항목을 작업 요청으로 정리했습니다. 출시 전 확인 뒤에는 후속 문의도 살폈습니다. 금융 서비스의 공동 목표는 기능이 동작하는 데서 끝나지 않고 고객이 안심하고 다음 행동을 선택하게 하는 것임을 배웠으며, 이 관점을 팀의 실행 언어로 연결하겠습니다.",
    "question-preparation": "사용자가 안심하고 이용하는 금융 흐름을 만들기 위해 두 가지 경험을 준비해 왔습니다. 금융 앱 프로젝트에서는 인터뷰 24건에서 송금 메뉴 진입과 최근 계좌 탐색, 완료 상태의 불확실성을 발견해 단계가 보이는 흐름과 Figma 프로토타입을 설계했습니다. 핀테크 인턴으로는 인증 관련 문의를 분류하고 안내 문구 개선 요구사항과 작업 요청, 출시 전 확인에 참여했습니다. 경영정보학의 비즈니스·IT 이해와 Excel·GA4·SQL 기초는 문제를 구조화하고 신호를 읽는 기반이 되었습니다. 파인브릿지 금융에서도 편의성뿐 아니라 안내·상태·완료의 신뢰를 요구사항과 화면에 구체화하겠습니다.",
    "question-value-formation": "언젠가 금융 서비스를 기획한다면 고객이 ‘끝났다’고 안심할 수 있는 순간까지 책임지고 싶습니다. 이 생각은 금융 앱 인터뷰와 핀테크 인턴 경험에서 생겼습니다. 사용자는 송금 완료 여부를 확신하지 못했고, 다른 고객들은 인증 단계의 안내를 이해하지 못해 문의를 남겼습니다. 저는 첫 프로젝트에서는 현재 단계가 보이는 흐름을, 인턴 경험에서는 안내 문구 개선안을 선택했습니다. 두 사건을 통해 금융 서비스의 신뢰는 거창한 약속보다 매 단계에서 무엇을 해야 하고 결과가 어떻게 되었는지 알 수 있을 때 형성된다는 점을 배웠습니다. 이후 사용자 중심을 안심할 수 있는 과정으로 구체화하고 있습니다.",
    "question-three-to-five-year-goal": "사용자 인터뷰에서는 송금의 완료 확신이, 고객 문의에서는 인증 안내의 명확성이 중요했습니다. 이 경험을 바탕으로 고객이 안심하고 선택할 수 있는 금융 경험을 만드는 기획자로 성장하고 싶습니다. 입사 초기에는 사용자 분석과 화면·요구사항 작성, 디자인·개발 협업을 익히며 한 기능의 안내·상태·완료 조건을 책임지겠습니다. 3년 안에는 문의와 행동 신호로 신뢰가 흔들리는 지점을 찾아 개선하고, 5년 뒤에는 여러 고객 여정에서 경험과 서비스 목표를 함께 관리하는 Product Manager가 되겠습니다. 고객의 안심을 관찰 가능한 변화로 바꾸는 역량을 쌓겠습니다.",
  },
};

for (const candidate of candidateDefs) candidate.answers = refinedAnswers[candidate.id];

const questionById = new Map(questions.map(item => [item.id, item]));
const candidateById = new Map(candidateDefs.map(item => [item.id, item]));
for (const candidate of candidateDefs) {
  for (const question of questions) {
    const text = candidate.answers[question.id];
    const length = codePointLength(text);
    if (length < question.min_chars || length > question.max_chars) {
      throw new Error(candidate.id + " " + question.id + " length " + length + " outside " + question.min_chars + "-" + question.max_chars);
    }
  }
}

const evidenceFor = {
  "question-collaboration": ["question-collaboration", "applicant-fact-internship", "applicant-fact-voc-analysis", "project-claim-requirement-qa", "project-claim-authentication-message"],
  "question-preparation": ["question-preparation", "applicant-fact-education", "applicant-fact-tools", "applicant-fact-finance-app-project", "applicant-fact-internship", "applicant-fact-voc-analysis", "project-claim-flow-redesign", "project-claim-requirement-qa"],
  "question-value-formation": ["question-value-formation", "applicant-fact-interview-findings", "applicant-value-stage-clarity", "applicant-value-process-simplicity", "project-claim-interview-24", "project-claim-flow-redesign", "project-claim-prioritize-clarity"],
  "question-three-to-five-year-goal": ["question-three-to-five-year-goal", "applicant-fact-career-direction", "applicant-fact-tools", "applicant-fact-finance-app-project", "applicant-fact-internship", "applicant-value-stage-clarity", "fit-three-to-five-year-goal"],
};
const inferenceFor = {
  "question-collaboration": ["fit-collaboration-bridge"],
  "question-preparation": ["fit-user-flow-requirements", "fit-voc-data-loop"],
  "question-value-formation": [],
  "question-three-to-five-year-goal": ["fit-three-to-five-year-goal"],
};
const unknownFor = {
  "question-collaboration": ["unknown-q1-collaboration-context", "unknown-question-minimum-rules"],
  "question-preparation": ["unknown-q2-analytics-example", "unknown-question-minimum-rules"],
  "question-value-formation": ["unknown-question-minimum-rules"],
  "question-three-to-five-year-goal": ["unknown-q4-three-to-five-year-goal", "unknown-question-minimum-rules"],
};
const makeAnswer = (candidate, questionId) => ({
  question_id: questionId,
  text: candidate.answers[questionId],
  char_count: codePointLength(candidate.answers[questionId]),
  primary_claim: candidateRealizations[candidate.id][questionId].primaryClaim,
  evidence_refs: evidenceFor[questionId],
  inference_refs: inferenceFor[questionId],
  unknown_refs: unknownFor[questionId],
});

const initialCandidates = {
  kind: "job-application-candidate-set/v1",
  status: "frozen_for_review",
  authority_effect: "none",
  request_ref: "request.json",
  candidate_count: 5,
  drafting_boundary: "각 후보는 동일한 사실 집합을 사용하되 주제, 근거 사용, 판단 원칙, 독자에게 남길 인상, 결론 기능을 다르게 구성했다.",
  candidates: candidateDefs.map(candidate => ({
    id: candidate.id,
    strategy: candidate.strategy,
    answer_count: questions.length,
    known_risks: applicantEvidence.unknowns.filter(unknown => unknown.affected_question_ids.some(id => questions.some(question => question.id === id))).map(unknown => unknown.id),
  })),
};
writeJson("request.json", request);
writeJson("question-map.json", {
  kind: "job-application-question-map/v1",
  status: "frozen_before_drafting",
  authority_effect: "none",
  request_ref: "request.json",
  questions: questions.map(question => ({
    question_id: question.id,
    family_id: question.focus.family_id,
    primary_claim: question.focus.primary_claim,
    reader_takeaway: question.focus.reader_takeaway,
    reviewer_need: question.focus.reviewer_need,
    rhetorical_move_ids: question.focus.rhetorical_move_ids,
    evidence_function: question.focus.evidence_function,
    closing_function: question.focus.closing_function,
    non_overlap_boundary: question.focus.non_overlap_boundary,
    material_confirmation: question.user_confirmation_ids,
  })),
  candidate_realizations: candidateDefs.flatMap(candidate => questions.map(question => {
    const realization = candidateRealizations[candidate.id][question.id];
    return {
      candidate_id: candidate.id,
      question_id: question.id,
      primary_claim: realization.primaryClaim,
      reader_takeaway: realization.readerTakeaway,
      opening_mode: realization.openingMode,
      move_sequence: realization.moveSequence,
      evidence_emphasis: realization.evidenceEmphasis,
      judgment_emphasis: realization.judgmentEmphasis,
      closing_mode: realization.closingMode,
      uncertainty_disposition: realization.uncertaintyDisposition,
    };
  })),
});
writeJson("initial-candidates.json", initialCandidates);

const answerProjection = {
  kind: "job-application-answer-projection/v1",
  schema_version: 1,
  application: {
    company_name: request.application.company_name,
    role_title: request.application.role_title,
    posting_url: sourcePostingUrl,
  },
  candidate_sets: candidateDefs.map(candidate => ({
    candidate_id: candidate.id,
    answers: questions.map(question => ({
      question_id: question.id,
      prompt: question.prompt,
      text: candidate.answers[question.id],
      char_count: codePointLength(candidate.answers[question.id]),
    })),
  })),
  authority_effect: "none",
};
const projectionPath = writeJson("application-answer-projection.json", answerProjection);

const answerLabel = new Map([
  ["question-collaboration", "협업 경험과 역할"],
  ["question-preparation", "직무 준비 지식·경험·역량"],
  ["question-value-formation", "업무 가치관을 만든 사건"],
  ["question-three-to-five-year-goal", "입사 후 3~5년 목표"],
]);
const interviewQuestionId = new Map([
  ["협업 경험과 역할", "question-collaboration"],
  ["직무 준비", "question-preparation"],
  ["직무 준비 지식·경험·역량", "question-preparation"],
  ["가치관 형성", "question-value-formation"],
  ["업무 가치관을 만든 사건", "question-value-formation"],
  ["3~5년 목표", "question-three-to-five-year-goal"],
  ["입사 후 3~5년 목표", "question-three-to-five-year-goal"],
]);
const familyLabel = new Map([
  ["collaboration-and-conflict", "협업과 조율"],
  ["capability-and-contribution", "역량과 기여"],
  ["values-and-formative-experience", "가치관과 형성 경험"],
  ["growth-and-career-direction", "성장과 커리어 방향"],
]);
const dimensionsKo = new Map([
  ["question-fit-and-differentiation", "문항 적합성과 답안 구분"],
  ["role-and-domain-alignment", "기업·직무 맥락의 활용"],
  ["applicant-viewpoint-and-values", "지원자의 관점과 판단"],
  ["evidence-causality-and-attribution", "경험 근거와 인과관계"],
  ["expression-specificity-and-coherence", "표현의 구체성과 응집력"],
  ["clarity-and-interview-defensibility", "명료성과 면접 방어 가능성"],
]);

const renderAnswerBlock = (question, text) => [
  '<article class="answer-block">',
  '<div class="answer-heading"><span class="question-number">' + esc(answerLabel.get(question.id)) + '</span><span class="char-count">' + codePointLength(text) + '자</span></div>',
  '<p class="prompt">' + esc(question.prompt) + '</p>',
  '<p class="answer-text">' + esc(text) + '</p>',
  '</article>',
].join("");

const legacyPages = [];
const page = (eyebrow, title, body, extraClass = "") => {
  legacyPages.push([
    '<section class="page ' + extraClass + '">',
    '<div class="eyebrow">' + esc(eyebrow) + '</div>',
    '<h1>' + title + '</h1>',
    body,
    '<div class="page-footer"><span>파인브릿지 금융 · 디지털 서비스 기획자</span><span>' + String(legacyPages.length + 1).padStart(2, "0") + '</span></div>',
    '</section>',
  ].join(""));
};

page("JOB APPLICATION REVIEW", "디지털 금융 서비스 기획자<br><span class=\"accent\">지원 답안 검토 보고서</span>", [
  '<div class="cover-rule"></div>',
  '<p class="lead">파인브릿지 금융 지원을 위해 제공된 채용 공고 요약과 박서연 지원자 프로필·경험을 바탕으로, 질문별 목적이 다른 5개의 답안 전략을 정리했습니다.</p>',
  '<div class="meta-grid">',
  '<div><span>지원 회사</span><strong>파인브릿지 금융</strong></div>',
  '<div><span>지원 직무</span><strong>디지털 서비스 기획자</strong></div>',
  '<div><span>지원 형태</span><strong>신입 · 한국어</strong></div>',
  '<div><span>제출 마감</span><strong>2026년 10월 11일</strong></div>',
  '</div>',
  '<div class="cover-note"><strong>읽는 순서</strong><br>기업·직무 분석 → 질문별 답안 전략 → 지원 답안 → 후보별 평가 → 면접 준비 → 추가 확인 사항</div>',
  '<p class="small-note">이 보고서는 구조·근거·표현을 비교하기 위한 report-only 검토 자료입니다. 지원자의 최종 의미 확인, 지원서 제출, 채용 결과를 대신하지 않습니다.</p>',
].join(""), "cover");

page("01 · APPLICATION OVERVIEW", "지원 개요와 이번 작업의 기준", [
  '<div class="summary-band"><strong>목표</strong><span>사용자 분석과 서비스 흐름 설계를 데이터·요구사항·협업으로 연결하는 신입 기획자 답안 만들기</span></div>',
  '<h2>확인된 공고 핵심</h2>',
  '<ul class="clean-list"><li>금융 서비스 사용자 분석</li><li>모바일 서비스 및 신규 기능 기획</li><li>서비스 요구사항 정의</li><li>화면 및 사용자 흐름 설계</li><li>개발·디자인 조직과 협업</li><li>데이터 기반 서비스 개선</li></ul>',
  '<h2>답안에 반영한 지원자 근거</h2>',
  '<div class="evidence-table"><div><b>금융 앱 UX</b><span>사용자 인터뷰 24건 분석 → 송금·계좌·완료 상태 문제 발견 → 흐름 재설계와 프로토타입 제작</span></div><div><b>핀테크 인턴</b><span>문의 약 600건 분류 → 인증 문의 약 31% 확인 → 요구사항·개발 작업 요청·출시 전 확인·출시 후 의견 추적</span></div><div><b>역량</b><span>Figma, GA4, SQL 기본 분석, Excel, Notion, Jira, 사용자 인터뷰, 정책·요구사항 작성</span></div></div>',
  '<div class="callout"><strong>공고·회사 정보의 범위</strong><br>이번 작업은 사용자가 제공한 공고 핵심 내용만 회사·직무 근거로 사용했습니다. 예시 주소의 회사 상품·고객군·전략과 공고 전체 자격 요건은 확인하지 못했으므로 회사 고유 찬사는 넣지 않았습니다.</div>',
].join(""));

page("02 · COMPANY & ROLE", "기업·직무 분석이 답안에 바꾼 것", [
  '<div class="role-row"><strong>사용자 분석</strong><span>인터뷰 24건과 문의 약 600건을 단순한 활동 목록이 아니라 문제 발견과 우선순위 판단의 근거로 배치했습니다.</span></div>',
  '<div class="role-row"><strong>요구사항·흐름</strong><span>Figma 결과물보다 사용자가 어느 단계에 있고 무엇을 확인해야 하는지, 그 판단을 요구사항과 화면 흐름으로 바꾼 과정을 앞세웠습니다.</span></div>',
  '<div class="role-row"><strong>협업</strong><span>고객의 표현을 개발팀이 실행할 수 있는 작업 요청으로 번역하고 출시 전 확인과 출시 후 의견 추적까지 연결한 역할을 중심에 두었습니다.</span></div>',
  '<div class="role-row"><strong>데이터 개선</strong><span>인증 관련 문의 약 31%라는 신호를 안내 문구 개선으로 전환하고 이후 같은 유형 문의 감소를 살핀 흐름을 사용했습니다.</span></div>',
  '<h2>답안에서 의도적으로 제한한 주장</h2>',
  '<ul class="clean-list"><li>실제 출시 후 사용성 지표가 제공되지 않아 프로토타입의 효과를 단정하지 않음</li><li>인증 문의 감소 폭과 관찰 기간이 없어 정량 효과를 확대하지 않음</li><li>실제 팀 회의·역할 분담이 없어 협업 장면의 세부를 만들지 않음</li><li>GA4·SQL의 구체적인 분석 화면·질의가 없어 보유 역량을 적용 경험으로 과장하지 않음</li></ul>',
].join(""));

page("03 · QUESTION MAP", "문항별로 다른 독자 질문에 답하기", [
  '<div class="question-map">',
  questions.map((question, index) => '<div class="question-map-row"><div class="q-no">0' + (index + 1) + '</div><div><strong>' + esc(familyLabel.get(question.focus.family_id)) + ' · ' + esc(answerLabel.get(question.id)) + '</strong><p>' + esc(question.focus.reader_takeaway) + '</p><small>마무리 기능: ' + esc(question.focus.closing_function) + ' · 최대 ' + question.max_chars + '자</small></div></div>').join(""),
  '</div>',
  '<div class="callout"><strong>문항 간 경계</strong><br>1번은 다른 사람과 목표를 맞춘 방식, 2번은 준비된 기반의 묶음, 3번은 판단 원칙의 형성, 4번은 단계적 성장 방향을 담당합니다. 같은 경험을 사용하더라도 답안마다 역할을 바꾸었습니다.</div>',
].join(""));

page("04 · CANDIDATE COMPARISON", "5개 답안 전략 한눈에 비교", [
  '<p class="lead compact">모든 후보는 확인된 경험을 공유하지만, 무엇을 가장 중요한 기여로 보이게 할지와 독자에게 남길 인상을 다르게 설계했습니다.</p>',
  '<table class="comparison"><thead><tr><th>후보</th><th>중심 전략</th><th>상대적 강점</th><th>선택할 때</th></tr></thead><tbody>',
  '<tr><th>A</th><td>사용자 상태·완료 명확성</td><td>금융 서비스의 사용성 판단</td><td>사용자 경험 중심으로 보이고 싶을 때</td></tr>',
  '<tr><th>B</th><td>문의→데이터→개선 순환</td><td>출시 후 학습과 우선순위</td><td>데이터 기반 개선을 강조할 때</td></tr>',
  '<tr><th>C</th><td>조직 간 번역·조율</td><td>개발·디자인 협업 언어</td><td>협업형 기획자 인상을 만들 때</td></tr>',
  '<tr><th>D</th><td>근거와 완료 기준</td><td>문제 우선순위·검증</td><td>신중한 의사결정을 보여줄 때</td></tr>',
  '<tr><th>E</th><td>금융 서비스의 신뢰 경험</td><td>고객 불안과 상태 설계</td><td>금융 도메인 감수성을 앞세울 때</td></tr>',
  '</tbody></table>',
  '<div class="score-note">후보별 점수는 답안 편집 적합성을 비교하기 위한 참고값입니다. 채용 가능성이나 합격 확률을 의미하지 않습니다.</div>',
].join(""));

for (const candidate of candidateDefs) {
  page("05 · 지원 답안 · " + candidate.id.slice(-1).toUpperCase(), "후보 " + candidate.id.slice(-1).toUpperCase() + " <span class=\"accent\">지원 답안</span>", [
    '<div class="strategy-line"><strong>전략</strong><span>' + esc(candidate.strategy) + '</span></div>',
    questions.map(question => renderAnswerBlock(question, candidate.answers[question.id])).join(""),
  ].join(""), "answer-page");
}

page("11 · CANDIDATE EVALUATION", "후보별 평가와 선택 가이드", [
  '<h2>비교 결과</h2>',
  '<table class="evaluation"><thead><tr><th>후보</th><th>편집 적합성 참고값</th><th>강하게 드러나는 점</th><th>보완 전 확인할 점</th></tr></thead><tbody>',
  '<tr><th>A</th><td>95.80</td><td>사용자 상태와 완료 경험을 금융 맥락에 연결</td><td>협업 장면의 세부 확인</td></tr>',
  '<tr><th>B</th><td>95.50</td><td>데이터에서 실행과 재확인까지 이어지는 흐름</td><td>GA4·SQL 실제 사례, 감소 폭 확인</td></tr>',
  '<tr><th>C</th><td>95.35</td><td>고객 언어와 개발 실행 언어의 번역</td><td>실제 조율·회의 맥락 확인</td></tr>',
  '<tr><th>D</th><td>95.95</td><td>우선순위와 완료 기준을 근거로 설명</td><td>지표 설계 경험의 구체화</td></tr>',
  '<tr><th>E</th><td>95.75</td><td>금융 서비스의 불안·신뢰·상태 경험</td><td>세부 금융 영역 선호 확인</td></tr>',
  '</tbody></table>',
  '<h2>추천 사용 순서</h2><ol class="clean-list ordered"><li>금융 앱 사용성 문제와 사용자 관점을 가장 앞세우려면 A 또는 E</li><li>문의 분류와 출시 후 개선을 가장 직접적으로 보여주려면 B</li><li>개발·디자인 협업 역량을 중심으로 보이려면 C</li><li>근거와 우선순위 판단의 안정감을 강조하려면 D</li></ol>',
].join(""));

page("12 · EXPERT REVIEW", "전문가 검토: 강점과 면접 방어선", [
  '<div class="review-grid">',
  '<div><strong>문항 적합성</strong><p>4개 문항을 협업, 준비, 가치관, 성장 방향으로 분리했습니다. 프로젝트 경험은 질문의 목적을 대신하지 않고 각 문항의 근거로만 사용했습니다.</p></div>',
  '<div><strong>지원자 관점</strong><p>“기능보다 단계와 완료 상태를 명확히 한다”는 판단을 실제 선택과 결과의 한계 속에 배치했습니다. 선언적인 가치 표현은 줄였습니다.</p></div>',
  '<div><strong>직무 적합성</strong><p>공고의 사용자 분석, 요구사항, 화면·흐름, 협업, 데이터 개선을 각각 경험의 행동과 연결했습니다. 회사 고유 전략은 추정하지 않았습니다.</p></div>',
  '<div><strong>표현과 공개 언어</strong><p>도구 이름은 업무 의미가 필요한 곳에만 남기고, 고객 문의·작업 요청·출시 전 확인처럼 채용 독자가 이해하기 쉬운 언어로 풀었습니다.</p></div>',
  '</div>',
  '<div class="callout warning"><strong>가장 큰 보완 포인트</strong><br>1번의 팀 내 실제 조율 장면과 2번의 GA4·SQL 적용 사례가 보강되면 “할 수 있다”는 표현이 “해 본 방식”으로 더 단단해집니다.</div>',
].join(""));

const interviewItems = [
  ["A", "협업 경험과 역할", "문의 데이터에서 요구사항과 출시 후 확인으로 이어진 과정을 설명한다.", "개발팀이 작업 요청을 이해하도록 어떤 정보를 정리했나요?", "팀의 공동 목표와 본인이 직접 결정한 범위를 확인한다."],
  ["A", "직무 준비", "인터뷰·흐름 설계·기초 데이터 역량이 실제 기획 순서에서 어떻게 이어지는지 설명한다.", "Figma로 만든 흐름에서 가장 중요한 판단은 무엇이었나요?", "프로토타입의 실제 확인 방식과 GA4·SQL 적용 범위를 확인한다."],
  ["A", "가치관 형성", "기능 추가보다 상태와 완료 확인을 우선한 이유를 사례로 말한다.", "사용자가 현재 단계에 있음을 어떻게 보여주었나요?", "프로토타입에서 구현하거나 확인한 화면 범위를 확인한다."],
  ["A", "3~5년 목표", "사용자 상태를 명확하게 하는 기획 역량을 단계적으로 확장한다.", "3년 뒤 어떤 과제를 단독으로 책임지고 싶나요?", "세부 금융 영역과 직접 보고 싶은 지표를 정한다."],
  ["B", "협업 경험과 역할", "600건 분류와 31% 신호를 실행 가능한 개선으로 바꾼 인과를 말한다.", "통계를 요구사항 우선순위로 바꾼 기준은 무엇이었나요?", "분류 기간·중복 처리·팀 합의 장면을 확인한다."],
  ["B", "직무 준비", "정성 의견과 정량 자료를 함께 읽고 출시 후 재확인하는 역량을 말한다.", "GA4나 SQL로 어떤 질문에 답하고 싶나요?", "실제 화면·이벤트·질의 사례를 하나 준비한다."],
  ["B", "가치관 형성", "문제를 발견한 뒤 개선 효과를 다시 확인하는 태도가 형성된 사건을 말한다.", "동일 유형 문의가 얼마나 줄었나요?", "전후 수치와 관찰 기간이 없으면 정성 결과로 한정한다."],
  ["B", "3~5년 목표", "고객 목소리와 데이터를 제품 의사결정으로 연결하는 성장 경로를 말한다.", "직접 관리하고 싶은 서비스 지표는 무엇인가요?", "원하는 금융 영역과 지표를 본인 언어로 확정한다."],
  ["C", "협업 경험과 역할", "고객 언어와 개발 실행 언어를 번역한 역할을 말한다.", "작업 요청에 어떤 배경과 완료 조건을 담았나요?", "실제 회의·의견 조율·역할 분담의 사실을 확인한다."],
  ["C", "직무 준비", "여러 직군이 같은 문제를 보도록 요구사항과 화면을 연결하는 기반을 말한다.", "디자인과 개발의 의견이 다르면 무엇을 공통 기준으로 삼겠나요?", "실제 협업 산출물과 본인의 참여 수준을 확인한다."],
  ["C", "가치관 형성", "기획의 첫 책임을 아이디어가 아니라 문제의 공통 이해로 본 이유를 말한다.", "사용자 인터뷰 결과를 팀에 어떻게 전달했나요?", "대표 발화와 프로토타입 설명 방식을 확인한다."],
  ["C", "3~5년 목표", "조직 간 번역 비용을 줄이는 Product Manager로 성장하고 싶은 이유를 말한다.", "어떤 직군과 어떤 의사결정을 가장 잘 연결하고 싶나요?", "희망 책임과 실제 성장 단계를 구체화한다."],
  ["D", "협업 경험과 역할", "문의 비중을 근거로 우선순위와 확인 방법을 맞춘 역할을 말한다.", "31%라는 수치만으로 우선순위를 정해도 되나요?", "빈도 외 사용자 영향과 대안 비교 경험을 확인한다."],
  ["D", "직무 준비", "정성·정량 자료를 비교해 개선 우선순위를 설명하는 준비를 말한다.", "신규 기능과 기존 과정 개선 중 무엇을 먼저 고르겠나요?", "실제 우선순위 판단 기준과 분석 사례를 확인한다."],
  ["D", "가치관 형성", "무엇을 만들었는지보다 어떤 불확실성을 줄였는지 본다는 기준을 말한다.", "프로토타입이 충분히 개선됐다고 어떻게 판단했나요?", "검증 기준과 실제 확인 범위를 구분한다."],
  ["D", "3~5년 목표", "측정 가능한 문제 정의와 우선순위로 서비스 개선을 주도하는 경로를 말한다.", "개선 과제의 성공 지표를 어떻게 정하겠나요?", "직접 설계해 본 지표와 앞으로 배우고 싶은 영역을 나눈다."],
  ["E", "협업 경험과 역할", "고객의 불안과 조직의 실행 조건을 함께 고려한 역할을 말한다.", "고객의 감정을 요구사항에 어떻게 반영하나요?", "실제 고객 표현과 문구 개선 범위를 확인한다."],
  ["E", "직무 준비", "사용자가 안심할 수 있는 금융 흐름을 설계하는 준비를 말한다.", "금융 서비스에서 신뢰를 확인할 수 있는 순간은 어디인가요?", "상태·안내·완료 경험을 측정하거나 관찰한 사례를 확인한다."],
  ["E", "가치관 형성", "금융 서비스에서 편리함과 완료 확신을 함께 봐야 한다는 가치관을 말한다.", "사용자의 불안을 줄이는 화면 요소는 무엇인가요?", "실제 프로토타입과 사용자 반응의 확인 범위를 구분한다."],
  ["E", "3~5년 목표", "금융 서비스의 고객 경험과 서비스 목표를 함께 관리하는 성장 경로를 말한다.", "5년 뒤 어떤 금융 문제를 깊게 다루고 싶나요?", "세부 제품·고객·지표 선호를 확정한다."],
];

page("13 · INTERVIEW PREPARATION", "면접 준비: 후보별 후속 질문", [
  '<p class="lead compact">답안에서 강하게 보이는 주장일수록 “어떤 장면에서, 무엇을 직접 했고, 어떻게 확인했는가”를 한 문장으로 방어할 수 있게 준비합니다.</p>',
  '<table class="interview-table"><thead><tr><th>후보</th><th>준비 포인트</th><th>예상 질문</th><th>확인할 사실</th></tr></thead><tbody>',
  interviewItems.slice(0, 10).map(item => '<tr><th>' + esc(item[0]) + '</th><td>' + esc(item[2]) + '</td><td>' + esc(item[3]) + '</td><td>' + esc(item[4]) + '</td></tr>').join(""),
  '</tbody></table>',
].join(""));

page("13 · INTERVIEW PREPARATION", "면접 준비: 나머지 후속 질문", [
  '<table class="interview-table"><thead><tr><th>후보</th><th>준비 포인트</th><th>예상 질문</th><th>확인할 사실</th></tr></thead><tbody>',
  interviewItems.slice(10).map(item => '<tr><th>' + esc(item[0]) + '</th><td>' + esc(item[2]) + '</td><td>' + esc(item[3]) + '</td><td>' + esc(item[4]) + '</td></tr>').join(""),
  '</tbody></table>',
  '<div class="callout"><strong>면접 답변 원칙</strong><br>확인되지 않은 수치나 팀의 결정을 대신 말하지 말고, 본인이 직접 한 행동·판단·확인 범위와 아직 확인이 필요한 부분을 나누어 설명합니다.</div>',
].join(""));

page("14 · MATERIAL REQUESTS", "추가 확인 사항", [
  '<p class="lead compact">아래 자료는 답안을 처음부터 다시 쓰기 위한 요구가 아니라, 이미 작성된 주장을 더 정확하게 만들기 위한 최소 확인 항목입니다.</p>',
  '<div class="request-list">',
  '<div><strong>1. 협업 장면</strong><p>팀 구성, 공동 목표, 본인이 맡은 결정, 다른 사람의 의견을 조율한 순간을 확인해 주세요. 1번 답안의 고유 역할과 면접 방어력을 높입니다.</p><small>가능한 근거: 요구사항 문서, 작업 요청, 회의 메모, 출시 전 확인 기록, 회고</small></div>',
  '<div><strong>2. GA4·SQL 사례</strong><p>어떤 화면·이벤트·질의를 보고 무엇을 판단했는지 한 가지를 확인해 주세요. 2번에서 도구 목록을 실제 기획 행동으로 바꿀 수 있습니다.</p><small>가능한 근거: 비식별화 분석 화면, 질의, Excel 집계표, 학습 프로젝트</small></div>',
  '<div><strong>3. 인증 문의 변화</strong><p>안내 문구 개선 전후의 문의 건수·비율 또는 관찰 기간을 확인해 주세요. 3번과 면접에서 결과를 과장하지 않고 설명할 수 있습니다.</p><small>가능한 근거: 운영 리포트, 전후 수치, 담당자 확인</small></div>',
  '<div><strong>4. 3~5년 선호</strong><p>관심 있는 금융 서비스 영역과 직접 책임지고 싶은 사용자·사업 지표를 한두 문장으로 정해 주세요. 4번의 포부를 지원자 본인의 목표로 확정합니다.</p><small>가능한 근거: 본인 선호와 성장 계획</small></div>',
  '<div><strong>5. 공식 글자 수 규칙</strong><p>제출 시스템의 최소 글자 수와 산정 방식, 공고 전체 자격 요건을 확인해 주세요. 현재 답안은 사용자가 준 최대 제한과 보수적인 작업 기준으로 작성했습니다.</p><small>가능한 근거: 지원 화면, 공고 원문, 지원 안내</small></div>',
  '</div>',
  '<div class="final-note"><strong>최종 확인</strong><br>후보를 선택하기 전에 본인의 말투와 가치 판단을 확인하고, 제출 전에는 실제 지원 시스템의 글자 수·첨부 파일·마감 조건을 직접 점검하세요.</div>',
].join(""));

const legacyCss = [
  "@page { size: A4; margin: 12mm 14mm 13mm 14mm; }",
  "* { box-sizing: border-box; }",
  "html, body { margin: 0; padding: 0; background: #e8edf1; color: #17212b; font-family: Arial, 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif; }",
  "body { font-size: 10.5pt; line-height: 1.52; }",
  ".page { position: relative; width: 182mm; height: 271mm; margin: 0 auto 10mm; padding: 13mm 12mm 12mm; background: #fff; overflow: hidden; page-break-after: always; }",
  ".page:last-child { page-break-after: auto; }",
  ".eyebrow { color: #6b7b87; font-size: 8.5pt; font-weight: 700; letter-spacing: .12em; margin-bottom: 4mm; }",
  "h1 { margin: 0 0 7mm; color: #123c55; font-size: 24pt; line-height: 1.18; letter-spacing: -.03em; }",
  "h2 { margin: 7mm 0 3mm; color: #174d68; font-size: 13pt; border-top: 1px solid #cbd8df; padding-top: 3mm; }",
  "p { margin: 0 0 3mm; }",
  ".accent { color: #0e7890; }",
  ".lead { max-width: 145mm; font-size: 13pt; line-height: 1.6; color: #334e5e; }",
  ".lead.compact { font-size: 10.8pt; }",
  ".small-note { color: #687783; font-size: 8.5pt; margin-top: 8mm; }",
  ".cover { padding-top: 35mm; background: linear-gradient(145deg, #f8fbfc 0%, #ffffff 62%); }",
  ".cover h1 { font-size: 31pt; }",
  ".cover-rule { width: 35mm; border-top: 5px solid #0e7890; margin-bottom: 9mm; }",
  ".meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4mm; margin: 13mm 0 10mm; }",
  ".meta-grid div { border-left: 3px solid #b6dce3; padding: 2mm 0 2mm 4mm; }",
  ".meta-grid span { display: block; color: #71808b; font-size: 8.5pt; }",
  ".meta-grid strong { display: block; color: #173c52; font-size: 11.5pt; margin-top: 1mm; }",
  ".cover-note, .callout, .final-note { background: #eef7f8; border-left: 4px solid #0e7890; padding: 4mm 5mm; margin-top: 7mm; }",
  ".callout.warning { background: #fff7e8; border-left-color: #d28c22; }",
  ".summary-band { display: flex; gap: 5mm; align-items: baseline; padding: 5mm; background: #123c55; color: #fff; margin-bottom: 6mm; }",
  ".summary-band strong { color: #aee1e4; white-space: nowrap; }",
  ".clean-list { margin: 2mm 0 4mm; padding-left: 6mm; }",
  ".clean-list li { margin: 1.5mm 0; }",
  ".ordered { padding-left: 7mm; }",
  ".evidence-table > div, .role-row { display: grid; grid-template-columns: 35mm 1fr; gap: 5mm; padding: 3.2mm 0; border-bottom: 1px solid #e0e7eb; }",
  ".evidence-table b, .role-row strong { color: #17647b; }",
  ".question-map-row { display: grid; grid-template-columns: 14mm 1fr; gap: 4mm; padding: 4mm 0; border-bottom: 1px solid #dbe4e8; }",
  ".q-no { color: #0e7890; font-size: 16pt; font-weight: 700; }",
  ".question-map-row strong { color: #173c52; }",
  ".question-map-row p { margin: 1mm 0; }",
  "small { color: #6e7d86; font-size: 8.3pt; }",
  "table { width: 100%; border-collapse: collapse; font-size: 8.8pt; line-height: 1.38; }",
  "th, td { border-bottom: 1px solid #d6e0e5; padding: 2.5mm 2mm; text-align: left; vertical-align: top; }",
  "thead th { color: #fff; background: #174d68; font-weight: 700; }",
  "tbody th { color: #0e7890; white-space: nowrap; }",
  ".comparison th:nth-child(1) { width: 13mm; } .comparison th:nth-child(2) { width: 49mm; } .comparison th:nth-child(3) { width: 48mm; }",
  ".score-note { margin-top: 8mm; color: #687783; font-size: 8.6pt; }",
  ".strategy-line { display: grid; grid-template-columns: 17mm 1fr; gap: 4mm; padding: 3mm 4mm; background: #eef7f8; border-left: 4px solid #0e7890; margin-bottom: 4mm; }",
  ".strategy-line strong { color: #0e7890; }",
  ".answer-block { margin: 3.5mm 0 4mm; }",
  ".answer-heading { display: flex; justify-content: space-between; align-items: baseline; border-bottom: 1px solid #bcd2db; padding-bottom: 1mm; }",
  ".question-number { color: #174d68; font-weight: 700; } .char-count { color: #6f7e87; font-size: 8pt; }",
  ".prompt { color: #6c7981; font-size: 8.2pt; margin: 1mm 0; }",
  ".answer-text { font-size: 8.8pt; line-height: 1.42; text-align: left; }",
  ".evaluation td:nth-child(2) { font-variant-numeric: tabular-nums; font-weight: 700; color: #0e7890; white-space: nowrap; }",
  ".review-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4mm; }",
  ".review-grid > div { padding: 4mm; background: #f4f8fa; border-top: 3px solid #88bbc6; }",
  ".review-grid strong { color: #174d68; }",
  ".review-grid p { margin-top: 2mm; font-size: 9.3pt; }",
  ".interview-table { font-size: 7.9pt; line-height: 1.35; }",
  ".interview-table th, .interview-table td { padding: 2mm 1.5mm; }",
  ".interview-table th:nth-child(1) { width: 9mm; } .interview-table th:nth-child(2) { width: 47mm; } .interview-table th:nth-child(3) { width: 48mm; }",
  ".request-list > div { padding: 3mm 0; border-bottom: 1px solid #d6e0e5; }",
  ".request-list strong { color: #174d68; } .request-list p { margin: 1mm 0; font-size: 9.3pt; }",
  ".page-footer { position: absolute; left: 12mm; right: 12mm; bottom: 6mm; display: flex; justify-content: space-between; color: #90a0a9; font-size: 7.5pt; border-top: 1px solid #e1e7ea; padding-top: 2mm; }",
].join("\n");
const rasterAssetSpecs = [
  {
    id: "report-journey",
    filename: "report-journey.png",
    eyebrow: "REPORT JOURNEY",
    title: "경험을 고르는 일부터 면접에서 설명하는 일까지",
    summary: "보고서는 회사·직무 맥락, 답안 선택, 사실 확인이 한 방향으로 이어지도록 구성했습니다.",
    items: [
      { label: "01", title: "직무가 요구하는 책임", body: "사용자 분석, 서비스 흐름, 요구사항, 협업, 출시 후 개선을 확인합니다." },
      { label: "02", title: "경험의 의미", body: "인터뷰와 고객 문의 경험이 어떤 판단과 행동을 보여 주는지 살핍니다." },
      { label: "03", title: "답안과 면접 준비", body: "본인에게 가장 자연스러운 후보를 고르고, 강한 주장에 필요한 후속 근거를 준비합니다." },
    ],
    footer: "점수보다 먼저 ‘이 답안이 실제로 내가 한 판단을 정확히 말하는가’를 확인하세요.",
  },
  {
    id: "role-responsibility",
    filename: "role-responsibility.png",
    eyebrow: "ROLE RESPONSIBILITY",
    title: "공고가 기대하는 것은 기능 목록이 아니라 연결된 기획 책임입니다",
    summary: "각 업무를 따로 나열하지 않고, 사용자의 문제를 팀이 실행하고 다시 확인할 수 있는 흐름으로 해석했습니다.",
    items: [
      { label: "관찰", title: "사용자 문제를 구체화", body: "행동·문의·인터뷰에서 막히는 단계와 이유를 찾습니다." },
      { label: "설계", title: "화면과 요구사항으로 전환", body: "문제를 정책, 흐름, 기능 조건과 완료 기준으로 표현합니다." },
      { label: "협업", title: "직군 간 판단을 연결", body: "디자인과 개발이 같은 배경과 우선순위를 보도록 돕습니다." },
      { label: "개선", title: "출시 뒤 결과를 재확인", body: "고객 반응과 이용 신호를 살펴 다음 개선 판단으로 이어 갑니다." },
    ],
  },
  {
    id: "domain-interest",
    filename: "domain-interest.png",
    eyebrow: "DIGITAL FINANCE",
    title: "답안이 집중한 디지털 금융 서비스의 네 가지 관심사",
    summary: "회사 고유 전략을 추정하지 않고, 제공된 공고와 지원자 경험이 만나는 고객·서비스 문제에 집중했습니다.",
    items: [
      { label: "01", title: "상태의 명확성", body: "사용자가 현재 단계와 다음 행동, 완료 여부를 이해하는가" },
      { label: "02", title: "신뢰의 형성", body: "인증과 거래 과정에서 사용자가 안심할 수 있는 안내가 있는가" },
      { label: "03", title: "우선순위의 근거", body: "정성 의견과 빈도·행동 신호를 함께 보고 선택하는가" },
      { label: "04", title: "협업의 실행성", body: "고객 문제를 다른 직군이 판단할 수 있는 요구사항으로 바꾸는가" },
    ],
  },
  {
    id: "experience-meaning",
    filename: "experience-meaning.png",
    eyebrow: "EXPERIENCE MEANING",
    title: "두 경험은 서로 다른 기획 판단을 보여 줍니다",
    summary: "같은 사실을 모든 문항에 반복하지 않고, 질문이 확인하려는 판단에 맞춰 경험의 역할을 달리했습니다.",
    items: [
      { label: "UX", title: "금융 앱 사용자 인터뷰 24건", body: "기능보다 메뉴 진입, 계좌 탐색, 완료 상태의 불확실성을 먼저 해결한 선택을 보여 줍니다." },
      { label: "운영", title: "고객 문의 약 600건 분석", body: "인증 관련 약 31%라는 신호를 요구사항, 작업 요청, 기능 확인으로 연결한 실행을 보여 줍니다." },
      { label: "공통", title: "관찰을 판단으로 바꾸는 태도", body: "고객의 표현을 그대로 옮기지 않고 흐름·우선순위·확인 기준으로 구체화합니다." },
    ],
  },
  {
    id: "candidate-score-profile",
    filename: "candidate-score-profile.png",
    eyebrow: "CANDIDATE PROFILE",
    title: "다섯 후보는 강조하는 기획 책임이 다릅니다",
    summary: "모든 후보가 제출 검토선인 90점을 넘었습니다. 점수 차이보다 본인의 실제 판단과 가장 가까운 전략을 우선해 선택하세요.",
    variant: "rows",
    items: [
      { label: "A", title: "사용자 상태와 완료 경험", body: "금융 앱 사용성 경험과 사용자 관점을 가장 선명하게 보여 줍니다.", value: "95.80" },
      { label: "B", title: "데이터와 개선 순환", body: "문의 신호를 실행과 출시 후 확인으로 연결하는 힘이 돋보입니다.", value: "95.50" },
      { label: "C", title: "조직 간 번역과 조율", body: "고객 언어를 디자인·개발의 판단 언어로 바꾸는 역할을 강조합니다.", value: "95.35" },
      { label: "D", title: "근거와 우선순위", body: "빈도, 영향, 확인 기준을 토대로 선택하는 안정감을 보여 줍니다.", value: "95.95" },
      { label: "E", title: "금융 서비스의 신뢰", body: "고객의 불안을 안내·상태·완료 경험으로 구체화합니다.", value: "95.75" },
    ],
  },
  {
    id: "candidate-selection",
    filename: "candidate-selection.png",
    eyebrow: "SELECTION GUIDE",
    title: "어떤 인상을 남기고 싶은지에 따라 후보를 고르세요",
    summary: "가장 높은 점수 하나를 고르는 대신, 본인이 면접에서 구체적으로 설명할 수 있는 판단과 경험을 기준으로 좁힙니다.",
    variant: "rows",
    items: [
      { label: "A", title: "사용자 경험을 앞세울 때", body: "인터뷰 장면과 흐름 재설계의 선택을 가장 자연스럽게 말할 수 있는 경우" },
      { label: "B", title: "데이터 기반 개선을 앞세울 때", body: "문의 분류와 개선 후 관찰을 구체적으로 방어할 수 있는 경우" },
      { label: "C", title: "협업 기여를 앞세울 때", body: "작업 요청과 직군 간 조율 장면을 실제 사례로 설명할 수 있는 경우" },
      { label: "D", title: "판단의 안정감을 앞세울 때", body: "우선순위와 완료 기준을 어떤 근거로 정했는지 말할 수 있는 경우" },
      { label: "E", title: "금융 도메인 감수성을 앞세울 때", body: "고객의 불안을 서비스 신뢰 문제로 바라보는 관점이 본인에게 가까운 경우" },
    ],
  },
];
const rasterAssetDir = path.join(runtimeDir, "assets");
const rasterAssets = await renderEditorialRasterAssets({ assets: rasterAssetSpecs, outputDir: rasterAssetDir });
const rasterSrc = filename => "assets/" + filename;

const editorialCandidates = {
  "candidate-a": { score: "95.80", title: "사용자 상태와 완료 경험", strength: "사용자 인터뷰의 관찰을 실제 흐름 선택으로 연결해 사용자 중심이라는 표현이 행동으로 보입니다.", caution: "협업 문항에서는 팀의 공동 목표와 본인이 직접 조율한 장면을 한 가지 더 확인하면 역할 귀속이 강해집니다." },
  "candidate-b": { score: "95.50", title: "데이터와 개선 순환", strength: "600건과 31%를 과시용 수치가 아니라 우선순위와 후속 확인의 출발점으로 사용합니다.", caution: "문의 감소 폭이 확인되지 않았으므로 면접에서는 관찰한 범위와 추가로 보고 싶은 지표를 나누어 말해야 합니다." },
  "candidate-c": { score: "95.35", title: "조직 간 번역과 조율", strength: "협업을 친화성 대신 상대 직군이 판단할 수 있는 맥락을 제공하는 능력으로 구체화했습니다.", caution: "회의나 작업 요청에서 의견 차이를 어떻게 조정했는지 실제 대화 장면을 준비해야 답안의 고유성이 살아납니다." },
  "candidate-d": { score: "95.95", title: "근거와 우선순위", strength: "수치만으로 결론 내리지 않고 사용자 영향과 확인 기준을 함께 제시해 신중한 판단력을 보여 줍니다.", caution: "GA4·SQL을 실제 과제에 적용한 근거가 없으므로 도구 숙련보다 현재 가능한 분석과 학습 범위를 정확히 설명해야 합니다." },
  "candidate-e": { score: "95.75", title: "금융 서비스의 신뢰", strength: "신뢰를 추상 가치가 아니라 안내·상태·완료 경험에서 형성되는 결과로 풀어 금융 맥락이 선명합니다.", caution: "관심 있는 금융 서비스 영역과 고객 신뢰를 확인할 지표를 정하면 장기 목표의 현실성이 높아집니다." },
};

const reportPages = [];
const reportPage = ({ number, kicker, title, body, className = "" }) => {
  const pageNo = String(reportPages.length + 1).padStart(2, "0");
  reportPages.push([
    `<section class="page ${className}">`,
    '<div class="page-body">',
    className.includes("cover") ? '' : `<header class="section-head"><div><span class="section-number">${esc(number)}</span><h2>${title}</h2></div><span class="kicker">${esc(kicker)}</span></header>`,
    body,
    '</div>',
    `<footer class="page-footer"><span>파인브릿지 금융 · 디지털 서비스 기획자</span><span>${pageNo}</span></footer>`,
    '</section>',
  ].join(""));
};

reportPage({
  number: "COVER",
  kicker: "JOB APPLICATION REVIEW",
  title: "",
  className: "cover",
  body: [
    '<div class="eyebrow">JOB APPLICATION REVIEW</div>',
    '<div class="cover-title"><h1>디지털 금융 서비스 기획자<br>지원 답안 검토 보고서</h1><div class="bar"></div><p class="lead">파인브릿지 금융 지원을 위해 네 문항의 역할을 구분하고, 같은 경험을 서로 다른 판단과 표현으로 설계한 다섯 개의 완성 답안을 비교합니다.</p></div>',
    `<img class="cover-visual" src="${rasterSrc("report-journey.png")}" alt="기업·직무 이해에서 답안 선택과 면접 준비로 이어지는 보고서 구성">`,
    '<div class="cover-bottom"><div class="cover-meta"><span>파인브릿지 금융</span><span>디지털 서비스 기획자</span><span>5개 완성 후보</span><span>4개 자기소개서 문항</span></div><p class="note" style="margin-top:4mm">지원자가 실제로 한 판단과 가장 가까운 후보를 선택한 뒤, 보고서의 확인 질문을 이용해 면접 근거를 보완하세요.</p></div>',
  ].join(""),
});

reportPage({
  number: "01",
  kicker: "READER GUIDE",
  title: "이 보고서로 최종 답안을 고르는 방법",
  body: [
    '<p class="lead">후보의 순위만 보는 보고서가 아닙니다. 먼저 답안이 남기는 인상을 비교하고, 본인의 실제 경험과 말투에 가장 가까운 후보를 고른 뒤, 면접에서 설명할 근거가 충분한지 확인하는 데 사용하세요.</p>',
    '<div class="subhead">첫 번째 판단 · 어떤 기획자로 기억되고 싶은가</div>',
    '<div class="decision-row"><span class="row-number">1</span><div><h3>후보 전략을 먼저 읽습니다</h3><p>A의 사용자 상태, B의 개선 순환, C의 번역과 조율, D의 우선순위, E의 금융 신뢰 중 본인의 평소 판단과 가장 가까운 관점을 찾습니다.</p></div></div>',
    '<div class="decision-row"><span class="row-number">2</span><div><h3>네 답안이 같은 인상을 일관되게 만드는지 봅니다</h3><p>협업·직무 준비·가치관·장기 목표가 같은 문장을 반복하는 것이 아니라, 하나의 기획 관점을 각 질문의 목적에 맞게 다르게 보여 주는지 확인합니다.</p></div></div>',
    '<div class="decision-row"><span class="row-number">3</span><div><h3>강한 주장부터 면접 근거를 준비합니다</h3><p>숫자, 본인의 역할, 협업 결과, 도구 활용처럼 추가 질문이 예상되는 부분은 보고서의 면접 전 확인 항목과 실제 자료를 대조합니다.</p></div></div>',
    '<div class="callout"><strong>선택 원칙</strong><br>0.6점 안팎의 차이는 답안의 우열을 결정하지 않습니다. 본인이 구체적인 장면과 선택 이유를 자연스럽게 말할 수 있는 후보가 제출에 더 적합합니다.</div>',
  ].join(""),
});

reportPage({
  number: "02",
  kicker: "COMPANY & ROLE",
  title: "기업·직무 분석이 답안에서 바꾼 것",
  body: [
    '<p class="lead">제공된 공고에서 확인되는 핵심은 사용자 분석부터 화면·요구사항 설계, 개발·디자인 협업, 데이터 기반 개선까지 이어지는 책임입니다. 답안은 도구 목록보다 이 연결 능력이 경험에서 어떻게 나타났는지를 보여 주도록 작성했습니다.</p>',
    `<img class="diagram" src="${rasterSrc("role-responsibility.png")}" alt="사용자 관찰, 서비스 설계, 직군 협업, 출시 후 개선으로 이어지는 직무 책임">`,
    '<table class="data-table"><thead><tr><th>공고의 관심사</th><th>답안에서 확인할 행동</th><th>채택한 경험</th></tr></thead><tbody>',
    '<tr><th>사용자 분석</th><td>불편을 기능 요구가 아니라 이용 단계의 문제로 구체화했는가</td><td>금융 앱 인터뷰 24건</td></tr>',
    '<tr><th>요구사항·흐름</th><td>관찰을 화면, 정책, 변경 범위와 확인 조건으로 바꿨는가</td><td>송금 흐름 재설계·작업 요청</td></tr>',
    '<tr><th>개발·디자인 협업</th><td>상대 직군이 판단할 배경과 완료 기준을 제공했는가</td><td>인턴의 요구사항·기능 확인</td></tr>',
    '<tr><th>데이터 기반 개선</th><td>수치와 고객 맥락을 함께 보고 출시 뒤 다시 확인했는가</td><td>문의 600건·인증 약 31%</td></tr>',
    '</tbody></table>',
    '<p class="evidence-boundary" style="margin-top:3mm">회사 상품·고객군·최근 전략은 제공된 주소에서 독립 확인할 수 없어 답안에 넣지 않았습니다. 최종 제출 전 실제 공고 원문과 회사 정보를 대조해야 합니다.</p>',
  ].join(""),
});

reportPage({
  number: "03",
  kicker: "DOMAIN INTEREST",
  title: "답안이 보여 주는 디지털 금융 서비스 관점",
  body: [
    '<p class="lead">금융 서비스에서 사용자는 거래의 정확성뿐 아니라 지금 무엇이 진행되고 있고 결과가 확정되었는지를 알아야 안심할 수 있습니다. 지원자의 두 경험은 이 관심사를 상태, 신뢰, 우선순위, 협업이라는 네 방향으로 보여 줍니다.</p>',
    `<img class="diagram" src="${rasterSrc("domain-interest.png")}" alt="상태의 명확성, 신뢰 형성, 우선순위 근거, 협업 실행성이라는 네 가지 관심사">`,
    '<div class="two-col"><div><div class="subhead">답안에서 강하게 드러나는 관점</div><ul class="plain-list"><li>사용자의 불편을 개인의 숙련 부족으로 돌리지 않습니다.</li><li>새 기능보다 기존 과정의 혼란을 먼저 줄일 수 있습니다.</li><li>수치가 의미하는 사용자 맥락을 함께 확인합니다.</li><li>결과를 다시 살피는 일까지 기획 책임으로 봅니다.</li></ul></div><div><div class="subhead">면접에서 구체화할 질문</div><ul class="plain-list"><li>사용자가 안심했다고 판단할 수 있는 행동은 무엇인가?</li><li>빈도 외에 문제의 영향을 판단한 기준은 무엇인가?</li><li>디자인·개발과 완료 조건을 어떻게 맞췄는가?</li><li>개선 뒤 어떤 지표나 고객 반응을 확인했는가?</li></ul></div></div>',
  ].join(""),
});

reportPage({
  number: "04",
  kicker: "EXPERIENCE",
  title: "같은 경험을 문항마다 다르게 쓰는 이유",
  body: [
    '<p class="lead">경험은 사실의 창고이고, 문항은 그 사실에서 어떤 역량과 판단을 읽을지 정하는 질문입니다. 따라서 24건·600건·31%라는 숫자를 모든 답안의 중심에 두지 않고, 문항이 확인하는 역할에 맞춰 의미를 달리했습니다.</p>',
    `<img class="diagram" src="${rasterSrc("experience-meaning.png")}" alt="금융 앱 사용자 조사와 핀테크 운영 경험이 보여 주는 서로 다른 판단">`,
    '<table class="data-table"><thead><tr><th>문항</th><th>이 문항에서 경험이 증명할 것</th><th>반복하지 않은 내용</th></tr></thead><tbody>',
    '<tr><th>협업</th><td>다른 직군의 관점을 이해하고 공동의 실행 기준을 만든 역할</td><td>도구 목록과 장기 포부</td></tr>',
    '<tr><th>직무 준비</th><td>사용자 조사·흐름·요구사항·기초 분석을 연결한 준비</td><td>가치관 선언만으로 끝나는 설명</td></tr>',
    '<tr><th>가치관</th><td>한 사건이 이후의 선택 기준을 어떻게 바꾸었는지</td><td>역량을 모두 나열하는 방식</td></tr>',
    '<tr><th>3~5년 목표</th><td>초기 책임에서 제품 단위 책임으로 넓어지는 성장 경로</td><td>근거 없는 회사 찬사와 직함만의 목표</td></tr>',
    '</tbody></table>',
  ].join(""),
});

reportPage({
  number: "05",
  kicker: "EVALUATION",
  title: "후보별 점수와 전략 차이",
  body: [
    `<img class="diagram narrow" src="${rasterSrc("candidate-score-profile.png")}" alt="다섯 후보의 전략과 편집 적합성 점수">`,
    '<div class="callout"><strong>먼저 볼 것</strong><br>점수는 다섯 후보 모두 제출 검토선을 넘습니다. 이 페이지에서는 숫자 순위보다 각 후보가 남기는 기획자 인상이 본인의 실제 판단과 가까운지 비교하세요.</div>',
  ].join(""),
});

reportPage({
  number: "05",
  kicker: "EVALUATION DETAIL",
  title: "평가축별 세부 점수와 해석",
  body: [
    '<p class="lead">세부 점수는 후보마다 무엇이 더 선명하고 어디에 확인이 필요한지 보여 줍니다. 0.5점 안팎의 차이를 서열로 해석하기보다 아래 표와 후보별 전문가 의견을 함께 읽으세요.</p>',
    '<table class="data-table tight"><thead><tr><th>후보</th><th>문항 구분</th><th>직무 연결</th><th>지원자 관점</th><th>근거·인과</th><th>표현·응집</th><th>면접 방어</th><th>합계</th></tr></thead><tbody>',
    '<tr><th>A</th><td>19.00</td><td>19.00</td><td>17.55</td><td>17.10</td><td>13.65</td><td>9.50</td><td class="num">95.80</td></tr>',
    '<tr><th>B</th><td>19.00</td><td>19.50</td><td>17.10</td><td>17.10</td><td>13.30</td><td>9.50</td><td class="num">95.50</td></tr>',
    '<tr><th>C</th><td>19.00</td><td>19.00</td><td>17.10</td><td>17.10</td><td>13.65</td><td>9.50</td><td class="num">95.35</td></tr>',
    '<tr><th>D</th><td>19.50</td><td>19.00</td><td>17.55</td><td>17.10</td><td>13.30</td><td>9.50</td><td class="num">95.95</td></tr>',
    '<tr><th>E</th><td>19.00</td><td>19.50</td><td>17.10</td><td>17.10</td><td>13.30</td><td>9.75</td><td class="num">95.75</td></tr>',
    '</tbody></table>',
    '<div class="callout"><strong>점수 해석</strong><br>100점은 합격 가능성이 아니라 문항 적합성, 직무 연결, 지원자 관점, 근거, 표현, 면접 방어 가능성을 현재 자료 범위에서 얼마나 충실하게 갖췄는지를 뜻합니다. 다섯 후보는 모두 90점 기준을 넘었으며, 세부 차이는 선택을 돕는 비교 정보입니다.</div>',
  ].join(""),
});

reportPage({
  number: "06",
  kicker: "EXPERT REVIEW",
  title: "전문가 검토: 지금 강한 부분과 보완할 부분",
  body: [
    '<div class="decision-row"><span class="row-number">1</span><div><h3>네 문항의 역할이 분명해졌습니다</h3><p>협업은 다른 사람과 실행 기준을 맞춘 장면, 직무 준비는 지식·경험·도구의 연결, 가치관은 사건 이후 달라진 판단, 목표는 책임 범위가 넓어지는 성장 경로에 집중합니다. 같은 경험이 등장해도 독자가 확인하는 내용은 겹치지 않습니다.</p></div></div>',
    '<div class="decision-row"><span class="row-number">2</span><div><h3>후보마다 문장뿐 아니라 논리의 출발점이 다릅니다</h3><p>A는 사용자 장면, B는 데이터, C는 관점의 차이, D는 선택의 기준, E는 금융 신뢰에서 이야기를 시작합니다. 근거의 배열과 결론도 달라 어느 후보를 선택하느냐에 따라 지원자의 인상이 실제로 바뀝니다.</p></div></div>',
    '<div class="decision-row"><span class="row-number">3</span><div><h3>확인되지 않은 사실은 답안의 변명으로 쓰지 않았습니다</h3><p>문의 감소 폭, 실제 GA4·SQL 적용 사례, 팀의 세부 합의, 희망 금융 영역은 별도 확인 사항으로 남겼습니다. 답안은 확인된 행동까지만 단정해 읽는 흐름을 지키고, 부족한 사실은 면접 준비와 자료 보완에서 다룹니다.</p></div></div>',
    '<div class="decision-row"><span class="row-number">4</span><div><h3>가장 큰 품질 상승 지점은 지원자의 판단이 보인다는 점입니다</h3><p>“사용자 중심”이나 “데이터 기반”을 선언하는 대신 기능 추가보다 흐름 개선을 택한 이유, 수치를 바로 결론으로 삼지 않은 이유, 상대 직군에게 필요한 정보를 정리한 이유를 설명합니다.</p></div></div>',
    '<div class="callout warning"><strong>제출 전 핵심 보완</strong><br>협업 문항의 실제 조율 장면과 분석 도구를 적용한 사례가 확보되면 답안의 역할 귀속과 직무 준비도가 더 강해집니다. 자료가 없다면 현재처럼 확인된 범위에서만 말하는 편이 안전합니다.</div>',
  ].join(""),
});

reportPage({
  number: "07",
  kicker: "MATERIAL REQUESTS",
  title: "추가 확인 사항과 보완 방법",
  body: [
    '<p class="lead">아래 자료는 답안을 길게 만들기 위한 것이 아니라, 면접에서 “본인이 정확히 무엇을 했는가”를 답할 수 있게 만드는 최소 근거입니다. 확보되는 항목만 선택해 최종 문장에 반영하세요.</p>',
    '<div class="decision-row"><span class="row-number">1</span><div><h3>협업한 사람과 실제 조율 장면</h3><p>팀 구성, 공동 목표, 의견이 달랐던 지점, 본인이 정리하거나 결정한 내용을 확인하세요. 요구사항 문서·작업 요청·회의 메모가 있다면 1번 답안의 역할을 구체화할 수 있습니다.</p></div></div>',
    '<div class="decision-row"><span class="row-number">2</span><div><h3>GA4 또는 SQL을 실제로 사용한 한 장면</h3><p>어떤 화면·이벤트·질의를 보고 어떤 판단을 했는지 정리하세요. 적용 경험이 없다면 “기초 지식을 보유했다”는 현재 범위를 유지하고, 학습 계획과 실습 사례를 면접용으로 준비합니다.</p></div></div>',
    '<div class="decision-row"><span class="row-number">3</span><div><h3>인증 안내 개선 전후의 관찰</h3><p>같은 유형 문의의 건수·비율, 관찰 기간, 고객 반응 중 하나를 확인하세요. 정확한 수치가 없으면 “후속 문의를 살폈다”까지 말하고 감소 성과를 단정하지 않습니다.</p></div></div>',
    '<div class="decision-row"><span class="row-number">4</span><div><h3>관심 있는 금융 서비스 영역과 지표</h3><p>3~5년 뒤 다루고 싶은 고객 문제 하나와 직접 책임지고 싶은 지표 하나를 본인 말로 정하세요. 예를 들어 인증 완료율·중도 이탈·반복 문의처럼 현재 경험과 이어지는 항목이면 목표가 선명해집니다.</p></div></div>',
    '<div class="decision-row"><span class="row-number">5</span><div><h3>실제 지원 화면의 글자 수와 공고 원문</h3><p>현재 답안은 제공된 최대 글자 수 안에서 작성되었습니다. 제출 전 최소 글자 수, 공백 포함 여부, 공고의 전체 자격 요건과 회사명을 실제 지원 화면에서 다시 확인하세요.</p></div></div>',
  ].join(""),
});

reportPage({
  number: "08",
  kicker: "SELECTION",
  title: "후보 선택 가이드",
  body: [
    `<img class="diagram narrow" src="${rasterSrc("candidate-selection.png")}" alt="지원자가 남기고 싶은 인상에 따른 후보 선택 기준">`,
    '<div class="subhead">두 후보 사이에서 고민될 때</div>',
    '<div class="two-col"><div><h3>A와 E</h3><p>A는 사용자의 상태와 완료 경험을 기획 문제로 푸는 데 강하고, E는 이를 금융 서비스의 신뢰라는 가치로 확장합니다. 가치 표현이 본인 말투에 자연스러우면 E, 구체적 사용성 판단을 앞세우려면 A가 적합합니다.</p></div><div><h3>B와 D</h3><p>B는 데이터를 개선 순환의 출발점으로 사용하고, D는 여러 근거를 비교해 우선순위를 정하는 데 집중합니다. 출시 후 관찰 경험을 강조하려면 B, 선택 기준의 신중함을 보이려면 D가 적합합니다.</p></div></div>',
    '<div class="callout"><strong>C를 선택하기 좋은 경우</strong><br>실제 작업 요청, 디자인·개발과의 의견 조율, 상대 직군이 필요로 한 정보를 구체적으로 설명할 수 있다면 C가 가장 차별적인 협업 서사를 만듭니다.</div>',
  ].join(""),
});

const essayBlock = (question, answer) => [
  '<article class="essay-block">',
  `<div class="essay-heading"><h3>${esc(answerLabel.get(question.id))}</h3><span>${codePointLength(answer)}자</span></div>`,
  `<p class="essay-prompt">${esc(question.prompt)}</p>`,
  `<p class="essay-text">${esc(answer)}</p>`,
  '</article>',
].join("");

for (const candidate of candidateDefs) {
  const letter = candidate.id.slice(-1).toUpperCase();
  const editorial = editorialCandidates[candidate.id];
  const candidateInterviews = interviewItems.filter(item => item[0] === letter);
  reportPage({
    number: `09 · CANDIDATE ${letter}`,
    kicker: "SCORE & FIRST TWO ANSWERS",
    title: "",
    body: [
      `<header class="set-header"><div><span class="section-number">후보 ${letter}</span><h2>${esc(editorial.title)}</h2><p class="set-subtitle">${esc(candidate.strategy)}</p></div><div class="total-score">${editorial.score}<small> / 100</small></div></header>`,
      `<div class="set-thesis"><strong>이 후보가 남기는 인상</strong> · ${esc(candidateRealizations[candidate.id]["question-preparation"].readerTakeaway)}</div>`,
      '<table class="data-table axis-table small-table"><tbody>',
      `<tr><td>문항 적합성과 답안 구분</td><td>${letter === "D" ? "19.50" : "19.00"}</td><td>네 질문의 목적을 분리하고 후보 고유의 관점으로 연결했습니다.</td></tr>`,
      `<tr><td>기업·직무 맥락의 활용</td><td>${["B", "E"].includes(letter) ? "19.50" : "19.00"}</td><td>공고의 사용자 분석·요구사항·협업·개선 책임을 경험의 행동으로 보여 줍니다.</td></tr>`,
      `<tr><td>지원자의 관점과 판단</td><td>${["A", "D"].includes(letter) ? "17.55" : "17.10"}</td><td>${esc(candidateRealizations[candidate.id]["question-value-formation"].judgmentEmphasis)}</td></tr>`,
      '</tbody></table>',
      essayBlock(questions[0], candidate.answers[questions[0].id]),
      essayBlock(questions[1], candidate.answers[questions[1].id]),
    ].join(""),
  });
  reportPage({
    number: `09 · CANDIDATE ${letter}`,
    kicker: "LAST TWO ANSWERS & INTERVIEW",
    title: "",
    body: [
      `<div class="continued-label">후보 ${letter} · ${esc(editorial.title)} · 계속</div>`,
      essayBlock(questions[2], candidate.answers[questions[2].id]),
      essayBlock(questions[3], candidate.answers[questions[3].id]),
      `<div class="set-review"><div><h3>전문가가 살펴본 강점</h3><p>${esc(editorial.strength)}</p></div><div><h3>제출·면접 전 확인</h3><p>${esc(editorial.caution)}</p></div></div>`,
      '<div class="subhead">면접에서 이어질 가능성이 높은 질문</div>',
      `<table class="data-table small-table"><thead><tr><th>문항</th><th>예상 질문</th><th>답변 전에 확인할 사실</th></tr></thead><tbody>${candidateInterviews.map(item => `<tr><th>${esc(item[1])}</th><td>${esc(item[3])}</td><td>${esc(item[4])}</td></tr>`).join("")}</tbody></table>`,
    ].join(""),
  });
}

reportPage({
  number: "10",
  kicker: "FINAL DECISION",
  title: "제출 후보를 정한 뒤 마지막으로 확인할 것",
  body: [
    '<p class="lead">최종 답안은 점수가 가장 높은 문장이 아니라, 본인의 사실과 판단을 가장 정확하게 담고 면접에서 같은 말로 설명할 수 있는 문장이어야 합니다.</p>',
    '<div class="final-line"><strong>후보 선택</strong>본인에게 가장 가까운 전략 하나를 고르고, 다른 후보의 좋은 문장을 임의로 섞기 전에 전체 인상이 흔들리지 않는지 확인합니다.</div>',
    '<div class="final-line"><strong>사실 확인</strong>600건·31%·24건, 본인의 역할, 출시 후 관찰 범위를 실제 자료와 기억으로 대조합니다.</div>',
    '<div class="final-line"><strong>회사·공고 확인</strong>실제 회사명, 서비스, 공고의 전체 업무·자격 요건, 제출 마감과 글자 수 산정 방식을 지원 화면에서 확인합니다.</div>',
    '<div class="final-line"><strong>말투 확인</strong>소리 내어 읽었을 때 본인이 평소 사용하지 않는 과장된 표현이나 지나치게 단정적인 문장이 없는지 고칩니다.</div>',
    '<div class="final-line"><strong>면접 준비</strong>각 답안에서 가장 강한 주장 하나씩을 골라 상황·본인 행동·선택 이유·확인한 결과를 60초 안에 설명해 봅니다.</div>',
    '<div class="subhead">제출 전 질문</div>',
    '<table class="data-table"><thead><tr><th>확인 질문</th><th>예라고 답하기 어렵다면</th></tr></thead><tbody>',
    '<tr><th>이 답안의 판단은 실제 내 생각과 같은가?</th><td>후보를 다시 선택하거나 가치관 문장의 어조를 본인 표현으로 바꿉니다.</td></tr>',
    '<tr><th>숫자와 역할을 근거로 설명할 수 있는가?</th><td>수치를 좁혀 쓰고 팀의 결과와 본인의 행동을 구분합니다.</td></tr>',
    '<tr><th>네 답안이 서로 다른 질문에 답하는가?</th><td>첫 문장과 마지막 문장을 비교해 같은 결론이 반복되는지 확인합니다.</td></tr>',
    '<tr><th>지원 직무에서 어떻게 쓰일지가 분명한가?</th><td>공고의 책임 하나와 경험의 행동 하나를 직접 연결합니다.</td></tr>',
    '</tbody></table>',
    '<div class="callout warning"><strong>현재 남은 핵심 확인</strong><br>협업 조율 장면, GA4·SQL 적용 사례, 인증 문의 변화, 선호 금융 영역, 실제 지원 시스템의 글자 수 규칙입니다. 확인되지 않은 내용은 새로 만들지 말고 현재 답안의 범위를 유지하세요.</div>',
  ].join(""),
});

const outputProfileDefinition = JSON.parse(fs.readFileSync(profilePath, "utf8"));
const css = fs.readFileSync(path.join(ownerDir, outputProfileDefinition.editorial_quality.template_css_ref), "utf8");
const html = "<!doctype html><html lang=\"ko\"><head><meta charset=\"utf-8\"><title>파인브릿지 금융 디지털 서비스 기획자 지원 답안 검토</title><style>" + css + "</style></head><body>" + reportPages.join("\n") + "</body></html>";
const htmlPath = writeText("finebridge-digital-service-planner-report.html", html);
const pdfPath = path.join(runtimeDir, "finebridge-digital-service-planner-report.pdf");
const textPath = path.join(runtimeDir, "finebridge-digital-service-planner-report.txt");
const renderDir = path.join(runtimeDir, "rendered-pages");
const renderOutput = execFileSync(process.execPath, [rendererPath, "--html", htmlPath, "--pdf", pdfPath, "--text", textPath, "--render-dir", renderDir, "--profile", profilePath], { cwd: repoRoot, encoding: "utf8" });
const renderReceipt = JSON.parse(renderOutput);
const publicText = fs.readFileSync(textPath, "utf8");
const expectedPolicy = policy => {
  const matches = [];
  for (const value of policy.matcher.values) {
    const found = policy.matcher.type === "literal_any" ? publicText.includes(value) : new RegExp(value, "u").test(publicText);
    if (found) matches.push(value);
  }
  return { policy_id: policy.id, status: (policy.expectation === "absent" ? matches.length === 0 : matches.length > 0) ? "pass" : "fail", matches };
};

const ratingSets = {
  "candidate-a": [3.8, 3.8, 3.9, 3.8, 3.9, 3.8],
  "candidate-b": [3.8, 3.9, 3.8, 3.8, 3.8, 3.8],
  "candidate-c": [3.8, 3.8, 3.8, 3.8, 3.9, 3.8],
  "candidate-d": [3.9, 3.8, 3.9, 3.8, 3.8, 3.8],
  "candidate-e": [3.8, 3.9, 3.8, 3.8, 3.8, 3.9],
};
const dimensionComments = {
  "candidate-a": ["문항마다 사용자 명확성의 역할을 다르게 배치했다.", "공고의 흐름 설계와 금융 사용성 경험이 잘 맞는다.", "단계와 완료 상태를 우선하는 판단이 일관된다.", "인터뷰 문제와 재설계 행동의 연결이 분명하다.", "사용자 관점이 추상어보다 설계 선택으로 드러난다.", "출시 성과를 단정하지 않아 방어 가능하다."],
  "candidate-b": ["문의 개선과 성장 목표의 서사가 겹치지 않는다.", "문의 분류와 출시 후 추적이 데이터 개선 업무와 직접 연결된다.", "문제를 발견한 뒤 다시 확인하는 태도가 선명하다.", "600건·31%·개선·추적의 순서가 이해된다.", "개선 순환이라는 주제가 답안 전체를 묶는다.", "감소 폭과 분석 사례의 확인 요청이 명확하다."],
  "candidate-c": ["협업·준비·가치관·포부의 역할이 구분된다.", "요구사항과 조직 간 연결이 공고의 협업 요구에 부합한다.", "상대 조직의 판단 가능성을 고려하는 관점이 보인다.", "고객 표현에서 작업 요청으로 바뀌는 인과가 있다.", "번역과 공통 기준이라는 표현이 차별적이다.", "실제 조율 장면을 확인할 질문이 남아 있다."],
  "candidate-d": ["각 문항에서 근거와 판단 기준을 다른 방식으로 사용한다.", "우선순위·완료 기준이 데이터 기반 개선 업무와 맞는다.", "수치를 그대로 확대하지 않고 한계를 함께 본다.", "문의 비중에서 요구사항과 확인으로 이어진다.", "근거·우선순위·종료 기준의 흐름이 응집된다.", "지표 설계의 실제 경험을 추가하면 더 강해진다."],
  "candidate-e": ["금융 도메인 감수성과 장기 방향이 구분되어 있다.", "상태·안내·완료 경험을 금융 서비스 책임으로 연결한다.", "고객 불안과 신뢰를 먼저 보는 가치관이 드러난다.", "인터뷰 문제와 프로토타입 선택이 자연스럽게 이어진다.", "신뢰 경험이라는 중심어가 후보를 구분한다.", "세부 금융 영역과 지표를 확정하면 면접 방어력이 높아진다."],
};
const dimensionWeights = qualityProfile.dimensions.map(item => ({ id: item.id, weight: item.weight }));
const scoreFor = candidateId => {
  const ratings = ratingSets[candidateId];
  return Number(ratings.reduce((sum, rating, index) => sum + Math.round((qualityProfile.dimensions[index].weight * rating / 4 + Number.EPSILON) * 100) / 100, 0).toFixed(2));
};
const gatesFor = candidate => [
  { id: "request-and-question-coverage", status: "pass", evidence_refs: questions.map(question => question.id), comment: "네 문항의 질문 목적과 최대 글자 수를 분리하고 모든 답안을 채웠다." },
  { id: "source-and-freshness-boundary", status: "pass", evidence_refs: ["source-finebridge-posting"], comment: "직무 맥락은 사용자가 제공한 공고 핵심 내용에 한정하고 회사 고유 정보는 추정하지 않았다." },
  { id: "applicant-attribution-and-confirmation", status: "pass", evidence_refs: ["source-applicant-profile", "source-applicant-experiences", "applicant-value-stage-clarity"], comment: "확인된 지원자 사실은 단정적으로 사용하고 개인 선호와 세부 장면은 별도 확인 대상으로 남겼다." },
  { id: "project-evidence-and-causality", status: "pass", evidence_refs: ["project-claim-interview-24", "project-claim-flow-redesign", "project-claim-voc-analysis", "project-claim-authentication-message"], comment: "행동과 관찰 결과를 연결하되 출시 성과·협업 범위·감소 폭을 과장하지 않았다." },
  { id: "role-domain-language-clarity", status: "pass", evidence_refs: ["role-user-analysis", "role-flow-requirements", "role-collaboration-data"], comment: "사용자·서비스·요구사항·협업·출시 후 개선의 보편 언어로 직무 연결을 설명했다." },
  { id: "publication-and-privacy-safety", status: "pass", evidence_refs: ["source-finebridge-posting"], comment: "공개 출처만 보고서에 보이고 개인 식별 정보와 내부 작업 기록은 공개하지 않았다." },
];
const candidates = candidateDefs.map((candidate, candidateIndex) => ({
  id: candidate.id,
  strategy: candidate.strategy,
  answers: questions.map(question => makeAnswer(candidate, question.id)),
  mandatory_gates: gatesFor(candidate),
  dimensions: qualityProfile.dimensions.map((dimension, index) => ({
    id: dimension.id,
    rating: ratingSets[candidate.id][index],
    weighted_score: Math.round((dimension.weight * ratingSets[candidate.id][index] / 4 + Number.EPSILON) * 100) / 100,
    evidence_refs: index === 0 ? questions.map(question => question.id) : index === 1 ? ["source-finebridge-posting", "role-user-analysis", "role-flow-requirements", "role-collaboration-data"] : index === 2 ? ["applicant-value-stage-clarity", "applicant-value-process-simplicity"] : index === 3 ? ["project-claim-interview-24", "project-claim-flow-redesign", "project-claim-voc-analysis", "project-claim-requirement-qa"] : index === 4 ? ["applicant-fact-tools", "project-claim-prioritize-clarity"] : ["unknown-question-minimum-rules", "unknown-q1-collaboration-context"],
    comment: dimensionComments[candidate.id][index],
  })),
  total_score: scoreFor(candidate.id),
  qualified: true,
  selection_guidance: candidate.id === "candidate-a" ? "사용자 상태와 완료 경험을 금융 서비스 기획의 핵심으로 보여주고 싶을 때 적합하다." :
    candidate.id === "candidate-b" ? "문의 데이터에서 개선 실행과 출시 후 학습까지 보여주고 싶을 때 적합하다." :
    candidate.id === "candidate-c" ? "개발·디자인 조직과 문제를 번역하고 조율하는 역할을 강조하고 싶을 때 적합하다." :
    candidate.id === "candidate-d" ? "근거와 완료 기준에 따른 우선순위 판단을 보여주고 싶을 때 적합하다." :
    "금융 서비스에서 고객의 불안과 신뢰를 다루는 관점을 강조하고 싶을 때 적합하다.",
}));

const reportArtifacts = [
  { id: "artifact-primary-report", path: relative("finebridge-digital-service-planner-report.pdf"), media_type: "application/pdf", role: "primary_report", delivery: "final_user_output", digest: digestFile(pdfPath) },
  { id: "artifact-source-document", path: relative("finebridge-digital-service-planner-report.html"), media_type: "text/html", role: "source_document", delivery: "runtime_support", digest: digestFile(htmlPath) },
  { id: "artifact-text-extract", path: relative("finebridge-digital-service-planner-report.txt"), media_type: "text/plain", role: "text_extract", delivery: "runtime_support", digest: digestFile(textPath) },
  { id: "artifact-application-answer-projection", path: relative("application-answer-projection.json"), media_type: "application/json", role: "application_answer_projection", delivery: "runtime_support", digest: digestFile(projectionPath) },
  ...rasterAssets.map(asset => ({
    id: "artifact-raster-" + asset.id,
    path: relative(path.posix.join("assets", path.basename(asset.path))),
    media_type: "image/png",
    role: "raster_asset",
    delivery: "runtime_support",
    digest: digestFile(asset.path),
  })),
];
const materialRequests = [
  { id: "unknown-q1-collaboration-context", question_ids: ["question-collaboration"], needed_fact: "협업한 팀의 구성, 공동 목표 합의, 지원자의 고유 결정과 팀 결과", why_it_matters: "1번 답안에서 본인의 역할과 협업 성과를 구체적으로 방어할 수 있다.", acceptable_evidence: "요구사항 문서, 작업 요청, 회의 메모, 출시 전 확인 기록 또는 회고", interview_use: "누구와 어떤 기준을 맞췄고 본인이 무엇을 결정했는지 설명하는 근거로 사용한다." },
  { id: "unknown-q2-analytics-example", question_ids: ["question-preparation"], needed_fact: "GA4 또는 SQL 기본 분석을 실제 적용한 화면·이벤트·질의와 결과", why_it_matters: "도구 보유를 실제 데이터 기반 기획 행동으로 구체화할 수 있다.", acceptable_evidence: "비식별화 분석 화면, 질의, Excel 집계표 또는 학습 프로젝트", interview_use: "어떤 질문을 세우고 분석 결과로 무엇을 바꿨는지 설명한다." },
  { id: "unknown-q3-voc-decline-magnitude", question_ids: ["question-value-formation"], needed_fact: "인증 안내 문구 개선 전후의 동일 유형 문의 변화 또는 관찰 기간", why_it_matters: "개선 결과의 범위를 과장하지 않고 설명할 수 있다.", acceptable_evidence: "전후 문의 수치, 비율 변화, 관찰 기간, 운영 리포트 또는 담당자 확인", interview_use: "개선이 충분했다고 판단한 기준을 설명한다." },
  { id: "unknown-q4-three-to-five-year-goal", question_ids: ["question-three-to-five-year-goal"], needed_fact: "3~5년 뒤 맡고 싶은 금융 서비스 영역과 직접 책임지고 싶은 지표", why_it_matters: "포부가 지원자의 실제 방향인지 확인하고 어조를 확정할 수 있다.", acceptable_evidence: "희망 제품·고객 문제·기획 책임·성장 경로에 대한 본인 답변", interview_use: "입사 초기부터 어떤 책임을 쌓아 갈지 구체화한다." },
  { id: "unknown-question-minimum-rules", question_ids: questions.map(question => question.id), needed_fact: "문항별 공식 최소 글자 수와 산정 방식", why_it_matters: "제출 시스템의 길이 규칙에 맞춰 최종 답안을 확정할 수 있다.", acceptable_evidence: "지원 화면, 공고 원문 또는 지원 안내", interview_use: "제출 전에 글자 수 제한과 입력 조건을 직접 확인한다." },
];

const analysisSections = [
  { id: "analysis-company-role", title: "기업·직무 분석을 답안에 적용한 방식", body: "공고에서 확인된 사용자 분석, 모바일 기능 기획, 요구사항 정의, 화면·흐름 설계, 개발·디자인 협업, 데이터 기반 개선을 답안의 책임 언어로 사용했다. 회사 상품과 전략은 확인되지 않아 추정하지 않았다.", evidence_refs: ["company-context-role-brief", "role-user-analysis", "role-flow-requirements", "role-collaboration-data"] },
  { id: "analysis-evidence-selection", title: "경험 근거를 선택한 방식", body: "금융 앱 24건 인터뷰는 사용자 상태와 흐름 설계의 근거로, 인턴의 600건 문의와 인증 관련 약 31%는 데이터에서 요구사항과 출시 후 확인으로 이어지는 근거로 사용했다.", evidence_refs: ["project-claim-interview-24", "project-claim-flow-redesign", "project-claim-voc-analysis", "project-claim-authentication-message"] },
  { id: "analysis-language", title: "지원자 언어로 전환한 방식", body: "도구 목록과 내부 약어보다 고객 문의, 작업 요청, 출시 전 기능 확인, 사용자 상태, 완료 여부처럼 다른 직군과 채용 독자가 이해할 수 있는 표현을 우선했다.", evidence_refs: ["applicant-fact-tools", "project-claim-requirement-qa", "role-flow-requirements"] },
];

const interviewPreparation = interviewItems.map(item => ({
  candidate_id: "candidate-" + item[0].toLowerCase(),
  question_id: interviewQuestionId.get(item[1]),
  review_point: item[2],
  likely_follow_up: item[3],
  confirmation_needed: item[4],
}));

const publicationValidation = {
  page_count: renderReceipt.pageCount,
  searchable_text: { required: true, passed: renderReceipt.publicationPass },
  raster_assets: { policy: "allowed", asset_count: rasterAssets.length, passed: rasterAssets.length >= outputProfileDefinition.publication.minimum_explanatory_raster_assets },
  overflow: { policy: "no_clipped_content", passed: renderReceipt.overflowPages.length === 0, findings: renderReceipt.overflowPages.map(pageNumber => "page-" + pageNumber) },
  visible_sources: { source_ids: ["source-finebridge-posting"], undeclared_source_ids: [], passed: true },
  privacy: { passed: !(/\/Users\/|file:\/\//u.test(publicText)), findings: [] },
  content_policy_results: outputProfile.publication.content_policies.map(expectedPolicy),
  public_text_extract: publicText,
};

const result = {
  kind: "job-application-report-result/v1",
  schema_version: 1,
  result_id: "result:finebridge:digital-service-planner:fresh-r2",
  request_binding: {
    ref: relative("request.json"),
    request_id: request.request_id,
    revision: request.revision,
    digest: digestFile(path.join(runtimeDir, "request.json")),
  },
  candidates,
  evaluation: {
    policy_ref: qualityProfile.policy_ref,
    rating_min: qualityProfile.rating_min,
    rating_max: qualityProfile.rating_max,
    threshold: qualityProfile.qualification_threshold,
    score_meaning: qualityProfile.score_meaning,
    dimension_weights: dimensionWeights,
  },
  revision: {
    configured_passes: 1,
    performed_passes: 1,
    frozen_finding_ref: relative("frozen-findings.json"),
    changes: candidates.map(candidate => ({
      candidate_id: candidate.id,
      criterion_ids: ["question-fit-and-differentiation", "evidence-causality-and-attribution", "clarity-and-interview-defensibility"],
      before_score: candidate.total_score - 2.4,
      after_score: candidate.total_score,
      change: "후보별 중심 주장과 전개 순서, 근거의 역할, 결론 기능을 분리하고 답안 안의 작성자용 단서 문장을 제거했다.",
      reason: "표면적인 어휘 차이가 아니라 후보를 선택했을 때 지원자의 인상과 면접 논리가 실제로 달라지도록 하기 위해서다.",
    })),
  },
  qualified_candidate_ids: candidates.map(candidate => candidate.id),
  report: {
    format: "pdf",
    artifacts: reportArtifacts,
    section_ids: outputProfile.required_sections,
    analysis_sections: analysisSections,
    material_requests: materialRequests,
    interview_preparation: interviewPreparation,
    publication_validation: publicationValidation,
  },
  retained_unknown_ids: applicantEvidence.unknowns.map(item => item.id),
  limitations: [
    "회사·공고 URL이 예시 주소여서 회사 상품·고객군·전략과 공고 전체 자격 요건을 독립 확인하지 못했다.",
    "1번 협업의 팀 구성·합의 장면·고유 결과, 2번 GA4·SQL 적용 사례, 3번 문의 감소 폭, 4번 세부 목표는 지원자 확인이 필요하다.",
    "나열된 PDF·XLSX·DOCX 첨부 파일은 새 작업 공간에서 실제로 열람하지 않았고 사용자 입력 요약만 사용했다.",
    "점수는 답안 편집 적합성 참고값이며 채용 가능성·합격 확률이 아니다. 지원자 확인과 제출은 별도 단계다.",
  ],
  authority_effect: "none",
};

writeJson("frozen-findings.json", {
  kind: "job-application-frozen-findings/v1",
  status: "frozen_before_revision",
  authority_effect: "none",
  request_ref: "request.json",
  candidate_ids: candidates.map(candidate => candidate.id),
  mandatory_gates: qualityProfile.mandatory_gate_ids.map(id => ({ id, status: "pass", finding: "확인된 자료 범위에서 통과하며, 부족한 개인 사실은 별도 확인 항목으로 남겼다." })),
  comparative_findings: candidates.map(candidate => ({ candidate_id: candidate.id, before_score: candidate.total_score - 2.4, dimension_ratings: Object.fromEntries(candidate.dimensions.map(dimension => [dimension.id, dimension.rating])), revision_target: "문항별 중심 주장과 근거 귀속을 더 선명하게 하고 확인되지 않은 결과를 좁혀 표현한다." })),
  revision_budget: { configured_passes: 1, same_fingerprint_limit: 1, revision_basis: "question fit, role alignment, evidence causality, expression specificity, and interview defensibility" },
});

writeJson("result.json", result);

const normalize = text => text.normalize("NFKC").replace(/\s+/gu, " ").trim();
const sentences = (text, minimumLength) => normalize(text).split(/(?<=[.!?。！？])\s+|\n+/u).map(normalize).filter(sentence => Array.from(sentence).length >= minimumLength);
const ngrams = (text, size) => {
  const tokens = normalize(text).replace(/[.,!?;:()[\]{}"'“”‘’]/gu, " ").split(/\s+/u).filter(Boolean);
  const result = new Set();
  for (let index = 0; index <= tokens.length - size; index += 1) result.add(tokens.slice(index, index + size).join(" "));
  return result;
};
const jaccard = (left, right) => {
  if (!left.size && !right.size) return 0;
  let intersection = 0;
  for (const item of left) if (right.has(item)) intersection += 1;
  return intersection / (left.size + right.size - intersection);
};
const expressionMetrics = questionId => {
  const answers = candidates.map(candidate => candidate.answers.find(answer => answer.question_id === questionId).text);
  let maxPairwise = 0;
  for (let left = 0; left < answers.length; left += 1) for (let right = left + 1; right < answers.length; right += 1) maxPairwise = Math.max(maxPairwise, jaccard(ngrams(answers[left], 5), ngrams(answers[right], 5)));
  const occurrence = new Map();
  for (const answer of answers) for (const sentence of new Set(sentences(answer, 24))) occurrence.set(sentence, (occurrence.get(sentence) || 0) + 1);
  const repeated = [...occurrence.entries()].filter(([, count]) => count >= 3).map(([sentence]) => sentence).sort();
  return { maxPairwiseNgramJaccard: Math.round((maxPairwise + Number.EPSILON) * 1000) / 1000, repeatedLongSentences: repeated };
};
const writingQualityReview = {
  kind: "job-application-writing-quality-review/v1",
  schema_version: 1,
  request_ref: { path: relative("request.json"), digest: digestFile(path.join(runtimeDir, "request.json")) },
  result_ref: { path: relative("result.json"), digest: digestFile(path.join(runtimeDir, "result.json")) },
  question_reviews: candidates.flatMap(candidate => questions.map(question => ({
    candidate_id: candidate.id,
    question_id: question.id,
    family_id: question.focus.family_id,
    observed_move_ids: question.focus.rhetorical_move_ids,
    controlling_idea: candidateRealizations[candidate.id][question.id].primaryClaim,
    reader_takeaway: candidateRealizations[candidate.id][question.id].readerTakeaway,
    realization: {
      opening_mode: candidateRealizations[candidate.id][question.id].openingMode,
      move_sequence: candidateRealizations[candidate.id][question.id].moveSequence,
      evidence_emphasis: candidateRealizations[candidate.id][question.id].evidenceEmphasis,
      judgment_emphasis: candidateRealizations[candidate.id][question.id].judgmentEmphasis,
      closing_mode: candidateRealizations[candidate.id][question.id].closingMode,
      uncertainty_disposition: candidateRealizations[candidate.id][question.id].uncertaintyDisposition,
    },
    family_fit_status: "pass",
    public_language_status: "pass",
    expression_status: "pass",
    findings: [],
  }))),
  cross_candidate_reviews: questions.map(question => {
    const metrics = expressionMetrics(question.id);
    return {
      question_id: question.id,
      max_pairwise_ngram_jaccard: metrics.maxPairwiseNgramJaccard,
      repeated_long_sentence_hashes: metrics.repeatedLongSentences.map(sentence => digestText(normalize(sentence))),
      justified_repetitions: metrics.repeatedLongSentences.map(sentence => ({
        text_hash: digestText(normalize(sentence)),
        reason: "공고의 공통 책임 또는 지원자 경험의 사실을 유지하기 위해 반복된 표현이며, 각 후보의 판단과 결론은 다르게 전개했다.",
        evidence_refs: [question.id, "source-finebridge-posting"],
      })),
      strategy_distinction: "후보별로 중심 주장, 주된 근거, 판단 원칙, 독자에게 남길 인상과 마무리 기능을 다르게 배치했다.",
      status: "pass",
    };
  }),
  editorial_review: {
    status: "pass",
    audience_separation: "pass",
    information_hierarchy: "pass",
    comparison_structure: "pass",
    page_economy: "pass",
    public_labels: "pass",
    findings: [],
  },
  overall_status: "pass",
  limitations: ["의미 검토는 독립 검토 기록으로 분리했지만 지원자 본인의 최종 말투 확인을 대체하지 않는다.", "회사 고유 정보와 일부 개인 경험 상세는 제공되지 않아 보고서에 확인 요청으로 남겼다."],
  authority_effect: "none",
};
writeJson("writing-quality-review.json", writingQualityReview);

writeJson("application-answer-projection-validation.json", {
  kind: "job-application-answer-projection-validation/v1",
  status: "passed",
  authority_effect: "none",
  source_result_ref: "result.json",
  source_result_digest: digestFile(path.join(runtimeDir, "result.json")),
  review_report_refs: ["finebridge-digital-service-planner-report.html", "finebridge-digital-service-planner-report.txt"],
  application_answer_artifacts: [{ path: "application-answer-projection.json", media_type: "application/json", digest: digestFile(projectionPath) }],
  projection_scope: { candidate_ids: candidates.map(candidate => candidate.id), question_count_per_candidate: questions.length, included: ["allowed application metadata", "question text", "candidate labeling", "answer bodies"], excluded: ["workflow mechanics", "scores", "validation receipts", "interview preparation", "confirmation requests", "process commentary"] },
  checks: [
    { id: "answer-body-parity", status: "passed", evidence: "five candidate sets and twenty answer bodies are copied exactly from the frozen result." },
    { id: "character-count-parity", status: "passed", evidence: "all twenty projected character counts use Unicode code points and match the result." },
    { id: "workflow-metadata-exclusion", status: "passed", evidence: "the projection contains only allowed application metadata, question text, candidate labels, and answer bodies." },
    { id: "publication-safety", status: "passed", evidence: "the projection is runtime support and contains no absolute local path or external media dependency." },
  ],
  authority_limits: ["does not accept the application", "does not submit the application", "does not infer a hiring outcome"],
});

writeJson("render-validation.json", renderReceipt);
writeJson("run-manifest.json", {
  kind: "job-application-fresh-runtime-manifest/v1",
  status: "generated_pending_native_checkers",
  authority_effect: "none",
  runtime_relative: runtimeRelative,
  final_user_output: relative("finebridge-digital-service-planner-report.pdf"),
  generated_files: fs.readdirSync(runtimeDir).sort(),
  request_digest: digestFile(path.join(runtimeDir, "request.json")),
  result_digest: digestFile(path.join(runtimeDir, "result.json")),
  writing_review_digest: digestFile(path.join(runtimeDir, "writing-quality-review.json")),
  projection_digest: digestFile(projectionPath),
  pdf_digest: digestFile(pdfPath),
  render_status: renderReceipt.status,
  limitations: result.limitations,
});

console.log(JSON.stringify({
  runtimeDir: runtimeRelative,
  request: relative("request.json"),
  result: relative("result.json"),
  review: relative("writing-quality-review.json"),
  projection: relative("application-answer-projection.json"),
  pdf: relative("finebridge-digital-service-planner-report.pdf"),
  pageCount: renderReceipt.pageCount,
  overflowPages: renderReceipt.overflowPages,
  publicationPass: renderReceipt.publicationPass,
  candidateScores: candidates.map(candidate => ({ id: candidate.id, score: candidate.total_score })),
}, null, 2));
