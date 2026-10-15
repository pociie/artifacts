import fs from 'node:fs/promises'
import path from 'node:path'
import { createHash } from 'node:crypto'
import { spawnSync } from 'node:child_process'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { chromium } from 'playwright'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const STUDY_ROOT = path.dirname(HERE)
const PARENT_EDITION = path.join(STUDY_ROOT, 'book-edition-2026-09-21')
const REPO_ROOT = path.resolve(HERE, '../../../..')
const HTML_DIR = path.join(HERE, 'html')
const PREVIEW_DIR = path.join(HERE, 'previews')
const ENGINEERING = path.join(HERE, 'engineering')
const CONTENT = path.join(HERE, 'content')
const HTML_PATH = path.join(HTML_DIR, 'claude-code-system-anatomy-selected-design-ko.html')
const PDF_PATH = path.join(HERE, 'claude-code-system-anatomy-selected-design-ko.pdf')
const CONTACT_HTML = path.join(HERE, 'contact-sheet.html')
const CONTACT_PNG = path.join(HERE, 'contact-sheet.png')
const PARENT_HTML = path.join(PARENT_EDITION, 'html', 'claude-code-system-anatomy-reader-edition-ko.html')
const PARENT_PDF = path.join(PARENT_EDITION, 'claude-code-system-anatomy-reader-edition-ko.pdf')
const PARENT_MANIFEST = path.join(PARENT_EDITION, 'manifest.json')
const OPERATION_REQUEST = path.join(ENGINEERING, 'reusable-artifact-operation-request.json')
const REQUIREMENT_CHRONOLOGY = path.join(ENGINEERING, 'requirement-chronology.md')
const DESIGN_BINDING = path.join(ENGINEERING, 'design-binding.md')
const VISUAL_REVIEW = path.join(ENGINEERING, 'visual-review.md')

const readJson = async file => JSON.parse(await fs.readFile(file, 'utf8'))
const sha256 = value => createHash('sha256').update(value).digest('hex')
const digestFile = async file => sha256(await fs.readFile(file))
const esc = value => String(value ?? '')
  .replaceAll('&', '&amp;').replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;').replaceAll('"', '&quot;')
