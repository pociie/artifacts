import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from 'playwright';

const root = path.dirname(fileURLToPath(import.meta.url));
const readJson = (name) => JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
const content = readJson('self-introduction-content-v5.json');
const rubric = readJson('evaluation-rubric-v5.json');
const assessment = readJson('assessment-operation-v5.json');
const question = readJson('question-differentiation-v5.json');
const company = readJson('company-analysis-v6.json');
const userMaterial = readJson('user-material-request-v6.json');

const officialUrl = company.officialSources.find((source) => source.id === 'role-posting').url;
const answersLabel = {
  q1: '지식·기술역량과 직무 발휘',
  q2: '프로젝트를 완수하기 위해 노력한 경험',
  q3: '가치관과 회사에서의 실현'
};
const axisMeanings = {
  question_fit_and_distinctness: '각 문항이 맡은 질문에 답하고 세트의 중심 관점이 구분되는가',
  role_domain_alignment: '공고의 업무가 사용자·서비스 결과와 연결되는가',
  user_viewpoint_and_value: '사람·업무·책임에 대한 지원자의 견해가 드러나는가',
  evidence_causal_integrity: '사실·선택·기여·확인·한계가 방어되는가',
  project_design_abstraction: '구현 나열보다 목표·책임·검증·개선의 의미가 보이는가',
  clarity_and_defensibility: '독자가 이해하고 면접에서 다시 설명할 수 있는가'
};
const setReview = {
  'set-1': {
    focus: 'API·데이터·결과 확인을 하나의 직무 행동으로 묶고, Q3에서는 사람의 최종 판단을 보존하는 개선으로 분리했습니다.',
    comment: '서비스 연결 관점이 분명합니다. 다만 “사람의 판단을 돕는다”는 관점이 실제 경험에서 나온 말인지 확인해야 합니다.',
    interview: '결과가 잘못되었을 때 사용자가 무엇을 확인하고, 어느 지점에서 다음 행동을 멈추거나 수정하게 할지 말해 보세요.',
    evidence: '직접 변경한 범위와 검증 시점이 없으면 운영 성과가 아니라 설계 관점으로 표현합니다.'
  },
  'set-2': {
    focus: '공통 언어를 정의 목록이 아니라 책임·입력·결과·확인 기준을 나누는 설계 판단으로 바꾸었습니다.',
    comment: '역할 간 해석 차이를 줄이는 관점이 차별점입니다. 개인 프로젝트를 실제 조직 협업처럼 확대하지 않도록 범위를 구분해야 합니다.',
    interview: '모호한 요구 하나를 예로 들어, 무엇을 먼저 확인하고 어떤 책임 기준으로 대안을 좁혔는지 설명해 보세요.',
    evidence: '실제 협업 상대나 합의 기록이 없다면 “협업했다”보다 “협업 가능한 기준을 설계했다”로 낮춥니다.'
  },
  'set-3': {
    focus: '정상 동작과 완수를 구분하고, 문제의 위치를 좁혀 수정 후 변화를 확인하는 과정에 초점을 두었습니다.',
    comment: '완수를 결과 확인까지 확장한 점이 강점입니다. 실제 오류 재현과 수정 결과가 있어야 과거 사건으로 더욱 단단해집니다.',
    interview: '실패를 재현하기 위해 어떤 입력·상태·변경을 비교했으며, 무엇을 확인한 뒤 다음 단계로 넘어갔는지 말해 보세요.',
    evidence: '실행 기록이 없으면 재현·수정 성과를 단정하지 않고 확인 기준과 학습으로 표현합니다.'
  },
  'set-4': {
    focus: '품질을 정확도나 정상 응답으로 좁히지 않고 적용 범위·오류 가능성·사람 확인 지점으로 나누었습니다.',
    comment: '공고의 서비스 발굴·검증·품질 검증과 가장 직접적으로 연결됩니다. 높은 점수가 실제 운영 경험을 대신하지는 않습니다.',
    interview: '어떤 조건에서는 결과를 바로 사용하지 않고 보류하거나 사람에게 확인을 요청해야 한다고 판단하겠습니까?',
    evidence: '사용자 피드백·운영 수치가 없다면 품질 개선 성과가 아니라 책임 있는 확인 원칙으로 유지합니다.'
  },
  'set-5': {
    focus: '불편함을 반복 입력·우회·대기라는 업무 신호로 구체화하고, Q2에서는 핵심 흐름을 먼저 안정시키는 선택으로 분리했습니다.',
    comment: '사용자의 시간과 처리 단계를 바라보는 가치관이 드러납니다. set-1과 가까우므로 실제로 더 자주 문제 삼은 부담을 확인해야 합니다.',
    interview: '줄이려는 반복이나 대기를 누구의 업무에서 어떻게 관찰하고, 개선되었다고 판단할 신호는 무엇입니까?',
    evidence: '반복·대기 감소 수치는 과거 성과가 아니라 입사 후 관찰 계획으로 둡니다.'
  }
};

const esc = (value = '') => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');
const nl = (value = '') => esc(value).replaceAll('\n', '<br>');
const scoreFor = (id) => assessment.assessments.find((item) => item.setId === id);
const profileFor = (id) => rubric.setProfile[id];
const lensFor = (id) => question.setLenses.find((item) => item.setId === id);
const charCount = (value) => [...value].length;
const fmt = (value) => Number(value).toFixed(2);
const normalizeEssay = (value) => String(value)
  .replaceAll('Loop Architecture 설계 자료', '설계 자료')
  .replaceAll('Loop Architecture의 검토 자료', '검토 자료')
  .replaceAll('Loop Architecture에서', '설계 과정에서')
  .replaceAll('Loop Architecture의 재사용·검증·변경 재평가 설계도', '재사용·검증·변경 재평가 설계도');

