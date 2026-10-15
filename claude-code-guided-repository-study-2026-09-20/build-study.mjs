import fs from 'node:fs/promises'
import path from 'node:path'
import { execFile as execFileCallback } from 'node:child_process'
import { promisify } from 'node:util'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'
import { analyzeCodebase } from '../claude-code-core-engineering-study-2026-09-20/tools/typescript-architecture-metrics.mjs'
import { reports } from './content.mjs'

const execFile = promisify(execFileCallback)
const HERE = path.dirname(fileURLToPath(import.meta.url))
const SOURCE_ROOT = path.resolve(HERE, '../../sources/stupidhumans/claude-code-source-code')
const CONFIG = JSON.parse(await fs.readFile(path.join(HERE, 'study-config.json'), 'utf8'))
const COMMIT = '2ca5ddabfed5f220812ea11f029eda03b21bc4c1'
const REPO = 'https://github.com/stupidhumans/claude-code-source-code'
const GH = `${REPO}/blob/${COMMIT}`
const DATE = '2026-09-20'

const esc = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')
const sourceLink = ref => {
  const [file, anchor = ''] = ref.split('#')
  return `<a href="${GH}/${file}${anchor ? `#${anchor}` : ''}">${esc(file)}${anchor ? `:${anchor.replace(/^L/, '').replace('-L', '–')}` : ''}</a>`
}
const extLink = ref => `<a href="${ref.url}">${esc(ref.label)}</a>`
const paragraphs = values => values.map(value => `<p>${value}</p>`).join('')
const pseudo = value => `<pre><small>분석용 의사코드 — 원문 전재가 아님</small><code>${esc(value)}</code></pre>`
const table = value => `<table><thead><tr>${value.headers.map(x => `<th>${x}</th>`).join('')}</tr></thead><tbody>${value.rows.map(row => `<tr>${row.map(x => `<td>${x}</td>`).join('')}</tr>`).join('')}</tbody></table>`
const list = values => `<ul>${values.map(x => `<li>${x}</li>`).join('')}</ul>`
const renderVisual = visual => {
  if (!visual) return ''
  if (visual.kind === 'code') {
    const lines = visual.code.split('\n').map((line, index) => `<span><i>${String(index + 1).padStart(2, '0')}</i>${esc(line)}</span>`).join('')
    const notes = visual.notes.map(note => `<li><b>${esc(note.label)}</b>${note.text}</li>`).join('')
    return `<figure class="visual-panel code-visual"><figcaption>${esc(visual.title)}<small>분석용 TypeScript — 실제 구현의 제어 구조를 축약·재작성</small></figcaption><div class="code-grid"><pre><code>${lines}</code></pre><ol>${notes}</ol></div><p class="underhood"><b>언어·런타임 안쪽에서는</b>${visual.mechanism}</p></figure>`
  }
  if (visual.kind === 'flow') {
    const steps = visual.steps.map((step, index) => `<div class="flow-step"><i>${String(index + 1).padStart(2, '0')}</i><b>${esc(step.title)}</b><span>${step.text}</span></div>`).join('<div class="arrow">→</div>')
    return `<figure class="visual-panel flow-visual"><figcaption>${esc(visual.title)}</figcaption><div class="flow-row">${steps}</div><p class="underhood"><b>이 그림이 감추지 않는 것</b>${visual.mechanism}</p></figure>`
  }
  if (visual.kind === 'state') {
    const states = visual.states.map(state => `<div class="state-node"><b>${esc(state.name)}</b><span>${state.text}</span></div>`).join('')
    const transitions = visual.transitions.map(item => `<li><code>${esc(item.when)}</code><span>${item.text}</span></li>`).join('')
    return `<figure class="visual-panel state-visual"><figcaption>${esc(visual.title)}</figcaption><div class="state-row">${states}</div><ul>${transitions}</ul><p class="underhood"><b>언어·런타임 안쪽에서는</b>${visual.mechanism}</p></figure>`
  }
  if (visual.kind === 'compare') {
    return `<figure class="visual-panel compare-visual"><figcaption>${esc(visual.title)}</figcaption>${table({ headers: visual.headers, rows: visual.rows })}<p class="underhood"><b>구분해야 하는 이유</b>${visual.mechanism}</p></figure>`
  }
  return ''
}
const citations = page => {
  const values = [...(page.refs ?? []).map(sourceLink), ...(page.external ?? []).map(extLink)]
  return values.length ? `<footer class="refs"><b>함께 펼쳐볼 자료</b>${values.map(x => `<span>${x}</span>`).join('')}</footer>` : ''
}

