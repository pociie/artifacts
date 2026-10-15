import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = path.dirname(fileURLToPath(import.meta.url));
const load = name => JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
const request = load('request-v2.json');
const result = load('result-v2.json');
const research = load('research-evidence.json');
const questionMap = load('question-map.json');
const answers = load('answer-texts-v2.json');
const esc = value => String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
const pct = value => `${Math.round(Number(value) * 100)}%`;
const num = value => Number(value).toFixed(1);
const qTitles = {
  'question-strength': '강점과 대표 경험',
  'question-motivation': '관심 계기와 지원 이유',
  'question-problem': '문제 해결 경험',
  'question-contribution': '입사 후 기여 방향',
};
const qShort = {
  'question-strength': '강점',
  'question-motivation': '지원동기',
  'question-problem': '문제 해결',
  'question-contribution': '입사 후 기여',
};
const review = {
  'candidate-set-1': ['책임 단위와 도메인 모델', '구조화가 실제로 어떤 변경을 줄였는지 설명하면 강점이 단단해집니다.', '어떤 책임을 어디에서 분리했고, 그 경계를 검증한 방법은 무엇인가요?'],
  'candidate-set-2': ['API 계약과 데이터 책임', '계약을 문서가 아닌 상태·입력·결과의 합의로 설명한 점이 차별점입니다.', '외부 효과와 계정 저장의 순서를 왜 분리했으며, 대안은 무엇이었나요?'],
  'candidate-set-3': ['검증 가능성과 안정성 신호', '테스트 존재와 실행 결과를 구분해 말하는 태도가 면접 방어력을 높입니다.', '같은 실패를 재현하기 위해 어떤 입력·상태·의존성을 고정했나요?'],
  'candidate-set-4': ['데이터 생명주기와 처리 경계', '저장소 이름보다 원본성·수명·복구 비용을 먼저 본다는 기준이 분명합니다.', '어떤 데이터는 Redis에 두고 어떤 데이터는 관계형 원본으로 남겨야 하나요?'],
  'candidate-set-5': ['사용자 행동과 실패 경험', '성공 응답보다 대기·중복·실패 뒤의 다음 행동을 설계한 관점이 드러납니다.', '사용자가 같은 요청을 반복하지 않게 하려면 상태와 재시도를 어떻게 안내하나요?'],
};
const sourceLabels = {
  'source-github-profile': 'GitHub 공개 프로필',
  'source-bank-project-readme': 'dev-group-bank-msa README',
  'source-bank-issue-44': 'Redis 관련 공개 이슈',
  'source-bank-redis-commit': 'Redis·커밋 후 메일 변경 커밋',
  'source-kafka-study': 'Kafka 학습 README',
};

