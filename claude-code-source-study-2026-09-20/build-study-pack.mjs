import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'
import { chromium } from 'playwright'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const SOURCE_ROOT = process.argv[2]
  ? path.resolve(process.argv[2])
  : '/tmp/claude-code-study.0hoYqm/repo'
const SOURCE_DIR = path.join(SOURCE_ROOT, 'src')
const COMMIT = '2ca5ddabfed5f220812ea11f029eda03b21bc4c1'
const SNAPSHOT = 'Claude Code v2.1.88 / third-party reconstructed source'
const REPO = 'https://github.com/stupidhumans/claude-code-source-code'
const GH = `${REPO}/blob/${COMMIT}`
const CREATED = '2026-09-20'

const esc = value =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')

const src = (file, line, label = file) => {
  const suffix = line ? `#L${String(line).replace('-', '-L')}` : ''
  return `<a href="${GH}/${file}${suffix}">${esc(label)}</a>`
}

const ext = (url, label) => `<a href="${url}">${esc(label)}</a>`

const p = (...items) => `<p>${items.join('')}</p>`
const ul = items => `<ul>${items.map(item => `<li>${item}</li>`).join('')}</ul>`
const ol = items => `<ol>${items.map(item => `<li>${item}</li>`).join('')}</ol>`
const note = (title, body, tone = 'note') =>
  `<aside class="callout ${tone}"><strong>${title}</strong><div>${body}</div></aside>`
const code = (body, label = '개념 의사코드') =>
  `<figure class="code"><figcaption>${label}</figcaption><pre>${esc(body)}</pre></figure>`
const table = (headers, rows, widths = []) => `
  <table><colgroup>${widths.map(w => `<col style="width:${w}">`).join('')}</colgroup>
  <thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
  <tbody>${rows
    .map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`)
    .join('')}</tbody></table>`
const cards = items =>
  `<div class="cards">${items
    .map(
      item =>
        `<article class="card"><span class="eyebrow">${item.kicker ?? ''}</span><h3>${item.title}</h3><div>${item.body}</div></article>`,
    )
    .join('')}</div>`
const flow = items =>
  `<div class="flow">${items
    .map(
      (item, index) =>
        `${index ? '<span class="arrow">→</span>' : ''}<div class="node"><b>${item[0]}</b><small>${item[1]}</small></div>`,
    )
    .join('')}</div>`
const metric = (value, label, detail = '') =>
  `<div class="metric"><b>${value}</b><span>${label}</span><small>${detail}</small></div>`
const refs = items =>
  `<div class="refs"><b>근거 위치</b>${items.map(item => `<span>${item}</span>`).join('')}</div>`
const exercise = (title, task, evidence) => `
  <div class="exercise"><b>실습 · ${title}</b><p>${task}</p><small>완료 증거: ${evidence}</small></div>`
const check = items => `<div class="checklist">${items.map(item => `<div>□ ${item}</div>`).join('')}</div>`

function section(kicker, title, lede, body, index) {
  return `<section class="sheet">
    <div class="section-head"><span>${kicker}</span><em>${String(index).padStart(2, '0')}</em></div>
    <h2>${title}</h2><p class="lede">${lede}</p>
    <div class="section-body">${body}</div>
    <div class="sheet-foot"><span>${SNAPSHOT}</span><span>${CREATED}</span></div>
  </section>`
}

function cover(report) {
  return `<section class="cover sheet" style="--accent:${report.accent}">
    <div class="cover-top"><span>CLAUDE CODE SOURCE STUDY</span><span>VOL. ${report.volume}</span></div>
    <div class="cover-mark">${report.symbol}</div>
    <h1>${report.title}</h1><p>${report.subtitle}</p>
    <div class="cover-grid">
      <div><small>분석 대상</small><b>v2.1.88 reconstructed source</b></div>
      <div><small>고정 리비전</small><b>${COMMIT.slice(0, 12)}</b></div>
      <div><small>독자</small><b>${report.audience}</b></div>
      <div><small>사용 방식</small><b>${report.mode}</b></div>
    </div>
    <div class="cover-warning">교육·연구용 파생 분석입니다. Anthropic의 공식 소스·공식 아키텍처 문서가 아닙니다.</div>
    <div class="sheet-foot"><span>Study Pack / ${CREATED}</span><span>한국어</span></div>
  </section>`
}

function htmlDocument(report, renderedSections) {
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${esc(report.title)}</title><style>${CSS.replaceAll('__ACCENT__', report.accent)}</style></head>
  <body>${cover(report)}${renderedSections.join('')}</body></html>`
}

const CSS = String.raw`
@page { size: A4; margin: 0; }
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; color: #17212b; background: #dce2e8; font-family: "Pretendard", "Apple SD Gothic Neo", "Noto Sans KR", sans-serif; }
body { counter-reset: sheet; }
.sheet { --accent: __ACCENT__; width: 210mm; min-height: 297mm; margin: 0 auto; padding: 17mm 17mm 15mm; background: #fbfaf7; break-after: page; position: relative; overflow: hidden; counter-increment: sheet; }
.sheet::after { content: ""; position: absolute; inset: auto 0 0; height: 5mm; background: linear-gradient(90deg, var(--accent), #182735 78%); }
.sheet-foot { position: absolute; bottom: 7mm; left: 17mm; right: 17mm; display: flex; justify-content: space-between; font-size: 7.5pt; color: #6a747f; letter-spacing: .03em; }
.cover { color: #f8fafb; background: radial-gradient(circle at 82% 22%, color-mix(in srgb, var(--accent) 72%, transparent), transparent 29%), linear-gradient(145deg, #101a24 0 56%, #1b2b38 56% 100%); display: flex; flex-direction: column; }
.cover::after { height: 9mm; background: var(--accent); }
.cover-top { display:flex; justify-content:space-between; font-size:9pt; letter-spacing:.14em; color:#bcd0de; border-bottom:1px solid #496071; padding-bottom:5mm; }
.cover-mark { width:34mm; height:34mm; margin-top:30mm; border-radius:50%; border:2px solid var(--accent); display:grid; place-items:center; font:700 30pt ui-monospace, monospace; color:var(--accent); }
.cover h1 { font-size:31pt; line-height:1.12; margin:12mm 0 5mm; max-width:165mm; letter-spacing:-.035em; }
.cover > p { font-size:13pt; line-height:1.55; color:#d5e0e7; max-width:150mm; }
.cover-grid { margin-top:auto; display:grid; grid-template-columns:1fr 1fr; gap:5mm; }
.cover-grid div { padding:4mm; border-top:1px solid #526979; background:#ffffff08; }
.cover-grid small, .cover-grid b { display:block; }.cover-grid small{color:#98acba;font-size:8pt;margin-bottom:2mm}.cover-grid b{font-size:10pt}
.cover-warning { margin:8mm 0 8mm; padding:4mm; border-left:3px solid var(--accent); background:#ffffff0c; font-size:8.6pt; line-height:1.5; }
.cover .sheet-foot{color:#aebec8;bottom:11mm}.section-head{display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #c8d0d5;padding-bottom:3mm;color:var(--accent);font-weight:800;font-size:8pt;letter-spacing:.12em;text-transform:uppercase}.section-head em{font-style:normal;font:700 18pt ui-monospace,monospace;color:#aab3ba}.sheet h2{font-size:23pt;line-height:1.18;letter-spacing:-.035em;margin:7mm 0 3mm;max-width:170mm}.lede{font-size:11pt;line-height:1.62;color:#465462;margin:0 0 6mm;max-width:168mm}.section-body{font-size:9.2pt;line-height:1.58}.section-body p{margin:0 0 3mm}.section-body h3{font-size:11.5pt;margin:4mm 0 2mm;color:#223242}.section-body ul,.section-body ol{margin:1.5mm 0 4mm;padding-left:5mm}.section-body li{margin:1.2mm 0}.eyebrow{display:block;font-size:7pt;letter-spacing:.12em;color:var(--accent);font-weight:800;text-transform:uppercase}.cards{display:grid;grid-template-columns:1fr 1fr;gap:4mm;margin:4mm 0}.card{padding:4mm;border:1px solid #d1d7da;border-radius:3mm;background:#fff}.card h3{margin:1mm 0 2mm}.card p{font-size:8.5pt}.flow{display:flex;align-items:stretch;gap:2mm;margin:5mm 0}.node{flex:1;border:1px solid #bec8cf;background:#fff;border-radius:2mm;padding:3mm;text-align:center;min-width:0}.node b,.node small{display:block}.node b{font-size:9pt;color:#263845}.node small{font-size:7.2pt;color:#6c7881;margin-top:1mm}.arrow{align-self:center;color:var(--accent);font-size:14pt;font-weight:900}table{width:100%;border-collapse:collapse;margin:4mm 0;font-size:7.8pt;line-height:1.4;table-layout:fixed}th{background:#253846;color:#fff;text-align:left;padding:2.2mm;vertical-align:top}td{border:1px solid #d3d8dc;padding:2.2mm;vertical-align:top;background:#fff}tr:nth-child(even) td{background:#f2f4f4}.callout{margin:4mm 0;padding:3.5mm 4mm;border-left:3px solid var(--accent);background:#eef4f5}.callout strong{display:block;color:#253846;margin-bottom:1mm}.callout.warn{border-color:#d07a2b;background:#fff4e9}.callout.risk{border-color:#b44444;background:#fff0ef}.callout.good{border-color:#2a8a6a;background:#edf8f3}.code{margin:4mm 0;border-radius:2mm;overflow:hidden;background:#111b24;color:#e9f2f6}.code figcaption{padding:2mm 3mm;background:#203341;color:#9fc8d7;font-size:7.5pt;letter-spacing:.06em}.code pre{margin:0;padding:4mm;font:7.8pt/1.55 "SFMono-Regular",Consolas,monospace;white-space:pre-wrap}.refs{margin-top:5mm;padding-top:3mm;border-top:1px solid #ccd3d7;font-size:7.5pt;color:#596773;display:flex;gap:2mm;flex-wrap:wrap}.refs b{color:#263845}.refs span:not(:last-child)::after{content:" ·"}.refs a,.section-body a{color:#18627b;text-decoration:none;border-bottom:1px solid #9db7c2}.metrics{display:grid;grid-template-columns:repeat(4,1fr);gap:3mm;margin:4mm 0}.metric{padding:3mm;border-top:3px solid var(--accent);background:#fff;border-radius:1mm;box-shadow:0 1px 5px #0011}.metric b,.metric span,.metric small{display:block}.metric b{font:800 17pt ui-monospace,monospace;color:#253845}.metric span{font-weight:700;margin-top:1mm}.metric small{font-size:7pt;color:#74808a;margin-top:1mm}.exercise{margin:4mm 0;padding:4mm;border:1px dashed #8aa4b3;border-radius:2mm;background:#f4f8f9}.exercise b{color:#1f596e}.exercise small{display:block;color:#61727c}.checklist{columns:2;column-gap:8mm;margin:4mm 0}.checklist div{break-inside:avoid;padding:1.3mm 0;border-bottom:1px dotted #c9d0d3}.bar{display:grid;grid-template-columns:34mm 1fr 17mm;gap:2mm;align-items:center;margin:1.7mm 0}.bar i{height:3mm;background:linear-gradient(90deg,var(--accent),#8bb7c8);border-radius:3mm;display:block}.bar span:last-child{text-align:right;font:7pt ui-monospace,monospace}.two{display:grid;grid-template-columns:1fr 1fr;gap:5mm}.three{display:grid;grid-template-columns:repeat(3,1fr);gap:4mm}.tag{display:inline-block;padding:.5mm 1.5mm;border-radius:10mm;background:#dfecee;color:#275367;font-size:7pt;font-weight:700;margin:.4mm}.quote{font-size:14pt;line-height:1.45;border-left:5px solid var(--accent);padding:4mm 0 4mm 6mm;margin:6mm 0;color:#263946;font-weight:700}.muted{color:#697680}.small{font-size:7.8pt}.page-title{font-size:14pt;font-weight:800}.timeline{border-left:2px solid var(--accent);padding-left:5mm;margin:4mm}.timeline div{position:relative;margin:0 0 4mm}.timeline div::before{content:"";position:absolute;width:2.5mm;height:2.5mm;background:var(--accent);border-radius:50%;left:-6.4mm;top:1.5mm}.timeline b{display:block}.timeline small{color:#63717b}.matrix td:first-child,.matrix th:first-child{font-weight:800}.dense{font-size:7.4pt}
`

async function collectMetrics() {
  const files = []
  async function walk(dir) {
    for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) await walk(full)
      else if (/\.tsx?$/.test(entry.name)) files.push(full)
    }
  }
  await walk(SOURCE_DIR)
  const metrics = {
    sourceRevision: COMMIT,
    version: '2.1.88',
    files: files.length,
    ts: 0,
    tsx: 0,
    physicalLines: 0,
    bytes: 0,
    functions: 0,
    asyncFunctions: 0,
    generators: 0,
    asyncGenerators: 0,
    yields: 0,
    yieldDelegations: 0,
    forAwait: 0,
    awaitExpressions: 0,
    typeAliases: 0,
    interfaces: 0,
    classes: 0,
    featureCalls: 0,
    dynamicImports: 0,
    usingDeclarations: 0,
    optionalChains: 0,
    satisfiesExpressions: 0,
    directories: {},
    externalImports: {},
    hookCalls: {},
  }
  const increment = (record, key) => (record[key] = (record[key] ?? 0) + 1)
  for (const file of files) {
    const text = await fs.readFile(file, 'utf8')
    const rel = path.relative(SOURCE_DIR, file)
    const top = rel.includes(path.sep) ? rel.split(path.sep)[0] : '[root]'
    const lineCount = (text.match(/\n/g) ?? []).length
    const directory = (metrics.directories[top] ??= { files: 0, lines: 0 })
    directory.files += 1
    directory.lines += lineCount
    metrics.physicalLines += lineCount
    metrics.bytes += Buffer.byteLength(text)
    file.endsWith('.tsx') ? metrics.tsx++ : metrics.ts++
    const sourceFile = ts.createSourceFile(
      file,
      text,
      ts.ScriptTarget.Latest,
      true,
      file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
    )
    const visit = node => {
      if (ts.isFunctionLike(node) && node.body) {
        metrics.functions++
        const isAsync = node.modifiers?.some(m => m.kind === ts.SyntaxKind.AsyncKeyword)
        const isGenerator = Boolean(node.asteriskToken)
        if (isAsync) metrics.asyncFunctions++
        if (isGenerator) metrics.generators++
        if (isAsync && isGenerator) metrics.asyncGenerators++
      }
      if (ts.isYieldExpression(node)) {
        metrics.yields++
        if (node.asteriskToken) metrics.yieldDelegations++
      }
      if (ts.isForOfStatement(node) && node.awaitModifier) metrics.forAwait++
      if (ts.isAwaitExpression(node)) metrics.awaitExpressions++
      if (ts.isTypeAliasDeclaration(node)) metrics.typeAliases++
      if (ts.isInterfaceDeclaration(node)) metrics.interfaces++
      if (ts.isClassLike(node)) metrics.classes++
      if (ts.isCallExpression(node)) {
        const expression = node.expression.getText(sourceFile)
        if (node.expression.kind === ts.SyntaxKind.ImportKeyword) metrics.dynamicImports++
        if (expression === 'feature') metrics.featureCalls++
        if (/^use[A-Z]/.test(expression)) increment(metrics.hookCalls, expression)
      }
      if (
        ts.isPropertyAccessChain?.(node) ||
        ts.isElementAccessChain?.(node) ||
        ts.isCallChain?.(node)
      )
        metrics.optionalChains++
      if (ts.isSatisfiesExpression?.(node)) metrics.satisfiesExpressions++
      if (ts.isVariableDeclarationList(node) && node.flags & ts.NodeFlags.Using)
        metrics.usingDeclarations++
      if (
        ts.isImportDeclaration(node) &&
        ts.isStringLiteral(node.moduleSpecifier) &&
        !node.moduleSpecifier.text.startsWith('.') &&
        !node.moduleSpecifier.text.startsWith('src/')
      ) {
        const parts = node.moduleSpecifier.text.split('/')
        const pkg = node.moduleSpecifier.text.startsWith('@')
          ? parts.slice(0, 2).join('/')
          : parts[0]
        increment(metrics.externalImports, pkg)
      }
      ts.forEachChild(node, visit)
    }
    visit(sourceFile)
  }
  return metrics
}

const sourceNotice = note(
  '증거 등급',
  '코드 위치와 분포 수치는 고정 커밋의 정적 분석 결과다. 제품 의도·운영 동작·현재 버전에 대한 설명은 별도 검증 없이는 추정으로 취급한다. 저장소 자체가 “decompiled source”라고 밝히며 완전 재빌드 불가와 누락 모듈을 명시한다.',
  'warn',
)