const CSS = `
@page{size:A4;margin:0}*{box-sizing:border-box}html,body{margin:0;padding:0;background:#dfe5e8;color:#17252d;font-family:"Noto Sans KR","Apple SD Gothic Neo",Arial,sans-serif}body{counter-reset:page}.sheet{--accent:#2f6f75;position:relative;width:210mm;height:297mm;padding:18mm 18mm 16mm;background:#fbfaf6;page-break-after:always;overflow:hidden;counter-increment:page}.sheet:last-child{page-break-after:auto}.running{height:8mm;display:flex;justify-content:space-between;align-items:flex-start;border-top:1.3mm solid var(--accent);padding-top:3mm;color:#52636b;font-size:7.3pt;letter-spacing:.04em}.running b{color:var(--accent);font-weight:800}.page-no:after{content:counter(page)}h1,h2,h3,p{margin:0}h1{font-family:Georgia,"Noto Serif KR",serif;font-size:31pt;line-height:1.12;letter-spacing:-.04em;max-width:165mm}h2{font-family:Georgia,"Noto Serif KR",serif;font-size:21pt;line-height:1.18;letter-spacing:-.035em;margin:8mm 0 3mm}h3{font-size:12.2pt;line-height:1.35;color:var(--accent);margin:5mm 0 2mm}.deck{font-size:11.2pt;line-height:1.62;color:#52636b;max-width:158mm;margin-bottom:6mm}.body{font-family:Georgia,"Noto Serif KR",serif;font-size:9.4pt;line-height:1.75}.body p{margin:0 0 3.4mm}.body p:first-child::first-letter{float:left;font-size:31pt;line-height:.85;padding:1.2mm 1.5mm 0 0;color:var(--accent);font-weight:700}.has-visual h2{font-size:19pt;margin-top:5mm}.has-visual .deck{font-size:10pt;line-height:1.5;margin-bottom:4mm}.has-visual .body{font-size:8.4pt;line-height:1.55}.has-visual .body>p{margin-bottom:2.2mm}.has-visual .body>p:first-child::first-letter{font-size:25pt}.note{border-left:1.3mm solid var(--accent);padding:3mm 4mm;margin:5mm 0;background:#eef3f1;font-size:8.8pt;line-height:1.65}.note b{display:block;color:var(--accent);font-family:"Noto Sans KR",sans-serif;font-size:7.6pt;letter-spacing:.08em;text-transform:uppercase;margin-bottom:1.5mm}.question{margin-top:3.5mm;border-top:.25mm solid #c8d1d2;padding-top:3mm;font-size:8.4pt;line-height:1.5;color:#354950}.question b{color:var(--accent)}pre{white-space:pre-wrap;background:#18252d;color:#e8f0ee;padding:4mm 4.5mm;border-radius:1.5mm;margin:5mm 0;font:7.25pt/1.55 ui-monospace,SFMono-Regular,Menlo,monospace}pre small{display:block;color:#8fbeb6;font:6.4pt "Noto Sans KR",sans-serif;letter-spacing:.07em;margin-bottom:2mm}table{width:100%;border-collapse:collapse;margin:4mm 0 5mm;font:7.7pt/1.45 "Noto Sans KR",sans-serif}th{text-align:left;color:white;background:var(--accent);padding:2.4mm}td{vertical-align:top;border-bottom:.25mm solid #cad3d3;padding:2.2mm}ul{margin:3mm 0 5mm;padding-left:5mm}li{margin:1.3mm 0}.refs{position:absolute;left:18mm;right:18mm;bottom:9mm;border-top:.25mm solid #ccd4d4;padding-top:2.2mm;display:flex;gap:1.8mm;flex-wrap:wrap;font:6.4pt/1.4 "Noto Sans KR",sans-serif;color:#617078}.refs b{color:#263840}.refs span:not(:last-child):after{content:" ·"}a{color:#17617b;text-decoration:none;border-bottom:.2mm solid #a4bcc3}.cover{background:linear-gradient(145deg,#13232b 0 58%,var(--accent) 58% 100%);color:white}.cover .running{border-top-color:#91b8b3;color:#bdd0ce}.cover h1{margin-top:30mm;font-size:36pt;max-width:150mm}.cover .subtitle{font:12pt/1.6 Georgia,"Noto Serif KR",serif;color:#d6e1df;max-width:145mm;margin-top:7mm}.cover .promise{position:absolute;left:18mm;bottom:45mm;width:112mm;border-left:1.3mm solid #e8bc67;padding-left:5mm;font:10pt/1.65 Georgia,"Noto Serif KR",serif}.cover .scope{position:absolute;right:14mm;bottom:16mm;width:57mm;color:#112229;font-size:7.4pt;line-height:1.55}.map-grid{display:grid;grid-template-columns:1fr 1fr;gap:4mm;margin-top:4mm}.map-card{border-top:1mm solid var(--accent);background:#eef2ef;padding:4mm;min-height:44mm}.map-card b{display:block;color:var(--accent);font-size:8pt;letter-spacing:.07em;margin-bottom:2mm}.map-card h3{margin:0 0 2mm;color:#17252d}.map-card p{font-size:8pt;line-height:1.55;color:#4b5c63}.chapter{background:linear-gradient(150deg,#f8f5ec 0 68%,#e0ebe8 68% 100%)}.chapter .chapter-number{font:54pt/1 Georgia,serif;color:var(--accent);opacity:.23;margin-top:25mm}.chapter h2{font-size:29pt;max-width:155mm;margin-top:2mm}.chapter .thesis{font:13pt/1.65 Georgia,"Noto Serif KR",serif;max-width:146mm;margin-top:8mm}.chapter .paths{position:absolute;left:18mm;bottom:30mm;max-width:145mm;font:8pt/1.6 "Noto Sans KR",sans-serif;color:#52636b}.chapter .paths b{display:block;color:var(--accent);margin-bottom:2mm}.workshop{background:#f1f5f2}.workshop .body{font-family:"Noto Sans KR",sans-serif}.workshop ol{font-size:9pt;line-height:1.65;padding-left:6mm}.workshop li{margin-bottom:3mm}.metric{display:flex;gap:4mm;margin:4mm 0 6mm}.metric div{flex:1;border-top:1mm solid var(--accent);padding-top:2mm}.metric b{display:block;font:18pt Georgia,serif;color:var(--accent)}.metric span{font-size:7pt;color:#627178}.small{font-size:7.7pt;color:#586970}.visual-panel{margin:3mm 0 2.5mm;padding:3.2mm;background:#edf2ef;border-top:1mm solid var(--accent);font-family:"Noto Sans KR",sans-serif}.visual-panel figcaption{font-size:7.2pt;font-weight:800;letter-spacing:.07em;color:var(--accent);margin-bottom:2.5mm}.visual-panel figcaption small{display:block;margin-top:.8mm;color:#64767a;font-size:5.8pt;font-weight:500;letter-spacing:0}.code-grid{display:grid;grid-template-columns:1.18fr .82fr;gap:3mm}.code-grid pre{margin:0;padding:3mm;font-size:6.4pt;line-height:1.45;border-radius:1mm}.code-grid pre span{display:block}.code-grid pre i{display:inline-block;width:6mm;color:#78939b;font-style:normal;user-select:none}.code-grid ol{margin:0;padding-left:5mm;font-size:6.8pt;line-height:1.45}.code-grid li{margin:0 0 1.5mm}.code-grid li b{display:block;color:var(--accent)}.underhood{margin:2.5mm 0 0!important;padding-top:2mm;border-top:.2mm solid #c4cecc;font:6.9pt/1.45 "Noto Sans KR",sans-serif!important;color:#44575c}.underhood b{color:var(--accent);margin-right:2mm}.flow-row{display:flex;align-items:stretch;gap:1.5mm}.flow-step{flex:1;min-height:31mm;background:#fff;padding:2.5mm}.flow-step i{display:block;color:var(--accent);font:12pt Georgia,serif}.flow-step b{display:block;font-size:7.3pt;margin:1mm 0}.flow-step span{font-size:6.5pt;line-height:1.4;color:#52636b}.arrow{align-self:center;color:var(--accent);font-size:12pt}.state-row{display:flex;gap:2mm}.state-node{flex:1;text-align:center;border:0.35mm solid var(--accent);border-radius:8mm;padding:2.5mm}.state-node b{display:block;color:var(--accent);font-size:7.2pt}.state-node span{font-size:6.3pt;color:#53656b}.state-visual ul{display:grid;grid-template-columns:1fr 1fr;gap:1mm 4mm;margin:2.5mm 0 0;padding:0;list-style:none}.state-visual li{display:flex;gap:2mm;font-size:6.7pt}.state-visual li code{color:var(--accent);font-weight:700}.compare-visual table{margin:0;font-size:6.8pt}.appendix{background:#f6f2e8}.appendix-grid{display:grid;grid-template-columns:1fr 1fr;gap:4mm}.mechanism-card{background:#fff;border-top:1mm solid var(--accent);padding:3.5mm;min-height:54mm}.mechanism-card h3{font-size:10pt;margin:0 0 2mm;color:#17252d}.mechanism-card dl{margin:0;font-size:7.3pt;line-height:1.5}.mechanism-card dt{color:var(--accent);font-weight:800;margin-top:1.5mm}.mechanism-card dd{margin:0}.source-index table{font-size:7.4pt;table-layout:fixed}.source-index th:nth-child(1),.source-index td:nth-child(1){width:31%;word-break:break-all}.source-index th:nth-child(2),.source-index td:nth-child(2){width:27%;word-break:break-word}.source-index th:nth-child(3),.source-index td:nth-child(3){width:42%;word-break:break-word}
`