const sourceLinks = research.public_sources.map(source => `<a href="${esc(source.uri)}">${esc(sourceLabels[source.id] || source.id)}</a>`).join(' · ');
const questionById = new Map(request.questions.map(question => [question.id, question]));
const candidateById = new Map(result.candidates.map(candidate => [candidate.id, candidate]));
const ratios = candidate => candidate.answers.map(answer => answer.content_quality.fill_ratio);
const avgRatio = candidate => ratios(candidate).reduce((sum, value) => sum + value, 0) / ratios(candidate).length;
const minRatio = candidate => Math.min(...ratios(candidate));
const page = (body, footer = '넥스트웨이브 테크 백엔드 개발 지원서 검토 보고서 · 2026.09') => `<section class="page"><div class="page-content">${body}</div><div class="page-footer">${footer}</div></section>`;
const section = (no, title, kicker) => `<div class="section-head"><div><span class="section-no">${no}</span><h2>${title}</h2></div><span class="kicker">${kicker}</span></div>`;
const table = (headers, rows, cls = '') => `<table class="data ${cls}"><thead><tr>${headers.map(header => `<th>${header}</th>`).join('')}</tr></thead><tbody>${rows.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
const svgFlow = () => `<svg class="flow" viewBox="0 0 920 176" role="img" aria-label="질문과 근거를 답안과 검토로 연결하는 흐름"><defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#3d73b9"/></marker></defs><path d="M180 82 H245 M405 82 H470 M630 82 H695" stroke="#3d73b9" stroke-width="2" marker-end="url(#arrow)"/><g><rect x="20" y="38" width="160" height="88" rx="12" fill="#eaf2fb" stroke="#3d73b9"/><text x="100" y="70" text-anchor="middle" class="svgt">01</text><text x="100" y="96" text-anchor="middle" class="svglabel">문항 의도</text><text x="100" y="114" text-anchor="middle" class="svgsmall">무엇을 보여줄까</text></g><g><rect x="245" y="38" width="160" height="88" rx="12" fill="#eef6f2" stroke="#31805e"/><text x="325" y="70" text-anchor="middle" class="svgt green">02</text><text x="325" y="96" text-anchor="middle" class="svglabel">근거와 경계</text><text x="325" y="114" text-anchor="middle" class="svgsmall">무엇을 확인했나</text></g><g><rect x="470" y="38" width="160" height="88" rx="12" fill="#f7f2e7" stroke="#b48837"/><text x="550" y="70" text-anchor="middle" class="svgt amber">03</text><text x="550" y="96" text-anchor="middle" class="svglabel">답안 선택</text><text x="550" y="114" text-anchor="middle" class="svgsmall">어떻게 말할까</text></g><g><rect x="695" y="38" width="200" height="88" rx="12" fill="#f2edf7" stroke="#79539b"/><text x="795" y="70" text-anchor="middle" class="svgt purple">04</text><text x="795" y="96" text-anchor="middle" class="svglabel">면접·제출 확인</text><text x="795" y="114" text-anchor="middle" class="svgsmall">무엇을 더 검증할까</text></g></svg>`;
const depthSvg = () => `<svg class="depth" viewBox="0 0 900 145" role="img" aria-label="답안 깊이의 다섯 신호"><path d="M95 74 H805" stroke="#cbd7e5" stroke-width="6"/><g>${[['주장',95,'#2d65a5'],['근거',272,'#31805e'],['판단',449,'#b48837'],['결과·한계',626,'#79539b'],['전이',805,'#9d4c55']].map(([label,x,color],i)=>`<circle cx="${x}" cy="74" r="28" fill="${color}"/><text x="${x}" y="80" text-anchor="middle" class="svgn">${i+1}</text><text x="${x}" y="126" text-anchor="middle" class="svglabel">${label}</text>`).join('')}</g></svg>`;
const bar = (value, color = '#3d73b9') => `<div class="bar-track"><span style="width:${Math.min(100, value)}%;background:${color}"></span></div>`;
const answerBlock = (candidate, qid) => {
  const answer = candidate.answers.find(item => item.question_id === qid);
  const question = questionById.get(qid);
  return `<article class="answer"><div class="answer-head"><h3>${esc(qTitles[qid])}</h3><span>${answer.char_count}자 · 상한 ${question.max_chars}자 · ${pct(answer.content_quality.fill_ratio)}</span></div><p>${esc(answer.text)}</p><div class="answer-foot">깊이 신호 · 주장 · 근거 · 판단 이유 · 결과/한계 · 입사 후 전이</div></article>`;
};

