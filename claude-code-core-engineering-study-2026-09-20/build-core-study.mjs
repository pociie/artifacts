import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { execFile as execFileCallback } from 'node:child_process'
import { promisify } from 'node:util'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'
import { analyzeCodebase } from './tools/typescript-architecture-metrics.mjs'

const execFile = promisify(execFileCallback)

const HERE = path.dirname(fileURLToPath(import.meta.url))
const STUDY = JSON.parse(await fs.readFile(path.join(HERE, 'study-config.json'), 'utf8'))
const SOURCE_ROOT = path.resolve(HERE, process.argv[2] ?? STUDY.defaultSourceRoot)
const SOURCE_DIR = path.join(SOURCE_ROOT, 'src')
const REPO = STUDY.repository
const COMMIT = STUDY.expectedRevision
const GH = `${REPO}/blob/${COMMIT}`
const CREATED = STUDY.created
const SNAPSHOT = `Claude Code v${STUDY.version} reconstructed source · core engineering study`

const esc = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')
const src = (file, line, label = file) => `<a href="${GH}/${file}${line ? `#L${String(line).replace('-', '-L')}` : ''}">${esc(label)}</a>`
const ext = (url, label) => `<a href="${url}">${esc(label)}</a>`
const p = (...xs) => `<p>${xs.join('')}</p>`
const ul = xs => `<ul>${xs.map(x => `<li>${x}</li>`).join('')}</ul>`
const ol = xs => `<ol>${xs.map(x => `<li>${x}</li>`).join('')}</ol>`
const code = (x, caption = '개념 모델') => `<figure class="code"><figcaption>${caption}</figcaption><pre>${esc(x)}</pre></figure>`
const callout = (title, body, tone = 'idea') => `<aside class="callout ${tone}"><b>${title}</b><div>${body}</div></aside>`
const table = (heads, rows, cls = '') => `<table class="${cls}"><thead><tr>${heads.map(x => `<th>${x}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map(x => `<td>${x}</td>`).join('')}</tr>`).join('')}</tbody></table>`
const cards = xs => `<div class="cards">${xs.map(x => `<article class="card"><small>${x[0]}</small><h3>${x[1]}</h3><div>${x[2]}</div></article>`).join('')}</div>`
const flow = xs => `<div class="flow">${xs.map((x, i) => `${i ? '<i>→</i>' : ''}<div><b>${x[0]}</b><span>${x[1]}</span></div>`).join('')}</div>`
const layers = xs => `<div class="layers">${xs.map((x, i) => `<div><em>${String(i + 1).padStart(2, '0')}</em><b>${x[0]}</b><span>${x[1]}</span></div>`).join('')}</div>`
const bars = xs => { const max = Math.max(...xs.map(x => x[1])); return `<div class="bars">${xs.map(x => `<div><b>${x[0]}</b><i><span style="width:${(x[1] / max * 100).toFixed(1)}%"></span></i><em>${x[1].toLocaleString()}</em></div>`).join('')}</div>` }
const refs = xs => `<footer class="refs"><b>코드 좌표</b>${xs.map(x => `<span>${x}</span>`).join('')}</footer>`
const verdict = (claim, consequence) => `<div class="verdict"><b>${claim}</b><span>${consequence}</span></div>`
const formula = x => `<div class="formula">${x}</div>`

function page(kicker, title, thesis, body, index) {
  return `<section class="sheet"><header><span>${kicker}</span><em>${String(index).padStart(2, '0')}</em></header><h2>${title}</h2><p class="thesis">${thesis}</p><main>${body}</main><div class="foot"><span>${SNAPSHOT}</span><span>${CREATED}</span></div></section>`
}

function cover(r) {
  return `<section class="sheet cover" style="--accent:${r.accent}"><header><span>CORE ENGINEERING STUDY</span><em>VOL. ${r.volume}</em></header><div class="mark">${r.symbol}</div><h1>${r.title}</h1><p>${r.subtitle}</p><div class="cover-claim">${r.claim}</div><div class="cover-meta"><div><small>대상</small><b>v2.1.88 / ${COMMIT.slice(0, 12)}</b></div><div><small>관점</small><b>${r.lens}</b></div></div><div class="warning">제3자 복원 소스에 대한 교육용 분석이다. 누락된 모듈과 복원 한계를 구현 사실로 보완하지 않는다.</div><div class="foot"><span>Core Study / revised edition</span><span>한국어</span></div></section>`
}

const CSS = String.raw`
@page{size:A4;margin:0}*{box-sizing:border-box}html,body{margin:0;background:#dfe4e7;color:#17222d;font-family:"Pretendard","Apple SD Gothic Neo","Noto Sans KR",sans-serif}.sheet{--accent:__ACCENT__;width:210mm;height:297mm;margin:0 auto;background:#fbfaf7;padding:16mm 17mm 15mm;position:relative;overflow:hidden;break-after:page}.sheet:after{content:"";position:absolute;left:0;right:0;bottom:0;height:4mm;background:linear-gradient(90deg,var(--accent),#172733 72%)}header{display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #c9d1d5;padding-bottom:3mm;font-size:7.5pt;letter-spacing:.14em;font-weight:800;color:var(--accent)}header em{font-style:normal;font:800 17pt ui-monospace,monospace;color:#a8b1b7}.sheet h2{font-size:22.5pt;line-height:1.17;letter-spacing:-.04em;margin:6mm 0 2.5mm}.thesis{font-size:11pt;line-height:1.58;color:#435463;margin:0 0 5mm;max-width:172mm}.sheet main{font-size:8.7pt;line-height:1.5}.sheet main p{margin:0 0 3mm}.sheet main h3{font-size:11pt;margin:3.5mm 0 1.5mm}.sheet main ul,.sheet main ol{padding-left:5mm;margin:2mm 0 3.5mm}.sheet main li{margin:1mm 0}.foot{position:absolute;left:17mm;right:17mm;bottom:6mm;display:flex;justify-content:space-between;font-size:6.8pt;color:#68747d}.cover{color:#f8fafb;background:radial-gradient(circle at 85% 18%,color-mix(in srgb,var(--accent) 70%,transparent),transparent 27%),linear-gradient(145deg,#0f1a23 0 58%,#1b2e3b 58% 100%);display:flex;flex-direction:column}.cover:after{height:8mm;background:var(--accent)}.cover header{color:#bdd0da;border-color:#4c6270}.cover header em{font:700 8pt sans-serif;color:#d4e1e7}.mark{margin-top:25mm;width:33mm;height:33mm;border:2px solid var(--accent);border-radius:50%;display:grid;place-items:center;color:var(--accent);font:900 21pt ui-monospace,monospace}.cover h1{font-size:31pt;line-height:1.1;letter-spacing:-.045em;margin:11mm 0 4mm;max-width:170mm}.cover>p{font-size:12pt;line-height:1.55;color:#d2dde3;max-width:160mm}.cover-claim{margin-top:9mm;border-left:4px solid var(--accent);padding:4mm 5mm;background:#ffffff0d;font-size:13pt;line-height:1.5;font-weight:750}.cover-meta{display:grid;grid-template-columns:1fr 1fr;gap:5mm;margin-top:auto}.cover-meta div{border-top:1px solid #536b79;padding:3.5mm}.cover-meta small,.cover-meta b{display:block}.cover-meta small{font-size:7pt;color:#91a8b5;margin-bottom:1mm}.cover-meta b{font-size:9.5pt}.warning{font-size:7.5pt;line-height:1.45;margin:7mm 0 8mm;color:#bdcbd3}.cover .foot{bottom:10mm;color:#b5c5ce}.cards{display:grid;grid-template-columns:1fr 1fr;gap:3.5mm;margin:3mm 0}.card{border:1px solid #ccd4d8;border-radius:2.5mm;background:#fff;padding:3.5mm}.card small{font-size:6.5pt;font-weight:800;letter-spacing:.12em;color:var(--accent)}.card h3{margin:1mm 0 1.5mm}.card p{font-size:8pt}.callout{border-left:3px solid var(--accent);background:#edf3f4;padding:3.5mm 4mm;margin:3.5mm 0}.callout>b{display:block;margin-bottom:1mm}.callout.risk{border-color:#bd4c43;background:#fff0ee}.callout.trade{border-color:#d4872e;background:#fff4e8}.callout.good{border-color:#258466;background:#edf7f2}.flow{display:flex;align-items:stretch;gap:1.5mm;margin:4mm 0}.flow>div{flex:1;min-width:0;border:1px solid #bdc8ce;border-radius:2mm;background:#fff;padding:3mm;text-align:center}.flow b,.flow span{display:block}.flow b{font-size:8pt}.flow span{font-size:6.7pt;color:#687680;margin-top:1mm}.flow i{font-style:normal;align-self:center;color:var(--accent);font-weight:900}.layers{margin:4mm 0}.layers>div{display:grid;grid-template-columns:9mm 40mm 1fr;gap:3mm;align-items:center;padding:2.5mm 3mm;border-bottom:1px solid #d3d9dc;background:#fff}.layers>div:first-child{border-top:3px solid var(--accent)}.layers em{font:700 8pt ui-monospace,monospace;color:var(--accent)}.layers b{font-size:8.5pt}.layers span{font-size:7.6pt;color:#52616d}.code{background:#111c25;color:#eaf1f4;border-radius:2mm;overflow:hidden;margin:3.5mm 0}.code figcaption{font-size:6.8pt;color:#a9c7d3;background:#213541;padding:1.8mm 3mm}.code pre{margin:0;padding:3.5mm;font:7.4pt/1.5 "SFMono-Regular",Consolas,monospace;white-space:pre-wrap}.verdict{display:grid;grid-template-columns:50mm 1fr;border-top:3px solid var(--accent);background:#fff;margin:4mm 0}.verdict b,.verdict span{padding:3mm}.verdict b{font-size:10pt;color:#253947}.verdict span{font-size:8pt;border-left:1px solid #d4dade}.formula{text-align:center;font:800 13pt/1.5 ui-monospace,monospace;padding:4mm;background:#eef2f3;border-radius:2mm;margin:4mm 0;color:#263b48}table{width:100%;table-layout:fixed;border-collapse:collapse;margin:3.5mm 0;font-size:7.4pt;line-height:1.37}th{background:#253b49;color:#fff;text-align:left;padding:2.1mm}td{padding:2mm;border:1px solid #d2d8dc;vertical-align:top;background:#fff}tr:nth-child(even) td{background:#f1f3f3}.bars{margin:4mm 0}.bars>div{display:grid;grid-template-columns:43mm 1fr 18mm;gap:2mm;align-items:center;margin:1.7mm 0}.bars b{font-size:7.3pt}.bars i{height:3.2mm;background:#e1e6e8;border-radius:3mm;overflow:hidden}.bars i span{display:block;height:100%;background:linear-gradient(90deg,var(--accent),#83b6c2)}.bars em{text-align:right;font:7pt ui-monospace,monospace;color:#576773}.refs{margin-top:4mm;padding-top:2.5mm;border-top:1px solid #cbd3d7;display:flex;gap:2mm;flex-wrap:wrap;font-size:6.7pt;color:#61717b}.refs b{color:#263a47}.refs span:not(:last-child):after{content:" ·"}a{color:#17627c;text-decoration:none;border-bottom:1px solid #a1bac4}.two{display:grid;grid-template-columns:1fr 1fr;gap:4mm}.three{display:grid;grid-template-columns:repeat(3,1fr);gap:3mm}.tag{display:inline-block;background:#dfeaec;color:#2b596a;border-radius:10mm;padding:.5mm 1.5mm;margin:.3mm;font-size:6.6pt;font-weight:700}.quote{border-left:5px solid var(--accent);padding:4mm 5mm;margin:5mm 0;font-size:13pt;line-height:1.45;font-weight:800;color:#263a47}.small{font-size:7.2pt}.muted{color:#687781}
`

async function analyzeCore() {
  return analyzeCodebase({ sourceRoot: SOURCE_ROOT, config: STUDY })
}

const reports = []

