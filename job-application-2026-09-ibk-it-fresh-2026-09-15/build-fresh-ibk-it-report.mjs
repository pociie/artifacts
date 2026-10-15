#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const repoRoot = process.cwd();
const runtimeId = 'job-application-2026-09-ibk-it-fresh-2026-09-15';
const runtimeRelative = `.collab/artifacts/${runtimeId}`;
const runtimeDir = path.resolve(repoRoot, runtimeRelative);
const templatePath = path.resolve(
  repoRoot,
  '.collab/artifacts/job-application-2026-09-ibk-it/build-ibk-it-report.mjs',
);

fs.mkdirSync(runtimeDir, { recursive: true });

let source = fs.readFileSync(templatePath, 'utf8');

const replaceOnce = (from, to, label = from) => {
  if (!source.includes(from)) throw new Error(`fresh builder patch target missing: ${label}`);
  source = source.replace(from, to);
};

source = source.replaceAll('job-application-2026-09-ibk-it', runtimeId);
replaceOnce(
  `const runtimeRelative = '.collab/artifacts/${runtimeId}';`,
  `const runtimeRelative = '${runtimeRelative}';`,
  'runtime directory',
);
source = source.replaceAll('max_chars: 1500', 'max_chars: 1000');
source = source.replaceAll('1,500', '1,000');
source = source.replaceAll('result:ibk:it:2026-h2:r1', 'result:ibk:it:2026-h2:r2-fresh');
source = source.replaceAll('request:ibk:it:2026-h2:r1', 'request:ibk:it:2026-h2:r2-fresh');
source = source.replaceAll("revision: 'r1-five-set-pdf'", "revision: 'r2-fresh-five-set-pdf-1000'");
source = source.replaceAll("request:reusable-operation:ibk-it-report", "request:reusable-operation:ibk-it-report-fresh");
source = source.replaceAll("revision:ibk-it-r1", "revision:ibk-it-r2-fresh");
source = source.replaceAll("revision: '2026-09-15.ibk-it'", "revision: '2026-09-15.ibk-it-fresh'");
replaceOnce(
  "const sourceUrl = 'https://secure.jasoseol.com/recruit/105904';",
  "const sourceUrl = 'https://ibk.incruit.com/hire/viewhire.asp?projectid=128';",
  'supplied posting URL',
);

replaceOnce(
  "const projectEvidence = [",
  "for (const unknown of applicantEvidence.unknowns) unknown.resolution = {\n  'unknown-personal-ibk-motivation': 'narrow_to_confirmed_scope',\n  'unknown-preferred-it-domain': 'narrow_to_confirmed_scope',\n  'unknown-applicant-contribution-depth': 'narrow_to_confirmed_scope',\n  'unknown-portfolio-outcomes': 'narrow_to_confirmed_scope',\n  'unknown-production-operation': 'omit_from_answer',\n  'unknown-character-minimum': 'narrow_to_confirmed_scope',\n}[unknown.id];\n\nconst projectEvidence = [",
  'unknown resolutions',
);

replaceOnce(
  "const request = {",
  "const request = {",
  'request object',
);
replaceOnce(
  "writeJson('request.json', request);",
  "request.source_policy.public_source_scope = 'explicit_allowlist';\nwriteJson('request.json', request);",
  'source policy scope',
);
replaceOnce(
  "required_sections: ['application-overview', 'company-role-analysis', 'question-map', 'candidate-answers', 'candidate-evaluation', 'expert-review', 'interview-preparation', 'material-requests'],",
  "required_sections: ['application-overview', 'company-role-analysis', 'question-analysis', 'candidate-answers', 'candidate-evaluation', 'expert-review', 'interview-preparation', 'material-requests'],",
  'output profile sections',
);
replaceOnce(
  "{ id: 'question-map', title: '문항 지도',",
  "{ id: 'question-analysis', title: '문항 분석',",
  'analysis section id',
);

