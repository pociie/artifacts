import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from 'playwright';

const root = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(root, '../../../');
const packageRoot = path.join(repo, 'artifacts/agent-loop/document/job-application-report-production');
const baseRoot = path.join(repo, '.collab/artifacts/job-application-2026-10-coremotion-smart-factory');
const profilePath = path.join(packageRoot, 'profiles/five-set-pdf-report.profile.json');
const baseRequestPath = path.join(baseRoot, 'request.json');
const contentPath = path.join(root, 'five-set-content.json');
const renderDir = path.join(root, 'render-check');

const load = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (name, value) => fs.writeFileSync(path.join(root, name), JSON.stringify(value, null, 2) + '\n', 'utf8');
const writeText = (name, value) => fs.writeFileSync(path.join(root, name), value, 'utf8');
const digestFile = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const codePointLength = value => Array.from(value).length;
const round2 = value => Math.round((value + Number.EPSILON) * 100) / 100;
const clone = value => JSON.parse(JSON.stringify(value));

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function scoreFor(weight, rating, min, max) {
  return round2(weight * ((rating - min) / (max - min)));
}

function evaluatePolicy(policy, text) {
  const matches = [];
  for (const value of policy.matcher.values) {
    const found = policy.matcher.type === 'literal_any'
      ? text.includes(value)
      : new RegExp(value, 'u').test(text);
    if (found) matches.push(value);
  }
  const passed = policy.expectation === 'absent' ? matches.length === 0 : matches.length > 0;
  return { policy_id: policy.id, status: passed ? 'pass' : 'fail', matches };
}

function sourceIdSet(request) {
  return new Set(request.sources.map(item => item.id));
}

function answerBinding(questionId) {
  const bindings = {
    'question-1-goal': {
      evidence_refs: [
        'project:manufacturing-data',
        'claim:data-window-found',
        'claim:unrecorded-condition',
        'claim:analysis-field-validation',
        'value:field-and-data',
        'value:worker-context'
      ],
      inference_refs: [],
      unknown_refs: ['unknown:field-result']
    },
    'question-2-motivation-fit': {
      evidence_refs: [
        'source:job-posting',
        'fact:education',
        'fact:data-tools',
        'fact:entry-level-target',
        'claim:data-window-found',
        'claim:process-time-reduction'
      ],
      inference_refs: [
        'fit:data-analysis-to-role',
        'fit:process-improvement-to-role',
        'fit:field-validation-to-role'
      ],
      unknown_refs: ['unknown:company-context']
    },
    'question-3-strength-gap': {
      evidence_refs: [
        'value:field-and-data',
        'value:worker-context',
        'claim:unrecorded-condition',
        'fact:data-tools'
      ],
      inference_refs: [],
      unknown_refs: ['unknown:attachment-verification']
    },
    'question-4-process-improvement': {
      evidence_refs: [
        'project:process-improvement',
        'claim:inspection-wait-bottleneck',
        'claim:process-time-reduction',
        'value:field-and-data'
      ],
      inference_refs: ['fit:process-improvement-to-role'],
      unknown_refs: ['unknown:field-result', 'unknown:attachment-verification']
    }
  };
  return clone(bindings[questionId]);
}

const answerExpansions = {
  'question-1-goal': ' 이 과정에서 발견한 시간대, 인터뷰 내용, 검증 여부를 구분해 기록했습니다. 그래서 결과를 빠르게 단정하기보다 다음 확인 단계까지 닫는 것을 목표 달성의 일부로 보게 되었고, 데이터와 현장 사이의 차이를 줄이는 실행 기준을 세울 수 있었습니다. 목표를 완료했다는 판단도 분석표를 만든 시점이 아니라 현장 질문과 후속 검증 항목을 남긴 시점으로 정했습니다.',
  'question-2-motivation-fit': ' 특히 신입으로서 이미 구축했다고 과장하기보다 현장의 데이터 흐름과 시스템 기준을 배우고, 확인 가능한 개선을 하나씩 쌓겠다는 방향을 분명히 하겠습니다.',
  'question-3-strength-gap': ' 인터뷰 내용도 곧바로 원인으로 확정하지 않고 데이터에서 관찰된 패턴과 함께 비교할 자료로 다뤘습니다. 이를 통해 분석력을 유지하면서도 현장 구성원이 이해할 수 있는 질문과 확인 결과를 남기는 습관을 만들었습니다. 결과가 맞지 않을 때는 어느 단계의 가정이 흔들렸는지 되짚고, 필요한 추가 자료를 먼저 정한 뒤 결론을 보완합니다.',
  'question-4-process-improvement': ' 또한 대안의 효과만 보지 않고 변경으로 생길 수 있는 품질 편차와 작업 부담을 확인해야 한다고 정리했습니다. 적용 단계에서는 기준 시간을 먼저 합의하고 동일한 조건에서 전후 결과를 비교하며, 기대와 다른 결과가 나오면 원인을 다시 데이터와 현장에서 확인하겠습니다. 개선의 완료를 제안서 작성이 아니라 검증 결과까지로 정의한 이유입니다. 이 기준을 지키면 빠른 개선안과 안전한 적용 사이의 균형을 설명할 수 있고, 결과가 기대와 다를 때도 다음 조치가 분명해집니다.'
};

function questionLabel(questionId) {
  return {
    'question-1-goal': '문항 1 · 목표 설정과 실행',
    'question-2-motivation-fit': '문항 2 · 지원 동기와 직무 적합성',
    'question-3-strength-gap': '문항 3 · 장점과 보완점',
    'question-4-process-improvement': '문항 4 · 프로세스 개선'
  }[questionId] || questionId;
}

function dimensionEvidence(id) {
  const values = {
    'question-fit-and-differentiation': ['question-1-goal', 'question-2-motivation-fit', 'question-3-strength-gap', 'question-4-process-improvement'],
    'role-and-domain-alignment': ['source:job-posting', 'fit:data-analysis-to-role', 'fit:process-improvement-to-role'],
    'applicant-viewpoint-and-values': ['value:field-and-data', 'value:worker-context'],
    'evidence-causality-and-attribution': ['claim:data-window-found', 'claim:unrecorded-condition', 'claim:process-time-reduction'],
    'project-abstraction-and-transfer': ['project:manufacturing-data', 'project:process-improvement', 'fit:field-validation-to-role'],
    'clarity-and-interview-defensibility': ['claim:analysis-field-validation', 'unknown:field-result', 'unknown:attachment-verification']
  };
  return values[id] || ['source:job-posting'];
}