reports.push({
  volume: '00', slug: '00-core-product-model', symbol: 'CORE', accent: '#e5a63b',
  title: 'Claude Code의 핵심 제품 모델',
  subtitle: '파일·함수 목록이 아니라, 코드 변경을 성립시키는 책임과 불변조건으로 읽기',
  claim: '모델의 제안을 안전하고 복구 가능한 저장소 효과로 바꾸는 런타임이 이 프로젝트의 중심이다.',
  lens: '제품 본질 · 책임 · 불변조건',
  sections: [
    ['READ FIRST', '분석 대상을 먼저 제한한다', '이 보고서는 공개된 제3자 복원 저장소를 현재 구현의 완전한 원전으로 취급하지 않는다. 존재하는 코드가 보여 주는 설계 압력과 책임 배치를 학습 대상으로 삼는다.',
      callout('판단의 기준', 'README가 밝힌 v2.1.88 복원본이며 누락 모듈과 불완전한 빌드가 있다. 따라서 “왜 Anthropic이 그랬는가”가 아니라 “이 코드가 어떤 문제를 닫으려 하는가”를 말한다.', 'trade') +
      cards([
        ['포함', '핵심 실행 책임', p('컨텍스트 구성, 모델 turn, tool 효과, 권한, 세션 정합성, 복구.')],
        ['포함', '개발 압력', p('레이스·stale write·캐시·취소·호환성·관측 가능성.')],
        ['보조', 'UI와 generator', p('핵심 책임을 전달하고 관찰하게 하는 메커니즘으로만 다룬다.')],
        ['제외', '의도 추정', p('누락 파일의 내용을 만들어 내거나 조직의 실제 개발 프로세스를 단정하지 않는다.')],
      ]) + refs([src('README_KR.md', '1-62'), src('QUICKSTART.md', '1-86')])],

    ['CORE THESIS', '이 프로젝트는 “대화형 코드 변경 런타임”이다', '채팅은 입구다. 제품이 완성해야 하는 일은 불완전한 자연어 요구를 저장소 문맥에 결합하고, 모델의 행동 제안을 검증된 효과로 실행하며, 결과를 다음 추론과 재개 가능한 세션에 되돌리는 것이다.',
      formula('Context → Proposal → Authorized Effect → Observation → Reconciliation') +
      p('이 다섯 항 중 하나라도 빠지면 제품은 답변기는 될 수 있어도 코딩 에이전트가 되지 못한다. <b>Context</b>가 틀리면 엉뚱한 파일을 고치고, <b>Effect</b>가 통제되지 않으면 안전하지 않으며, <b>Reconciliation</b>이 없으면 다음 turn과 resume가 거짓 상태를 본다.') +
      verdict('핵심 단위는 “메시지”가 아니라 코드 변경 작업', '메시지·스트림·UI는 작업의 상태를 운반하는 표현이다. 설계 판단은 최종 저장소 효과와 그 정합성에서 역산해야 한다.')],

    ['CORE RUBRIC', '무엇이 핵심인지 판별하는 다섯 질문', '파일 수나 기술적 흥미가 아니라 제거했을 때 제품 약속이 무너지는지를 본다.',
      table(['판별 질문', '강한 신호', '이 프로젝트의 대표 위치'], [
        ['제품 필수성', '없으면 코드 이해·변경·검증이 성립하지 않음', 'context, query, Read/Edit/Bash'],
        ['상태 소유권', '다음 turn과 resume가 참조하는 정식 상태를 보유', 'QueryEngine, messages, sessionStorage'],
        ['효과 권한', '파일·프로세스·네트워크에 실제 변화를 발생', 'Tool.call, permission, sandbox'],
        ['실패 폐쇄성', '취소·fallback·부분 실행 후에도 protocol이 유효', 'tool pair repair, tombstone, terminal reason'],
        ['변경 결합도', '수정 시 prompt·policy·UI·persistence가 함께 움직임', 'Tool contract, query loop, REPL/SDK projection'],
      ]) + callout('rubric의 용도', '점수를 예쁘게 만들기 위한 표가 아니다. UI, MCP, plugin, generator 같은 요소를 제품 본질과 같은 층에 놓는 오류를 막는 필터다.')],

    ['RANKING', '핵심·필수 지지·확장 경계를 나눈다', '모든 기능이 중요하지만 같은 종류로 중요하지는 않다.',
      table(['등급', '책임', '판정'], [
        ['핵심', '컨텍스트/turn engine/tool effect/permission/session reconciliation', '코딩 작업의 의미와 안전성을 직접 소유'],
        ['필수 지지', 'REPL·SDK projection, model transport, observability, cost control', '핵심을 사용 가능하고 운영 가능하게 만듦'],
        ['능력 확장', 'MCP, plugin, skill, subagent, remote bridge', '핵심 계약 위에 새로운 공급자·도구·작업자를 얹음'],
        ['표현 메커니즘', 'React/Ink, async generator, Zod, AbortSignal', '책임을 구현하지만 그 자체가 제품 책임은 아님'],
      ]) + verdict('영상의 UI·generator 위치', '둘은 “큰 축의 일부”다. generator는 turn의 시간 구조를, React/Ink는 동일 상태의 대화형 projection을 구현한다.')],

    ['WORK EXAMPLE', '“함수 이름을 바꾸고 테스트하라”가 요구하는 것', '짧은 요청도 실제로는 읽기·판단·쓰기·검증·회복이 결합된 작업이다.',
      layers([
        ['작업 해석', '명령/skill/일반 prompt를 구분하고 현재 cwd·규칙·선택 영역을 결합한다.'],
        ['증거 수집', '검색과 읽기로 대상·호출자·테스트를 찾고 read state를 만든다.'],
        ['변경 제안', '모델이 Edit/Bash tool_use와 구조화된 입력을 생성한다.'],
        ['권한·정합성', 'schema, path, deny rule, read-before-write, stale-write를 검증한다.'],
        ['효과 실행', '파일을 수정하고 LSP·IDE·history·telemetry를 갱신한다.'],
        ['재검증·합류', '테스트 결과를 tool_result로 되돌리고 다음 turn 또는 terminal을 결정한다.'],
      ]) + callout('결정적인 코드', '핵심은 API를 한 번 호출하는 코드가 아니다. “변경 직전에도 읽었던 파일과 같은가”, “실행 결과가 같은 tool_use id로 돌아가는가”, “중간 취소 뒤 resume가 가능한가”를 닫는 코드다.', 'good')],

    ['OWNERSHIP', '정식 상태는 한 배열에만 있지 않다', '제품 상태는 서로 다른 수명과 신뢰 수준을 가진 여러 저장소에 분산된다. 이를 구분하지 않으면 UI state를 domain state로 오해한다.',
      table(['상태', '소유/수명', '지켜야 할 불변조건'], [
        ['conversation messages', 'turn·conversation', 'tool_use/result pairing, 순서, compact boundary'],
        ['ToolUseContext', 'turn과 하위 tool 실행', 'permission, abort, read cache, app state 접근'],
        ['readFileState', 'conversation', 'Edit 전 full read와 최신성 확인'],
        ['AppState/store', 'interactive session', 'permission mode, MCP pool, task/UI 상태'],
        ['transcript JSONL', 'process 밖의 durable session', 'append order, parent chain, flush/resume'],
        ['filesystem/process', '외부 세계', '부분 효과·사용자 동시 변경·subprocess 수명'],
      ]) + refs([src('src/QueryEngine.ts', '175-207'), src('src/Tool.ts', '123-220'), src('src/utils/sessionStorage.ts', '600-865')])],

    ['AUTHORITY', '모델 출력은 실행 권한이 아니라 제안이다', '모델은 tool 이름과 JSON 입력을 제안한다. 런타임은 존재 확인, schema parsing, 의미 검증, permission, hook, sandbox를 거친 뒤에만 효과를 허용한다.',
      flow([['tool_use', '비신뢰 제안'], ['schema', '모양 검증'], ['validate', '도메인 제약'], ['permission', '권한 결정'], ['call', '실제 효과'], ['tool_result', '관찰 환류']]) +
      p('이 경계는 단순 validation pipeline이 아니다. 실행 전에는 authority를 좁히고, 실행 후에는 결과를 모델이 이해할 protocol message로 변환한다. 따라서 Tool 계약은 모델 API, 보안, runtime, UI를 동시에 잇는 anti-corruption layer다.') +
      refs([src('src/services/tools/toolExecution.ts', '337-690'), src('src/Tool.ts', '362-700')])],

    ['TIME', '핵심 난점은 호출 순서보다 시간의 중첩이다', '모델 스트림, tool 실행, 사용자 추가 입력, hook, prefetch, transcript write가 동시에 진행된다.',
      cards([
        ['중첩', 'stream과 tool', p('tool_use block이 완성되면 모델 응답이 끝나기 전 실행을 시작할 수 있다.')],
        ['동시성', 'read 병렬·write 직렬', p('입력별 isConcurrencySafe 판정으로 순서를 보존한다.')],
        ['취소', 'cooperative abort', p('signal은 요청일 뿐 이미 발생한 외부 효과의 rollback은 아니다.')],
        ['내구성', 'write queue와 flush', p('화면의 완료와 디스크의 완료가 같은 순간이 아니다.')],
      ]) + callout('배경지식', '이 시스템은 synchronous call stack보다 <b>structured concurrency</b>, <b>optimistic concurrency control</b>, <b>saga/compensation</b> 관점으로 읽을 때 실패 경로가 보인다.')],

    ['INVARIANTS', '코드를 따라갈 때 먼저 적어야 할 불변조건', '흐름도보다 불변조건이 리팩터링과 오류 분석에 오래 남는다.',
      table(['영역', '대표 불변조건', '깨질 때 증상'], [
        ['protocol', '모든 tool_use에는 같은 id의 tool_result가 존재', '다음 API 요청 400, resume 단절'],
        ['file edit', '마지막 full read 이후 외부 변경이 없어야 함', '사용자 변경 덮어쓰기'],
        ['prompt cache', '캐시 prefix의 bytes/order가 안정', '비용·latency 급증'],
        ['stream fallback', '실패한 attempt의 partial message/effect가 재시도와 섞이지 않음', '중복 실행·orphan'],
        ['session', '사용자 입력은 응답 전 crash에도 복구 가능', 'resume에서 대화 없음'],
        ['projection', 'REPL·SDK가 같은 core event를 각 계약에 맞게 투영', '표시/저장/API 결과 불일치'],
      ])],

    ['DISTRIBUTION', '코드 분포는 기능 수가 아니라 위험의 위치를 보여 준다', '선택한 핵심 주변부만 보아도 shell 효과와 surface/session 쪽에 큰 코드량이 축적된다. 이는 “LLM 호출”보다 외부 세계와의 접점이 더 비싸다는 신호다.',
      bars([['interactive + SDK surfaces', 61458], ['shell effect tools', 39050], ['context + persistence', 22504], ['agent/task runtime', 18469], ['conversation engine', 17200], ['permission/security', 10540], ['coding file tools', 7924], ['tool runtime contract', 4497]]) +
      callout('해석 주의', '라인 수는 중요도 점수가 아니다. 다만 shell parsing·보안과 session/surface 정합성에 예외 처리와 호환성 코드가 집중되어 있음을 보여 주는 탐색 지표다.', 'trade')],

    ['PROGRAMMING', '언어 기능은 책임을 지키는 장치로 읽는다', '문법 이름을 외우는 대신 어떤 제품 불변조건을 값·타입·제어 흐름으로 옮겼는지 본다.',
      table(['표현', '여기서 맡은 역할', '핵심 연결'], [
        ['async generator', 'progressive event와 terminal reason을 한 실행에서 전달', 'turn engine / stream / tool progress'],
        ['discriminated union', 'message·permission·terminal의 가능한 상태를 닫음', 'exhaustive handling'],
        ['Zod schema', '모델 JSON을 runtime value로 승인', 'untrusted proposal → typed input'],
        ['AbortSignal', 'model/tool/hook에 취소를 전파', '부분 효과와 cleanup'],
        ['immutable clone', 'API cache용 원본과 observer용 표현을 분리', 'prompt caching'],
        ['using/dispose', 'generator의 모든 종료 경로에서 자원 정리', 'prefetch lifecycle'],
      ])],

    ['DESIGN', '프로젝트 구조의 실제 중심은 세 종류의 경계다', '디렉터리 명보다 값이 어디서 신뢰를 얻고 효과가 어디서 발생하는지가 중요하다.',
      layers([
        ['Representation boundary', '사용자 입력·메시지·tool schema·SDK event 사이의 변환'],
        ['Authority boundary', '모델 제안을 permission과 sandbox를 거친 실행으로 승격'],
        ['Durability boundary', '메모리 state를 transcript·filesystem·subprocess 상태와 합류'],
      ]) +
      p('UI, MCP, plugin, skill, subagent는 이 경계의 새 producer/consumer다. 따라서 확장 기능을 공부할 때도 “어느 경계를 통과하며 어떤 authority와 durability를 얻는가”를 먼저 묻는다.')],

    ['REFACTORING', '리팩터링 단위는 파일이 아니라 불변조건 묶음이다', '대형 파일을 작게 나누는 것만으로는 변경 결합이 줄지 않는다. 함께 변해야 하는 계약과 따로 변해야 하는 정책을 구분해야 한다.',
      table(['현재 결합', '분리 후보', '보존해야 할 것'], [
        ['query의 stream·recovery·tool orchestration', 'turn state machine + recovery policy', 'event 순서와 terminal semantics'],
        ['Tool의 execution·permission·React rendering', 'capability/effect/presentation facets', 'tool identity와 schema 일관성'],
        ['REPL과 QueryEngine의 lifecycle 중복', 'headless core + UI/SDK adapters', 'interactive latency와 resume semantics'],
        ['session append·projection·resume repair', 'journal writer + projection/rebuilder', 'parent chain과 compact/snip semantics'],
        ['prompt 조립과 cache 규칙', 'context compiler + cache-key contract', 'byte/order stability'],
      ]) + callout('금지할 단순화', '“클린 아키텍처로 다시 짠다”는 목표만으로는 부족하다. 이 코드의 복잡도는 외부 effect·stream·compatibility에서 발생하므로, 경계를 옮길 때 먼저 동작 동등성 oracle이 필요하다.', 'risk')],

    ['OPERATIONS', '운영 노력도 코어 코드 안에 들어와 있다', 'feature gate, telemetry, checkpoint, cost/budget, provider compatibility는 배포 후 학습과 안전한 롤아웃을 위한 제품 메커니즘이다.',
      cards([
        ['관측', 'turn·stream·tool 지표', p('request id와 query chain을 결합해 failure funnel을 복원한다.')],
        ['롤아웃', 'feature()와 dynamic import', p('코드 제거·실험군·kill switch가 구조 자체에 영향을 준다.')],
        ['경제성', 'prompt cache·compact', p('token 비용과 latency가 데이터 구조/정렬 순서를 결정한다.')],
        ['호환성', 'provider·Node·Windows·legacy alias', p('동일 core contract를 서로 다른 runtime에 투영한다.')],
      ]) + refs([src('src/services/api/claude.ts', '1118-1495'), src('src/query.ts', '337-365'), src('src/tools.ts', '329-367')])],

    ['VIDEOS', 'UI와 generator를 올바른 위치에 놓는다', '두 영상은 구현 메커니즘을 이해하는 좋은 렌즈지만 전체 제품 모델을 대신하지 않는다.',
      table(['영상 렌즈', '이 보고서에서의 위치', '더 큰 질문'], [
        [ext('https://www.youtube.com/watch?v=3ZnBDXQQN_E', 'async generator'), 'turn의 progressive observation과 suspension', 'fallback·tool effect·abort 뒤에도 protocol이 유효한가?'],
        [ext('https://www.youtube.com/watch?v=W83jWFwEnTU&t=61s', 'React/Ink UI'), 'interactive projection과 input coordination', '정식 상태와 화면 state가 어긋날 때 누가 합류시키는가?'],
      ]) + callout('적용 원칙', '영상과 같은 맥락의 설명은 해당 메커니즘이 핵심 책임을 어떻게 보존하는지 설명할 때 사용한다. 별도 “기술 소개” 장으로 분리하지 않는다.')],

    ['READING METHOD', '한 vertical slice를 끝까지 읽는다', '추천 단위는 “prompt 입력”도 “파일 한 개”도 아니다. 하나의 repository effect가 제안되고 확정되며 저장·복구되는 전 구간이다.',
      ol([
        '<b>Edit</b>를 고른다: schema와 prompt가 모델에게 무엇을 허용하는지 본다.',
        '<b>validate/checkPermissions</b>에서 read-before-write, deny rule, path normalization을 추적한다.',
        '<b>call</b>에서 critical section, patch, LSP/IDE/history 갱신을 본다.',
        '<b>tool_result</b>가 query state와 다음 API 요청에 어떻게 합류하는지 본다.',
        '<b>abort/fallback/resume</b>에서 같은 effect가 중복되거나 사라지지 않는지 반례를 만든다.',
        '<b>REPL/SDK</b>가 동일 사건을 어떻게 다르게 보여 주는지 비교한다.',
      ]) + verdict('완료 조건', '함수 호출 순서를 말하는 것이 아니라, 어떤 state와 authority가 이동했고 어떤 불변조건이 각 경계에서 보존되었는지 설명할 수 있어야 한다.')],

    ['BACKGROUND', '함께 공부해야 할 배경지식', '프로젝트의 복잡도를 일반화하려면 인접 개념을 코드와 직접 연결해야 한다.',
      table(['배경지식', '연결되는 문제', '주의점'], [
        ['effect system / capability security', 'Tool이 허용 가능한 효과를 기술', 'TypeScript 타입만으로 OS 권한을 보장하지 않음'],
        ['optimistic concurrency control', 'FileEdit stale-write 방지', 'mtime 검사는 완전한 filesystem transaction이 아님'],
        ['event sourcing / projections', 'transcript와 REPL/SDK view', '모든 message가 순수 domain event인 것은 아님'],
        ['structured concurrency', 'stream·tool·prefetch·abort 수명', 'AbortSignal은 자동 join/rollback을 제공하지 않음'],
        ['product-line architecture', 'feature gate와 build-time DCE', 'flag가 module boundary를 대신하면 결합이 커짐'],
        ['cache-key design', 'system prompt와 tool ordering', 'semantic 동일성과 byte 동일성이 다름'],
      ])],

    ['CONCLUSION', '이후 권들의 질문', '다음 보고서들은 관심사 목록이 아니라 이 제품 모델의 네 가지 결정적 문제를 각각 깊게 판다.',
      cards([
        ['VOL. 01', '문맥을 프로그램으로 만드는 법', p('prompt·schema·history·compact·cache가 하나의 실행 입력을 구성한다.')],
        ['VOL. 02', '제안을 코드 효과로 바꾸는 법', p('Read/Edit/Bash, validation, permission, concurrency, partial effect.')],
        ['VOL. 03', 'turn을 복구 가능한 거래로 닫는 법', p('stream, fallback, terminal, transcript, resume, UI/SDK projection.')],
        ['VOL. 04', '구조를 진화시키는 법', p('QueryEngine 추출, Tool 분해, feature variability, 운영과 리팩터링 순서.')],
      ]) + callout('핵심 질문', '“무슨 파일이 호출되는가?”보다 “모델이 제안한 변경이 언제 신뢰를 얻고, 어떤 외부 효과가 되었으며, 실패 뒤 무엇을 진실로 남기는가?”를 묻는다.', 'good')],
  ],
})

