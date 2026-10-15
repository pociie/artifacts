import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '../../../..');
const out = here;

function digestBytes(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

function sortObject(value) {
  if (Array.isArray(value)) return value.map(sortObject);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map(key => [key, sortObject(value[key])]));
  }
  return value;
}

function canonicalDigest(value, omittedKey) {
  const copy = { ...value };
  delete copy[omittedKey];
  return crypto.createHash('sha256')
    .update(JSON.stringify(sortObject(copy)) + '\n')
    .digest('hex');
}

function writeJson(name, value) {
  fs.writeFileSync(path.join(out, name), JSON.stringify(value, null, 2) + '\n');
}

const inventoryPath = path.join(repo, 'artifacts/loop-architecture/registry/reusable-artifact-inventory.json');
const agencyPath = path.join(repo, 'artifacts/agents/requirement-realization/agents/artifact-builder.yaml');

const routeInput = {
  kind: 'six-mode-route-input/v1',
  requestRevision: 'coremotion-smart-factory-five-set-pdf.1',
  requestRelation: 'correct_prior_outcome',
  objective: '기존 단일 Markdown 자기소개서 결과를 5세트의 평가 포함 검색 가능한 PDF 보고서로 보완하고 재생성한다.',
  historyCoverage: 'same-session-prior-result-available',
  priorOutcome: {
    mode: 'loop',
    artifact: 'single-candidate-markdown',
    gap: 'requested-five-set-pdf-scope-was-not-bound'
  },
  structuralFacts: {
    contributionShape: 'one_owner',
    temporalShape: 'multi_phase',
    effect: 'local_write',
    outputShape: 'validated_candidate',
    boundedIteration: 1,
    stopCondition: 'profile-checker-and-publication-validation-pass'
  },
  executionSurface: 'local_coordinator_only',
  authorityEffect: 'none'
};
writeJson('route-input.json', routeInput);

const routeDecision = {
  kind: 'six-mode-route-decision/v1',
  requestRevision: 'coremotion-smart-factory-five-set-pdf.1',
  status: 'selected',
  selectedMode: 'loop',
  continuityDecision: {
    requestRelation: 'correct_prior_outcome',
    objectiveRelation: 'same-objective-with-output-contract-correction',
    historyCoverage: 'same-session-prior-result-available',
    sessionBoundary: 'same_session',
    priorPrimaryMode: 'loop',
    outerObligationState: 'active',
    priorCompletionEvidence: 'partial-single-markdown-only',
    projectionRef: 'projection:coremotion-smart-factory-five-set-pdf',
    executionSurface: 'local_coordinator_only',
    candidateMode: 'loop',
    effectivePrimaryMode: 'loop',
    segmentMode: null,
    disposition: 'select',
    outerObligationAction: 'continue',
    modeCompositionRequired: true
  },
  architectureSelection: {
    requirement: 'eligible',
    selectionStatus: 'native-loop-selected',
    targetScope: 'effective_primary',
    effectivePrimaryMode: 'loop',
    structuralSignals: [
      'bounded profile improvement and report generation',
      'one objective-owning builder',
      'one revision and publication validation'
    ],
    segmentMode: null,
    segmentRequirement: null,
    segmentSelectionStatus: null,
    workflowPatternOwnerRef: 'artifacts/loop-architecture/components/agentic-architecture/component.json',
    agentTopologyOwnerRef: 'artifacts/loop-architecture/components/agent-execution-topology-selection/component.json',
    coordinationOwnerRef: 'artifacts/loop-architecture/components/agent-architecture-coordination/component.json',
    patternSelectedByRouting: false
  },
  eligibleModes: ['loop'],
  rejectedModes: [
    { mode: 'communication', reasonCodes: ['local_write_required', 'multi_phase_output'] },
    { mode: 'investigation', reasonCodes: ['source_change_and_artifact_generation_required'] },
    { mode: 'single_task', reasonCodes: ['bounded_iteration_and_publication_validation'] },
    { mode: 'orchestration', reasonCodes: ['one_objective_owner', 'no_independent_fanout_required'] },
    { mode: 'session_control', reasonCodes: ['no_session_mutation_requested'] }
  ],
  blockers: [],
  missingFacts: ['company-specific facts', 'actual attachment contents'],
  conflictingFacts: [],
  reassessmentTriggers: [
    'company or role evidence changes',
    'output profile changes',
    'external submission or hiring authority is requested',
    'publication validation cannot inspect the produced PDF'
  ],
  authorityEffect: 'none'
};
writeJson('route-decision.json', routeDecision);

const subject = {
  subjectRef: 'agent-subject:coremotion-smart-factory-five-set-pdf-builder',
  agencyRef: 'artifacts/agents/requirement-realization/agents/artifact-builder.yaml',
  agencyDigest: 'sha256:' + digestBytes(agencyPath),
  responsibilityClass: 'builder',
  outcomeContract: '기존 자기소개서 보고서 아티팩트에 5세트 PDF 출력 프로파일과 검증 경로를 추가하고, 근거가 제한된 지원자 정보로 완전한 보고서를 생성한다.',
  outputContract: '프로파일·스키마·체크·테스트와 5세트 답변, 평가, 전문가 검토, 면접 준비, 자료 요청, PDF 렌더 검증 증거를 산출한다.',
  decisionScopes: ['문서 출력 프로파일 보완', '지원자 답변 세트 구성', '로컬 PDF 렌더링 및 검증'],
  nonAuthority: ['회사 사실 확정', '지원자 사실 발명', '채용 판단', '지원서 제출', '외부 시스템 변경']
};