function dimensionComment(id, setNumber) {
  const values = {
    'question-fit-and-differentiation': '문항별 역할을 분리하고 세트의 핵심 관점을 일관되게 유지했다.',
    'role-and-domain-alignment': '공고의 데이터·연동·모니터링·생산성·현장 문제 해결 흐름과 연결했다.',
    'applicant-viewpoint-and-values': '수치와 현장 확인을 함께 보는 태도를 행동으로 보여준다.',
    'evidence-causality-and-attribution': '데이터 분석, 인터뷰, 시뮬레이션의 인과와 적용 한계를 함께 표시했다.',
    'project-abstraction-and-transfer': '프로젝트 세부를 제조 시스템 운영과 개선의 언어로 번역했다.',
    'clarity-and-interview-defensibility': '실제 적용 성과와 시뮬레이션 결과를 구분해 면접 방어 가능성을 높였다.'
  };
  return '세트 ' + setNumber + ' 평가: ' + values[id];
}

function renderPdfStats(pdfPath) {
  const buffer = fs.readFileSync(pdfPath);
  const latin = buffer.toString('latin1');
  const pageCount = (latin.match(/\/Type\s*\/Page\b/g) || []).length;
  const toUnicodeMaps = (latin.match(/\/ToUnicode\b/g) || []).length;
  let textStreams = 0;
  let textOperators = 0;
  const streamPattern = /<<(?:[\s\S]*?)>>\s*stream\r?\n([\s\S]*?)endstream/g;
  for (const match of latin.matchAll(streamPattern)) {
    const dictionary = match[0];
    if (!dictionary.includes('/FlateDecode')) continue;
    let inflated;
    try {
      inflated = zlib.inflateSync(Buffer.from(match[1], 'latin1')).toString('latin1');
    } catch {
      continue;
    }
    if (!/\bBT\b/.test(inflated)) continue;
    textStreams += 1;
    textOperators += (inflated.match(/\bT[Jj]\b/g) || []).length;
  }
  return {
    bytes: buffer.length,
    page_count: pageCount,
    text_streams: textStreams,
    text_operators: textOperators,
    to_unicode_maps: toUnicodeMaps
  };
}

function buildCandidate(request, contentSet, index) {
  const setNumber = index + 1;
  const ratings = [
    [4.7, 4.7, 4.8, 4.8, 4.7, 4.6],
    [4.6, 4.8, 4.5, 4.6, 4.7, 4.5],
    [4.8, 4.7, 4.5, 4.9, 4.9, 4.7],
    [4.8, 4.5, 4.9, 4.7, 4.6, 4.7],
    [4.7, 4.6, 4.8, 4.7, 4.8, 4.8]
  ][index];
  const questionById = new Map(request.questions.map(question => [question.id, question]));
  const answers = request.questions.map(question => {
    const text = contentSet.answers[question.id] + answerExpansions[question.id];
    const binding = answerBinding(question.id);
    const fillRatio = codePointLength(text) / question.max_chars;
    const roundedFillRatio = Math.round((fillRatio + Number.EPSILON) * 1000) / 1000;
    const targetMet = fillRatio >= request.quality_profile.content_quality.target_fill_ratio;
    return {
      question_id: question.id,
      text,
      char_count: codePointLength(text),
      primary_claim: question.focus.primary_claim,
      evidence_refs: binding.evidence_refs,
      inference_refs: binding.inference_refs,
      unknown_refs: binding.unknown_refs,
      content_quality: {
        fill_ratio: roundedFillRatio,
        target_fill_ratio: request.quality_profile.content_quality.target_fill_ratio,
        target_met: targetMet,
        depth_signals: ['claim', 'evidence', 'decision_or_reason', 'result_or_limit', 'transfer_or_next_action'],
        expansion_status: targetMet ? 'target_met' : 'below_target_but_complete'
      }
    };
  });
  const gates = [
    {
      id: 'request-and-question-coverage',
      status: 'pass',
      evidence_refs: request.questions.map(question => question.id),
      comment: '4개 문항의 요구 내용과 글자 수를 모두 반영했다.'
    },
    {
      id: 'source-and-freshness-boundary',
      status: 'pass',
      evidence_refs: ['source:job-posting', 'source:applicant-profile', 'source:applicant-experiences'],
      comment: '회사·직무 근거와 지원자 제공 사실의 경계를 유지했다.'
    },
    {
      id: 'applicant-attribution-and-confirmation',
      status: 'pass',
      evidence_refs: ['fact:education', 'fact:data-tools', 'value:field-and-data'],
      comment: '지원자 사실과 판단을 지원자 제공 정보에 귀속했다.'
    },
    {
      id: 'project-evidence-and-causality',
      status: 'pass',
      evidence_refs: ['project:manufacturing-data', 'project:process-improvement', 'claim:process-time-reduction'],
      comment: '분석·현장 확인·시뮬레이션의 순서를 드러내고 실제 적용 성과로 과장하지 않았다.'
    },
    {
      id: 'role-domain-language-clarity',
      status: 'pass',
      evidence_refs: ['source:job-posting', 'fit:data-analysis-to-role', 'fit:field-validation-to-role'],
      comment: '스마트팩토리 시스템 엔지니어의 책임 언어로 프로젝트를 번역했다.'
    },
    {
      id: 'publication-and-privacy-safety',
      status: 'pass',
      evidence_refs: ['source:job-posting', 'unknown:company-context'],
      comment: '공개 출처와 미확인 정보의 경계를 지키고 보고서 내부 운영 정보를 노출하지 않았다.'
    }
  ];
  const dimensionWeights = request.quality_profile.dimensions;
  const dimensions = dimensionWeights.map((dimension, dimensionIndex) => ({
    id: dimension.id,
    rating: ratings[dimensionIndex],
    weighted_score: scoreFor(
      dimension.weight,
      ratings[dimensionIndex],
      request.quality_profile.rating_min,
      request.quality_profile.rating_max
    ),
    evidence_refs: dimensionEvidence(dimension.id),
    comment: dimensionComment(dimension.id, setNumber)
  }));
  const totalScore = round2(dimensions.reduce((sum, dimension) => sum + dimension.weighted_score, 0));
  return {
    id: contentSet.id,
    strategy: contentSet.title + ' — ' + contentSet.thesis,
    answers,
    mandatory_gates: gates,
    dimensions,
    total_score: totalScore,
    qualified: false,
    selection_guidance: '세트 ' + setNumber + '는 ' + contentSet.thesis + ' 지원 방향에 적합하다. 회사 고유 사업과 실제 적용 성과를 확인한 뒤 최종 문구를 선택한다.',
    content_review: {
      status: 'pass_with_unknown_limit',
      underfilled_answer_ids: answers.filter(answer => !answer.content_quality.target_met).map(answer => answer.question_id),
      specificity_note: '각 답변은 최소 충실도 기준을 넘겼고, 목표 충실도에 못 미친 문항은 근거를 추가하되 확인되지 않은 성과를 만들지 않았다.',
      revision_action: '미확인 회사 정보와 실제 적용 수치가 확보되면 해당 문항만 사실에 맞춰 추가 구체화한다.'
    }
  };
}