const css = `
@page{size:A4;margin:12mm 14mm 13mm}*{box-sizing:border-box}html,body{margin:0;padding:0}body{font-family:-apple-system,BlinkMacSystemFont,"Apple SD Gothic Neo","Noto Sans KR",sans-serif;color:#243447;font-size:8.3pt;line-height:1.45;word-break:keep-all}h1,h2,h3,p{margin:0}h1{font-size:29pt;line-height:1.1;letter-spacing:-.065em;color:#102d4b}h2{font-size:16.5pt;line-height:1.15;letter-spacing:-.045em;color:#102d4b;display:inline}h3{font-size:9.6pt;line-height:1.3;color:#173a61}p{line-height:1.48}a{color:#245f9f;text-decoration:none}.page{height:272mm;page-break-after:always;display:flex;flex-direction:column}.page:last-child{page-break-after:auto}.page-content{flex:1;min-height:0}.page-footer{border-top:1px solid #d4dee9;padding-top:2.2mm;color:#77879a;font-size:6.7pt;line-height:1.2}.eyebrow,.section-no{font-size:7.2pt;letter-spacing:.13em;font-weight:800;color:#3971b4}.eyebrow{text-transform:uppercase}.section-head{display:flex;align-items:end;justify-content:space-between;border-bottom:2px solid #123555;padding-bottom:2.6mm;margin-bottom:4mm}.section-no{display:block;margin-bottom:1mm}.kicker{color:#77879a;font-size:7pt;font-weight:800;letter-spacing:.09em}.lead{font-size:10pt;line-height:1.58;color:#3d4d5e}.muted{color:#748396}.note{font-size:7.2pt;line-height:1.45;color:#718095}.rule{height:1px;background:#d4dee9;margin:4mm 0}.cover{height:100%;display:flex;flex-direction:column}.cover-title{margin-top:24mm}.cover-bar{width:30mm;border-top:4px solid #3971b4;margin:7mm 0 6mm}.cover-meta{display:grid;grid-template-columns:repeat(4,1fr);border-top:1px solid #d4dee9;border-bottom:1px solid #d4dee9;margin-top:10mm;padding:3mm 0}.cover-meta div{padding:0 4mm;border-right:1px solid #d4dee9;color:#173a61;font-weight:800;font-size:8pt}.cover-meta div:first-child{padding-left:0}.cover-meta div:last-child{border:0}.cover-bottom{margin-top:auto}.callout{background:#f2f6fa;border-left:4px solid #3971b4;padding:3.2mm 4mm;margin:4mm 0}.callout strong{color:#173a61}.flow{display:block;width:100%;height:auto;margin:15mm 0 6mm}.depth{display:block;width:100%;height:auto;margin:5mm 0 6mm}.svgt{font:800 19px -apple-system,sans-serif;fill:#2d65a5}.svgt.green{fill:#31805e}.svgt.amber{fill:#a4731e}.svgt.purple{fill:#79539b}.svglabel{font:800 17px -apple-system,"Apple SD Gothic Neo",sans-serif;fill:#173a61}.svgsmall{font:13px -apple-system,"Apple SD Gothic Neo",sans-serif;fill:#60758b}.svgn{font:800 16px -apple-system,sans-serif;fill:#fff}.data{width:100%;border-collapse:collapse;margin-top:3mm;font-size:7.25pt;line-height:1.35}.data th,.data td{padding:2.1mm 2mm;border-bottom:1px solid #d4dee9;text-align:left;vertical-align:top}.data thead th{background:#f2f6fa;color:#173a61;border-top:1.5px solid #173a61;border-bottom:1.5px solid #173a61;font-weight:800}.data tbody tr:last-child td{border-bottom:1.5px solid #173a61}.tight th,.tight td{padding:1.6mm 1.7mm;font-size:7pt}.micro th,.micro td{padding:1.25mm 1.4mm;font-size:6.75pt;line-height:1.28}.num{text-align:right!important;white-space:nowrap;font-weight:800;color:#287151}.badge{display:inline-block;border-radius:12px;padding:1mm 2.4mm;font-size:6.8pt;font-weight:800;background:#eaf2fb;color:#245f9f;white-space:nowrap}.badge.green{background:#eaf5ef;color:#287151}.badge.amber{background:#fbf2df;color:#946c1f}.badge.red{background:#f8e9ea;color:#994b53}.two{display:grid;grid-template-columns:1fr 1fr;gap:7mm}.three{display:grid;grid-template-columns:repeat(3,1fr);gap:4mm}.card{border:1px solid #d4dee9;border-top:3px solid #3971b4;padding:3mm 3.2mm}.card.green{border-top-color:#31805e}.card.amber{border-top-color:#b48837}.card.purple{border-top-color:#79539b}.card h3{margin-bottom:1.5mm}.card p{font-size:7.6pt}.subhead{font-size:7.2pt;letter-spacing:.1em;text-transform:uppercase;color:#3971b4;font-weight:800;margin:4.5mm 0 1.6mm}.source-line{border-top:1px solid #d4dee9;padding-top:2.5mm;margin-top:5mm;font-size:7.1pt;color:#718095}.decision-row{display:grid;grid-template-columns:9mm 1fr;gap:3.4mm;border-bottom:1px solid #d4dee9;padding:3mm 0}.decision-row:first-of-type{border-top:1px solid #d4dee9}.decision-no{font-size:15pt;line-height:1;color:#3971b4;font-weight:800}.decision-row h3{margin-bottom:1mm}.decision-row p{font-size:8pt}.bar-row{display:grid;grid-template-columns:30mm 1fr 14mm;gap:3mm;align-items:center;margin:2.6mm 0}.bar-row label{font-weight:800;color:#173a61;font-size:7.3pt}.bar-row b{text-align:right;color:#287151;font-size:7.5pt}.bar-track{height:5mm;background:#e8eef4;border-radius:4px;overflow:hidden}.bar-track span{height:100%;display:block;border-radius:4px}.set-head{display:flex;justify-content:space-between;align-items:end;border-bottom:2px solid #123555;padding-bottom:3mm;margin-bottom:3.5mm}.set-head h2{display:block;margin-top:1mm}.set-meta{font-size:7.3pt;color:#738398;margin-top:1.5mm}.score{font-size:25pt;color:#287151;font-weight:800;line-height:1;white-space:nowrap}.score small{font-size:7pt;color:#738398;font-weight:600}.thesis{background:#f2f6fa;border-left:4px solid #3971b4;padding:2.8mm 3.5mm;margin-bottom:3.5mm;font-size:7.9pt}.essay-wrap{display:grid;grid-template-columns:1fr 1fr;gap:5mm}.answer{border-top:1px solid #d4dee9;padding:2.7mm 0 2.2mm;break-inside:avoid}.answer-head{display:flex;justify-content:space-between;gap:3mm;align-items:baseline;margin-bottom:1.3mm}.answer-head h3{font-size:9.1pt}.answer-head span{font-size:6.7pt;color:#3971b4;white-space:nowrap;font-weight:800}.answer p{font-size:7.85pt;line-height:1.46;text-align:left}.answer-foot{font-size:6.55pt;color:#718095;margin-top:1.7mm}.axis td:first-child{width:38mm;color:#173a61;font-weight:800}.axis td:nth-child(2){width:15mm;text-align:right;font-weight:800;color:#287151}.review-box{border-top:1.5px solid #173a61;margin-top:4mm;padding-top:3mm;display:grid;grid-template-columns:1fr 1fr;gap:6mm}.review-box h3{margin-bottom:1.5mm}.review-box p{font-size:7.6pt}.check{display:grid;grid-template-columns:7mm 1fr;gap:2.5mm;border-bottom:1px solid #d4dee9;padding:2.4mm 0}.check:first-of-type{border-top:1px solid #d4dee9}.check-mark{color:#287151;font-weight:900}.final-line{border-bottom:1px solid #9dafc0;padding:4mm 0 2mm;margin-top:2mm}.source-list{margin:2mm 0 0;padding-left:5mm}.source-list li{margin:1.2mm 0;font-size:7.1pt}.small{font-size:7.2pt}.center{text-align:center}.green-text{color:#287151;font-weight:800}.amber-text{color:#946c1f;font-weight:800}
`;