function running(report, label, number = true) {
  return `<div class="running"><b>${esc(report.short)}</b><span>${esc(label)}</span>${number ? '<span class="page-no"></span>' : '<span></span>'}</div>`
}

function cover(report) {
  return `<section class="sheet cover" style="--accent:${report.accent}">${running(report, `VOL. ${report.volume}`, false)}<h1>${esc(report.title)}</h1><p class="subtitle">${esc(report.subtitle)}</p><div class="promise">${esc(report.promise)}</div><div class="scope"><b>STUDY SNAPSHOT</b><br>Claude Code v2.1.88<br>${COMMIT.slice(0,12)}<br><br>제3자 복원 소스 기반<br>한국어 · Guided Edition</div></section>`
}

function orientation(report, metrics) {
  const m = metrics.groups[report.metricGroup]
  const cards = report.chapters.map((chapter, i) => `<div class="map-card"><b>CHAPTER ${String(i + 1).padStart(2,'0')}</b><h3>${esc(chapter.title)}</h3><p>${esc(chapter.thesis)}</p></div>`).join('')
  return `<section class="sheet" style="--accent:${report.accent}">${running(report, '이 권을 읽는 자리')}<h2>오늘 우리는 이 코드의 어느 부분을 함께 보는가</h2><p class="deck">${esc(report.orientation)}</p><div class="metric"><div><b>${m.files.toLocaleString()}</b><span>분류된 TS/TSX 파일</span></div><div><b>${m.lines.toLocaleString()}</b><span>물리 코드 줄</span></div><div><b>${m.syntax.asyncFunctions.toLocaleString()}</b><span>async 함수</span></div><div><b>${m.occurrences.toolUse.toLocaleString()}</b><span>tool use 표기</span></div></div><div class="map-grid">${cards}</div><p class="small">분포 수치는 중요도 점수가 아니다. 이 권이 직접 펼쳐보는 코드 표면의 규모와 언어 메커니즘 밀도를 가늠하기 위한 탐색 표지다.</p></section>`
}