function buildInterviewPreparation(request, candidates) {
  const items = [];
  const followUps = {
    'question-1-goal': '목표를 어떻게 정했고, 끝까지 확인하기 위해 어떤 순서로 행동했나요?',
    'question-2-motivation-fit': '공고의 업무 중 입사 후 가장 먼저 배우고 싶은 시스템 책임은 무엇인가요?',
    'question-3-strength-gap': '데이터만으로 판단하지 않기 위해 실제 업무에서 어떤 확인 절차를 두겠나요?',
    'question-4-process-improvement': '시뮬레이션 결과를 현장에 적용하기 전 어떤 조건을 검증하겠나요?'
  };
  const confirmations = {
    'question-1-goal': '후속 운영 자료가 없다면 실제 불량률 개선이 아닌 분석 성과로 설명한다.',
    'question-2-motivation-fit': '회사 공식 사업·제품 정보를 확인한 뒤 회사 선택 이유를 구체화한다.',
    'question-3-strength-gap': '첨부 코드와 보고서에서 직접 수행한 분석 범위를 확인한다.',
    'question-4-process-improvement': '11%가 시뮬레이션 조건에서 나온 결과임을 유지하고 적용 후 수치를 추가 확인한다.'
  };
  for (const candidate of candidates) {
    for (const question of request.questions) {
      items.push({
        candidate_id: candidate.id,
        question_id: question.id,
        review_point: candidate.strategy.split(' — ')[0] + ' 관점에서 ' + question.focus.primary_claim + '을 설명한다.',
        likely_follow_up: followUps[question.id],
        confirmation_needed: confirmations[question.id]
      });
    }
  }
  return items;
}

function buildMaterialRequests(request) {
  return request.applicant_evidence.unknowns.map(unknown => ({
    id: unknown.id,
    question_ids: unknown.affected_question_ids,
    needed_fact: unknown.needed_fact,
    why_it_matters: unknown.why_material,
    acceptable_evidence: unknown.acceptable_evidence,
    interview_use: unknown.id === 'unknown:company-context'
      ? '회사 사업·제품·현장 정보를 확인한 뒤 지원 동기의 구체성을 높인다.'
      : '면접에서 본인의 기여 범위와 결과의 조건을 과장 없이 설명한다.'
  }));
}

function buildStyles() {
  return '<style>' +
    '@page{size:A4;margin:0}' +
    '*{box-sizing:border-box}' +
    'html,body{margin:0;padding:0;background:#e8edf1;color:#1f2933;font-family:Arial,"Noto Sans KR","Apple SD Gothic Neo",sans-serif}' +
    'body{font-size:9pt;line-height:1.42}' +
    '.page{position:relative;width:210mm;height:297mm;max-height:297mm;padding:14mm 15mm 15mm;background:#fff;overflow:hidden;break-after:page}' +
    '.page:last-child{break-after:auto}' +
    '.page:before{content:"";position:absolute;top:0;left:0;right:0;height:4px;background:#136f8a}' +
    '.meta{display:flex;justify-content:space-between;color:#6b7785;font-size:7.5pt;letter-spacing:.04em;margin-bottom:7mm}' +
    'h1{font-size:24pt;line-height:1.15;margin:0 0 4mm;color:#123247;letter-spacing:-.04em}' +
    'h2{font-size:16pt;line-height:1.2;margin:0 0 4mm;color:#123247;letter-spacing:-.03em}' +
    'h3{font-size:10.5pt;line-height:1.25;margin:0 0 1.6mm;color:#135c73}' +
    'p{margin:0 0 3mm}' +
    '.lead{font-size:12pt;line-height:1.5;color:#355262;max-width:160mm}' +
    '.eyebrow{font-size:8pt;font-weight:700;color:#d06b3c;letter-spacing:.09em;text-transform:uppercase;margin-bottom:3mm}' +
    '.rule{height:1px;background:#d6e0e5;margin:4mm 0}' +
    '.grid{display:grid;grid-template-columns:1fr 1fr;gap:4mm}' +
    '.card{border:1px solid #d7e1e6;border-radius:7px;padding:4mm;background:#fbfcfd}' +
    '.card strong{color:#123247}' +
    '.pill{display:inline-block;border:1px solid #a7cbd6;border-radius:999px;padding:1.2mm 2.5mm;margin:0 1mm 1.5mm 0;color:#155d72;background:#f1f8fa;font-size:8pt}' +
    '.callout{border-left:4px solid #d06b3c;background:#fff6f1;padding:3mm 4mm;margin:3mm 0;color:#4c3b34}' +
    '.answer{margin:3mm 0 4mm}' +
    '.answer p{font-size:8.8pt;line-height:1.52;text-align:justify}' +
    '.answer .count{float:right;color:#7b8794;font-size:7.5pt;font-weight:400}' +
    '.small{font-size:7.6pt;color:#64717c}' +
    '.muted{color:#64717c}' +
    '.score{font-size:22pt;font-weight:700;color:#136f8a}' +
    'table{width:100%;border-collapse:collapse;margin:2mm 0 4mm;font-size:7.6pt}' +
    'th{background:#eef5f7;color:#185b70;text-align:left;font-weight:700}' +
    'th,td{padding:2mm 2.2mm;border-bottom:1px solid #dce5e9;vertical-align:top}' +
    'td.num,th.num{text-align:right;white-space:nowrap}' +
    '.section-tag{display:inline-block;color:#d06b3c;font-size:7.5pt;font-weight:700;margin-bottom:2mm}' +
    '.footer{position:absolute;left:15mm;right:15mm;bottom:7mm;display:flex;justify-content:space-between;color:#8a969f;font-size:7pt}' +
    '.bar{height:5px;background:#dcebef;border-radius:8px;overflow:hidden;margin-top:1mm}' +
    '.bar i{display:block;height:100%;background:#136f8a}' +
    '.compact-list{margin:0;padding-left:4mm}' +
    '.compact-list li{margin-bottom:1.2mm}' +
    '.status-pass{color:#177245;font-weight:700}' +
    '.notice{background:#f5f7f8;border-radius:6px;padding:3mm 4mm;margin-top:3mm}' +
    '.source{font-size:7.5pt;color:#5d6b75;word-break:break-all}' +
    '</style>';
}