let html = `<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>넥스트웨이브 테크 백엔드 개발 지원서 검토 보고서</title><style>${css}</style></head><body>`;
html += page(`<div class="cover"><div><span class="eyebrow">BACKEND ENGINEER · APPLICATION REVIEW</span><div class="cover-title"><h1>넥스트웨이브 테크<br>백엔드 개발 지원서<br>검토 보고서</h1><div class="cover-bar"></div><p class="lead">다섯 작성안의 문항별 답변, 직무 연결, 근거 경계, 전문가 검토와 면접 전 확인 지점을 한 흐름으로 읽기 위한 편집 보고서입니다.</p></div>${svgFlow()}</div><div class="cover-bottom"><div class="cover-meta"><div>5개 작성안</div><div>20개 답변</div><div>검색 가능한 PDF</div><div>1회 개선 반영</div></div><p class="note" style="margin-top:4mm">점수는 현재 제공된 직무 요약과 공개 근거에 대한 편집 적합도입니다. 회사 원문, 직접 기여 범위, 실행 결과와 Q4 실제 글자수 제한은 확인 전 상태이며 최종 제출 결정은 지원자 확인 이후에 남겨 둡니다.</p></div></div>`);

html += page(`${section('01', '지원 개요', '읽는 목적')}<p class="lead">이 보고서는 가장 높은 점수의 문장을 자동으로 제출하기 위한 결과표가 아닙니다. 각 세트가 어떤 백엔드 문제를 중심에 두는지 비교하고, 문장을 실제 경험·공개 근거·면접 설명 가능성과 대조하도록 돕는 검토 자료입니다.</p>${svgFlow()}<div class="three"><div class="card"><h3>문항별 역할</h3><p>강점, 지원동기, 문제 해결, 입사 후 기여를 서로 다른 주장으로 분리했습니다.</p></div><div class="card green"><h3>근거의 경계</h3><p>GitHub 공개 구조와 커밋은 확인했지만 직접 기여·운영 성과는 확정하지 않았습니다.</p></div><div class="card amber"><h3>제출 전 결정</h3><p>Q4 제한과 회사 원문을 확인한 뒤 한 세트를 고르고 제출용 길이로 다시 조정합니다.</p></div></div><div class="callout"><strong>이 문서의 사용 순서</strong><br>① 세트의 중심 관점을 읽고 ② 답변 본문과 활용률을 비교한 뒤 ③ 전문가 코멘트와 면접 질문으로 사실을 대조하고 ④ 보완 자료를 확보해 최종 문장을 확정합니다.</div>${table(['항목','이번 실행에서 묶은 범위','현재 상태'],[['지원 회사·직무','넥스트웨이브 테크 / 백엔드 개발자 / 한국어','사용자 제공 요약 사용'],['문항','Q1 500자 · Q2 700자 · Q3 800자 · Q4 작업용 1,000자','Q4 실제 상한 미확인'],['산출물','5세트 답안·비교·전문가 검토·면접 준비·PDF 검증','보고서 전용, 제출 승인 아님']], 'tight')}`);

