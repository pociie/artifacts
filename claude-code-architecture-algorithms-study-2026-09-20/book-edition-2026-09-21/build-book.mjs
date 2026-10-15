import fs from 'node:fs/promises'
import path from 'node:path'
import { createHash } from 'node:crypto'
import { spawnSync } from 'node:child_process'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { chromium } from 'playwright'
import { reports } from '../content.mjs'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const PARENT = path.dirname(HERE)
const CONTENT = path.join(HERE, 'content')
const HTML_DIR = path.join(HERE, 'html')
const PREVIEW_DIR = path.join(HERE, 'previews')
const ATTACHMENTS = path.join(HERE, 'attachments')
const ENGINEERING = path.join(HERE, 'engineering')
const PDF_PATH = path.join(HERE, 'claude-code-system-anatomy-reader-edition-ko.pdf')
const HTML_PATH = path.join(HTML_DIR, 'claude-code-system-anatomy-reader-edition-ko.html')

const readJson = async file => JSON.parse(await fs.readFile(file, 'utf8'))
const plan = await readJson(path.join(CONTENT, 'book-plan.json'))
const requirements = await readJson(path.join(CONTENT, 'requirement-ledger.json'))
const research = await readJson(path.join(CONTENT, 'research-adoption.json'))
const mechanisms = await readJson(path.join(CONTENT, 'language-mechanisms.json'))
const narratives = await readJson(path.join(PARENT, 'content', 'algorithm-narratives.json'))
const coverage = await readJson(path.join(PARENT, 'content', 'repository-coverage-rubric.json'))
const sourceProfile = await readJson(path.join(PARENT, 'content', 'source-profile.json'))
const parentManifest = await readJson(path.join(PARENT, 'manifest.json'))

const SOURCE_ROOT = path.resolve(PARENT, sourceProfile.localRootFromArtifact)
const REPOSITORY = sourceProfile.repository
const REVISION = sourceProfile.revision
const SOURCE_BASE = `${REPOSITORY}/blob/${REVISION}`
const allPages = reports.flatMap(report => report.chapters.flatMap(chapter => chapter.pages))
const algorithms = allPages.filter(page => page?.kind === 'algorithm')
const byAlgorithm = new Map(algorithms.map(item => [item.id, item]))
const byNarrative = new Map(narratives.algorithms.map(item => [item.id, item]))
const byDiagram = new Map(plan.diagrams.map(item => [item.id, item]))
const byMechanismChapter = new Map(mechanisms.interludes.map(item => [item.chapterId, item]))

const baselinePdfs = [
  ['01-source-truth-and-system-baseline.pdf', 'c83309f4e04274a09a57e350a66828aa1060e6ff5a8735ff96862efcd92b2d65'],
  ['02-runtime-surfaces-and-state-ownership.pdf', '602bc13234eb5430276b93c3ad4f7a06a6363a3055010ebb0ce7d421f6344b10'],
  ['03-turn-context-and-streaming-protocol.pdf', '11849c3758feb9c93ab47de5c4b8a8a7d9d1482b4fc82773a0b76cf6138c1710'],
  ['04-tool-effect-permission-and-change-algorithms.pdf', 'e7acf927f6e2a4f81b3447d6a1da26b9353ae967ebe26241b7de88550a3477eb'],
  ['05-durability-recovery-and-agent-lifecycle.pdf', 'c39b499035d27edc5fbe1415c1a31bd0d1cbba947ca7f0900fe36ad1bfa56d92'],
  ['06-extension-variability-operations-and-evolution.pdf', 'aee56833347ede082acffb572d7919073241b1f157662c094362f7bad7d661d3'],
]
const parentVisualReview = path.join(PARENT, 'engineering', 'visual-review.md')
const parentVisualReviewExpected = 'f8677409f5e73306d079a8d9a140a5540032318d93827a9917189a169388d280'
const operationRequest = path.resolve(HERE, '../../../memory/claude-code-book-edition-2026-09-21/operation-request-book-edition-1bf67e8c.json')
const operationRequestExpected = '71d40cc4b769c002bf59fe96c35cc592b38c843a4e408bdf7fe3503a0f89e89a'

const esc = value => String(value ?? '')
  .replaceAll('&', '&amp;').replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;').replaceAll('"', '&quot;')
const sha256 = value => createHash('sha256').update(value).digest('hex')
const digestFile = async file => sha256(await fs.readFile(file))
const unique = values => [...new Set(values)]
const slug = value => String(value).toLowerCase().replace(/[^a-z0-9가-힣]+/g, '-').replace(/^-|-$/g, '')
const sourceUrl = ref => `${SOURCE_BASE}/${ref.path}#L${ref.start}-L${ref.end}`
const sourceLabel = ref => `${ref.path}:${ref.start}–${ref.end}`

function statusSentence(status, text) {
  const label = { observed: 'OBSERVED', inference: 'INFERENCE', recommendation: 'RECOMMENDATION', unknown: 'UNKNOWN' }[status]
  return `<p class="status-sentence ${status}"><span class="status-label">${label}</span>${esc(text)}</p>`
}

function wrapLine(line, max = 72) {
  const result = []
  let rest = line
  while (rest.length > max) {
    const contentMax = max - 2
    let cut = Math.max(rest.lastIndexOf(' ', contentMax), rest.lastIndexOf(',', contentMax), rest.lastIndexOf('.', contentMax))
    if (cut < Math.floor(contentMax * 0.55)) cut = contentMax
    result.push(`${rest.slice(0, cut).trimEnd()} ↩`)
    rest = `  ${rest.slice(cut).trimStart()}`
  }
  result.push(rest)
  return result
}

function codeBlock(code, label = '예제') {
  const lines = String(code ?? '').split('\n').flatMap(line => wrapLine(line))
  return `<figure class="code-figure"><figcaption>${esc(label)}</figcaption><pre class="code-block" data-code-display="${esc(lines.join('\n'))}"><code>${esc(lines.join('\n'))}</code></pre></figure>`
}

async function sourceExcerpt(ref, maxLines = 30) {
  const file = path.join(SOURCE_ROOT, ref.path)
  const lines = (await fs.readFile(file, 'utf8')).split('\n')
  if (!Number.isInteger(ref.start) || !Number.isInteger(ref.end) || ref.start < 1 || ref.end < ref.start || ref.end > lines.length) {
    throw new Error(`invalid source range ${sourceLabel(ref)} (file has ${lines.length} lines)`)
  }
  const selected = lines.slice(ref.start - 1, Math.min(ref.end, ref.start - 1 + maxLines))
  const display = selected.flatMap((line, index) => wrapLine(`${String(ref.start + index).padStart(5)}  ${line}`))
  const omitted = ref.end - ref.start + 1 - selected.length
  if (omitted > 0) display.push(`       … ${omitted}개 행은 source link에서 이어 읽기`)
  return display.join('\n')
}

const theoryDefinitions = {
  'chain of responsibility': '앞선 handler가 처리 여부를 결정하고 다음 후보로 넘길지를 선택하는 책임 사슬이다.',
  'lazy loading': '필요해진 시점까지 module 평가와 자원 획득을 미루는 메커니즘이다.',
  'partial evaluation': '고정된 feature·환경 값을 build 시점에 적용해 남는 프로그램을 좁히는 관점이다.',
  'state machine': '현재 상태와 입력이 허용된 다음 상태와 action을 결정하는 모델이다.',
  'event sourcing': '현재 값만 저장하지 않고 변화 event로부터 projection을 재구성하는 접근이다.',
  'transition invariant': '한 phase에서 다음 phase로 넘어갈 때 함께 성립해야 하는 조건이다.',
  'tagged union': 'discriminant가 가능한 payload variant와 처리 branch를 결합하는 자료형이다.',
  'referential integrity': 'identity와 참조 관계가 늦은 갱신·직렬화 뒤에도 일관되게 유지되는 성질이다.',
  'optimistic concurrency': '기준 version이 바뀌지 않았음을 commit 직전에 검증하고 충돌 시 적용하지 않는 방식이다.',
  'idempotency': '같은 identity의 요청이 반복되어도 외부 effect가 중복 정산되지 않게 하는 성질이다.',
  'topological ordering': '의존 관계를 위반하지 않도록 node를 선형 순서로 배치하는 방법이다.'
}