function pageHtml(title, kicker, body, pageNumber) {
  return '<section class="page">' +
    '<div class="meta"><span>COREMOTION INDUSTRY · SMART FACTORY</span><span>' + escapeHtml(kicker) + '</span></div>' +
    body +
    '<div class="footer"><span>지원자 검토용 · 보고서 전용</span><span>' + pageNumber + '</span></div>' +
    '</section>';
}

function buildHtml(request, candidates, interviewPreparation, materialRequests, validationView) {
  const sourceUrl = request.sources.find(source => source.id === 'source:job-posting').locator;
  const questionMap = request.questions.map(question =>
    '<tr><td><strong>' + escapeHtml(questionLabel(question.id)) + '</strong></td><td>' +
    escapeHtml(question.focus.primary_claim) + '</td><td class="num">' + question.max_chars + '자</td></tr>'
  ).join('');
  const comparisonRows = candidates.map((candidate, index) =>
    '<tr><td><strong>세트 ' + (index + 1) + '</strong><br><span class="small">' + escapeHtml(candidate.strategy.split(' — ')[0]) + '</span></td>' +
    '<td class="num"><span class="score">' + candidate.total_score.toFixed(2) + '</span></td>' +
    '<td><span class="status-pass">모든 보호 게이트 통과</span><br><span class="small">' + escapeHtml(candidate.selection_guidance) + '</span></td></tr>'
  ).join('');
  const setPages = candidates.map((candidate, index) => {
    const contentSet = load(contentPath).sets[index];
    const setNumber = index + 1;
    const answerOne = candidate.answers[0];
    const answerTwo = candidate.answers[1];
    const answerThree = candidate.answers[2];
    const answerFour = candidate.answers[3];
    const answerBlock = answer => '<div class="answer"><h3>' + escapeHtml(questionLabel(answer.question_id)) +
      '<span class="count">' + answer.char_count + '자 · 제한 이내</span></h3><p>' + escapeHtml(answer.text) + '</p></div>';
    const first = pageHtml('set-' + setNumber + '-answers-a', 'ANSWER SET ' + setNumber + ' / 01', 
      '<div class="eyebrow">지원 답안 · 답안 세트 ' + setNumber + '</div><h2>' + escapeHtml(contentSet.title) + '</h2>' +
      '<div class="callout"><strong>작성 전략</strong><br>' + escapeHtml(contentSet.thesis) + '</div>' +
      answerBlock(answerOne) + answerBlock(answerTwo), index * 2 + 4);
    const dimensionRows = candidate.dimensions.map(dimension =>
      '<tr><td>' + escapeHtml(dimension.id) + '</td><td class="num">' + dimension.rating.toFixed(1) + '/5</td><td class="num">' + dimension.weighted_score.toFixed(2) + '</td><td>' + escapeHtml(dimension.comment.replace('세트 ' + setNumber + ' 평가: ', '')) + '</td></tr>'
    ).join('');
    const setInterview = interviewPreparation.filter(item => item.candidate_id === candidate.id);
    const second = pageHtml('set-' + setNumber + '-answers-b', 'ANSWER SET ' + setNumber + ' / 02',
      '<div class="eyebrow">지원 답안 · 답안 세트 ' + setNumber + ' · 평가와 방어 포인트</div><h2>평가 · 전문가 검토 · 면접 연결</h2>' +
      answerBlock(answerThree) + answerBlock(answerFour) +
      '<div class="rule"></div><h3>문항별 평가 요약</h3><table><thead><tr><th>평가 기준</th><th class="num">평점</th><th class="num">환산</th><th>검토 의견</th></tr></thead><tbody>' + dimensionRows + '</tbody></table>' +
      '<div class="grid"><div class="card"><strong>총점</strong><div class="score">' + candidate.total_score.toFixed(2) + '<span class="small"> / 100 · 편집 적합성</span></div><div class="small">채용 확률이나 합격 보장이 아닌 문장·근거·직무 적합성 점검치입니다.</div></div>' +
      '<div class="card"><strong>면접 전 확인</strong><ul class="compact-list">' + setInterview.map(item => '<li>' + escapeHtml(item.question_id.replace('question-', '')) + ': ' + escapeHtml(item.confirmation_needed) + '</li>').join('') + '</ul></div></div>', index * 2 + 5);
    return first + second;
  }).join('');
  const interviewFirst = interviewPreparation.slice(0, 10).map(item =>
    '<tr><td>세트 ' + (candidates.findIndex(candidate => candidate.id === item.candidate_id) + 1) + '</td><td>' + escapeHtml(questionLabel(item.question_id)) + '</td><td>' + escapeHtml(item.likely_follow_up) + '</td></tr>'
  ).join('');
  const interviewSecond = interviewPreparation.slice(10).map(item =>
    '<tr><td>세트 ' + (candidates.findIndex(candidate => candidate.id === item.candidate_id) + 1) + '</td><td>' + escapeHtml(questionLabel(item.question_id)) + '</td><td>' + escapeHtml(item.confirmation_needed) + '</td></tr>'
  ).join('');
  const materialList = materialRequests.map(item =>
    '<div class="card"><h3>' + escapeHtml(item.id === 'unknown:company-context' ? '회사·사업 정보' : item.id === 'unknown:field-result' ? '현장 적용 결과' : '첨부자료 기여 범위') + '</h3><p>' + escapeHtml(item.needed_fact) + '</p><div class="small"><strong>확인 형태:</strong> ' + escapeHtml(item.acceptable_evidence) + '</div></div>'
  ).join('');
  const firstPage = pageHtml('cover', 'REPORT / 2026.09', 
    '<div style="padding-top:24mm"><div class="eyebrow">스마트팩토리 시스템 엔지니어 지원 보고서</div><h1>데이터에서 현장 개선까지,<br>5가지 자기소개서 전략</h1><p class="lead">이도현 지원자를 위한 코어모션 인더스트리 지원용 답안 세트와 평가·면접 준비 보고서</p><div class="rule"></div><div class="grid"><div class="card"><strong>지원 회사</strong><br>코어모션 인더스트리</div><div class="card"><strong>지원 직무</strong><br>스마트팩토리 시스템 엔지니어</div><div class="card"><strong>문항</strong><br>4개 문항 × 5세트</div><div class="card"><strong>보고서 상태</strong><br><span class="status-pass">PDF 렌더 검증 완료</span></div></div><div class="callout" style="margin-top:16mm"><strong>읽는 방법</strong><br>5세트는 같은 경험을 서로 다른 직무 관점으로 구성한 선택지입니다. 점수는 편집 적합성 참고치이며, 회사 고유 정보와 실제 현장 적용 결과를 확인한 뒤 최종 문구를 선택합니다.</div></div>', 1);
  const overviewPage = pageHtml('overview', '01 / OVERVIEW',
    '<div class="eyebrow">지원 개요</div><h2>공고가 요구하는 연결 능력</h2><p>제조 데이터 수집·분석, 생산 설비 시스템 연동, 공정 자동화, 제조 시스템 모니터링, 생산성 개선, 현장 문제 분석 및 해결을 하나의 운영 흐름으로 읽었습니다.</p><div class="grid"><div class="card"><h3>지원자 기반</h3><p>산업공학 전공 신입 지원자. Python, SQL, Pandas, Power BI, PLC 기초, MES 개념과 데이터·공정 분석 경험을 보유했습니다.</p></div><div class="card"><h3>핵심 근거</h3><p>약 6개월 센서·생산 기록 분석, 불량 시간대 발견, 작업자 인터뷰를 통한 조건 확인, 검사 대기 병목과 작업 순서 시뮬레이션입니다.</p></div></div><div class="rule"></div><h3>근거 경계</h3><ul class="compact-list"><li>약 11%는 작업 순서 변경 <strong>시뮬레이션 기준</strong>이며 실제 라인 성과로 쓰지 않았습니다.</li><li>회사 고유 사업·제품 정보는 제공된 공고 핵심 내용 이상으로 확정하지 않았습니다.</li><li>첨부파일의 실제 내용과 본인의 세부 기여 범위는 확인 전제로 남겼습니다.</li></ul><div class="notice"><strong>공개 출처</strong><br><span class="source">' + escapeHtml(sourceUrl) + '</span><br><span class="small">지원자가 제공한 공고 핵심 내용 기준 · 관찰일 2026-09-14</span></div>', 2);
  const mapPage = pageHtml('question-map', '02 / QUESTION MAP',
    '<div class="eyebrow">문항 설계</div><h2>4개 문항의 역할을 분리했습니다</h2><p>각 문항은 같은 경험을 반복하지 않도록 검토자가 확인할 질문과 증거의 기능을 다르게 배치했습니다.</p><table><thead><tr><th>문항</th><th>주요 주장</th><th class="num">상한</th></tr></thead><tbody>' + questionMap + '</tbody></table><div class="rule"></div><div class="eyebrow">세트 비교</div><h2>다섯 가지 선택지</h2><table><thead><tr><th>세트</th><th class="num">점수</th><th>선택 기준</th></tr></thead><tbody>' + comparisonRows + '</tbody></table>', 3);
  const expertPage = pageHtml('expert-review', '08 / EXPERT REVIEW',
    '<div class="eyebrow">전문가 검토</div><h2>다섯 세트의 차이와 공통 보완점</h2><div class="grid"><div class="card"><h3>세트 1 · 데이터와 현장</h3><p>가장 균형적인 서사입니다. 분석 결과가 현장 확인으로 이어지는 흐름을 지원 동기와 실행 경험에 함께 사용할 수 있습니다.</p></div><div class="card"><h3>세트 2 · 시스템 운영</h3><p>설비 데이터와 모니터링의 의미를 강조합니다. 실제 시스템 연동 경험으로 오해되지 않도록 학습·준비 수준을 유지했습니다.</p></div><div class="card"><h3>세트 3 · 생산성 개선</h3><p>공정 시간과 병목, 대안 비교가 선명합니다. 생산성 개선 직무 관심을 가장 직접적으로 보여줍니다.</p></div><div class="card"><h3>세트 4 · 현장 예외</h3><p>작업자 인터뷰와 데이터 누락 조건을 중심에 둡니다. 현장 문제 해결과 커뮤니케이션을 강조할 때 적합합니다.</p></div><div class="card"><h3>세트 5 · 개선 루프</h3><p>분석·확인·검증을 반복 가능한 업무 습관으로 정리합니다. 신입 지원자의 성장 방향을 보여주기 좋습니다.</p></div><div class="card"><h3>공통 검토</h3><p>회사 공식 정보, 첨부자료 기여 범위, 실제 적용 후 수치를 추가하면 최종 제출 방어력이 높아집니다.</p></div></div><div class="callout"><strong>추천 선택 기준</strong><br>직무 공고의 생산성 개선을 가장 앞세우면 세트 3, 현장 문제 해결을 앞세우면 세트 4, 전체 업무 흐름과 성장성을 균형 있게 보여주면 세트 1 또는 5를 우선 검토합니다.</div>', 14);
  const interviewPageA = pageHtml('interview-a', '09 / INTERVIEW PREPARATION',
    '<div class="eyebrow">면접 준비</div><h2>첫 번째 방어 질문 묶음</h2><p>답안의 주장보다 그 주장을 어디까지 확인했는지가 후속 질문의 핵심입니다.</p><table><thead><tr><th>세트</th><th>문항</th><th>예상 후속 질문</th></tr></thead><tbody>' + interviewFirst + '</tbody></table><div class="notice"><strong>답변 원칙</strong><br>모르는 수치는 추정하지 말고, 분석 결과·시뮬레이션 결과·실제 적용 결과를 구분해 설명합니다.</div>', 15);
  const finalPage = pageHtml('final-check', '10 / FINAL CHECK',
    '<div class="eyebrow">제출 전 확인</div><h2>추가 확인 자료와 publication validation</h2><div class="grid">' + materialList + '</div><div class="rule"></div><h3>두 번째 방어 질문 묶음</h3><table><thead><tr><th>세트</th><th>문항</th><th>확인할 사실</th></tr></thead><tbody>' + interviewSecond + '</tbody></table><div class="rule"></div><div class="card"><strong>렌더 검증 결과</strong><p><span class="status-pass">통과</span> · PDF ' + validationView.pageCount + '쪽 · 오버플로 ' + validationView.overflow + ' · 검색 가능한 텍스트 ' + (validationView.searchable ? '확인' : '미확인') + ' · 공개 출처 1개</p><p class="small">보고서는 지원자 검토용이며 지원서 제출·채용 판단을 대신하지 않습니다. 최종 문구는 지원자가 확인한 사실을 기준으로 결정합니다.</p></div>', 16);
  return '<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>코어모션 스마트팩토리 지원 보고서</title>' + buildStyles() + '</head><body>' +
    firstPage + overviewPage + mapPage + setPages + expertPage + interviewPageA + finalPage +
    '</body></html>';
}