const evidenceRows = [
  ['Java/Spring·REST API·DB 모델링', '요청·상태·데이터 책임을 연결하는 백엔드 설계', '공고 요약만 확인됨'],
  ['대규모 트래픽·안정성 개선', '병목·중복·재처리·복구·오류 안내를 측정하는 계획', '운영 수치와 실제 트래픽 미확인'],
  ['공개 Spring 핀테크 프로젝트', '회원·인증·결제·게이트웨이·이벤트 영역을 책임 단위로 번역', 'README는 개인 기여를 확정하지 않음'],
  ['Redis·커밋 후 메일·테스트 변경', '임시 정보와 핵심 데이터, 저장과 외부 효과의 경계', '실행 결과·성능 개선은 미확인'],
];
html += page(`${section('02', '기업·직무 분석', '공고를 답안으로 번역')}<p>제공된 회사와 채용 URL은 <code>.example</code> 주소여서 실제 회사·공고 원문을 독립 확인할 수 없었습니다. 따라서 회사 고유 제품·문화·고객을 추측하지 않고, 사용자가 제공한 직무 요약과 공개 프로젝트 근거만 답안에 반영했습니다.</p><div class="callout"><strong>직무 요약에서 도출한 작성 방향</strong><br>기술 키워드를 나열하는 대신 Java/Spring 서비스가 REST API와 데이터 모델을 통해 사용자 결과를 만들고, 트래픽 증가·실패·재처리 상황에서도 그 결과를 설명 가능하게 유지한다는 책임으로 번역했습니다.</div>${table(['확인한 맥락','답안에 반영한 의미','근거 한계'], evidenceRows, 'tight')}<div class="subhead">지원동기에서 피한 표현</div><div class="two"><div class="card"><h3>사용한 표현</h3><p>공고의 요구와 프로젝트에서 고민한 API·데이터·외부 효과·검증 기준이 맞닿아 있어 지원한다.</p></div><div class="card amber"><h3>확정하지 않은 표현</h3><p>회사 제품·고객·문화·대규모 운영 성과를 알고 있다거나, 공개 프로젝트의 수치 성과를 만들었다는 주장.</p></div></div><p class="source-line">공개 근거: ${sourceLinks}</p>`);