function chapterPage(report, chapter, index) {
  return `<section class="sheet chapter" style="--accent:${report.accent}">${running(report, `CHAPTER ${String(index + 1).padStart(2,'0')}`)}<div class="chapter-number">${String(index + 1).padStart(2,'0')}</div><h2>${esc(chapter.title)}</h2><p class="thesis">${esc(chapter.thesis)}</p><div class="paths"><b>이 장에서 실제로 펼쳐볼 경로</b>${chapter.paths.map(esc).join(' · ')}</div></section>`
}

function topicPage(report, chapter, page) {
  const extra = [page.pseudo ? pseudo(page.pseudo) : '', page.table ? table(page.table) : '', page.list ? list(page.list) : ''].join('')
  return `<section class="sheet${page.visual ? ' has-visual' : ''}" style="--accent:${report.accent}">${running(report, chapter.title)}<h2>${esc(page.title)}</h2><p class="deck">${esc(page.deck)}</p><div class="body">${paragraphs(page.paragraphs)}${extra}${renderVisual(page.visual)}${page.note ? `<aside class="note"><b>${esc(page.note.label)}</b>${page.note.text}</aside>` : ''}<div class="question"><b>스터디에서 확인할 질문</b><br>${page.question}</div></div>${citations(page)}</section>`
}