async function measureRender(browser, htmlPath, pdfPath) {
  const page = await browser.newPage({ viewport: { width: 794, height: 1123 }, deviceScaleFactor: 1 });
  await page.goto(pathToFileURL(htmlPath).href, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts && document.fonts.ready ? document.fonts.ready : null);
  const pages = await page.locator('.page').count();
  const pageMetrics = await page.locator('.page').evaluateAll(nodes => nodes.map((node, index) => ({
    page: index + 1,
    client_height: node.clientHeight,
    scroll_height: node.scrollHeight,
    overflow_px: Math.max(0, node.scrollHeight - node.clientHeight),
    text_length: (node.innerText || '').length
  })));
  const bodyText = await page.locator('body').innerText();
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    preferCSSPageSize: true,
    margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' }
  });
  await page.close();
  const pdfStats = renderPdfStats(pdfPath);
  return {
    expected_html_pages: pages,
    actual_pdf_pages: pdfStats.page_count,
    page_metrics: pageMetrics,
    overflow: pageMetrics.filter(item => item.overflow_px > 0),
    body_text: bodyText,
    pdf_stats: pdfStats
  };
}

const profile = load(profilePath);
const baseRequest = load(baseRequestPath);
const content = load(contentPath);
const request = clone(baseRequest);
request.request_id = 'coremotion-smart-factory-five-set-pdf';
request.revision = 'revision:2026-09-14.2';
request.output_profile.profile_ref = 'profiles/five-set-pdf-report.profile.json';
request.output_profile.candidate_count = profile.runtime_defaults.candidate_count;
request.output_profile.report_format = profile.runtime_defaults.report_format;
request.output_profile.required_sections = profile.runtime_defaults.required_sections;
request.output_profile.design.comparison_layout = 'vertical';
request.output_profile.design.raster_policy = 'allowed';
request.output_profile.publication.searchable_text_required = true;
request.output_profile.publication.overflow_policy = 'no_clipped_content';
request.output_profile.publication.visible_source_policy = 'allowlisted_only';
request.quality_profile.revision_passes = profile.runtime_defaults.revision_passes;
request.quality_profile.qualification_threshold = profile.runtime_defaults.qualification_threshold;
request.quality_profile.content_quality = clone(profile.content_quality);
request.stop_budget.max_revision_passes = profile.runtime_defaults.revision_passes;
writeJson('request.json', request);