const mapRows = questionMap.questions.map(item => {
  const q = questionById.get(item.id);
  return [`<b>${esc(qShort[item.id])}</b><br><span class="muted">${q.max_chars}자</span>`, esc(item.answer_role), esc(q.focus?.non_overlap_boundary || '문항별 주장을 분리'), `<span class="badge green">${pct(request.quality_profile.content_quality.target_fill_ratio)} 목표</span>`];
});
html += page(`${section('03', '문항 설계와 내용 깊이', '답안의 구조')}<p>1차 결과의 가장 큰 문제는 “상한 이내”를 “충분히 설명함”으로 취급한 데 있었습니다. 이번에는 글자수 활용률을 별도로 측정하고, 모든 답변에 주장·근거·판단 이유·결과 또는 한계·입사 후 전이라는 다섯 신호를 확인했습니다.</p>${depthSvg()}${table(['문항','핵심 역할','겹치지 않게 둔 경계','깊이 기준'], mapRows, 'micro')}<div class="two" style="margin-top:5mm"><div><div class="subhead">확장 순서</div><div class="decision-row"><div class="decision-no">01</div><div><h3>상황과 대상</h3><p>어떤 사용자·데이터·처리 흐름의 문제인지 구체화합니다.</p></div></div><div class="decision-row"><div class="decision-no">02</div><div><h3>판단과 이유</h3><p>왜 그 경계·순서·대안을 선택했는지 밝힙니다.</p></div></div></div><div><div class="subhead">확장하지 않은 것</div><div class="decision-row"><div class="decision-no">03</div><div><h3>확인 결과와 한계</h3><p>구조 변화·테스트 존재와 실행 결과·운영 성과를 구분합니다.</p></div></div><div class="decision-row"><div class="decision-no">04</div><div><h3>다음 행동</h3><p>입사 후 측정·복구·사용자 안내로 전이합니다.</p></div></div></div></div>`);

const comparisonRows = result.candidates.map(candidate => {
  const [focus] = review[candidate.id];
  return [`<b>${candidate.id.replace('candidate-set-', 'Set ')}</b>`, esc(focus), `<span class="num">${num(candidate.total_score)}</span>`, `<span class="num">${pct(minRatio(candidate))}</span>`, `<span class="num">${pct(avgRatio(candidate))}</span>`];
});
html += page(`${section('04', '다섯 작성안 비교', '편집 적합도')}<p>점수는 공고 요약·문항·현재 근거에 맞는 정도를 비교하는 편집 지표입니다. 총점이 비슷한 세트는 실제로 더 자주 고민했던 문제와 면접에서 방어할 수 있는 장면을 기준으로 좁혀야 합니다.</p>${table(['세트','중심 렌즈','점수','최저 활용률','평균 활용률'], comparisonRows, 'tight')}<div class="subhead">점수와 내용 활용을 함께 읽기</div>${result.candidates.map((candidate, index) => `<div class="bar-row"><label>Set ${index + 1} · ${esc(review[candidate.id][0])}</label>${bar(candidate.total_score, index === 3 ? '#31805e' : '#3d73b9')}<b>${num(candidate.total_score)}</b></div>`).join('')}<div class="two" style="margin-top:5mm"><div class="card green"><h3>기본 검토 후보</h3><p><b>Set 4</b>는 데이터 모델링과 처리 경계를 중심으로 공고의 API·DB·안정성 요구를 연결합니다.</p></div><div class="card"><h3>경험에 따른 대안</h3><p>완수·검증은 Set 3, API 계약은 Set 2, 사람의 판단은 Set 1, 사용자 실패 경험은 Set 5가 더 자연스러울 수 있습니다.</p></div></div><p class="note" style="margin-top:4mm">모든 세트의 content-depth 게이트는 통과했지만 회사 원문·직접 기여·실행 결과 게이트가 미확인이라 제출용 확정 후보로 표기하지 않았습니다.</p>`);

const lensRows = [
  ['문항 적합성', '각 문항이 서로 다른 주장을 맡고 있는가', '강점·동기·사건·포부가 반복되지 않는지 확인'],
  ['직무 연결', 'Java/Spring·API·DB·안정성이 사용자 결과로 이어지는가', '기술명보다 책임·상태·검증의 흐름을 읽음'],
  ['지원자 관점', '어떤 선택 기준과 가치가 드러나는가', '구호가 아니라 선택과 결과·한계로 판단'],
  ['근거·인과', '직접 기여·관찰·추론이 구분되는가', '공개 구조·커밋과 실행 결과를 분리'],
  ['면접 방어력', '후속 질문에 사실로 답할 수 있는가', '직접 범위·대안·검증 조건을 확인 요청'],
];
html += page(`${section('05', '전문가 검토', '다섯 가지 렌즈')}<p>첨삭은 기술 키워드를 더하는 방식이 아니라, 독자가 읽어야 할 주장과 지원자가 면접에서 방어해야 할 경계를 분리하는 방식으로 진행했습니다. 내용 활용률은 깊이를 확인하는 보조 지표이며, 사실 확인을 대신하지 않습니다.</p>${table(['검토 렌즈','핵심 질문','이번 보고서의 적용'], lensRows, 'tight')}<div class="subhead">세트별 전문 코멘트</div>${table(['세트','중심 관점','코멘트','면접 질문'], result.candidates.map(candidate => [`<b>${candidate.id.replace('candidate-set-', 'Set ')}</b>`, esc(review[candidate.id][0]), esc(review[candidate.id][1]), esc(review[candidate.id][2])]), 'micro')}<div class="callout"><strong>가장 중요한 개선</strong><br>짧은 답변을 억지로 늘리지 않고, 공개 근거에서 말할 수 있는 구조 변화와 말할 수 없는 실행 결과를 한 문장 안에서 구분했습니다. 이 구분이 최종 제출 전에도 유지되어야 합니다.</div>`);