function workshop(report) {
  return `<section class="sheet workshop" style="--accent:${report.accent}">${running(report, 'STUDY WORKSHOP')}<h2>${esc(report.workshop.title)}</h2><p class="deck">${esc(report.workshop.deck)}</p><div class="body"><ol>${report.workshop.steps.map(x => `<li>${x}</li>`).join('')}</ol><aside class="note"><b>완료의 기준</b>${report.workshop.outcome}</aside><div class="question"><b>다음 모임에 남길 기록</b><br>${report.workshop.record}</div></div>${citations(report.workshop)}</section>`
}

function mechanismAppendix(report) {
  const cards = report.mechanisms.map(item => `<article class="mechanism-card"><h3>${esc(item.name)}</h3><dl><dt>언어가 제공하는 것</dt><dd>${item.runtime}</dd><dt>이 저장소가 쓰는 방식</dt><dd>${item.use}</dd><dt>놓치기 쉬운 함정</dt><dd>${item.trap}</dd></dl></article>`).join('')
  return `<section class="sheet appendix" style="--accent:${report.accent}">${running(report, 'LANGUAGE MECHANISM CARDS')}<h2>코드 뒤에서 작동하는 언어·런타임 메커니즘</h2><p class="deck">문법 이름을 외우기보다, 런타임이 실제로 무엇을 저장하고 언제 제어를 넘기는지와 이 프로젝트가 그것을 어떤 책임에 사용하는지를 함께 본다.</p><div class="appendix-grid">${cards}</div></section>`
}

function sourceIndexAppendix(report) {
  return `<section class="sheet appendix source-index" style="--accent:${report.accent}">${running(report, 'SOURCE READING INDEX')}<h2>스터디용 코드 탐색 인덱스</h2><p class="deck">파일을 처음부터 끝까지 읽지 않는다. 아래 시작점에서 symbol을 잡고 정의·호출·상태·실패 경로를 왕복한다.</p>${table({ headers: ['시작 경로', '먼저 볼 표현', '그 다음에 물을 질문'], rows: report.sourceIndex })}<aside class="note"><b>코드 독해 규칙</b>타입 선언만 보고 runtime 검증을 가정하지 않는다. 호출 순서만 보고 authority를 가정하지 않는다. UI 표시만 보고 durable state를 가정하지 않는다. 주석만 보고 production 활성이나 upstream 의도를 확정하지 않는다.</aside></section>`
}