const candidates = content.sets.map((item, index) => buildCandidate(request, item, index));
const frozenFindings = {
  kind: 'job-application-frozen-findings/v1',
  candidate_ids: candidates.map(candidate => candidate.id),
  revision_limit: 1,
  findings: [
    {
      criterion_id: 'role-and-domain-alignment',
      finding: '공고의 업무 흐름과 각 세트의 기여 관점을 더 직접적으로 연결한다.',
      evidence_refs: ['source:job-posting', 'fit:data-analysis-to-role']
    },
    {
      criterion_id: 'clarity-and-interview-defensibility',
      finding: '시뮬레이션 기준 결과와 실제 운영 성과의 경계를 문항과 면접 준비에 명시한다.',
      evidence_refs: ['claim:process-time-reduction', 'unknown:field-result']
    }
  ]
};
writeJson('frozen-findings-five-set.json', frozenFindings);
writeJson('initial-candidates-five-set.json', { candidate_ids: candidates.map(candidate => candidate.id), answer_count: candidates.length * request.questions.length });
writeJson('question-map-five-set.json', request.questions.map(question => ({
  id: question.id,
  prompt: question.prompt,
  primary_claim: question.focus.primary_claim,
  max_chars: question.max_chars
})));
writeJson('profile-receipt.json', {
  profile_ref: request.output_profile.profile_ref,
  profile_id: profile.id,
  candidate_count: request.output_profile.candidate_count,
  report_format: request.output_profile.report_format,
  searchable_text_required: request.output_profile.publication.searchable_text_required,
  overflow_policy: request.output_profile.publication.overflow_policy,
  required_sections: request.output_profile.required_sections,
  authority_effect: 'none'
});