const request = {
  kind: 'reusable-artifact-operation-request/v2',
  schemaVersion: 2,
  status: 'report_only',
  authorityEffect: 'none',
  acceptedAsEvidence: false,
  requestId: 'request:coremotion-smart-factory-five-set-pdf-artifact-upgrade',
  requestRevision: 'revision:2026-09-14.2',
  requestRelation: 'correct_prior_outcome',
  routeBinding: {
    decisionRef: 'route-decision.json',
    decisionDigest: 'sha256:' + digestBytes(path.join(out, 'route-decision.json')),
    effectiveMode: 'loop'
  },
  subject,
  objective: '코어모션 인더스트리 스마트팩토리 시스템 엔지니어 지원 보고서가 5개의 완전한 자기소개서 세트와 문항별 평가를 검색 가능한 PDF로 제공하도록 기존 재사용 아티팩트를 보완하고 실제 보고서를 생성한다.',
  successEvidenceRefs: [
    'profile-schema-and-checker',
    'profile-bound-five-set-request',
    'five-candidate-result-with-all-question-answers',
    'revision-and-criterion-evaluation',
    'pdf-html-text-artifacts',
    'render-and-publication-validation'
  ],
  protectedConstraintRefs: [
    'job-application-report-contract',
    'evidence-bound-writing',
    'no-invented-company-facts',
    'report-only-no-submission',
    'searchable-pdf-no-clipped-content'
  ],
  nonGoalRefs: [
    'external-application-submission',
    'company-fact-invention',
    'hiring-probability-or-acceptance',
    'unverified-attachment-interpretation',
    'unrelated-repository-reorganization'
  ],
  lifecycleIntent: 'improve_existing',
  capabilities: ['workspace_read', 'artifact_write', 'command_execute', 'validation_execute'],
  inventoryRef: 'artifacts/loop-architecture/registry/reusable-artifact-inventory.json',
  inventoryDigest: digestBytes(inventoryPath),
  allowedBaseClasses: ['loop'],
  allowedScopes: ['unresolved'],
  requiredFacts: ['owner', 'scope', 'consumer', 'validation'],
  exactArtifactIds: ['loop:document:job-application-report-production'],
  relationshipDepth: 1,
  maxCandidates: 1,
  contextBudget: {
    maxSourceMembers: 16,
    maxConsumerRefs: 8,
    maxValidationRefs: 12
  },
  scopeControl: {
    namedUnresolvedFacts: ['company-specific facts', 'actual attachment contents'],
    allowedRelationshipTypes: ['defines', 'validates', 'generates'],
    expansionRule: 'named_unresolved_fact_must_materially_change_routing_delivery_or_acceptance',
    adjacentFindingDisposition: 'report_only_follow_up',
    onBudgetExhaustion: 'narrow_and_continue'
  },
  changeControl: {
    materialChangeTriggers: ['objective', 'native_owner', 'artifact_revision', 'public_contract', 'effect', 'route_or_topology'],
    onMaterialChange: 'signal_and_return_to_structural_owner',
    silentWideningAllowed: false
  },
  completion: {
    terminalEvidenceRefs: ['profile-bound-five-set-request', 'five-candidate-result-with-all-question-answers', 'render-and-publication-validation'],
    validationRefs: ['profile-checker', 'request-result-checker', 'package-checker', 'pdf-publication-assessment'],
    stopWhenSatisfied: true,
    optionalImprovementDisposition: 'report_only_follow_up',
    decisionBasisRequired: true,
    evidenceAndLimitationsRequired: true
  },
  lifecycleBudgetRef: 'budget:one-owner-one-profile-upgrade-one-report-generation',
  dataClassification: 'confidential',
  effectIntent: 'local_write',
  externalSearchAllowed: false,
  constructionAllowed: true,
  residualGapProven: true
};
request.requestDigest = canonicalDigest(request, 'requestDigest');
writeJson('reusable-artifact-operation-request.v2.json', request);

writeJson('agent-operation-boundary.json', {
  kind: 'reusable-artifact-agent-operation-boundary/v1',
  revision: '2026-09-14.2',
  status: 'report_only',
  authorityEffect: 'none',
  subjectRef: subject.subjectRef,
  nativeOwnerRef: 'artifacts/agent-loop/document/job-application-report-production/loop.yaml',
  requestedOutcome: request.objective,
  successEvidence: request.successEvidenceRefs,
  nonGoals: request.nonGoalRefs,
  boundedDiscoverySurface: {
    runtimeInput: '기존 코어모션 지원자 요청·이전 1세트 결과·현재 자기소개서 보고서 패키지',
    nativeOwner: 'artifacts/agent-loop/document/job-application-report-production',
    maximumNewReusableUnit: 0,
    outputRoot: '.collab/artifacts/job-application-2026-10-coremotion-smart-factory-5set-pdf'
  },
  validation: request.completion.validationRefs,
  materialChangeSignals: request.changeControl.materialChangeTriggers,
  stopConditions: [
    '프로파일이 5세트 PDF 계약을 보장하지 않음',
    '답변 근거가 사용자 제공 사실을 벗어남',
    'PDF 페이지·텍스트 레이어·오버플로 검증 실패',
    '외부 제출 또는 채용 판단으로 범위가 확대됨'
  ]
});

console.log('wrote artifact operation records');