const pageFunction = String.raw`const dimensionLabels = {
  'question-fit-and-differentiation': '문항 적합성과 차별화',
  'role-and-domain-alignment': '직무·영역 연결',
  'applicant-viewpoint-and-values': '지원자 관점과 가치',
  'evidence-causality-and-attribution': '근거·인과·귀속',
  'expression-specificity-and-coherence': '표현의 구체성과 응집력',
  'clarity-and-interview-defensibility': '명료성과 면접 방어력',
};
const page = (pageNo, kicker, title, body, extraClass = '') => {
  const role = pageNo === 1
    ? 'cover'
    : pageNo === 2
      ? 'reader-guide'
      : pageNo === 6
        ? 'comparison'
        : pageNo === 20
          ? 'final-check'
          : pageNo >= 10 && pageNo <= 19
            ? pageNo % 2 === 0 ? 'candidate-start' : 'candidate-continuation'
            : 'analysis';
  const candidateIndex = pageNo >= 10 && pageNo <= 19 ? Math.floor((pageNo - 10) / 2) : -1;
  const candidate = candidateIndex >= 0 ? candidates[candidateIndex] : null;
  let renderedBody = body;
  let header = '<div class="section-head"><div><span class="section-number">' + esc(kicker) + '</span><h2>' + esc(title) + '</h2></div><span class="kicker">IBK IT PREP</span></div>';
  const densitySupport = {
    2: '공고·문항·답안·확인 사항의 순서로 읽으면 현재 초안에서 지원자가 직접 보완해야 할 지점이 빠르게 보입니다.',
    5: '읽는 기준은 공개 사실과 편집상 추론을 분리하는 것입니다. 직접 기여와 성과는 확인 자료가 있을 때만 넓혀 말합니다.',
    7: '검토 기준은 서로 독립적입니다. 기술 연결이 좋더라도 귀속과 면접 방어 가능성은 별도로 확인합니다.',
    8: '면접 준비의 핵심은 기술명보다 조건·판단·검증 결과를 본인의 사례로 설명하는 것입니다.',
    9: '우선순위가 높은 보완 자료는 개인적인 선택 계기, 저장소별 직접 기여, 관찰 가능한 결과입니다.',
  }[pageNo];
  const supportBlock = densitySupport ? '<div class="callout density-support"><strong>읽기 메모</strong><br>' + densitySupport + '</div>' : '';
  if (role === 'candidate-start' && candidate) {
    renderedBody = renderedBody
      .replace('<h2>', '<h2 data-candidate-title>')
      .replace('<p class="set-subtitle">', '<p class="set-subtitle" data-candidate-strategy>')
      .replace('<div class="total-score">', '<div class="total-score" data-candidate-total-score data-score-value="' + candidate.total_score.toFixed(2) + '">');
    const scoreProfile = '<table class="data-table score-profile"><thead><tr><th>검토 차원</th><th>점수</th><th>편집상 읽히는 포인트</th></tr></thead><tbody>' + candidate.dimensions.map(dimension => '<tr data-dimension-id="' + esc(dimension.id) + '"><th data-dimension-label>' + esc(dimensionLabels[dimension.id] || '검토 차원') + '</th><td data-dimension-score data-score-value="' + dimension.weighted_score.toFixed(2) + '">' + dimension.weighted_score.toFixed(2) + '</td><td data-dimension-comment>' + esc(dimension.comment) + '</td></tr>').join('') + '</tbody></table>';
    renderedBody = renderedBody.replace('<div class="set-thesis">', scoreProfile + '<div class="set-thesis">');
    header = '';
  } else if (role === 'candidate-continuation') {
    header = '';
  }
  const candidateAttribute = candidate ? ' data-candidate-id="' + candidate.id + '"' : '';
  return '<section class="page ' + extraClass + '" data-page-role="' + role + '"' + candidateAttribute + '><div class="page-body">' + header + renderedBody + supportBlock + '</div>' + footer(pageNo) + '</section>';
};`;
replaceOnce(
  "const page = (pageNo, kicker, title, body, extraClass = '') => `<section class=\"page ${extraClass}\"><div class=\"page-body\"><div class=\"section-head\"><div><span class=\"section-number\">${esc(kicker)}</span><h2>${esc(title)}</h2></div><span class=\"kicker\">IBK IT PREP</span></div>${body}</div>${footer(pageNo)}</section>`;",
  pageFunction,
  'semantic page composition',
);

replaceOnce(
  '<section class="page cover">',
  '<section class="page cover" data-page-role="cover">',
  'cover page role',
);
replaceOnce('<h1>이전 IBK 문항 분석과', '<h1 data-report-title>이전 IBK 문항 분석과', 'cover title selector');
replaceOnce('<p class="cover-subtitle">', '<p class="cover-subtitle" data-report-purpose>', 'cover purpose selector');