const inline = value => esc(value)
  .replace(/`([^`]+)`/g, '<code>$1</code>')
  .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')

const supplement = await readJson(path.join(CONTENT, 'current-requirements.json'))
const lineage = await readJson(path.join(CONTENT, 'input-lineage.json'))
const parentManifest = await readJson(PARENT_MANIFEST)

const SELECTED_THEME_CSS = `
:root {
  --paper:#f6f1e7; --paper2:#f1ebdf; --ink:#102d43; --teal:#2d6972;
  --rust:#a84f3c; --muted:#5d6d72; --rule:#9aa9a6;
  --grid:rgba(48,77,82,.075);
  --font-display:"Noto Serif KR","AppleMyungjo",Georgia,serif;
  --font-body:Pretendard,SUIT,"Noto Sans KR","Apple SD Gothic Neo",sans-serif;
  --font-utility:SFMono-Regular,Menlo,Consolas,monospace;
}
@page {
  size:A4; background:var(--paper);
  @top-left { content:"CLAUDE CODE · SYSTEMS MONOGRAPH × EVIDENCE NOTEBOOK"; color:var(--teal); }
  @top-right { color:var(--rust); }
  @bottom-center { color:var(--teal); }
}
html { color:var(--ink); background:#d8d3ca; }
body { background:var(--paper); color:var(--ink); font-family:var(--font-body); }
h1,h2,.lead,.cover .subtitle { font-family:var(--font-display); color:var(--ink); }
h3,h4 { color:var(--ink); }
a { color:var(--teal); }
.eyebrow,.status-label,.figure-label,.source-ref,.step-number,.backlink {
  font-family:var(--font-utility); letter-spacing:.055em;
}
.eyebrow,.figure-label { color:var(--rust); }
.cover {
  position:relative; overflow:hidden; background-color:var(--paper);
  background-image:linear-gradient(90deg,transparent 0 65%,rgba(45,105,114,.055) 65% 65.3%,transparent 65.3%);
}
.cover::after {
  content:""; position:absolute; left:-9mm; bottom:80mm; width:82mm; height:30mm; opacity:.42;
  background:repeating-radial-gradient(ellipse at 0 50%,transparent 0 7px,var(--teal) 8px 9px,transparent 10px 14px);
  transform:rotate(-2deg); pointer-events:none;
}
.cover h1 { color:var(--ink); }
.cover .edition { position:relative; z-index:1; border-top:.35mm solid var(--teal); }
.front-section,.chapter,.conclusion,.appendix { background-color:var(--paper); }
.front-section::before,.chapter::before,.conclusion::before,.appendix::before,.deep-walkthrough::before {
  display:block; margin:0 0 3mm; color:var(--teal); font:700 7.4pt/1.35 var(--font-utility); letter-spacing:.08em;
}
.front-section::before,.chapter::before,.conclusion::before { content:"SYSTEMS MONOGRAPH"; }
#front-boundary::before,#current-state-dashboard::before,.appendix::before,.deep-walkthrough::before { content:"EVIDENCE NOTEBOOK"; color:var(--rust); }
#front-boundary,#current-state-dashboard,.appendix,.deep-walkthrough {
  background-color:var(--paper2);
  background-image:linear-gradient(var(--grid) .22mm,transparent .22mm),linear-gradient(90deg,var(--grid) .22mm,transparent .22mm);
  background-size:7mm 7mm;
}
.part-opener {
  color:var(--ink); background:var(--paper2); border-left:2.2mm solid var(--rust);
}
.part-opener .part-number { color:var(--rust); font-family:var(--font-display); }
.part-opener h1 { color:var(--ink); }
.part-opener a { color:var(--teal); }
.chapter-header,.appendix-header { border-color:var(--teal); }
.algorithm-cluster { display:grid; grid-template-columns:1fr 1fr; column-gap:7mm; align-items:start; }
.algorithm-cluster>h3 { grid-column:1/-1; }
.boundary-card,.dashboard-card,.reading-card,.atlas-entry {
  border:0; border-top:.35mm solid var(--teal); border-radius:0; background:rgba(246,241,231,.72);
}
.algorithm-brief { border-left-color:var(--rust); }
.diagram { border:.3mm solid var(--rule); border-radius:0; background:rgba(246,241,231,.9); }
.diagram rect { fill:var(--paper); stroke:var(--teal); }
.diagram path { stroke:var(--rust); }
.diagram svg text { fill:var(--ink); stroke:var(--paper); }
.deep-walkthrough { border-top:1mm solid var(--rust); padding:7mm 5mm 4mm; }
.walk-header { break-inside:avoid; }
.reader-question { background:rgba(45,105,114,.08); border-left-color:var(--teal); }
.prerequisite,.transfer { border-radius:0; background:rgba(246,241,231,.75); border-left:.35mm solid var(--rust); }
.transfer { break-inside:auto; break-before:avoid-page; padding:3mm 4mm; }
.transfer h3 { margin-top:0; }
.return-to-code { border-left-color:var(--rust); color:#713b31; }
.code-block { border-radius:0; background:var(--ink); color:#f7f2e9; }
.step-number { border-radius:0; background:transparent; border-bottom:.35mm solid var(--rust); color:var(--rust); }
.status-sentence { border-bottom-color:var(--rule); }
.status-label { color:var(--teal); }
.status-sentence.unknown .status-label,.status-sentence.recommendation .status-label { color:var(--rust); }
th { color:var(--ink); background:rgba(45,105,114,.09); }
th,td,.domain-entry,.source-group,.glossary>div { border-bottom-color:var(--rule); }
p::first-letter { float:none!important; font:inherit!important; color:inherit!important; }
.chronology-wave { break-inside:auto; border-top:.35mm solid var(--rust); margin:8mm 0 0; padding-top:4mm; }
.chronology-wave h2 { margin-top:0; }
.design-principles { columns:auto; }
.design-principles .chronology-wave { break-inside:avoid; }
@media screen {
  body { box-shadow:0 0 30px rgba(16,45,67,.2); }
  .chapter,.conclusion,.appendix { border-bottom:12px solid #d8d3ca; }
}
@media print {
  html,body { background:var(--paper)!important; }
  .cover,.front-section,.part-opener,.chapter,.conclusion,.appendix { background-color:var(--paper); }
  #front-boundary,#current-state-dashboard,.appendix,.deep-walkthrough { background-color:var(--paper2); }
}
`

function markdownBody(markdown, { id, label, title, className = '' }) {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n')
  const blocks = []
  let paragraph = []
  let list = []
  let articleOpen = false
  const flushParagraph = () => {
    if (paragraph.length) blocks.push(`<p>${inline(paragraph.join(' '))}</p>`)
    paragraph = []
  }
  const flushList = () => {
    if (list.length) blocks.push(`<ul>${list.map(item => `<li>${inline(item)}</li>`).join('')}</ul>`)
    list = []
  }
  for (const line of lines.slice(1)) {
    if (line.startsWith('## ')) {
      flushParagraph(); flushList()
      if (articleOpen) blocks.push('</article>')
      blocks.push(`<article class="chronology-wave"><h2>${inline(line.slice(3))}</h2>`)
      articleOpen = true
    } else if (line.startsWith('- ')) {
      flushParagraph(); list.push(line.slice(2))
    } else if (!line.trim()) {
      flushParagraph(); flushList()
    } else {
      flushList(); paragraph.push(line.trim())
    }
  }
  flushParagraph(); flushList()
  if (articleOpen) blocks.push('</article>')
  return `<section id="${id}" class="appendix ${className}"><header class="appendix-header"><p class="eyebrow">${label}</p><h1>${title}</h1></header>${blocks.join('\n')}</section>`
}

function requirementRows(entries) {
  return entries.map(entry => `<tr id="requirement-${entry.id}"><td>${entry.id}</td><td>${esc(entry.requirement)}</td><td><strong>${esc(entry.status)}</strong><br>${entry.finalBookLocation.map(esc).join(' · ')}</td><td>${esc(entry.limitations)}</td></tr>`).join('')
}

async function verifyInputs() {
  const findings = []
  const all = [...lineage.studyInputs, ...lineage.designInputs]
  for (const item of all) {
    const actual = await digestFile(path.join(REPO_ROOT, item.path))
    if (actual !== item.sha256) findings.push(`${item.path}: expected ${item.sha256}, got ${actual}`)
  }
  const parent = {
    manifest: await digestFile(PARENT_MANIFEST),
    html: await digestFile(PARENT_HTML),
    pdf: await digestFile(PARENT_PDF),
  }
  if (parent.manifest !== lineage.studyInputs.find(item => item.role === 'single_volume_reader_edition').sha256) findings.push('parent reader-edition manifest changed')
  if (parent.html !== parentManifest.outputs.html.sha256) findings.push('parent reader-edition HTML changed')
  if (parent.pdf !== parentManifest.outputs.pdf.sha256) findings.push('parent reader-edition PDF changed')
  const checker = spawnSync('python3', [
    path.join(REPO_ROOT, 'artifacts/agent-loop/improvement/reusable-artifact-capability-lifecycle/scripts/check_reusable_artifact_capability_lifecycle.py'),
    '--record-kind', 'request', '--format', 'json', OPERATION_REQUEST,
  ], { cwd: REPO_ROOT, encoding: 'utf8' })
  if (checker.status !== 0 || !JSON.parse(checker.stdout).valid) findings.push(`operation request invalid: ${checker.stdout || checker.stderr}`)
  if (findings.length) throw new Error(`input verification failed:\n${findings.join('\n')}`)
  return { parent, lineageCount: all.length, operationRequest: await digestFile(OPERATION_REQUEST) }
}

async function buildHtml() {
  const chronology = await fs.readFile(REQUIREMENT_CHRONOLOGY, 'utf8')
  const design = await fs.readFile(DESIGN_BINDING, 'utf8')
  let html = await fs.readFile(PARENT_HTML, 'utf8')
  if (!html.includes('요구사항 원장 T01–T33')) throw new Error('parent requirement ledger marker missing')
  html = html.replace('</style>', `${SELECTED_THEME_CSS}</style>`)
  html = html
    .replace('Architecture &amp; Algorithms · Reader Edition', 'Architecture &amp; Algorithms · Systems Monograph × Evidence Notebook')
    .replace('Architecture & Algorithms · Reader Edition', 'Architecture &amp; Algorithms · Systems Monograph × Evidence Notebook')
  html = html.replace('한국어 독자판 · 고정 소스 revision 2ca5ddab', '한국어 선택 디자인판 · 고정 소스 revision 2ca5ddab')
  html = html.replace('요구사항 원장 T01–T33', '요구사항 원장 T01–T36')
  const ledgerBoundary = '</tbody></table></section><section id="appendix-research"'
  html = html.replace(ledgerBoundary, `${requirementRows(supplement.entries)}</tbody></table></section><section id="appendix-research"`)
  const tocNeedle = '<li><a href="#appendix-research">부록 F · 연구 채택 추적</a></li>'
  html = html.replace(tocNeedle, `${tocNeedle}<li><a href="#appendix-current-chronology">부록 G · 요구사항 연대기</a></li><li><a href="#appendix-selected-design">부록 H · 선택 디자인 바인딩</a></li>`)
  const chronologyHtml = markdownBody(chronology, { id: 'appendix-current-chronology', label: '부록 G', title: '요구사항 연대기 W01–W08' })
  const designHtml = markdownBody(design, { id: 'appendix-selected-design', label: '부록 H', title: 'Systems Monograph × Evidence Notebook', className: 'design-principles' })
  html = html.replace('</main>', `${chronologyHtml}${designHtml}</main>`)
  if ((html.match(/id="requirement-T\d+"/g) ?? []).length !== 36) throw new Error('requirement ledger does not contain T01-T36')
  return html
}

async function validateHtml(page) {
  await page.emulateMedia({ media: 'screen' })
  const result = await page.evaluate(() => {
    const visible = element => {
      const s = getComputedStyle(element); const r = element.getBoundingClientRect()
      return s.display !== 'none' && s.visibility !== 'hidden' && r.width > 0 && r.height > 0
    }
    const px = element => Number.parseFloat(getComputedStyle(element).fontSize)
    const ids = [...document.querySelectorAll('[id]')].map(element => element.id)
    const idSet = new Set(ids)
    const links = [...document.querySelectorAll('a[href^="#"]')].map(a => a.getAttribute('href').slice(1))
    const clipped = [...document.querySelectorAll('pre,table,figure,svg')].filter(visible).filter(element => element.scrollWidth > element.clientWidth + 1).map(element => `${element.tagName}.${element.className}`).slice(0, 20)
    const body = document.body
    const sampleParagraph = [...document.querySelectorAll('p')].find(visible)
    const bodyStyle = getComputedStyle(body)
    const firstLetter = getComputedStyle(sampleParagraph, '::first-letter')
    const codeMin = Math.min(...[...document.querySelectorAll('.code-block,table,.source-ref')].filter(visible).map(px))
    const labelMin = Math.min(...[...document.querySelectorAll('.eyebrow,.status-label,.figure-label,.backlink')].filter(visible).map(px))
    return {
      ids: ids.length,
      duplicateIds: ids.filter((id, index) => ids.indexOf(id) !== index),
      internalLinks: links.length,
      missingLinks: [...new Set(links.filter(id => !idSet.has(id)))],
      clipped,
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      bodyPx: px(body), bodyPt: px(body) * .75,
      codeMinPx: codeMin, codeMinPt: codeMin * .75,
      labelMinPx: labelMin, labelMinPt: labelMin * .75,
      paper: bodyStyle.backgroundColor,
      ink: bodyStyle.color,
      firstLetterFloat: firstLetter.cssFloat,
      firstLetterPx: Number.parseFloat(firstLetter.fontSize),
      paragraphPx: px(sampleParagraph),
      requirements: document.querySelectorAll('[id^="requirement-T"]').length,
      modes: {
        monograph: getComputedStyle(document.querySelector('.chapter'), '::before').content,
        notebook: getComputedStyle(document.querySelector('.deep-walkthrough'), '::before').content,
      },
    }
  })
  if (result.duplicateIds.length) throw new Error(`duplicate HTML ids: ${result.duplicateIds}`)
  if (result.missingLinks.length) throw new Error(`missing internal links: ${result.missingLinks}`)
  if (result.clipped.length || result.scrollWidth > result.clientWidth + 1) throw new Error(`HTML clipping: ${JSON.stringify(result.clipped)}`)
  if (result.bodyPt < 10.5 - .01 || result.codeMinPt < 8.5 - .01 || result.labelMinPt < 7.5 - .01) throw new Error(`typography below minimum: ${JSON.stringify(result)}`)
  if (result.firstLetterFloat !== 'none' || Math.abs(result.firstLetterPx - result.paragraphPx) > .1) throw new Error(`drop-cap or first-letter enlargement detected: ${JSON.stringify(result)}`)
  if (result.requirements !== 36 || !result.modes.monograph.includes('SYSTEMS MONOGRAPH') || !result.modes.notebook.includes('EVIDENCE NOTEBOOK')) throw new Error(`content/design binding missing: ${JSON.stringify(result)}`)
  return result
}

const swiftInspection = `
import Foundation
import PDFKit
let url = URL(fileURLWithPath: CommandLine.arguments[1])
guard let doc = PDFDocument(url: url) else { fatalError("cannot open PDF") }
var allText = ""
var pages: [[String: Any]] = []
var links = 0
var internalLinks = 0
var validInternal = 0
for index in 0..<doc.pageCount {
  guard let page = doc.page(at: index) else { continue }
  let text = page.string ?? ""
  allText += text + "\\n"
  let bounds = page.bounds(for: .mediaBox)
  let selections = page.selection(for: bounds)?.selectionsByLine() ?? []
  let positions = selections.map { Double($0.bounds(for: page).midY - bounds.minY) / Double(bounds.height) }.filter { $0.isFinite && $0 >= 0.08 && $0 <= 0.92 }
  let span = positions.isEmpty ? 0.0 : max(0.0, min(1.0, ((positions.max()! - positions.min()!) / 0.84)))
  for annotation in page.annotations where annotation.type == "Link" {
    links += 1
    if let action = annotation.action as? PDFActionGoTo { internalLinks += 1; if action.destination.page != nil { validInternal += 1 } }
  }
  pages.append(["page": index + 1, "characters": text.count, "bodySpan": span, "prefix": String(text.prefix(90))])
}
func count(_ value: String) -> Int { max(0, allText.components(separatedBy: value).count - 1) }
let payload: [String: Any] = [
  "pageCount": doc.pageCount, "hasOutline": doc.outlineRoot != nil,
  "textCharacters": allText.count,
  "hangulCharacters": allText.unicodeScalars.filter { $0.value >= 0xAC00 && $0.value <= 0xD7A3 }.count,
  "linkAnnotations": links, "internalLinkAnnotations": internalLinks, "validInternalDestinations": validInternal,
  "queries": ["tool_result": count("tool_result"), "yield": count("yield"), "시스템 해부": count("시스템 해부"), "reversed_tool_result": count("tluser_loot")],
  "pages": pages
]
let data = try! JSONSerialization.data(withJSONObject: payload)
print(String(data: data, encoding: .utf8)!)
`

function inspectPdf(pdfPath) {
  const result = spawnSync('swift', ['-', pdfPath], { input: swiftInspection, encoding: 'utf8', maxBuffer: 40 * 1024 * 1024 })
  if (result.status !== 0) throw new Error(`PDFKit inspection failed: ${result.stderr}`)
  const value = JSON.parse(result.stdout.trim().split('\n').at(-1))
  const strings = spawnSync('strings', [pdfPath], { encoding: 'utf8', maxBuffer: 40 * 1024 * 1024 }).stdout
  value.tagged = strings.includes('/StructTreeRoot')
  value.outlineMarker = strings.includes('/Outlines')
  const spans = value.pages.filter(page => page.characters >= 20).map(page => page.bodySpan).sort((a, b) => a - b)
  value.medianBodySpan = spans[Math.floor(spans.length / 2)] ?? 0
  value.emptyPages = value.pages.filter(page => page.characters < 20).map(page => page.page)
  value.sparsePages = value.pages.filter(page => page.characters >= 20 && page.bodySpan < .30).map(page => ({ page: page.page, bodySpan: page.bodySpan, prefix: page.prefix }))
  delete value.pages
  if (!value.tagged || (!value.hasOutline && !value.outlineMarker)) throw new Error('tagged structure or outline missing')
  if (value.emptyPages.length || value.hangulCharacters < 2000 || value.queries.reversed_tool_result !== 0) throw new Error(`PDF text validation failed: ${JSON.stringify(value)}`)
  if (value.queries.tool_result < 1 || value.queries.yield < 1) throw new Error(`PDF query coverage failed: ${JSON.stringify(value.queries)}`)
  if (value.internalLinkAnnotations < 50 || value.validInternalDestinations !== value.internalLinkAnnotations || value.medianBodySpan < .65) throw new Error(`PDF navigation/density failed: ${JSON.stringify(value)}`)
  return value
}

const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
function pngDimensions(bytes) {
  if (!bytes.subarray(0, 8).equals(PNG_SIGNATURE) || bytes.toString('ascii', 12, 16) !== 'IHDR') throw new Error('invalid PNG')
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) }
}

async function capturePreviews(browser, htmlUrl) {
  const specs = [
    ['cover', '[data-preview="cover"]'], ['toc', '[data-preview="toc"]'],
    ['reading-paths', '[data-preview="reading-paths"]'], ['whole-system-map', '[data-preview="system-topology"]'],
    ['prose', '[data-preview="prose"] .prose'], ['dense-code', '[data-preview="dense-code"]'],
    ['comparison-table', '[data-preview="yield-comparison"]'], ['decision-diagram', '[data-preview="permission-effect"]'],
    ['current-state-dashboard', '[data-preview="dashboard"]'], ['algorithm-atlas', '[data-preview="algorithm-atlas"]', 1000],
    ['source-index', '[data-preview="source-index"]', 1000], ['chronology', '#appendix-current-chronology', 1000],
    ['selected-design', '#appendix-selected-design', 1000],
  ]
  const page = await browser.newPage({ viewport: { width: 1280, height: 1000 }, deviceScaleFactor: 1 })
  await page.goto(htmlUrl, { waitUntil: 'load' })
  await page.evaluate(async () => { await document.fonts.ready; await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))) })
  const entries = []
  for (const [id, selector, maxHeight] of specs) {
    const locator = page.locator(selector).first()
    if (await locator.count() !== 1) throw new Error(`preview selector failed: ${id}`)
    await locator.scrollIntoViewIfNeeded()
    const box = await locator.boundingBox()
    if (!box) throw new Error(`preview has no box: ${id}`)
    const target = path.join(PREVIEW_DIR, `${String(entries.length + 1).padStart(2, '0')}-${id}.png`)
    let capture = 'full-element'
    if (maxHeight && box.height > maxHeight) {
      capture = 'top-window'
      const previous = await locator.evaluate((element, height) => ({ height: element.style.height, overflow: element.style.overflow, applied: (element.style.height = `${height}px`, element.style.overflow = 'hidden', true) }), maxHeight)
      await locator.screenshot({ path: target })
      await locator.evaluate((element, saved) => { element.style.height = saved.height; element.style.overflow = saved.overflow }, previous)
    } else {
      await locator.screenshot({ path: target })
    }
    const bytes = await fs.readFile(target)
    entries.push({ id, selector, capture, path: path.relative(HERE, target), sha256: sha256(bytes), dimensions: pngDimensions(bytes) })
  }
  await page.close()
  return entries
}

async function buildContactSheet(browser, entries, pageCount) {
  const figures = entries.map(entry => `<figure><img src="${entry.path}" alt="${esc(entry.id)}"><figcaption>${esc(entry.id)}</figcaption></figure>`).join('')
  const html = `<!doctype html><html lang="ko"><head><meta charset="utf-8"><style>*{box-sizing:border-box}body{margin:0;background:#d8d3ca;color:#102d43;font-family:-apple-system,BlinkMacSystemFont,sans-serif}main{width:1800px;margin:auto;padding:46px;background:#f4efe5}header{display:flex;justify-content:space-between;align-items:end;border-bottom:2px solid #2d6972;padding-bottom:18px;margin-bottom:24px}h1{margin:0;font:600 34px Georgia,serif}header p{margin:0;color:#5d6d72}.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:20px}figure{margin:0;background:#f6f1e7;border:1px solid #9aa9a6;box-shadow:0 4px 13px #2334}img{display:block;width:100%;max-height:760px;object-fit:cover;object-position:top}figcaption{padding:9px 11px;border-top:1px solid #9aa9a6;color:#a84f3c;font:700 12px ui-monospace,monospace}.foot{margin-top:24px;padding-top:14px;border-top:1px solid #9aa9a6;color:#59696d;font-size:13px}</style></head><body><main><header><h1>Claude Code 시스템 해부 · selected design</h1><p>${pageCount} pages · 13 representative views</p></header><section class="grid">${figures}</section><div class="foot">Systems Monograph × Evidence Notebook · author-side visual sample, not independent acceptance.</div></main></body></html>`
  await fs.writeFile(CONTACT_HTML, html)
  const page = await browser.newPage({ viewport: { width: 1900, height: 1200 }, deviceScaleFactor: 1 })
  await page.goto(pathToFileURL(CONTACT_HTML).href, { waitUntil: 'load' })
  await page.screenshot({ path: CONTACT_PNG, fullPage: true })
  await page.close()
  const bytes = await fs.readFile(CONTACT_PNG)
  return { html: { path: path.basename(CONTACT_HTML), sha256: await digestFile(CONTACT_HTML) }, png: { path: path.basename(CONTACT_PNG), sha256: sha256(bytes), dimensions: pngDimensions(bytes) } }
}

async function main() {
  const generatedAt = new Date().toISOString()
  const inputState = await verifyInputs()
  await fs.rm(HTML_DIR, { recursive: true, force: true })
  await fs.rm(PREVIEW_DIR, { recursive: true, force: true })
  await fs.mkdir(HTML_DIR, { recursive: true })
  await fs.mkdir(PREVIEW_DIR, { recursive: true })
  await fs.mkdir(ENGINEERING, { recursive: true })

  const html = await buildHtml()
  await fs.writeFile(HTML_PATH, html)
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } })
  const htmlUrl = pathToFileURL(HTML_PATH).href
  await page.goto(htmlUrl, { waitUntil: 'load' })
  await page.evaluate(async () => { await document.fonts.ready; await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))) })
  const htmlValidation = await validateHtml(page)
  await page.emulateMedia({ media: 'print' })
  await page.pdf({ path: PDF_PATH, format: 'A4', preferCSSPageSize: true, printBackground: true, tagged: true, outline: true, displayHeaderFooter: false })
  await page.close()
  const pdfValidation = inspectPdf(PDF_PATH)
  const previews = await capturePreviews(browser, htmlUrl)
  const contactSheet = await buildContactSheet(browser, previews, pdfValidation.pageCount)
  await browser.close()

  const previewManifest = { schemaVersion: 1, generatedAt, pdf: path.basename(PDF_PATH), design: 'systems-monograph-x-evidence-notebook', samples: previews }
  const previewManifestPath = path.join(PREVIEW_DIR, 'visual-sample-manifest.json')
  await fs.writeFile(previewManifestPath, JSON.stringify(previewManifest, null, 2) + '\n')
  const parentAfter = { manifest: await digestFile(PARENT_MANIFEST), html: await digestFile(PARENT_HTML), pdf: await digestFile(PARENT_PDF) }
  const parentPreserved = JSON.stringify(inputState.parent) === JSON.stringify(parentAfter)
  if (!parentPreserved) throw new Error('parent reader edition changed during selected-design build')

  const visualReview = await fs.readFile(VISUAL_REVIEW, 'utf8').catch(() => '# Author-side visual review\n\nStatus: PENDING\n')
  const validation = {
    schemaVersion: 1,
    generatedAt,
    status: 'machine-checks-passed_author-visual-review-bound_independent-and-physical-pending',
    sourceRevision: parentManifest.source.revision,
    counts: { algorithms: 44, domains: 14, requirements: 36, researchSources: 9, representativePreviews: previews.length },
    html: htmlValidation,
    pdf: pdfValidation,
    design: {
      id: 'systems-monograph-x-evidence-notebook', paper: '#f6f1e7', ink: '#102d43', teal: '#2d6972', rust: '#a84f3c',
      dropCaps: false, pageCap: null, shrinkToFit: false, tagged: pdfValidation.tagged,
    },
    inputLineage: { verified: true, count: inputState.lineageCount },
    parentPreservation: { passed: parentPreserved, ...parentAfter },
    visualReview: { path: 'engineering/visual-review.md', sha256: sha256(visualReview), status: visualReview.includes('Status: PASS') ? 'pass_author_side' : 'pending' },
    boundaries: { independentReview: 'PENDING', physicalA4: 'PENDING', grayscale: 'PENDING', assistiveTechnology: 'PENDING', publicationAcceptance: 'NOT_CLAIMED' },
  }
  const validationPath = path.join(ENGINEERING, 'validation.json')
  await fs.writeFile(validationPath, JSON.stringify(validation, null, 2) + '\n')
  await fs.writeFile(path.join(ENGINEERING, 'validation.md'), `# Selected-design edition validation\n\n- generated: ${generatedAt}\n- status: machine checks PASS; author-side visual review ${validation.visualReview.status}; independent and physical review PENDING\n- PDF: ${pdfValidation.pageCount} pages, ${pdfValidation.textCharacters.toLocaleString()} searchable characters, ${pdfValidation.hangulCharacters.toLocaleString()} Hangul characters\n- content: 44 algorithms, 14 domains, 36 chronological requirements\n- HTML: ${htmlValidation.internalLinks} internal links, zero unresolved links, zero horizontal clipping candidates\n- typography: body ${htmlValidation.bodyPt.toFixed(2)}pt, code/table ${htmlValidation.codeMinPt.toFixed(2)}pt, utility ${htmlValidation.labelMinPt.toFixed(2)}pt; drop cap absent\n- PDF: tagged ${pdfValidation.tagged}, outline ${pdfValidation.hasOutline || pdfValidation.outlineMarker}, internal destinations ${pdfValidation.validInternalDestinations}/${pdfValidation.internalLinkAnnotations}\n- design: Systems Monograph × Evidence Notebook tokens and page-mode labels present\n- lineage: ${inputState.lineageCount} named study/design inputs digest-verified; parent edition preserved ${parentPreserved}\n- previews: ${previews.length} representative PNGs plus contact sheet\n\nThis author-side result does not close independent readability, physical A4, grayscale, assistive-technology or publication acceptance.\n`)

  const manifest = {
    schemaVersion: 1,
    generatedAt,
    title: 'Claude Code 시스템 해부',
    edition: 'selected-design-edition-2026-09-22',
    source: parentManifest.source,
    operationBinding: {
      routeDecision: { path: 'engineering/route-decision.json', sha256: await digestFile(path.join(ENGINEERING, 'route-decision.json')) },
      subjectAgency: { path: 'engineering/subject-agency.json', sha256: await digestFile(path.join(ENGINEERING, 'subject-agency.json')) },
      operationRequest: { path: 'engineering/reusable-artifact-operation-request.json', sha256: inputState.operationRequest },
      authorityEffect: 'none',
    },
    inputLineage: { path: 'content/input-lineage.json', sha256: await digestFile(path.join(CONTENT, 'input-lineage.json')), ...lineage },
    requirementBinding: {
      base: { path: '../book-edition-2026-09-21/content/requirement-ledger.json', count: 33, sha256: parentManifest.buildInputs.content['requirement-ledger.json'] },
      supplement: { path: 'content/current-requirements.json', count: 3, sha256: await digestFile(path.join(CONTENT, 'current-requirements.json')) },
      chronology: { path: 'engineering/requirement-chronology.md', sha256: await digestFile(REQUIREMENT_CHRONOLOGY) },
      total: 36,
    },
    designBinding: {
      id: 'systems-monograph-x-evidence-notebook',
      path: 'engineering/design-binding.md', sha256: await digestFile(DESIGN_BINDING),
      sourceRefs: lineage.designInputs,
    },
    build: { path: 'build-selected-design.mjs', sha256: await digestFile(path.join(HERE, 'build-selected-design.mjs')), parentHtmlSha256: inputState.parent.html },
    outputs: {
      pdf: { path: path.basename(PDF_PATH), sha256: await digestFile(PDF_PATH), bytes: (await fs.stat(PDF_PATH)).size, pages: pdfValidation.pageCount },
      html: { path: path.relative(HERE, HTML_PATH), sha256: await digestFile(HTML_PATH) },
      previewManifest: { path: path.relative(HERE, previewManifestPath), sha256: await digestFile(previewManifestPath), count: previews.length },
      contactSheet,
      validation: { path: path.relative(HERE, validationPath), sha256: await digestFile(validationPath) },
    },
    validation,
    parentPreservation: { ...parentAfter, passed: parentPreserved },
    unresolvedLimits: [
      'raw prompt wording outside retained sanitized chronology is unavailable',
      'upstream intent and production feature activation remain UNKNOWN',
      'independent reader and physical A4 review remain PENDING',
      'grayscale and assistive-technology review remain PENDING',
      'publication acceptance is not claimed',
    ],
  }
  const manifestPath = path.join(HERE, 'manifest.json')
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n')
  const manifestSha = await digestFile(manifestPath)
  await fs.writeFile(path.join(HERE, 'README.md'), `# Claude Code 시스템 해부 — 선택 디자인판\n\n다섯 스터디의 요구사항 계보와 기존 103쪽 독자판의 전체 내용을 보존하면서, 선택된 Systems Monograph × Evidence Notebook 형식으로 다시 렌더한 별도 edition이다.\n\n## 출력\n\n- [PDF](./${path.basename(PDF_PATH)}) — ${pdfValidation.pageCount}쪽, SHA-256 \`${manifest.outputs.pdf.sha256}\`\n- [HTML](./${path.relative(HERE, HTML_PATH)})\n- [contact sheet](./${path.basename(CONTACT_PNG)})\n- [manifest](./manifest.json) — SHA-256 \`${manifestSha}\`\n- [요구사항 연대기](./engineering/requirement-chronology.md)\n- [디자인 바인딩](./engineering/design-binding.md)\n- [검증](./engineering/validation.md)\n\n## 재생성\n\n\`\`\`sh\nnode --check build-selected-design.mjs\nnode build-selected-design.mjs\n\`\`\`\n\nMachine checks와 작성자 측 시각 검토는 독립 acceptance, physical A4, grayscale, assistive-technology 또는 publication acceptance를 대신하지 않는다.\n`)
  console.log(JSON.stringify({ pdf: manifest.outputs.pdf, manifest: { path: manifestPath, sha256: manifestSha }, validation: validation.status, previews: previews.length, parentPreserved }, null, 2))
}

await main()