function htmlFor(report, metrics) {
  const sheets = [cover(report), orientation(report, metrics)]
  report.chapters.forEach((chapter, index) => {
    sheets.push(chapterPage(report, chapter, index))
    chapter.pages.forEach(page => sheets.push(topicPage(report, chapter, page)))
  })
  sheets.push(mechanismAppendix(report), sourceIndexAppendix(report))
  sheets.push(workshop(report))
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>${esc(report.title)}</title><style>${CSS}</style></head><body>${sheets.join('\n')}</body></html>`
}

async function verifyRevision() {
  const { stdout } = await execFile('git', ['-C', SOURCE_ROOT, 'rev-parse', 'HEAD'])
  if (stdout.trim() !== COMMIT) throw new Error(`source revision mismatch: ${stdout.trim()}`)
}

async function verifySourceRefs() {
  const failures = []
  let count = 0
  for (const report of reports) for (const chapter of report.chapters) for (const page of chapter.pages) {
    for (const ref of page.refs ?? []) {
      count++
      const [file, anchor = ''] = ref.split('#')
      try {
        const target = path.join(SOURCE_ROOT, file)
        const stat = await fs.stat(target)
        if (stat.isDirectory()) {
          if (anchor) failures.push(`${ref}: directory references cannot have line anchors`)
          continue
        }
        const text = await fs.readFile(target, 'utf8')
        if (anchor) {
          const match = anchor.match(/^L(\d+)(?:-L(\d+))?$/)
          const lines = text.split('\n').length
          if (!match || Number(match[2] ?? match[1]) > lines) failures.push(`${ref}: ${lines} lines`)
        }
      } catch (error) { failures.push(`${ref}: ${error.code ?? error.message}`) }
    }
  }
  if (failures.length) throw new Error(`invalid source refs:\n${failures.join('\n')}`)
  return count
}

async function validateLayout(page, report) {
  await page.goto(`file://${path.join(HERE, 'html', `${report.slug}.html`)}`, { waitUntil: 'load' })
  await page.emulateMedia({ media: 'print' })
  const overflow = await page.locator('.sheet').evaluateAll(nodes => nodes.map((node, i) => ({ i, scroll: node.scrollHeight, client: node.clientHeight })).filter(x => x.scroll > x.client + 2))
  if (overflow.length) throw new Error(`${report.slug} vertical overflow: ${JSON.stringify(overflow)}`)
  const horizontalOverflow = await page.locator('.sheet').evaluateAll(nodes => nodes.map((node, i) => ({ i, scroll: node.scrollWidth, client: node.clientWidth })).filter(x => x.scroll > x.client + 2))
  if (horizontalOverflow.length) throw new Error(`${report.slug} horizontal overflow: ${JSON.stringify(horizontalOverflow)}`)
}