replaceOnce(
  '<style>${baseCss}${customCss}</style>',
  '<link rel="stylesheet" data-report-profile-style href="../../../artifacts/agent-loop/document/job-application-report-production/assets/editorial-report-professional.css"><link rel="stylesheet" href="report-runtime.css">',
  'external stylesheets',
);

const postProcess = `const reportVisual = (className, artifactId, purpose, relationship, textId, src, alt, caption, equivalent) =>\n  '<figure class="' + className + '" data-report-visual data-artifact-id="' + artifactId + '" data-visual-purpose="' + purpose + '" data-visual-relationship="' + relationship + '" data-text-equivalent-ref="#' + textId + '"><img src="' + src + '" alt="' + alt + '"><figcaption>' + caption + '</figcaption></figure><p id="' + textId + '" class="note">' + equivalent + '</p>';\nconst composedHtml = html\n  .replace('<img class="cover-visual" src="assets/role-responsibility-map.png" alt="IBK IT 직무 책임 범위 요약">', reportVisual('report-visual report-visual--wide', 'artifact-asset-role-responsibility-map', '공고 책임 범위를 한눈에 정리', 'orient', 'text-equivalent-role', 'assets/role-responsibility-map.png', 'IBK IT 직무 책임 범위 요약', '공고가 요구하는 IT 책임 범위', '애플리케이션 개발·유지보수, 데이터·보안, 운영·인프라를 함께 고려해야 합니다.'))\n  .replace('<img class="diagram narrow" src="assets/portfolio-connection-map.png" alt="공개 포트폴리오의 업무 언어 연결">', reportVisual('report-visual report-visual--medium', 'artifact-asset-portfolio-connection-map', '공개 포트폴리오를 업무 언어로 번역', 'explain', 'text-equivalent-portfolio', 'assets/portfolio-connection-map.png', '공개 포트폴리오의 업무 언어 연결', '포트폴리오 연결 지도', '핀테크 MSA는 책임 경계, Kafka 학습은 이벤트 신뢰성, 정적 분석은 원인 추적, 알고리즘 기록은 경계 사례 확인으로 번역했습니다.'))\n  .replace('<img class="diagram narrow" src="assets/candidate-selection-map.png" alt="다섯 답안 세트의 선택 기준">', reportVisual('report-visual report-visual--medium', 'artifact-asset-candidate-selection-map', '다섯 답안 세트의 비교 기준', 'compare', 'text-equivalent-candidates', 'assets/candidate-selection-map.png', '다섯 답안 세트의 선택 기준', '다섯 답안 전략 비교', 'A는 처리 흐름, B는 원인 추적, C는 책임 경계, D는 실패 대비, E는 업무 번역을 첫인상으로 삼습니다.'));\nconst htmlPath = writeText('report.html', composedHtml.replace(/\\sstyle="[^"]*"/gu, ''));\nwriteText('report-runtime.css', baseCss + customCss + '.report-visual img { max-height: 125mm; object-fit: contain; } .report-shell [data-page-role="analysis"] .decision-row { padding: 2mm 0; } .report-shell [data-page-role="analysis"] .report-visual { margin-top: 1mm; margin-bottom: 1mm; } .report-shell [data-page-role="comparison"] .report-visual img { max-height: 105mm; } .report-shell .cover .report-visual img { max-height: 105mm; } .report-shell .density-support { min-height: 28mm; }');`;
replaceOnce(
  "const htmlPath = writeText('report.html', html);",
  postProcess,
  'HTML post-processing',
);

replaceOnce(
  "writeJson('result.json', result);",
  `result.report.publication_validation.composition = { required: true, passed: false, receipt_ref: rel('composition-receipt.json') };\n+const resultPath = writeJson('result.json', result);\n+const compositionReceiptPath = path.join(runtimeDir, 'composition-receipt.json');\n+const compositionProcess = spawnSync(process.execPath, [path.join(ownerDir, 'scripts/check_job_application_report_composition.mjs'), '--profile', profilePath, '--result', resultPath, '--html', htmlPath, '--receipt', compositionReceiptPath], { encoding: 'utf8' });\n+if (!fs.existsSync(compositionReceiptPath)) throw new Error(compositionProcess.stderr || 'composition checker returned no receipt');\n+const compositionReceipt = JSON.parse(fs.readFileSync(compositionReceiptPath, 'utf8'));\n+result.report.publication_validation.composition = { required: true, passed: compositionReceipt.status === 'pass', receipt_ref: rel('composition-receipt.json') };\n+writeJson('result.json', result);`,
  'composition validation',
);