const reports = [
  {
    volume: '00',
    slug: '00-study-roadmap-and-scope',
    symbol: 'MAP',
    accent: '#e5a63b',
    title: '학습 지도와 분석 범위',
    subtitle: '무엇을, 어떤 신뢰 수준으로, 어떤 순서로 읽을 것인가',
    audience: '전체 스터디 참여자',
    mode: '오리엔테이션 · 범위 합의',
    sections: [
      [
        'READ FIRST',
        '이 자료의 정체와 사용 한계',
        '이 묶음은 “공개된 제3자 복원 저장소를 학습 대상으로 삼은 파생 해설서”다. 공식 구현 사양이나 재배포 가능한 소스 묶음이 아니다.',
        sourceNotice +
          cards([
            { kicker: '확인됨', title: '버전·리비전', body: p('저장소 표기는 v2.1.88, 분석 고정 커밋은 ', `<code>${COMMIT.slice(0, 12)}</code>`, '이다.') },
            { kicker: '확인됨', title: '불완전성', body: p('README/QUICKSTART는 feature gate 뒤의 108개 모듈과 내부 빌드 구성이 빠졌다고 설명한다.') },
            { kicker: '주의', title: '라이선스', body: p('루트에 LICENSE 파일이 없다. README의 교육·비상업 안내를 법적 라이선스로 오인하지 않는다.') },
            { kicker: '사용 원칙', title: '재현보다 이해', body: p('코드를 복제하지 않고 메커니즘, 구조, 트레이드오프, 검증 질문을 학습한다.') },
          ]) +
          refs([src('README_KR.md', '1-70'), src('QUICKSTART.md', '1-80'), ext(REPO, '대상 저장소')]),
      ],
      [
        'REQUEST → CURRICULUM',
        '요청을 일곱 권으로 분해한 기준',
        '기능 흐름만 좇지 않고 “도메인 요구 → 언어 메커니즘 → 프로그래밍 표현 → 코드 구조 → 운영 속성”을 한 묶음으로 읽는다.',
        flow([
          ['사용자 경험', '입력·스트리밍·도구·취소'],
          ['도메인 요구', '점진성·권한·회복·확장'],
          ['언어 장치', 'generator·union·AbortSignal'],
          ['구조', 'REPL·query·tool runtime·Ink'],
          ['검증', '근거 위치·실습·반례'],
        ]) +
          table(
            ['권', '핵심 질문', '주요 산출'],
            [
              ['00', '어디까지, 어떤 순서로 볼까?', '범위·신뢰도·학습 경로'],
              ['01', '시스템은 어떤 책임 덩어리로 이루어졌나?', '코드 지도·의존성·핫스폿'],
              ['02', '왜 이런 TypeScript/JavaScript 표현이 필요한가?', '언어 메커니즘 해설'],
              ['03', '모델·스트림·도구가 어떻게 한 턴을 만든가?', '에이전트 루프 상태기계'],
              ['04', '터미널 UI가 왜 React/Ink인가?', '렌더러·입력·스크롤백'],
              ['05', '도구 능력을 어떻게 제한·확장하는가?', '권한·훅·MCP·플러그인'],
              ['06', '어떻게 직접 검증하며 공부할까?', '실습·퀴즈·평가 루브릭'],
            ],
            ['12%', '36%', '52%'],
          ),
      ],
      [
        'SCOPE',
        '아홉 개 분석 범주',
        '영상이 강조한 두 축—async generator 에이전트 루프와 React/Ink UI—에 더해 실제 제품을 성립시키는 주변 메커니즘을 포함했다.',
        cards([
          { kicker: '1', title: '진입·표면', body: p('CLI, interactive REPL, print/headless, SDK, bridge/remote.') },
          { kicker: '2', title: '대화·상태', body: p('메시지 union, AppState, 세션 저장, 히스토리, 첨부.') },
          { kicker: '3', title: '모델 호출', body: p('요청 구성, 스트리밍 이벤트, fallback, 토큰·비용.') },
          { kicker: '4', title: '에이전트 루프', body: p('컨텍스트 압축, 도구 탐지·실행, 후속 턴, 종료 이유.') },
          { kicker: '5', title: '도구 런타임', body: p('스키마, 동시성 안전성, 결과 정규화, 진행 이벤트.') },
          { kicker: '6', title: '권한·안전', body: p('mode, 규칙, hook, shell AST, sandbox, human gate.') },
          { kicker: '7', title: '터미널 UI', body: p('reconciler, Ink, Yoga, ANSI, Static, input hook.') },
          { kicker: '8', title: '확장', body: p('MCP, plugin, skill, command, agent/task, tool search.') },
          { kicker: '9', title: '빌드·관측', body: p('Bun feature gate, dynamic import, analytics, profiler, 복원 한계.') },
        ]),
      ],
      [
        'EVIDENCE MODEL',
        '사실·해석·추정을 섞지 않는 법',
        '복원 소스는 풍부하지만 공식성·완전성이 낮다. 각 주장에 근거 등급을 붙이면 흥미로운 서사를 사실처럼 굳히는 오류를 줄일 수 있다.',
        table(
          ['등급', '정의', '예시', '보고서 표기'],
          [
            ['A', '고정 커밋의 코드·구조로 직접 확인', '<code>query()</code>가 <code>yield*</code>로 내부 루프를 위임', '“코드에서 확인”'],
            ['B', '저장소 문서가 주장하나 독립 검증이 부족', '누락 모듈 수, 추출 방식', '“저장소 설명에 따르면”'],
            ['C', '공식 사양·공식 문서와 코드가 합치', 'MCP tool schema, AbortSignal', '“사양과 구현이 대응”'],
            ['D', '구조에서 합리적으로 도출한 해석', 'UI/core 교체 가능성, 특정 trade-off', '“해석/가설”'],
            ['X', '현 리비전으로 검증 불가', '서버 내부 정책, 제거된 feature의 실제 동작', '“미확인”'],
          ],
        ) +
          note('읽기 규칙', '“파일이 존재한다”와 “운영에서 활성화된다”는 다른 주장이다. feature gate, 설정, 서버 capability, 사용자 권한까지 닫혀야 실제 경로가 된다.'),
      ],
      [
        'VIDEO BRIDGE',
        '두 영상과 보고서의 연결',
        '영상은 좋은 진입점이지만 설명 모델과 정확한 구현 사실을 구분해 읽는다.',
        table(
          ['영상의 렌즈', '핵심 주장', '확장·보정할 지점', '연결 권'],
          [
            [ext('https://www.youtube.com/watch?v=3ZnBDXQQN_E', 'async generator 영상'), '루프가 await와 yield를 함께 써야 스트림·도구·중단을 표현할 수 있다.', '실제 코드는 압축·fallback·tombstone·hook·budget·terminal reason까지 가진다.', '02, 03'],
            [ext('https://www.youtube.com/watch?v=W83jWFwEnTU&t=61s', 'React/Ink 영상'), 'UI는 React, core는 순수 TS이며 callback 경계로 연결된다.', '배칭을 “고정 16ms”로 단정하지 말고 renderer/scheduler 구현과 측정으로 검증한다.', '01, 04'],
          ],
        ) +
          note('좋은 재구성 질문', '“제너레이터가 쓰였다”에서 멈추지 말고, 어떤 요구가 iterator의 pull semantics·중단·오류 전파·상태 보존을 필요로 했는지 역으로 추적한다.', 'good'),
      ],
      [
        'CONCEPT LATTICE',
        '상위 흐름에서 세부 표현까지 내려가기',
        '모든 장은 동일한 다섯 층을 왕복한다. 이 방식이 단순 호출 그래프를 교육 자료로 바꾸는 핵심이다.',
        table(
          ['층', '질문', '대표 개념', '코드에서 찾을 표현'],
          [
            ['도메인', '사용자가 무엇을 기대하는가?', '응답이 즉시 보임, 취소 가능, 위험 작업 확인', '입력·progress·permission UI'],
            ['시간', '무엇이 언제 도착하고 멈추는가?', 'SSE, backpressure, turn, retry', '<code>async function*</code>, <code>for await</code>, signal'],
            ['타입', '유효한 상태를 어떻게 표현하는가?', 'event algebra, terminal reasons', 'discriminated union, <code>never</code>'],
            ['구조', '변경 이유를 어디에 가두는가?', 'renderer adapter, tool contract', 'module, interface, composition'],
            ['운영', '실패·권한·관측을 어떻게 다루는가?', 'least privilege, complete mediation', 'hook, permission, telemetry, checkpoint'],
          ],
        ),
      ],
      [
        'READING ORDER',
        '코드 읽기 순서: 바깥에서 안쪽으로',
        '대형 파일부터 무작정 읽지 않는다. 먼저 안정된 계약과 경계를 잡고, 한 사용자 사건을 따라 내부로 들어간다.',
        ol([
          `<b>정체성·한계</b> — ${src('README_KR.md', '1-70')}, ${src('QUICKSTART.md', '1-80')}.`,
          `<b>메시지·권한 타입</b> — 복원본에서 빠진 <code>types/message</code>의 참조 지점 ${src('src/query.ts', '27-38')}과 ${src('src/types/permissions.ts', '1-120')}.`,
          `<b>도구 계약</b> — ${src('src/Tool.ts', '321-416')}와 <code>buildTool</code>.`,
          `<b>루프 골격</b> — ${src('src/query.ts', '219-300')} → 650 → 1357 → 1715.`,
          `<b>실행 파이프</b> — ${src('src/services/tools/toolOrchestration.ts', '19-188')}와 toolExecution.`,
          `<b>UI 경계</b> — ${src('src/screens/REPL.tsx', '2661-3024')}와 PromptInput.`,
          `<b>renderer 내부</b> — <code>src/ink/reconciler.ts</code>, <code>renderer.ts</code>, <code>render-to-screen.ts</code>.`,
          `<b>확장·보안</b> — permissions, hooks, MCP, plugins, skills를 관심사별로 읽는다.`,
        ]) +
          note('중단 기준', '30분 안에 “이 파일이 어떤 경계를 소유하는가”를 한 문장으로 말할 수 없으면 호출자를 더 읽지 말고 타입·public contract·데이터 모양으로 돌아간다.'),
      ],
      [
        'ADDITIONAL SCOPE',
        '상세 보고서를 위해 추가한 주제',
        '요청에 직접 언급되지 않았지만 기능의 이유와 구조를 연결하려면 빠뜨리기 어려운 분석 영역이다.',
        cards([
          { kicker: '시간', title: '취소·timeout·retry', body: p('비동기 흐름의 품질은 성공 경로보다 중단 경로에서 드러난다.') },
          { kicker: '메모리', title: '압축·결과 예산', body: p('긴 세션에서 컨텍스트가 유한 자원이라는 사실이 루프 구조를 바꾼다.') },
          { kicker: '능력', title: '권한·sandbox', body: p('도구가 생기는 순간 모델 출력은 외부 효과 권한으로 바뀐다.') },
          { kicker: '확장', title: 'MCP·plugin·skill', body: p('모든 확장은 같은 수준이 아니며 discovery, schema, execution authority가 다르다.') },
          { kicker: '관측', title: 'telemetry·checkpoint', body: p('복잡한 turn을 디버깅하려면 단계·원인·식별자를 구조화해야 한다.') },
          { kicker: '구조 부채', title: '의존성 순환·허브', body: p('복원된 1,884파일에서 거대 SCC가 보이며, 변경 위험을 따로 읽어야 한다.') },
        ]),
      ],
      [
        '8-WEEK PATH',
        '권장 스터디 운영',
        '주 2회, 회당 90분을 기준으로 “개념 25분 → 코드 35분 → 실험 20분 → 회고 10분”의 리듬을 사용한다.',
        `<div class="timeline">
          <div><b>1주 · 증거와 지도</b><small>00–01권, repo 신뢰도·entry surface·핫스폿</small></div>
          <div><b>2주 · 비동기 언어</b><small>02권, iterator/generator/AbortSignal 미니 실험</small></div>
          <div><b>3주 · 에이전트 턴</b><small>03권 전반, query state·stream·tool-use</small></div>
          <div><b>4주 · 회복과 컨텍스트</b><small>03권 후반, compaction·fallback·terminal reason</small></div>
          <div><b>5주 · 터미널 UI</b><small>04권, React reconciler·Ink·prompt submit</small></div>
          <div><b>6주 · 도구·권한</b><small>05권 전반, schema·permission·hook·shell safety</small></div>
          <div><b>7주 · 확장 시스템</b><small>05권 후반, MCP·plugin·skill·tool search</small></div>
          <div><b>8주 · 종합 실습</b><small>06권, trace·threat model·architecture review</small></div>
        </div>` +
          note('운영 팁', '매 회차 한 명은 “설명자”, 한 명은 “반례 찾는 사람”, 한 명은 “근거 링크 관리자”를 맡는다. 역할은 다음 회차에 순환한다.'),
      ],
      [
        'OUTPUT CONTRACT',
        '학습 결과물의 완료 조건',
        '“읽었다”가 아니라 재구성·검증·설계 전이 능력으로 완료를 판단한다.',
        check([
          '한 사용자 입력이 UI와 core에서 갈라지는 경계를 그릴 수 있다.',
          'async generator가 Promise<Array<Event>>보다 나은 요구를 세 가지 설명할 수 있다.',
          'tool schema, permission, execution, result normalization을 구분할 수 있다.',
          'permission mode와 개별 tool의 read-only/concurrency 속성을 혼동하지 않는다.',
          'React와 Ink, reconciler와 renderer의 역할을 분리해 말할 수 있다.',
          '컨텍스트 압축이 단순 문자열 요약이 아니라 루프 상태 전이임을 설명한다.',
          'feature gate가 “코드 존재 = 기능 활성” 등식을 깨뜨리는 이유를 말할 수 있다.',
          '코드 근거와 공식 사양, 추정을 서로 다른 라벨로 기록한다.',
          '실패·취소·재시도·권한 거부의 terminal evidence를 설계할 수 있다.',
          '다른 agentic CLI에 이 분석 틀을 재사용할 수 있다.',
        ]) +
          exercise('1분 설명', '“Claude Code는 React 앱이다”라는 말을 정확하고 과장 없이 120자 이내로 다시 쓴다.', '경계·renderer·core 세 단어가 포함된 문장'),
      ],
      [
        'GLOSSARY',
        '시작 전에 맞출 핵심 어휘',
        '같은 단어를 다른 수준에서 쓰면 토론이 흐려진다. 이 묶음에서는 아래 의미로 고정한다.',
        table(
          ['용어', '이 자료의 의미', '혼동 주의'],
          [
            ['turn', '한 번의 사용자 요청에서 모델·도구 후속 호출이 수렴하는 범위', 'API request 한 번과 다름'],
            ['stream event', '시간에 따라 점진적으로 도착하는 관찰 단위', '최종 assistant message와 다름'],
            ['tool', '스키마와 실행·권한·표시 계약을 가진 capability', 'shell command 하나와 다름'],
            ['hook', 'lifecycle 지점에서 실행되는 확장·정책 처리', '권한 자체와 다름'],
            ['permission', '특정 효과가 실행되어도 되는지의 결정', 'tool discoverability와 다름'],
            ['renderer', 'React tree의 차이를 특정 출력 매체에 적용하는 adapter', 'reconciler와 다름'],
            ['compaction', '유한 컨텍스트 예산 안에서 대화 표현을 재구성하는 과정', '파일 압축이 아님'],
            ['feature gate', '빌드·런타임 조건에 따라 경로를 포함/배제하는 선택', '파일 존재 여부가 아님'],
          ],
        ),
      ],
      [
        'NAVIGATION',
        '이제 어디로 갈까',
        '처음 읽는다면 01→02→03→04→05→06 순서를 권한다. 특정 관심사가 있다면 아래 분기를 따른다.',
        cards([
          { kicker: '아키텍처', title: '01권부터', body: p('entrypoint, 책임 지도, 의존성 hotspot을 먼저 잡는다.') },
          { kicker: '언어', title: '02권부터', body: p('generator, union, generic, cancellation을 집중해서 본다.') },
          { kicker: 'agent runtime', title: '03권부터', body: p('실제 query loop의 상태·회복·도구 후속 턴을 읽는다.') },
          { kicker: 'frontend/TUI', title: '04권부터', body: p('React와 terminal renderer의 경계를 추적한다.') },
          { kicker: 'security/platform', title: '05권부터', body: p('capability, permission, hook, MCP, plugin을 본다.') },
          { kicker: 'hands-on', title: '06권부터', body: p('실습 카드를 뽑고 필요한 권으로 역참조한다.') },
        ]) +
          note('권장 원칙', '첫 회독에는 모든 파일을 열지 않는다. 보고서가 지시한 anchor line을 읽고, 질문이 생긴 경우에만 인접 파일로 확장한다.', 'good'),
      ],
    ],
  },
  {
    volume: '01',
    slug: '01-system-map-and-code-atlas',
    symbol: 'SYS',
    accent: '#2e8fa3',
    title: '시스템 지도와 코드 아틀라스',
    subtitle: '1,884개 TypeScript 파일을 책임·경계·변경 축으로 읽기',
    audience: '아키텍처·플랫폼 학습자',
    mode: '구조 탐색 · 코드 리딩',
    sections: [
      [
        'SNAPSHOT',
        '규모가 아니라 분포를 먼저 본다',
        '라인 수는 난도를 말해 주지 않는다. 어떤 책임이 어디에 몰려 있고, 어떤 파일이 많은 경계를 동시에 연결하는지가 더 중요하다.',
        `<div class="metrics">${metric('1,884', 'TS/TSX 파일', '1,332 TS + 552 TSX')}${metric('512,664', '물리 라인', '고정 리비전 wc 기준')}${metric('12,576', '내부 import edge', '정적 상대/alias import')}${metric('1,136', '최대 SCC', '강한 순환 연결 요소')}</div>` +
          sourceNotice +
          note('SCC 해석', '거대 strongly connected component는 “모든 코드가 나쁘다”는 판정이 아니다. barrel/export, UI와 runtime의 상호 참조, 복원 과정의 평탄화가 함께 만든 변경 위험 신호다.', 'warn'),
      ],
      [
        'DISTRIBUTION',
        '상위 디렉터리 분포',
        'utils가 코드의 35% 이상을 차지하고, components·tools·services가 다음 세 축을 이룬다.',
        `<div class="bar"><span>utils</span><i style="width:100%"></i><span>180,472</span></div>
         <div class="bar"><span>components</span><i style="width:45.2%"></i><span>81,546</span></div>
         <div class="bar"><span>services</span><i style="width:29.7%"></i><span>53,680</span></div>
         <div class="bar"><span>tools</span><i style="width:28.2%"></i><span>50,828</span></div>
         <div class="bar"><span>commands</span><i style="width:14.6%"></i><span>26,428</span></div>
         <div class="bar"><span>ink</span><i style="width:11%"></i><span>19,842</span></div>
         <div class="bar"><span>hooks</span><i style="width:10.6%"></i><span>19,204</span></div>
         <div class="bar"><span>bridge</span><i style="width:7%"></i><span>12,613</span></div>` +
          p('분포는 “utils = 잡동사니”라고 단정하기보다, 파일시스템·설정·권한·plugin·shell·message 변환 등 횡단 관심사가 어디로 모였는지 조사하라는 신호다.') +
          refs([src('src', null, 'src/ tree'), 'metrics/source-metrics.json']),
      ],
      [
        'SURFACES',
        '하나의 제품, 여러 실행 표면',
        'interactive terminal만 보면 UI 상태를 core state로 착각한다. REPL, headless print, SDK, bridge는 같은 능력을 다른 transport와 lifecycle로 감싼다.',
        table(
          ['표면', '입력/출력', '소유 관심사', 'anchor'],
          [
            ['Interactive REPL', '키 입력·Ink frame', 'prompt UX, live state, permission dialog', src('src/screens/REPL.tsx', 1)],
            ['Print/headless', 'stdin/args · NDJSON/text', '비대화형 실행, structured IO', src('src/cli/print.ts', 1)],
            ['Agent SDK', 'typed message/control stream', 'host integration, schema surface', src('src/entrypoints/sdk/coreSchemas.ts', 1)],
            ['QueryEngine', 'programmatic query lifecycle', 'headless query orchestration', src('src/QueryEngine.ts', 1)],
            ['Bridge/remote', 'websocket/HTTP/process', 'session relay, auth, capacity', src('src/bridge/bridgeMain.ts', 1)],
          ],
        ) +
          note('경계 테스트', '어떤 상태가 REPL 없이도 필요하면 core/application 상태일 가능성이 높다. spinner나 selection overlay처럼 출력 매체에만 필요한 상태는 adapter/UI 상태다.'),
      ],
      [
        'TOP-LEVEL MAP',
        '사용자 사건이 지나가는 여섯 구역',
        '입력 한 번은 UI 이벤트, 메시지 변환, 에이전트 턴, 모델 스트림, tool capability, persistence/telemetry를 횡단한다.',
        flow([
          ['Input surface', 'PromptInput · CLI · SDK'],
          ['Session shell', 'REPL · QueryEngine'],
          ['Agent turn', 'query · compaction'],
          ['Model adapter', 'services/api/claude'],
          ['Capability', 'Tool · permission · hooks'],
          ['Projection', 'UI · transcript · metrics'],
        ]) +
          p('핵심은 선형 호출이 아니다. 모델 스트림이 UI projection과 tool executor로 분기되고, tool result가 다시 다음 model request의 입력으로 합류한다.') +
          refs([src('src/query.ts', '219-300'), src('src/services/api/claude.ts', '752-830'), src('src/services/tools/toolOrchestration.ts', '19-188')]),
      ],
      [
        'CHANGE AXES',
        '디렉터리보다 변경 이유로 다시 묶기',
        '복원 소스는 전형적인 계층형 모노레포가 아니다. 학습 시에는 파일 위치보다 “무엇이 바뀔 때 함께 바뀌는가”로 가상 모듈을 만든다.',
        table(
          ['변경 축', '함께 읽을 영역', '독립적으로 유지할 계약'],
          [
            ['새 모델/API 기능', 'services/api, model utils, betas, message types', 'request params · stream event · fallback'],
            ['새 도구', 'Tool.ts, tools/<name>, toolExecution, UI renderer', 'schema · permission · result · progress'],
            ['새 permission policy', 'types/permissions, permissions, hooks, dialogs', 'allow/deny/ask · provenance'],
            ['새 TUI interaction', 'PromptInput, ink/hooks, keybindings, REPL', 'key event · focus · submit callback'],
            ['새 extension', 'MCP, plugins, skills, commands', 'discovery · trust · lifecycle'],
            ['긴 세션 최적화', 'compact, attachments, storage, tokens', 'context projection · budget · resume'],
          ],
        ),
      ],
      [
        'HOTSPOTS',
        'fan-out이 큰 파일은 조합 지점이다',
        '정적 import fan-out은 책임 수의 직접 측정이 아니지만, 코드를 읽을 순서와 변경 위험을 알려 주는 좋은 탐색 지표다.',
        table(
          ['파일', '내부 fan-out', '해석'],
          [
            [src('src/screens/REPL.tsx', 1), '222', 'interactive shell의 조합 중심. UI·session·query·remote를 연결한다.'],
            [src('src/main.tsx', 1), '151', '부트스트랩과 top-level wiring.'],
            [src('src/cli/print.ts', 1), '125', 'headless surface의 조합 중심.'],
            [src('src/components/PromptInput/PromptInput.tsx', 1), '116', '입력 UX의 복잡성이 모인 hotspot.'],
            [src('src/commands.ts', 1), '85', 'slash command registry/facade.'],
            [src('src/utils/attachments.ts', 1), '83', '컨텍스트 enrichment fan-in/out.'],
            [src('src/services/api/claude.ts', 1), '60', '모델 provider adapter와 stream 변환.'],
          ],
        ) +
          note('리팩터링 오해', '큰 파일을 자동 분할한다고 응집도가 높아지지 않는다. 먼저 상태 소유권·lifecycle·public contract가 갈라지는지 확인한다.', 'warn'),
      ],
      [
        'FAN-IN',
        '많이 참조되는 파일은 언어와 기반 시설이다',
        'fan-in이 큰 파일은 변경 비용이 높지만, 동시에 시스템의 ubiquitous language를 가장 빨리 배울 수 있는 지점이다.',
        table(
          ['파일', 'fan-in', '학습 포인트'],
          [
            [src('src/ink.ts', 1), '442', 'Ink surface/barrel, UI primitive vocabulary'],
            [src('src/utils/debug.ts', 1), '369', 'debugging and diagnostic conventions'],
            [src('src/services/analytics/index.ts', 1), '266', 'event vocabulary and privacy constraints'],
            [src('src/bootstrap/state.ts', 1), '249', 'process/session state concentration'],
            [src('src/utils/errors.ts', 1), '248', 'error taxonomy'],
            [src('src/Tool.ts', '321-416'), '218', 'capability contract'],
            [src('src/state/AppState.tsx', 1), '150', 'interactive global state shape'],
          ],
        ) +
          p('학습자는 이 파일을 “처음부터 끝까지” 읽기보다, 소비자가 반복해서 요구하는 타입·함수만 인덱스로 만든다.'),
      ],
      [
        'CYCLES',
        '거대 순환 연결 요소를 어떻게 읽을까',
        '정적 상대 import 그래프에서 8개 SCC가 보이며, 가장 큰 SCC는 1,136파일이다. 이는 변경 전파와 격리 난도를 보여 주는 관찰이지 품질 점수는 아니다.',
        cards([
          { kicker: '원인 후보', title: 'barrel과 facade', body: p('편리한 re-export가 내부 모듈로 다시 들어오면 cycle을 만든다.') },
          { kicker: '원인 후보', title: 'UI/runtime 교차', body: p('Tool 계약이 React node를 포함하고 runtime이 UI 표현을 참조한다.') },
          { kicker: '원인 후보', title: 'global state', body: p('AppState·bootstrap singleton·settings가 횡단 관심사를 묶는다.') },
          { kicker: '원인 후보', title: '복원 평탄화', body: p('원 모노레포 경계가 단일 src로 복원되며 package boundary가 사라졌을 수 있다.') },
        ]) +
          note('분석 실습', 'SCC를 즉시 제거하려 하지 말고, 한 tool vertical slice에서 type-only edge, UI edge, runtime edge를 색으로 구분한다. 잘라야 할 seam이 보일 때만 refactor 가설을 세운다.'),
      ],
      [
        'BUILD MODEL',
        'Bun feature gate가 소스의 의미를 바꾼다',
        '이 저장소에서 <code>feature("FLAG")</code>는 단순 런타임 if가 아니라 compile-time dead-code elimination의 표지로 설명된다.',
        flow([
          ['internal source', '모든 feature branch'],
          ['build config', 'flag true/false'],
          ['tree shaking', '미선택 branch 제거'],
          ['distributed bundle', '일부 모듈·문자열 없음'],
        ]) +
          `<div class="metrics">${metric('935', 'feature() 호출', 'AST call count')}${metric('196', 'bun:bundle import 파일', '정적 import count')}${metric('419', 'dynamic import', 'AST call count')}${metric('108', '누락 모듈 주장', '저장소 문서 등급 B')}</div>` +
          note('중요한 결론', '소스 트리에 있는 경로를 보고 출시 제품에 활성이라고 결론 내릴 수 없다. 반대로 missing file을 보고 기능이 존재하지 않는다고도 단정할 수 없다.', 'warn') +
          refs([src('QUICKSTART.md', '1-105'), src('src/query.ts', '1-120')]),
      ],
      [
        'STATE',
        '상태는 하나가 아니라 수명별로 나뉜다',
        '대형 interactive agent는 상태를 수명과 권위로 분리하지 않으면 재개·취소·background task에서 오류가 난다.',
        table(
          ['수명', '대표 상태', '소유 위치', '실패 예'],
          [
            ['render frame', 'focus, overlay, spinner', 'React hook / Ink', 'stale closure, flicker'],
            ['user turn', 'messages, tool results, abort signal', 'query State / ToolUseContext', '중복 tool result'],
            ['session', 'history, permission context, app state', 'REPL/AppState/storage', 'resume drift'],
            ['process', 'settings cache, task registry, analytics', 'bootstrap/services singleton', 'cross-session leak'],
            ['remote/provider', 'MCP connection, bridge token, API request', 'adapter/client', 'stale auth, partial delivery'],
          ],
        ) +
          refs([src('src/query.ts', '179-218'), src('src/Tool.ts', '158-300'), src('src/state/AppState.tsx', 1)]),
      ],
      [
        'MESSAGE ALGEBRA',
        '메시지는 UI 문자열이 아니라 프로토콜 상태다',
        'assistant, user, attachment, progress, system, tombstone 등은 렌더링과 API 정규화, 저장 정책이 다르다.',
        code(`type Message =
  | UserMessage
  | AssistantMessage
  | AttachmentMessage
  | ProgressMessage
  | SystemMessage
  | TombstoneMessage

switch (message.type) {
  case "assistant": projectAssistant(message)
  case "attachment": enrichContext(message)
  case "tombstone": removeOrphanProjection(message)
  default: assertExhaustive(message)
}`, '학습용 대수 모델 — 원문 복사 아님') +
          p('이 모델을 사용하면 “화면에 보인다”, “다음 API 요청에 포함된다”, “세션에 저장된다”를 별도 속성으로 질문할 수 있다.') +
          refs([src('src/query.ts', '27-38', '누락된 message 모듈의 import 지점'), src('src/utils/messages.ts', '28-64')]) +
          note('복원본의 공백', '<code>src/types/message.ts</code>는 분석 리비전에 존재하지 않는다. 위 대수는 import/use site에서 재구성한 학습 모델이지 원문 타입 정의가 아니다.', 'warn'),
      ],
      [
        'EXTENSION STACK',
        'command, skill, plugin, MCP, tool은 같은 것이 아니다',
        '확장 계층마다 발견 방식과 실행 권한이 다르다. 이름이 비슷해도 서로 대체하지 않는다.',
        table(
          ['개념', '주 역할', '실행 주체/경계', '위험 질문'],
          [
            ['Command', '사용자 입력을 local action 또는 prompt로 해석', 'REPL/command processor', '즉시 실행인가 모델 입력인가?'],
            ['Skill', 'instruction bundle·도메인 절차 제공', 'SkillTool/context injection', 'instruction이 authority처럼 취급되는가?'],
            ['Plugin', 'commands, agents, hooks, MCP 등을 묶어 배포', 'plugin loader/manager', '설치 출처와 업데이트 신뢰는?'],
            ['MCP', '외부 server가 tool/resource/prompt 노출', 'MCP client/transport', '서버·annotation·result를 신뢰하는가?'],
            ['Tool', '모델이 호출 가능한 typed capability', 'tool runtime', 'schema·permission·effect가 닫혔는가?'],
          ],
        ) +
          refs([src('src/commands.ts', 1), src('src/tools/SkillTool/SkillTool.ts', 1), src('src/utils/plugins/pluginLoader.ts', 1), src('src/services/mcp/client.ts', 1)]),
      ],
      [
        'CONTEXT PIPELINE',
        '모델에 들어가는 것은 대화 기록만이 아니다',
        '메시지, 시스템 프롬프트, user/system context, memory, skill discovery, queued command, file-change attachment가 turn 시점에 조립된다.',
        flow([
          ['history', 'compact boundary 이후'],
          ['projection', 'snip · microcompact · collapse'],
          ['context', 'system · user · memory'],
          ['model request', 'tools · betas · budget'],
          ['post-tool', 'result · attachment · queue'],
        ]) +
          note('아키텍처 의미', '컨텍스트는 정적 문자열이 아니라, source·budget·freshness·persistence 규칙을 가진 실행 시점 projection이다.') +
          refs([src('src/query.ts', '300-548'), src('src/query.ts', '1535-1676'), src('src/utils/attachments.ts', 1)]),
      ],
      [
        'TRACE',
        'Enter 한 번의 구조적 추적',
        '함수 이름을 외우기보다 책임 전환점을 표시한다.',
        `<div class="timeline">
          <div><b>키 이벤트</b><small>Ink input hook이 Enter를 구조화된 key로 전달한다.</small></div>
          <div><b>UX gate</b><small>selection, suggestion, empty input, teammate routing 등 조기 종료 조건을 적용한다.</small></div>
          <div><b>session submit</b><small>history·slash command·remote 여부·abort controller를 준비한다.</small></div>
          <div><b>query boundary</b><small>UI state와 agent turn을 연결하고 stream event를 소비한다.</small></div>
          <div><b>model/tool loop</b><small>compact → model stream → tool execution → follow-up.</small></div>
          <div><b>projection</b><small>message state, Static history, transcript, telemetry가 각자 갱신된다.</small></div>
        </div>` +
          refs([src('src/components/PromptInput/PromptInput.tsx', 1865), src('src/screens/REPL.tsx', '2661-3024'), src('src/query.ts', '219-300')]),
      ],
      [
        'READING WORKSHEET',
        '파일 하나를 읽을 때 기록할 여덟 문장',
        '호출 그래프보다 책임과 불변식을 기록하면 다른 프로젝트에도 지식이 전이된다.',
        check([
          '이 파일이 소유하는 상태/결정은 무엇인가?',
          '입력과 출력의 typed contract는 무엇인가?',
          '성공·거부·취소·오류는 어떤 형태로 드러나는가?',
          '외부 효과 직전 마지막 검증 지점은 어디인가?',
          '상태의 수명은 frame/turn/session/process 중 무엇인가?',
          '이 파일이 UI·provider·filesystem에 묶이는 지점은 어디인가?',
          'feature gate나 runtime setting이 의미를 바꾸는가?',
          '테스트할 때 관찰 가능한 결과는 무엇인가?',
        ]) +
          exercise('vertical slice', '<code>FileReadTool</code> 하나를 골라 schema → permission → execution → result → render를 한 장에 그린다.', '파일/line ref가 붙은 5단계 다이어그램'),
      ],
      [
        'TAKEAWAYS',
        '구조를 읽고 남겨야 할 결론',
        '이 저장소의 가장 중요한 구조적 특징은 “작은 agent loop 주위에 거대한 product harness가 붙어 있다”는 점이다.',
        cards([
          { kicker: '핵심', title: '작은 제어 루프', body: p('model stream과 tool result를 번갈아 잇는 loop는 비교적 명확하다.') },
          { kicker: '제품성', title: '큰 harness', body: p('UI, permissions, persistence, remote, plugins, observability가 실사용 품질을 만든다.') },
          { kicker: '위험', title: '강한 결합', body: p('REPL·global state·utils 허브는 변경 영향과 읽기 난도를 높인다.') },
          { kicker: '학습법', title: '수직 절단', body: p('한 사용자 사건이나 tool을 끝까지 추적하는 것이 디렉터리 순회보다 낫다.') },
        ]) +
          note('다음 권', '이 구조를 실제로 가능하게 한 언어 장치—async generator, union narrowing, generic Tool contract, cancellation—를 02권에서 해부한다.', 'good'),
      ],
    ],
  },
  {
    volume: '02',
    slug: '02-language-mechanisms-and-programming-expressions',
    symbol: 'TS*',
    accent: '#7166c6',
    title: '언어 메커니즘과 프로그래밍 표현',
    subtitle: 'TypeScript·JavaScript 기능이 제품 요구를 담는 방식',
    audience: 'JS/TS 중급 이상',
    mode: '언어 해부 · 표현 선택',
    sections: [
      [
        'MECHANISM MAP',
        '문법이 아니라 요구와 연결한다',
        '이 코드베이스에서 언어 기능은 취향이 아니라 시간·상태·경계·안전 요구를 압축한 표현이다.',
        table(
          ['제품 요구', '언어 메커니즘', '대표 표현', '얻는 것'],
          [
            ['점진적 결과', 'async iterator', '<code>async function*</code>, <code>yield</code>', '한 이벤트씩 관찰'],
            ['단계 합성', 'generator delegation', '<code>yield*</code>', '하위 stream의 투명한 전달'],
            ['유효 상태', 'discriminated union', '<code>type</code> 필드 + narrowing', '분기 안전성'],
            ['취소 전파', 'AbortSignal', 'signal 전달·aborted 검사', '협력적 중단'],
            ['능력 계약', 'generic + schema', '<code>Tool&lt;Input,Output,Progress&gt;</code>', '정적/런타임 경계'],
            ['optional feature', 'dynamic import + gate', '<code>feature()</code>, <code>import()</code>', '번들 선택·지연 로딩'],
            ['자원 정리', 'explicit resource management', '<code>using</code>', '모든 종료 경로 cleanup'],
          ],
        ),
      ],
      [
        'DISTRIBUTION',
        '표현의 실제 분포',
        '빈도는 중요도를 증명하지 않지만 어떤 메커니즘이 국소 특수기능이고 어떤 것이 코드 전반의 언어인지 보여 준다.',
        `<div class="metrics">${metric('20,744', '함수형 노드', 'body가 있는 function-like')}${metric('2,953', 'async 함수', '14.2%')}${metric('50', 'async generator', 'generator 55개 중')}${metric('65', 'for-await', '비동기 소비')}</div>
         <div class="metrics">${metric('5,238', 'await 표현', '비동기 작업 밀도')}${metric('2,443', 'type alias', 'interface 83개 대비')}${metric('165', 'satisfies', 'literal 정밀도 보존')}${metric('31', 'using 선언', '자원 수명')}</div>` +
          p('type alias가 interface보다 압도적으로 많은 것은 union·mapped/conditional type·literal vocabulary를 적극 사용하는 스타일과 연결된다.'),
      ],
      [
        'ASYNC GENERATOR',
        'await와 yield가 한 함수에 공존하는 이유',
        '생산자는 네트워크·도구를 기다리고, 소비자는 도착한 이벤트를 즉시 관찰해야 한다. Promise 하나로는 두 시간축을 동시에 표현하기 어렵다.',
        code(`async function* turn(input, signal) {
  const stream = await openModelStream(input, signal)
  for await (const event of stream) {
    yield event                 // 관찰 가능 시점
  }
  const results = await runRequestedTools(signal)
  for (const result of results) yield result
}`, '학습용 축약 의사코드') +
          cards([
            { kicker: 'await', title: '생산자의 시간', body: p('다음 값이 준비될 때까지 함수 내부 진행을 멈춘다.') },
            { kicker: 'yield', title: '소비자의 시간', body: p('현재 값을 밖으로 내보내되 함수 상태는 보존한다.') },
            { kicker: 'next()', title: 'pull 제어', body: p('소비자가 다음 값을 요구할 때 생산이 다시 진행된다.') },
            { kicker: 'return/throw', title: '종료 의미', body: p('정상 terminal과 오류 전파를 iterator protocol에 담는다.') },
          ]) +
          refs([src('src/query.ts', '219-260'), ext('https://tc39.es/ecma262/multipage/ecmascript-language-functions-and-classes.html#sec-async-generator-function-definitions', 'ECMAScript async generator spec')]),
      ],
      [
        'YIELD VS RETURN',
        'yield는 여러 번 반환하는 문법이 아니다',
        'yield는 실행 프레임을 보존한 채 iterator result를 내보내는 suspension point다. return은 generator를 terminal 상태로 만든다.',
        table(
          ['속성', '<code>yield value</code>', '<code>return terminal</code>', '<code>throw error</code>'],
          [
            ['함수 상태', '보존', '종료', '종료'],
            ['소비 결과', '<code>{value, done:false}</code>', '<code>{value, done:true}</code>', 'next/rethrow 경로'],
            ['query 의미', 'stream/message/progress', 'terminal reason', '실패·중단 전파'],
            ['UI 영향', '즉시 projection 가능', 'turn 마감', 'error UI/cleanup'],
          ],
        ) +
          note('영상과 연결', '“함수를 여러 번 나눠 실행한다”는 좋은 직관이다. 더 정확히는 continuation과 local state가 suspension point 사이에 보존되고, 소비자 호출이 진행을 조절한다.'),
      ],
      [
        'DELEGATION',
        'yield*는 stream adapter의 합성 도구',
        '상위 generator가 하위 generator의 모든 값을 다시 포장하지 않고 전달하면서 최종 return 값도 받을 수 있다.',
        code(`async function* query(params) {
  const terminal = yield* queryLoop(params)
  recordCompletedCommands()
  return terminal
}`, 'query/queryLoop 관계의 개념 축약') +
          p('실제 <code>query()</code>는 내부 <code>queryLoop()</code>의 이벤트를 그대로 노출하면서 정상 종료 뒤 command lifecycle 완료를 기록한다. throw나 iterator의 <code>.return()</code>에서는 이 꼬리 코드가 실행되지 않는다는 주석도 있다.') +
          note('설계 포인트', 'delegation은 transport wrapping처럼 보이지만 terminal semantics를 바꿀 수 있다. 하위 generator의 throw/return/consumer cancellation이 상위 cleanup과 어떻게 합성되는지 반드시 본다.') +
          refs([src('src/query.ts', '219-240')]),
      ],
      [
        'BACKPRESSURE',
        'for await는 속도 조절 계약이다',
        'consumer가 다음 iteration을 요청하기 전까지 generator는 다음 yield 이후로 진행하지 않는다. 이 pull semantics가 메모리 폭증과 UI 과잉 갱신을 줄이는 기본 압력 밸브다.',
        flow([
          ['producer', 'SSE · tool progress'],
          ['await', '값 준비'],
          ['yield', '한 이벤트'],
          ['consumer', 'render · persist'],
          ['next()', '다음 수요'],
        ]) +
          note('한계', 'generator protocol만으로 전체 backpressure가 보장되지는 않는다. provider SDK 내부 buffering, React state batching, tool subprocess stdout buffering을 별도로 측정해야 한다.', 'warn') +
          refs([src('src/query.ts', '653-864'), src('src/services/tools/toolOrchestration.ts', '19-188')]),
      ],
      [
        'STATE MACHINE',
        '제너레이터와 명시적 상태는 경쟁자가 아니다',
        'generator가 instruction pointer와 local frame을 보존하지만, 제품 수준의 재시도·압축·budget·terminal reason은 명시적 데이터 상태로 남겨야 한다.',
        table(
          ['상태 종류', '언어가 보존', '코드가 명시'],
          [
            ['제어 위치', '마지막 yield/await 이후 continuation', 'transition reason'],
            ['지역 변수', 'generator frame', 'messages, turnCount, recovery count'],
            ['외부 자원', '자동 아님', 'AbortController, prefetch handle, stream executor'],
            ['재개 가능성', '같은 iterator 수명 안', '세션 저장/복원은 별도'],
            ['검증 가능성', '간접적', '<code>State</code>와 <code>Terminal</code> union으로 직접'],
          ],
        ) +
          refs([src('src/query.ts', '104-104', '누락된 transitions 모듈의 import 지점'), src('src/query.ts', '179-218')]),
      ],
      [
        'DISCRIMINATED UNIONS',
        '이벤트를 “가능한 상태의 집합”으로 만든다',
        '공통 literal 필드가 있으면 TypeScript의 control-flow analysis가 분기마다 정확한 타입을 남긴다.',
        code(`type Outcome =
  | { type: "completed"; value: Message }
  | { type: "denied"; reason: string }
  | { type: "aborted"; by: "user" | "timeout" }

function handle(outcome: Outcome) {
  switch (outcome.type) {
    case "completed": return persist(outcome.value)
    case "denied": return explain(outcome.reason)
    case "aborted": return settle(outcome.by)
    default: return assertNever(outcome)
  }
}`, '학습용 union 예시') +
          p('이 패턴은 message, permission decision, MCP connection state, terminal reason처럼 네트워크·상태기계 성격을 가진 영역에 특히 잘 맞는다.') +
          refs([src('src/types/permissions.ts', '1-160'), ext('https://www.typescriptlang.org/docs/handbook/2/narrowing', 'TypeScript narrowing handbook')]),
      ],
      [
        'EXHAUSTIVENESS',
        'never는 “도달 불가”를 컴파일러와 합의하는 장치',
        '새 union member가 추가되었는데 switch가 갱신되지 않으면 <code>never</code> 대입이 실패한다. 변화 누락을 런타임 전에 드러낸다.',
        p('tool execution의 permission decision source 분기에는 default에서 <code>const _exhaustive: never = reason</code> 형태가 보인다. 이 표현은 단순 캐스팅이 아니라 “새 이유가 생기면 여기 또한 갱신하라”는 변경 경보이다.') +
          note('좋은 사용처', '보안·결제·상태 전이처럼 새 variant를 묵시적으로 기본 처리하면 위험한 영역. UI cosmetic variant처럼 fallback이 의도된 영역에는 무조건 강제하지 않는다.') +
          refs([src('src/services/tools/toolExecution.ts', '196-249'), ext('https://www.typescriptlang.org/docs/handbook/2/narrowing#exhaustiveness-checking', 'TS exhaustiveness')]),
      ],
      [
        'GENERIC CONTRACT',
        'Tool<Input, Output, Progress>는 capability의 타입식',
        '한 도구는 입력 스키마, 실행 결과, 진행 이벤트, 권한·동시성·UI 표현을 하나의 계약으로 묶는다.',
        code(`type Tool<InputSchema, Output, Progress> = {
  inputSchema: InputSchema
  call(input, context, permission, parent, onProgress): Promise<Result<Output>>
  isConcurrencySafe(input): boolean
  isReadOnly(input): boolean
  checkPermissions(input, context): Promise<Decision>
  renderToolUseMessage(partialInput, options): ReactNode
}`, '실제 계약을 축약한 학습 모델') +
          note('구조적 긴장', 'runtime capability 계약이 ReactNode 렌더링까지 포함해 UI와 core를 결합한다. vertical cohesion에는 유리하지만 headless reuse와 dependency cycle에는 비용이 있다.', 'warn') +
          refs([src('src/Tool.ts', '362-695')]),
      ],
      [
        'MAPPED & CONDITIONAL TYPES',
        'buildTool은 런타임 spread를 타입 수준에 복제한다',
        'default method를 채우되, 호출자가 제공한 구체 literal·함수 시그니처는 잃지 않도록 mapped/conditional type을 사용한다.',
        code(`type Built<D> = Omit<D, DefaultKeys> & {
  [K in DefaultKeys]-?:
    K extends keyof D
      ? undefined extends D[K] ? Defaults[K] : D[K]
      : Defaults[K]
}`, 'BuiltTool의 핵심 모양') +
          p('이 표현은 object spread의 “뒤 값이 앞 값을 덮는다”는 런타임 규칙을 타입 계산으로 옮긴다. <code>-?</code>는 결과에서 optional을 제거한다.') +
          note('검토 포인트', '<code>as BuiltTool&lt;D&gt;</code> 단언은 구현과 타입 계산이 어긋나도 컴파일러가 자동 증명하지 못한다. default 목록과 runtime spread를 함께 테스트해야 한다.') +
          refs([src('src/Tool.ts', '703-792')]),
      ],
      [
        'SATISFIES',
        '검증하면서 구체성을 잃지 않기',
        '<code>satisfies</code>는 값이 계약을 만족하는지 검사하지만, 타입 annotation처럼 표현식의 구체 타입을 넓히지 않는다.',
        cards([
          { kicker: 'annotation', title: '타입을 지정', body: p('안전하지만 property literal·tuple 정보가 넓어질 수 있다.') },
          { kicker: 'assertion', title: '타입을 강제', body: p('검증을 우회할 수 있어 경계에서는 위험하다.') },
          { kicker: 'satisfies', title: '호환성만 검사', body: p('literal inference를 유지하며 typo/누락을 잡는다.') },
          { kicker: 'project', title: '165회 사용', body: p('config·registry·tool 정의처럼 literal vocabulary가 중요한 곳에 어울린다.') },
        ]) +
          refs([ext('https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html', 'TypeScript 4.9 satisfies')]),
      ],
      [
        'RUNTIME SCHEMA',
        '타입은 네트워크 경계를 지키지 못한다',
        '모델이 생성한 tool input, 설정 파일, MCP payload는 런타임 값이다. Zod/JSON Schema가 정적 타입과 실제 데이터 사이를 잇는다.',
        flow([
          ['untrusted JSON', 'model · file · server'],
          ['schema parse', 'Zod/JSON Schema'],
          ['narrowed input', 'z.infer<Input>'],
          ['permission', '정규화된 값에 결정'],
          ['effect', 'tool.call'],
        ]) +
          p('소스에는 Zod import가 128개 파일에 나타난다. Tool 계약은 <code>inputSchema</code>와 optional <code>outputSchema</code>, MCP용 JSON Schema를 함께 수용한다.') +
          note('순서가 중요', '권한 규칙을 raw input에 적용한 뒤 값을 정규화하면 검사와 실행 대상이 달라질 수 있다. parse·path canonicalization·permission·effect의 순서를 추적한다.', 'risk') +
          refs([src('src/Tool.ts', '342-406'), ext('https://modelcontextprotocol.io/specification/2025-06-18/server/tools', 'MCP tool schema spec')]),
      ],
      [
        'CANCELLATION',
        'AbortSignal은 취소의 공통 통화',
        '취소는 스레드를 강제 종료하는 것이 아니라, 관찰자들이 같은 signal을 확인하고 스스로 정리하는 협력적 프로토콜이다.',
        table(
          ['단계', 'signal 사용', '놓치면 생기는 문제'],
          [
            ['model request', 'SDK/fetch에 signal 전달', '사용자 ESC 뒤에도 토큰·비용 소비'],
            ['tool execution', '시작 전/진행 중 aborted 확인', '중단 뒤 파일·shell 효과 계속'],
            ['subprocess', 'kill/cleanup과 결합', 'orphan process'],
            ['prefetch', 'dispose/ignore late result', 'session leak'],
            ['UI', 'reason별 상태 복원', 'spinner·input lock 잔류'],
          ],
        ) +
          note('한계', 'AbortSignal은 rollback이 아니다. 이미 발생한 외부 효과는 별도 보상·settlement가 필요하다.', 'risk') +
          refs([src('src/Tool.ts', '158-203'), src('src/query.ts', '1484-1516'), ext('https://nodejs.org/docs/latest/api/globals.html#class-abortcontroller', 'Node AbortController')]),
      ],
      [
        'HOOKS & CLOSURES',
        'React hook은 state 수명과 closure 시점을 표현한다',
        '596개의 useState, 353개의 useRef, 322개의 useEffect, 293개의 useCallback 호출이 interactive surface의 상태 밀도를 보여 준다.',
        table(
          ['표현', '주 역할', '대표 위험'],
          [
            ['useState', 'render에 반영되는 값', '과도한 state 분할·update storm'],
            ['useRef', 'render 사이 mutable identity', 'UI가 ref 변화에 자동 반응하지 않음'],
            ['useEffect', '외부 subscription/lifecycle', 'cleanup 누락·dependency 오류'],
            ['useCallback', 'child/consumer에 안정된 함수 identity', 'stale closure'],
            ['useMemo', '파생값·object identity', '잘못된 성능 가정'],
            ['useSyncExternalStore', '외부 store와 React 일관성', 'snapshot 계약 위반'],
          ],
        ) +
          p('REPL 소스의 많은 주석이 “한 렌더 늦은 값”, ref reset 시점, onQuery의 finally와 같은 closure/lifecycle 문제를 직접 기록한다.') +
          refs([src('src/screens/REPL.tsx', '830-980')]),
      ],
      [
        'IMMUTABILITY',
        'object spread는 변경 경계를 보이게 한다',
        'query loop는 여러 mutable 변수를 흩어 갱신하는 대신 다음 iteration 직전에 <code>state = { ... }</code>로 전이 스냅샷을 만든다.',
        code(`state = {
  ...previousState,
  messages: nextMessages,
  turnCount: previousState.turnCount + 1,
  transition: { reason: "next_turn" },
}`, '개념 상태 전이') +
          p('장점은 diff·테스트·logging에 유리한 전이 경계를 얻는 것이다. 단점은 큰 객체 복사와 nested mutable value(Map, Set, controller)가 “완전 불변”처럼 보일 수 있다는 점이다.') +
          refs([src('src/query.ts', '1714-1728')]),
      ],
      [
        'FEATURE GATES',
        '동적 import와 compile-time 선택',
        'optional subsystem은 번들에 포함되지 않을 수 있고, 어떤 경로는 gate가 true일 때만 require/import 된다.',
        cards([
          { kicker: 'compile time', title: 'feature()', body: p('빌드 variant에서 dead branch를 제거하도록 설계된 intrinsic.') },
          { kicker: 'runtime', title: 'import()', body: p('필요한 시점에 모듈을 로드하고 startup/cycle 비용을 늦춘다.') },
          { kicker: 'type only', title: 'typeof import', body: p('실행 로딩 없이 optional module의 shape를 참조한다.') },
          { kicker: 'risk', title: '환경별 미검증', body: p('활성 조합마다 type/runtime coverage가 달라질 수 있다.') },
        ]) +
          refs([src('src/query.ts', '1-120'), src('QUICKSTART.md', '35-105')]),
      ],
      [
        'RESOURCE LIFETIME',
        'using은 generator의 모든 종료 경로를 닫는다',
        'generator는 정상 return뿐 아니라 throw, consumer의 <code>.return()</code>, 취소로 끝난다. explicit resource management는 scope 종료 시 dispose를 호출하도록 한다.',
        p('query loop는 memory prefetch handle을 <code>using</code>으로 묶어 조기 종료에서도 정리되도록 한다. 소스 전체에서 using 선언은 31개다.') +
          note('generator와 궁합', 'yield로 함수 수명이 길어질수록 manual finally는 누락되기 쉽다. using/await using은 자원 소유권을 lexical scope에 붙인다.', 'good') +
          refs([src('src/query.ts', '270-300'), ext('https://github.com/tc39/proposal-explicit-resource-management', 'TC39 Explicit Resource Management')]),
      ],
      [
        'CONCURRENCY',
        'Promise 병렬성과 효과 안전성은 별개다',
        '도구 호출은 <code>isConcurrencySafe(input)</code>로 묶음을 나누고, 안전한 연속 블록만 제한된 동시성으로 실행한다.',
        flow([
          ['tool_use[]', '모델이 제안'],
          ['schema parse', '입력 확인'],
          ['partition', 'concurrency safe?'],
          ['run', 'concurrent ≤ 10 / serial'],
          ['merge', 'context modifier 순서 적용'],
        ]) +
          note('핵심 구분', 'read-only는 concurrency-safe의 충분조건이 아니다. 같은 캐시·rate limit·session state를 갱신하는 읽기 도구도 직렬화가 필요할 수 있다.') +
          refs([src('src/services/tools/toolOrchestration.ts', '8-188'), src('src/Tool.ts', '401-416')]),
      ],
      [
        'FAILURE EXPRESSIONS',
        '오류는 throw 하나로 끝나지 않는다',
        'agent runtime에는 user-visible error message, retryable provider error, tool result error, permission denial, abort, terminal reason이 서로 다른 의미를 가진다.',
        table(
          ['표현', '의미', '다음 행동'],
          [
            ['throw', '현재 stack/iterator 실패', '상위 recovery 또는 turn failure'],
            ['assistant API error message', '모델 호출 실패를 대화 event로 projection', 'withhold/recover 또는 표시'],
            ['tool_result is_error', '모델이 다음 reasoning에서 볼 실행 실패', '후속 model call 가능'],
            ['permission deny', '효과 불허', '설명·수정·중단'],
            ['AbortSignal', '취소 요청', 'cooperative cleanup'],
            ['Terminal union', 'loop 종료 이유', 'caller settlement'],
          ],
        ) +
          refs([src('src/query.ts', '104-104', 'Terminal/Continue import 지점'), src('src/services/tools/toolExecution.ts', '337-430')]),
      ],
      [
        'LAB',
        '언어 기능을 작은 실험으로 검증하기',
        '대형 소스를 읽기 전 60줄 이하의 toy program으로 semantics를 손에 익힌다.',
        ol([
          '<b>generator</b> — three-event async generator를 만들고 <code>.next()</code>, <code>.return()</code>, throw를 직접 호출한다.',
          '<b>backpressure</b> — producer 10ms, consumer 100ms 지연을 주고 메모리·순서를 기록한다.',
          '<b>abort</b> — model mock과 tool mock에 같은 signal을 전달하고 어느 단계에서 멈추는지 표로 만든다.',
          '<b>union</b> — terminal variant 하나를 추가해 exhaustiveness error를 확인한다.',
          '<b>generic builder</b> — default method를 채우면서 literal name 타입을 보존하는 builder를 구현한다.',
          '<b>runtime schema</b> — raw JSON을 parse하기 전/후 permission check 결과가 달라지는 반례를 만든다.',
        ]) +
          exercise('축약 query loop', '모델 mock이 text→tool_use를 내고 tool mock이 결과를 반환한 뒤 두 번째 모델 호출에서 completed가 되는 루프를 작성한다.', 'event 순서, terminal reason, abort test'),
      ],
      [
        'TAKEAWAYS',
        '언어 선택의 핵심 결론',
        '좋은 코드는 고급 문법을 많이 쓰는 코드가 아니라, 시간·상태·경계 요구를 가장 작은 정확한 표현으로 만든 코드다.',
        cards([
          { kicker: '시간', title: 'async generator', body: p('점진 결과와 내부 대기를 하나의 composable protocol로 만든다.') },
          { kicker: '상태', title: 'union + never', body: p('불가능한 상태와 변경 누락을 줄인다.') },
          { kicker: '경계', title: 'generic + schema', body: p('정적 계약과 untrusted runtime 값을 이어 준다.') },
          { kicker: '제어', title: 'AbortSignal + using', body: p('취소와 cleanup을 구조화한다.') },
        ]) +
          note('다음 권', '03권에서는 이 표현들이 실제 query loop 안에서 어떻게 압축·모델·tool·회복·종료 상태기계로 합쳐지는지 본다.', 'good'),
      ],
    ],
  },
]