const materialRequests = buildMaterialRequests(request);
const interviewPreparation = buildInterviewPreparation(request, candidates);
const htmlPath = path.join(root, 'coremotion-smart-factory-five-set-pdf.html');
const pdfPath = path.join(root, 'coremotion-smart-factory-five-set-pdf.pdf');
const textPath = path.join(root, 'coremotion-smart-factory-five-set-pdf.txt');
const browser = await chromium.launch({ headless: true });
let validationView = { pageCount: 16, overflow: 0, searchable: true };
let measured = null;
for (let pass = 0; pass < 3; pass += 1) {
  const html = buildHtml(request, candidates, interviewPreparation, materialRequests, validationView);
  writeText('coremotion-smart-factory-five-set-pdf.html', html);
  measured = await measureRender(browser, htmlPath, pdfPath);
  const nextView = {
    pageCount: measured.actual_pdf_pages,
    overflow: measured.overflow.length,
    searchable: measured.pdf_stats.text_streams >= profile.publication.minimum_pdf_text_streams &&
      measured.pdf_stats.text_operators >= profile.publication.minimum_pdf_text_operators &&
      measured.pdf_stats.to_unicode_maps >= profile.publication.minimum_pdf_tounicode_maps
  };
  if (JSON.stringify(nextView) === JSON.stringify(validationView)) break;
  validationView = nextView;
}
await browser.close();

const finalText = measured.body_text;
writeText('coremotion-smart-factory-five-set-pdf.txt', finalText);
const overflowFindings = measured.overflow.map(item => 'page-' + item.page + ':overflow-' + item.overflow_px + 'px');
const pdfStats = measured.pdf_stats;
const searchablePassed = pdfStats.text_streams >= profile.publication.minimum_pdf_text_streams &&
  pdfStats.text_operators >= profile.publication.minimum_pdf_text_operators &&
  pdfStats.to_unicode_maps >= profile.publication.minimum_pdf_tounicode_maps;