function documentHtml(report) {
  const sheets = [
    cover(report),
    ...report.sections.map((section, index) => page(section[0], section[1], section[2], section[3], index + 1)),
  ]
  return `<!doctype html>
<html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(report.title)}</title><style>${CSS.replaceAll('__ACCENT__', report.accent)}</style></head>
<body>${sheets.join('\n')}</body></html>`
}

async function verifySourceRevision() {
  const stat = await fs.stat(SOURCE_DIR)
  if (!stat.isDirectory()) throw new Error(`Source directory is not a directory: ${SOURCE_DIR}`)
  const { stdout } = await execFile('git', ['-C', SOURCE_ROOT, 'rev-parse', 'HEAD'])
  const revision = stdout.trim()
  if (revision !== COMMIT) {
    throw new Error(`Source revision mismatch: expected ${COMMIT}, got ${revision}`)
  }
  return revision
}

async function verifySourceLinks(html, reportName) {
  const prefix = `${GH}/`
  const hrefs = [...html.matchAll(/href="([^"]+)"/g)].map(match => match[1])
  const sourceLinks = [...new Set(hrefs.filter(href => href.startsWith(prefix)))]
  const failures = []

  for (const href of sourceLinks) {
    const relativeWithAnchor = href.slice(prefix.length)
    const [relativePath, anchor = ''] = relativeWithAnchor.split('#')
    const localPath = path.join(SOURCE_ROOT, decodeURIComponent(relativePath))
    try {
      const stat = await fs.stat(localPath)
      if (!stat.isFile()) failures.push(`${relativePath}: not a file`)
      if (anchor) {
        const match = anchor.match(/^L(\d+)(?:-L(\d+))?$/)
        if (!match) {
          failures.push(`${relativePath}#${anchor}: malformed line anchor`)
        } else {
          const lineCount = (await fs.readFile(localPath, 'utf8')).split('\n').length
          const lastLine = Number(match[2] ?? match[1])
          if (lastLine > lineCount) failures.push(`${relativePath}#${anchor}: file has ${lineCount} lines`)
        }
      }
    } catch (error) {
      failures.push(`${relativePath}: ${error.code ?? error.message}`)
    }
  }

  if (failures.length) {
    throw new Error(`Invalid source links in ${reportName}:\n${failures.join('\n')}`)
  }
  return sourceLinks.length
}

async function writeReadme(manifest, metrics) {
  const reportLines = manifest.reports.map(report =>
    `- [${report.file}](./${report.file}) — ${report.title} (${report.pages}쪽)`,
  ).join('\n')

  const text = `# Claude Code 핵심 엔지니어링 스터디

이 개정판은 기능 목록이나 탐색 증거를 중심에 놓지 않는다. 저장소가 실제로 해결해야 하는 핵심 개발 문제를 다음 네 축으로 재구성한다.

1. 문맥을 모델 요청으로 컴파일하는 과정
2. 모델 제안을 권한 있는 저장소 효과로 바꾸는 tool runtime
3. streaming·중단·복구·resume를 포함해 한 turn을 정합적으로 닫는 conversation transaction
4. 이 의미를 보존하면서 구조를 진화시키는 refactoring 및 운영 방법

UI와 async generator는 독립적인 중심 주제가 아니라, 이 네 축에서 상태를 투영하고 시간 순서를 표현하는 구현 메커니즘으로 다룬다.

## PDF

${reportLines}

총 ${manifest.totalPages}쪽이다. 모든 코드 링크는 clone의 고정 revision \`${manifest.revision}\`을 가리킨다.

## 분석 원본

- clone: \`${manifest.sourceRoot}\`
- upstream: ${REPO}
- version 표기: v${STUDY.version}
- 성격: 제3자 복원/교육용 저장소. README가 밝힌 누락 모듈과 불완전한 빌드 한계를 유지한다.

## 재현

\`build-core-study.mjs\`는 이 보고서 세트의 서술과 레이아웃을 생성한다. 소스 계측은 별도의 범용 도구로 분리했다.

\`\`\`sh
node tools/typescript-architecture-metrics.mjs \\
  --source ../../sources/stupidhumans/claude-code-source-code \\
  --config study-config.json \\
  --output metrics/core-architecture-metrics.json

node build-core-study.mjs
\`\`\`

\`typescript-architecture-metrics.mjs\`에는 이 저장소의 이름·경로·분류가 하드코딩되어 있지 않다. source root와 JSON 규칙을 입력받아 다른 TypeScript/TSX 코드베이스에도 재사용할 수 있다. 이 프로젝트에만 해당하는 책임 분류와 검색어는 \`study-config.json\`에 선언한다.

## 계측 요약

- TypeScript/TSX 파일: ${metrics.total.files.toLocaleString()}개
- 물리 줄 수: ${metrics.total.lines.toLocaleString()}줄
- async function: ${metrics.syntax.asyncFunctions.toLocaleString()}개
- generator / async generator: ${metrics.syntax.generators.toLocaleString()} / ${metrics.syntax.asyncGenerators.toLocaleString()}개
- await / yield: ${metrics.syntax.awaitExpressions.toLocaleString()} / ${metrics.syntax.yieldExpressions.toLocaleString()}개

## 검증 범위

- clone revision 일치 확인
- 보고서 내부 source link의 파일 존재 및 line anchor 범위 확인
- 각 HTML sheet의 수직 overflow 검사
- Chromium PDF 렌더링 및 PDF header 확인
- cover preview 이미지 생성

분석 수치는 lexical/AST 계측 결과이지 제품 활성 기능 수나 조직적 중요도의 직접 척도가 아니다.
`
  await fs.writeFile(path.join(HERE, 'README.md'), text)
}