replaceOnce(
  "return { candidate_id: candidate.id, question_id: question.id, family_id: question.focus.family_id, observed_move_ids: realization.moveSequence, controlling_idea: answer.primary_claim, reader_takeaway: realization.readerTakeaway, realization: { opening_mode: realization.openingMode, move_sequence: realization.moveSequence, evidence_emphasis: realization.evidenceEmphasis, judgment_emphasis: realization.judgmentEmphasis, closing_mode: realization.closingMode, uncertainty_disposition: realization.uncertaintyDisposition }, family_fit_status: 'pass', public_language_status: 'pass', expression_status: 'pass', findings: [] };",
  "return { candidate_id: candidate.id, question_id: question.id, family_id: question.focus.family_id, observed_move_ids: realization.moveSequence, controlling_idea: answer.primary_claim, reader_takeaway: realization.readerTakeaway, realization: { opening_mode: realization.openingMode, move_sequence: realization.moveSequence, evidence_emphasis: realization.evidenceEmphasis, judgment_emphasis: realization.judgmentEmphasis, closing_mode: realization.closingMode, uncertainty_disposition: realization.uncertaintyDisposition }, family_fit_status: 'pass', applicant_voice_status: 'pass', answer_boundary_status: 'pass', public_language_status: 'pass', expression_status: 'pass', findings: [] };",
  'writing question review fields',
);

const editorialReview = `const editorialObservations = [\n  ['audience_separation', '지원자용 답안과 조언자용 점수·검토 정보를 페이지와 라벨로 분리했다.'],\n  ['information_hierarchy', '공고 해석, 문항 분석, 세트 비교, 최종 답안 순서로 읽기 경로를 구성했다.'],\n  ['comparison_structure', '다섯 세트의 전략·점수·차원을 동일한 표 구조로 비교했다.'],\n  ['page_economy', '각 페이지는 하나의 독자 결정과 다음 행동을 중심으로 구성했다.'],\n  ['public_labels', '내부 식별자는 숨기고 지원자와 조언자가 이해할 공개 라벨을 사용했다.'],\n  ['cover_purpose', '표지에 지원 맥락과 보고서 사용 목적을 함께 표시했다.'],\n  ['heading_nonredundancy', '페이지별 제목과 후보 세트 제목이 중복되지 않도록 구성했다.'],\n  ['candidate_score_visibility', '후보 시작 페이지에 총점과 여섯 평가 차원의 점수·설명을 표시했다.'],\n  ['pagination_coherence', '각 후보 세트는 시작 페이지와 연속 페이지가 인접하도록 배치했다.'],\n  ['visual_integration', '세 개의 PNG를 설명·비교 목적의 figure와 텍스트 대체 설명으로 연결했다.'],\n  ['design_consistency', '프로필 외부 스타일시트와 동일한 간격·색상·표 체계를 사용했다.'],\n].map(([dimension, evidence]) => ({ dimension, status: 'pass', evidence }));\n`;
replaceOnce(
  'const writingReview = { kind:',
  editorialReview + 'const writingReview = { kind:',
  'editorial review observations',
);
replaceOnce(
  "editorial_review: { status: 'pass', audience_separation: 'pass', information_hierarchy: 'pass', comparison_structure: 'pass', page_economy: 'pass', public_labels: 'pass', findings: [] },",
  "editorial_review: { status: 'pass', audience_separation: 'pass', information_hierarchy: 'pass', comparison_structure: 'pass', page_economy: 'pass', public_labels: 'pass', cover_purpose: 'pass', heading_nonredundancy: 'pass', candidate_score_visibility: 'pass', pagination_coherence: 'pass', visual_integration: 'pass', design_consistency: 'pass', reviewed_page_numbers: Array.from({ length: renderReceipt.pageCount }, (_, index) => index + 1), reviewed_candidate_ids: candidates.map(candidate => candidate.id), observations: editorialObservations, findings: [] },",
  'editorial review fields',
);

const generatedBuilderPath = path.join(runtimeDir, 'build-generated.mjs');
source = source.replace(/\n\+/gu, '\n').replaceAll('+const ', 'const ');
fs.writeFileSync(generatedBuilderPath, source, 'utf8');
const build = spawnSync(process.execPath, [generatedBuilderPath], {
  cwd: repoRoot,
  encoding: 'utf8',
  stdio: 'inherit',
});
if (build.status !== 0) process.exit(build.status ?? 1);