async function main() {
  await verifyRevision()
  const sourceRefs = await verifySourceRefs()
  const metrics = await analyzeCodebase({ sourceRoot: SOURCE_ROOT, config: CONFIG })
  await Promise.all(['html','previews','metrics','attachments'].map(dir => fs.mkdir(path.join(HERE, dir), { recursive: true })))
  await fs.writeFile(path.join(HERE, 'metrics', 'repository-distribution.json'), `${JSON.stringify({ ...metrics, sourceRevision: COMMIT }, null, 2)}\n`)
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext()
  const page = await context.newPage()
  const manifestReports = []
  for (const report of reports) {
    const html = htmlFor(report, metrics)
    const htmlPath = path.join(HERE, 'html', `${report.slug}.html`)
    const pdfPath = path.join(HERE, `${report.slug}.pdf`)
    await fs.writeFile(htmlPath, html)
    await validateLayout(page, report)
    await page.pdf({ path: pdfPath, format: 'A4', printBackground: true, margin: { top: '0', right: '0', bottom: '0', left: '0' }, preferCSSPageSize: true })
    const pageCount = 5 + report.chapters.reduce((sum, chapter) => sum + chapter.pages.length, 0) + report.chapters.length
    const pdfText = (await fs.readFile(pdfPath)).toString('latin1')
    const renderedPageCount = (pdfText.match(/\/Type\s*\/Page\b/g) ?? []).length
    if (renderedPageCount !== pageCount) throw new Error(`${report.slug} PDF page mismatch: expected ${pageCount}, got ${renderedPageCount}`)
    await page.screenshot({ path: path.join(HERE, 'previews', `${report.slug}-cover.png`), fullPage: false })
    await page.locator('.sheet.has-visual').first().screenshot({ path: path.join(HERE, 'previews', `${report.slug}-code-visual.png`) })
    await page.locator('.sheet.appendix').first().screenshot({ path: path.join(HERE, 'previews', `${report.slug}-mechanisms.png`) })
    await page.locator('.sheet.appendix').nth(1).screenshot({ path: path.join(HERE, 'previews', `${report.slug}-source-index.png`) })
    const stat = await fs.stat(pdfPath)
    const visualPages = report.chapters.flatMap(chapter => chapter.pages).filter(item => item.visual).length
    manifestReports.push({ volume: report.volume, title: report.title, file: path.basename(pdfPath), pages: pageCount, visualPages, mechanismCards: report.mechanisms.length, sourceIndexEntries: report.sourceIndex.length, bytes: stat.size })
  }
  await browser.close()
  const manifest = { generatedAt: new Date().toISOString(), sourceRevision: COMMIT, sourceRepository: REPO, sourceRefs, totalPages: manifestReports.reduce((s, x) => s + x.pages, 0), reports: manifestReports }
  await fs.writeFile(path.join(HERE, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`)
  const visualIndex = reports.map(report => {
    const visualRows = report.chapters.flatMap(chapter => chapter.pages.filter(item => item.visual).map(item => `- ${item.title} — ${item.visual.kind}`)).join('\n')
    const mechanismRows = report.mechanisms.map(item => `- ${item.name}`).join('\n')
    const sourceRows = report.sourceIndex.map(row => `- \`${row[0]}\` — ${row[1]}`).join('\n')
    return `## ${report.volume}. ${report.title}\n\n### Visual explanations\n\n${visualRows}\n\n### Language/runtime cards\n\n${mechanismRows}\n\n### Source starts\n\n${sourceRows}`
  }).join('\n\n')
  await fs.writeFile(path.join(HERE, 'attachments', 'visual-and-code-reading-index.md'), `# Visual and code-reading index\n\nPDF 안의 코드 패널·상태도·pipeline·비교표와 언어 메커니즘 카드, 소스 탐색 시작점을 권별로 빠르게 찾기 위한 첨부 색인이다.\n\n${visualIndex}\n`)
  const links = manifestReports.map(x => `- [${x.file}](./${x.file}) — ${x.title} (${x.pages}쪽)`).join('\n')
  const readme = `# Claude Code Guided Repository Study\n\n대상 저장소의 실제 책임 영역을 따라 구성한 6권짜리 한국어 스터디 자료다. 보고서의 화자는 코드를 함께 펼쳐보는 시스템 소프트웨어 엔지니어이며, 코드 사실과 해석, 확인 불가능한 추정을 분리한다.\n\n${links}\n\n총 ${manifest.totalPages}쪽이다. 각 권은 네 개 장, 장별 네 개의 코드 독해 세션, 시각화된 코드·상태·pipeline 설명, 언어 메커니즘 카드, 소스 탐색 인덱스, 실제 스터디 워크숍으로 구성된다. 분석용 TypeScript 예제는 실제 구현의 symbol과 제어 구조를 보존하면서 설명 목적에 맞게 축약·재작성했으며 원문 전재가 아니다.\n\n- [시각자료·코드 독해 색인](./attachments/visual-and-code-reading-index.md)\n- [분류 근거](./research/repository-classification.md)\n- [검증 기록](./engineering/validation.md)\n- [생성 manifest](./manifest.json)\n\n## Fixed source\n\n- repository: ${REPO}\n- local clone: ${SOURCE_ROOT}\n- revision: \`${COMMIT}\`\n- measured: ${metrics.total.files.toLocaleString()} TS/TSX files, ${metrics.total.lines.toLocaleString()} physical lines\n\n대상은 제3자 복원 저장소이며 누락된 feature-gated 모듈과 불완전한 빌드 조건이 있다. 따라서 문서에 실제 코드 관찰, 저장소 문서의 주장, 이 자료의 제한된 해석을 구분했다.\n\n## Reproduction and validation\n\n\`node build-study.mjs\`\n\n- 고정 revision 확인\n- ${sourceRefs}개 source reference의 파일/행 범위 확인\n- Chromium A4 렌더링과 모든 page 수평·수직 overflow 검사\n- PDF 크기와 ${manifest.totalPages}쪽 manifest 기록\n- 권별 cover, 코드 시각화, 언어 메커니즘, 소스 인덱스 preview 생성\n\n생성 과정의 운영 기록은 \`engineering/**\`에만 두었고 PDF 본문에는 작업 지침을 넣지 않았다.\n`
  await fs.writeFile(path.join(HERE, 'README.md'), readme)
  process.stdout.write(`${JSON.stringify(manifest, null, 2)}\n`)
}

await main()