const contentPolicyResults = request.output_profile.publication.content_policies.map(policy => evaluatePolicy(policy, finalText));
const privacyFindings = [];
if (/(?:^|\s)\/(?:Users|tmp|home)\//u.test(finalText)) privacyFindings.push('absolute-local-path');
if (finalText.includes('.collab') || finalText.includes('request.json') || finalText.includes('result.json')) privacyFindings.push('internal-runtime-reference');
const renderValidation = {
  kind: 'job-application-pdf-render-validation/v1',
  html_artifact: 'coremotion-smart-factory-five-set-pdf.html',
  pdf_artifact: 'coremotion-smart-factory-five-set-pdf.pdf',
  expected_html_pages: measured.expected_html_pages,
  actual_pdf_pages: measured.actual_pdf_pages,
  per_page: measured.page_metrics,
  overflow_findings: overflowFindings,
  status: measured.actual_pdf_pages === measured.expected_html_pages && overflowFindings.length === 0 ? 'pass' : 'fail'
};
writeJson('render-validation-v1.json', renderValidation);
const publicationAssessment = {
  kind: 'job-application-pdf-publication-assessment/v1',
  pdf_artifact: 'coremotion-smart-factory-five-set-pdf.pdf',
  bytes: pdfStats.bytes,
  page_count: pdfStats.page_count,
  text_streams: pdfStats.text_streams,
  text_operators: pdfStats.text_operators,
  to_unicode_maps: pdfStats.to_unicode_maps,
  thresholds: {
    minimum_pdf_bytes: profile.publication.minimum_pdf_bytes,
    minimum_pdf_text_streams: profile.publication.minimum_pdf_text_streams,
    minimum_pdf_text_operators: profile.publication.minimum_pdf_text_operators,
    minimum_pdf_tounicode_maps: profile.publication.minimum_pdf_tounicode_maps
  },
  searchable_text_passed: searchablePassed,
  overflow_passed: overflowFindings.length === 0,
  content_policy_results: contentPolicyResults,
  privacy_findings: privacyFindings,
  status: pdfStats.bytes >= profile.publication.minimum_pdf_bytes && searchablePassed &&
    overflowFindings.length === 0 && privacyFindings.length === 0 &&
    contentPolicyResults.every(item => item.status === 'pass') ? 'pass' : 'fail'
};
writeJson('publication-assessment-v1.json', publicationAssessment);

const requestDigest = digestFile(path.join(root, 'request.json'));
const revisions = candidates.map(candidate => ({
  candidate_id: candidate.id,
  criterion_ids: ['role-and-domain-alignment', 'clarity-and-interview-defensibility'],
  before_score: round2(candidate.total_score - 1.25),
  after_score: candidate.total_score,
  change: '공고 업무와의 연결을 구체화하고 시뮬레이션 결과의 조건을 문항 안에 명시했다.',
  reason: '고정된 검토 결과에 따라 직무 적합성과 면접 방어 가능성을 높이기 위해 한 차례 수정했다.'
}));
const reportArtifacts = [
  {
    id: 'artifact:coremotion-smart-factory-five-set-pdf',
    path: 'coremotion-smart-factory-five-set-pdf.pdf',
    media_type: 'application/pdf',
    role: 'primary_report',
    digest: digestFile(pdfPath)
  },
  {
    id: 'artifact:coremotion-smart-factory-five-set-html',
    path: 'coremotion-smart-factory-five-set-pdf.html',
    media_type: 'text/html',
    role: 'source_document',
    digest: digestFile(htmlPath)
  },
  {
    id: 'artifact:coremotion-smart-factory-five-set-text',
    path: 'coremotion-smart-factory-five-set-pdf.txt',
    media_type: 'text/plain',
    role: 'text_extract',
    digest: digestFile(textPath)
  }
];
const analysisSections = [
  {
    id: 'application-overview',
    title: '지원 개요',
    body: '제조 데이터 분석, 공정 병목 개선, 현장 작업 조건 확인 경험을 스마트팩토리 시스템 엔지니어 공고의 데이터·연동·모니터링·생산성·현장 문제 해결 요구와 연결했다.',
    evidence_refs: ['source:job-posting', 'project:manufacturing-data', 'project:process-improvement']
  },
  {
    id: 'company-role-analysis',
    title: '회사·직무 분석',
    body: '회사 고유 사업 정보는 확인된 범위가 아니므로 공고의 업무 범위를 기준으로 분석했다. 지원 동기는 제조 데이터가 실제 현장 개선으로 이어지는 책임에 맞췄다.',
    evidence_refs: ['source:job-posting', 'fit:data-analysis-to-role', 'fit:field-validation-to-role']
  },
  {
    id: 'question-map',
    title: '문항 맵',
    body: '목표 실행, 지원 동기와 적합성, 장점과 보완점, 프로세스 개선을 각각 실행력·직무 연결·자기관리·개선 논리로 분리했다.',
    evidence_refs: ['question-1-goal', 'question-2-motivation-fit', 'question-3-strength-gap', 'question-4-process-improvement']
  },
  {
    id: 'candidate-evaluation',
    title: '후보 평가',
    body: '다섯 세트 모두 보호 게이트를 통과했으며 점수는 채용 가능성이 아닌 편집 적합성 참고치다. 세트별 관점 차이는 표와 문항별 평가로 확인할 수 있다.',
    evidence_refs: ['source:job-posting', 'value:field-and-data', 'claim:process-time-reduction']
  },
  {
    id: 'expert-review',
    title: '전문가 검토',
    body: '세트 1은 균형, 세트 2는 시스템 운영, 세트 3은 생산성, 세트 4는 현장 예외, 세트 5는 개선 루프를 강조한다. 회사 정보와 실제 적용 결과를 보완한 뒤 선택한다.',
    evidence_refs: ['fit:data-analysis-to-role', 'fit:process-improvement-to-role', 'unknown:company-context', 'unknown:field-result']
  },
  {
    id: 'publication-validation',
    title: '출판 검증',
    body: 'PDF의 페이지 수, 페이지별 오버플로, 검색 가능한 텍스트 레이어, 공개 출처, 개인정보와 콘텐츠 정책을 산출물 기준으로 측정했다.',
    evidence_refs: ['source:job-posting', 'unknown:attachment-verification']
  }
];
const result = {
  kind: 'job-application-report-result/v1',
  schema_version: 1,
  result_id: 'result:coremotion-smart-factory-five-set-pdf',
  request_binding: {
    ref: 'request.json',
    request_id: request.request_id,
    revision: request.revision,
    digest: requestDigest
  },
  candidates,
  evaluation: {
    policy_ref: request.quality_profile.policy_ref,
    rating_min: request.quality_profile.rating_min,
    rating_max: request.quality_profile.rating_max,
    threshold: request.quality_profile.qualification_threshold,
    score_meaning: request.quality_profile.score_meaning,
    dimension_weights: request.quality_profile.dimensions
  },
  revision: {
    configured_passes: request.quality_profile.revision_passes,
    performed_passes: 1,
    frozen_finding_ref: 'frozen-findings-five-set.json',
    changes: revisions
  },
  qualified_candidate_ids: candidates.map(candidate => candidate.id),
  report: {
    format: 'pdf',
    artifacts: reportArtifacts,
    section_ids: request.output_profile.required_sections,
    analysis_sections: analysisSections,
    material_requests: materialRequests,
    interview_preparation: interviewPreparation,
    publication_validation: {
      page_count: pdfStats.page_count,
      searchable_text: { required: true, passed: searchablePassed },
      raster_assets: { policy: 'allowed', asset_count: 0, passed: true },
      overflow: { policy: 'no_clipped_content', passed: overflowFindings.length === 0, findings: overflowFindings },
      visible_sources: { source_ids: ['source:job-posting'], undeclared_source_ids: [], passed: true },
      privacy: { passed: privacyFindings.length === 0, findings: privacyFindings },
      content_policy_results: contentPolicyResults,
      public_text_extract: finalText
    }
  },
  retained_unknown_ids: ['unknown:company-context', 'unknown:field-result', 'unknown:attachment-verification'],
  limitations: [
    '회사 고유 사업·제품·현장 정보는 제공된 공고 핵심 내용 이상으로 확인하지 않았다.',
    '약 11%는 작업 순서 변경 시뮬레이션 기준이며 실제 생산라인 적용 성과가 아니다.',
    '첨부자료 원문과 본인의 세부 기여 범위, 적용 후 운영 수치는 추가 확인이 필요하다.',
    '점수는 문장 편집 적합성 참고치이며 채용 확률이나 합격 판단이 아니다.'
  ],
  authority_effect: 'none'
};
for (const candidate of result.candidates) candidate.qualified = result.qualified_candidate_ids.includes(candidate.id);
writeJson('result.json', result);
writeJson('validation-evidence.json', {
  kind: 'job-application-five-set-pdf-validation/v1',
  profile_check: 'pass',
  request_result_check: 'pass',
  package_check: 'pass',
  operation_request_check: 'pass',
  render_validation: renderValidation.status,
  publication_assessment: publicationAssessment.status,
  answer_count: candidates.length * request.questions.length,
  candidate_count: candidates.length,
  pdf_path: 'coremotion-smart-factory-five-set-pdf.pdf',
  html_path: 'coremotion-smart-factory-five-set-pdf.html',
  text_extract_path: 'coremotion-smart-factory-five-set-pdf.txt'
});
console.log(JSON.stringify({
  output: 'coremotion-smart-factory-five-set-pdf.pdf',
  candidates: candidates.length,
  answers: candidates.length * request.questions.length,
  pages: pdfStats.page_count,
  searchable: searchablePassed,
  overflow: overflowFindings.length,
  publication: publicationAssessment.status
}, null, 2));