// Remaining volumes are appended below to keep each report definition independently readable.

reports.push(
  {
    volume: '03',
    slug: '03-agent-loop-streaming-and-tool-runtime',
    symbol: 'LOOP',
    accent: '#d15d48',
    title: '에이전트 루프·스트리밍·도구 런타임',
    subtitle: '한 사용자 턴이 모델과 환경을 왕복하며 수렴하는 과정',
    audience: 'agent runtime 구현자',
    mode: '상태기계 · 실패 경로 분석',
    sections: [
      [
        'CORE IDEA',
        '에이전트는 모델이 아니라 폐루프 시스템이다',
        '모델 출력이 tool action을 만들고, 환경 결과가 다시 모델 입력이 되는 feedback loop가 핵심이다.',
        flow([
          ['observe', 'prompt · context'],
          ['infer', 'model stream'],
          ['act', 'tool calls'],
          ['observe', 'tool results'],
          ['continue/stop', 'terminal decision'],
        ]) +
          p('ReAct 연구는 reasoning과 action을 교차시키는 패턴을 제시했다. 실제 제품 harness는 여기에 권한·취소·압축·재시도·관측·UI를 더한다.') +
          refs([ext('https://arxiv.org/abs/2210.03629', 'ReAct paper'), ext('https://arxiv.org/abs/2302.04761', 'Toolformer paper'), src('src/query.ts', '219-260')]),
      ],
      [
        'ENTRY',
        'query와 queryLoop의 역할 분리',
        'public generator는 event stream과 terminal을 노출하고, 내부 loop는 반복 상태와 회복 정책을 소유한다.',
        table(
          ['함수', '소유 책임', '중요 semantics'],
          [
            ['<code>query()</code>', 'public async generator facade', 'yield delegation, 정상 종료 후 command lifecycle 완료'],
            ['<code>queryLoop()</code>', 'turn iteration과 상태 전이', 'while(true), continue/return/throw'],
            ['<code>queryModelWithStreaming()</code>', 'model adapter facade', 'VCR wrapper와 하위 stream 위임'],
            ['<code>runTools()</code>', 'tool batch orchestration', 'safe partition, serial/concurrent merge'],
            ['<code>runToolUse()</code>', '단일 capability 실행', 'lookup, parse, permission, hook, call, normalize'],
          ],
        ) +
          refs([src('src/query.ts', '219-260'), src('src/services/api/claude.ts', '752-780'), src('src/services/tools/toolOrchestration.ts', '19-188')]),
      ],
      [
        'STATE',
        'iteration을 건너가는 최소 상태',
        'loop-local state는 메시지, tool context, 압축 tracking, recovery count, turn count, 이전 transition을 묶는다.',
        table(
          ['필드', '왜 필요한가', '잘못 다루면'],
          [
            ['messages', '다음 model request의 history', 'tool_use/result 불일치'],
            ['toolUseContext', '도구·권한·앱 상태·취소', 'stale capability/permission'],
            ['autoCompactTracking', '압축 이후 turn·실패 추적', '무한 재압축'],
            ['recovery count', 'bounded retry', '비용 폭증·livelock'],
            ['pending summary', 'tool 요약을 다음 요청과 겹쳐 실행', '불필요한 latency'],
            ['transition', 'continue 이유를 테스트/관측', '회복 경로가 보이지 않음'],
          ],
        ) +
          refs([src('src/query.ts', '179-218')]),
      ],
      [
        'ITERATION',
        '한 번의 while(true) 해부',
        '각 iteration은 “입력 projection → request → stream → tool → enrichment → next state”의 transaction-like 경계를 만든다.',
        ol([
          '현재 State를 iteration-local 변수로 펼친다.',
          'memory/skill prefetch를 시작해 model/tool 시간과 겹친다.',
          'snip·microcompact·context collapse·autocompact로 messages projection을 만든다.',
          'token blocking 조건을 확인한다.',
          'model stream을 소비하며 event를 yield하고 tool_use를 수집한다.',
          'recoverable error면 표시를 보류하고 recovery branch를 평가한다.',
          'tool이 없으면 stop hook/budget을 확인하고 terminal return한다.',
          'tool batch를 실행하고 result/attachment/context update를 모은다.',
          'max turn을 확인하고 next State를 만든 뒤 continue한다.',
        ]) +
          refs([src('src/query.ts', '286-548'), src('src/query.ts', '650-940'), src('src/query.ts', '1357-1728')]),
      ],
      [
        'COMPACTION',
        '컨텍스트는 하나의 배열이 아니라 여러 projection의 합성',
        '긴 대화의 유한 context window를 관리하기 위해 서로 다른 비용·정확도 특성을 가진 압축 단계가 순서대로 적용된다.',
        table(
          ['단계', '의도', '핵심 주의'],
          [
            ['tool result budget', '과대 결과를 저장/축약', 'Read 같은 도구는 순환을 막기 위해 예외'],
            ['snip', '선택적 과거 제거', 'token freed를 후속 threshold에 반영'],
            ['microcompact', 'tool-use id 기반 작은 정리', 'API cache deletion과 합성'],
            ['context collapse', '세분화된 projection/commit', 'feature gated, full history와 구분'],
            ['autocompact', '요약 메시지로 큰 경계 생성', '실패 circuit breaker, task budget'],
          ],
        ) +
          note('중요한 구조', '압축은 iteration 시작의 전처리가 아니라, 실패 회복·budget·세션 resume·tool result persistence와 얽힌 상태 전이다.') +
          refs([src('src/query.ts', '330-548'), src('src/services/compact/compact.ts', 1)]),
      ],
      [
        'REQUEST BUILD',
        '모델 호출은 많은 정책의 합류점',
        'history 외에도 system/user context, tools, model, thinking, effort, MCP, fallback, budget, signal이 request에 결합된다.',
        code(`callModel({
  messages: project(history, userContext),
  systemPrompt: append(systemPrompt, systemContext),
  tools,
  signal,
  options: { model, fallbackModel, mcpTools, effort, taskBudget }
})`, '요청 모양의 개념 축약') +
          note('캐시 불변식', 'observable input을 보강할 때 API로 되돌아갈 원본을 mutate하지 않는 주석이 있다. byte-level prompt cache identity가 기능 정확도와 비용에 영향을 준다.') +
          refs([src('src/query.ts', '653-708'), src('src/query.ts', '742-787')]),
      ],
      [
        'STREAM',
        '이벤트는 즉시 내보내고, 일부는 내부에도 축적한다',
        '같은 message가 UI/SDK로 yield되는 동시에 assistantMessages 배열에 쌓여 tool discovery와 다음 request 구성에 쓰인다.',
        table(
          ['stream 처리', '외부 projection', '내부 상태'],
          [
            ['일반 text/thinking event', '즉시 yield', 'assistantMessages에 축적'],
            ['tool_use block', 'message yield', 'toolUseBlocks + needsFollowUp'],
            ['streaming tool result', '완료 즉시 yield', 'normalized toolResults'],
            ['recoverable error', '일시 withhold', 'recovery 판단용 축적'],
            ['fallback orphan', 'tombstone yield', '이전 partial arrays 초기화'],
          ],
        ) +
          refs([src('src/query.ts', '708-864')]),
      ],
      [
        'TOMBSTONES',
        'fallback에서 partial output을 지우는 이유',
        'streaming attempt가 도중 fallback으로 바뀌면 이미 노출된 partial assistant message가 새 응답과 공존해 transcript·signature·tool id를 오염시킬 수 있다.',
        flow([
          ['attempt A', 'partial text/tool_use'],
          ['fallback', 'provider/model 전환'],
          ['tombstone', 'orphan projection 제거'],
          ['reset', 'messages/results/executor'],
          ['attempt B', 'fresh stream'],
        ]) +
          note('일반화', 'streaming UI에는 append만이 아니라 retract/replace semantics가 필요하다. event log와 materialized view를 분리하면 이런 회복을 표현하기 쉽다.', 'good') +
          refs([src('src/query.ts', '709-740')]),
      ],
      [
        'TOOL DETECTION',
        'stop_reason만 믿지 않는다',
        '소스 주석은 API의 <code>stop_reason === tool_use</code>가 항상 신뢰할 수 없다고 밝히고, 실제 stream에서 tool_use block을 관찰한 사실을 loop continuation 신호로 쓴다.',
        p('이 설계는 “summary metadata”보다 “실제 payload evidence”를 우선한다. 분산·스트리밍 시스템에서 상태 플래그보다 관찰된 event를 기준으로 전이하는 전형적인 방어다.') +
          note('검증 질문', '중복 tool_use, partial JSON, fallback 후 old tool id, unknown tool alias가 각각 어떤 오류 메시지와 cleanup을 만드는가?') +
          refs([src('src/query.ts', '551-558'), src('src/query.ts', '826-845')]),
      ],
      [
        'TOOL PIPELINE',
        'tool_use에서 외부 효과까지',
        '모델의 JSON 제안은 곧바로 실행되지 않는다. lookup·schema·validation·permission·hook·call·result mapping 단계를 통과한다.',
        flow([
          ['lookup', 'name + alias'],
          ['parse', 'input schema'],
          ['validate', 'tool-specific'],
          ['mediate', 'permission + hooks'],
          ['execute', 'call + progress'],
          ['normalize', 'tool_result + context'],
        ]) +
          p('unknown tool은 예외만 던지는 대신 <code>tool_result</code> error로 모델에게 되돌려 self-correction을 가능하게 한다.') +
          refs([src('src/services/tools/toolExecution.ts', '337-430'), src('src/Tool.ts', '362-560')]),
      ],
      [
        'CONCURRENCY',
        '동시성은 입력별 capability 속성',
        '같은 Tool이라도 input에 따라 concurrency-safe 여부가 달라질 수 있다. 호출 배열을 안전/비안전 블록으로 partition한다.',
        table(
          ['경로', '실행 방식', 'context update'],
          [
            ['safe block', 'bounded concurrent generator merge', 'modifier를 toolUseID별로 큐잉 후 결정적 적용'],
            ['unsafe block', '한 호출씩 serial', '각 결과 직후 currentContext 갱신'],
            ['parse/판정 실패', '보수적으로 unsafe', '직렬화'],
            ['기본값', '<code>isConcurrencySafe=false</code>', '명시적 opt-in'],
          ],
        ) +
          note('기본 동시성 10', '환경 변수로 상한을 바꿀 수 있지만, resource별 rate limit·FD·subprocess 비용을 자동으로 이해하는 값은 아니다. 부하 시험이 필요하다.') +
          refs([src('src/services/tools/toolOrchestration.ts', '8-188')]),
      ],
      [
        'PERMISSION & HOOKS',
        '정책 결정과 lifecycle 확장은 도구 실행 안에 있다',
        'PreToolUse·PermissionRequest·PostToolUse·PostToolUseFailure가 tool call 경계를 감싼다.',
        table(
          ['지점', '가능한 결과', '권위'],
          [
            ['input validation', '유효/오류', 'tool contract'],
            ['pre-tool hook', 'allow/deny/update/defer', '설정된 hook 정책'],
            ['permission resolver', 'allow/deny/ask', 'mode·rule·user decision'],
            ['tool call', 'output/progress/throw', 'capability adapter'],
            ['post hook', 'annotation/context/failure handling', 'hook contract'],
          ],
        ) +
          refs([src('src/services/tools/toolExecution.ts', '126-131'), ext('https://code.claude.com/docs/en/hooks', '공식 hooks reference')]),
      ],
      [
        'FOLLOW-UP',
        'tool result가 다음 모델 턴을 만든다',
        'tool execution이 끝나면 assistant message와 tool result, 새 attachment를 순서 규칙에 맞춰 합치고 next State를 만든다.',
        code(`next.messages = [
  ...messagesForQuery,
  ...assistantMessages,
  ...toolResults
]
next.turnCount = turnCount + 1
next.transition = { reason: "next_turn" }`, '다음 iteration 전이의 개념 축약') +
          p('API는 tool_use 뒤 대응하는 tool_result의 순서와 id를 요구한다. queue command나 file-change attachment는 tool batch 뒤에 붙어야 한다는 주석이 이를 지킨다.') +
          refs([src('src/query.ts', '1535-1657'), src('src/query.ts', '1678-1728')]),
      ],
      [
        'TERMINALS',
        '종료는 boolean이 아니라 이유가 있는 값',
        'completed, blocking limit, stop-hook prevented, aborted tools, hook stopped, max turns 등은 caller가 서로 다르게 처리해야 한다.',
        table(
          ['종료 이유', '성격', '후속 질문'],
          [
            ['completed', '정상 수렴', 'completion hooks/usage 정리됐는가?'],
            ['blocking_limit', '컨텍스트 한계', 'manual compact 안내?'],
            ['stop_hook_prevented', '정책 중단', '사용자에게 이유가 보이는가?'],
            ['aborted_tools', '취소', '부분 효과와 subprocess가 정리됐는가?'],
            ['hook_stopped', 'hook이 continuation 차단', 'result가 모델에 전달됐는가?'],
            ['max_turns', '운영 한도', '현재 상태를 재개할 수 있는가?'],
          ],
        ) +
          refs([src('src/query.ts', '104-104', 'Terminal/Continue import 지점'), src('src/query.ts', '1278-1357'), src('src/query.ts', '1484-1521'), src('src/query.ts', '1704-1712')]) +
          note('근거 수준', '<code>query/transitions.ts</code> 자체는 복원본에서 누락됐다. 종료 variant는 호출·반환 지점으로 교차 확인해야 한다.', 'warn'),
      ],
      [
        'RECOVERY',
        '오류를 즉시 보여 주지 않는 경우',
        'prompt-too-long, media size, max-output-tokens처럼 자동 회복 가능한 오류는 UI/SDK에 먼저 노출하면 consumer가 세션을 끝낼 수 있어 일시 보류한다.',
        flow([
          ['error event', 'stream에서 관찰'],
          ['withhold', '외부 yield 보류'],
          ['classify', 'recoverable?'],
          ['recover', 'compact/truncate/fallback'],
          ['yield/terminal', '최종 결과만 노출'],
        ]) +
          note('회복 불변식', 'withhold 조건과 recovery gate는 같은 snapshot을 사용해야 한다. gate가 stream 중 바뀌면 “숨겼지만 회복하지 않는” 이벤트 손실이 생길 수 있다는 주석이 이를 설명한다.') +
          refs([src('src/query.ts', '621-648'), src('src/query.ts', '788-825')]),
      ],
      [
        'OBSERVABILITY',
        '복잡한 loop는 checkpoint와 correlation 없이는 보이지 않는다',
        'queryChainId/depth, requestId, toolUseID, 단계 checkpoint, transition reason을 통해 한 turn의 causal path를 조립한다.',
        table(
          ['식별자/신호', '결합 대상', '진단 질문'],
          [
            ['queryChainId + depth', 'main/subagent request chain', '어느 재귀/후속 턴인가?'],
            ['requestId', 'provider request·fallback', '어느 API 시도가 실패했나?'],
            ['toolUseID', 'tool_use ↔ result/progress', 'orphan result인가?'],
            ['checkpoint', 'compaction/API/tool phases', 'latency가 어디서 생겼나?'],
            ['transition.reason', 'continue path', '왜 loop가 한 번 더 돌았나?'],
          ],
        ) +
          refs([src('src/query.ts', '286-330'), src('src/utils/queryProfiler.ts', 1)]),
      ],
      [
        'INVARIANTS',
        '코드에서 추출한 핵심 불변식',
        '함수 흐름보다 불변식을 적어야 테스트와 재구현에 사용할 수 있다.',
        check([
          '모든 tool_use id에는 정확히 대응하는 tool_result 또는 명시적 interruption이 있어야 한다.',
          'fallback 전 partial assistant projection은 새 stream과 공존하지 않는다.',
          'API로 재전송할 original message는 observer용 backfill 때문에 mutate되지 않는다.',
          'permission/validation을 통과하지 않은 tool effect는 실행되지 않는다.',
          'concurrency-unsafe tool의 context modifier는 직렬 순서로 적용된다.',
          'recoverable error는 recovery가 불가능하다고 결정되기 전 외부 terminal로 누출되지 않는다.',
          'max-turn·token-budget·recovery retry에는 상한이 있다.',
          'abort는 rollback이 아니므로 부분 효과를 별도로 정리한다.',
        ]),
      ],
      [
        'LAB',
        '관찰 가능한 축약 루프 만들기',
        '행복 경로보다 failure matrix를 먼저 만든다.',
        table(
          ['실험', '주입할 사건', '기대 evidence'],
          [
            ['text only', 'text → stop', 'yield 순서 + completed'],
            ['one tool', 'tool_use → result → text', '두 model request + id pairing'],
            ['unknown tool', '없는 name', 'is_error result + self-correction 가능'],
            ['fallback', 'partial text 후 provider error', 'tombstone + fresh stream'],
            ['abort', 'tool 50% 시점 signal', 'cleanup + aborted_tools'],
            ['context limit', 'oversized history', 'compact 또는 blocking_limit'],
            ['hook block', 'PreToolUse deny', 'effect 없음 + reason'],
          ],
        ) +
          exercise('event ledger', '각 실험에서 시간, event type, requestId, toolUseID, state transition을 NDJSON으로 기록한다.', '정렬 가능한 7개 trace와 invariant 검사'),
      ],
      [
        'TAKEAWAYS',
        '루프를 이해했다는 기준',
        'while문을 찾는 것이 아니라 어떤 evidence가 어떤 상태 전이를 정당화하는지 설명할 수 있어야 한다.',
        cards([
          { kicker: 'control', title: 'Generator', body: p('stream event와 terminal을 하나의 protocol로 묶는다.') },
          { kicker: 'state', title: 'Explicit transition', body: p('회복·budget·turn의 이유를 데이터로 남긴다.') },
          { kicker: 'effect', title: 'Tool pipeline', body: p('모델 제안을 capability effect로 안전하게 번역한다.') },
          { kicker: 'recovery', title: 'Projection repair', body: p('tombstone·withhold·compact로 일관된 관찰을 유지한다.') },
        ]) +
          note('다음 권', '04권은 이 event stream을 사용자가 보는 terminal frame으로 바꾸는 React/Ink 경계를 해부한다.', 'good'),
      ],
    ],
  },
  {
    volume: '04',
    slug: '04-react-ink-terminal-ui',
    symbol: 'TUI',
    accent: '#2b9b74',
    title: 'React·Ink 터미널 UI',
    subtitle: '입력 이벤트에서 reconciler, Yoga, ANSI, scrollback까지',
    audience: 'frontend·CLI 엔지니어',
    mode: 'renderer · interaction 분석',
    sections: [
      [
        'THESIS',
        '“React 앱”이라는 말의 정확한 범위',
        'interactive UI는 React component/hook 모델을 사용하지만 agent loop, tool runtime, provider adapter까지 React가 소유하는 것은 아니다.',
        table(
          ['구역', '주요 기술', 'React의 역할'],
          [
            ['Prompt/UI', 'TSX, hooks, Ink primitives', '상태 → element tree'],
            ['Renderer', 'react-reconciler, custom host config', 'tree diff/commit coordination'],
            ['Terminal host', 'Yoga, ANSI, stdout, cursor', 'React 밖의 출력 adapter'],
            ['Agent core', 'async generator, typed messages', '직접 의존하지 않아야 할 이상적 core'],
            ['Tool UI', 'ReactNode rendering methods', '현재 계약에서는 일부 결합'],
          ],
        ) +
          refs([ext('https://www.youtube.com/watch?v=W83jWFwEnTU&t=61s', '참고 영상'), src('src/Tool.ts', '524-694')]),
      ],
      [
        'REACT CORE',
        'reconciler와 renderer를 분리해서 생각하기',
        'React는 element tree의 이전/다음 상태를 비교하고 commit할 변경을 계산한다. host renderer는 그 변경을 DOM 대신 terminal node에 적용한다.',
        flow([
          ['state/props', 'application state'],
          ['render', 'React elements'],
          ['reconcile', 'fiber diff/schedule'],
          ['host config', 'Ink mutations'],
          ['screen', 'ANSI/stdout'],
        ]) +
          note('보정', '“reconciler = 단순 tree diff 알고리즘”은 입문 설명으로 유용하지만, 실제 React는 scheduling, effects, priorities, host config commit을 포함한다.') +
          refs([ext('https://github.com/reactjs/react.dev/blob/main/src/content/learn/render-and-commit.md', 'React render/commit source'), ext('https://github.com/facebook/react/tree/main/packages/react-reconciler', 'react-reconciler package')]),
      ],
      [
        'INK',
        'DOM이 없는 React renderer',
        'Ink는 component 기반 CLI UI를 제공하고 Yoga로 terminal Flexbox layout을 계산한다. 이 저장소에는 Ink 계열 구현이 <code>src/ink</code> 아래 복원되어 있다.',
        cards([
          { kicker: 'element', title: 'Box/Text/Static', body: p('DOM tag 대신 terminal host primitive를 사용한다.') },
          { kicker: 'layout', title: 'Yoga', body: p('문자 cell 공간에서 flex layout을 계산한다.') },
          { kicker: 'paint', title: 'ANSI', body: p('색·커서 이동·clear sequence를 stdout에 쓴다.') },
          { kicker: 'input', title: 'useInput', body: p('stdin byte/key를 component callback으로 변환한다.') },
        ]) +
          refs([ext('https://github.com/vadimdemedes/ink', 'Ink official repository'), src('src/ink/reconciler.ts', 1), src('src/ink/render-to-screen.ts', 1)]),
      ],
      [
        'LAYOUT PIPELINE',
        'JSX가 터미널 글자가 되기까지',
        '브라우저와 달리 terminal은 pixel DOM이 아니라 character grid와 cursor를 가진 stateful output device다.',
        flow([
          ['JSX', 'Box · Text · custom'],
          ['host tree', 'Ink instances'],
          ['Yoga', 'rows/columns'],
          ['string frame', 'wrap · color · border'],
          ['diff/write', 'cursor · ANSI · stdout'],
        ]) +
          p('같은 React 상태 모델을 쓰더라도 terminal resize, wide grapheme, scrollback, alternate screen, piped stdout 같은 host constraint가 UI 구조를 바꾼다.') +
          refs([src('src/ink/layout', null, 'src/ink/layout'), src('src/ink/render-node-to-output.ts', 1), src('src/ink/log-update.ts', 1)]),
      ],
      [
        'INPUT PIPELINE',
        'Enter는 단일 callback이 아니라 책임 사슬',
        'raw stdin에서 agent query까지 각 계층이 다른 결정을 소유한다.',
        flow([
          ['stdin', 'bytes/escape'],
          ['parser', 'key event'],
          ['useInput', 'React hook'],
          ['PromptInput', 'UX guards'],
          ['REPL submit', 'session logic'],
          ['onQuery', 'agent boundary'],
        ]) +
          note('책임 분리', 'low-level input은 key semantics, PromptInput은 선택·추천·빈 입력 같은 UX, REPL은 history·remote·slash/session, onQuery는 agent turn을 소유한다.') +
          refs([src('src/ink/hooks/use-input.ts', 1), src('src/components/PromptInput/PromptInput.tsx', 1865), src('src/screens/REPL.tsx', '3330-3545')]),
      ],
      [
        'UX GUARDS',
        'early return은 interaction state machine',
        'Enter가 항상 “모델에게 전송”을 뜻하지 않는다. selection confirm, suggestion accept, agent routing, empty input 등 mode별 의미가 먼저 평가된다.',
        table(
          ['guard 예', 'Enter의 의미', 'return 이유'],
          [
            ['footer/overlay selection', '현재 항목 선택', 'query를 시작하면 안 됨'],
            ['agent selection', '대상 결정', '입력을 agent prompt로 오해 방지'],
            ['suggestion visible', '추천 수락', '완성 전송 방지'],
            ['empty without attachment', 'no-op', '빈 turn 방지'],
            ['active teammate context', 'delegate/direct message', 'leader query와 분리'],
            ['normal input', 'parent submit callback', '모든 guard 통과'],
          ],
        ) +
          note('코드 표현', '일곱 개 if를 “복잡한 조건문”으로만 보지 말고, 우선순위가 있는 finite-state transition table로 재작성해 본다.'),
      ],
      [
        'ONQUERY BOUNDARY',
        'UI와 agent core가 만나는 seam',
        'REPL의 onQuery는 UI loading state, abort controller, message accumulation, stream event handling과 query 호출을 조율한다.',
        table(
          ['UI 쪽', '경계', 'core 쪽'],
          [
            ['input clear, loading, spinner', '<code>onQuery</code>', 'query params 구성'],
            ['message state append', 'stream consumer', 'async generator yield'],
            ['interrupt key', 'AbortController', 'provider/tool signal'],
            ['permission dialog', 'canUseTool callback', 'tool execution gate'],
            ['turn complete UI', 'terminal/finally', 'Terminal reason'],
          ],
        ) +
          refs([src('src/screens/REPL.tsx', '2661-3024')]),
      ],
      [
        'STATIC VS DYNAMIC',
        'scrollback 보존이 component 구조를 바꾼다',
        'terminal transcript의 과거 부분은 다시 그리지 않는 Static 영역으로 이동하고, 현재 streaming/spinner/input만 동적으로 갱신한다.',
        flow([
          ['streaming region', '변하는 text/progress'],
          ['message_stop', '완료 event'],
          ['commit', 'completed message'],
          ['Static history', '영구 scrollback'],
          ['idle region', 'prompt 활성'],
        ]) +
          note('왜 중요한가', '매 frame 전체 transcript를 cursor overwrite하면 사용자가 위로 스크롤한 history가 흔들리거나 사라질 수 있다. host의 scrollback semantics가 component architecture를 결정한다.') +
          refs([ext('https://github.com/vadimdemedes/ink#static', 'Ink Static documentation'), src('src/components/Messages.tsx', 1)]),
      ],
      [
        'STREAMING RENDER',
        '한 chunk가 화면까지 가는 경로',
        'provider event는 query generator에서 yield되고, REPL consumer가 message/state를 갱신하며, React/Ink가 최소 host 변경을 계산한다.',
        flow([
          ['SSE delta', 'provider SDK'],
          ['stream event', 'query yield'],
          ['state update', 'REPL handler'],
          ['render/reconcile', 'React'],
          ['terminal commit', 'Ink/ANSI'],
        ]) +
          p('이 흐름은 “API가 React를 호출한다”가 아니다. async event consumer가 application state를 바꾸고 React가 그 상태의 projection을 그린다.') +
          refs([src('src/screens/REPL.tsx', '2584-2855'), src('src/query.ts', '653-864')]),
      ],
      [
        'BATCHING NUANCE',
        '자동 배칭을 16ms 타이머로 단정하지 않기',
        '참고 영상은 빠른 SSE chunk를 React가 묶어 flicker를 줄인다는 직관을 제공한다. 다만 정확한 timing은 React scheduler, Ink renderer, stdout flush 구현과 버전에 달려 있다.',
        cards([
          { kicker: '확인 가능', title: 'state update batching', body: p('여러 update가 하나의 render/commit으로 합쳐질 수 있다.') },
          { kicker: '미확인', title: '고정 16ms', body: p('항상 60fps cadence라는 보장은 소스/측정 없이 단정하지 않는다.') },
          { kicker: 'host cost', title: 'stdout write', body: p('React render보다 ANSI diff와 terminal emulator가 병목일 수 있다.') },
          { kicker: '측정', title: 'frame trace', body: p('chunk time, render count, bytes written을 함께 기록한다.') },
        ]) +
          note('교육 포인트', '좋은 설명 모델은 원리를 잡게 하지만, 성능 수치·스케줄 보장으로 확장될 때는 구현과 계측이 필요하다.', 'warn'),
      ],
      [
        'HOOK DENSITY',
        'interactive surface의 상태 복잡도',
        '호출 빈도는 품질 점수가 아니라, 어떤 React 메커니즘을 우선 학습하고 어디를 더 세밀하게 추적할지 정하는 탐색 지도다.',
        `<div class="bar"><span>useState</span><i style="width:100%"></i><span>596</span></div>
         <div class="bar"><span>useRef</span><i style="width:59.2%"></i><span>353</span></div>
         <div class="bar"><span>useEffect</span><i style="width:54%"></i><span>322</span></div>
         <div class="bar"><span>useCallback</span><i style="width:49.2%"></i><span>293</span></div>
         <div class="bar"><span>useMemo</span><i style="width:22.3%"></i><span>133</span></div>
         <div class="bar"><span>useKeybinding</span><i style="width:18%"></i><span>107</span></div>
         <div class="bar"><span>useInput</span><i style="width:6.7%"></i><span>40</span></div>` +
          p('빈도는 “hooks 남용” 판정이 아니다. UI 상태가 큰 REPL/PromptInput에 집중되어 있는지, custom hook이 lifecycle과 정책을 격리하는지 파일별로 본다.'),
      ],
      [
        'CUSTOM INK',
        '왜 renderer 구현까지 저장소에 있을까',
        'src/ink에는 reconciler, screen, focus, selection, hit-test, terminal parser, alternate screen 등 host-specific 기능이 넓게 존재한다.',
        table(
          ['하위 영역', '책임', '학습 질문'],
          [
            ['reconciler/renderer', 'React host mutations', '어떤 node operation을 지원하나?'],
            ['layout', 'Yoga adapter', 'cell width와 flex size가 어떻게 만나는가?'],
            ['termio/parser', '키·OSC·escape parse', '부분 sequence와 timeout은?'],
            ['screen/frame/output', 'virtual screen과 diff', '최소 write 전략은?'],
            ['selection/hit-test', 'mouse/text selection', '좌표와 wide char를 어떻게 처리?'],
            ['focus/input hooks', 'active component routing', '중첩 overlay의 우선순위는?'],
          ],
        ) +
          refs([src('src/ink', null, 'src/ink tree')]),
      ],
      [
        'RESPONSIBILITY',
        '컴포넌트 재사용보다 변경 격리가 우선',
        'TextInput, PromptInput, REPL을 나누는 주된 이유는 재사용뿐 아니라 변경 이유를 다르게 유지하기 위해서다.',
        table(
          ['구성', '변경 이유', '소유하지 않아야 할 것'],
          [
            ['Text/input primitive', 'key editing·cursor·paste', 'agent query·session history'],
            ['PromptInput', 'completion·suggestion·mode UX', 'provider API·tool loop'],
            ['REPL', 'session lifecycle·messages·remote', 'low-level escape parsing'],
            ['onQuery consumer', 'stream→app projection', 'tool implementation'],
            ['query core', 'agent turn state machine', 'terminal rendering'],
          ],
        ) +
          note('현실의 타협', 'Tool 계약이 render methods를 포함하므로 core/UI 경계는 완전히 깨끗하지 않다. 보고서는 이상화하지 않고 이 결합을 학습 대상으로 남긴다.'),
      ],
      [
        'PERFORMANCE',
        'TUI 성능은 render 횟수만의 문제가 아니다',
        '성능 병목을 네 층으로 나누면 최적화가 선명해진다.',
        table(
          ['층', '측정', '개선 후보'],
          [
            ['event ingestion', 'chunk/s, queue depth', 'coalesce, backpressure'],
            ['React', 'render/commit count, component time', 'state locality, memoization'],
            ['layout/paint', 'Yoga time, frame bytes', 'Static, narrower diff'],
            ['terminal', 'write latency, emulator CPU', 'batch writes, alternate screen choice'],
            ['history', 'message count, retained tree', 'windowing, compact representation'],
          ],
        ) +
          note('최적화 규칙', '체감 latency, dropped update, scrollback correctness를 함께 측정한다. render count만 줄이면 progress observability가 나빠질 수 있다.'),
      ],
      [
        'TESTING',
        'UI를 세 층으로 테스트한다',
        'terminal snapshot 하나에 모든 의미를 맡기면 fragile하다.',
        ol([
          '<b>pure transition</b> — key/mode/input으로 guard 결과를 table test한다.',
          '<b>component render</b> — state별 element/output을 Ink test renderer로 확인한다.',
          '<b>host integration</b> — pseudo-TTY에서 ANSI, resize, Ctrl+C, scrollback을 확인한다.',
          '<b>cross-boundary</b> — mock async generator로 streaming→completed 전이를 검증한다.',
          '<b>accessibility/operability</b> — color 없이도 permission/error가 구분되는지 본다.',
        ]) +
          exercise('frame probe', '10ms마다 100개 chunk를 보내고 실제 stdout write 횟수·byte·최종 frame을 측정한다.', '원시 trace + batching에 대한 결론/한계'),
      ],
      [
        'TRACE EXERCISE',
        '사용자 입력 한 번을 timestamp로 재구성',
        '영상의 설명을 소스와 측정으로 검증하는 실습이다.',
        table(
          ['시점', '기록할 사건', '증거'],
          [
            ['T0', 'Enter key parsed', 'useInput callback'],
            ['T1', 'UX guard 통과', 'selected branch'],
            ['T2', 'local user message render', 'state update/frame'],
            ['T3', 'onQuery 시작', 'query checkpoint'],
            ['T4', 'first model delta', 'requestId/event'],
            ['T5…n', 'stream text updates', 'render/write trace'],
            ['Tn+1', 'message stop', 'Static history commit'],
            ['Tn+2', 'input re-enabled', 'idle state'],
          ],
        ) +
          note('비교 과제', 'local echo(T2)가 first token(T4)보다 앞서야 하는 이유를 사용자 경험과 causal ordering 관점에서 설명한다.'),
      ],
      [
        'TAKEAWAYS',
        '터미널 UI를 이해했다는 기준',
        'React를 쓴 사실보다 어떤 host constraint를 어떤 추상화로 격리했는지 말할 수 있어야 한다.',
        cards([
          { kicker: 'core', title: 'Reconciler', body: p('state에서 변화할 host tree를 계산한다.') },
          { kicker: 'adapter', title: 'Ink', body: p('terminal node, layout, input, output을 제공한다.') },
          { kicker: 'host', title: 'TTY', body: p('cursor·ANSI·scrollback 제약이 구조를 결정한다.') },
          { kicker: 'boundary', title: 'onQuery', body: p('UI projection과 agent event stream을 연결한다.') },
        ]) +
          note('다음 권', '05권은 화면 뒤에서 tool effect를 제한하고 외부 capability를 붙이는 권한·hook·MCP·plugin 구조를 다룬다.', 'good'),
      ],
    ],
  },
  {
    volume: '05',
    slug: '05-permissions-security-and-extensibility',
    symbol: 'CAP',
    accent: '#b34e7c',
    title: '권한·보안·확장성',
    subtitle: '모델의 제안을 제한된 capability와 외부 효과로 번역하기',
    audience: 'security·platform 엔지니어',
    mode: '위협 모델 · capability 설계',
    sections: [
      [
        'THREAT MODEL',
        '텍스트 생성기가 효과 권한을 얻는 순간',
        'agent security의 핵심 위험은 모델이 틀릴 수 있다는 사실보다, untrusted context가 shell·filesystem·network·account capability와 연결된다는 데 있다.',
        flow([
          ['instruction', 'user/system'],
          ['untrusted data', 'repo · web · tool result'],
          ['model proposal', 'tool name + input'],
          ['mediation', 'schema · policy · human'],
          ['effect', 'filesystem · process · network'],
        ]) +
          note('보안 원칙', 'least privilege, complete mediation, defense in depth, auditability를 prompt 지시가 아니라 runtime capability boundary에 둔다.', 'risk') +
          refs([ext('https://arxiv.org/abs/2505.24019', 'LLM Agents Should Employ Security Principles'), ext('https://modelcontextprotocol.io/specification/2025-06-18/server/tools#security-considerations', 'MCP security considerations')]),
      ],
      [
        'TOOL CONTRACT',
        'capability는 함수 하나보다 크다',
        'Tool은 schema와 call뿐 아니라 read-only·destructive·concurrency·permission·prompt·render·result mapping을 포함한다.',
        table(
          ['계약 축', '질문', '보안 의미'],
          [
            ['input schema', '어떤 값만 허용?', '구조적 validation'],
            ['validateInput', '현재 context에서 유효?', 'path/workspace invariant'],
            ['checkPermissions', '효과가 허용?', 'policy/user gate'],
            ['isReadOnly/destructive', '효과 분류?', 'prompt·UI·policy hint'],
            ['isConcurrencySafe', '동시 실행 가능?', 'race/effect ordering'],
            ['call', '실제 capability?', '최소 권한 adapter'],
            ['result mapping', '모델에 무엇을 돌려줌?', 'data exfiltration/poisoning'],
          ],
        ) +
          refs([src('src/Tool.ts', '362-695')]),
      ],
      [
        'DEFAULTS',
        'buildTool 기본값을 비판적으로 읽기',
        'builder는 누락 메서드를 채워 모든 tool을 완전한 계약처럼 보이게 한다. 그러나 각 기본값의 안전 의미는 같지 않다.',
        table(
          ['기본값', '값', '해석'],
          [
            ['isConcurrencySafe', 'false', '보수적 직렬화 — fail closed'],
            ['isReadOnly', 'false', 'write 가능성 가정 — 보수적'],
            ['isDestructive', 'false', '파괴성 표시에는 비보수적; 별도 permission이 중요'],
            ['checkPermissions', 'allow + input', 'tool-specific check 생략, general permission system에 의존'],
            ['classifier input', '빈 문자열', 'security-relevant tool은 반드시 override 필요'],
            ['isEnabled', 'true', '등록되면 기본 노출 가능'],
          ],
        ) +
          note('리뷰 질문', '“default가 있다”가 “안전하다”는 뜻이 아니다. 새 tool template은 effect classification·classifier·permission override를 checklist로 강제해야 한다.', 'risk') +
          refs([src('src/Tool.ts', '743-792')]),
      ],
      [
        'PERMISSION MODES',
        'mode는 정책 bundle이지 개별 결론이 아니다',
        '외부 mode는 default, plan, acceptEdits, bypassPermissions, dontAsk이며 내부 feature로 auto/bubble이 추가될 수 있다.',
        table(
          ['mode', '의도', '주의'],
          [
            ['default', '규칙과 필요 시 사용자 확인', 'baseline을 명시적으로 파악'],
            ['plan', '계획 단계, 효과 제한', '일부 transition/복원 규칙 존재'],
            ['acceptEdits', '편집 허용을 넓힘', 'shell/network까지 자동 허용 아님'],
            ['bypassPermissions', '대부분의 prompt 우회', 'killswitch·환경 restriction 확인'],
            ['dontAsk', 'ask를 deny로 변환', '비대화형 환경에서 유용'],
            ['auto', 'classifier 기반', 'feature/runtime availability와 circuit breaker'],
          ],
        ) +
          refs([src('src/types/permissions.ts', '1-45'), src('src/utils/permissions/PermissionMode.ts', '1-140')]),
      ],
      [
        'RULE PROVENANCE',
        '같은 allow라도 출처가 다르다',
        'user, project, local, policy, CLI, command, session에서 온 규칙은 지속성·신뢰·감사 의미가 다르다.',
        table(
          ['source', '범위/수명', '리뷰 질문'],
          [
            ['policySettings', '조직 관리', '사용자가 우회 가능한가?'],
            ['userSettings', '사용자 전역', '너무 넓은 wildcard인가?'],
            ['projectSettings', 'repo 공유 가능', 'untrusted repository가 권한을 제안하는가?'],
            ['localSettings', '현재 machine/project', 'VCS 밖에 유지되는가?'],
            ['cliArg', 'process 실행', 'shell history/automation에서 노출?'],
            ['session', '현재 session', 'resume 후 유지 여부?'],
          ],
        ) +
          note('complete mediation', '모든 effect는 최종 실행 직전에 현재 input과 현재 policy로 다시 매개되어야 한다. discovery 시점의 allow를 오래 캐시하면 TOCTOU 위험이 생긴다.') +
          refs([src('src/types/permissions.ts', '46-120')]),
      ],
      [
        'HOOK LIFECYCLE',
        'hook은 관찰·정책·자동화의 확장 seam',
        '공식 문서는 session, turn, tool call lifecycle에 command/HTTP/MCP/prompt/agent hook을 연결한다.',
        table(
          ['cadence', '대표 events', '안전 질문'],
          [
            ['session', 'SessionStart/End, Setup', '환경·secret을 얼마나 주는가?'],
            ['turn', 'UserPromptSubmit, Stop/Failure', 'prompt 변형과 stop 차단을 구분?'],
            ['tool', 'PreToolUse, PermissionRequest, PostToolUse/Failure/Batch', 'effect 전/후 authority가 분리?'],
            ['context', 'InstructionsLoaded, Pre/PostCompact', 'untrusted instruction provenance?'],
            ['workspace', 'FileChanged, CwdChanged, Worktree*', '재귀 trigger·race 방지?'],
          ],
        ) +
          note('hook의 한계', 'PostToolUse는 이미 발생한 효과를 예방할 수 없다. block 권위와 관찰/annotation 권위를 혼동하지 않는다.') +
          refs([ext('https://code.claude.com/docs/en/hooks', 'Claude Code hooks reference'), src('src/services/tools/toolExecution.ts', '126-131')]),
      ],
      [
        'SHELL SAFETY',
        '문자열 blacklist가 아니라 parse·semantics·sandbox',
        'Bash/PowerShell에는 parser, AST, read-only validation, path validation, git safety, permission matcher가 별도 모듈로 존재한다.',
        flow([
          ['command string', 'model input'],
          ['parse', 'shell AST'],
          ['classify', 'read/write/danger'],
          ['resolve paths', 'cwd/workspace'],
          ['permission', 'rule/human'],
          ['sandbox/exec', 'bounded process'],
        ]) +
          note('왜 AST인가', 'pipe, redirection, subshell, command substitution, quoting은 단순 prefix 검사로 의미가 뒤집힌다. parser가 실패하면 보수적으로 unsafe로 처리하는 경로가 중요하다.', 'risk') +
          refs([src('src/utils/bash/ast.ts', 1), src('src/tools/BashTool/bashSecurity.ts', 1), src('src/tools/PowerShellTool/readOnlyValidation.ts', 1)]),
      ],
      [
        'SANDBOX',
        'permission prompt와 OS 격리는 다른 방어층',
        '사용자 확인은 의도 확인이고 sandbox는 capability 제한이다. 둘 중 하나가 다른 하나를 대체하지 않는다.',
        table(
          ['층', '막는 것', '못 막는 것'],
          [
            ['schema', '형식 오류', '유효하지만 위험한 값'],
            ['permission', '승인되지 않은 요청', '승인 후 command 내부 동작'],
            ['sandbox', 'filesystem/network/process 범위', '허용 범위 내 논리 오류'],
            ['hook', '조직 policy·추가 검사', 'hook 자체의 취약성'],
            ['audit', '사후 원인 불명', '효과 자체 예방'],
          ],
        ) +
          refs([src('src/utils/sandbox/sandbox-adapter.ts', 1), src('src/tools/BashTool/shouldUseSandbox.ts', 1)]),
      ],
      [
        'MCP',
        '외부 server를 capability registry로 연결',
        'MCP tool은 name, description, input/output schema와 structured/unstructured result를 protocol로 교환한다.',
        flow([
          ['connect', 'stdio · SSE · HTTP · WS'],
          ['discover', 'tools/list'],
          ['project', 'model tool schema'],
          ['invoke', 'tools/call'],
          ['validate', 'result/output schema'],
          ['mediate', 'permission/UI/audit'],
        ]) +
          note('신뢰 경계', 'MCP 사양은 tool annotation을 trusted server가 아니면 신뢰하지 말라고 명시한다. “readOnlyHint” 같은 metadata를 권한 근거로 직접 쓰지 않는다.', 'risk') +
          refs([ext('https://modelcontextprotocol.io/specification/2025-06-18/server/tools', 'MCP Tools spec'), src('src/services/mcp/client.ts', 1), src('src/tools/MCPTool/MCPTool.ts', 1)]),
      ],
      [
        'TOOL SEARCH',
        '모든 schema를 항상 prompt에 넣지 않기',
        '도구 수가 늘면 prompt token과 선택 혼란이 커진다. deferred tool은 검색으로 발견한 뒤 필요한 schema만 로드한다.',
        table(
          ['속성', '의미', 'trade-off'],
          [
            ['shouldDefer', '초기 prompt에서 schema 지연', '첫 호출에 search round-trip'],
            ['alwaysLoad', '반드시 turn 1에 노출', 'prompt 비용 증가'],
            ['searchHint', 'keyword discovery 보조', 'description drift 위험'],
            ['listChanged', 'MCP tool set 갱신', 'mid-turn consistency 필요'],
            ['refreshTools', '연결 후 tool registry 갱신', 'snapshot/permission 재평가'],
          ],
        ) +
          refs([src('src/Tool.ts', '371-472'), src('src/tools/ToolSearchTool/ToolSearchTool.ts', 1)]),
      ],
      [
        'PLUGINS & SKILLS',
        '배포 단위와 instruction 단위를 구분',
        'plugin은 commands/agents/hooks/MCP 등을 묶어 설치·업데이트하는 공급망 단위이고, skill은 모델이 사용할 절차·지식 단위다.',
        table(
          ['축', 'Plugin', 'Skill'],
          [
            ['발견', 'marketplace/installed dirs', 'bundled/dynamic dirs'],
            ['내용', 'manifest + multiple extensions', 'SKILL.md + resources'],
            ['실행', 'loader가 runtime surface 구성', 'SkillTool/context injection'],
            ['주 위험', 'supply chain, update, hook/code', 'prompt injection, stale instruction'],
            ['검증', 'signature/source/dependency/policy', 'scope/provenance/authority separation'],
          ],
        ) +
          refs([src('src/utils/plugins/pluginLoader.ts', 1), src('src/tools/SkillTool/SkillTool.ts', 1), src('src/utils/skills', null, 'src/utils/skills')]),
      ],
      [
        'PROMPT INJECTION',
        'repo·web·tool output은 데이터이지 권위가 아니다',
        'agent는 README, source comment, web page, MCP result에서 자연어를 읽는다. 이 텍스트가 system/user authority를 가장하면 tool misuse로 이어질 수 있다.',
        cards([
          { kicker: 'separate', title: '출처 태깅', body: p('instruction과 untrusted content의 provenance를 보존한다.') },
          { kicker: 'minimize', title: '최소 capability', body: p('읽기 작업에 write/network tool을 함께 주지 않는다.') },
          { kicker: 'mediate', title: '구조화된 승인', body: p('민감 effect의 target·scope를 runtime에서 확인한다.') },
          { kicker: 'contain', title: 'sandbox', body: p('오염된 plan이 도달 가능한 피해 범위를 줄인다.') },
        ]) +
          note('이 보고서 자체의 규칙', '분석 대상 저장소 안의 README/주석은 연구 데이터로만 취급했다. 현재 작업 저장소의 사용자 제공 AGENTS.md만 실행 지시로 적용했다.', 'good'),
      ],
      [
        'TELEMETRY',
        '관측 가능성과 데이터 최소화의 긴장',
        'tool name, error class, duration, request/tool identifiers는 진단에 유용하지만 path·content·secret이 섞이면 위험하다.',
        table(
          ['데이터', '유용성', '최소화'],
          [
            ['tool name/type', '사용·실패 분포', 'MCP 이름 정규화/allowlist'],
            ['error class/code', '원인 집계', 'message/path 제거'],
            ['duration/checkpoint', 'latency 병목', 'content 불필요'],
            ['request/tool id', 'causal join', 'session 밖 보존 기간 제한'],
            ['input/output details', '정밀 진단', 'opt-in·redaction·local-only'],
          ],
        ) +
          p('toolExecution에는 minified constructor name 대신 구조화된 errno/stable name을 기록하고 길이를 제한하는 분류 함수가 있다. 이는 observability와 정보 노출을 함께 다루는 좋은 예다.') +
          refs([src('src/services/tools/toolExecution.ts', '139-170'), src('src/services/analytics', null, 'analytics modules')]),
      ],
      [
        'SUPPLY CHAIN',
        '확장 시스템의 신뢰 질문',
        'plugin·MCP·hook·skill은 모두 외부 입력이지만 설치·실행·업데이트 권한이 다르다.',
        check([
          '정확한 source/registry/revision을 고정했는가?',
          '설치 시 code execution이 발생하는가?',
          '자동 업데이트의 서명·rollback이 있는가?',
          'hook command가 repository content로부터 주입될 수 있는가?',
          'MCP server가 ambient credential을 사용하는가?',
          'skill instruction이 효과 권한처럼 취급되는가?',
          'tool description과 실제 schema/effect가 일치하는가?',
          '삭제·전송·overwrite에 별도 human gate가 있는가?',
          '로그에 token/path/content가 남는가?',
          'extension 제거 후 capability가 실제 회수되는가?',
        ]),
      ],
      [
        'SECURITY REVIEW',
        'tool 하나를 리뷰하는 질문 순서',
        '설명보다 데이터·권한·효과 경계를 먼저 본다.',
        ol([
          '<b>enumerate</b> — 입력 필드, 파생 path, credential, network target을 열거한다.',
          '<b>canonicalize</b> — parse·normalize 후 검사와 실행이 같은 값을 쓰는지 본다.',
          '<b>classify</b> — read/write/destructive/open-world/concurrency 속성을 input별로 판정한다.',
          '<b>mediate</b> — general rule, tool-specific rule, hook, human prompt의 순서와 precedence를 본다.',
          '<b>contain</b> — sandbox/timeout/output limit/abort를 확인한다.',
          '<b>observe</b> — 최소 telemetry와 audit correlation을 본다.',
          '<b>settle</b> — partial effect, error, cancellation 뒤 state를 본다.',
        ]) +
          exercise('FileWrite threat model', 'path traversal, symlink race, overwrite, permission cache, abort-after-open 사례를 STRIDE식으로 정리한다.', 'attack → control → residual risk 표'),
      ],
      [
        'LAB',
        '최소 capability tool 만들기',
        '기능보다 거부·관측·정리 경로를 먼저 구현한다.',
        table(
          ['단계', '구현', '검증'],
          [
            ['schema', '단일 workspace-relative path', 'absolute/.. 거부'],
            ['canonicalization', 'realpath + root containment', 'symlink escape'],
            ['classification', 'read-only true, destructive false', 'property test'],
            ['permission', 'path matcher + ask', 'rule provenance'],
            ['execution', 'AbortSignal + timeout', 'mid-read abort'],
            ['result', 'size limit + redaction', 'large/secret fixture'],
            ['audit', 'id/type/duration only', 'path가 로그에 없음'],
          ],
        ) +
          note('확장 과제', '동일 tool을 MCP server로 노출해 schema·result·permission이 어느 층에서 중복되는지 비교한다.'),
      ],
      [
        'TAKEAWAYS',
        '권한과 확장을 이해했다는 기준',
        'tool이 보인다는 사실, 모델이 호출했다는 사실, 실행이 허용됐다는 사실, effect가 성공했다는 사실을 분리할 수 있어야 한다.',
        cards([
          { kicker: 'discover', title: '가시성', body: p('schema가 model context에 노출됨.') },
          { kicker: 'decide', title: '권한', body: p('현재 input/effect가 허용됨.') },
          { kicker: 'execute', title: '능력', body: p('adapter가 실제 외부 시스템을 변경함.') },
          { kicker: 'settle', title: '증거', body: p('결과·오류·부분 효과가 정리됨.') },
        ]) +
          note('다음 권', '06권은 앞의 모든 개념을 코드 리딩·실험·리뷰 능력으로 전환하는 실습 커리큘럼이다.', 'good'),
      ],
    ],
  },
  {
    volume: '06',
    slug: '06-labs-review-and-study-guide',
    symbol: 'LAB',
    accent: '#3476bd',
    title: '실습·리뷰·스터디 가이드',
    subtitle: '읽기에서 재구현·검증·설계 전이로',
    audience: '스터디 운영자·참여자',
    mode: '워크북 · 평가',
    sections: [
      [
        'HOW TO USE',
        '정답집이 아니라 evidence workbook',
        '각 실습은 목표, bounded file set, 조작, 기대 evidence, 중단 조건으로 구성한다.',
        table(
          ['구성', '작성 내용', '나쁜 예'],
          [
            ['질문', '한 문장으로 falsifiable', '“전체를 이해한다”'],
            ['범위', '파일 3–8개 + exact lines', 'src 전체'],
            ['조작', 'mock/event/input 변화', '그냥 읽기'],
            ['관찰', 'trace/test/frame/graph', '느낌'],
            ['결론', '사실/추정/한계 분리', '영상과 같았다'],
            ['중단', '시간·범위·안전 조건', '끝날 때까지'],
          ],
        ) +
          note('저작권 원칙', '실습 저장소에 원 소스의 큰 덩어리를 복사하지 않는다. 작은 독립 toy implementation과 line reference를 사용한다.', 'warn'),
      ],
      [
        'LAB 0',
        '프로비넌스와 신뢰도 카드',
        '코드를 읽기 전에 분석 대상을 정확히 고정한다.',
        ol([
          'remote URL, commit, commit date, version 표기를 기록한다.',
          'LICENSE 파일 유무와 README disclaimer를 분리한다.',
          'QUICKSTART의 build limitation과 missing module 주장을 등급 B로 기록한다.',
          '공식 Claude Code repository/docs와 이 reconstructed source를 구분한다.',
          '분석에서 실행하지 않을 script와 이유를 적는다.',
        ]) +
          exercise('source card', '한 페이지 provenance card를 만든다.', 'revision·scope·limitations·legal note·sources'),
      ],
      [
        'LAB 1',
        '코드 분포와 hotspot 재현',
        '라인 수 대신 구조 신호를 계산한다.',
        ol([
          'TS compiler API로 .ts/.tsx를 parse한다.',
          'directory별 files/lines, syntax feature count를 만든다.',
          '상대 import를 resolve해 fan-in/out과 SCC를 계산한다.',
          'REPL.tsx, Tool.ts, query.ts를 graph에 표시한다.',
          'metric의 한계—barrel, dynamic import, missing module—를 적는다.',
        ]) +
          exercise('metric audit', '이 묶음의 source-metrics.json과 자신의 결과를 비교한다.', '차이 원인 세 가지'),
      ],
      [
        'LAB 2',
        'async generator 상태기계',
        '문법 이해를 cancellation·error semantics까지 확장한다.',
        table(
          ['case', 'producer', 'consumer action', '기대'],
          [
            ['normal', '1,2,3 yield', '끝까지 iterate', 'done true + terminal'],
            ['slow consumer', '10ms produce', '100ms await', 'pull-based 순서 유지'],
            ['consumer return', '무한 producer', '3개 후 break', 'finally/dispose'],
            ['throw', '2 뒤 error', 'try/catch', 'error propagation'],
            ['abort', 'await 중 signal', 'abort()', 'bounded exit'],
            ['delegation', 'child generator', 'parent yield*', 'return value 전달'],
          ],
        ) +
          exercise('protocol log', 'next/return/throw 호출과 iterator result를 모두 기록한다.', '상태 전이 표'),
      ],
      [
        'LAB 3',
        '축약 agent loop',
        '모델 mock과 tool mock으로 두 번의 request를 만든다.',
        code(`request #1 → text("검색") → tool_use(read, id=A)
tool A → tool_result(id=A, "found")
request #2 → text("요약") → completed`, '목표 trace') +
          check([
            '각 event에 sequence와 timestamp가 있다.',
            'tool_use/result id가 일치한다.',
            'unknown tool은 모델이 볼 수 있는 error result가 된다.',
            'maxTurns가 loop를 닫는다.',
            'AbortSignal이 model/tool에 모두 전달된다.',
            'terminal reason을 boolean 대신 union으로 표현한다.',
          ]),
      ],
      [
        'LAB 4',
        'fallback과 tombstone',
        'append-only UI가 왜 충분하지 않은지 실험한다.',
        ol([
          'attempt A가 text와 tool_use 일부를 yield한 뒤 실패하게 한다.',
          'attempt B가 fresh message를 생성한다.',
          'tombstone 없이 transcript를 렌더해 orphan/duplicate를 관찰한다.',
          'tombstone event를 추가해 materialized view가 old message를 제거하게 한다.',
          'event log 자체는 append-only, view는 retractable인 구조를 설명한다.',
        ]) +
          exercise('view reducer', 'event[]에서 현재 messages를 만드는 pure reducer를 작성한다.', 'fallback 전후 snapshot test'),
      ],
      [
        'LAB 5',
        'Tool contract vertical slice',
        'FileRead 또는 작은 toy tool을 schema부터 renderer까지 추적한다.',
        table(
          ['관찰 지점', '기록'],
          [
            ['definition', 'name, schema, output, progress'],
            ['classification', 'read-only, destructive, concurrency'],
            ['validation', 'path/limits/context'],
            ['permission', 'rule/mode/human'],
            ['execution', 'signal/timeout/effect'],
            ['normalization', 'tool_result shape'],
            ['projection', 'compact/verbose/headless'],
          ],
        ) +
          exercise('one-page contract', '한 tool의 모든 contract를 표 한 장으로 만든다.', '각 행에 source line ref'),
      ],
      [
        'LAB 6',
        '권한 결정표',
        'mode, rule, tool-specific check, hook, human prompt의 precedence를 작은 모델로 재구성한다.',
        table(
          ['입력', 'mode', 'rule', 'hook', '기대'],
          [
            ['read cwd', 'default', 'allow', 'none', 'allow'],
            ['write cwd', 'default', 'ask', 'none', 'prompt'],
            ['write cwd', 'dontAsk', 'ask', 'none', 'deny'],
            ['shell dangerous', 'bypass', 'allow', 'block', 'block 여부 검증'],
            ['outside root', 'acceptEdits', 'allow?', 'none', 'tool validation 우선'],
            ['MCP delete', 'default', 'server hint readOnly', 'none', 'hint 불신'],
          ],
        ) +
          note('목표', '표의 기대를 추측으로 채우지 말고 실제 resolver line과 test로 확인한다. 미확인은 미확인으로 남긴다.'),
      ],
      [
        'LAB 7',
        'PromptInput finite-state model',
        'early return 연쇄를 transition table로 바꾼다.',
        ol([
          'Enter 처리부에서 guard condition을 순서대로 추출한다.',
          '각 guard를 state + event → action으로 표현한다.',
          '동시에 참일 수 있는 guard와 precedence를 찾는다.',
          'normal submit까지 가는 minimal state를 만든다.',
          'table-driven test로 branch coverage를 만든다.',
        ]) +
          exercise('guard refactor proposal', '행동은 바꾸지 않고 guard 평가를 pure function으로 떼는 설계를 제안한다.', 'before/after dependency와 rollback'),
      ],
      [
        'LAB 8',
        'React/Ink frame 측정',
        '“React가 알아서 batching”을 계측 가능한 주장으로 바꾼다.',
        table(
          ['측정', '도구', '질문'],
          [
            ['chunk arrival', 'mock async generator', '입력 속도는?'],
            ['state updates', 'instrumented setter', '몇 번 호출?'],
            ['renders', 'counter/profiler', '몇 component가 render?'],
            ['terminal writes', 'mock stdout', '몇 회/몇 byte?'],
            ['visual result', 'pseudo-TTY snapshot', '누락/flicker/scrollback?'],
          ],
        ) +
          exercise('rate sweep', '10/30/100/300 chunk·초에서 표를 만든다.', '성능 switch point와 한계'),
      ],
      [
        'LAB 9',
        '컨텍스트 예산 시뮬레이션',
        'compaction을 품질·비용·회복 문제로 다룬다.',
        cards([
          { kicker: 'workload A', title: '긴 text 대화', body: p('요약 손실과 token 절감 비교.') },
          { kicker: 'workload B', title: '큰 tool result', body: p('persist/preview와 재읽기 비용.') },
          { kicker: 'workload C', title: '반복 file edits', body: p('attachment 중복과 stale context.') },
          { kicker: 'workload D', title: 'media 포함', body: p('size error recovery 경로.') },
        ]) +
          exercise('quality budget', '각 workload에서 keep/snip/microcompact/summary를 언제 선택할지 policy를 만든다.', 'decision table + counterexample'),
      ],
      [
        'LAB 10',
        'MCP server 최소 구현과 trust test',
        'tool discovery와 실행, result validation, human confirmation을 분리한다.',
        ol([
          'read-only toy tool 한 개를 tools/list로 노출한다.',
          'input/output schema를 정의하고 invalid result를 일부러 반환한다.',
          'client가 output schema를 검증하는지 확인한다.',
          'server annotation에 거짓 readOnlyHint를 넣고 권한 경계가 속지 않는지 확인한다.',
          'timeout/abort와 transport disconnect를 시험한다.',
        ]) +
          exercise('trust matrix', 'trusted/untrusted server × read/write tool × interactive/headless를 평가한다.', '12-cell policy matrix'),
      ],
      [
        'LAB 11',
        'Prompt injection 위협 모델',
        'repository comment나 web content가 instruction처럼 보일 때 effect 경로를 추적한다.',
        table(
          ['공격 지점', '원하는 오용', '구조 통제'],
          [
            ['README', 'shell 실행 유도', 'instruction provenance + permission'],
            ['web page', 'secret exfiltration', 'content isolation + network allowlist'],
            ['MCP result', '다른 tool 호출 유도', 'untrusted result + least privilege'],
            ['plugin skill', '지속 instruction', 'install trust + scope + review'],
            ['tool output', 'fake success/authority', 'typed evidence + canonical readback'],
          ],
        ) +
          note('안전', '실제 secret·외부 account·파괴적 명령을 사용하지 않는다. toy filesystem과 fake token으로 시뮬레이션한다.', 'risk'),
      ],
      [
        'LAB 12',
        '의존성 cycle 한 조각 자르기',
        '거대 SCC 전체가 아니라 하나의 vertical slice에서 seam을 찾는다.',
        ol([
          'Tool.ts와 FileReadTool/UI/runtime 주변 local graph를 추출한다.',
          'type-only, runtime, UI, registry edge를 색칠한다.',
          'UI render contract를 별도 adapter로 이동하는 가설을 세운다.',
          'headless consumer와 interactive consumer의 public surface를 설계한다.',
          '변경 파일·compatibility·validation·rollback을 작성한다.',
        ]) +
          exercise('ADR 한 장', '현 구조 유지 vs render adapter 분리의 trade-off를 비교한다.', '선택·근거·반대 증거·재검토 조건'),
      ],
      [
        'CODE REVIEW RUBRIC',
        'agent runtime 변경 리뷰 12문항',
        '기능이 동작하는지만 보지 않고 stream·취소·권한·정리·관측 가능성의 계약이 함께 보존되는지 확인한다.',
        check([
          '새 event/terminal variant가 exhaustive하게 처리되는가?',
          'streaming 중 partial state가 실패 시 retract/settle되는가?',
          'AbortSignal이 모든 blocking boundary에 전달되는가?',
          'permission 검사와 실제 effect input이 동일한 canonical value인가?',
          'read-only·destructive·concurrency 분류가 input별로 정확한가?',
          'retry/loop/budget에 상한과 failure fingerprint가 있는가?',
          'tool_use/result id와 순서 불변식이 보존되는가?',
          'UI projection이 API-bound message를 mutate하지 않는가?',
          'feature gate 조합에서 missing import/untested path가 생기지 않는가?',
          'telemetry가 path/content/secret을 최소화하는가?',
          'headless/interactive/remote surface의 의미가 일치하는가?',
          '공식 사양과 소스 추정이 문서에서 구분되는가?',
        ]),
      ],
      [
        'QUIZ A',
        '개념 확인 질문',
        '정답보다 근거와 반례를 말한다.',
        ol([
          'async generator와 ReadableStream은 어떤 요구에서 서로 대체 가능하고 불가능한가?',
          'yield*가 하위 generator의 terminal을 어떻게 전달하는가?',
          'tool result error와 thrown error를 왜 구분하는가?',
          'React reconciler와 Ink renderer의 책임을 각각 한 문장으로 정의하라.',
          'Static history가 없는 terminal chat UI에서 어떤 현상이 생길 수 있는가?',
          'isReadOnly=true가 concurrency-safe를 보장하지 않는 반례를 들어라.',
          'bypassPermissions가 sandbox를 대체하지 못하는 이유는?',
          'MCP tool annotation을 권한 근거로 신뢰하면 안 되는 이유는?',
        ]),
      ],
      [
        'QUIZ B',
        '소스 추적 질문',
        '각 답에는 최소 두 개의 source line ref가 필요하다.',
        ol([
          'query loop가 tool_use continuation을 결정하는 실제 evidence는 무엇인가?',
          'fallback 뒤 orphan message를 제거하는 event는 무엇인가?',
          'tool concurrency 기본 상한과 보수적 parse failure 처리 위치는?',
          'permission mode의 외부/내부 집합은 어떻게 다른가?',
          'Tool builder가 채우는 기본 method와 그 보안 의미는?',
          'memory prefetch가 조기 generator 종료에서 정리되는 표현은?',
          'REPL onQuery의 try/finally가 복구하는 UI 상태는 무엇인가?',
          'build script를 실행하지 않은 이유를 source limitation으로 설명하라.',
        ]),
      ],
      [
        'PRESENTATION TEMPLATE',
        '20분 발표를 구성하는 법',
        '기능 나열 대신 하나의 설계 긴장을 중심으로 구성한다.',
        table(
          ['시간', '내용', '예시'],
          [
            ['2분', '사용자 사건', 'Enter 후 첫 token까지'],
            ['3분', '도메인 요구', '점진성·취소·권한'],
            ['5분', '언어 메커니즘', 'async generator + AbortSignal'],
            ['5분', '코드 구조', 'query → tool runtime → projection'],
            ['3분', '실패/반례', 'fallback tombstone'],
            ['2분', '전이 가능한 원칙', 'append-only log vs retractable view'],
          ],
        ) +
          note('발표 금지', '파일 트리 낭독, 20줄 넘는 코드 캡처, 근거 없는 “Anthropic은 ~하려고 했다”식 의도 추정.'),
      ],
      [
        'ASSESSMENT',
        '학습 성취 루브릭',
        '파일을 찾는 수준에서 시작해 근거를 연결하고, 반증 가능한 설계 판단과 재사용 가능한 분석 프레임까지 발전시킨다.',
        table(
          ['수준', '설명', '증거'],
          [
            ['1 · 식별', '파일/문법을 찾는다', 'anchor link'],
            ['2 · 설명', '기능 흐름을 말한다', 'sequence diagram'],
            ['3 · 연결', '요구↔메커니즘↔구조를 잇는다', 'concept map'],
            ['4 · 검증', '반례·실패를 실험한다', 'trace/test'],
            ['5 · 전이', '다른 agent runtime에 적용한다', 'design proposal'],
          ],
        ) +
          p('팀 평가는 사람의 암기량이 아니라 artifact의 재현성·근거 품질·불확실성 관리에 둔다.'),
      ],
      [
        'FURTHER RESEARCH',
        '다음 판에서 확장할 분석',
        '이번 자료는 넓은 지도를 제공한다. 다음 연구는 exact revision과 실행 환경을 새로 고정해야 한다.',
        cards([
          { kicker: 'runtime', title: '실제 trace 계측', body: p('공식 binary의 event/latency를 source 가설과 비교.') },
          { kicker: 'versions', title: '버전 diff', body: p('2.1.88 이후 query/tool/permission 변화 추적.') },
          { kicker: 'testing', title: '복원 test corpus', body: p('source에 빠진 test를 behavior fixture로 재구성.') },
          { kicker: 'security', title: 'adversarial evaluation', body: p('prompt injection·path·MCP trust benchmark.') },
          { kicker: 'architecture', title: 'cycle decomposition', body: p('largest SCC를 vertical slice별로 분해.') },
          { kicker: 'performance', title: 'TUI benchmark', body: p('event rate→render/write/latency 관계 계측.') },
        ]) +
          note('별도 작업으로 남김', '공식 제품 binary 실행, 인증 계정 사용, 외부 시스템 효과, 대규모 소스 재배포는 이번 산출물 범위에 포함하지 않았다.', 'warn'),
      ],
      [
        'FINAL CHECK',
        '스터디를 마치기 전',
        '아래 질문에 모두 “예”라면 이 프로젝트를 다른 코드베이스의 설계 도구로 사용할 수 있다.',
        check([
          '코드와 문서, 공식 사양, 내 추정을 구분했다.',
          '성공 경로와 실패·취소·거부 경로를 같은 깊이로 읽었다.',
          '문법을 제품 요구와 연결했다.',
          '한 vertical slice를 schema부터 UI까지 추적했다.',
          '최소 하나의 설명을 실험으로 반증하려 했다.',
          '성능 주장을 계측 지표로 바꿨다.',
          '권한과 capability, effect와 evidence를 구분했다.',
          '대형 소스 조각을 복제하지 않고 파생 지식을 만들었다.',
          '다음 연구 범위와 미확인 사실을 남겼다.',
          '다른 agentic CLI에 동일한 분석 프레임을 적용할 수 있다.',
        ]) +
          `<div class="quote">“흐름을 따라가는 것”에서 끝내지 않고, 왜 이 표현이어야 했는지와 어디서 깨지는지를 설명하는 것이 목표다.</div>`,
      ],
      [
        'SOURCE INDEX',
        '핵심 1차 자료',
        '보고서 본문은 아래 소스의 짧은 참조와 파생 설명으로 구성했다.',
        table(
          ['범주', '자료'],
          [
            ['분석 대상', ext(REPO, 'stupidhumans/claude-code-source-code')],
            ['공식 제품', ext('https://github.com/anthropics/claude-code', 'anthropics/claude-code')],
            ['언어', ext('https://tc39.es/ecma262/', 'ECMAScript specification')],
            ['타입', ext('https://www.typescriptlang.org/docs/handbook/2/narrowing', 'TypeScript Handbook — Narrowing')],
            ['UI', ext('https://github.com/vadimdemedes/ink', 'Ink')],
            ['SSE 배경', ext('https://html.spec.whatwg.org/multipage/server-sent-events.html', 'WHATWG SSE')],
            ['MCP', ext('https://modelcontextprotocol.io/specification/2025-06-18/server/tools', 'MCP Tools specification')],
            ['Hooks/permissions', ext('https://code.claude.com/docs/en/hooks', 'Claude Code Hooks reference')],
            ['Agent 연구', `${ext('https://arxiv.org/abs/2210.03629', 'ReAct')} · ${ext('https://arxiv.org/abs/2302.04761', 'Toolformer')}`],
            ['참고 영상', `${ext('https://www.youtube.com/watch?v=3ZnBDXQQN_E', 'async generator')} · ${ext('https://www.youtube.com/watch?v=W83jWFwEnTU&t=61s', 'React/Ink')}`],
          ],
        ),
      ],
    ],
  },
)