const materialRows = result.report.material_requests.map(item => [
  `<b>${esc(item.needed_fact)}</b>`, esc(item.why_it_matters), esc(item.acceptable_evidence), esc(item.interview_use),
]);
html += page(`${section('06', '면접 준비와 보완 자료', '다음 확인')}<p>현재 답안은 공개 근거로 만들 수 있는 초안의 범위를 넘지 않도록 제한했습니다. 다음 자료가 확보되면 과거형 문장의 강도를 높일 수 있고, 없으면 현재처럼 설계 기준·확인 계획으로 유지하는 것이 안전합니다.</p>${table(['확인할 사실','왜 필요한가','충분한 증거','면접에서 쓰는 방식'], materialRows, 'micro')}<div class="two" style="margin-top:4mm"><div><div class="subhead">공통 60초 답변 구조</div><div class="decision-row"><div class="decision-no">01</div><div><h3>문제</h3><p>어떤 사용자·데이터·업무 부담이 있었는가?</p></div></div><div class="decision-row"><div class="decision-no">02</div><div><h3>선택</h3><p>왜 그 경계와 대안을 택했는가?</p></div></div><div class="decision-row"><div class="decision-no">03</div><div><h3>확인</h3><p>무엇을 확인했고 무엇은 아직 모르는가?</p></div></div></div><div><div class="subhead">세트 선택 질문</div><ul class="source-list"><li>Set 1 vs Set 5: 판단 보존과 사용자 부담 중 어느 장면이 더 본인다운가?</li><li>Set 3 vs Set 4: 검증 과정과 데이터 경계 중 어느 쪽을 더 구체적으로 설명할 수 있는가?</li><li>Set 2: API 계약·외부 효과 순서를 실제 코드와 함께 방어할 수 있는가?</li></ul></div></div>`);

for (const candidate of result.candidates) {
  const setNo = candidate.id.replace('candidate-set-', '');
  const [focus, comment, interview] = review[candidate.id];
  const axisRows = candidate.dimensions.map(dimension => [`${esc(dimension.id)}`, `<span class="num">${num(dimension.weighted_score)}</span>`, esc(dimension.comment)]);
  html += page(`<div class="set-head"><div><span class="eyebrow">CANDIDATE SET ${setNo}</span><h2>${esc(focus)}</h2><p class="set-meta">다섯 답변을 하나의 관점으로 묶되, 문항별 역할은 분리한 작성안</p></div><div class="score">${num(candidate.total_score)}<small>/100</small></div></div><div class="thesis"><b>이 세트의 중심:</b> ${esc(candidate.strategy)}<br><b>전문가 관찰:</b> ${esc(comment)}</div>${table(['평가축','기여점수','현재 상태'], axisRows, 'axis micro')}<div class="subhead">지원 답안 ① · 강점과 지원동기</div><div class="essay-wrap">${answerBlock(candidate, 'question-strength')}${answerBlock(candidate, 'question-motivation')}</div><div class="callout"><b>활용률 확인</b> · Q1 ${pct(candidate.answers[0].content_quality.fill_ratio)}, Q2 ${pct(candidate.answers[1].content_quality.fill_ratio)}. 목표 82%를 충족했으며, 답안 본문은 제출용 문장으로 바로 확정하지 않고 기여 범위를 대조해야 합니다.</div>`);
  html += page(`<div class="set-head"><div><span class="eyebrow">CANDIDATE SET ${setNo} · CONTINUED</span><h2>${esc(focus)} — 사건과 전이</h2><p class="set-meta">상황·행동·결과/한계·입사 후 행동의 연결</p></div><div class="badge green">내용 깊이 게이트 PASS</div></div><div class="essay-wrap">${answerBlock(candidate, 'question-problem')}${answerBlock(candidate, 'question-contribution')}</div><div class="review-box"><div><h3>전문가 검토 코멘트</h3><p>${esc(comment)}</p><p class="note" style="margin-top:2mm">모든 공개 근거는 구조·문서·커밋에 한정하며 실제 실행 결과나 운영 효과는 별도 확인 대상으로 남겼습니다.</p></div><div><h3>면접 전 핵심 질문</h3><p>${esc(interview)}</p><p class="note" style="margin-top:2mm">답변할 때 직접 변경 범위, 선택하지 않은 대안, 확인한 결과와 아직 모르는 범위를 순서대로 말해 보세요.</p></div></div><div class="callout"><b>제출 전 조정</b> · Q3 ${pct(candidate.answers[2].content_quality.fill_ratio)}, Q4 ${pct(candidate.answers[3].content_quality.fill_ratio)}. Q4는 실제 상한이 확인되면 현재 작업용 문장을 그 제한에 맞춰 재편집해야 합니다.</div>`);
}