const table = (headers, rows, cls = '') => `<table class="data-table ${cls}"><thead><tr>${headers.map((header) => `<th>${header}</th>`).join('')}</tr></thead><tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
const section = (number, title, kicker = '') => `<div class="section-head"><div><span class="section-number">${number}</span><h2>${title}</h2></div><span class="kicker">${kicker}</span></div>`;
const page = (body, footerText = '롯데이노베이트 AI 서비스 엔지니어 지원서 검토 보고서 · 2026.09') => `<section class="page"><div class="page-content">${body}</div><div class="page-footer">${footerText}</div></section>`;
const row = (number, title, body) => `<div class="decision-row"><div class="row-number">${number}</div><div><h3>${title}</h3><p>${body}</p></div></div>`;
const img = (assets, key, alt) => `<img class="diagram ${key}" src="${assets[key]}" alt="${esc(alt)}">`;

const css = `
@page{size:A4;margin:12mm 14mm 13mm}
:root{--ink:#1f2937;--navy:#12304f;--blue:#2a5e9e;--pale:#f3f6fa;--line:#cfd9e4;--muted:#64748b;--green:#1d6b50;--amber:#946200;--red:#9a3c42}
*{box-sizing:border-box}html,body{margin:0;padding:0}body{color:var(--ink);font-family:-apple-system,BlinkMacSystemFont,"Apple SD Gothic Neo","Noto Sans KR",sans-serif;font-size:8.45pt;line-height:1.48;word-break:keep-all}h1,h2,h3,p{margin:0}h1{font-size:26pt;line-height:1.13;letter-spacing:-.055em;color:var(--navy)}h2{font-size:16pt;line-height:1.2;letter-spacing:-.045em;color:var(--navy);display:inline}h3{font-size:9.6pt;line-height:1.3;color:var(--navy)}p{line-height:1.5}a{color:#205c9e;text-decoration:none}.page{height:272mm;page-break-after:always;display:flex;flex-direction:column}.page:last-child{page-break-after:auto}.page-content{flex:1}.page-footer{border-top:1px solid var(--line);padding-top:2.2mm;color:var(--muted);font-size:6.8pt;line-height:1.25}.eyebrow{font-size:7.6pt;letter-spacing:.12em;font-weight:800;color:var(--blue);text-transform:uppercase}.section-head{display:flex;align-items:end;justify-content:space-between;border-bottom:2px solid var(--navy);padding-bottom:2.7mm;margin-bottom:4.3mm}.section-number{display:block;color:var(--blue);font-size:7.3pt;font-weight:800;letter-spacing:.12em;margin-bottom:1.1mm}.kicker{font-size:7.1pt;color:var(--muted);letter-spacing:.1em;font-weight:700}.lead{font-size:10pt;line-height:1.6;color:#374151;max-width:148mm}.note{font-size:7.3pt;color:var(--muted);line-height:1.45}.rule{height:1px;background:var(--line);margin:4mm 0}.cover{display:flex;flex-direction:column;height:100%}.cover .eyebrow{margin-top:3mm}.cover-title{margin-top:24mm}.cover-title .bar{width:28mm;border-top:4px solid var(--blue);margin:7mm 0 6mm}.cover-meta{display:flex;gap:0;margin-top:8mm;border-top:1px solid var(--line);border-bottom:1px solid var(--line);padding:3mm 0}.cover-meta span{flex:1;padding:0 4mm;border-right:1px solid var(--line);font-size:8pt;color:var(--navy);font-weight:800}.cover-meta span:first-child{padding-left:0}.cover-meta span:last-child{border-right:0}.cover-bottom{margin-top:auto}.callout{border-left:4px solid var(--blue);background:var(--pale);padding:3.5mm 4.5mm;margin:4mm 0}.callout strong{color:var(--navy)}.decision-row{display:grid;grid-template-columns:9mm 1fr;gap:3.5mm;border-bottom:1px solid var(--line);padding:3.3mm 0}.decision-row:first-of-type{border-top:1px solid var(--line)}.row-number{font-size:15pt;color:var(--blue);font-weight:800;line-height:1}.decision-row h3{margin-bottom:1mm}.decision-row p{font-size:8.25pt}.data-table{width:100%;border-collapse:collapse;margin-top:3mm;font-size:7.4pt;line-height:1.36}.data-table th,.data-table td{border-bottom:1px solid var(--line);padding:2.1mm 2mm;vertical-align:top;text-align:left}.data-table thead th{border-top:1.5px solid var(--navy);border-bottom:1.5px solid var(--navy);background:var(--pale);color:var(--navy);font-weight:800}.data-table tbody tr:last-child td{border-bottom:1.5px solid var(--navy)}.data-table th:last-child,.data-table td:last-child{}.data-table .num{text-align:right;white-space:nowrap;font-weight:800;color:var(--green)}.data-table .center{text-align:center}.tight th,.tight td{padding:1.6mm 1.7mm;font-size:7.1pt}.small-table th,.small-table td{padding:1.3mm 1.5mm;font-size:6.95pt;line-height:1.3}.diagram{display:block;width:100%;height:auto;margin:4.5mm 0 5mm}.diagram.cover-flow{margin:16mm 0 5mm}.source-line{border-top:1px solid var(--line);margin-top:5mm;padding-top:2.5mm;font-size:7.4pt;color:var(--muted)}.two-col{display:grid;grid-template-columns:1fr 1fr;gap:8mm}.subhead{color:var(--blue);font-size:7.4pt;font-weight:800;letter-spacing:.08em;margin:4.5mm 0 1.5mm;text-transform:uppercase}.plain-list{margin:1mm 0 0;padding-left:4.8mm}.plain-list li{margin:1.2mm 0;font-size:7.9pt}.status{font-weight:800;color:var(--green)}.pending{font-weight:800;color:var(--amber)}.risk{font-weight:800;color:var(--red)}.axis-table td:first-child{width:35mm;color:var(--navy);font-weight:800}.axis-table td:nth-child(2){width:16mm;text-align:right;font-weight:800;color:var(--green)}.score-summary td:first-child{width:17mm;color:var(--navy);font-weight:800}.score-summary td:nth-child(2){width:22mm;font-size:11pt;font-weight:800;color:var(--green);white-space:nowrap}.score-summary td:nth-child(3){width:42mm}.review-table td:first-child{width:30mm;color:var(--navy);font-weight:800}.review-table td:nth-child(2){width:58mm}.review-table td:nth-child(3){width:58mm}.material-table td:first-child{width:23mm;color:var(--navy);font-weight:800}.material-table td:nth-child(2){width:42mm}.material-table td:nth-child(3){width:46mm}.material-table td:nth-child(4){width:42mm}.set-header{display:flex;justify-content:space-between;gap:5mm;align-items:end;border-bottom:2px solid var(--navy);padding-bottom:3mm;margin-bottom:3.5mm}.set-header h2{display:block;margin-top:1mm}.set-subtitle{margin-top:1.5mm;color:var(--muted);font-size:8.1pt}.total-score{font-size:25pt;color:var(--green);font-weight:800;white-space:nowrap;line-height:1}.total-score small{font-size:7.3pt;color:var(--muted);font-weight:600}.set-thesis{border-left:4px solid var(--blue);padding:2.7mm 3.5mm;background:var(--pale);font-size:8pt;margin-bottom:3.5mm}.essay-block{border-top:1px solid var(--line);padding:3mm 0 2.4mm;page-break-inside:avoid}.essay-heading{display:flex;justify-content:space-between;gap:4mm;align-items:baseline;margin-bottom:1.5mm}.essay-heading h3{font-size:9.2pt}.essay-heading span{font-size:7pt;color:var(--blue);font-weight:800;white-space:nowrap}.essay-text{font-size:8.05pt;line-height:1.45}.set-review{margin-top:3mm;border-top:1.5px solid var(--navy);padding-top:2.4mm;display:grid;grid-template-columns:1fr 1fr;gap:4mm}.set-review div{border-left:2px solid var(--line);padding-left:3mm}.set-review h3{font-size:8.3pt;margin-bottom:1mm}.set-review p{font-size:7.55pt;line-height:1.38}.final-line{border-bottom:1px solid var(--line);padding:3mm 0;font-size:8.3pt}.final-line strong{display:inline-block;width:31mm;color:var(--navy)}.signature-line{margin-top:7mm;border-bottom:1px solid var(--navy);width:70mm;height:7mm}.avoid{font-size:7.2pt;color:var(--muted);margin-top:2mm}
`;

const assetCss = `
*{box-sizing:border-box}html,body{margin:0;background:#fff}body{font-family:-apple-system,BlinkMacSystemFont,"Apple SD Gothic Neo","Noto Sans KR",sans-serif;color:#12304f}.asset{width:100%;height:100%;padding:32px 40px;background:#fff}.asset-title{font-size:22px;font-weight:800;letter-spacing:-.04em;margin-bottom:23px}.asset-subtitle{font-size:15px;color:#64748b;line-height:1.45}.asset-flow{display:flex;align-items:stretch;gap:18px}.asset-step{flex:1;border-top:5px solid #2a5e9e;background:#f3f6fa;padding:19px 18px;position:relative;min-height:112px}.asset-step:not(:last-child):after{content:'→';position:absolute;right:-19px;top:38px;color:#2a5e9e;font-size:27px;font-weight:800}.asset-step b{display:block;font-size:17px;margin-bottom:9px}.asset-step span{display:block;font-size:13px;line-height:1.42;color:#536477}.asset-rows{display:grid;gap:12px}.asset-interest{display:grid;grid-template-columns:52px 190px 1fr;gap:17px;align-items:center;border-bottom:1px solid #cfd9e4;padding:13px 0}.asset-interest .n{font-size:23px;color:#2a5e9e;font-weight:800}.asset-interest b{font-size:17px}.asset-interest span{font-size:13px;color:#536477;line-height:1.35}.asset-map{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}.asset-map .asset-step{min-height:148px}.asset-map .asset-step:not(:last-child):after{top:58px}.asset-bar{display:grid;grid-template-columns:95px 1fr 65px;gap:14px;align-items:center;margin:15px 0}.asset-bar b{font-size:15px}.asset-bar .track{height:18px;background:#e8eef5}.asset-bar .fill{height:18px;background:#2a5e9e}.asset-bar strong{font-size:15px;text-align:right}.asset-note{margin-top:26px;padding-top:15px;border-top:1px solid #cfd9e4;color:#64748b;font-size:13px;line-height:1.4}
`;

const assetDefs = {
  'cover-flow': {
    width: 1300,
    height: 300,
    body: `<div class="asset"><div class="asset-title">업무 목표가 서비스와 확인으로 이어지는 구조</div><div class="asset-flow"><div class="asset-step"><b>목표</b><span>사람이 이루려는 업무 결과</span></div><div class="asset-step"><b>맥락</b><span>정보·제약·책임을 정리</span></div><div class="asset-step"><b>처리</b><span>서비스가 결과를 전달</span></div><div class="asset-step"><b>확인</b><span>사람이 결과를 판단</span></div><div class="asset-step"><b>개선</b><span>오류·피드백을 다음 설계로</span></div></div></div>`
  },
  'company-role-map': {
    width: 1300,
    height: 330,
    body: `<div class="asset"><div class="asset-title">기업 맥락을 개인 기여로 번역하는 네 단계</div><div class="asset-map"><div class="asset-step"><b>회사 맥락</b><span>여러 산업의 업무를 IT 플랫폼·솔루션으로 연결</span></div><div class="asset-step"><b>직무 업무</b><span>API·백엔드·데이터·검증으로 서비스 전달</span></div><div class="asset-step"><b>개인 근거</b><span>요구·책임·설계·확인을 연결한 프로젝트</span></div><div class="asset-step"><b>기여 방향</b><span>업무 목적과 확인 기준을 세우며 개선</span></div></div><div class="asset-note">회사 공개 정보는 지원 동기의 배경으로 사용하고, 과거 경험은 사용자 확인이 된 범위만 근거로 사용합니다.</div></div>`
  },
  'domain-interest-map': {
    width: 1300,
    height: 390,
    body: `<div class="asset"><div class="asset-title">현재 자기소개서에서 읽히는 네 가지 관심</div><div class="asset-rows"><div class="asset-interest"><div class="n">01</div><b>업무 목적과 서비스 연결</b><span>기술보다 먼저 사용자가 이루려는 결과를 정의합니다.</span></div><div class="asset-interest"><div class="n">02</div><b>서비스 처리 흐름</b><span>입력·처리·결과를 다음 업무 행동으로 연결합니다.</span></div><div class="asset-interest"><div class="n">03</div><b>결과 검증과 책임</b><span>오류·적용 범위·사람 확인 지점을 함께 둡니다.</span></div><div class="asset-interest"><div class="n">04</div><b>피드백 기반 개선</b><span>관찰된 부담과 오류를 다음 설계와 확인으로 돌립니다.</span></div></div></div>`
  },
  'project-flow': {
    width: 1300,
    height: 300,
    body: `<div class="asset"><div class="asset-title">프로젝트 경험을 서비스 언어로 읽는 흐름</div><div class="asset-flow"><div class="asset-step"><b>문제 정의</b><span>사용자 목표와 해결할 부담</span></div><div class="asset-step"><b>책임 구조화</b><span>정보·제약·역할·확인 기준</span></div><div class="asset-step"><b>처리 설계</b><span>핵심 흐름을 먼저 선택</span></div><div class="asset-step"><b>결과 확인</b><span>정상·오류·미확인 상태</span></div><div class="asset-step"><b>배운 점</b><span>다음 개선의 판단 기준</span></div></div></div>`
  },
  'selection-path': {
    width: 1300,
    height: 300,
    body: `<div class="asset"><div class="asset-title">제출 전 판단의 순서</div><div class="asset-flow"><div class="asset-step"><b>후보 선택</b><span>점수와 중심 관점 비교</span></div><div class="asset-step"><b>사실 대조</b><span>기여·검증·배포 범위 확인</span></div><div class="asset-step"><b>말하기 연습</b><span>문제·선택·확인 상태 재현</span></div><div class="asset-step"><b>보완</b><span>근거가 없으면 문장 강도 조정</span></div><div class="asset-step"><b>최종 결정</b><span>사용자가 자연스럽게 설명 가능한가</span></div></div></div>`
  },
  'score-profile': {
    width: 1300,
    height: 330,
    body: `<div class="asset"><div class="asset-title">다섯 작성안의 편집 적합도</div>${content.sets.map((set) => { const score = scoreFor(set.id).postRevision.score; return `<div class="asset-bar"><b>${set.id}</b><div class="track"><div class="fill" style="width:${score}%"></div></div><strong>${fmt(score)}</strong></div>`; }).join('')}<div class="asset-note">90점 이상은 현재 기준에서 후보로 검토할 수 있다는 뜻이며, 역량 인증·합격 예측·제출 승인을 의미하지 않습니다.</div></div>`
  }
};

async function createAssets(browser) {
  const assetDir = path.join(root, 'report-assets-v6');
  fs.mkdirSync(assetDir, { recursive: true });
  const data = {};
  for (const [key, definition] of Object.entries(assetDefs)) {
    const assetPath = path.join(assetDir, `${key}.png`);
    const assetPage = await browser.newPage({ viewport: { width: definition.width, height: definition.height }, deviceScaleFactor: 2 });
    await assetPage.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>${assetCss}</style></head><body>${definition.body}</body></html>`, { waitUntil: 'load' });
    await assetPage.screenshot({ path: assetPath, type: 'png' });
    await assetPage.close();
    data[key] = `data:image/png;base64,${fs.readFileSync(assetPath).toString('base64')}`;
  }
  return data;
}