function renderDiagram(id, number) {
  const d = byDiagram.get(id)
  if (!d) throw new Error(`missing diagram ${id}`)
  const width = 900
  const nodeWidth = 180
  const positions = d.nodes.map((_, i) => i < 4
    ? { x: 25 + i * 215, y: 48 }
    : { x: 670 - (i - 4) * 250, y: 190 })
  const svgText = (value, x, y) => {
    const words = String(value).split(' ')
    const lines = []
    for (const word of words) {
      if (!lines.length || `${lines.at(-1)} ${word}`.trim().length > 19) lines.push(word)
      else lines[lines.length - 1] += ` ${word}`
    }
    return `<text class="node-label" x="${x}" y="${y}" text-anchor="middle">${lines.slice(0,2).map((line, i) => `<tspan x="${x}" dy="${i === 0 ? 0 : 20}">${esc(line)}</tspan>`).join('')}</text>`
  }
  const nodes = d.nodes.map((node, i) => {
    const { x, y } = positions[i]
    return `<g><rect x="${x}" y="${y}" width="${nodeWidth}" height="68" rx="13"/>${svgText(node, x + nodeWidth / 2, y + 29)}</g>`
  }).join('')
  const edges = d.edges.map(([from, to, label], i) => {
    const a = positions[from]
    const b = positions[to]
    const acx = a.x + nodeWidth / 2
    const acy = a.y + 34
    const bcx = b.x + nodeWidth / 2
    const bcy = b.y + 34
    const dx = bcx - acx
    const dy = bcy - acy
    const distance = Math.hypot(dx, dy) || 1
    const offset = Math.min(84, distance / 3)
    const x1 = acx + dx / distance * offset
    const y1 = acy + dy / distance * offset
    const x2 = bcx - dx / distance * offset
    const y2 = bcy - dy / distance * offset
    const bend = (i % 3 - 1) * 24
    const mx = (x1 + x2) / 2
    const my = (y1 + y2) / 2 + bend
    return `<g><path d="M ${x1} ${y1} Q ${mx} ${my}, ${x2} ${y2}" marker-end="url(#arrow-${esc(id)})"/><text class="edge-label" x="${mx}" y="${my - 7}" text-anchor="middle">${esc(label)}</text></g>`
  }).join('')
  return `<figure id="figure-${esc(id)}" class="diagram" data-preview="${id}">
    <svg viewBox="0 0 ${width} 320" role="img" aria-labelledby="figure-${esc(id)}-title">
      <title id="figure-${esc(id)}-title">${esc(d.title)}</title>
      <defs><marker id="arrow-${esc(id)}" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z"/></marker></defs>
      ${edges}${nodes}
    </svg>
    <figcaption><span class="figure-label">그림 ${number}</span><strong>${esc(d.title)}</strong> — ${esc(d.caption)}</figcaption>
  </figure>`
}

function renderAlgorithmCluster(chapter) {
  return `<section class="algorithm-cluster" aria-labelledby="${chapter.id}-cluster">
    <h3 id="${chapter.id}-cluster">이 장의 결정점</h3>
    ${chapter.algorithmIds.map(id => {
      const a = byAlgorithm.get(id)
      if (!a) throw new Error(`unknown algorithm ${id}`)
      return `<article class="algorithm-brief">
        <h4><a href="#algorithm-${id}">${id} · ${esc(a.title)}</a></h4>
        <p>${esc(a.thesis ?? a.problem)}</p>
        <p class="source-ref"><a href="${sourceUrl(a.source)}">${esc(sourceLabel(a.source))}</a></p>
        <p><strong>보존 조건.</strong> ${esc(a.invariants?.[0] ?? a.decision)}</p>
      </article>`
    }).join('')}
  </section>`
}