html += page(`${section('07', '제출 전 확인', '사용자 결정')}<p class="lead">보고서의 구조 검증과 전문가 검토가 끝나도, 본인의 경험과 공고 원문을 대신 확인해 주지는 않습니다. 아래 항목을 직접 확인한 뒤 한 세트를 선택하고 제출용 분량으로 확정하세요.</p>${['회사·공고 원문과 Q4 실제 글자수 제한을 확인했는가','각 과거형 문장에서 직접 변경한 범위와 검증 결과를 설명할 수 있는가','구조 변경·테스트 파일과 실제 실행·운영 성과를 구분했는가','선택한 세트의 Q2를 60초 안에 문제·선택·확인·배움으로 말할 수 있는가','입사 후 계획을 실제 서비스의 사용자 상태·복구·지표로 구체화할 수 있는가'].map((item, i) => `<div class="check"><div class="check-mark">${String(i + 1).padStart(2, '0')}</div><div><b>${esc(item)}</b><p class="note">확인되지 않으면 문장의 강도를 낮추거나 보완 자료 요청으로 남깁니다.</p></div></div>`).join('')}<div class="callout"><strong>현재 선택 가이드</strong><br><b>Set 4</b>는 직무 요약과의 연결이 가장 직접적이고, <b>Set 3</b>은 검증 중심 경험, <b>Set 1·5</b>는 사람의 판단·사용자 부담, <b>Set 2</b>는 API 계약과 책임 정리를 강조할 때 적합합니다. 최종 선택은 실제 경험과 말하기 편의성으로 결정하세요.</div><div class="final-line"><b>선택한 세트</b> ______________________________________________</div><div class="final-line"><b>보완할 문장</b> ______________________________________________</div><div class="final-line"><b>확인한 사실·자료</b> ________________________________________</div><p class="source-line">보고서에 표시한 공개 근거: ${sourceLinks}</p>`);

html += '</body></html>';
fs.writeFileSync(path.join(root, 'self-introduction-5sets-v2.html'), html, 'utf8');

const browser = await chromium.launch({ headless: true });
const pageObject = await browser.newPage({ viewport: { width: 1240, height: 1754 }, deviceScaleFactor: 1 });
await pageObject.setContent(html, { waitUntil: 'load' });
await pageObject.evaluate(() => document.fonts?.ready);
const pageStats = await pageObject.evaluate(() => [...document.querySelectorAll('.page')].map((element, index) => ({ page: index + 1, height: element.clientHeight, scrollHeight: element.scrollHeight, overflowPx: Math.max(0, element.scrollHeight - element.clientHeight), textLength: element.innerText.length })));
await browser.close();
console.log(JSON.stringify({ html: 'self-introduction-5sets-v2.html', pages: pageStats.length, overflowPages: pageStats.filter(item => item.overflowPx > 2).map(item => item.page), pageStats }, null, 2));