async function buildAll() {
  const revision = await verifySourceRevision()
  const htmlDir = path.join(HERE, 'html')
  const metricsDir = path.join(HERE, 'metrics')
  const previewDir = path.join(HERE, 'previews')
  await Promise.all([
    fs.mkdir(htmlDir, { recursive: true }),
    fs.mkdir(metricsDir, { recursive: true }),
    fs.mkdir(previewDir, { recursive: true }),
  ])

  const metrics = await analyzeCore()
  await fs.writeFile(
    path.join(metricsDir, 'core-architecture-metrics.json'),
    `${JSON.stringify({ ...metrics, sourceRevision: revision }, null, 2)}\n`,
  )

  const browser = await chromium.launch({ headless: true })
  const browserContext = await browser.newContext()
  const manifestReports = []

  try {
    for (const report of reports) {
      const html = documentHtml(report)
      const htmlFile = path.join(htmlDir, `${report.slug}.html`)
      const pdfFile = path.join(HERE, `${report.slug}.pdf`)
      const sourceLinks = await verifySourceLinks(html, report.slug)
      await fs.writeFile(htmlFile, html)

      const browserPage = await browserContext.newPage({ viewport: { width: 1280, height: 1600 }, deviceScaleFactor: 1 })
      await browserPage.goto(`file://${htmlFile}`, { waitUntil: 'networkidle' })
      await browserPage.emulateMedia({ media: 'print' })
      const overflow = await browserPage.$$eval('.sheet', sheets => sheets.map((sheet, index) => ({
        index,
        overflow: Math.max(0, sheet.scrollHeight - sheet.clientHeight),
        scrollHeight: sheet.scrollHeight,
        clientHeight: sheet.clientHeight,
      })).filter(item => item.overflow > 1))
      if (overflow.length) throw new Error(`Page overflow in ${report.slug}: ${JSON.stringify(overflow)}`)

      await browserPage.pdf({ path: pdfFile, format: 'A4', printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } })
      await browserPage.locator('.sheet').first().screenshot({ path: path.join(previewDir, `${report.slug}.png`) })
      await browserPage.close()

      const pdfHeader = (await fs.readFile(pdfFile)).subarray(0, 5).toString('ascii')
      if (pdfHeader !== '%PDF-') throw new Error(`Invalid PDF header: ${pdfFile}`)
      manifestReports.push({
        volume: report.volume,
        title: report.title,
        file: path.basename(pdfFile),
        pages: report.sections.length + 1,
        sourceLinks,
      })
    }
  } finally {
    await browserContext.close()
    await browser.close()
  }

  const manifest = {
    generatedAt: new Date().toISOString(),
    sourceRoot: SOURCE_ROOT,
    repository: REPO,
    revision,
    reports: manifestReports,
    totalPages: manifestReports.reduce((sum, report) => sum + report.pages, 0),
  }
  await fs.writeFile(path.join(HERE, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`)
  await writeReadme(manifest, metrics)
  process.stdout.write(`${JSON.stringify(manifest, null, 2)}\n`)
}

reports.push({
  volume: '01', slug: '01-context-as-program', symbol: 'CTX', accent: '#6d63c7',
  title: '문맥을 프로그램으로 만드는 법',
  subtitle: 'prompt·tool schema·history·memory·compact·cache가 하나의 실행 입력을 구성하는 방식',
  claim: '모델 품질은 호출 함수보다 모델이 실제로 보게 되는 문맥의 구조·순서·보존 규칙에서 결정된다.',
  lens: 'context compiler · cache · history',
  sections: [
    ['THESIS', 'context는 문자열이 아니라 컴파일 결과다', '최종 API 입력은 사용자 prompt 하나가 아니다. system policy, 환경, 도구 schema, 대화 이력, attachment, memory, compact projection을 규칙에 따라 조립한 값이다.',
      code(`ContextProgram = compile({
  policy, environment, tools,
  conversation, attachments, memory,
  modelCapabilities, tokenBudget
})`, '개념 모델 — 실제 타입 복사 아님') +
      p('따라서 prompt engineering만 보면 핵심을 놓친다. 무엇을 포함하고 제외하는지, 어떤 순서가 cache key를 만드는지, 어떤 메시지가 UI에는 보이지만 API에는 제거되는지가 더 결정적이다.')],

    ['INPUT CONTRACT', '입력은 곧바로 모델에 가지 않는다', 'processUserInput은 string과 content block을 정상화하고 slash command, image, IDE selection, attachment, hook을 구분한 뒤 shouldQuery와 추가 허용 도구를 함께 반환한다.',
      flow([['raw input', 'text/image/remote'], ['normalize', 'resize·metadata'], ['local semantics', 'slash/skill/bash'], ['hooks', 'block/context'], ['messages', 'model-visible state'], ['shouldQuery', 'local or model']]) +
      p('여기서 중요한 설계는 “입력 텍스트”와 “turn 실행 여부”를 분리한 것이다. `/help` 같은 local command는 conversation에 흔적을 남길 수 있지만 model call은 만들지 않는다. 반대로 hook의 additional context는 사용자 입력이 아니어도 model-visible message가 된다.') +
      refs([src('src/utils/processUserInput/processUserInput.ts', '64-140'), src('src/utils/processUserInput/processUserInput.ts', '141-269')])],

    ['PROVENANCE', '같은 문자열도 출처에 따라 권한이 다르다', 'user text, system policy, hook output, skill content, tool result, memory는 모두 model context가 될 수 있지만 신뢰 수준과 수명은 다르다.',
      table(['출처', '모델에 주는 역할', '필요한 제약'], [
        ['system prompt', '행동 정책·도구 사용법', 'cache 안정성, build별 차이'],
        ['user prompt', '현재 목표', '명령/붙여넣기/원격 입력 구분'],
        ['repository memory', '프로젝트 규칙과 맥락', '경로·중복·freshness'],
        ['hook context', '조직/로컬 자동화 결과', '길이 제한, block 의미'],
        ['tool result', '외부 세계 관찰', 'tool_use id, size, error 표현'],
        ['synthetic/meta message', 'runtime 제어 힌트', 'UI visibility와 API visibility 분리'],
      ]) + callout('보안 연결', 'context에 들어갔다고 authority가 생긴 것은 아니다. untrusted repository text나 tool output은 모델 행동에 영향을 줄 수 있으므로, 실제 effect는 별도의 permission boundary에서 다시 매개해야 한다.', 'risk')],

    ['PROMPT ASSEMBLY', 'system prompt는 정적 템플릿이 아니다', '모델, 활성 도구, 추가 작업 디렉터리, MCP, memory, 사용자 지정 prompt에 따라 섹션이 선택되고 결합된다.',
      layers([
        ['기본 행동 계약', 'task 수행, 도구 사용, 응답 방식'],
        ['session guidance', '현재 모드·환경·사용자 설정'],
        ['memory', 'CLAUDE.md/MEMORY 계열 지식'],
        ['tool-specific guidance', '활성 도구의 prompt와 capability'],
        ['environment', 'cwd, platform, shell, repository 상태'],
        ['append/custom prompt', 'SDK caller의 교체 또는 추가 정책'],
      ]) +
      p('custom system prompt는 기본 prompt를 보완하는 것이 아니라 대체할 수 있다. 이 차이는 systemContext 포함 여부까지 바꾸므로, “문자열 concatenate”가 아니라 구성 정책이다.') + refs([src('src/constants/prompts.ts', '444-576'), src('src/utils/queryContext.ts', '30-74')])],

    ['TOOLS AS CONTEXT', '도구 목록은 실행 registry이면서 모델의 프로그래밍 언어다', '모델은 tool name, description, JSON schema를 보고 행동 표현을 생성한다. 도구 순서와 schema 존재 여부가 모델 출력과 prompt cache를 동시에 바꾼다.',
      cards([
        ['의미', 'capability vocabulary', p('Read/Edit/Bash 같은 동사가 모델의 행동 언어가 된다.')],
        ['형식', 'JSON schema', p('자유 텍스트 의도를 runtime이 검증할 구조로 제한한다.')],
        ['비용', 'token footprint', p('도구 수와 설명 길이가 매 요청 context 비용이 된다.')],
        ['캐시', 'stable prefix', p('built-in과 MCP 정렬·경계가 cache reuse를 좌우한다.')],
      ]) + refs([src('src/tools.ts', '185-250'), src('src/tools.ts', '329-367'), src('src/services/api/claude.ts', '1118-1257')])],

    ['DYNAMIC TOOL SET', '활성 tool pool은 permission과 런타임 상태의 함수다', 'registry에 존재한다고 모델에게 항상 노출되는 것은 아니다. mode, environment, deny rule, MCP connection, ToolSearch discovery가 pool을 바꾼다.',
      formula('VisibleTools = filter(mode, env, denyRules, MCP, discovery, modelSupport)') +
      p('여기서 두 종류의 차단을 구분한다. <b>노출 전 filtering</b>은 모델이 capability를 계획하지 못하게 하고, <b>dispatch-time permission</b>은 실제 입력을 보고 실행을 막는다. 전자만으로 complete mediation이 되지 않으며 후자는 매 호출마다 필요하다.') +
      refs([src('src/tools.ts', '253-327'), src('src/services/tools/toolExecution.ts', '599-780')])],

    ['MESSAGE ALGEBRA', 'conversation은 문자열 배열이 아니다', 'assistant, user, attachment, progress, system, tombstone, stream_event는 API·UI·transcript에서 서로 다른 운명을 가진다.',
      table(['종류', '핵심 의미', 'projection 차이'], [
        ['assistant', 'model output와 tool_use', 'SDK event, transcript, 다음 API 모두 관여'],
        ['user/tool_result', '사용자 목표 또는 effect 관찰', 'tool_result pairing이 protocol 불변조건'],
        ['attachment', '파일 변화·hook·queue·memory 등 부가 문맥', '일부는 API normalize 시 user content로 변환'],
        ['progress', '장기 effect의 중간 관찰', 'UI에는 중요하지만 최종 reasoning에는 축약 가능'],
        ['tombstone', '실패 attempt의 기존 projection 제거', '새 데이터가 아니라 삭제 제어 신호'],
        ['system boundary', 'compact/snip/retry 같은 runtime 사건', 'resume와 SDK에서 선택적으로 노출'],
      ]) + callout('복원 한계', '<code>src/types/message.ts</code>는 이 복원본에서 누락됐다. 이 분류는 import/use site에서 확인한 동작 대수이며 원문 타입 선언을 복원한 것이 아니다.', 'trade')],

    ['NORMALIZATION', '한 상태에서 여러 표현을 만든다', '내부 Message를 API parameter, SDKMessage, terminal UI row, JSONL transcript로 그대로 복사하지 않는다. 소비자 계약에 맞는 projection이 필요하다.',
      code(`internal message
  ├─ normalizeMessagesForAPI() → provider protocol
  ├─ normalizeMessage()        → SDK event
  ├─ Messages/Tool UI          → terminal projection
  └─ recordTranscript()        → durable JSONL`, '하나의 사건, 여러 projection') +
      p('이 구조의 위험은 projection drift다. 한 새 message variant를 추가했는데 API normalizer만 수정하면 UI나 resume가 침묵할 수 있다. union exhaustiveness와 contract test가 필요한 이유다.') + refs([src('src/utils/messages.ts', '1-160'), src('src/QueryEngine.ts', '757-930')])],

    ['READ STATE', '읽기는 정보 획득이자 쓰기 권한의 전제다', 'FileReadTool은 결과를 보여 주는 데서 끝나지 않고 file path, content, timestamp, partial-view 여부를 readFileState에 남긴다. Edit는 이 state를 optimistic lock처럼 사용한다.',
      verdict('Read-before-write는 prompt 지시가 아니다', 'Edit.validateInput과 call이 runtime에서 강제한다. 모델이 “읽었다”고 말하는 것과 readFileState에 full read가 존재하는 것은 다르다.') +
      p('이 연결 때문에 context와 effect가 분리되어도 완전히 독립적이지 않다. 관찰의 freshness가 후속 효과의 admissibility를 결정한다. partial read는 내용 일부만 알기 때문에 전체 파일 edit의 전제로 인정되지 않는다.') +
      refs([src('src/tools/FileReadTool/FileReadTool.ts', '337-560'), src('src/tools/FileEditTool/FileEditTool.ts', '275-310')])],

    ['RESULT BUDGET', 'tool output은 무한히 context에 남을 수 없다', '검색·shell·MCP 결과가 커질수록 다음 model call의 비용과 한계가 급격히 커진다. tool별 maxResultSizeChars와 context replacement가 이를 제어한다.',
      table(['전략', '무엇을 보존', '잃을 수 있는 것'], [
        ['tool 자체 제한', '가장 관련 있는 줄/페이지', '전체 원문'],
        ['disk persistence + preview', '추후 Read 가능한 경로와 요약', '즉시 context의 세부'],
        ['tool result budget', '최근/필수 결과', '오래된 대용량 출력'],
        ['microcompact/snip', 'tool id와 경계 정보', '원래 result 내용'],
        ['semantic summary', '과업 진행에 필요한 의미', '정확한 재현성'],
      ]) + callout('설계 trade-off', 'context 절약은 단순 truncation이 아니다. 이후 모델이 어떤 증거를 다시 읽을 수 있는지와 resume가 동일 projection을 재구성할 수 있는지를 함께 설계해야 한다.', 'trade')],

    ['COMPACTION', '압축은 하나의 기능이 아니라 계층화된 정책이다', 'query loop는 tool-result budget, snip, microcompact, context collapse, autocompact를 서로 다른 시점과 의미로 적용한다.',
      layers([
        ['result budget', '개별 대용량 결과를 교체하고 필요하면 record를 저장'],
        ['snip', '특정 history 구간을 제거하고 boundary를 남김'],
        ['microcompact', 'tool 결과를 id 중심으로 줄임'],
        ['context collapse', 'full history 위에 read-time projection/commit log를 적용'],
        ['autocompact', 'summary message와 attachment로 새 context window 생성'],
      ]) + p('순서에는 의미가 있다. 예를 들어 snip에서 확보한 token은 autocompact threshold 판단에 반영되어야 하고, collapse가 충분하면 더 손실이 큰 summary를 피할 수 있다.') + refs([src('src/query.ts', '365-543')])],

    ['CACHE KEY', 'prompt cache는 의미가 아니라 bytes와 순서를 본다', '동일한 도구 집합도 순서가 달라지면 server-side prefix cache가 깨질 수 있다. 이 때문에 built-in tool을 안정된 prefix로 정렬하고 MCP tool을 뒤에 둔다.',
      code(`stable prefix:
[system sections][built-in tool schemas][cache breakpoint]
dynamic suffix:
[MCP tools][advisor/feature-specific additions][messages]`, 'cache-aware request layout') +
      p('이 설계는 데이터 구조 선택을 바꾼다. 관찰용 backfill을 원본 assistant message에 직접 쓰지 않고 clone하는 이유도 다음 request의 byte identity를 보존하기 위해서다.') + refs([src('src/tools.ts', '345-366'), src('src/query.ts', '742-787'), src('src/services/api/claude.ts', '1387-1495')])],

    ['DEFERRED TOOLS', '도구 발견은 context footprint를 줄이는 paging이다', 'deferred tool은 첫 요청에 전체 schema를 싣지 않고 ToolSearch 결과가 history에 나타난 뒤에만 포함된다.',
      flow([['large pool', 'MCP/LSP 포함'], ['defer', 'schema 제외'], ['ToolSearch', '이름 발견'], ['history', 'tool_reference'], ['next request', 'schema 포함']]) +
      p('이 최적화는 새 실패 모드를 만든다. schema가 전달되지 않은 상태에서 모델이 typed parameter를 문자열로 만들 수 있고, dispatch parser가 이를 거부한다. 그래서 error가 단순 Zod 메시지가 아니라 “먼저 tool을 load하라”는 복구 protocol을 포함한다.') + refs([src('src/services/api/claude.ts', '1118-1257'), src('src/services/tools/toolExecution.ts', '578-644')])],

    ['MUTATION RULE', '원본과 관찰용 표현을 분리한다', '같은 tool input이라도 API 재전송, hook 관찰, SDK stream, transcript에서 필요한 필드가 다르다.',
      table(['값', '허용되는 변환', '이유'], [
        ['API-bound assistant message', '가급적 원본 유지', 'prompt cache와 signed thinking block 보존'],
        ['observer/tool input clone', 'legacy·derived 필드 backfill', 'hook/SDK 호환성'],
        ['permission-updated input', '정책이 승인한 새 값 사용', '사용자/자동화 결정 반영'],
        ['tool.call input', 'schema parse 결과와 명시적 update만', '관찰 편의 mutation이 실제 effect를 바꾸지 않게 함'],
      ]) + callout('배경지식', '이는 immutability 취향이 아니라 <b>representation ownership</b> 문제다. 어느 consumer가 어떤 모양의 값을 소유하는지 불명확하면 cache, transcript hash, hook semantics가 함께 깨진다.') + refs([src('src/query.ts', '742-787'), src('src/services/tools/toolExecution.ts', '690-780')])],

    ['FAILURE CASES', 'context 오류는 늦게 나타난다', '문맥 구성 버그는 즉시 exception보다 다음 request, resume, provider 전환에서 드러나는 경우가 많다.',
      table(['오류', '지연된 증상', '설계 대응'], [
        ['orphan tool_result', '다음 API call 400', 'pair repair 또는 synthetic result'],
        ['stale tool-search field', '다른 모델/provider에서 400', 'model-specific post-processing'],
        ['cache prefix drift', '비용·TTFT 악화', 'stable ordering과 cache break detection'],
        ['compact metadata 누락', 'resume에서 pre-compact history 부활', 'boundary/relink/projection 기록'],
        ['중복 memory attachment', 'context 팽창', 'session-level loaded path set'],
        ['UI-only message 유입', '모델이 presentation text를 사실로 해석', 'normalize boundary에서 제거'],
      ])],

    ['BACKGROUND', '연결할 배경지식: compiler와 materialized view', 'context pipeline은 소스 정보를 읽어 target protocol을 만드는 compiler와 닮았다. transcript/compact projection은 materialized view와 닮았다.',
      cards([
        ['compiler', 'normalization passes', p('raw input → typed message → provider request. 각 pass의 입력/출력 계약이 필요하다.')],
        ['database', 'projection & compaction', p('원본 history와 읽기 최적화 view를 구분한다.')],
        ['distributed systems', 'cache key & replay', p('같은 의미보다 deterministic serialization이 중요할 수 있다.')],
        ['security', 'provenance', p('context의 출처와 effect authority를 분리한다.')],
      ]) + refs([ext('https://martinfowler.com/eaaDev/EventSourcing.html', 'Event Sourcing — projection 관점'), ext('https://www.typescriptlang.org/docs/handbook/2/narrowing.html', 'TypeScript narrowing')])],

    ['REFACTORING', 'context compiler를 명시적 단계로 만들기', '현재 로직을 단순히 한 파일로 모으면 dependency cycle과 feature 결합이 커진다. 대신 immutable intermediate representation과 cache contract를 먼저 정의한다.',
      code(`RawInput
 → InputIR { user, localCommand, attachments, provenance }
 → ConversationIR { messages, toolRefs, boundaries }
 → RequestIR { system, tools, messages, cacheSegments }
 → ProviderRequest`, '제안하는 분해 방향') +
      ul([
        '<b>각 단계는 pure projection을 기본</b>으로 하고 effect는 loader/adapter에 둔다.',
        '<b>cacheSegments를 값으로 표현</b>해 순서와 dynamic suffix를 검증한다.',
        '<b>provenance를 유지</b>해 UI visibility, model visibility, authority를 혼동하지 않는다.',
        '<b>compact/snip을 rewrite policy</b>로 만들고 replay equivalence test를 둔다.',
      ]) + callout('우선 보존할 oracle', '동일 fixture에 대해 provider request JSON, cache segment hash, tool_use/result pairing, resume 후 message projection이 같아야 한다.', 'good')],

    ['CASE STUDY', '한 Edit turn에서 context가 하는 일', '파일 수정 기능을 실제로 성립시키는 문맥은 prompt보다 넓다.',
      ol([
        'system prompt가 Read-before-Edit 사용법과 도구 vocabulary를 제공한다.',
        '사용자 prompt와 repository memory가 대상 변경의 의미를 제공한다.',
        'Read 결과가 내용과 timestamp를 message/readFileState 양쪽에 남긴다.',
        'Edit schema가 old_string/new_string/file_path라는 행동 언어를 제한한다.',
        'Edit result가 patch와 성공 정보를 다음 reasoning에 되돌린다.',
        '테스트 Bash result가 변경이 목표를 만족하는지 새 context가 된다.',
        'transcript와 compact policy가 다음 turn/resume에서 필요한 부분을 보존한다.',
      ]) + verdict('학습 포인트', '“prompt가 좋아서 편집했다”가 아니라, 관찰·행동 schema·runtime guard·결과 환류가 함께 모델의 작업 능력을 만든다.')],

    ['CONCLUSION', '좋은 context 설계의 판단 기준', '더 많은 정보를 넣는 것이 목표가 아니다. 올바른 정보가 올바른 표현과 수명으로 들어가고, 비용·cache·resume 조건 아래에서도 의미가 유지되어야 한다.',
      table(['질문', '좋은 답의 형태'], [
        ['무엇이 authoritative한가?', 'filesystem/read state/transcript와 UI projection을 구분'],
        ['무엇이 model-visible한가?', 'normalize 후 provider request로 확인'],
        ['무엇이 cache key인가?', 'stable prefix와 dynamic suffix를 명시'],
        ['무엇을 버릴 수 있는가?', '재읽기·요약·boundary로 복구 가능한 정보만'],
        ['resume는 같은 의미를 재생하는가?', 'compact/snip/tool pair까지 equivalence test'],
      ])],
  ],
})

reports.push({
  volume: '02', slug: '02-effect-runtime-and-code-change', symbol: 'FX', accent: '#d05b46',
  title: '제안을 코드 효과로 바꾸는 런타임',
  subtitle: 'Tool 계약, FileEdit의 동시성, Bash 보안, permission과 partial effect',
  claim: '모델은 효과를 제안하지만, 실행 가능성과 안전성은 도구 런타임이 입력별로 다시 결정한다.',
  lens: 'effect · authority · repository change',
  sections: [
    ['THESIS', 'Tool은 함수가 아니라 효과 계약이다', 'Tool 하나는 모델에게 보이는 행동 언어, runtime validation, permission, 외부 효과, 결과 protocol, 사용자 표시를 함께 규정한다.',
      layers([
        ['언어', 'name·description·prompt·schema가 모델이 생성할 행동을 정의'],
        ['정책', 'isReadOnly·isDestructive·permission matcher가 authority를 제한'],
        ['실행', 'call이 filesystem/process/network 효과를 발생'],
        ['관찰', 'progress와 result가 model/UI/SDK에 서로 다른 표현으로 환류'],
        ['운영', 'telemetry·result budget·compatibility alias가 배포 환경을 지지'],
      ]) + verdict('왜 핵심인가', 'LLM의 자유로운 출력과 운영체제의 비가역 효과 사이에서 의미와 권한을 번역하는 경계이기 때문이다.')],

    ['CONTRACT', '하나의 Tool 타입에 모인 다섯 변화 이유', '현재 Tool 계약은 응집력이 높은 protocol seam인 동시에 변경 결합의 중심이다.',
      table(['facet', '대표 멤버', '함께 바뀌는 이유'], [
        ['model contract', 'inputSchema, prompt, description, strict', '모델이 올바른 호출을 만들게 함'],
        ['effect semantics', 'call, isReadOnly, isConcurrencySafe, interruptBehavior', '실행 순서와 취소 결정'],
        ['authority', 'validateInput, checkPermissions, preparePermissionMatcher', '실행 승인과 값 수정'],
        ['protocol mapping', 'mapToolResultToToolResultBlockParam', '다음 reasoning에 결과 전달'],
        ['presentation', 'renderToolUse/Result/Progress/Error', 'interactive projection'],
      ]) +
      p('이 통합은 새 도구를 만들 때 빠뜨릴 항목을 줄인다. 반면 headless core가 React type을 알게 하고, 작은 UI 변경도 Tool 모듈 전체에 영향을 준다. 리팩터링은 장단점을 모두 보존해야 한다.') + refs([src('src/Tool.ts', '362-700')])],

    ['BUILDER', 'buildTool은 기본값을 중앙화하지만 의미까지 안전하게 만들지는 않는다', 'generic builder는 부분 정의를 완전한 Tool로 바꾸며 literal name과 메서드 타입을 보존한다.',
      code(`ToolDef<Input, Output>
  + centralized defaults
  → Tool<Input, Output>

compile-time: required shape, inferred input/output
runtime: schema parse, policy, effect`, 'type-level builder의 역할') +
      p('<code>isConcurrencySafe=false</code>와 <code>isReadOnly=false</code> 기본은 보수적이다. 그러나 <code>isDestructive=false</code>는 실제 비가역성을 자동 판정하지 않는다. 안전성은 builder 한 곳이 아니라 general permission과 tool-specific validation의 합성 결과다.') + refs([src('src/Tool.ts', '701-793')])],

    ['EXECUTION PIPE', 'tool_use는 여섯 단계에서 신뢰를 얻는다', 'dispatch는 tool 이름만 보고 call하지 않는다. 각 단계는 서로 다른 종류의 오류를 model-visible result로 바꾼다.',
      flow([['resolve', 'name/alias'], ['parse', 'Zod'], ['validate', '값/상태'], ['policy', 'permission+hook'], ['execute', 'call/progress'], ['map', 'tool_result']]) +
      table(['실패', '표현', '다음 행동'], [
        ['unknown tool', 'is_error tool_result', '모델이 다른 도구 선택'],
        ['schema mismatch', '구조화 validation error', '입력 수정/ToolSearch'],
        ['domain invalid', 'tool-specific errorCode/message', 'read·path·명령 수정'],
        ['permission deny', 'denial + optional updated input', '사용자 선택 반영'],
        ['call exception', 'sanitized tool error', '후속 reasoning 또는 종료'],
      ]) + refs([src('src/services/tools/toolExecution.ts', '337-690')])],

    ['RUNTIME TYPES', 'Zod는 TypeScript가 닿지 못하는 경계를 닫는다', '모델이 만든 JSON, MCP payload, resume data는 compile-time 타입의 보호를 받지 않는다. schema parse 뒤에야 typed input으로 취급할 수 있다.',
      formula('unknown JSON —safeParse→ validated value —domain checks→ admissible effect') +
      p('schema와 validateInput은 중복이 아니다. schema는 <i>모양</i>을, validateInput은 현재 filesystem·permission·read state와 관련된 <i>의미</i>를 검사한다. FileEdit에서 문자열이 모두 존재해도, 파일을 읽지 않았거나 old_string이 여러 곳에 있으면 허용되지 않는다.') +
      refs([src('src/services/tools/toolExecution.ts', '599-690'), src('src/tools/FileEditTool/FileEditTool.ts', '137-361')])],

    ['READ CAPABILITY', 'Read는 무해한 함수가 아니다', '파일 읽기는 비밀·device path·대용량·이미지/PDF·working-directory permission을 다루며, 이후 Edit 권한을 만드는 관찰이기도 하다.',
      table(['책임', '구현 노력', '왜 필요한가'], [
        ['path admissibility', 'blocked device/permission/alternate path', 'credential leak·hang·scope 이탈 방지'],
        ['content limits', 'line/token/image budget', 'OOM과 context 폭발 방지'],
        ['format', 'line number·binary/media 변환', '모델이 후속 edit를 정확히 제안'],
        ['freshness', 'content/timestamp/partial state 기록', 'optimistic edit validation'],
        ['projection', 'model result와 UI 표시 분리', '정확한 context와 읽기 쉬운 terminal'],
      ]) + callout('설계 의미', 'Read는 “정보를 반환하는 도구”이면서 “이 파일에 대해 어느 시점의 관찰을 가졌는가”를 발급하는 capability다.') + refs([src('src/tools/FileReadTool/FileReadTool.ts', '337-560'), src('src/tools/FileReadTool/FileReadTool.ts', '720-820')])],

    ['EDIT PRECONDITIONS', 'Edit는 old_string 치환보다 검증이 더 크다', '파일을 쓰기 전에 path, secret, deny rule, 크기, encoding, 존재, notebook, read state, mtime, match cardinality, settings validity를 확인한다.',
      layers([
        ['scope', '정규화된 경로와 deny rule, UNC 부작용'],
        ['resource', '파일 크기·encoding·존재 여부'],
        ['knowledge', 'full read가 있었고 partial view가 아님'],
        ['freshness', 'read 뒤 사용자/linter 변경이 없음'],
        ['intent', 'old_string이 존재하고 replace_all 의미가 명확'],
        ['domain', 'settings/notebook 같은 특수 파일 규칙'],
      ]) + p('이 계층은 모델의 잘못된 제안을 사용자 데이터 손실로 바꾸지 않는 방어선이다. errorCode와 구체적 메시지는 단순 UX가 아니라 모델이 다음 행동을 수정할 feedback protocol이다.') + refs([src('src/tools/FileEditTool/FileEditTool.ts', '137-361')])],

    ['OCC', 'read-before-write는 optimistic concurrency control이다', 'Edit는 파일을 lock한 채 모델이 생각하도록 만들지 않는다. 먼저 읽고, 쓰기 직전에 여전히 같은 상태인지 확인한다.',
      code(`read:
  state[path] = { content, timestamp, fullView }

edit preflight:
  require fullView
  if mtime advanced and content differs: reject

critical section:
  sync read → compare → patch → sync write`, 'FileEdit의 낙관적 동시성 모델') +
      p('mtime만 믿지 않고 Windows cloud sync/antivirus의 false positive를 content 비교로 보정한다. 이는 version number 대신 timestamp+snapshot을 쓰는 OCC다.') + refs([src('src/tools/FileEditTool/FileEditTool.ts', '275-310'), src('src/tools/FileEditTool/FileEditTool.ts', '427-491')])],

    ['CRITICAL SECTION', '“await를 두지 않는다”가 동시성 설계다', 'directory 생성과 history backup은 critical section 밖에서 await한다. staleness check와 write 사이에 yield하면 다른 edit가 끼어들 수 있기 때문이다.',
      callout('핵심 코드 판단', 'Node의 single thread가 race를 없애 주지 않는다. <code>await</code>는 event loop에 제어를 돌려주므로 check-then-act 사이가 열릴 수 있다. 이 구간은 synchronous read/patch/write로 좁혀져 있다.', 'good') +
      p('다만 이것은 process 내부의 interleaving만 줄인다. 다른 process나 editor가 check 직후 write할 수 있는 TOCTOU 가능성, crash 중간 상태, filesystem atomicity는 별도 문제다.') +
      refs([src('src/tools/FileEditTool/FileEditTool.ts', '425-491'), ext('https://cwe.mitre.org/data/definitions/367.html', 'CWE-367 TOCTOU')])],

    ['AFTER EFFECT', '쓰기 이후의 합류가 변경을 완성한다', '파일에 bytes를 쓰는 것만으로 작업이 끝나지 않는다. 관련 projection과 future guard를 함께 갱신해야 한다.',
      flow([['write', 'encoding/line ending'], ['LSP', 'didChange/didSave'], ['IDE', 'diff notification'], ['read cache', 'new snapshot'], ['history', 'undo/attribution'], ['result', 'patch to model/UI']]) +
      p('LSP/IDE 알림 실패는 파일 쓰기를 되돌리지 않는다. 즉 이 작업은 ACID transaction보다 saga에 가깝다. 핵심 effect와 보조 effect의 실패 정책을 구분하고, 어느 단계까지 성공했는지 관찰 가능해야 한다.') + refs([src('src/tools/FileEditTool/FileEditTool.ts', '490-573')])],

    ['BASH IS A LANGUAGE', 'Bash permission은 문자열 prefix 비교로 끝나지 않는다', 'shell command는 quoting, substitution, redirect, pipeline, wrapper, environment variable을 가진 언어다. 같은 표면 prefix가 전혀 다른 효과를 만들 수 있다.',
      table(['구문/환경', '위험', '필요한 해석'], [
        ['operators ; && |', '허용 command 뒤에 effect 추가', 'subcommand 분해와 개별 판정'],
        ['redirection > >>', 'read command가 write로 변함', '출력 경로 추출'],
        ['$(...) / backticks', '숨은 command 실행', 'quote/substitution 분석'],
        ['env/PATH/LD_*', 'binary hijack·동작 변경', 'leading env 정규화와 deny'],
        ['heredoc/escaped newline', 'parser desync·content 실행', 'shell grammar에 가까운 검사'],
        ['wrappers timeout/env/stdbuf', '실제 base command 은닉', 'wrapper stripping'],
      ]) + verdict('분포가 말하는 것', 'Bash/PowerShell·parser·security 관련 선택 영역이 약 3.9만 줄인 것은 shell을 범용 effect 통로로 제공하는 비용이 얼마나 큰지 보여 준다.')],

    ['BASH DEFENSE', 'Bash 실행 전 방어는 여러 층의 합성이다', '어떤 한 classifier도 모든 command semantics를 증명하지 못한다.',
      layers([
        ['syntax/security guard', 'malformed token, quote, substitution, Unicode, injection 패턴'],
        ['semantic classification', 'read-only·filesystem write·git internal path 등'],
        ['permission rules', 'exact/prefix/wildcard allow·ask·deny'],
        ['path constraints', '추출된 입력/출력 경로가 허용 scope 안인지 확인'],
        ['sandbox decision', '가능할 때 OS 격리로 effect 범위 축소'],
        ['human/classifier', '정적 규칙이 확정하지 못한 호출을 재판정'],
      ]) + callout('배경지식', 'OWASP의 핵심 원칙처럼 가능한 경우 shell 자체를 피하고 parameterized API를 쓰는 것이 강하다. 그러나 코딩 에이전트는 shell이 제품 능력의 핵심이므로, 여기서는 parser·policy·sandbox·prompt를 겹친 defense-in-depth를 택한다.', 'trade') + refs([src('src/tools/BashTool/bashSecurity.ts', '783-1150'), src('src/tools/BashTool/bashPermissions.ts', '1183-1700'), ext('https://cheatsheetseries.owasp.org/cheatsheets/OS_Command_Injection_Defense_Cheat_Sheet.html', 'OWASP OS Command Injection Defense')])],

    ['PERMISSION', 'permission mode는 UX 설정이 아니라 effect policy다', 'default, acceptEdits, dontAsk, plan, bypassPermissions 등은 같은 tool call의 admissibility와 사용자 개입 방식을 바꾼다.',
      table(['결정', '의미', '주의'], [
        ['allow', '현재 입력으로 실행', 'rule source와 updatedInput 추적'],
        ['ask', '사람 또는 interactive handler 필요', 'headless/background에서 prompt 불가'],
        ['deny', '효과 차단', '모델에게 수정 가능한 설명 제공'],
        ['mode restriction', '도구 종류/쓰기 자체를 제한', 'plan mode와 실제 read-only는 동일하지 않음'],
        ['bypass', '대부분의 prompt 생략', '가용 조건과 위험 표시가 별도'],
      ]) + p('중요한 것은 permission이 tool name만 보지 않는다는 점이다. <code>Bash(ls)</code>와 <code>Bash(rm)</code>, <code>Edit</code>의 경로가 다르므로 입력별 판정이 필요하다.') + refs([src('src/types/permissions.ts', '1-120'), src('src/Tool.ts', '123-149')])],

    ['CONCURRENCY', '병렬화 단위는 도구 종류가 아니라 입력별 효과다', 'runTools는 isConcurrencySafe(parsedInput)를 호출해 연속된 safe call만 batch로 묶고, 나머지는 직렬화한다.',
      code(`for each tool_use:
  parse input
  safe = parse.ok && tool.isConcurrencySafe(input)
  if classifier throws: safe = false

consecutive safe calls → bounded parallel
effectful calls         → serial`, '보수적 scheduling') +
      p('contextModifier도 병렬 실행 중 즉시 적용하지 않고 tool_use 순서대로 합류한다. 이는 execution concurrency와 state commit order를 분리한 설계다.') + refs([src('src/services/tools/toolOrchestration.ts', '19-116'), src('src/services/tools/toolOrchestration.ts', '118-188')])],

    ['STREAMING EXECUTION', '더 빠른 실행은 중복 효과 위험을 만든다', 'tool_use block이 스트림에서 완성되는 즉시 실행하면 latency를 줄일 수 있지만, 같은 request가 fallback/retry될 때 동일 효과가 두 번 발생할 수 있다.',
      table(['전략', '장점', '새 위험'], [
        ['응답 종료 후 실행', 'attempt 확정 뒤 effect 발생', 'tool latency가 직렬로 추가'],
        ['streaming tool execution', '모델 나머지 출력과 tool 실행 중첩', 'partial attempt fallback의 중복 실행'],
        ['non-streaming fallback', '끊긴 stream 회복', '이미 시작한 tool과 새 tool_use 충돌'],
      ]) + callout('구현이 보여 주는 trade-off', 'claude.ts에는 streaming fallback이 active tool 실행과 결합될 때 double execution을 만들 수 있다는 주석과 kill switch가 있다. 성능 최적화는 effect idempotency와 함께 설계되어야 한다.', 'risk') + refs([src('src/query.ts', '829-860'), src('src/services/api/claude.ts', '2464-2501')])],

    ['CANCELLATION', '취소는 rollback이 아니라 더 이상의 진행을 막는 신호다', 'AbortSignal은 model stream과 tool에 전달되지만 이미 쓴 파일, 보낸 요청, 시작한 process가 자동으로 원상복구되지는 않는다.',
      cards([
        ['전파', 'signal', p('blocking boundary가 signal을 관찰해야 실제로 멈춘다.')],
        ['정합성', 'synthetic result', p('시작된 tool_use는 취소돼도 matching result가 필요하다.')],
        ['정리', 'finally/dispose', p('stream body, timer, lock, child process를 해제한다.')],
        ['보상', 'history/cleanup', p('가능한 effect만 되돌리거나 다음 turn에 상태를 설명한다.')],
      ]) + verdict('설계 질문', '“abort를 지원하는가?”가 아니라 “각 effect point 전·후 취소 시 무엇이 남고, 어떤 메시지와 durable record가 그 사실을 표현하는가?”를 묻는다.')],

    ['HOOKS', 'hook은 확장점이면서 effect pipeline의 일부다', 'PreToolUse는 실행 전 입력·권한을 바꿀 수 있고 PostToolUse는 관찰·후속 context를 만들 수 있다. 위치에 따라 예방 가능성과 책임이 다르다.',
      table(['시점', '가능한 일', '불가능/위험'], [
        ['UserPromptSubmit', '입력 block, context 추가', '이미 발생한 외부 effect 없음'],
        ['PreToolUse', 'deny/ask/update input', 'core schema·permission과 충돌 가능'],
        ['PermissionRequest', '조직 정책·사람 승인 연결', '무응답/timeout 처리 필요'],
        ['PostToolUse', '결과 관찰·annotation', '이미 발생한 effect 예방 불가'],
        ['Stop', 'continuation block/retry', '무한 retry guard 필요'],
      ]) + callout('구조 원칙', 'hook 결과를 authority 자체로 취급하지 않고 core permission decision에 명시적으로 합성해야 한다. 또한 hook progress와 final decision을 같은 stream에 섞을 때 terminal semantics를 분리해야 한다.')],

    ['MCP', 'MCP는 새 Tool 공급자이지 별도 core가 아니다', '외부 server의 tool도 동일한 resolve→schema→permission→call→result 경계를 통과해야 제품 안전성이 유지된다.',
      p('MCP가 추가하는 것은 remote transport, server identity, authentication, URL elicitation, metadata, dynamic connection이다. 이것들은 adapter 책임이다. model이 보는 관점에서는 built-in Tool과 유사하지만 runtime은 remote trust와 failure를 더 다뤄야 한다.') +
      table(['경계', '추가 질문'], [
        ['discovery', '서버가 광고한 schema를 언제/얼마나 prompt에 포함?'],
        ['identity', 'tool name prefix와 alias 충돌을 어떻게 방지?'],
        ['permission', '서버 annotation을 신뢰할 것인가, local policy로 재판정할 것인가?'],
        ['transport', 'timeout·disconnect·partial result를 어떤 tool_result로 만들 것인가?'],
      ]) + refs([src('src/services/mcp/client.ts', '1-180'), src('src/services/tools/toolExecution.ts', '272-336'), ext('https://modelcontextprotocol.io/specification/2025-06-18/server/tools', 'MCP Tools specification')])],

    ['REFACTORING', 'Tool을 다섯 interface로 찢기 전에 조합점을 설계한다', '현재 계약의 문제는 크기 자체보다 서로 다른 consumer가 한 타입을 공유한다는 것이다.',
      code(`ToolCapability  { name, schemas, modelPrompt }
ToolEffect      { validate, execute, interrupt }
ToolPolicy      { classify, permissionMatcher }
ToolProjection  { toModelResult, toSDKEvent }
ToolPresenter   { renderUse, renderResult, renderProgress }

ToolDefinition = compose(identity, capability, effect, policy, projections)`, '점진적 분해 후보') +
      ul([
        'identity와 input/output schema는 모든 facet을 묶는 단일 source of truth로 유지한다.',
        'headless path는 Presenter를 import하지 않아도 되게 한다.',
        'permission과 concurrency classification이 같은 parsed input을 사용하게 한다.',
        'compatibility alias와 observer backfill은 adapter로 격리한다.',
      ]) + callout('위험', '한 번에 모든 tool을 migration하면 schema/prompt/render drift를 만들기 쉽다. 먼저 adapter로 기존 Tool을 새 facet에 투영하고 contract fixture를 만든 뒤 하나씩 옮긴다.', 'trade')],

    ['CASE STUDY', 'Edit와 Bash를 함께 쓰는 변경의 의미', '코드 수정 후 테스트라는 흔한 작업은 두 종류의 effect를 합성한다.',
      table(['단계', 'Edit', 'Bash'], [
        ['사전 지식', 'full read snapshot 필요', 'command grammar/working directory 필요'],
        ['권한', 'path와 write permission', 'subcommand·path·sandbox·rule'],
        ['동시성', 'write는 직렬', 'read-only command만 제한적 병렬'],
        ['실패', 'stale content·ambiguous match', 'exit code·timeout·signal·background process'],
        ['결과', 'patch와 updated file state', 'stdout/stderr와 command semantic'],
        ['보상', 'file history 가능', '외부 effect는 일반적 rollback 불가'],
      ]) + verdict('학습 결론', '도구 구현은 API wrapper가 아니라 effect semantics를 제품 계약으로 만드는 작업이다.')],

    ['CONCLUSION', '좋은 effect runtime의 조건', '기능 수보다 효과의 해석 가능성과 실패 후 정합성이 중요하다.',
      ul([
        '모델 input은 실행 전 runtime schema와 현재 상태 검증을 거친다.',
        'permission은 tool name이 아니라 구체 입력과 effect를 본다.',
        'read-only/concurrency-safe/destructive는 서로 다른 속성으로 유지한다.',
        '취소·retry·fallback에서 중복 효과와 orphan protocol을 막는다.',
        '핵심 effect와 LSP/UI/telemetry 같은 후속 effect의 실패 정책을 구분한다.',
        '모든 결과는 다음 reasoning과 durable session이 이해할 수 있는 표현으로 합류한다.',
      ])],
  ],
})

reports.push({
  volume: '03', slug: '03-conversation-transaction-and-recovery', symbol: 'TX', accent: '#278c72',
  title: 'Turn을 복구 가능한 거래로 닫는 법',
  subtitle: 'stream, tool loop, fallback, terminal, transcript, resume와 projection 정합성',
  claim: '한 turn은 원자적이지 않지만, 모든 부분 사건을 일관된 protocol과 durable history로 합류시켜야 한다.',
  lens: 'state machine · recovery · durability',
  sections: [
    ['THESIS', 'turn은 transaction처럼 다뤄지지만 ACID transaction은 아니다', '모델 응답, tool effect, UI projection, transcript write가 단계적으로 발생한다. 중간 실패 시 모두 rollback할 수 없으므로 “무엇이 발생했는가”를 일관되게 남기는 것이 핵심이다.',
      formula('Turn = state transition + external effects + reconciliation record') +
      p('이 시스템의 성공은 마지막 assistant text만으로 정의되지 않는다. tool 결과가 다음 request에 합류하고, terminal reason이 caller에 전달되며, process가 죽어도 resume가 이미 수락된 사용자 입력과 발생한 effect를 복원해야 한다.')],

    ['STATE', 'query loop는 암묵적 재귀를 명시적 State로 바꾼다', '메시지, tool context, compact tracking, recovery count, pending summary, stop-hook, turn count, transition reason이 반복 사이를 이동한다.',
      table(['state', '수명', '왜 명시적인가'], [
        ['messages', 'loop 전 구간', '다음 request와 resume의 입력'],
        ['toolUseContext', 'tool 실행 후 갱신', 'permission/read state/app state 전달'],
        ['compact tracking', '여러 iteration', 'threshold·recompaction·budget 의미'],
        ['recovery guards', '오류 반복 동안', '동일 compact/retry 무한 루프 방지'],
        ['pending summary/prefetch', '비동기 overlap', 'critical path 밖의 결과를 이후 합류'],
        ['transition', 'iteration 경계', '왜 continue했는지 테스트/관측 가능'],
      ]) + refs([src('src/query.ts', '179-321')])],

    ['GENERATOR', 'async generator는 상태 머신의 외부 관찰 계약이다', 'generator가 내부 State를 대신하지 않는다. 내부 transition을 수행하면서 event를 즉시 내보내고, 종료 시에는 Terminal 값을 반환하는 인터페이스다.',
      code(`async function* query(): AsyncGenerator<Event, Terminal> {
  while (true) {
    for await (const event of modelStream) yield event
    for await (const result of runTools()) yield result
    if (done) return { reason: "completed" }
    state = next(state)
  }
}`, '핵심 시간 구조') +
      p('<code>yield</code>는 UI/SDK에 관찰을 제공하면서 continuation과 local frame을 보존한다. <code>return</code>은 terminal reason을 iterator completion value로 구분한다. 소비자가 <code>.return()</code>하거나 throw가 발생하면 wrapper의 완료 코드가 실행되지 않는 비대칭도 설계에 포함된다.') + refs([src('src/query.ts', '219-250'), ext('https://tc39.es/ecma262/multipage/control-abstraction-objects.html#sec-asyncgenerator-objects', 'ECMAScript AsyncGenerator Objects')])],

    ['EVENT VS STATE', 'yield된 event와 내부 정식 상태는 같지 않다', 'stream event를 보여 줬다고 conversation state에 commit된 것은 아니며, 내부 배열에 넣었다고 모든 consumer에게 노출되는 것도 아니다.',
      table(['사건', '외부 projection', '내부 처리'], [
        ['text/thinking delta', '즉시 UI/SDK stream 가능', 'assistant message에 누적'],
        ['tool_use block', '호출 표시', 'needsFollowUp와 executor에 등록'],
        ['progress', 'spinner/tool 상태', 'transcript 정책에 따라 기록'],
        ['tombstone', '기존 partial row 제거', 'failed attempt arrays 초기화'],
        ['compact boundary', 'SDK/session 경계', '이전 in-memory messages release'],
        ['terminal', 'result/status', 'generator return으로 caller settlement'],
      ]) + verdict('핵심 구분', 'event는 “무슨 일이 관찰됐는가”, state는 “다음 결정이 무엇을 진실로 사용할 것인가”를 답한다.')],

    ['MODEL STREAM', 'streaming은 UI 최적화보다 protocol 조립 문제다', 'raw provider event에서 content block, usage, stop reason, tool input JSON을 누적해 유효한 assistant message를 만든다.',
      layers([
        ['request', 'cache-aware system/tools/messages와 AbortSignal 생성'],
        ['message_start', 'usage와 request identity 초기화'],
        ['content deltas', 'text/thinking/tool input을 incremental accumulate'],
        ['content stop', '완성된 block을 assistant message로 projection'],
        ['message_delta', 'usage와 실제 stop_reason 보정'],
        ['message_stop', 'cost·timing·stream resource 정리'],
      ]) + p('raw stream을 사용하는 이유로 O(n²) partial JSON parsing 회피가 주석에 명시돼 있다. 즉 transport 선택은 renderer 취향이 아니라 장문 tool input의 성능과 memory에 직접 연결된다.') + refs([src('src/services/api/claude.ts', '1810-2205')])],

    ['PAIRING', 'tool_use/result pairing은 가장 중요한 protocol 불변조건이다', '모델이 tool_use를 내보낸 뒤 stream·tool·process가 실패해도 다음 API history에는 같은 id의 tool_result가 필요하다.',
      code(`assistant: tool_use(id=A)
user:      tool_result(tool_use_id=A)

abort/error → synthetic error result for A
fallback    → tombstone old attempt; never leak result A into new ids`, 'pairing invariant') +
      p('이 규칙 때문에 abort 처리보다 먼저 remaining executor를 drain하고, exception path에서 missing result를 생성한다. 사용자에게 “취소됨”을 보여 주는 것보다 provider protocol을 유효하게 유지하는 것이 우선이다.') + refs([src('src/query.ts', '899-919'), src('src/query.ts', '980-1029')])],

    ['FALLBACK', 'fallback은 재호출이 아니라 failed attempt 제거를 포함한다', 'streaming attempt가 일부 assistant/tool event를 이미 내보낸 뒤 fallback되면 이전 projection과 executor를 정리해야 한다.',
      flow([['partial stream', 'assistant/tool_use'], ['fallback signal', 'attempt 폐기'], ['tombstone', 'UI/transcript 제거'], ['executor discard', 'old tool_result 차단'], ['new request', 'fallback model'], ['clean history', 'signature 호환']]) +
      p('특히 protected thinking signature는 model-bound일 수 있어 fallback 전 제거한다. “같은 prompt를 다른 모델에 재전송”하는 단순화가 protocol·cache·effect 관점에서 틀린 이유다.') + refs([src('src/query.ts', '650-741'), src('src/query.ts', '893-950')])],

    ['WITHHOLD & RECOVER', '회복 가능한 오류는 외부에 바로 commit하지 않는다', 'prompt-too-long, media size, max-output 같은 오류를 즉시 SDK/UI에 내보내면 consumer가 turn을 종료할 수 있다. runtime은 recovery 여부가 결정될 때까지 보류한다.',
      table(['오류', '가능한 회복', 'guard'], [
        ['prompt too long', 'collapse drain/reactive compact', '한 번 시도 후 반복 방지'],
        ['max output tokens', 'limit 조정·continuation', '회복 횟수 제한'],
        ['media size', 'resize/remove/retry', 'gate를 turn 시작에 latch'],
        ['stream stall', 'watchdog abort + non-stream fallback', 'timer cleanup·double effect 고려'],
      ]) + callout('transaction 관점', 'withhold는 provisional event다. 성공한 회복 뒤에는 원래 오류를 commit하지 않고, 회복 실패 시에만 최종 failure projection을 만든다.') + refs([src('src/query.ts', '788-825'), src('src/services/api/claude.ts', '1868-1933')])],

    ['TERMINAL', '종료는 boolean이 아니라 caller가 해석할 이유다', 'completed와 실패·중단은 UI 메시지뿐 아니라 SDK result, lifecycle notification, cleanup을 다르게 만든다.',
      table(['reason', '의미', 'caller 책임'], [
        ['completed', 'tool follow-up와 stop hook까지 수렴', 'result·usage·completion 처리'],
        ['blocking_limit', 'context 정책이 호출 차단', 'compact 안내/재시도 선택'],
        ['model_error/image_error', 'request/runtime 실패', '진짜 오류를 보존'],
        ['aborted_tools', '실행 중 사용자/상위 취소', '부분 효과와 interruption 표시'],
        ['hook_stopped/stop_hook_prevented', '정책이 continuation 중단', '정책 이유와 상태 유지'],
        ['max_turns', '운영 한도', '현재 conversation을 재개 가능하게 정리'],
      ]) + callout('복원 한계', '<code>query/transitions.ts</code> 선언 파일은 복원본에서 누락됐다. variant 명칭은 query의 return 지점과 QueryEngine 처리에서 확인한다.', 'trade')],

    ['STOP HOOK', '“모델이 끝났다”와 “turn이 끝났다”는 다르다', 'tool_use가 없더라도 stop hook이 continuation을 막거나 새 blocking message로 재시도를 요구할 수 있다.',
      p('stop hook blocking 뒤 reactive compact guard를 잘못 초기화하면 compact→여전히 too long→hook block→compact가 반복될 수 있다. 코드 주석은 실제로 수천 API call을 태울 수 있는 무한 루프를 설명한다.') +
      verdict('개발 노력의 핵심', 'policy extension을 loop에 넣을 때는 “다시 실행할 수 있다”가 아니라, 재시도 fingerprint와 monotonic guard가 있는지를 확인해야 한다.') + refs([src('src/query.ts', '1267-1357')])],

    ['QUEUED INPUT', '새 사용자 입력은 현재 turn과 경쟁한다', 'tool 실행 중 들어온 prompt·task notification·slash command를 모두 같은 방식으로 처리할 수 없다.',
      table(['입력', '처리', '이유'], [
        ['prompt', '현재 tool 후 attachment 또는 다음 turn queue', '사용자 의도를 잃지 않음'],
        ['task notification', '수신 agent scope에 따라 drain', 'process-global queue의 오배송 방지'],
        ['slash command', 'turn 종료 뒤 local processor', '모델 text로 잘못 전달 방지'],
        ['submit-interrupt', '현재 turn abort 후 새 입력으로 맥락 제공', '불필요한 interruption message 생략'],
      ]) + p('queue entry는 lifecycle started/completed를 가지며, generator throw나 return에서는 completed가 의도적으로 누락될 수 있다. 이 비대칭은 failure 관측 신호다.') + refs([src('src/query.ts', '1535-1643'), src('src/query.ts', '219-238')])],

    ['TRANSCRIPT', 'transcript는 로그 파일이 아니라 재실행 상태다', '사용자 입력을 model call 전에 기록하는 이유는 응답 전 process kill에도 session을 resume하기 위해서다.',
      p('interactive mode에서는 이 write를 await해 내구성을 우선하고, bare/script mode에서는 critical-path latency를 위해 fire-and-forget을 선택한다. 동일 기능에서도 사용 시나리오에 따라 durability/latency 정책이 다르다.') +
      table(['시점', '정책', 'trade-off'], [
        ['user input accepted', '응답 전 record', 'resume 보장 vs 수 ms latency'],
        ['assistant block', 'ordered queue에 async enqueue', 'stream blocking 방지'],
        ['terminal/desktop handoff', '필요 환경에서 flush', 'process kill 전 bytes 보장'],
        ['tombstone', 'orphan message 제거 기록', 'failed attempt 재등장 방지'],
      ]) + refs([src('src/QueryEngine.ts', '430-463'), src('src/QueryEngine.ts', '700-732')])],

    ['JOURNAL MODEL', 'append-only는 단순하지만 resume projection은 어렵다', 'rewind, compact, fork, subagent, metadata update가 append-only JSONL 위에 branch와 대체 의미를 만든다.',
      code(`append log:
  message(uuid, parentUuid)
  compact_boundary(preserved segment)
  queue operation / metadata / tombstone

resume:
  parse → select chain → repair siblings/pairs
       → apply compact/snip projections → materialize messages`, '세션 journal의 개념 모델') +
      p('sessionStorage의 거대한 크기는 파일 append 자체보다 branch 선택, orphan 회복, stale metadata, compact relink, 대형 파일 memory 사용을 다루는 비용을 반영한다.') + refs([src('src/utils/sessionStorage.ts', '600-865'), src('src/utils/sessionStorage.ts', '2090-2245')])],

    ['COMPACTION + RESUME', 'in-memory 압축과 durable history는 같은 의미를 재생해야 한다', 'turn 중 context를 줄였는데 resume가 pre-compact history를 되살리면 token 폭발과 즉시 재압축이 발생한다.',
      table(['문제', '원인', '필요한 record'], [
        ['pre-compact 부활', 'boundary가 preserved chain과 연결되지 않음', 'tail/head relink metadata'],
        ['stale token usage', '디스크 usage가 압축 전 값', 'boundary 이후 usage reset/projection'],
        ['snip 반복', 'marker가 replay에서 제거되지 않음', 'snip decision과 filtered history'],
        ['orphan tool result', 'single-parent walk가 sibling branch 누락', 'pair-aware recovery'],
      ]) + verdict('검증 단위', '“compact가 성공했다”가 아니라, 같은 session을 즉시 재개했을 때 model-visible history와 token state가 의미상 동일한지를 본다.')],

    ['QUERY ENGINE', 'QueryEngine은 conversation ownership을 headless core로 옮기는 중이다', 'class는 messages, read cache, usage, abort, denial을 conversation lifetime으로 소유하고 submitMessage마다 turn을 연다.',
      p('코드 주석은 기존 <code>ask()</code>의 core logic을 standalone class로 추출했고 현재 headless/SDK가 사용하며 REPL은 future phase라고 명시한다. 이는 완성된 통합이 아니라 진행 중인 architectural seam이다.') +
      cards([
        ['소유', 'conversation state', p('mutableMessages·read state·usage가 turn 사이에 지속.')],
        ['입력', 'submitMessage', p('prompt normalize와 local command까지 처리.')],
        ['출력', 'SDK projection', p('core message를 SDKMessage/result로 변환.')],
        ['제약', 'REPL 미통합', p('interactive lifecycle과 중복이 아직 존재.')],
      ]) + refs([src('src/QueryEngine.ts', '175-236'), src('src/QueryEngine.ts', '1180-1275')])],

    ['REPL PROJECTION', 'REPL은 단순 view보다 많은 lifecycle을 소유한다', '현재 REPL의 onQueryImpl은 prompt context 조립, query 호출, stream event 반영, telemetry, turn completion까지 담당한다.',
      p('따라서 React/Ink를 renderer로만 설명하면 부족하다. interactive store의 최신 MCP/tool 상태, queryGuard, queued input, cancel 후 prompt restore 같은 session coordination이 component 안에 있다.') +
      table(['React/Ink 역할', 'core와 맞닿는 지점'], [
        ['input event', 'prompt/selection/queue/abort intent 생성'],
        ['state subscription', 'stream/progress/message projection'],
        ['render/reconcile', 'terminal buffer로 증분 출력'],
        ['query callback', '현재는 context와 lifecycle orchestration도 포함'],
      ]) + refs([src('src/screens/REPL.tsx', '2661-3024'), src('src/components/PromptInput/PromptInput.tsx', '1800-1930')])],

    ['QUERY GUARD', 'generation guard가 cancel/resubmit race를 막는다', 'boolean isLoading을 check한 뒤 set하면 두 submit이 동시에 통과할 수 있다. queryGuard.tryStart는 확인과 상태 전이를 원자적으로 묶고 generation을 반환한다.',
      code(`g = guard.tryStart()
if (g == null) enqueue(newPrompt)
try { await runTurn() }
finally {
  if (guard.end(g)) settleThisGeneration()
}`, 'stale finally를 막는 generation token') +
      p('cancel+resubmit에서는 이전 turn의 finally가 microtask로 늦게 실행될 수 있다. generation이 없으면 새 turn의 loading/controller 상태를 이전 turn이 지워 버린다.') + refs([src('src/screens/REPL.tsx', '2855-3035')])],

    ['UI MECHANISM', 'React/Ink는 event projection의 구현 선택이다', '영상의 설명처럼 React가 상태 변화에서 terminal UI를 만든다. 그러나 핵심 학습점은 renderer보다 어떤 상태를 static scrollback과 dynamic region으로 나누고, 얼마나 자주 projection을 갱신하는가다.',
      cards([
        ['React', 'declarative projection', p('message/progress/input state를 component tree로 표현.')],
        ['reconciler', 'host operations', p('React mutation을 Ink node tree에 적용.')],
        ['Yoga', 'layout', p('terminal cell 제약으로 크기와 위치 계산.')],
        ['ANSI renderer', 'buffer diff', p('바뀐 영역을 stdout에 쓰고 scrollback을 보존.')],
      ]) + callout('성능 해석', '“항상 16ms로 batch한다”는 식의 고정 주기는 소스/측정 없이 보장할 수 없다. chunk rate, render count, bytes written, input latency를 함께 계측해야 한다.', 'trade') + refs([src('src/ink/reconciler.ts', '1-160'), src('src/ink/render-to-screen.ts', '1-220')])],

    ['OBSERVABILITY', 'checkpoint는 성능 장식이 아니라 causal map이다', '한 turn은 model latency만으로 설명되지 않는다. context load, schema build, stream, tool, hook, compact, transcript flush가 critical path를 나눈다.',
      table(['측정', '알 수 있는 것', '오해하기 쉬운 것'], [
        ['TTFT', '첫 model event까지', 'prompt/context 준비 시간과 분리 필요'],
        ['OTPS', 'active stream 동안 출력 속도', 'tool/compact 대기 포함 turn 속도와 다름'],
        ['tool duration', '외부 effect 비용', 'permission dialog 시간과 분리 여부'],
        ['hook duration', 'extension overhead', 'blocking/async hook 의미 차이'],
        ['turn duration', '사용자 체감 전체', 'background/subagent 수명과 다름'],
        ['resume delta', 'in-session vs restored context 차이', '단순 message count만으로 의미 동등성 보장 못함'],
      ]) + refs([src('src/utils/queryProfiler.ts', '1-180'), src('src/screens/REPL.tsx', '2790-2850')])],

    ['REFACTORING', 'turn engine을 event protocol과 policy로 분리한다', 'REPL/SDK 통합의 목표는 component를 작게 만드는 것이 아니라 동일 turn semantics를 한 owner가 갖게 하는 것이다.',
      code(`ConversationEngine
  submit(InputIR) -> AsyncIterable<CoreEvent> + Terminal

policies:
  ContextPolicy | RecoveryPolicy | ToolSchedulePolicy

adapters:
  ReplProjection | SdkProjection | TranscriptJournal`, '목표 구조의 최소 골격') +
      ul([
        'CoreEvent는 React node나 SDK wire type을 포함하지 않는다.',
        'Terminal과 recovery transition을 discriminated union으로 닫는다.',
        'journal write 위치를 engine lifecycle에 명시하고 durability mode를 입력으로 둔다.',
        'REPL migration 전 golden trace를 만들어 event/order/terminal을 비교한다.',
      ]) + callout('가장 큰 위험', 'interactive path의 latency·cancel·prompt restore와 SDK path의 replay/flush가 서로 다른 암묵 계약을 갖고 있다. 공통분모만 추출하면 양쪽 의미를 잃을 수 있다.', 'risk')],

    ['CONCLUSION', '복구 가능한 turn의 조건', '모든 성공과 실패가 하나의 truth로 합류할 때만 다음 turn과 resume가 올바르다.',
      ul([
        'yield된 partial event와 committed conversation state를 구분한다.',
        '모든 tool_use/result id pairing을 abort·error·fallback에서도 보존한다.',
        '회복 가능한 오류는 provisional로 보류하고 반복 guard를 둔다.',
        'terminal reason을 caller가 해석할 값으로 반환한다.',
        '사용자 입력과 외부 effect를 process crash 전에 필요한 수준으로 journal에 남긴다.',
        'REPL·SDK·resume가 같은 core 사건을 의미상 동등하게 투영하는지 trace로 검증한다.',
      ])],
  ],
})

reports.push({
  volume: '04', slug: '04-structure-refactoring-and-product-operations', symbol: 'EVOLVE', accent: '#3579b8',
  title: '구조를 진화시키는 법',
  subtitle: '변경 압력의 분포, QueryEngine 추출, Tool 분해, feature variability와 운영 피드백',
  claim: '이 코드베이스의 구조 문제는 큰 파일 자체보다 제품 변형과 effect 정합성이 여러 entrypoint에 중복된 데서 나온다.',
  lens: 'refactoring · variability · operations',
  sections: [
    ['THESIS', '현재 구조는 “완성된 계층”보다 진화 중인 seams로 읽어야 한다', '복원본에는 새로운 단일 source of truth를 만들려는 주석과 아직 남은 중복 경로가 동시에 보인다.',
      cards([
        ['추출', 'QueryEngine', p('ask의 conversation lifecycle을 class로 옮겼으나 REPL은 아직 query를 직접 사용.')],
        ['통합', 'assembleToolPool', p('REPL과 agent worker의 built-in/MCP 조립을 한 함수로 모음.')],
        ['중앙화', 'buildTool', p('도구 기본값과 타입 추론을 한 곳으로 이동.')],
        ['격리', 'query config/deps', p('immutable snapshot과 I/O dependency를 loop에서 분리.')],
      ]) + verdict('읽는 법', '파일 배치를 이상적 architecture로 평가하기보다, 어떤 중복과 race를 없애기 위해 새 seam이 생겼는지 본다.')],

    ['CURRENT SHAPE', '실행 경로는 하나지만 소유권은 여러 entrypoint에 퍼져 있다', 'interactive, print/SDK, bridge, subagent가 공통 query와 tools를 사용하면서도 lifecycle 조립은 각자 가진다.',
      table(['surface', '공유하는 core', '자체 소유하는 것'], [
        ['REPL', 'query, tools, message helpers', 'React store, queryGuard, prompt restore, Ink projection'],
        ['print/SDK', 'QueryEngine→query, tools', 'structured IO, batching, SDK result, process lifecycle'],
        ['bridge/remote', 'message/SDK protocol', 'transport, reconnection, remote input policy'],
        ['subagent/task', 'query, tool runtime', 'forked context, sidechain transcript, parent progress'],
      ]) + p('공통 core가 있다는 사실과 공통 owner가 있다는 사실은 다르다. 같은 helper를 호출해도 state initialization·flush·cancel 순서가 다르면 제품 semantics가 갈라진다.')],

    ['HOTSPOTS', '큰 파일은 원인이 아니라 여러 변화 이유가 만나는 장소다', '상위 파일 크기는 responsibility fan-in을 찾는 출발점으로만 사용한다.',
      table(['파일', '약 LOC', '겹친 변화 이유'], [
        ['cli/print.ts', '5.6k', 'SDK IO·permission·queue·MCP·resume·process'],
        ['utils/messages.ts', '5.5k', 'protocol normalization·factories·selection·repair'],
        ['utils/sessionStorage.ts', '5.1k', 'append queue·metadata·resume·compact·search'],
        ['utils/hooks.ts', '5.0k', 'hook discovery·execution·events·policy'],
        ['screens/REPL.tsx', '5.0k', 'UI·turn lifecycle·queue·telemetry·cancel'],
        ['main.tsx', '4.7k', 'CLI composition·mode routing·startup'],
        ['services/api/claude.ts', '3.4k', 'provider request·cache·stream·retry·telemetry'],
      ]) + callout('리팩터링 오해', '라인 수를 줄이는 분할은 import 수만 늘릴 수 있다. 먼저 각 파일의 state owner, effect point, compatibility policy, projection consumer를 표시해야 한다.', 'trade')],

    ['PRESSURE MAP', '변경 압력은 서로 다른 영역에 다르게 쌓였다', '주석의 reliability/performance/security/concurrency 어휘를 탐색 지표로 보면 각 slice의 주된 부담이 다르다.',
      table(['slice', '두드러진 압력', '구조적 의미'], [
        ['conversation engine', 'recovery·cache·fallback', 'transition policy와 transport가 결합'],
        ['context/persistence', 'performance·resume·stale', 'projection과 journal이 결합'],
        ['shell effects', 'security·compatibility', 'parser/policy/runtime가 한 capability에 집중'],
        ['interactive/SDK', 'reliability·concurrency', 'UI가 lifecycle coordination까지 소유'],
        ['extension adapters', 'performance·reliability', '외부 공급자 수명과 core turn이 결합'],
      ]) + callout('해석 주의', 'lexical count는 defect나 품질 점수가 아니다. refactoring discovery surface를 좁히는 데 쓰며, 실제 판단은 해당 state/effect 경계를 읽고 내린다.')],

    ['DUAL CORE', '가장 중요한 구조 축은 REPL과 QueryEngine의 합류다', 'QueryEngine은 headless/SDK conversation owner이고, REPL은 직접 query 호출과 자체 state coordination을 유지한다.',
      code(`today:
REPL lifecycle ───────────────┐
                              ├→ query() → tools
print/SDK → QueryEngine ──────┘

direction stated in source:
REPL adapter ─┐
SDK adapter  ─┼→ QueryEngine/ConversationEngine → query/tools
bridge       ─┘`, '진행 중인 구조 seam') +
      p('이 migration의 성공 기준은 코드 재사용률이 아니다. 동일 prompt와 tool fixture에서 event ordering, permission, transcript, terminal result가 entrypoint 간 동등해야 한다.') + refs([src('src/QueryEngine.ts', '175-207'), src('src/screens/REPL.tsx', '2661-3024')])],

    ['TOOL COUPLING', 'Tool 계약은 강한 응집과 shotgun change를 동시에 만든다', '새 tool을 추가하면 model schema부터 UI까지 한 정의 안에서 볼 수 있지만, headless build도 React presentation에 닿는다.',
      table(['현재 장점', '현재 비용', '분해 시 지킬 것'], [
        ['한 정의로 누락 방지', '서로 다른 consumer의 dependency 결합', 'identity/schema 단일 소유'],
        ['tool별 응집', 'UI-only 변경이 runtime 타입에 영향', 'projection adapter 분리'],
        ['default 중앙화', 'default semantics가 모든 tool에 적합하다는 착시', 'capability별 명시적 override'],
        ['입력별 policy', 'permission/concurrency classifier 중복 parse 가능', 'validated input 공유'],
      ]) + refs([src('src/Tool.ts', '362-793')])],

    ['VARIABILITY', 'feature gate는 조건문이 아니라 product-line architecture다', 'AST 기준 feature() 호출이 광범위하며, 일부 모듈은 conditional require로 build output에서 문자열까지 제거한다.',
      p('이 환경에서는 “flag off면 실행 안 됨”만으로 부족하다. bun:bundle의 tree-shaking 제약 때문에 feature literal이 어떤 조건식에 등장하는지, gated module을 static import하는지까지 구조에 영향을 준다.') +
      table(['변형 축', '예', '구조 영향'], [
        ['제품 build', 'external/ant/simple/cowork', '도구·prompt·telemetry·문자열 포함 여부'],
        ['runtime mode', 'REPL/SDK/agent/plan', 'state owner와 permission'],
        ['provider/model', '1P/Bedrock/Vertex/model capability', 'beta header·tool search·thinking'],
        ['experiment', 'compact/stream execution/agent feature', 'recovery path와 persistent format'],
      ]) + refs([src('src/query.ts', '396-447'), src('src/services/api/claude.ts', '1174-1225')])],

    ['DCE', 'dead-code elimination 요구가 module boundary를 만든다', 'feature-gated string과 import가 외부 build에 남으면 안 되는 경우 dynamic require/import가 사용된다.',
      code(`const optional = feature("X")
  ? require("./feature-module.js")
  : null

// call sites must remain inside recognized feature condition`, 'build-time variability pattern') +
      p('일반적인 dependency injection 관점에서는 어색해 보여도, 여기서는 artifact 내용 자체가 acceptance constraint다. 리팩터링 시 static import로 바꾸면 runtime은 같아도 build가 다른 제품이 된다.') +
      callout('배경지식', '이것은 Strategy pattern보다 <b>software product line</b>과 conditional compilation 문제다. architecture fitness에는 동작 테스트뿐 아니라 excluded symbol/string 검사도 필요하다.')],

    ['OPERATIONS IN CODE', '주석에서 개발 운영의 흔적을 읽는다', '얕은 clone이라 Git history는 사용할 수 없지만, 코드에는 사고·성능 측정·compatibility 회귀를 막기 위한 결정 기록이 풍부하다.',
      table(['주석 패턴', '드러나는 작업', '보고서 해석'], [
        ['Without this…', '특정 failure chain의 원인과 결과', '불변조건 후보'],
        ['Previously…', '이전 설계와 회귀 방지', 'migration seam'],
        ['inc-/GH/#…', '운영 사건·외부 issue와 연결', '실제 pressure signal'],
        ['ms/MB/token 수치', 'profiling·production observation', '성능 판단 근거'],
        ['TODO: make required/extract', '의도된 contract tightening', 'refactoring 후보'],
      ]) + callout('주의', '주석은 유용하지만 최신성·완전성을 보장하지 않는다. 동작 코드와 관측 지표를 함께 읽고, 조직의 실제 프로세스나 원인을 과잉 추정하지 않는다.', 'trade')],

    ['OBSERVABILITY', 'telemetry는 리팩터링의 동등성 oracle이 될 수 있다', 'logEvent와 queryCheckpoint가 광범위하게 분포한다. 단순 usage analytics가 아니라 failure funnel과 critical path를 설명하는 event도 많다.',
      cards([
        ['chain', 'queryChainId/depth', p('재귀 turn과 subquery를 한 인과 흐름으로 연결.')],
        ['request', 'request id/model/provider', p('stream/fallback/retry를 같은 시도로 결합.')],
        ['effect', 'tool name/id/duration/result', p('권한·실행·오류 단계 비교.')],
        ['durability', 'resume consistency', p('in-session과 restored projection 차이 감시.')],
      ]) + verdict('운영과 설계의 연결', '새 architecture로 옮기기 전에 현 event trace를 golden baseline으로 삼으면, source 구조가 바뀌어도 product semantics의 손실을 탐지할 수 있다.')],

    ['COMPATIBILITY', '호환성은 경계마다 다른 형태로 나타난다', 'legacy alias 하나만의 문제가 아니다. protocol, serialized transcript, provider, OS, Node version, tool schema가 모두 compatibility surface다.',
      table(['surface', '예', '격리 방향'], [
        ['tool identity', 'deprecated alias', 'registry resolver'],
        ['observable input', 'legacy/derived fields', 'observer adapter clone'],
        ['transcript', 'old message/metadata shape', 'versioned reader/projection'],
        ['provider', 'beta header/tool-search support', 'provider capability adapter'],
        ['OS/shell', 'Windows path/PowerShell/mtime', 'platform effect adapter'],
        ['runtime', 'Node 18 API 차이', 'compat utilities/build target'],
      ]) + p('호환 코드를 core branch 곳곳에 두면 새 기능과 곱해진다. “compatibility normalization before core”와 “projection after core” 두 방향으로 몰아야 한다.')],

    ['REFACTOR RUBRIC', '리팩터링 우선순위를 결합도와 오류 비용으로 정한다', '큰 파일 순서가 아니라 state ownership과 effect 위험으로 정렬한다.',
      table(['후보', '가치', '위험', '우선 조건'], [
        ['REPL→QueryEngine 합류', 'turn semantics 단일 owner', 'interactive race/latency 회귀', 'golden event trace'],
        ['Tool facet 분해', 'headless/UI dependency 절단', 'schema/prompt drift', 'adapter + contract fixture'],
        ['session journal/projection 분리', 'resume reasoning 단순화', 'format 호환·data loss', 'versioned replay corpus'],
        ['recovery policy 추출', 'query branch 축소·반복 guard 명시', 'event 순서 변화', 'failure matrix'],
        ['context compiler IR', 'cache/provenance 명시', 'cache hit 저하', 'request hash baseline'],
      ])],

    ['PHASE A', '1단계: 현재 의미를 trace로 고정한다', '코드 이동 전에 한 turn의 사건과 외부 효과를 기록하는 characterization harness가 필요하다.',
      ol([
        'fixture: text-only success, Read→Edit→Bash, permission deny, user abort, stream fallback, prompt-too-long, resume.',
        '관측: CoreEvent sequence, tool ids, terminal reason, provider request hash, transcript projection, filesystem diff.',
        'entrypoint: REPL adapter와 SDK adapter가 같은 fixture에서 허용된 차이만 보이는지 비교.',
        'feature: 주요 gate on/off 조합을 pairwise로 선택하고 excluded symbol 검사 포함.',
      ]) + callout('왜 먼저인가', '복원 저장소에는 완전한 test suite와 build module이 없다. 새 unit test만 쓰면 현재 암묵 contract를 놓치므로 characterization이 선행되어야 한다.', 'good')],

    ['PHASE B', '2단계: ConversationEngine의 ownership을 완성한다', 'QueryEngine을 단순 wrapper가 아니라 turn state·durability boundary의 owner로 만든다.',
      layers([
        ['protocol', 'UI/SDK 독립 CoreInput/CoreEvent/Terminal 정의'],
        ['engine', 'context build→query→journal→settlement 순서 소유'],
        ['policy ports', 'permission, recovery, durability mode를 주입'],
        ['adapters', 'REPL/SDK/bridge가 projection과 interaction만 소유'],
      ]) + p('REPL을 한 번에 옮기지 말고 shadow execution 또는 trace comparison으로 단계화한다. queryGuard와 prompt restore처럼 interactive-only인 책임은 adapter에 남긴다.')],

    ['PHASE C', '3단계: Tool과 session의 변화 이유를 분리한다', 'engine 통합 뒤에 effect와 durability를 각각 좁힌다.',
      table(['작업', '먼저 만드는 seam', 'acceptance'], [
        ['Tool 분해', '기존 Tool→facet adapter', '모든 기존 tool schema/result snapshot 동일'],
        ['presentation 분리', 'ToolPresenter registry', 'REPL render와 transcript search fidelity'],
        ['journal 분리', 'append writer + immutable records', 'crash/flush ordering 유지'],
        ['resume 분리', 'versioned projector/repair stages', 'historical corpus 재생'],
        ['recovery 추출', 'transition table + guard state', '동일 failure trace/호출 횟수'],
      ]) + callout('순서의 이유', '동시에 바꾸면 어떤 layer가 semantic drift를 만들었는지 찾기 어렵다. engine owner를 먼저 고정하고 effect/projection/durability를 한 축씩 옮긴다.', 'trade')],

    ['FITNESS', '새 구조는 자동화된 경계 검사로 유지한다', '문서상의 목표만으로는 다시 결합된다.',
      table(['fitness rule', '막는 회귀'], [
        ['engine core는 React/Ink import 금지', 'headless core가 presentation에 재결합'],
        ['provider request는 ContextIR assembler만 생성', 'cache prefix 규칙 분산'],
        ['ToolEffect는 Presenter import 금지', '실행과 UI 결합'],
        ['journal record는 versioned union', 'silent resume format drift'],
        ['feature-gated module static import 검사', 'build artifact에 excluded code 유입'],
        ['CoreEvent exhaustive projection', '새 event가 REPL/SDK 중 한쪽에서 누락'],
      ]) + verdict('구조의 완료 조건', '디렉터리가 예뻐지는 것이 아니라, 잘못된 dependency와 누락된 variant가 CI에서 실패해야 한다.')],

    ['PROJECT OPERATIONS', '개발 운영은 세 종류의 feedback loop로 닫힌다', '설계·성능·안전 판단을 배포 후 증거와 연결한다.',
      layers([
        ['correctness loop', 'failure trace→불변조건→characterization→refactor'],
        ['performance loop', 'checkpoint/production distribution→critical path 변경→회귀 budget'],
        ['rollout loop', 'feature gate→cohort telemetry→kill switch→cleanup/deletion'],
      ]) +
      p('feature flag를 영구 architecture로 남기지 않으려면 각 flag에 owner, 비교 지표, 제거 조건, persistent format 영향이 필요하다. 그렇지 않으면 recovery branch와 provider 조합이 계속 곱해진다.')],

    ['STUDY RUBRIC', '이 프로젝트를 공부했다는 증거', '파일을 많이 읽었는지가 아니라 설계 판단을 반례와 함께 설명할 수 있는지를 본다.',
      table(['수준', '설명할 수 있어야 하는 것', '실습 산출물'], [
        ['구현', 'Edit가 stale write를 어떻게 막는가', 'read/edit race 재현'],
        ['통합', 'tool result가 다음 model request와 transcript에 어떻게 합류하는가', 'end-to-end trace'],
        ['실패', 'stream fallback/abort에서 orphan과 double effect를 어떻게 막는가', 'failure matrix'],
        ['구조', 'REPL/SDK 중복 ownership과 migration seam', 'responsibility map'],
        ['운영', 'cache/latency/security 지표가 코드 구조를 어떻게 바꾸는가', 'metric-linked ADR'],
        ['리팩터링', '단계별 oracle과 rollback 기준', 'phased change proposal'],
      ]) + callout('발표 기준', '상위 흐름을 나열하는 대신 하나의 불변조건을 고르고, 정상·실패·resume 경로에서 어떤 코드와 state가 그것을 보존하는지 설명한다.')],

    ['LIMITS', '이 분석이 말할 수 없는 것', '복원본의 구조만으로 실제 조직·테스트·배포 체계를 완전히 알 수 없다.',
      ul([
        'shallow clone은 장기 Git history와 실제 refactor chronology를 제공하지 않는다.',
        'README가 밝힌 누락 feature modules 때문에 import graph와 build 결과가 불완전하다.',
        'feature() 호출 존재는 현재 사용자 build에서 활성임을 뜻하지 않는다.',
        '주석의 incident 번호와 production 수치는 외부 record 없이 독립 검증할 수 없다.',
        '제안한 target architecture는 교육적 재구성이며 upstream roadmap이 아니다.',
      ]) + p('이 한계를 유지하면서도 state owner, effect boundary, protocol invariant, 현재 코드의 explicit migration comment는 충분히 학습할 수 있다.')],

    ['CONCLUSION', '구조 개선의 중심 원칙', '이 프로젝트는 복잡해서 계층을 더 만드는 것이 아니라, 외부 효과와 장기 상태를 안전하게 다뤄야 해서 복잡하다.',
      ul([
        'turn semantics를 한 conversation owner로 모은다.',
        'model representation, authority, effect, projection, durability를 분리한다.',
        'cache·resume·compatibility처럼 bytes와 history에 민감한 계약은 먼저 oracle을 만든다.',
        'feature variability를 build/runtime/provider 축으로 명시하고 조합 폭발을 관리한다.',
        '운영 telemetry를 새 구조의 동등성·성능·안전 acceptance에 사용한다.',
        '리팩터링은 파일 이동이 아니라 불변조건의 소유권을 선명하게 만드는 작업이다.',
      ])],
  ],
})

await buildAll()