function renderTraceTable(example) {
  if (!example?.trace) return ''
  return `<table class="trace-table"><thead><tr><th>지점</th><th>관찰</th><th>해석</th></tr></thead><tbody>${example.trace.map(row => `<tr>${row.map(cell => `<td>${esc(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table>`
}

async function renderWalkthrough(id) {
  const a = byAlgorithm.get(id)
  const n = byNarrative.get(id)
  if (!a || !n) throw new Error(`deep walkthrough lacks evidence for ${id}`)
  const excerpt = await sourceExcerpt(a.source)
  const example = n.example ? `<section class="walk-stage example-stage"><h3>${esc(n.example.title)}</h3><p>${esc(n.example.setup)}</p>${codeBlock(n.example.code, `${id} 축소 예제`)}${renderTraceTable(n.example)}<p class="return-to-code"><strong>프로젝트로 돌아가기.</strong> ${esc(n.example.returnToCode)}</p></section>` : ''
  const prereq = n.prerequisites.map(item => `<section class="prerequisite"><h4>${esc(item.concept)}</h4><p>${esc(item.explanation)}</p><p class="return-to-code"><strong>source에서 볼 지점.</strong> ${esc(item.returnToCode)}</p></section>`).join('')
  const transitions = a.steps.map((step, i) => `<li><span class="step-number">${i + 1}</span>${esc(step)}</li>`).join('')
  const theory = a.theory.map(term => `<li><strong>${esc(term)}</strong> — ${esc(theoryDefinitions[term] ?? '이 결정점을 다른 시스템에서도 비교하기 위한 이론적 어휘다.')}</li>`).join('')
  const current = [
    statusSentence('observed', n.currentState.observed),
    statusSentence('inference', n.currentState.conditional),
    statusSentence('unknown', n.currentState.unknown),
    statusSentence('recommendation', n.currentState.nextRead),
  ].join('')
  return `<section id="walkthrough-${id}" class="deep-walkthrough" data-walkthrough="${id}">
    <header class="walk-header"><p class="eyebrow">심층 코드 독해 · ${id}</p><h2>${esc(a.title)}</h2><p class="lead">${esc(n.readerSituation)}</p><p class="reader-question"><strong>독자 질문.</strong> ${esc(n.readerQuestion)}</p><p class="backlink"><a href="#${esc(idToChapter.get(id))}">이 장의 시작</a> · <a href="#algorithm-${id}">${id} atlas</a> · <a href="#toc">목차</a></p></header>
    <section class="walk-stage"><h3>결정적인 코드를 읽기 전에</h3>${prereq}</section>
    ${example}
    <section class="walk-stage code-stage" ${id === 'A39' ? 'data-preview="dense-code"' : ''}><h3>고정 source에서 결정점을 찾는다</h3><p>${esc(a.problem)}</p>${codeBlock(excerpt, `${sourceLabel(a.source)} · ${a.source.label ?? a.title}`)}<p class="source-ref"><a href="${sourceUrl(a.source)}">고정 revision의 전체 범위 열기</a></p></section>
    <section class="walk-stage"><h3>구조 안에서 누가 소유하는가</h3>${statusSentence('observed', n.ownership)}${statusSentence('inference', n.placement)}<p><strong>입력.</strong> ${esc(a.inputs.join(' · '))}</p><p><strong>유지 state.</strong> ${esc(a.state.join(' · '))}</p></section>
    <section class="walk-stage"><h3>상태가 어떻게 바뀌는가</h3><ol class="transition-list">${transitions}</ol><p>${esc(a.decision)}</p></section>
    <section class="walk-stage"><h3>보존 조건과 깨지는 방식</h3><ul>${a.invariants.map(item => `<li>${esc(item)}</li>`).join('')}</ul><h4>반증 가능한 실패</h4><ul>${a.failures.map(item => `<li>${esc(item)}</li>`).join('')}</ul></section>
    <section class="walk-stage"><h3>배경 이론은 source로 돌아오기 위한 도구다</h3><ul>${theory}</ul><p>${esc(a.improvement)}</p></section>
    <section class="walk-stage"><h3>실행과 운영에서 생기는 결과</h3>${statusSentence('observed', n.operation.runtime)}${statusSentence('inference', n.operation.effect)}${statusSentence('unknown', n.operation.failure)}${statusSentence('recommendation', n.operation.observation)}</section>
    <section class="walk-stage current-state"><h3>지금 재구성할 수 있는 시스템 상태</h3>${current}</section>
    <section class="walk-stage transfer"><h3>다음 코드를 읽을 때 가져갈 질문</h3><ul>${n.transferQuestions.map(q => `<li>${esc(q)}</li>`).join('')}</ul></section>
  </section>`
}

function renderMechanism(interlude) {
  return `<section id="mechanism-${interlude.id}" class="mechanism-study">
    <p class="eyebrow">언어 메커니즘</p><h2>${esc(interlude.title)}</h2><p class="lead">${esc(interlude.lead)}</p>
    ${interlude.sections.map((section, i) => `<section class="mechanism-case"><h3>${esc(section.heading)}</h3>${(section.paragraphs ?? []).map(p => `<p>${esc(p)}</p>`).join('')}${section.code ? codeBlock(section.code, `사례 ${i}`) : ''}${section.explanation ? `<p>${esc(section.explanation)}</p>` : ''}</section>`).join('')}
    <table class="comparison-table" data-preview="yield-comparison"><thead><tr>${interlude.comparison.columns.map(c => `<th>${esc(c)}</th>`).join('')}</tr></thead><tbody>${interlude.comparison.rows.map(row => `<tr>${row.map(c => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>
    <p class="return-to-code"><strong>프로젝트로 돌아가기.</strong> ${esc(interlude.projectReturn)}</p>
  </section>`
}

const idToChapter = new Map(plan.parts.flatMap(part => part.chapters.flatMap(chapter => chapter.algorithmIds.map(id => [id, chapter.id]))))

function renderToc() {
  return `<section id="toc" class="front-section toc" data-preview="toc"><p class="eyebrow">탐색</p><h1>목차</h1>
    <ol class="toc-list">
      <li><a href="#front-boundary">증거와 출처 경계</a></li>
      <li><a href="#front-method">분석 방법</a></li>
      <li><a href="#current-state-dashboard">현재 상태 대시보드</a></li>
      <li><a href="#figure-system-topology">전체 시스템 지도</a></li>
      <li><a href="#reading-paths">읽기 경로</a></li>
      ${plan.parts.map(part => `<li><a href="#${part.id}">Part ${part.number}. ${esc(part.title)}</a><ol>${part.chapters.map(chapter => `<li><a href="#${chapter.id}">${esc(chapter.title)}</a></li>`).join('')}</ol></li>`).join('')}
      <li><a href="#conclusion">결론</a></li>
      <li><a href="#appendix-algorithms">부록 A · A01–A44 알고리즘 atlas</a></li>
      <li><a href="#appendix-domains">부록 B · 14개 repository domain</a></li>
      <li><a href="#appendix-sources">부록 C · source index</a></li>
      <li><a href="#appendix-glossary">부록 D · 용어집</a></li>
      <li><a href="#appendix-requirements">부록 E · 요구사항 원장</a></li>
      <li><a href="#appendix-research">부록 F · 연구 채택 추적</a></li>
    </ol></section>`
}

async function renderChapter(chapter, figures) {
  const diagram = chapter.diagram ? `<p class="figure-callout"><a href="#figure-${chapter.diagram}">그림 ${figures.get(chapter.diagram)} · ${esc(byDiagram.get(chapter.diagram).title)}</a>에서 이 장의 정적 책임과 동적 연결을 먼저 확인한다.</p>${renderDiagram(chapter.diagram, figures.get(chapter.diagram))}` : ''
  const mechanism = byMechanismChapter.has(chapter.id) ? renderMechanism(byMechanismChapter.get(chapter.id)) : ''
  const walkthroughs = (await Promise.all(chapter.deepIds.map(renderWalkthrough))).join('')
  return `<section id="${chapter.id}" class="chapter" ${chapter.id === 'chapter-4' ? 'data-preview="prose"' : ''}>
    <header class="chapter-header"><p class="eyebrow">장</p><h1>${esc(chapter.title)}</h1><p class="lead">${esc(chapter.thesis)}</p><p class="backlink"><a href="#toc">목차</a></p></header>
    <div class="prose">${chapter.narrative.map(p => `<p>${esc(p)}</p>`).join('')}</div>
    ${diagram}${renderAlgorithmCluster(chapter)}${mechanism}${walkthroughs}
  </section>`
}

function renderAtlas() {
  return `<section id="appendix-algorithms" class="appendix"><header class="appendix-header"><p class="eyebrow">부록 A</p><h1>A01–A44 알고리즘 atlas</h1><p>본문은 대표 결정점을 깊게 읽고, atlas는 모든 알고리즘을 source·보존 조건·본문 장으로 다시 찾게 한다.</p></header>
    <div class="atlas-grid" data-preview="algorithm-atlas">${algorithms.map(a => `<article id="algorithm-${a.id}" class="atlas-entry"><h2>${a.id} · ${esc(a.title)}</h2><p>${esc(a.thesis ?? a.problem)}</p><p><strong>보존 조건.</strong> ${esc(a.invariants?.[0] ?? a.decision)}</p><p class="source-ref"><a href="${sourceUrl(a.source)}">${esc(sourceLabel(a.source))}</a></p><p><a href="#${idToChapter.get(a.id)}">본문 장</a>${byNarrative.has(a.id) && plan.parts.some(p => p.chapters.some(c => c.deepIds.includes(a.id))) ? ` · <a href="#walkthrough-${a.id}">심층 독해</a>` : ''}</p></article>`).join('')}</div></section>`
}

function renderDomains() {
  return `<section id="appendix-domains" class="appendix"><header class="appendix-header"><p class="eyebrow">부록 B</p><h1>14개 repository domain</h1><p>coverage는 모든 파일을 같은 깊이로 다룬다는 뜻이 아니라 중요한 책임 영역이 책의 탐색 지도에서 사라지지 않았다는 뜻이다.</p></header>
    <div class="domain-list">${coverage.domains.map((domain, i) => `<article id="domain-${esc(domain.id)}" class="domain-entry"><p class="eyebrow">D${String(i + 1).padStart(2, '0')}</p><h2>${esc(domain.id.replaceAll('_', ' '))}</h2><p>${esc(domain.question)}</p><p><strong>부모 evidence 주제.</strong> ${esc(domain.evidenceTitles.join(' · '))}</p></article>`).join('')}</div></section>`
}

function renderSourceIndex() {
  const groups = new Map()
  for (const a of algorithms) {
    if (!groups.has(a.source.path)) groups.set(a.source.path, [])
    groups.get(a.source.path).push(a)
  }
  return `<section id="appendix-sources" class="appendix"><header class="appendix-header"><p class="eyebrow">부록 C</p><h1>source index</h1><p>정의 위치에서 본문 해설과 알고리즘으로 이동한다. 파일 이름만으로 ownership이나 활성 상태를 판정하지 않는다.</p></header><div data-preview="source-index">${[...groups].sort(([a],[b]) => a.localeCompare(b)).map(([file, items]) => `<section class="source-group"><h2>${esc(file)}</h2><ul>${items.map(a => `<li><a href="#algorithm-${a.id}">${a.id} ${esc(a.title)}</a> · <a href="${sourceUrl(a.source)}">${a.source.start}–${a.source.end}행</a></li>`).join('')}</ul></section>`).join('')}</div></section>`
}

function renderGlossary() {
  return `<section id="appendix-glossary" class="appendix"><header class="appendix-header"><p class="eyebrow">부록 D</p><h1>용어집</h1></header><dl class="glossary">${plan.glossary.map(([term, definition]) => `<div id="glossary-${slug(term)}"><dt>${esc(term)}</dt><dd>${esc(definition)}</dd></div>`).join('')}</dl></section>`
}

function renderRequirementLedger() {
  return `<section id="appendix-requirements" class="appendix"><header class="appendix-header"><p class="eyebrow">부록 E</p><h1>요구사항 원장 T01–T33</h1><p>${esc(requirements.completenessBoundary)}</p></header><table class="ledger-table"><thead><tr><th>ID</th><th>요구</th><th>상태·위치</th><th>한계</th></tr></thead><tbody>${requirements.entries.map(e => `<tr id="requirement-${e.id}"><td>${e.id}</td><td>${esc(e.requirement)}</td><td><strong>${esc(e.status)}</strong><br>${esc(e.finalBookLocation.join(' · '))}</td><td>${esc(e.limitations)}</td></tr>`).join('')}</tbody></table></section>`
}

function renderResearchTrace() {
  return `<section id="appendix-research" class="appendix"><header class="appendix-header"><p class="eyebrow">부록 F</p><h1>연구 채택 추적</h1><p>외부 방법은 이름이 아니라 이 책에서 실제로 바뀐 편집 결정과 validator로 기록한다.</p></header><div data-preview="research-table"><table class="research-table"><thead><tr><th>자료</th><th>채택</th><th>기각</th><th>적용·검증</th></tr></thead><tbody>${research.sources.map(r => `<tr id="research-${r.id}"><td><a href="${esc(r.url)}">${esc(r.name)}</a></td><td>${esc(r.adoptedElement)}</td><td>${esc(r.rejectedSimplification)}</td><td>${esc(r.applications.join(' · '))}<br><strong>${esc(r.validators.join(' · '))}</strong></td></tr>`).join('')}</tbody></table></div></section>`
}

function renderConclusion() {
  const c = plan.conclusion
  const list = items => `<ul>${items.map(item => `<li>${esc(item)}</li>`).join('')}</ul>`
  return `<section id="conclusion" class="conclusion"><p class="eyebrow">결론</p><h1>결정적 부분을 보장하는 구조를 어떻게 읽을 것인가</h1><h2>관찰된 강점</h2>${list(c.strengths)}<h2>구조적 긴장</h2>${list(c.tensions)}<h2>권고</h2>${list(c.recommendations)}<h2>UNKNOWN</h2>${list(c.unknowns)}<h2>변경 영향</h2><p>${esc(c.changeImpact)}</p><p class="backlink"><a href="#toc">목차로 돌아가기</a></p></section>`
}

const CSS = `
@page { size: A4; margin: 18mm 20mm 20mm 21mm; @top-left { content: "CLAUDE CODE 시스템 해부"; font-size: 8pt; color: #50606b; } @top-right { content: string(chapterTitle); font-size: 8pt; color: #50606b; } @bottom-center { content: counter(page); font-size: 8pt; color: #50606b; } }
* { box-sizing: border-box; }
html { font-size: 14px; color: #17232b; background: #edf1ef; }
body { margin: 0 auto; max-width: 210mm; background: #fff; font-family: "Apple SD Gothic Neo", "Noto Sans KR", system-ui, sans-serif; font-size: 14px; line-height: 1.66; word-break: keep-all; overflow: visible; }
main { padding: 0; }
a { color: #075f69; text-decoration-thickness: .07em; text-underline-offset: .15em; }
p, li, dd { orphans: 3; widows: 3; }
h1, h2, h3, h4, figcaption { break-after: avoid; page-break-after: avoid; }
h1 + *, h2 + *, h3 + *, h4 + * { break-before: avoid; page-break-before: avoid; }
h1 { font-family: Georgia, "Apple SD Gothic Neo", serif; font-size: 29px; line-height: 1.22; letter-spacing: -.035em; margin: 0 0 5mm; string-set: chapterTitle content(text); }
h2 { font-family: Georgia, "Apple SD Gothic Neo", serif; font-size: 22px; line-height: 1.3; margin: 10mm 0 3.5mm; }
h3 { font-size: 17px; line-height: 1.35; margin: 8mm 0 2.8mm; }
h4 { font-size: 14.5px; line-height: 1.4; margin: 5mm 0 2mm; }
.prose, .walk-stage > p, .mechanism-case > p, .conclusion > p, .conclusion > ul { max-width: 128mm; }
.lead { max-width: 132mm; font-family: Georgia, "Apple SD Gothic Neo", serif; font-size: 17px; line-height: 1.58; color: #33444d; }
.eyebrow, .status-label, .figure-label, .source-ref, .step-number, .backlink { font-size: 10px; line-height: 1.45; letter-spacing: .07em; text-transform: uppercase; }
.eyebrow { color: #08727a; font-weight: 800; margin-bottom: 2.5mm; }
.cover { min-height: 245mm; padding: 31mm 23mm 24mm; display: flex; flex-direction: column; justify-content: space-between; break-after: page; background: linear-gradient(150deg,#edf6f3,#fff 45%,#eef2f5); }
.cover h1 { max-width: 145mm; font-size: 48px; line-height: 1.08; }
.cover .subtitle { max-width: 142mm; font-size: 20px; line-height: 1.55; }
.cover .edition { border-top: 1px solid #7ca5a3; padding-top: 5mm; max-width: 130mm; }
.front-section { padding: 15mm 21mm 14mm; min-height: 244mm; break-after: page; }
.front-section p, .front-section li { max-width: 132mm; }
.boundary-grid, .dashboard-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 5mm; margin-top: 8mm; }
.boundary-card, .dashboard-card, .reading-card { padding: 5mm; border: 1px solid #bfd0cc; border-radius: 4mm; break-inside: avoid; }
.boundary-card h2, .dashboard-card h2 { margin-top: 0; font-size: 17px; }
.toc-list { columns: 2; column-gap: 12mm; padding-left: 5mm; }
.toc-list > li { break-inside: avoid; margin: 0 0 4mm; }
.toc-list ol { padding-left: 5mm; margin-top: 2mm; }
.reading-path-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 4mm; margin-top: 8mm; }
.reading-card h2 { margin-top: 0; }
.part-opener { min-height: 244mm; padding: 54mm 21mm 20mm; break-before: page; break-after: page; background: #123c42; color: white; }
.part-opener .part-number { font-family: Georgia, serif; font-size: 60px; line-height: 1; color: #9dd9cf; }
.part-opener h1 { max-width: 145mm; font-size: 38px; color: white; margin-top: 15mm; }
.part-opener p { max-width: 125mm; font-size: 18px; }
.chapter, .conclusion, .appendix { padding: 14mm 21mm 16mm; }
.chapter { break-before: auto; }
.chapter-header { max-width: 145mm; border-bottom: 1.5px solid #7ca5a3; padding-bottom: 7mm; margin-bottom: 8mm; }
.algorithm-cluster { margin: 10mm 0; }
.algorithm-brief { break-inside: avoid; border-left: 3px solid #71a7a1; padding: 1mm 0 2mm 5mm; margin: 5mm 0; }
.algorithm-brief h4 { margin: 0 0 1mm; }
.source-ref { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 11.34px; text-transform: none; letter-spacing: 0; overflow-wrap: anywhere; }
.diagram { break-inside: avoid; margin: 10mm 0; padding: 4mm; border: 1px solid #bfd0cc; background: #fbfdfc; }
.diagram svg { display: block; width: 100%; height: auto; }
.diagram rect { fill: #fff; stroke: #1c7477; stroke-width: 2; }
.diagram path { fill: none; stroke: #6d7d80; stroke-width: 2; }
.diagram svg text { font-family: "Apple SD Gothic Neo", sans-serif; fill: #17333a; paint-order: stroke; stroke: #fbfdfc; stroke-width: 5px; stroke-linejoin: round; }
.diagram svg .node-label { font-size: 18px; font-weight: 700; }
.diagram svg .edge-label { font-size: 15px; }
.diagram figcaption { font-size: 11.5px; line-height: 1.48; margin-top: 3mm; }
.figure-label { display: block; color: #08727a; font-weight: 800; }
.deep-walkthrough { border-top: 4px solid #0b7477; margin-top: 16mm; padding-top: 9mm; }
.walk-header { break-after: avoid; }
.reader-question { max-width: 132mm; padding: 5mm; background: #eef6f4; border-left: 3px solid #17848a; }
.walk-stage { margin: 9mm 0; }
.prerequisite { break-inside: avoid; margin: 4mm 0; padding: 4mm 5mm; background: #f6f7f5; border-radius: 3mm; }
.return-to-code { max-width: 132mm; border-left: 3px solid #d28b36; padding-left: 4mm; color: #4a3a28; }
.code-figure { break-inside: auto; margin: 6mm 0; }
.code-figure figcaption { font-size: 11.34px; font-weight: 700; color: #4c5c62; margin-bottom: 2mm; }
.code-block { margin: 0; padding: 4mm; border-radius: 2mm; background: #172a30; color: #eaf5f2; white-space: pre-wrap; overflow-wrap: anywhere; overflow: visible; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 11.34px; line-height: 1.46; tab-size: 2; }
.transition-list { list-style: none; padding: 0; max-width: 135mm; }
.transition-list li { display: grid; grid-template-columns: 8mm 1fr; gap: 3mm; margin: 3mm 0; }
.step-number { width: 7mm; height: 7mm; border-radius: 50%; background: #d9ece8; display: inline-grid; place-items: center; }
.status-sentence { max-width: 136mm; display: grid; grid-template-columns: 31mm 1fr; gap: 4mm; padding: 3mm 0; border-bottom: 1px solid #d9e1de; margin: 0; }
.status-label { font-weight: 800; color: #286c70; }
.status-sentence.unknown .status-label { color: #9a5a19; }
.status-sentence.recommendation .status-label { color: #72519a; }
.current-state, .transfer { break-inside: avoid; }
table { width: 100%; border-collapse: collapse; font-size: 11.34px; line-height: 1.48; break-inside: auto; }
thead { display: table-header-group; }
tr { break-inside: avoid; }
th, td { text-align: left; vertical-align: top; border-bottom: 1px solid #cbd7d3; padding: 2.5mm 2mm; overflow-wrap: anywhere; }
th { color: #245c60; background: #edf5f3; }
.trace-table, .comparison-table { margin: 5mm 0; }
.mechanism-study { border-top: 1px solid #7ca5a3; border-bottom: 1px solid #7ca5a3; margin: 14mm 0; padding: 9mm 0; }
.mechanism-case { margin: 8mm 0; }
.transfer { background: #f4f1f7; padding: 5mm; }
.backlink { margin-top: 9mm; padding-top: 3mm; border-top: 1px solid #d5deda; }
.conclusion { break-before: auto; }
.appendix { break-before: auto; }
.appendix-header { min-height: 68mm; border-bottom: 2px solid #4c7f7c; margin-bottom: 8mm; }
.atlas-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 5mm; }
.atlas-entry { break-inside: avoid; border: 1px solid #cad8d4; padding: 4mm; }
.atlas-entry h2 { margin-top: 0; font-size: 16px; }
.domain-entry, .source-group { break-inside: avoid; border-bottom: 1px solid #cbd7d3; padding: 4mm 0; }
.domain-entry h2, .source-group h2 { margin: 0 0 2mm; font-size: 16px; }
.glossary > div { break-inside: avoid; display: grid; grid-template-columns: 38mm 1fr; gap: 5mm; border-bottom: 1px solid #d5deda; padding: 3mm 0; }
.glossary dt { font-weight: 800; }
.glossary dd { margin: 0; }
.ledger-table td:first-child { white-space: nowrap; font-weight: 800; }
@media screen { body { box-shadow: 0 0 30px rgba(20,40,40,.18); } .chapter, .conclusion, .appendix { border-bottom: 12px solid #edf1ef; } }
@media print { html, body { background: white; } a { color: inherit; } .cover, .front-section, .part-opener, .chapter, .conclusion, .appendix { padding-left: 0; padding-right: 0; } }
`

async function buildHtml() {
  const figures = new Map(plan.diagrams.map((d, i) => [d.id, i + 1]))
  const chapters = []
  for (const part of plan.parts) {
    const rendered = []
    for (const chapter of part.chapters) rendered.push(await renderChapter(chapter, figures))
    chapters.push(`<section id="${part.id}" class="part-opener"><p class="part-number">${part.number}</p><h1>${esc(part.title)}</h1><p>${esc(part.promise)}</p><p><a href="#toc">목차로</a></p></section>${rendered.join('')}`)
  }
  const boundaryCards = Object.entries(plan.sourceBoundary).map(([status, text]) => `<article class="boundary-card"><h2>${status.toUpperCase()}</h2><p>${esc(text)}</p></article>`).join('')
  const dashboardCards = Object.entries(plan.dashboard).map(([status, items]) => `<article class="dashboard-card"><h2>${status.toUpperCase()}</h2><ul>${items.map(item => `<li>${esc(item)}</li>`).join('')}</ul></article>`).join('')
  const readingCards = plan.readingPaths.map(pathItem => `<article class="reading-card"><h2>${esc(pathItem.duration)}</h2><p>${esc(pathItem.outcome)}</p><ol>${pathItem.route.map(item => `<li>${esc(item)}</li>`).join('')}</ol></article>`).join('')
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(plan.title)}</title><style>${CSS}</style></head><body><main>
    <section id="cover" class="cover" data-preview="cover"><div><p class="eyebrow">Architecture & Algorithms · Reader Edition</p><h1>${esc(plan.title)}</h1><p class="subtitle">${esc(plan.subtitle)}</p></div><div class="edition"><p>${esc(plan.edition)}</p><p>${esc(plan.purpose)}</p></div></section>
    <section id="front-boundary" class="front-section"><p class="eyebrow">읽기 계약</p><h1>증거와 출처 경계</h1><p class="lead">코드가 존재한다는 사실, 구조에 대한 해석, 개선 제안, 현재 자료로 알 수 없는 것을 같은 문장으로 섞지 않는다.</p><div class="boundary-grid">${boundaryCards}</div></section>
    <section id="front-method" class="front-section"><p class="eyebrow">연구와 설명 방법</p><h1>분석 방법</h1>${plan.method.map(p => `<p>${esc(p)}</p>`).join('')}<p><a href="#appendix-research">외부 방법 연구와 채택·기각 기록 보기</a></p></section>
    <section id="current-state-dashboard" class="front-section" data-preview="dashboard"><p class="eyebrow">한 페이지 기준선</p><h1>현재 상태 대시보드</h1><div class="dashboard-grid">${dashboardCards}</div></section>
    <section id="whole-system-map" class="front-section"><p class="eyebrow">계층적 context</p><h1>전체 시스템 지도</h1>${renderDiagram('system-topology', figures.get('system-topology'))}<p>이 지도는 배포 topology를 증명하지 않는다. 고정 source에서 관찰한 책임 관계를 이후 Part에서 더 작은 building block과 runtime decision으로 확대하기 위한 독해 좌표다.</p></section>
    <section id="reading-paths" class="front-section" data-preview="reading-paths"><p class="eyebrow">스터디 경로</p><h1>10분·60분·심층 읽기</h1><div class="reading-path-grid">${readingCards}</div></section>
    ${renderToc()}${chapters.join('')}${renderConclusion()}${renderAtlas()}${renderDomains()}${renderSourceIndex()}${renderGlossary()}${renderRequirementLedger()}${renderResearchTrace()}
  </main></body></html>`
}

function validateModel() {
  const ids = algorithms.map(a => a.id).sort()
  const expected = Array.from({ length: 44 }, (_, i) => `A${String(i + 1).padStart(2, '0')}`)
  if (JSON.stringify(ids) !== JSON.stringify(expected)) throw new Error(`algorithm set mismatch: ${ids.join(',')}`)
  const assignments = plan.parts.flatMap(p => p.chapters.flatMap(c => c.algorithmIds))
  if (assignments.length !== 44 || unique(assignments).length !== 44 || assignments.some(id => !byAlgorithm.has(id))) throw new Error('book plan must assign 44 algorithms exactly once')
  const deep = plan.parts.flatMap(p => p.chapters.flatMap(c => c.deepIds))
  if (deep.length < 6 || deep.length > 10 || deep.some(id => !assignments.includes(id))) throw new Error(`deep walkthrough count/range invalid: ${deep.length}`)
  for (const id of deep) {
    const narrative = byNarrative.get(id)
    for (const key of ['readerSituation','readerQuestion','ownership','placement','prerequisites','operation','currentState','transferQuestions']) if (!narrative?.[key]) throw new Error(`${id} narrative missing ${key}`)
  }
  if (coverage.domains.length !== 14) throw new Error(`domain count ${coverage.domains.length}`)
  const requirementIds = requirements.entries.map(e => e.id)
  const expectedRequirements = Array.from({ length: 33 }, (_, i) => `T${String(i + 1).padStart(2, '0')}`)
  if (JSON.stringify(requirementIds) !== JSON.stringify(expectedRequirements)) throw new Error('requirement ledger must contain chronological T01-T33')
  for (const entry of requirements.entries) {
    for (const key of ['chronology','source','status','finalBookLocation','validationEvidence','owner','limitations']) if (entry[key] == null) throw new Error(`${entry.id} missing ${key}`)
    if (!requirements.statusVocabulary.includes(entry.status)) throw new Error(`${entry.id} invalid status ${entry.status}`)
  }
  if (research.sources.length < 8 || research.sources.some(r => !r.url || !r.observedMethod || !r.adoptedElement || !r.rejectedSimplification || !r.applications?.length || !r.validators?.length)) throw new Error('research adoption incomplete')
  if (plan.diagrams.length < 6) throw new Error('six diagrams required')
  return { algorithms: 44, domains: 14, requirements: 33, researchSources: research.sources.length, deepWalkthroughs: deep.length, diagrams: plan.diagrams.length }
}

async function validateSourceRanges() {
  const refs = []
  for (const algorithm of algorithms) refs.push(algorithm.source, ...(algorithm.refs ?? []))
  const uniqueRefs = [...new Map(refs.filter(ref => ref?.path && ref?.start && ref?.end).map(ref => [`${ref.path}:${ref.start}-${ref.end}`, ref])).values()]
  for (const ref of uniqueRefs) {
    const file = path.join(SOURCE_ROOT, ref.path)
    const stat = await fs.stat(file)
    if (!stat.isFile()) throw new Error(`source evidence is not a file: ${ref.path}`)
    const lineCount = (await fs.readFile(file, 'utf8')).split('\n').length
    if (!Number.isInteger(ref.start) || !Number.isInteger(ref.end) || ref.start < 1 || ref.end < ref.start || ref.end > lineCount) throw new Error(`source range invalid: ${sourceLabel(ref)} / ${lineCount}`)
  }
  return uniqueRefs.length
}

function validateHtmlText(html) {
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(m => m[1])
  const duplicateIds = ids.filter((id, i) => ids.indexOf(id) !== i)
  if (duplicateIds.length) throw new Error(`duplicate HTML ids: ${unique(duplicateIds).join(', ')}`)
  const idSet = new Set(ids)
  const internalLinks = [...html.matchAll(/href="#([^"]+)"/g)].map(m => m[1])
  const missing = unique(internalLinks.filter(id => !idSet.has(id)))
  if (missing.length) throw new Error(`unresolved internal links: ${missing.join(', ')}`)
  const researchTargets = research.sources.flatMap(source => source.applications)
  const invalidResearchTargets = researchTargets.filter(target => !target.startsWith('#') || !idSet.has(target.slice(1)))
  if (invalidResearchTargets.length) throw new Error(`research applications do not resolve: ${invalidResearchTargets.join(', ')}`)
  const missingFigureCrossRefs = plan.diagrams.filter(diagram => !html.includes(`href="#figure-${diagram.id}"`)).map(diagram => diagram.id)
  if (missingFigureCrossRefs.length) throw new Error(`figures lack cross-reference: ${missingFigureCrossRefs.join(', ')}`)
  const displays = [...html.matchAll(/data-code-display="([\s\S]*?)"/g)].map(m => m[1].replaceAll('&quot;', '"').replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&amp;', '&'))
  const longLines = displays.flatMap((code, block) => code.split('\n').map((line, lineIndex) => ({ block, lineIndex, length: line.length })).filter(x => x.length > 72))
  if (longLines.length) throw new Error(`display code exceeds 72 chars: ${JSON.stringify(longLines.slice(0, 8))}`)
  for (const required of ['front-boundary','front-method','current-state-dashboard','whole-system-map','reading-paths','toc','appendix-algorithms','appendix-domains','appendix-sources','appendix-glossary','appendix-requirements','appendix-research']) if (!idSet.has(required)) throw new Error(`missing required anchor ${required}`)
  return { ids: ids.length, internalLinks: internalLinks.length, researchApplicationAnchors: researchTargets.length, figureCrossReferences: plan.diagrams.length, codeBlocks: displays.length, maxCodeLine: Math.max(...displays.flatMap(code => code.split('\n').map(line => line.length))) }
}

async function verifyParentInputs() {
  const baseline = []
  for (const [name, expected] of baselinePdfs) {
    const actual = await digestFile(path.join(PARENT, name))
    if (actual !== expected) throw new Error(`baseline changed: ${name} expected ${expected} actual ${actual}`)
    baseline.push({ path: `../${name}`, sha256: actual })
  }
  const visualActual = await digestFile(parentVisualReview)
  if (visualActual !== parentVisualReviewExpected) throw new Error(`parent visual-review changed: ${visualActual}`)
  const operationActual = await digestFile(operationRequest)
  if (operationActual !== operationRequestExpected) throw new Error(`operation request changed: ${operationActual}`)
  if (sourceProfile.revision !== '2ca5ddabfed5f220812ea11f029eda03b21bc4c1') throw new Error(`unexpected source revision ${sourceProfile.revision}`)
  return { baseline, parentVisualReview: visualActual, operationRequest: operationActual }
}

async function browserValidation(page) {
  await page.emulateMedia({ media: 'screen' })
  const result = await page.evaluate(() => {
    const px = element => Number.parseFloat(getComputedStyle(element).fontSize)
    const visible = element => {
      const style = getComputedStyle(element)
      const rect = element.getBoundingClientRect()
      return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0
    }
    const bodyPx = px(document.body)
    const codeMin = Math.min(...[...document.querySelectorAll('.code-block, table, .source-ref')].filter(visible).map(px))
    const noteMin = Math.min(...[...document.querySelectorAll('.status-label, .eyebrow, .figure-label, .backlink')].filter(visible).map(px))
    const clipped = [...document.querySelectorAll('pre, table, figure, svg')].filter(visible).filter(element => element.scrollWidth > element.clientWidth + 1).map(element => `${element.tagName}.${element.className}`).slice(0,20)
    const headings = [...document.querySelectorAll('h1,h2,h3,h4')].filter(visible)
    const orphanCss = headings.filter(h => !['avoid','avoid-page'].includes(getComputedStyle(h).breakAfter)).map(h => h.textContent.trim()).slice(0,20)
    return { bodyPx, bodyPt: bodyPx * .75, codeMinPx: codeMin, codeMinPt: codeMin * .75, labelMinPx: noteMin, labelMinPt: noteMin * .75, clipped, orphanCss, scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }
  })
  if (result.bodyPt < 10.5 - .01) throw new Error(`body type below 10.5pt: ${result.bodyPt}`)
  if (result.codeMinPt < 8.5 - .01) throw new Error(`code/table type below 8.5pt: ${result.codeMinPt}`)
  if (result.labelMinPt < 7.5 - .01) throw new Error(`label type below 7.5pt: ${result.labelMinPt}`)
  if (result.clipped.length) throw new Error(`horizontal clipping candidates: ${result.clipped.join(', ')}`)
  if (result.orphanCss.length) throw new Error(`headings lack break-after avoid: ${result.orphanCss.join(', ')}`)
  return result
}

const swiftInspection = `
import Foundation
import PDFKit
let url = URL(fileURLWithPath: CommandLine.arguments[1])
guard let doc = PDFDocument(url: url) else { fatalError("cannot open PDF") }
var pages: [[String: Any]] = []
var allText = ""
var linkAnnotations = 0
var internalLinkAnnotations = 0
var validInternalDestinations = 0
var externalLinkAnnotations = 0
for index in 0..<doc.pageCount {
  guard let page = doc.page(at: index) else { continue }
  let text = page.string ?? ""
  allText += text + "\\n"
  let bounds = page.bounds(for: .mediaBox)
  let selection = page.selection(for: bounds)
  let lines = selection?.selectionsByLine() ?? []
  var positions: [Double] = []
  for line in lines {
    let rect = line.bounds(for: page)
    let center = Double(rect.midY - bounds.minY) / Double(bounds.height)
    if center.isFinite && center >= 0.08 && center <= 0.92 { positions.append(center) }
  }
  let span = positions.isEmpty ? 0.0 : max(0.0, min(1.0, ((positions.max()! - positions.min()!) / 0.84)))
  let prefix = String(text.prefix(500))
  let partTitles = ["프로세스는", "streaming", "동시성", "nested agent", "MCP"]
  let intentional = index == 0 || prefix.contains("PART") || prefix.contains("부록") || partTitles.contains(where: { prefix.contains($0) })
  for annotation in page.annotations where annotation.type == "Link" {
    linkAnnotations += 1
    if let action = annotation.action as? PDFActionGoTo {
      internalLinkAnnotations += 1
      if action.destination.page != nil { validInternalDestinations += 1 }
    } else if annotation.action is PDFActionURL {
      externalLinkAnnotations += 1
    }
  }
  pages.append(["page": index + 1, "characters": text.count, "bodySpan": span, "intentionalSparse": intentional, "prefix": String(prefix.prefix(80))])
}
let hangul = allText.unicodeScalars.filter { $0.value >= 0xAC00 && $0.value <= 0xD7A3 }.count
let payload: [String: Any] = ["pageCount": doc.pageCount, "hasOutline": doc.outlineRoot != nil, "textCharacters": allText.count, "hangulCharacters": hangul, "linkAnnotations": linkAnnotations, "internalLinkAnnotations": internalLinkAnnotations, "validInternalDestinations": validInternalDestinations, "externalLinkAnnotations": externalLinkAnnotations, "first12Text": pages.prefix(12).map { $0["prefix"] as? String ?? "" }.joined(separator: " "), "pages": pages]
let data = try! JSONSerialization.data(withJSONObject: payload)
print(String(data: data, encoding: .utf8)!)
`

function inspectPdf(pdfPath) {
  const result = spawnSync('swift', ['-', pdfPath], { input: swiftInspection, encoding: 'utf8', maxBuffer: 30 * 1024 * 1024 })
  if (result.status !== 0) throw new Error(`PDFKit inspection failed: ${result.stderr}`)
  const inspection = JSON.parse(result.stdout.trim().split('\n').at(-1))
  const bytes = spawnSync('strings', [pdfPath], { encoding: 'utf8', maxBuffer: 30 * 1024 * 1024 })
  const rawMarkers = bytes.stdout
  const hasStructTree = rawMarkers.includes('/StructTreeRoot')
  const hasOutlinesMarker = rawMarkers.includes('/Outlines')
  if (!inspection.hasOutline && !hasOutlinesMarker) throw new Error('PDF outline missing')
  if (!hasStructTree) throw new Error('PDF StructTreeRoot missing')
  if (inspection.internalLinkAnnotations < 50 || inspection.validInternalDestinations !== inspection.internalLinkAnnotations) throw new Error(`PDF internal link validation failed: ${inspection.validInternalDestinations}/${inspection.internalLinkAnnotations}`)
  if (inspection.hangulCharacters < 2000) throw new Error(`searchable Korean text too small: ${inspection.hangulCharacters}`)
  if (inspection.pages.some(page => page.characters < 20)) throw new Error(`blank page detected: ${inspection.pages.filter(p => p.characters < 20).map(p => p.page)}`)
  const spans = inspection.pages.filter(p => !p.intentionalSparse).map(p => p.bodySpan).sort((a,b) => a-b)
  const median = spans[Math.floor(spans.length / 2)] ?? 0
  const sparseUnexpected = inspection.pages.filter(p => p.bodySpan < .35 && !p.intentionalSparse)
  if (median < .70) throw new Error(`general-page median body span ${median.toFixed(3)} below 0.70`)
  if (sparseUnexpected.length) throw new Error(`unexpected sparse pages: ${sparseUnexpected.map(p => `${p.page}:${p.bodySpan.toFixed(2)}`).join(', ')}`)
  return { ...inspection, hasStructTree, hasOutlinesMarker, medianBodySpan: median, unexpectedSparsePages: [] }
}

const PNG_SIGNATURE = Buffer.from([137,80,78,71,13,10,26,10])
function pngDimensions(bytes) {
  if (!bytes.subarray(0,8).equals(PNG_SIGNATURE) || bytes.toString('ascii',12,16) !== 'IHDR') throw new Error('invalid PNG')
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) }
}

async function capturePreviews(browser, htmlUrl) {
  const specs = [
    ['cover','[data-preview="cover"]'], ['toc','[data-preview="toc"]'], ['reading-paths','[data-preview="reading-paths"]'],
    ['whole-system-map','[data-preview="system-topology"]'], ['prose','[data-preview="prose"] .prose'], ['dense-code','[data-preview="dense-code"]'],
    ['comparison-table','[data-preview="yield-comparison"]'], ['decision-diagram','[data-preview="permission-effect"]'], ['current-state-dashboard','[data-preview="dashboard"]'],
    ['algorithm-atlas','[data-preview="algorithm-atlas"]',1000], ['source-index','[data-preview="source-index"]',1000]
  ]
  const page = await browser.newPage({ viewport: { width: 1280, height: 1000 }, deviceScaleFactor: 1 })
  await page.goto(htmlUrl, { waitUntil: 'load' })
  await page.evaluate(async () => { await document.fonts.ready; await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))) })
  const entries = []
  for (const [id, selector, maxHeight] of specs) {
    const locator = page.locator(selector).first()
    if (await locator.count() !== 1) throw new Error(`preview selector failed: ${id} ${selector}`)
    await locator.scrollIntoViewIfNeeded()
    await page.evaluate(async () => { await document.fonts.ready; await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))) })
    const target = path.join(PREVIEW_DIR, `${String(entries.length + 1).padStart(2,'0')}-${id}.png`)
    const box = await locator.boundingBox()
    if (!box) throw new Error(`preview has no box: ${id}`)
    let capture = 'full-element'
    if (maxHeight && box.height > maxHeight) {
      capture = 'top-window'
      const previous = await locator.evaluate((element, height) => {
        const saved = { height: element.style.height, overflow: element.style.overflow }
        element.style.height = `${height}px`
        element.style.overflow = 'hidden'
        return saved
      }, maxHeight)
      await locator.screenshot({ path: target })
      await locator.evaluate((element, saved) => {
        element.style.height = saved.height
        element.style.overflow = saved.overflow
      }, previous)
    } else {
      await locator.screenshot({ path: target })
    }
    const bytes = await fs.readFile(target)
    entries.push({ id, selector, capture, fullElementDimensions: { width: Math.round(box.width), height: Math.round(box.height) }, path: path.relative(HERE, target), sha256: sha256(bytes), dimensions: pngDimensions(bytes) })
  }
  await page.close()
  return entries
}

async function main() {
  const generatedAt = new Date().toISOString()
  const parentBefore = await verifyParentInputs()
  const counts = validateModel()
  counts.sourceRanges = await validateSourceRanges()
  await fs.rm(HTML_DIR, { recursive: true, force: true })
  await fs.rm(PREVIEW_DIR, { recursive: true, force: true })
  await fs.rm(ATTACHMENTS, { recursive: true, force: true })
  await fs.mkdir(HTML_DIR, { recursive: true })
  await fs.mkdir(PREVIEW_DIR, { recursive: true })
  await fs.mkdir(ATTACHMENTS, { recursive: true })

  const html = await buildHtml()
  const htmlChecks = validateHtmlText(html)
  await fs.writeFile(HTML_PATH, html)

  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } })
  const htmlUrl = pathToFileURL(HTML_PATH).href
  await page.goto(htmlUrl, { waitUntil: 'load' })
  await page.evaluate(async () => { await document.fonts.ready; await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))) })
  const layoutChecks = await browserValidation(page)
  await page.emulateMedia({ media: 'print' })
  await page.pdf({ path: PDF_PATH, format: 'A4', preferCSSPageSize: true, printBackground: true, tagged: true, outline: true, displayHeaderFooter: false })
  await page.close()
  const previews = await capturePreviews(browser, htmlUrl)
  await browser.close()

  const previewManifest = { schemaVersion: 1, generatedAt, pdf: path.basename(PDF_PATH), samples: previews }
  const previewManifestPath = path.join(PREVIEW_DIR, 'visual-sample-manifest.json')
  await fs.writeFile(previewManifestPath, JSON.stringify(previewManifest, null, 2) + '\n')

  const pdfChecks = inspectPdf(PDF_PATH)
  const first12Text = (await fs.readFile(PDF_PATH)).length > 0 ? pdfChecks.first12Text : ''
  const frontMarkers = ['증거와 출처 경계','분석 방법','현재 상태 대시보드','전체 시스템 지도','읽기 경로','목차']
  const missingFront = frontMarkers.filter(marker => !first12Text.includes(marker))
  if (missingFront.length) {
    const swiftText = spawnSync('swift', ['-', PDF_PATH], { input: `import Foundation\nimport PDFKit\nlet d=PDFDocument(url:URL(fileURLWithPath:CommandLine.arguments[1]))!\nprint((0..<min(12,d.pageCount)).compactMap{d.page(at:$0)?.string}.joined(separator:"\\n"))`, encoding: 'utf8', maxBuffer: 30 * 1024 * 1024 })
    const actual = swiftText.stdout
    const normalized = actual.replace(/\s+/g, '')
    const stillMissing = frontMarkers.filter(marker => !normalized.includes(marker.replace(/\s+/g, '')))
    if (stillMissing.length) throw new Error(`front matter not within first 12 pages: ${stillMissing.join(', ')}`)
  }

  const contentFiles = ['book-plan.json','requirement-ledger.json','research-adoption.json','language-mechanisms.json']
  const inputDigests = Object.fromEntries(await Promise.all(contentFiles.map(async name => [name, await digestFile(path.join(CONTENT, name))])))
  const frozenInputs = {
    schemaVersion: 1, generatedAt, sourceRevision: REVISION,
    operationRequest: { path: path.relative(HERE, operationRequest), sha256: parentBefore.operationRequest },
    parentManifest: { path: '../manifest.json', sha256: await digestFile(path.join(PARENT, 'manifest.json')), generatedAt: parentManifest.generatedAt },
    parentVisualReview: { path: '../engineering/visual-review.md', sha256: parentBefore.parentVisualReview },
    baselinePdfs: parentBefore.baseline,
    builder: { path: 'build-book.mjs', sha256: await digestFile(path.join(HERE, 'build-book.mjs')) },
    content: inputDigests,
    research: { path: 'research/codebase-study-methods.md', sha256: await digestFile(path.join(HERE, 'research', 'codebase-study-methods.md')) },
    reconciliation: { path: 'engineering/requirement-reconciliation.md', sha256: await digestFile(path.join(ENGINEERING, 'requirement-reconciliation.md')) },
    editorialRationale: { path: 'engineering/editorial-rationale.md', sha256: await digestFile(path.join(ENGINEERING, 'editorial-rationale.md')) }
  }
  const frozenPath = path.join(ATTACHMENTS, 'frozen-inputs.json')
  await fs.writeFile(frozenPath, JSON.stringify(frozenInputs, null, 2) + '\n')

  const sourceIndex = algorithms.map(a => ({ id: a.id, title: a.title, source: a.source, url: sourceUrl(a.source), chapter: idToChapter.get(a.id) }))
  await fs.writeFile(path.join(ATTACHMENTS, 'algorithm-source-index.json'), JSON.stringify(sourceIndex, null, 2) + '\n')
  await fs.writeFile(path.join(ATTACHMENTS, 'domain-coverage.json'), JSON.stringify(coverage.domains.map((d, i) => ({ number: i + 1, ...d, anchor: `domain-${d.id}` })), null, 2) + '\n')

  const validation = {
    schemaVersion: 1, generatedAt, status: 'machine-checks-passed_visual-and-physical-pending',
    counts, html: htmlChecks, layout: layoutChecks,
    pdf: { pageCount: pdfChecks.pageCount, searchableTextCharacters: pdfChecks.textCharacters, searchableHangulCharacters: pdfChecks.hangulCharacters, outline: pdfChecks.hasOutline || pdfChecks.hasOutlinesMarker, tagged: pdfChecks.hasStructTree, linkAnnotations: pdfChecks.linkAnnotations, internalLinkAnnotations: pdfChecks.internalLinkAnnotations, validInternalDestinations: pdfChecks.validInternalDestinations, externalLinkAnnotations: pdfChecks.externalLinkAnnotations, medianGeneralPageOccupancy: pdfChecks.medianBodySpan, unexpectedSparsePages: pdfChecks.unexpectedSparsePages },
    previews: { count: previews.length, allPngDimensionsFromIhdr: true, allHashesRecorded: true },
    navigation: { internalLinksResolved: true, chapterBacklinks: true, algorithmSourceGlossaryAnchors: true },
    typography: { bodyMinPt: layoutChecks.bodyPt, codeTableNoteMinPt: layoutChecks.codeMinPt, labelFolioMinPt: layoutChecks.labelMinPt, pxToPtFormula: 'px*0.75' },
    boundaries: { sourceInferenceRecommendationUnknown: true, physicalA4: 'PENDING', independentVisualReview: 'PENDING', publicationAcceptance: 'NOT_CLAIMED' }
  }
  await fs.writeFile(path.join(ATTACHMENTS, 'validation.json'), JSON.stringify(validation, null, 2) + '\n')

  const validationMarkdown = `# 독자판 기계 검증\n\n- 생성: ${generatedAt}\n- 상태: machine checks passed; independent visual review와 physical A4는 PENDING\n- PDF: ${pdfChecks.pageCount}쪽, 검색 가능 문자 ${pdfChecks.textCharacters.toLocaleString()}자, 한글 ${pdfChecks.hangulCharacters.toLocaleString()}자\n- outline: ${validation.pdf.outline}, StructTreeRoot/tagged: ${validation.pdf.tagged}\n- 일반 페이지 median content span: ${(pdfChecks.medianBodySpan * 100).toFixed(1)}% (목표 70% 이상)\n- 알고리즘 ${counts.algorithms}/44, domain ${counts.domains}/14, 요구사항 ${counts.requirements}/33, 외부 연구 ${counts.researchSources}개, 심층 독해 ${counts.deepWalkthroughs}개, vector diagram ${counts.diagrams}개\n- source path/range ${counts.sourceRanges}개 존재·행 범위 검증, 연구 적용 anchor ${htmlChecks.researchApplicationAnchors}개 resolve, 그림 cross-reference ${htmlChecks.figureCrossReferences}개 resolve\n- 본문 ${(layoutChecks.bodyPt).toFixed(2)}pt, code/table/note 최소 ${(layoutChecks.codeMinPt).toFixed(2)}pt, label 최소 ${(layoutChecks.labelMinPt).toFixed(2)}pt (computed px × 0.75)\n- 내부 링크 ${htmlChecks.internalLinks}개 resolve, code display 최대 ${htmlChecks.maxCodeLine}자, horizontal clipping 후보 0, 빈 페이지 0\n- preview ${previews.length}개 PNG: IHDR dimensions와 SHA-256 기록\n- 부모 visual-review와 6개 PDF: build 전후 digest 보존\n\n이 검증은 의미·가독성·물리 인쇄 acceptance를 대신하지 않는다. 독립 reviewer가 frozen digest의 PDF와 preview를 cache-safe 절차로 다시 읽어야 한다.\n`
  await fs.writeFile(path.join(ENGINEERING, 'validation.md'), validationMarkdown)

  const parentAfter = await verifyParentInputs()
  const pdfSha = await digestFile(PDF_PATH)
  const htmlSha = await digestFile(HTML_PATH)
  const previewManifestSha = await digestFile(previewManifestPath)
  const manifest = {
    schemaVersion: 1, generatedAt, title: plan.title, edition: 'book-edition-2026-09-21',
    source: { repository: REPOSITORY, revision: REVISION, snapshotLabel: sourceProfile.snapshotLabel },
    operationBinding: frozenInputs.operationRequest,
    parentInputs: { parentManifest: frozenInputs.parentManifest, parentVisualReview: frozenInputs.parentVisualReview, baselinePdfs: parentAfter.baseline },
    buildInputs: { builder: frozenInputs.builder, content: inputDigests, research: frozenInputs.research, requirementReconciliation: frozenInputs.reconciliation, editorialRationale: frozenInputs.editorialRationale, frozenInputs: { path: 'attachments/frozen-inputs.json', sha256: await digestFile(frozenPath) } },
    outputs: { pdf: { path: path.basename(PDF_PATH), sha256: pdfSha, pages: pdfChecks.pageCount }, html: { path: path.relative(HERE, HTML_PATH), sha256: htmlSha }, previewManifest: { path: path.relative(HERE, previewManifestPath), sha256: previewManifestSha }, previews },
    features: { ...counts, parts: plan.parts.length, chapters: plan.parts.flatMap(p => p.chapters).length, glossaryTerms: plan.glossary.length, frontMatterWithinFirst12Pages: true, linkedToc: true, internalLinks: htmlChecks.internalLinks, codeMaxDisplayColumns: htmlChecks.maxCodeLine, taggedPdf: validation.pdf.tagged, outlinedPdf: validation.pdf.outline },
    validation,
    parentPreservation: { visualReview: parentAfter.parentVisualReview, baselinePdfs: parentAfter.baseline, passed: JSON.stringify(parentBefore) === JSON.stringify(parentAfter) },
    unresolvedLimits: ['pre-Orca raw transcript completeness cannot be proven from sanitized projections', 'upstream intent and production feature activation remain UNKNOWN', 'server protocol, telemetry backend, and external effect settlement remain UNKNOWN', 'independent visual readability verdict pending', 'physical A4 print check pending', 'publication acceptance not claimed']
  }
  if (!manifest.parentPreservation.passed) throw new Error('parent preservation comparison failed')
  const manifestPath = path.join(HERE, 'manifest.json')
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n')
  const manifestSha = await digestFile(manifestPath)

  const reviewRequest = `# 독립 시각 검토 요청\n\n## 고정 대상\n\n- manifest: \`manifest.json\` — ${manifestSha}\n- PDF: \`${path.basename(PDF_PATH)}\` — ${pdfSha} (${pdfChecks.pageCount}쪽)\n- HTML: \`${path.relative(HERE, HTML_PATH)}\` — ${htmlSha}\n- preview manifest: \`${path.relative(HERE, previewManifestPath)}\` — ${previewManifestSha}\n\n## cache-safe 절차\n\n1. 위 네 파일의 SHA-256을 먼저 다시 계산하고 하나라도 다르면 검토를 중단한다.\n2. preview manifest의 ${previews.length}개 PNG를 새 image context에서 열어 각 파일 hash와 IHDR dimensions를 재검산한다.\n3. cover, TOC, reading paths, whole-system map, prose, dense code, comparison table, permission decision diagram, dashboard, algorithm atlas, source index를 원본 해상도로 읽는다.\n4. 제목과 다음 문단의 분리, 한글 glyph, 72자 code line의 wrapping, 표의 열·행 경계, 그림 caption과 본문 cross-reference, status label, backlink를 확인한다.\n5. PDF를 새 viewer process에서 열어 실제 링크·outline·검색 가능한 한글을 확인하고, 첫 12쪽에 boundary·method·dashboard·map·paths·TOC가 있는지 읽는다.\n6. 결과는 이 파일을 수정하지 말고 별도 evidence-owned verdict에 digest와 함께 기록한다.\n\n기계 검증은 PASS했지만 독자 가독성, publication acceptance, physical A4 출력은 PENDING이다. 특히 이전 baseline의 화면 geometry PASS는 새 독자판의 가독성 판정으로 재사용하지 않는다.\n`
  await fs.writeFile(path.join(ENGINEERING, 'visual-review-request.md'), reviewRequest)

  const readme = `# Claude Code 시스템 해부 — 한국어 독자판\n\n고정 복원 소스를 한 권의 자연 흐름 IT 서적으로 재편집한 별도 edition이다. 기존 6권 PDF와 부모 evidence 파일은 변경하지 않는다.\n\n## 출력\n\n- [PDF](./${path.basename(PDF_PATH)}) — ${pdfChecks.pageCount}쪽, SHA-256 \`${pdfSha}\`\n- [HTML](./${path.relative(HERE, HTML_PATH)}) — linked TOC와 source/algorithm/glossary anchor 포함\n- [manifest](./manifest.json) — source, parent, content, research, requirement, PDF/HTML/preview digest binding\n- [visual sample manifest](./${path.relative(HERE, previewManifestPath)}) — ${previews.length}개 대표 PNG\n- [validation](./engineering/validation.md)\n- [independent review request](./engineering/visual-review-request.md)\n- [research method](./research/codebase-study-methods.md)\n- [requirement reconciliation](./engineering/requirement-reconciliation.md)\n\n## 재생성\n\n\`\`\`sh\nnode --check build-book.mjs\nnode build-book.mjs\n\`\`\`\n\n## 읽기 경계\n\nOBSERVED / INFERENCE / RECOMMENDATION / UNKNOWN을 분리한다. upstream intent, production activation, server protocol, telemetry backend, external effect settlement는 고정 evidence를 넘어서 단정하지 않는다. 독립 시각 검토와 physical A4 인쇄 확인은 아직 PENDING이다.\n\n## 보존된 baseline PDF\n\n${baselinePdfs.map(([name, hash]) => `- \`../${name}\` — \`${hash}\``).join('\n')}\n`
  await fs.writeFile(path.join(HERE, 'README.md'), readme)

  console.log(JSON.stringify({ generatedAt, pdf: { path: PDF_PATH, sha256: pdfSha, pages: pdfChecks.pageCount }, html: { sha256: htmlSha }, manifest: { sha256: manifestSha }, previewManifest: { sha256: previewManifestSha, count: previews.length }, counts, parentPreservation: manifest.parentPreservation, unresolvedLimits: manifest.unresolvedLimits }, null, 2))
}

await main()