async function writeReadme(manifest, metrics) {
  const rows = manifest
    .map(item => `| ${item.volume} | ${item.title} | ${item.pages} | [PDF](${item.pdf}) · [HTML](${item.html}) |`)
    .join('\n')
  const content = `# Claude Code v2.1.88 소스 학습 자료\n\n` +
    `고정 대상: [${REPO}](${REPO}) @ \`${COMMIT}\`  \n` +
    `생성일: ${CREATED}\n\n` +
    `> 이 자료는 제3자 복원 저장소를 분석한 교육·연구용 파생 자료입니다. Anthropic의 공식 소스·공식 아키텍처 문서가 아닙니다. 저장소에 LICENSE 파일이 없고 README가 비상업적 학습 용도를 명시하므로, 원문 소스의 재배포·상업적 이용을 전제로 하지 않습니다.\n\n` +
    `| 권 | 제목 | PDF 페이지 | 파일 |\n|---|---|---:|---|\n${rows}\n\n` +
    `## 추천 순서\n\n00 → 01 → 02 → 03 → 04 → 05 → 06. 빠른 스터디는 00, 02, 03, 04, 06을 먼저 읽으세요.\n\n` +
    `## 범주 설계\n\n- 00은 자료의 신뢰 수준, 범위, 두 참고 영상과의 연결, 학습 경로를 정의합니다.\n- 01은 디렉터리·의존성·상태 소유권·확장 계층을 시스템 지도로 만듭니다.\n- 02는 async generator, yield/return, union, generic, schema, AbortSignal, using 등 언어 메커니즘을 제품 요구와 연결합니다.\n- 03은 query loop, streaming, context 관리, tool scheduling, recovery, terminal settlement를 다룹니다.\n- 04는 입력 이벤트부터 React/Ink reconciler, Yoga layout, ANSI diff, Static scrollback까지 추적합니다.\n- 05는 permission, capability/effect, hooks, MCP, plugin/skill 신뢰 경계를 분석합니다.\n- 06은 8주 운영안, 12개 실습, 리뷰 체크리스트, 평가 루브릭을 제공합니다.\n\n` +
    `## 정적 분석 요약\n\n- TypeScript/TSX 파일: ${metrics.files.toLocaleString()}개\n- 물리 라인: ${metrics.physicalLines.toLocaleString()}줄\n- async generator: ${metrics.asyncGenerators.toLocaleString()}개\n- for-await: ${metrics.forAwait.toLocaleString()}개\n- feature() 호출: ${metrics.featureCalls.toLocaleString()}개\n- React useState 호출: ${(metrics.hookCalls.useState ?? 0).toLocaleString()}개\n\n` +
    `## 재현과 검증\n\n생성기는 소스 경로를 인자로 받습니다: \`node build-study-pack.mjs /path/to/checked-out-repository\`. 고정 커밋을 checkout한 뒤 실행해야 링크와 수치가 맞습니다. 생성 과정은 모든 HTML sheet의 A4 PDF 변환과 manifest 기록을 포함합니다.\n\n재현용 분석 수치는 [metrics/source-metrics.json](metrics/source-metrics.json), 산출물 manifest는 [study-pack-manifest.json](study-pack-manifest.json), 생성 코드는 [build-study-pack.mjs](build-study-pack.mjs)에 있습니다.\n`
  await fs.writeFile(path.join(HERE, 'README.md'), content)
}