function scoreRows(setId) {
  const assessmentItem = scoreFor(setId);
  const profile = profileFor(setId);
  return rubric.domains.map((domain) => [
    esc(domain.name),
    `<span class="num">${fmt(assessmentItem.postRevision.domainScores[domain.id])}</span>`,
    esc(axisMeanings[domain.id]),
    esc(domain.id === 'evidence_causal_integrity' ? '직접 기여·검증 상태를 확인' : domain.id === 'clarity_and_defensibility' ? '면접에서 같은 의미로 다시 말할 수 있는지 확인' : profile.ratings[domain.id] >= 3.75 ? '현재 문장 구조에서 강점' : '추가 근거가 있으면 보강')
  ]);
}

function essayBlocks(set) {
  const lens = lensFor(set.id);
  return Object.entries(set.answers).map(([key, answer]) => {
    const q = question.questionContract.find((item) => item.id === key);
    const focus = lens[`${key}Focus`];
    return `<article class="essay-block"><div class="essay-heading"><h3>${answersLabel[key]}</h3><span>${charCount(answer)}자 · 문항 적합 ${profileFor(set.id).questionFitScores[key].toFixed(1)}/4</span></div><p class="essay-text">${nl(normalizeEssay(answer))}</p><p class="note"><b>이 문항에서 확인할 관점:</b> ${esc(focus)} · <b>문항의 주어:</b> ${esc(q.primarySubject)}</p></article>`;
  }).join('');
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const assets = await createAssets(browser);
  let html = `<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>롯데이노베이트 AI 서비스 엔지니어 자기소개서 검토 보고서</title><style>${css}</style></head><body>`;

  html += page(`<div class="cover"><div><span class="eyebrow">AI SERVICE ENGINEER · APPLICATION REVIEW</span><div class="cover-title"><h1>롯데이노베이트<br>AI 서비스 엔지니어<br>자기소개서 검토 보고서</h1><div class="bar"></div><p class="lead">다섯 작성안의 문항 차이, 직무·기업 맥락, 프로젝트 설계 관점, 면접 전 확인 지점을 한 흐름으로 읽기 위한 1차 검토본입니다.</p></div>${img(assets, 'cover-flow', '사용자 목표에서 업무 맥락, 서비스 처리, 결과 확인, 개선으로 이어지는 흐름')}</div><div class="cover-bottom"><div class="cover-meta"><span>15개 답변</span><span>모든 답변 300~700자</span><span>90점 이상 후보 5개</span></div><p class="note" style="margin-top:4mm">점수는 현재 모집공고·문항·확인된 근거에 대한 편집 적합도입니다. 최종 제출 여부와 실제 역량 판단은 사용자의 사실 확인을 전제로 합니다.</p></div></div>`);

  html += page(`${section(1, '이 보고서로 확인할 것', '읽는 순서')}<p class="lead">이 문서는 가장 높은 숫자의 초안을 자동으로 제출하기 위한 결과표가 아닙니다. 작성안의 중심 관점이 본인의 경험과 맞는지, 면접에서 사실을 다시 설명할 수 있는지, 제출 전에 무엇을 보완해야 하는지를 판단하는 보조 자료입니다.</p>${row('01', '작성안의 중심 관점을 고릅니다', '점수와 함께 각 세트가 어떤 업무 문제를 중심에 두는지 읽습니다. 점수가 비슷한 안은 본인이 실제로 더 자주 고민했던 문제를 기준으로 좁힙니다.')} ${row('02', '문장을 사실과 대조합니다', '직접 변경한 범위, 검증 방법과 시점, 배포·실사용 여부를 확인합니다. 근거가 없으면 과거 성과가 아니라 설계 기준이나 입사 후 계획으로 낮춥니다.')} ${row('03', '면접에서 다시 말해 봅니다', '특히 Q2를 문제·선택 이유·수행·확인 상태·배움의 순서로 말해 봅니다. 말로 재현되지 않는 문장은 점수보다 보완이 먼저입니다.')} ${row('04', '전문가에게 좁은 질문으로 피드백을 요청합니다', '“문항별 주어가 구분되는가”, “기술어보다 업무 의미가 먼저 보이는가”, “방어할 수 없는 과거형 문장이 있는가”처럼 문장을 인용해 요청합니다.')}<div class="callout"><strong>최종 결정 기준</strong><br>점수는 후보를 좁히는 참고값이고, 문장과 코멘트는 수정 근거입니다. 제출 여부는 사용자가 자신의 경험·가치관·면접 답변으로 확인한 뒤 결정합니다.</div>${table(['읽는 단계','확인할 질문','확인되면'],[['내용 선택','이 세트의 문제의식이 실제 내 경험과 맞는가?','후보 세트 결정'],['사실 대조','과거형 문장을 기여·검증·결과로 설명할 수 있는가?','문장 유지 또는 강도 조정'],['면접 준비','60초 안에 문제·선택·확인 상태를 말할 수 있는가?','꼬리 질문 준비'],['제출 판단','가치관 문장이 내 말이고 공고 조건이 최신인가?','제출 또는 보류']],'tight')}`);

  const roleRows = company.boundedPublicClaims.map((item) => [
    esc(item.claim.replace('공개 회사 소개는 ', '').replace('공고는 ', '')),
    esc(item.limit)
  ]);
  html += page(`${section(2, '회사·직무 맥락을 자기소개서에 쓰는 법', '기업분석')}<p>공식 채용공고는 AI 서비스 엔지니어 업무를 API·백엔드, 데이터 파이프라인, 플랫폼 운영·고도화, 서비스 발굴·검증, 튜닝·품질 검증이 이어지는 서비스 전달 역할로 제시합니다. 회사 공개 맥락은 지원 동기의 배경으로 사용하되, 확인되지 않은 팀 내부 방식으로 확대하지 않았습니다.</p>${img(assets, 'company-role-map', '회사 공개 맥락에서 직무 업무, 개인 근거, 기여 방향으로 번역하는 네 단계')}${table(['확인한 공개 맥락','자기소개서에서의 사용 범위'], roleRows, 'tight')}<div class="subhead">기업분석을 문장으로 번역하는 순서</div>${table(['순서','표현할 내용','이번 보고서의 연결'],[['회사','여러 산업의 업무를 IT 플랫폼·솔루션으로 연결하는 공개 맥락','기업 칭찬보다 업무 문제에 대한 관심으로 번역'],['직무','서비스 처리와 결과 검증을 맡는 AI 서비스 엔지니어 업무','API·백엔드·데이터를 사용자 결과와 연결'],['근거','요구 분석·책임 구조화·설계·확인을 연결한 개인 프로젝트','직접 수행한 범위만 과거형으로 사용'],['기여','업무 목적·적용 범위·확인 기준을 정리하며 개선','확인되지 않은 기술·성과는 계획형으로 제한']],'tight')}<p class="source-line">직무와 지원 조건의 최종 확인: <a href="${officialUrl}">${officialUrl}</a></p>`);

  const interestRows = [
    ['업무 목적과 서비스 연결', '기술을 먼저 나열하지 않고 사용자가 이루려는 결과를 정의하는 관심', 'set-1 · set-5'],
    ['서비스 처리 흐름', '입력·처리·결과가 다음 업무 행동으로 이어지는 구조에 대한 관심', 'set-2 · set-3'],
    ['결과 검증과 책임', '오류·적용 범위·사람 확인 지점을 품질의 일부로 보는 관점', 'set-3 · set-4'],
    ['피드백 기반 개선', '반복·오류·변경을 다음 설계와 확인 기준으로 연결하는 태도', 'set-2 · set-4 · set-5']
  ];
  html += page(`${section(3, '현재 자기소개서에서 드러나는 도메인 관심', '관점 지도')}<p class="lead">현재 작성안은 특정 모델이나 인프라를 과시하기보다, AI 서비스를 사람의 업무에 연결하고 결과를 확인하며 개선하는 일에 관심을 두고 있습니다. 이 네 가지 관심이 세트별로 서로 다른 문항 역할을 갖도록 분리했습니다.</p>${img(assets, 'domain-interest-map', '현재 자기소개서에서 드러나는 업무 목적, 서비스 흐름, 결과 검증, 피드백 개선의 네 가지 관심')}${table(['관심 영역','문장 안에서 드러나는 의미','주로 보이는 세트'], interestRows.map((item) => item.map(esc)), 'tight')}<div class="callout"><strong>표현 원칙</strong><br>“AI가 사람의 판단을 돕는다”는 관점은 직무 연결에는 유효하지만, 사용자의 실제 가치관인지 확인되기 전에는 확정된 개인 신념으로 과장하지 않습니다. 제출 전에는 그 생각을 갖게 된 경험이나 반례를 한 가지 준비해야 합니다.</div>`);

  const projectRows = [
    ['프로젝트 종류·규모', '결제·자산 관리 기능을 포함한 개인 백엔드 애플리케이션에서 출발해 현재는 넓은 TypeScript 모노레포로 확장된 개인 프로젝트', '28개 workspace는 저장소 범위의 근거일 뿐 팀·사용자·트래픽 규모는 아님'],
    ['역할·기여', '요구 분석, 상위 구조 설계, 코드 구현, 검증과 배포 구성을 연결한 경험으로 설명', '직접 변경한 파일·영역과 핵심 선택은 제출 전 확인 필요'],
    ['수행 과정', '목표 정의 → 정보·제약·책임 구조화 → 핵심 처리 흐름 선택 → 결과 확인 → 다음 개선 기준 정리', '내부 구조명 대신 업무·서비스·검증 언어를 사용'],
    ['배운 점', '완수는 구현량이 아니라 사용자의 목표가 결과 확인까지 이어지고 수정 가능성이 남은 상태라는 관점', '실제 운영 성과나 사용자 효과로 확대하지 않음']
  ];
  html += page(`${section(4, '프로젝트 경험을 상위 수준에서 설명하는 법', '프로젝트 의미')}<p>프로젝트 분석은 모듈명과 실행 메커니즘을 나열하는 대신, 사람이 해결하려는 업무 문제와 서비스가 책임져야 할 확인 지점을 중심으로 정리했습니다.</p>${img(assets, 'project-flow', '프로젝트 경험을 문제 정의, 책임 구조화, 처리 설계, 결과 확인, 배운 점으로 읽는 흐름')}${table(['구분','자기소개서에 반영한 내용','표현의 경계'], projectRows.map((item) => item.map(esc)), 'small-table')}<div class="two-col" style="margin-top:4mm"><div><div class="subhead">현재 근거로 사용할 수 있는 것</div><ul class="plain-list"><li>개인 프로젝트라는 정체성</li><li>요구·책임·설계·검증을 연결한 관점</li><li>서비스 목표와 결과 확인을 우선한 설계 해석</li></ul></div><div><div class="subhead">제출 전 반드시 확인할 것</div><ul class="plain-list"><li>직접 변경한 영역과 핵심 의사결정</li><li>실행한 검증 방법·시점·결과</li><li>배포·실사용·오류·피드백 여부</li></ul></div></div>`);

  const setScoreRows = content.sets.map((set) => {
    const item = scoreFor(set.id);
    return [esc(set.id), `<span class="num">${fmt(item.postRevision.score)}</span>`, esc(set.theme), esc(item.postRevision.distinguishingEvidence)];
  });
  const axisRows = rubric.domains.map((domain) => [esc(domain.name), `<span class="num">${domain.weight}.00</span>`, esc(axisMeanings[domain.id])]);
  html += page(`${section(5, '평가축과 작성안별 관찰 결과', '편집 적합도')}<p>점수는 현재 공고·문항·근거에 맞는 정도를 비교하기 위한 편집 지표입니다. 90점 이상은 후보로 검토할 수 있다는 뜻이며, 지원자의 전체 실력·합격 가능성·제출 승인을 의미하지 않습니다. 개인 기여나 가치관처럼 사용자 확인이 필요한 사실은 점수와 별도로 관리합니다.</p>${img(assets, 'score-profile', '다섯 작성안의 편집 적합도 점수 비교')}${table(['평가축','배점','이 축에서 확인하는 것'], axisRows, 'tight')}<div class="subhead">작성안별 중심 관점과 점수</div>${table(['세트','점수','중심 주제','주요 근거'], setScoreRows, 'tight')}<p class="note" style="margin-top:3mm">모든 세트가 90점 이상이므로 수치만으로 하나를 제거하지 않습니다. set-1과 set-5처럼 가까운 안은 본인의 실제 관점과 면접 방어 가능성으로 구분합니다.</p>`);

  const expertRows = [
    ['서비스 연결 검토', '기술 역량이 어떤 사용자 목표·입력·결과를 연결하는지', '입사 후 어느 업무의 입력과 결과를 맡고, 무엇을 확인할 것인가?'],
    ['근거·기여 검토', '직접 변경한 것과 저장소에서 관찰한 구조를 구분하는지', '내가 직접 바꾼 범위와 설명만 가능한 범위는 어디까지인가?'],
    ['품질·책임 검토', '정상 동작·오류·적용 범위·사람 확인이 분리되는지', '결과가 틀리거나 불충분할 때 언제 보류하고 누구에게 확인할 것인가?'],
    ['논리적 말하기 검토', '주장→근거→선택→확인→배움이 끊기지 않는지', '왜 그 선택을 했고 다른 대안은 왜 보류했는가?'],
    ['회사 맥락 검토', '회사 공개 맥락이 개인 경험과 기여 방향으로 자연스럽게 이어지는지', '이 회사의 어떤 업무 문제에 내 경험을 어떻게 보탤 수 있는가?']
  ];
  const setExpertRows = content.sets.map((set) => [esc(set.id), esc(setReview[set.id].comment), esc(setReview[set.id].interview)]);
  html += page(`${section(6, '전문가 관점으로 진행한 첨삭', '검토 포인트')}<p>첨삭은 기술 키워드를 추가하는 데 집중하지 않았습니다. 각 문항의 주어를 분리하고, 상위 수준의 서비스 의미를 분명히 하며, 실제로 방어할 수 없는 과거형 문장을 사용자 확인 대상으로 남기는 데 집중했습니다.</p>${table(['검토 관점','살펴볼 포인트','면접 전 확인 질문'], expertRows, 'review-table small-table')}<div class="subhead">작성안별 집중 코멘트</div>${table(['세트','이번 첨삭에서 확인한 강점과 주의점','면접 전 확인'], setExpertRows, 'small-table')}<div class="callout"><strong>코멘트를 이용하는 방법</strong><br>“좋다/약하다”로 끝내지 말고, 해당 질문에 답할 실제 장면을 한 가지 적습니다. 장면이 없으면 문장의 강도를 낮추고, 장면이 있으면 문제·선택·확인 상태를 본문과 면접 답변에 일관되게 사용합니다.</div>`);

  const materialRows = userMaterial.items.map((item) => [
    `<b>${item.priority === 'required' ? '필수' : item.priority === 'recommended' ? '권장' : '선택'}</b><br>${esc(item.request)}`,
    esc(item.why),
    esc(item.minimumEvidence.join(' · ')),
    esc(item.ifMissing)
  ]);
  html += page(`${section(7, '제출 전 보완이 필요한 자료', '사용자 확인')}<p>현재 작성안은 문항·직무 적합성은 충분하지만, 개인 기여와 실행 결과의 일부가 사용자 확인 전 상태입니다. “더 자세히 알려 달라”가 아니라 아래 최소 증거를 확인해야 문장을 제출용 과거형으로 확정할 수 있습니다.</p>${table(['우선순위·요청 자료','필요한 이유','최소 증거','자료가 없을 때'], materialRows, 'material-table small-table')}<div class="callout"><strong>가장 먼저 확인할 네 가지</strong><br>① 직접 변경한 영역과 핵심 선택 ② 검증 방법·시점·결과 ③ 배포·실사용 여부 ④ ‘AI가 사람의 판단을 돕는다’는 관점이 본인의 생각인지와 그 근거</div><p class="note">필수 자료가 비어 있으면 높은 점수라도 제출용 문장으로 확정하지 않습니다. 부재를 0점으로 처리하지 않고, 주장 범위를 낮추거나 확인 계획으로 전환합니다.</p>`);

  const selectionRows = content.sets.map((set) => {
    const item = scoreFor(set.id);
    const lens = lensFor(set.id);
    return [esc(set.id), `<b>${esc(set.theme)}</b>`, esc(lens.primaryLens), `<span class="num">${fmt(item.postRevision.score)}</span>`, esc(set.id === 'set-4' ? '공고의 검증·품질 업무와 직접 연결' : set.id === 'set-3' ? '완수·검증 기준을 말할 때' : set.id === 'set-2' ? '요구와 책임을 구조화한 경험을 말할 때' : set.id === 'set-5' ? '사용자 업무 부담을 중심에 둘 때' : '사람의 판단과 다음 행동을 중심에 둘 때')];
  });
  html += page(`${section(8, '세트 선택과 면접 준비', '최종 후보 좁히기')}<p>현재 점수와 직무 연결만 보면 set-4가 기본 검토 후보입니다. 그러나 최종 선택은 사용자가 실제로 설명할 수 있는 문제의식과 경험을 기준으로 해야 합니다.</p>${img(assets, 'selection-path', '후보 선택에서 사실 대조, 면접 연습, 보완, 최종 결정으로 이어지는 순서')}${table(['세트','중심 주제','주요 렌즈','점수','이 안이 맞는 경우'], selectionRows, 'small-table')}<div class="two-col" style="margin-top:4mm"><div><div class="subhead">가까운 안을 구분하는 질문</div><ul class="plain-list"><li><b>set-1 vs set-5:</b> 최종 판단 보존과 시간·단계 부담 중 무엇을 실제로 더 자주 문제 삼았는가?</li><li><b>set-3 vs set-4:</b> 일반적인 완수·검증과 AI 결과의 한계·사람 확인 중 어느 쪽을 더 구체적으로 말할 수 있는가?</li></ul></div><div><div class="subhead">60초 답변 구성</div><ul class="plain-list"><li>문제: 어떤 업무 부담이나 품질 문제가 있었는가?</li><li>선택: 왜 그 범위와 기준을 택했는가?</li><li>확인: 무엇을 확인했고 무엇은 아직 모르는가?</li><li>배움: 입사 후 어떤 행동으로 이어갈 것인가?</li></ul></div></div>`);

  for (const set of content.sets) {
    const item = scoreFor(set.id);
    const lens = lensFor(set.id);
    html += page(`<div class="set-header"><div><span class="eyebrow">작성안 ${set.id.replace('set-', '')}</span><h2>${esc(set.theme)}</h2><p class="set-subtitle">중심 렌즈 · ${esc(lens.primaryLens)}</p></div><div class="total-score">${fmt(item.postRevision.score)}<small>/100</small></div></div><p class="set-thesis"><b>이 안에서 가장 먼저 읽어야 할 것</b> · ${esc(item.postRevision.distinguishingEvidence)}<br><b>이번 첨삭의 집중점</b> · ${esc(setReview[set.id].focus)}</p>${table(['평가축','점수','관찰 의미','이번 안에서의 상태'], scoreRows(set.id), 'axis-table small-table')}${essayBlocks(set)}<div class="subhead">전문가 검토와 면접 전 확인</div><div class="set-review"><div><h3>검토 코멘트</h3><p>${esc(setReview[set.id].comment)}</p></div><div><h3>면접 전 질문</h3><p>${esc(setReview[set.id].interview)}</p></div></div><p class="avoid"><b>근거 경계:</b> ${esc(setReview[set.id].evidence)}<br><b>남은 확인:</b> ${esc(item.remainingUncertainty.join(' / '))}</p>`);
  }

  html += page(`${section(9, '제출 전 최종 판단', '사용자 확인')}<p class="lead">이 문서의 최종 목적은 점수를 확정하는 것이 아니라, 지원자가 자신의 말로 설명할 수 있는 자기소개서를 고르는 것입니다. 아래 항목을 모두 확인한 뒤 제출 여부를 결정하세요.</p>${row('01', '문항별 역할이 분명한가', 'Q1은 입사 후 직무 행동, Q2는 과거 프로젝트의 문제·선택·검증, Q3는 회사에서 반복할 가치관 행동으로 읽히는지 확인합니다.')} ${row('02', '프로젝트 기여를 방어할 수 있는가', '저장소 전체 구조와 본인이 직접 변경한 범위를 구분해 말할 수 있는지, 확인하지 않은 운영·성과 표현이 없는지 확인합니다.')} ${row('03', '도메인 관심이 본인 견해로 연결되는가', '업무 목적, 서비스 처리, 결과 검증, 개선이라는 관심이 단순 기술 나열이 아니라 본인의 판단 기준으로 읽히는지 확인합니다.')} ${row('04', '면접에서 재현할 수 있는가', '선택한 세트의 Q2를 60초로 말하고, “왜 그렇게 했는가”, “무엇을 확인했는가”, “어디까지가 내 기여인가”에 답합니다.')} ${row('05', '공고와 제출 조건이 최신인가', '제출 직전에 공식 모집공고에서 담당업무·문항·글자 수와 개인정보 관련 안내를 다시 확인합니다.')}<div class="callout"><strong>현재 검토 후보</strong><br>직무 연결만 보면 set-4, 완수·검증 경험을 강조하면 set-3, 사람의 판단과 업무 부담을 중심에 두면 set-1 또는 set-5가 적합합니다. 최종 선택은 사용자 확인 이후에만 가능합니다.</div><div class="final-line"><strong>선택한 세트</strong> ________________________________</div><div class="final-line"><strong>보완할 문장</strong> ________________________________</div><div class="final-line"><strong>면접 전 확인할 사실</strong> ________________________________</div><p class="source-line">최종 확인할 공식 모집공고: <a href="${officialUrl}">${officialUrl}</a></p>`);

  html += '</body></html>';
  const htmlPath = path.join(root, 'self-introduction-5sets-v6.html');
  const pdfPath = path.join(root, 'self-introduction-5sets-v6.pdf');
  fs.writeFileSync(htmlPath, html, 'utf8');
  const reportPage = await browser.newPage({ viewport: { width: 1240, height: 1754 }, deviceScaleFactor: 1 });
  await reportPage.setContent(html, { waitUntil: 'load' });
  await reportPage.pdf({ path: pdfPath, format: 'A4', printBackground: true, margin: { top: '12mm', right: '14mm', bottom: '13mm', left: '14mm' } });
  await browser.close();
  console.log(JSON.stringify({ htmlPath, pdfPath, assetDirectory: path.join(root, 'report-assets-v6'), pages: 15, answerCount: 15, averageScore: assessment.summary.averagePost }, null, 2));
}

await main();