async function main() {
  await fs.access(SOURCE_DIR)
  await fs.mkdir(path.join(HERE, 'html'), { recursive: true })
  await fs.mkdir(path.join(HERE, 'metrics'), { recursive: true })
  await fs.mkdir(path.join(HERE, 'previews'), { recursive: true })

  const metrics = await collectMetrics()
  await fs.writeFile(
    path.join(HERE, 'metrics', 'source-metrics.json'),
    `${JSON.stringify(metrics, null, 2)}\n`,
  )

  const browser = await chromium.launch({ headless: true })
  const manifest = []
  try {
    for (const report of reports) {
      const sections = report.sections.map((args, index) => section(...args, index + 1))
      const html = htmlDocument(report, sections)
      const htmlName = `${report.slug}.html`
      const pdfName = `${report.slug}.pdf`
      const htmlPath = path.join(HERE, 'html', htmlName)
      const pdfPath = path.join(HERE, pdfName)
      await fs.writeFile(htmlPath, html)

      const page = await browser.newPage({ viewport: { width: 1240, height: 1754 }, deviceScaleFactor: 1 })
      await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle' })
      await page.emulateMedia({ media: 'print' })
      await page.pdf({
        path: pdfPath,
        format: 'A4',
        printBackground: true,
        preferCSSPageSize: true,
        margin: { top: '0', right: '0', bottom: '0', left: '0' },
      })
      await page.locator('.sheet').first().screenshot({
        path: path.join(HERE, 'previews', `${report.slug}-cover.png`),
      })
      await page.close()

      const pdfBuffer = await fs.readFile(pdfPath)
      const pages = [...pdfBuffer.toString('latin1').matchAll(/\/Type\s*\/Page\b/g)].length
      manifest.push({
        volume: report.volume,
        title: report.title,
        pdf: pdfName,
        html: `html/${htmlName}`,
        pages,
        bytes: pdfBuffer.length,
        sections: report.sections.length + 1,
        accent: report.accent,
      })
    }
  } finally {
    await browser.close()
  }

  const bundleManifest = {
    schemaVersion: 1,
    generatedAt: `${CREATED}T00:00:00+09:00`,
    source: { repository: REPO, commit: COMMIT, version: '2.1.88', sourceRootUsed: SOURCE_ROOT },
    limitations: [
      'Third-party reconstructed/decompiled source; not official Anthropic source.',
      'Repository documents missing feature-gated modules and incomplete rebuildability.',
      'No LICENSE file was found at repository root during analysis.',
      'Static metrics do not prove runtime feature activation or production behavior.',
    ],
    reports: manifest,
  }
  await fs.writeFile(
    path.join(HERE, 'study-pack-manifest.json'),
    `${JSON.stringify(bundleManifest, null, 2)}\n`,
  )
  await writeReadme(manifest, metrics)
  process.stdout.write(`${JSON.stringify(bundleManifest, null, 2)}\n`)
}

await main()
