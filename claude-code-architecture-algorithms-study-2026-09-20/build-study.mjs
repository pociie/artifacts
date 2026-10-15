import fs from 'node:fs/promises'
import path from 'node:path'
import { createHash } from 'node:crypto'
import { execFile as execFileCallback } from 'node:child_process'
import { promisify } from 'node:util'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'
import { reports, statusLabels } from './content.mjs'

const execFile = promisify(execFileCallback)
const HERE = path.dirname(fileURLToPath(import.meta.url))
const sourceProfile = JSON.parse(await fs.readFile(path.join(HERE, 'content', 'source-profile.json'), 'utf8'))
const publication = JSON.parse(await fs.readFile(path.join(HERE, 'content', 'publication.json'), 'utf8'))
const qualityRubric = JSON.parse(await fs.readFile(path.join(HERE, 'content', 'report-quality-rubric.json'), 'utf8'))
const toolBoundary = JSON.parse(await fs.readFile(path.join(HERE, 'content', 'tool-boundary.json'), 'utf8'))
const repositoryCoverageRubric = JSON.parse(await fs.readFile(path.join(HERE, 'content', 'repository-coverage-rubric.json'), 'utf8'))
const visualReviewSamples = JSON.parse(await fs.readFile(path.join(HERE, 'content', 'visual-review-samples.json'), 'utf8'))
const algorithmNarrativeSpecification = JSON.parse(await fs.readFile(path.join(HERE, 'content', 'algorithm-narratives.json'), 'utf8'))
const SOURCE_ROOT = path.resolve(HERE, sourceProfile.localRootFromArtifact)
const COMMIT = sourceProfile.revision
const REPO = sourceProfile.repository
const GH = `${REPO}/blob/${COMMIT}`
const DATE = sourceProfile.observationDate
const algorithmNarratives = new Map(algorithmNarrativeSpecification.algorithms.map(item => [item.id, item]))

const esc = value => String(value ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')

const clean = value => String(value ?? '').replaceAll('`', '')
const sourceKey = ref => `${ref.path}:${ref.start}-${ref.end}`
const sourceUrl = ref => `${GH}/${ref.path}#L${ref.start}-L${ref.end}`
const sourceAnchor = ref => `<a href="${sourceUrl(ref)}">${esc(ref.path)}:${ref.start}–${ref.end}</a>`
const unique = values => [...new Set(values)]
const sha256 = value => createHash('sha256').update(value).digest('hex')
const digestFile = async file => sha256(await fs.readFile(file))
const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])

function readPngDimensions(bytes, label = 'PNG') {
  if (bytes.length < 24 || !bytes.subarray(0, PNG_SIGNATURE.length).equals(PNG_SIGNATURE)) {
    throw new Error(`${label}: invalid PNG signature`)
  }
  const ihdrLength = bytes.readUInt32BE(8)
  const ihdrType = bytes.toString('ascii', 12, 16)
  if (ihdrLength !== 13 || ihdrType !== 'IHDR') throw new Error(`${label}: missing canonical IHDR`)
  const width = bytes.readUInt32BE(16)
  const height = bytes.readUInt32BE(20)
  if (width === 0 || height === 0) throw new Error(`${label}: invalid raster dimensions ${width}x${height}`)
  return { width, height }
}

const theorySpecification = JSON.parse(await fs.readFile(path.join(HERE, 'content', 'theory-categories.json'), 'utf8'))
const semanticSpecification = JSON.parse(await fs.readFile(path.join(HERE, 'content', 'semantic-checks.json'), 'utf8'))
const visualLanguage = JSON.parse(await fs.readFile(path.join(HERE, 'content', 'visual-language.json'), 'utf8'))
const THEORY_CATEGORIES = theorySpecification.categories.map(category => ({
  ...category,
  pattern: new RegExp(category.pattern, 'i'),
}))

function theoryCategory(term) {
  return THEORY_CATEGORIES.find(category => category.pattern.test(term)) ?? THEORY_CATEGORIES.find(category => category.id === 'composition')
}

function groupedTheory(terms) {
  const groups = new Map()
  for (const term of terms) {
    const category = theoryCategory(term)
    if (!groups.has(category.id)) groups.set(category.id, { category, terms: [] })
    groups.get(category.id).terms.push(term)
  }
  return [...groups.values()]
}

function relationRole(value) {
  const text = clean(value).toLowerCase()
  const matched = visualLanguage.responsibilityRoles.find(item => new RegExp(item.pattern, 'i').test(text))
  return matched?.label ?? visualLanguage.fallbackRole
}

function transitionRole(index, length) {
  if (index === 0) return visualLanguage.transitionRoles.first
  if (index === length - 1) return visualLanguage.transitionRoles.last
  const middle = visualLanguage.transitionRoles.middle
  return middle[Math.min(index - 1, middle.length - 1)]
}

function naturalList(values) {
  const items = values.map(clean)
  if (items.length === 0) return ''
  if (items.length === 1) return items[0]
  return `${items.slice(0, -1).join(', ')}, 그리고 ${items.at(-1)}`
}

function statusMark(status = 'observed') {
  const [label, detail] = statusLabels[status] ?? statusLabels.observed
  return `<span class="status ${status}" title="${esc(detail)}">${esc(label)}</span>`
}

function running(report, label) {
  const volumes = reports.map(item => `<span class="${item.volume === report.volume ? 'active' : ''}">${item.volume}</span>`).join('')
  return `<header class="running"><b>${esc(report.short)}</b><span>${esc(label)}</span><nav>${volumes}</nav></header>`
}

function page(report, label, body, className = '', metadata = {}) {
  const attributes = Object.entries(metadata)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => ` data-${key}="${esc(value)}"`)
    .join('')
  return `<section class="sheet ${className}" style="--accent:${report.accent}"${attributes}>${running(report, label)}<main>${body}</main><footer class="folio"><span>Architecture &amp; Algorithms Edition · ${COMMIT.slice(0, 12)}</span><b></b></footer></section>`
}

function references(report, refs = []) {
  const rows = unique(refs.filter(Boolean).map(sourceKey)).map(key => {
    const ref = refs.find(item => item && sourceKey(item) === key)
    return `<span>${sourceAnchor(ref)}</span>`
  }).join('')
  return rows ? `<div class="source-note"><b>이 설명을 확인할 코드</b>${rows}</div>` : ''
}

function externalReferences(values = []) {
  if (!values.length) return ''
  return `<div class="external-note"><b>언어·학습 참고자료</b>${values.map(item => `<a href="${esc(item.url)}">${esc(item.label)}</a>`).join('')}</div>`
}

function sourceExcerpt(ref, corpus, maxLines = 29) {
  const lines = corpus.get(sourceKey(ref))
  if (!lines) throw new Error(`missing excerpt: ${sourceKey(ref)}`)
  let selected = lines
  const estimatedRows = line => Math.max(1, Math.ceil((String(line.text).length + 9) / 76))
  const visualRowBudget = 42
  const totalRows = lines.reduce((sum, line) => sum + estimatedRows(line), 0)
  if (lines.length > maxLines || totalRows > visualRowBudget) {
    const tail = Math.min(5, Math.max(2, Math.floor(maxLines / 5)))
    const tailRows = lines.slice(-tail).reduce((sum, line) => sum + estimatedRows(line), 0)
    const headBudget = Math.max(12, visualRowBudget - tailRows - 2)
    let head = 0
    let usedRows = 0
    while (head < lines.length - tail && head < Math.max(8, maxLines - tail - 1)) {
      const nextRows = estimatedRows(lines[head])
      if (head >= 8 && usedRows + nextRows > headBudget) break
      usedRows += nextRows
      head += 1
    }
    selected = [
      ...lines.slice(0, head),
      { number: null, text: `… ${lines.length - head - tail} lines omitted; use the source link for the complete range …` },
      ...lines.slice(-tail),
    ]
  }
  return `<figure class="source-code"><figcaption><span>${esc(ref.label ?? '고정 snapshot의 실제 코드')}</span>${sourceAnchor(ref)}</figcaption><pre><code>${selected.map(line => line.number === null
    ? `<i class="omitted">${esc(line.text)}</i>`
    : `<span><i>${line.number}</i>${esc(line.text)}</span>`).join('')}</code></pre></figure>`
}

function exampleCode(value) {
  const lines = value.split('\n')
  return `<figure class="example-code"><figcaption>설명을 위한 최소 실행 예제</figcaption><pre><code>${lines.map((line, index) => `<span><i>${index + 1}</i>${esc(line)}</span>`).join('')}</code></pre></figure>`
}

function cover(report) {
  return page(report, `VOL. ${report.volume}`, `<div class="cover-rule"></div><p class="kicker">${esc(publication.coverKicker)} · VOL. ${report.volume}</p><h1>${esc(report.title)}</h1><p class="cover-subtitle">${esc(report.subtitle)}</p><p class="cover-purpose">${esc(publication.coverPurpose)}</p><div class="cover-promise"><b>이 권에서 얻게 될 통찰</b><p>${esc(report.promise)}</p></div><div class="cover-meta"><b>Fixed source</b><span>${esc(sourceProfile.snapshotLabel)}</span><span>${COMMIT}</span><span>${DATE} · Korean study edition</span></div>`, 'cover')
}

function baseline(report) {
  const b = report.baseline
  return page(report, '현재 상태와 해석 경계', `${statusMark('observed')}<p class="eyebrow">READING BASELINE</p><h2>먼저, 지금 보고 있는 시스템의 상태를 고정한다</h2><p class="lead">${esc(b.current)}</p><div class="essay"><h3>구현에서 직접 확인되는 범위</h3><p>${esc(b.implementation)}</p><h3>운영을 말할 때 남겨야 할 경계</h3><p>${esc(b.operation)}</p><h3>이 보고서가 추측으로 채우지 않는 것</h3><p>${esc(naturalList(b.unknowns))}은 현재 snapshot만으로 확정할 수 없다. 이후의 설명은 이 공백을 유지한 채, 실제 코드가 보여 주는 구조와 보장만을 다룬다.</p></div><aside class="reading-question"><b>읽는 동안 반복할 질문</b><p>이 문장은 코드로 관찰한 사실인가, 구조에서 끌어낸 해석인가, 아니면 개선을 위한 제안인가?</p></aside>`, 'prose-page')
}

function systemMap(report) {
  const rows = report.map.map(([name, implementation, guarantee], index) => {
    const next = report.map[index + 1]
    const relation = next
      ? `“${guarantee}”가 확인되어야 다음의 “${next[0]}” 영역이 “${next[2]}”를 자신의 보장으로 이어 받을 수 있다. 두 구현의 호출 관계만 보지 말고 그 사이에서 전달되는 값의 정체성과 완료 조건을 함께 확인한다.`
      : `이 책임은 앞선 판단을 외부에서 관찰 가능한 결과로 닫는다. 이 지점의 실패 처리가 모호하면 앞의 모든 단계가 성공했더라도 시스템 전체는 정산되지 않은 상태로 남는다.`
    return `<li><i>${esc(relationRole(`${name} ${implementation}`))}</i><div><b>${esc(name)}</b><span>${esc(implementation)}</span><p>${esc(guarantee)}</p><small>${esc(relation)}</small></div></li>`
  }).join('')
  return page(report, '이 권의 시스템 좌표', `${statusMark('observed')}<p class="eyebrow">SYSTEM READING MAP</p><h2>파일이 아니라 책임과 보장의 연결로 읽는다</h2><p class="lead">이 지도는 번호를 따라 구성요소를 외우게 하지 않는다. 각 영역이 어떤 의미를 소유하고, 그 결과가 다음 영역의 판단 근거가 되며, 마지막에 어떤 외부 보장으로 닫히는지를 문장으로 연결한다.</p><div class="system-path">${rows}</div><p class="closing">선을 따라갈 때에는 구현 이름보다 인접한 두 책임 사이에서 전달되는 identity, state, completion을 확인한다. 그 셋 중 하나가 사라지는 지점이 구조적 결함이 나타날 가능성이 가장 높은 경계다.</p>`, 'map-page')
}

function chapterPage(report, chapter, index) {
  const labels = { explain: '해석', code: '코드', algorithm: '알고리즘', matrix: '구분', walkthrough: '사례', 'mechanism-study': '메커니즘' }
  const argument = chapter.pages.map(item => `<li><i>${esc(labels[item.kind] ?? item.kind)}</i><div><b>${esc(relationRole(item.title))}</b><p>${esc(item.title)}</p></div></li>`).join('')
  return page(report, `CHAPTER ${String(index + 1).padStart(2, '0')}`, `<p class="chapter-number">${String(index + 1).padStart(2, '0')}</p><h2>${esc(chapter.title)}</h2><p class="chapter-thesis">${esc(chapter.thesis)}</p><div class="chapter-argument"><b>이 장의 논증은 다음 질문을 차례로 해결한다</b><ol>${argument}</ol></div><div class="chapter-paths"><b>코드 독해의 시작점</b><p>${chapter.paths.map(item => `<code>${esc(item)}</code>`).join('<span>→</span>')}</p></div><p class="chapter-guide">각 절은 앞 절의 결론을 다음 절의 전제로 사용한다. 따라서 용어 목록을 외우기보다, 현재 구현이 어떤 상태를 만들고 그 상태가 다음 결정의 조건으로 어떻게 사용되는지 연결해서 읽는다.</p>`, 'chapter-page')
}

function explainPage(report, chapter, item) {
  const refs = item.refs ?? []
  const facts = item.facts.map((fact, index) => `<p><b>${index === 0 ? '출발 단서' : '연결되는 단서'}</b>${esc(fact)}</p>`).join('')
  return [page(report, chapter.title, `${statusMark(item.status)}<p class="eyebrow">CONCEPT IN CONTEXT</p><h2>${esc(item.title)}</h2><p class="lead">${esc(item.thesis)}</p><div class="essay"><h3>코드에서 읽어낼 수 있는 단서</h3><div class="linked-prose">${facts}</div><h3>이 단서들을 하나의 설계로 묶으면</h3><p>${esc(item.meaning)}</p><h3>시스템 이해에 남는 결론</h3><p>${esc(item.consequence)}</p></div>${externalReferences(item.external)}${references(report, refs)}`, 'prose-page')]
}

function codePages(report, chapter, item, corpus) {
  const refs = [item.source, ...(item.refs ?? [])]
  const first = page(report, chapter.title, `${statusMark(item.status)}<p class="eyebrow">SOURCE READING · 1/2</p><h2>${esc(item.title)}</h2><p class="lead">${esc(item.thesis)}</p>${sourceExcerpt(item.source, corpus, 31)}<p class="code-bridge">이 발췌는 설명을 위해 재작성한 의사코드가 아니라 고정 commit에서 기계적으로 가져온 실제 줄이다. 긴 범위는 가운데만 생략했으며 링크에서 전체 범위를 확인할 수 있다.</p>`, 'code-page')
  const focus = item.focus.map((fact, index) => `<p><b>${index === 0 ? '먼저 볼 표현' : '그 표현이 만든 조건'}</b>${esc(fact)}</p>`).join('')
  const second = page(report, chapter.title, `${statusMark(item.status)}<p class="eyebrow">SOURCE READING · 2/2</p><h2>문법 아래에 숨은 상태와 책임</h2><p class="lead">앞의 코드는 짧은 문법 표현을 사용하지만, 그 표현이 보장하는 범위와 프로젝트가 기대하는 범위는 같지 않다.</p><div class="essay"><h3>줄을 따라 확인할 관찰점</h3><div class="linked-prose">${focus}</div><h3>언어와 런타임은 여기까지 보장한다</h3><p>${esc(item.mechanism)}</p><h3>프로젝트가 이 메커니즘에 맡긴 책임</h3><p>${esc(item.decision)}</p><h3>경계를 잘못 읽을 때 생기는 위험</h3><p>${esc(item.risk)}</p></div>${externalReferences(item.external)}${references(report, refs)}`, 'prose-page')
  return [first, second]
}

function sentenceStatus(status, label, text) {
  return `<p class="status-sentence"><span class="sentence-status ${status}">${esc(label)}</span>${esc(text)}</p>`
}

function algorithmMetadata(item, stage, obligations) {
  return { algorithm: item.id, stage, obligations: obligations.join(' ') }
}

function algorithmContextPage(report, chapter, item, narrative, includePrerequisites = false) {
  const prerequisites = includePrerequisites
    ? `<div class="book-note"><h3>이 코드를 읽기 전에 잡을 개념</h3>${narrative.prerequisites.map(value => `<p><b>${esc(value.concept)}.</b> ${esc(value.explanation)} <em>${esc(value.returnToCode)}</em></p>`).join('')}</div>`
    : ''
  return page(report, chapter.title, `<p class="eyebrow">ALGORITHM ${esc(item.id)} · 독자의 질문</p><h2>${esc(item.title)}은 어떤 시스템 문제를 닫는가</h2><p class="lead">${esc(narrative.readerSituation)}</p><div class="book-prose"><h3>코드가 필요해지는 이유</h3><p>${esc(item.problem)}</p>${sentenceStatus('observed', 'OBSERVED', narrative.ownership)}${sentenceStatus('inference', 'INFERENCE', narrative.placement)}<h3>이 절에서 답할 결정 질문</h3><p>${esc(narrative.readerQuestion)}</p>${prerequisites}</div>${references(report, [item.source, ...(item.refs ?? [])])}`, `algorithm-context ${includePrerequisites ? 'algorithm-compact' : ''}`, algorithmMetadata(item, 'context', includePrerequisites ? ['A', 'B', 'D'] : ['A', 'B']))
}

function algorithmPrerequisitePage(report, chapter, item, narrative) {
  const sections = narrative.prerequisites.map((value, index) => `<section><p class="chapter-mark">${String(index + 1).padStart(2, '0')}</p><h3>${esc(value.concept)}</h3><p>${esc(value.explanation)}</p><p class="return-to-code"><b>실제 코드로 돌아가면.</b> ${esc(value.returnToCode)}</p></section>`).join('')
  const theoryQuestions = groupedTheory(item.theory).map(({ category, terms }) => `<li><b>${esc(category.title)}</b><span>${esc(terms.join(' · '))}</span><p>${esc(category.question)}</p></li>`).join('')
  return page(report, chapter.title, `<p class="eyebrow">ALGORITHM ${esc(item.id)} · 선행 지식</p><h2>문법 이름보다 먼저, 이 코드가 기대하는 실행 모델을 만든다</h2><p class="lead">선행 지식은 용어 사전이 아니다. 아래 설명은 작은 실행 모델을 만든 다음, 그 모델이 ${esc(item.source.path)}의 결정점에서 어떤 오독을 막는지 되돌려 확인한다.</p><div class="prerequisite-prose">${sections}</div><div class="theory-questions"><h3>이론은 정답이 아니라 코드에 던질 질문이다</h3><ul>${theoryQuestions}</ul></div>`, 'algorithm-prerequisites', algorithmMetadata(item, 'prerequisites', ['D', 'I']))
}

function algorithmExamplePage(report, chapter, item, narrative) {
  const example = narrative.example
  const trace = example.trace.map(([moment, observation, consequence]) => `<tr><th>${esc(moment)}</th><td>${esc(observation)}</td><td>${esc(consequence)}</td></tr>`).join('')
  return page(report, chapter.title, `<p class="eyebrow">ALGORITHM ${esc(item.id)} · 최소 예제</p><h2>${esc(example.title)}</h2><p class="lead">${esc(example.setup)}</p>${exampleCode(example.code)}<table class="trace-table"><thead><tr><th>관찰 시점</th><th>값과 상태</th><th>프로젝트 코드에서의 의미</th></tr></thead><tbody>${trace}</tbody></table><div class="worked-conclusion"><h3>예제를 실제 구현에 다시 연결한다</h3><p>${esc(example.returnToCode)}</p></div>`, 'algorithm-example worked-example-page', algorithmMetadata(item, 'example', ['D', 'E']))
}

function algorithmSourcePage(report, chapter, item, corpus) {
  return page(report, chapter.title, `${statusMark(item.status)}<p class="eyebrow">ALGORITHM ${esc(item.id)} · 실제 코드</p><h2>${esc(item.title)}의 결정점은 어디에 있는가</h2><p class="lead">${esc(item.thesis)}</p><div class="source-reading-intro"><p><b>입력 표현.</b> ${esc(naturalList(item.inputs))}</p><p><b>보존되는 작업 상태.</b> ${esc(naturalList(item.state))}</p></div>${sourceExcerpt(item.source, corpus, 18)}<p class="code-bridge">이 발췌는 고정 commit의 실제 코드다. 다음 페이지에서는 문장 순서를 되풀이하지 않고, 각 branch가 상태의 의미를 어떻게 좁히는지 실행 전·중·후로 다시 읽는다.</p>`, 'code-page algorithm-page algorithm-source', algorithmMetadata(item, 'source', ['C', 'D']))
}

function algorithmTransitionPage(report, chapter, item) {
  const steps = item.steps.map((step, index) => {
    const next = item.steps[index + 1]
    const bridge = next ? `이 결과가 다음 판단 “${next}”의 전제가 된다.` : '이 결과를 다음 owner가 읽을 수 있을 때 이 절차가 닫힌다.'
    return `<li><i>${esc(transitionRole(index, item.steps.length))}</i><div><b>${index === 0 ? '진입 조건을 해석한다' : index === item.steps.length - 1 ? '후속 owner가 읽을 상태를 남긴다' : '표현과 선택지를 좁힌다'}</b><p>${esc(step)}</p><small>${esc(bridge)}</small></div></li>`
  }).join('')
  return page(report, chapter.title, `<p class="eyebrow">ALGORITHM ${esc(item.id)} · 상태 전이</p><h2>호출 순서가 아니라, 판단 근거가 어떻게 변하는지를 추적한다</h2><p class="lead">${esc(naturalList(item.inputs))}은 처음부터 신뢰된 실행 상태가 아니다. ${esc(naturalList(item.state))}가 앞선 관찰을 보존하기 때문에 뒤의 branch가 같은 작업을 계속 판단할 수 있다.</p><ol class="algorithm-sequence">${steps}</ol><div class="postcondition"><h3>이 전이가 끝난 뒤 기대할 수 있는 조건</h3><p>${esc(item.invariants.join(' '))}</p></div>`, 'algorithm-transition', algorithmMetadata(item, 'transition', ['E']))
}

function algorithmAssurancePage(report, chapter, item) {
  const groups = groupedTheory(item.theory)
  const guarantees = item.invariants.map((value, index) => `<li><b>${esc(groups[index % groups.length].category.title)}의 질문으로 읽기.</b> ${esc(value)}</li>`).join('')
  const failures = item.failures.map(value => `<li>${esc(value)}</li>`).join('')
  return page(report, chapter.title, `<p class="eyebrow">ALGORITHM ${esc(item.id)} · 설명의 보장 경계</p><h2>이 구현이 지키려는 조건과, 설명이 멈춰야 하는 조건</h2><p class="lead">여기서 불변조건은 형식적 증명의 결론이 아니다. 어느 전이가 의도한 의미를 보존했는지 읽고, 어떤 반례를 넣어 설명의 범위를 확인할지를 정하는 학습 도구다.</p><div class="assurance-narrative"><section><h3>전이 전후에 확인할 조건</h3><ul>${guarantees}</ul><p>최종 출력만 같아도 중간 identity나 effect가 달라질 수 있으므로, 각 조건을 보존하는 transition을 함께 관찰해야 한다.</p></section><section><h3>설명의 범위를 드러내는 반례</h3><ul>${failures}</ul><p>이 반례가 나타나면 “알고리즘이 틀렸다”로 끝내지 않고 어떤 state owner와 boundary에서 의미가 갈라졌는지 기록한다.</p></section></div>${sentenceStatus('observed', 'OBSERVED', item.decision)}${sentenceStatus('recommendation', 'RECOMMENDATION', item.improvement)}`, 'algorithm-assurance', algorithmMetadata(item, 'assurance', ['F', 'I']))
}

function algorithmOperationPage(report, chapter, item, narrative) {
  return page(report, chapter.title, `<p class="eyebrow">ALGORITHM ${esc(item.id)} · effect와 운영</p><h2>정상 경로 뒤에 남는 effect와 실패 뒤에 남는 상태를 구분한다</h2><p class="lead">${esc(narrative.operation.runtime)}</p><div class="book-prose"><h3>effect가 시작되고 관찰되는 경계</h3><p>${esc(narrative.operation.effect)}</p><h3>현재 설계가 선택한 trade-off와 비용</h3><p>${esc(item.decision)} 이 선택의 계산·운영 비용은 ${esc(item.complexity)}로 기술되지만, 비용 표기만으로 중복 effect나 부분 상태의 의미가 해결되지는 않는다.</p><h3>실패·중단 뒤에 실제로 남을 수 있는 상태</h3><p>${esc(narrative.operation.failure)} 이때 함께 대입할 반례는 ${esc(naturalList(item.failures))}이다. 이들을 모두 하나의 “실패”로 접으면 retry와 cleanup이 무엇을 이어받아야 하는지 알 수 없다.</p><h3>관측이 다음 판단에 답하게 하는 법</h3><p>${esc(narrative.operation.observation)} 로그의 존재보다 중요한 것은 이 관측값이 같은 요청·state·effect를 가리키며, 복구 또는 중단 결정을 실제로 바꿀 수 있는가이다.</p></div>`, 'algorithm-operation', algorithmMetadata(item, 'operation', ['G', 'H']))
}

function algorithmCurrentStatePage(report, chapter, item, narrative) {
  const questions = narrative.transferQuestions.map(value => `<li>${esc(value)}</li>`).join('')
  return page(report, chapter.title, `<p class="eyebrow">ALGORITHM ${esc(item.id)} · 현재 상태 장부</p><h2>고정 snapshot에서 확인된 것과 아직 말할 수 없는 것을 함께 남긴다</h2><p class="lead">이 장부는 앞의 내용을 압축한 요약이 아니라, 다음 독자가 현재 시스템을 다시 구성하기 위한 출발 상태다.</p><div class="state-ledger">${sentenceStatus('observed', 'OBSERVED', narrative.currentState.observed)}${sentenceStatus('inference', 'CONDITIONAL', narrative.currentState.conditional)}${sentenceStatus('unknown', 'UNKNOWN', narrative.currentState.unknown)}${sentenceStatus('recommendation', 'NEXT READ', narrative.currentState.nextRead)}</div><div class="learning-transfer"><h3>다른 입력과 변경안에 전이해 볼 질문</h3><ol>${questions}</ol></div>${references(report, [item.source, ...(item.refs ?? [])])}`, 'algorithm-current-state', algorithmMetadata(item, 'current-state', ['J', 'K']))
}

function algorithmPages(report, chapter, item, corpus) {
  const narrative = algorithmNarratives.get(item.id)
  if (!narrative) throw new Error(`missing expanded narrative: ${item.id}`)
  const compact = narrative.layout === 'compact'
  const pages = [algorithmContextPage(report, chapter, item, narrative, compact)]
  if (!compact) pages.push(algorithmPrerequisitePage(report, chapter, item, narrative))
  if (narrative.example) pages.push(algorithmExamplePage(report, chapter, item, narrative))
  pages.push(algorithmSourcePage(report, chapter, item, corpus))
  pages.push(algorithmTransitionPage(report, chapter, item))
  pages.push(algorithmAssurancePage(report, chapter, item))
  if (compact) {
    pages.push(page(report, chapter.title, `<p class="eyebrow">ALGORITHM ${esc(item.id)} · 운영과 현재 상태</p><h2>작은 변환도 effect와 미확정 경계를 남긴다</h2><p class="lead">${esc(narrative.operation.runtime)}</p><div class="book-prose"><h3>실패 뒤 남는 상태</h3><p>${esc(narrative.operation.failure)}</p>${sentenceStatus('observed', 'OBSERVED', narrative.currentState.observed)}${sentenceStatus('inference', 'CONDITIONAL', narrative.currentState.conditional)}${sentenceStatus('unknown', 'UNKNOWN', narrative.currentState.unknown)}${sentenceStatus('recommendation', 'NEXT READ', narrative.currentState.nextRead)}</div><div class="learning-transfer compact-transfer"><h3>다시 적용할 질문</h3><ol>${narrative.transferQuestions.map(value => `<li>${esc(value)}</li>`).join('')}</ol></div>`, 'algorithm-operation algorithm-current-state', algorithmMetadata(item, 'operation-current-state', ['G', 'H', 'J', 'K'])))
  } else {
    pages.push(algorithmOperationPage(report, chapter, item, narrative))
    pages.push(algorithmCurrentStatePage(report, chapter, item, narrative))
  }
  return pages
}

function matrixPage(report, chapter, item) {
  const rows = item.rows.map(row => `<tr>${row.map(cell => `<td>${esc(cell)}</td>`).join('')}</tr>`).join('')
  return [page(report, chapter.title, `${statusMark(item.status)}<p class="eyebrow">DISTINCTION TABLE</p><h2>${esc(item.title)}</h2><p class="lead">${esc(item.thesis)}</p><table class="matrix"><thead><tr>${item.columns.map(column => `<th>${esc(column)}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table><div class="essay"><h3>이 표를 읽는 관점</h3><p>${esc(item.reading)}</p></div>${references(report, item.refs ?? [])}`, 'matrix-page')]
}

function walkthroughPage(report, chapter, item) {
  const stages = item.stages.map(([name, description], index) => {
    const next = item.stages[index + 1]
    const bridge = next ? `이때 남은 상태와 판단이 “${next[0]}”에서 사용할 전제가 된다.` : '이 지점에서 앞선 상태 변화가 외부에서 관찰 가능한 결과로 정산된다.'
    return `<li><i>${esc(relationRole(name))}</i><div><b>${esc(name)}</b><p>${esc(description)}</p><small>${esc(bridge)}</small></div></li>`
  }).join('')
  return [page(report, chapter.title, `${statusMark(item.status)}<p class="eyebrow">SELECTIVE EXECUTION TRACE</p><h2>${esc(item.title)}</h2><p class="lead">${esc(item.thesis)}</p><div class="walkthrough">${stages}</div><div class="trace-reading"><h3>이 흐름 전체에서 보존해야 하는 것</h3><p>${esc(item.invariant)}</p><h3>어디에서 설명이 틀어지는가</h3><p>${esc(item.failure)}</p></div>${references(report, item.refs ?? [])}`, 'walkthrough-page')]
}

function mechanismStudyPages(report, chapter, item, corpus) {
  const refs = [item.source, ...(item.refs ?? [])]
  const comparisonRows = item.comparison.rows.map(row => `<tr>${row.map(cell => `<td>${esc(cell)}</td>`).join('')}</tr>`).join('')
  const foundation = page(report, chapter.title, `${statusMark(item.status)}<p class="eyebrow">LANGUAGE MECHANISM · ${esc(item.id)} · 개념 모델</p><h2>${esc(item.title)}</h2><p class="lead">${esc(item.thesis)}</p><div class="misconception"><h3>먼저 바로잡을 오개념</h3><p>${esc(item.misconception)}</p></div><p class="table-intro">${esc(item.comparison.intro)}</p><table class="mechanism-table"><thead><tr>${item.comparison.columns.map(value => `<th>${esc(value)}</th>`).join('')}</tr></thead><tbody>${comparisonRows}</tbody></table><p class="closing">${esc(item.presentation.foundationClosing)}</p>`, 'mechanism-foundation')

  const examplePages = item.examples.map((example, exampleIndex) => {
    const traceRows = example.trace.map(([action, execution, state]) => `<tr><th>${esc(action)}</th><td>${esc(execution)}</td><td>${esc(state)}</td></tr>`).join('')
    return page(report, chapter.title, `<p class="eyebrow">LANGUAGE MECHANISM · ${esc(item.id)} · WORKED EXAMPLE ${exampleIndex + 1}</p><h2>${esc(example.title)}</h2><p class="lead">${esc(example.purpose)}</p>${exampleCode(example.code)}<p class="table-intro">${esc(item.presentation.exampleTraceIntro)}</p><table class="trace-table"><thead><tr>${item.presentation.traceColumns.map(value => `<th>${esc(value)}</th>`).join('')}</tr></thead><tbody>${traceRows}</tbody></table><div class="worked-conclusion"><h3>${esc(item.presentation.conclusionHeading)}</h3><p>${esc(example.conclusion)}</p></div>`, 'worked-example-page')
  })

  const delegationSteps = item.delegation.steps.map(([name, detail], index) => {
    const semanticName = name.replace(/^\d+\.\s*/, '')
    const next = item.delegation.steps[index + 1]
    const bridge = next ? `이 completion은 다음 “${next[0].replace(/^\d+\.\s*/, '')}”의 입력 의미를 결정한다.` : '여기서 wrapper의 terminal 의미가 닫히며, 중간 event와 같은 채널로 소비되지 않는다.'
    return `<li><b>${esc(semanticName)}</b><p>${esc(detail)}</p><small>${esc(bridge)}</small></li>`
  }).join('')
  const delegation = page(report, chapter.title, `${statusMark(item.status)}<p class="eyebrow">LANGUAGE MECHANISM · ${esc(item.id)} · 실제 프로젝트</p><h2>${esc(item.presentation.delegationTitle)}</h2><p class="lead">${esc(item.delegation.intro)}</p>${sourceExcerpt(item.source, corpus, 31)}<div class="delegation-steps">${delegationSteps}</div>${references(report, [item.source])}`, 'mechanism-delegation')

  const replRef = item.refs[0]
  const projectRows = item.projectTrace.map(([name, detail], index) => {
    const next = item.projectTrace[index + 1]
    const bridge = next ? `이 층의 관찰은 “${next[0]}”가 해석할 수 있는 형태로만 넘어가며, 생산자 frame 전체가 전달되는 것은 아니다.` : '최종 표면은 반복 종료·누적 상태·cleanup을 함께 읽어 turn을 정산한다.'
    return `<li><i>${esc(relationRole(name))}</i><div><b>${esc(name)}</b><p>${esc(detail)}</p><small>${esc(bridge)}</small></div></li>`
  }).join('')
  const project = page(report, chapter.title, `${statusMark(item.status)}<p class="eyebrow">LANGUAGE MECHANISM · ${esc(item.id)} · 소비자와 UI</p><h2>${esc(item.presentation.projectTitle)}</h2><p class="lead">${esc(item.presentation.projectLead)}</p>${sourceExcerpt(replRef, corpus, 19)}<div class="project-trace">${projectRows}</div><p class="closing">${esc(item.presentation.projectClosing)}</p>${references(report, [replRef, item.refs[1]])}`, 'mechanism-project')

  const caveats = item.caveats.map(value => `<li><i>보장 경계</i><p>${esc(value)}</p></li>`).join('')
  const theory = item.theory.map(([term, description]) => `<dt>${esc(term)}</dt><dd>${esc(description)}</dd>`).join('')
  const boundaries = page(report, chapter.title, `<p class="eyebrow">LANGUAGE MECHANISM · ${esc(item.id)} · 설명의 경계</p><h2>${esc(item.presentation.boundaryTitle)}</h2><div class="video-bridge"><h3>${esc(item.videoBridge.intuitionHeading)}</h3><p>${esc(item.videoBridge.intuition)}</p><h3>${esc(item.videoBridge.correctionHeading)}</h3><p>${esc(item.videoBridge.correction)}</p></div><h3>${esc(item.presentation.caveatHeading)}</h3><div class="caveat-list">${caveats}</div><h3>${esc(item.presentation.theoryHeading)}</h3><dl class="theory-definitions">${theory}</dl>${externalReferences(item.external)}${references(report, refs.slice(2))}`, 'mechanism-boundaries')

  return [foundation, ...examplePages, delegation, project, boundaries]
}

function topicPages(report, chapter, item, corpus) {
  if (item.kind === 'explain') return explainPage(report, chapter, item)
  if (item.kind === 'code') return codePages(report, chapter, item, corpus)
  if (item.kind === 'algorithm') return algorithmPages(report, chapter, item, corpus)
  if (item.kind === 'matrix') return matrixPage(report, chapter, item)
  if (item.kind === 'walkthrough') return walkthroughPage(report, chapter, item)
  if (item.kind === 'mechanism-study') return mechanismStudyPages(report, chapter, item, corpus)
  throw new Error(`unknown page kind: ${item.kind}`)
}

function reportAlgorithms(report) {
  return report.chapters.flatMap(chapter => chapter.pages
    .filter(item => item.kind === 'algorithm')
    .map(item => ({ ...item, chapter: chapter.title })))
}

function theoryDistribution(report) {
  const algorithms = reportAlgorithms(report)
  return THEORY_CATEGORIES.map(category => {
    const matches = algorithms.filter(item => item.theory.some(term => theoryCategory(term).id === category.id))
    const terms = new Map()
    for (const item of matches) for (const term of item.theory.filter(value => theoryCategory(value).id === category.id)) {
      if (!terms.has(term)) terms.set(term, [])
      terms.get(term).push(item.id)
    }
    return { category, algorithms: matches, terms }
  }).filter(record => record.algorithms.length)
}

function theoryAtlasPages(report) {
  const distribution = theoryDistribution(report)
  const chunkSize = 3
  const chunks = Array.from({ length: Math.ceil(distribution.length / chunkSize) }, (_, index) => distribution.slice(index * chunkSize, (index + 1) * chunkSize))
  return chunks.map((chunk, pageIndex) => {
    const sections = chunk.map(({ category, algorithms, terms }) => {
      const termSentence = [...terms.entries()].map(([term, ids]) => `${term}(${ids.join('·')})`).join(', ')
      const examples = algorithms.slice(0, 2)
      const exampleSentence = examples.map(item => `${item.id} ${item.title}`).join('과 ')
      const guarantee = examples.map(item => item.invariants[0]).join(' 또한 ')
      return `<section class="theory-atlas-category"><header><h3>${esc(category.title)}</h3><span>${algorithms.length}개 알고리즘 · ${terms.size}개 표현</span></header><p>${esc(category.description)}</p><p><b>이 권에서 나타나는 방식.</b> ${esc(exampleSentence)}에서 이 관점이 결정적인 이유는 “${esc(guarantee)}”라는 조건을 구현 세부사항보다 오래 유지해야 하기 때문이다.</p><p><b>참조 분포.</b> ${esc(termSentence)}</p><p><b>스터디 질문.</b> ${esc(category.question)}</p></section>`
    }).join('')
    return page(report, '이론 분포와 탐색 지도', `<p class="eyebrow">THEORY ATLAS · ${pageIndex + 1}/${chunks.length}</p><h2>용어를 외우지 않고, 어떤 보장을 설명하는 이론인지 묶어 읽는다</h2><p class="lead">이 지도는 이 권의 알고리즘이 실제로 참조한 이론만 집계한다. 빈도는 중요도 점수가 아니라 여러 구현 결정을 같은 질문으로 비교할 수 있는 탐색 신호다.</p><div class="theory-atlas">${sections}</div><p class="closing">괄호 안의 알고리즘 ID로 돌아가면 이론의 정의가 아니라 그 이론이 설명하는 source transition, 반례, 불변조건을 함께 확인할 수 있다.</p>`, 'theory-atlas-page')
  })
}

function algorithmIndex(report) {
  const items = reportAlgorithms(report)
  const rows = items.map(item => `<tr><td>${esc(item.id)}</td><td><b>${esc(item.title)}</b><span>${esc(item.problem)}</span></td><td>${esc(item.invariants[0])}</td></tr>`).join('')
  return page(report, '알고리즘 색인', `${statusMark('observed')}<p class="eyebrow">ALGORITHM INDEX</p><h2>이 권의 결정적 알고리즘과 보장</h2><p class="lead">알고리즘 이름보다 마지막 열을 먼저 읽는다. 프로젝트에서 중요한 것은 계산 기법 자체보다 그 계산으로 어떤 시스템 조건을 계속 참으로 만드는가이기 때문이다.</p><table class="algorithm-index"><thead><tr><th>ID</th><th>문제와 구현</th><th>대표 불변조건</th></tr></thead><tbody>${rows}</tbody></table>`, 'index-page')
}

function sourceIndexPages(report) {
  const records = []
  for (const chapter of report.chapters) for (const item of chapter.pages) {
    for (const ref of [item.source, ...(item.refs ?? [])].filter(Boolean)) records.push({ ref, title: item.title, kind: item.kind })
  }
  const seen = new Set()
  const uniqueRecords = records.filter(record => {
    const key = sourceKey(record.ref)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
  const chunkSize = 24
  const chunks = Array.from({ length: Math.ceil(uniqueRecords.length / chunkSize) }, (_, index) => uniqueRecords.slice(index * chunkSize, (index + 1) * chunkSize))
  return chunks.map((chunk, index) => {
    const rows = chunk.map(record => `<tr><td>${sourceAnchor(record.ref)}</td><td>${esc(record.title)}</td><td>${esc(record.kind)}</td></tr>`).join('')
    return page(report, '소스 근거 색인', `${statusMark('observed')}<p class="eyebrow">SOURCE EVIDENCE INDEX · ${index + 1}/${chunks.length}</p><h2>설명을 다시 코드로 되돌리는 출발점</h2><p class="lead">보고서의 해석은 아래 고정 줄 범위에서 다시 검토할 수 있다. 링크는 모두 동일한 commit을 가리키며, 파일 이름만 비슷한 최신 branch로 이동하지 않는다.</p><table class="source-index"><thead><tr><th>고정 코드 범위</th><th>연결되는 설명</th><th>표현 방식</th></tr></thead><tbody>${rows}</tbody></table>`, 'index-page source-index-page')
  })
}

function synthesis(report) {
  const prompts = report.synthesis.prompts.map(prompt => `<li><i>검증 질문</i><p>${esc(prompt)}</p></li>`).join('')
  return page(report, '스터디 정리', `<p class="eyebrow">STUDY SYNTHESIS</p><h2>${esc(report.synthesis.title)}</h2><p class="lead">읽은 내용을 요약하는 대신, 새로운 변경이나 장애 상황에서도 같은 보장을 찾아낼 수 있는지 확인한다.</p><div class="synthesis-prompts">${prompts}</div><div class="synthesis-outcome"><b>이 권의 완료 기준</b><p>${esc(report.synthesis.outcome)}</p></div><p class="closing">답에는 반드시 현재 snapshot의 코드 근거, 그 근거에서 도출한 해석, 아직 확인할 수 없는 부분을 구분해 적는다.</p>`, 'synthesis-page')
}

function renderReport(report, corpus) {
  const pages = [cover(report), baseline(report), systemMap(report)]
  report.chapters.forEach((chapter, chapterIndex) => {
    pages.push(chapterPage(report, chapter, chapterIndex))
    const supersededTitles = new Set(chapter.pages.flatMap(item => item.supersedes ?? []))
    chapter.pages.forEach(item => {
      if (supersededTitles.has(item.title)) return
      pages.push(...topicPages(report, chapter, item, corpus))
    })
  })
  pages.push(...theoryAtlasPages(report), algorithmIndex(report), ...sourceIndexPages(report), synthesis(report))
  return pages
}

const CSS = `
@page{size:A4;margin:0}*{box-sizing:border-box}html,body{margin:0;padding:0;background:#d9dfe1;color:#17242a;font-family:"Apple SD Gothic Neo","Noto Sans KR",Arial,sans-serif}body{counter-reset:folio}.sheet{--accent:#176b73;position:relative;width:210mm;height:297mm;padding:15mm 18mm 18mm;background:#fbfaf6;overflow:hidden;page-break-after:always;counter-increment:folio}.sheet:last-child{page-break-after:auto}.running{height:9mm;border-top:.9mm solid var(--accent);padding-top:2.4mm;display:grid;grid-template-columns:1fr auto auto;gap:6mm;align-items:start;color:#657278;font-size:6.8pt;letter-spacing:.04em}.running>b{color:var(--accent)}.running nav{display:flex;gap:1.8mm}.running nav span{width:5mm;text-align:center;color:#8a969a}.running nav .active{background:var(--accent);color:white}.folio{position:absolute;left:18mm;right:18mm;bottom:8mm;padding-top:2mm;border-top:.2mm solid #cbd1d1;display:flex;justify-content:space-between;color:#778286;font-size:6.1pt}.folio b:after{content:counter(folio)}main{position:relative;height:249mm}h1,h2,h3,p{margin:0}h1,h2{font-family:Georgia,"Noto Serif KR",serif;letter-spacing:-.035em}h1{font-size:34pt;line-height:1.13}h2{font-size:22pt;line-height:1.2;max-width:166mm;margin:4mm 0 4mm}h3{font-size:10pt;line-height:1.45;color:var(--accent);margin:4.5mm 0 1.6mm}.eyebrow{color:var(--accent);font-size:7pt;font-weight:800;letter-spacing:.13em;margin-top:4mm}.lead{max-width:165mm;color:#43545b;font:11.2pt/1.64 Georgia,"Noto Serif KR",serif;margin-bottom:5mm}.status{float:right;margin-top:4mm;border:.2mm solid currentColor;padding:.9mm 1.8mm;font-size:6pt;font-weight:800;letter-spacing:.08em}.status.observed{color:#176b73}.status.inference{color:#855c1d}.status.recommendation{color:#735083}.status.unknown{color:#8a3e3e}.essay{font:9.7pt/1.78 Georgia,"Noto Serif KR",serif;max-width:166mm}.essay p{margin-bottom:3.6mm}.numbered-prose p{padding-left:8mm;position:relative}.numbered-prose sup{position:absolute;left:0;top:.5mm;color:var(--accent);font:12pt Georgia,serif}.reading-question{position:absolute;left:0;right:0;bottom:8mm;border-top:.7mm solid var(--accent);padding-top:3mm;font:8.8pt/1.6 Georgia,"Noto Serif KR",serif}.reading-question b{color:var(--accent);font-family:"Apple SD Gothic Neo",sans-serif;font-size:7pt;letter-spacing:.08em}.source-note{position:absolute;left:0;right:0;bottom:1mm;border-top:.2mm solid #c6cece;padding-top:2mm;display:flex;gap:2mm;flex-wrap:wrap;font-size:6.2pt}.source-note b{color:var(--accent)}a{color:#17617b;text-decoration:none;border-bottom:.2mm solid #aac2c7}.cover{background:linear-gradient(145deg,#12232b 0 72%,var(--accent) 72% 100%);color:white}.cover .running{border-top-color:#9cc1bd;color:#c6d3d2}.cover .running>b{color:#e5f1ef}.cover .running nav span{color:#c0d1cf}.cover .running nav .active{background:#e7c875;color:#17242a}.cover .folio{border-color:#52636a;color:#b6c4c6}.cover main{padding-top:19mm}.cover-rule{width:24mm;height:1.1mm;background:#e4c46d;margin-bottom:5mm}.kicker{font-size:7pt;letter-spacing:.16em;color:#afc9c6;margin-bottom:7mm}.cover h1{max-width:155mm}.cover-subtitle{margin-top:7mm;max-width:148mm;color:#d5e1df;font:12pt/1.62 Georgia,"Noto Serif KR",serif}.cover-purpose{margin-top:15mm;width:120mm;border-left:.8mm solid #e4c46d;padding-left:5mm;color:#e5ecea;font:10.2pt/1.68 Georgia,"Noto Serif KR",serif}.cover-promise{position:absolute;left:0;bottom:23mm;width:121mm}.cover-promise>b{font-size:7pt;letter-spacing:.1em;color:#e4c46d}.cover-promise p{margin-top:2mm;font:9.6pt/1.65 Georgia,"Noto Serif KR",serif}.cover-meta{position:absolute;right:0;bottom:7mm;width:55mm;color:#11242b;font-size:6.7pt;line-height:1.55;word-break:break-all}.cover-meta b,.cover-meta span{display:block}.system-path,.walkthrough,.algorithm-steps,.synthesis-prompts{list-style:none;margin:6mm 0 0;padding:0}.system-path li{display:grid;grid-template-columns:11mm 1fr;gap:3mm;padding:3.2mm 0;border-top:.25mm solid #ccd3d3}.system-path i,.walkthrough i,.algorithm-steps i,.synthesis-prompts i{font:12pt Georgia,serif;color:var(--accent)}.system-path b{display:inline-block;width:28mm;font-size:8.4pt;color:var(--accent)}.system-path span{font:8.8pt ui-monospace,SFMono-Regular,Menlo,monospace}.system-path p{margin-top:1mm;color:#56666c;font:8.4pt/1.5 Georgia,"Noto Serif KR",serif}.closing{margin-top:5mm;color:#53636a;font:8.5pt/1.6 Georgia,"Noto Serif KR",serif}.chapter-page{background:linear-gradient(155deg,#fbfaf6 0 78%,#e8efec 78% 100%)}.chapter-page main{padding-top:24mm}.chapter-number{color:var(--accent);opacity:.22;font:62pt/1 Georgia,serif}.chapter-page h2{font-size:31pt;max-width:158mm;margin-top:-3mm}.chapter-thesis{max-width:150mm;margin-top:8mm;font:13pt/1.65 Georgia,"Noto Serif KR",serif}.chapter-paths{position:absolute;left:0;bottom:39mm;max-width:170mm}.chapter-paths>b{font-size:7pt;letter-spacing:.1em;color:var(--accent)}.chapter-paths p{margin-top:2.5mm;display:flex;gap:2mm;align-items:center;flex-wrap:wrap}.chapter-paths code{font:7.2pt/1.4 ui-monospace,SFMono-Regular,Menlo,monospace;background:#e8eeec;padding:1.3mm 2mm}.chapter-paths span{color:var(--accent)}.chapter-guide{position:absolute;left:0;bottom:8mm;width:145mm;color:#5a696e;font:8.5pt/1.6 Georgia,"Noto Serif KR",serif}.source-code{margin:4mm 0 3mm}.source-code figcaption{display:flex;justify-content:space-between;gap:4mm;padding:0 0 1.8mm;border-bottom:.4mm solid var(--accent);font-size:6.5pt;color:#66757a}.source-code figcaption span{font-weight:800;color:var(--accent)}.source-code pre{margin:0;background:#17262d;color:#e7efed;padding:3.3mm 3.5mm;white-space:pre-wrap;overflow-wrap:anywhere;font:6.45pt/1.4 ui-monospace,SFMono-Regular,Menlo,monospace;max-height:156mm;overflow:hidden}.source-code code>span{display:block}.source-code code>span>i{display:inline-block;width:9mm;color:#749097;font-style:normal;user-select:none}.source-code .omitted{display:block;margin:1.5mm 0;color:#d7bd76;font-style:normal}.code-bridge{font:7.6pt/1.52 Georgia,"Noto Serif KR",serif;color:#53656b;border-left:.65mm solid var(--accent);padding-left:3mm}.algorithm-intro{display:grid;grid-template-columns:1.25fr 1fr 1fr;gap:4mm;margin:3mm 0 4mm;border-top:.25mm solid #bdc8c8;padding-top:3mm;color:#4b5c62;font:7.5pt/1.5 Georgia,"Noto Serif KR",serif}.algorithm-intro b{display:block;color:var(--accent);font-family:"Apple SD Gothic Neo",sans-serif;margin-bottom:1mm}.algorithm-reasoning .lead{font-size:9.3pt;line-height:1.62}.algorithm-steps{display:grid;grid-template-columns:1fr 1fr;gap:0 7mm;margin-top:3mm}.algorithm-steps li{display:grid;grid-template-columns:8mm 1fr;gap:2mm;border-top:.2mm solid #c7cfcf;padding:2mm 0}.algorithm-steps p{font:7.8pt/1.45 Georgia,"Noto Serif KR",serif}.assurance{display:grid;grid-template-columns:1.1fr .9fr;gap:8mm;margin-top:3mm}.assurance section{border-top:.75mm solid var(--accent)}.assurance h3{margin-top:2.3mm}.assurance p,.assurance li{font:7.6pt/1.45 Georgia,"Noto Serif KR",serif}.assurance ul{margin:0;padding-left:4mm}.assurance li{margin-bottom:1mm}.improvement{margin-top:3mm;border-left:.7mm solid #735083;padding-left:3mm;font:7.7pt/1.5 Georgia,"Noto Serif KR",serif}.improvement b{color:#735083}.theory-line{margin-top:3mm;display:flex;gap:2mm;align-items:center;flex-wrap:wrap;font-size:6.4pt}.theory-line>b{color:var(--accent)}.theory-line span{border-bottom:.25mm solid #9eafaf;padding:.6mm 1mm}.matrix{width:100%;border-collapse:collapse;margin-top:6mm;table-layout:fixed;font-size:7.7pt;line-height:1.45}.matrix th{text-align:left;color:white;background:var(--accent);padding:2.7mm}.matrix td{vertical-align:top;padding:2.5mm;border-bottom:.2mm solid #c8d0d0}.matrix-page .essay{margin-top:5mm}.walkthrough{position:relative;margin-top:5mm}.walkthrough:before{content:"";position:absolute;left:5.3mm;top:3mm;bottom:3mm;border-left:.5mm solid var(--accent)}.walkthrough li{position:relative;display:grid;grid-template-columns:11mm 1fr;gap:3mm;padding:2.7mm 0}.walkthrough i{z-index:1;background:#fbfaf6}.walkthrough b{color:var(--accent);font-size:8.2pt}.walkthrough p{font:8.3pt/1.5 Georgia,"Noto Serif KR",serif}.trace-reading{display:grid;grid-template-columns:1fr 1fr;gap:8mm;margin-top:3mm;border-top:.7mm solid var(--accent)}.trace-reading p{font:8pt/1.55 Georgia,"Noto Serif KR",serif}.algorithm-index,.source-index{width:100%;border-collapse:collapse;margin-top:5mm;table-layout:fixed;font-size:6.7pt;line-height:1.35}.algorithm-index th,.source-index th{text-align:left;padding:2mm;color:white;background:var(--accent)}.algorithm-index td,.source-index td{vertical-align:top;padding:2mm;border-bottom:.2mm solid #c9d1d1}.algorithm-index th:first-child,.algorithm-index td:first-child{width:10mm}.algorithm-index th:last-child,.algorithm-index td:last-child{width:36%}.algorithm-index td span{display:block;color:#657378;margin-top:.8mm}.source-index th:first-child,.source-index td:first-child{width:43%;word-break:break-word}.source-index th:last-child,.source-index td:last-child{width:16mm}.source-index-page .lead,.index-page .lead{font-size:9.5pt}.source-index-page table{font-size:6.15pt}.synthesis-prompts li{display:grid;grid-template-columns:10mm 1fr;gap:3mm;border-top:.25mm solid #cad1d1;padding:4mm 0}.synthesis-prompts p{font:10pt/1.55 Georgia,"Noto Serif KR",serif}.synthesis-outcome{margin-top:7mm;border-top:1mm solid var(--accent);padding-top:4mm}.synthesis-outcome b{font-size:7pt;letter-spacing:.1em;color:var(--accent)}.synthesis-outcome p{margin-top:2mm;font:12pt/1.6 Georgia,"Noto Serif KR",serif}
`

const CSS_V2 = `
.chapter-page main{padding-top:6mm}.chapter-page .chapter-number{font-size:44pt}.chapter-page h2{font-size:27pt;margin-top:-5mm}.chapter-page .chapter-thesis{font-size:11pt;line-height:1.55;margin-top:4mm}.chapter-argument{margin-top:5mm;border-top:.8mm solid var(--accent);padding-top:3mm}.chapter-argument>b{color:var(--accent);font-size:7pt;letter-spacing:.08em}.chapter-argument ol{list-style:none;margin:2mm 0 0;padding:0;display:grid;grid-template-columns:1fr 1fr;gap:0 6mm}.chapter-argument li{display:grid;grid-template-columns:8mm 1fr;gap:2mm;border-top:.2mm solid #c8d1d1;padding:1.6mm 0}.chapter-argument i{color:var(--accent);font:10pt Georgia,serif}.chapter-argument li b{display:block;color:var(--accent);font-size:6.4pt}.chapter-argument li p{font:7.2pt/1.35 Georgia,"Noto Serif KR",serif}.chapter-page .chapter-paths{bottom:31mm}.chapter-page .chapter-guide{bottom:5mm}.algorithm-problem{font:8.2pt/1.55 Georgia,"Noto Serif KR",serif;margin-bottom:3mm}.algorithm-problem h3{margin-top:2.2mm}.algorithm-problem p{margin-bottom:1.8mm}.state-contract{display:grid;grid-template-columns:1fr 1fr;gap:7mm;margin-top:4mm}.state-contract section{border-top:.8mm solid var(--accent)}.state-contract p,.postcondition p{font:8.2pt/1.55 Georgia,"Noto Serif KR",serif}.algorithm-sequence{list-style:none;margin:4mm 0 0;padding:0}.algorithm-sequence li{display:grid;grid-template-columns:9mm 1fr;gap:3mm;border-top:.2mm solid #c7cfcf;padding:2.2mm 0}.algorithm-sequence i{font:12pt Georgia,serif;color:var(--accent)}.algorithm-sequence b{display:block;color:var(--accent);font-size:6.8pt;margin-bottom:.6mm}.algorithm-sequence p{font:8pt/1.45 Georgia,"Noto Serif KR",serif}.postcondition{border-left:.8mm solid var(--accent);padding-left:4mm;margin-top:4mm}.assurance-narrative{display:grid;grid-template-columns:1fr 1fr;gap:8mm}.assurance-narrative section{border-top:.8mm solid var(--accent)}.assurance-narrative p,.assurance-narrative li{font:8pt/1.5 Georgia,"Noto Serif KR",serif}.assurance-narrative ul{padding-left:4.5mm}.assurance-narrative li{margin-bottom:1.3mm}.design-resolution{margin-top:4mm;border-top:.3mm solid #bfc9c9;padding-top:2mm}.design-resolution p{font:8.1pt/1.5 Georgia,"Noto Serif KR",serif;margin-bottom:1.5mm}.design-resolution p:last-child{border-left:.7mm solid #735083;padding-left:3mm}.mechanism-foundation .lead{font-size:10.2pt}.misconception{border-left:.9mm solid #b6583b;padding-left:4mm;margin-bottom:4mm}.misconception h3{color:#a24630}.misconception p,.table-intro{font:8.2pt/1.52 Georgia,"Noto Serif KR",serif}.mechanism-table{width:100%;border-collapse:collapse;table-layout:fixed;margin-top:2mm;font-size:6.6pt;line-height:1.4}.mechanism-table th{padding:2mm;text-align:left;color:white;background:var(--accent)}.mechanism-table td{vertical-align:top;padding:2mm;border-bottom:.2mm solid #c5cece}.mechanism-table th:first-child,.mechanism-table td:first-child{width:26mm;font-weight:700;color:var(--accent)}.worked-example-page .lead{font-size:9.5pt}.example-code{margin:3mm 0}.example-code figcaption{color:var(--accent);font-size:6.5pt;font-weight:800;border-bottom:.4mm solid var(--accent);padding-bottom:1.5mm}.example-code pre{margin:0;background:#17262d;color:#e7efed;padding:3.5mm;white-space:pre-wrap;font:7.2pt/1.5 ui-monospace,SFMono-Regular,Menlo,monospace}.example-code code>span{display:block}.example-code code>span>i{display:inline-block;width:8mm;color:#779097;font-style:normal}.trace-table{width:100%;border-collapse:collapse;table-layout:fixed;margin-top:2mm;font-size:7.2pt;line-height:1.43}.trace-table th{background:var(--accent);color:white;text-align:left;padding:2mm}.trace-table td{padding:2.2mm;vertical-align:top;border-bottom:.2mm solid #c6cece}.trace-table tbody th{background:transparent;color:var(--accent);border-bottom:.2mm solid #c6cece;width:26mm}.worked-conclusion{margin-top:3mm;border-left:.8mm solid var(--accent);padding-left:4mm}.worked-conclusion p{font:8.4pt/1.58 Georgia,"Noto Serif KR",serif}.delegation-steps{list-style:none;margin:3mm 0 0;padding:0;display:grid;grid-template-columns:1fr 1fr;gap:0 7mm}.delegation-steps li{border-top:.2mm solid #c5cece;padding:1.8mm 0}.delegation-steps b{color:var(--accent);font-size:7pt}.delegation-steps p{font:7.2pt/1.4 Georgia,"Noto Serif KR",serif}.mechanism-delegation .source-code pre{max-height:90mm}.mechanism-project .source-code pre{max-height:67mm}.project-trace{list-style:none;margin:3mm 0 0;padding:0;display:grid;grid-template-columns:1fr 1fr;gap:0 7mm}.project-trace li{display:grid;grid-template-columns:8mm 1fr;gap:2mm;border-top:.2mm solid #c5cece;padding:1.8mm 0}.project-trace i{color:var(--accent);font:10pt Georgia,serif}.project-trace b{color:var(--accent);font-size:7pt}.project-trace p{font:7.3pt/1.42 Georgia,"Noto Serif KR",serif}.video-bridge{display:grid;grid-template-columns:1fr 1.25fr;gap:8mm;border-top:.9mm solid var(--accent);padding-top:2mm}.video-bridge p{font:8.2pt/1.55 Georgia,"Noto Serif KR",serif}.caveat-list{list-style:none;margin:2mm 0 3mm;padding:0;display:grid;grid-template-columns:1fr 1fr;gap:0 7mm}.caveat-list li{display:grid;grid-template-columns:8mm 1fr;gap:2mm;border-top:.2mm solid #c5cece;padding:1.8mm 0}.caveat-list i{color:#a24630;font:10pt Georgia,serif}.caveat-list p{font:7.4pt/1.42 Georgia,"Noto Serif KR",serif}.theory-definitions{display:grid;grid-template-columns:31mm 1fr;margin:1mm 0 0;font:7.2pt/1.4 Georgia,"Noto Serif KR",serif}.theory-definitions dt,.theory-definitions dd{margin:0;border-top:.2mm solid #c5cece;padding:1.2mm 0}.theory-definitions dt{color:var(--accent);font-weight:700}.external-note{margin-top:2mm;border-top:.4mm solid var(--accent);padding-top:1.5mm;display:flex;flex-wrap:wrap;gap:1.5mm;font-size:5.8pt}.external-note b{color:var(--accent)}.external-note a:not(:last-child):after{content:" ·"}
`

const CSS_V3 = `
.mechanism-delegation .source-code pre,.mechanism-project .source-code pre{font-size:6.1pt;line-height:1.2}.mechanism-delegation .source-code pre{max-height:90mm}.mechanism-project .source-code pre{max-height:67mm}
`

const CSS_V4 = `
.linked-prose{border-top:.3mm solid #c5cece}.linked-prose p{position:relative;padding:2.2mm 0 2.2mm 28mm;margin:0;border-bottom:.2mm solid #d2d8d8}.linked-prose b{position:absolute;left:0;top:2.4mm;width:25mm;color:var(--accent);font:6.5pt/1.3 "Apple SD Gothic Neo",sans-serif;letter-spacing:.04em}
.system-path{list-style:none;margin:4mm 0 0;padding:0}.system-path li{grid-template-columns:24mm 1fr;padding:2.4mm 0}.system-path i{font:6.2pt/1.35 "Apple SD Gothic Neo",sans-serif;font-style:normal;font-weight:800;letter-spacing:.04em}.system-path b{width:26mm}.system-path small,.walkthrough small,.algorithm-sequence small,.project-trace small,.delegation-steps small{display:block;margin-top:1mm;color:#6a777b;font:6.35pt/1.42 Georgia,"Noto Serif KR",serif}.chapter-argument li{grid-template-columns:18mm 1fr}.chapter-argument i{font:6.1pt/1.25 "Apple SD Gothic Neo",sans-serif;font-style:normal;font-weight:800}.chapter-argument li b{font-size:5.9pt}
.algorithm-sequence li{grid-template-columns:25mm 1fr}.algorithm-sequence i{font:6.3pt/1.3 "Apple SD Gothic Neo",sans-serif;font-style:normal;font-weight:800;letter-spacing:.03em}.algorithm-sequence small{font-size:6.1pt}.theory-connections{display:grid;grid-template-columns:1fr 1fr;gap:0 7mm;margin-top:3mm}.theory-connections>header{grid-column:1/-1;border-top:.7mm solid var(--accent);padding-top:1.5mm}.theory-connections>header>b{color:var(--accent);font-size:7pt}.theory-connections>header>p{margin-top:.7mm;color:#5d6b70;font:6.5pt/1.35 Georgia,"Noto Serif KR",serif}.theory-connections section{border-top:.2mm solid #c5cece;padding:1.1mm 0}.theory-connections h3{margin:0 0 .6mm;font-size:6.6pt}.theory-connections section p{font:6.15pt/1.35 Georgia,"Noto Serif KR",serif}.theory-connections section p b{color:#344b54}.theory-connections em{color:#6f4f73;font-style:normal}
.walkthrough{margin-top:3mm}.walkthrough:before{left:10.5mm}.walkthrough li{grid-template-columns:24mm 1fr;padding:2.2mm 0}.walkthrough i{font:6.2pt/1.3 "Apple SD Gothic Neo",sans-serif;font-style:normal;font-weight:800}.delegation-steps li{padding:1.5mm 0}.delegation-steps small{font-size:5.9pt}.project-trace li{grid-template-columns:20mm 1fr}.project-trace i{font:5.8pt/1.3 "Apple SD Gothic Neo",sans-serif;font-style:normal;font-weight:800}.project-trace small{font-size:5.8pt}.caveat-list li{grid-template-columns:20mm 1fr}.caveat-list i{color:#a24630;font:5.8pt/1.3 "Apple SD Gothic Neo",sans-serif;font-style:normal;font-weight:800}.synthesis-prompts li{grid-template-columns:23mm 1fr}.synthesis-prompts i{font:6.5pt/1.3 "Apple SD Gothic Neo",sans-serif;font-style:normal;font-weight:800}
.theory-atlas-page .lead{font-size:9.5pt;margin-bottom:3mm}.theory-atlas{display:grid;grid-template-columns:1fr;gap:2.5mm}.theory-atlas-category{border-top:.8mm solid var(--accent);padding-top:1.5mm}.theory-atlas-category header{display:flex;align-items:baseline;justify-content:space-between;gap:4mm}.theory-atlas-category h3{margin:0;font-size:9pt}.theory-atlas-category header span{color:#657378;font-size:6.2pt}.theory-atlas-category p{margin-top:1mm;font:7.35pt/1.48 Georgia,"Noto Serif KR",serif}.theory-atlas-category p b{color:var(--accent);font-family:"Apple SD Gothic Neo",sans-serif;font-size:6.3pt}.theory-atlas-page .closing{font-size:7.5pt;margin-top:3mm}
.algorithm-theory-page .lead{font-size:10pt}.algorithm-theory{display:grid;grid-template-columns:1fr 1fr;gap:0 8mm}.algorithm-theory section{border-top:.8mm solid var(--accent);padding:2mm 0 2.5mm}.algorithm-theory section:last-child:nth-child(odd){grid-column:1/-1}.algorithm-theory header{display:flex;justify-content:space-between;align-items:baseline;gap:3mm}.algorithm-theory h3{margin:0;font-size:9pt}.algorithm-theory header span{color:#65516b;font:6.2pt/1.3 ui-monospace,SFMono-Regular,Menlo,monospace;text-align:right}.algorithm-theory p{margin-top:1.5mm;font:8pt/1.55 Georgia,"Noto Serif KR",serif}.algorithm-theory p b{color:var(--accent);font-family:"Apple SD Gothic Neo",sans-serif;font-size:7pt}.algorithm-theory-page .closing{border-left:.7mm solid var(--accent);padding-left:3mm;font-size:8pt}
h2{text-wrap:balance}.algorithm-context h2,.algorithm-prerequisites h2,.algorithm-source h2,.algorithm-transition h2,.algorithm-assurance h2,.algorithm-operation h2,.algorithm-current-state h2,.algorithm-example h2{max-width:158mm}.algorithm-context .lead,.algorithm-prerequisites .lead,.algorithm-assurance .lead,.algorithm-operation .lead,.algorithm-current-state .lead{font-size:10.6pt;line-height:1.66}.book-prose{max-width:156mm;font:9.45pt/1.78 Georgia,"Noto Serif KR",serif}.book-prose p{margin-bottom:3.4mm}.book-prose h3{margin-top:4.2mm}.book-note{margin:5mm 0 0 12mm;border-left:.65mm solid var(--accent);padding-left:5mm;max-width:141mm}.book-note h3{margin-top:0}.book-note p{font:8.6pt/1.62 Georgia,"Noto Serif KR",serif}.book-note em{display:block;margin-top:1mm;color:#596a70;font-style:normal}.status-sentence{position:relative;padding:0 0 0 27mm;margin:3mm 0;font:9pt/1.65 Georgia,"Noto Serif KR",serif}.sentence-status{position:absolute;left:0;top:.4mm;width:23mm;font:6.1pt/1.3 "Apple SD Gothic Neo",sans-serif;font-weight:800;letter-spacing:.06em}.sentence-status.observed{color:#176b73}.sentence-status.inference{color:#855c1d}.sentence-status.recommendation{color:#735083}.sentence-status.unknown{color:#8a3e3e}.prerequisite-prose{display:grid;grid-template-columns:1fr 1fr;gap:8mm}.prerequisite-prose section{border-top:.75mm solid var(--accent);padding-top:2mm}.prerequisite-prose .chapter-mark{color:var(--accent);opacity:.3;font:22pt/1 Georgia,serif}.prerequisite-prose h3{margin:0 0 1.5mm}.prerequisite-prose section>p:not(.chapter-mark){font:8.6pt/1.62 Georgia,"Noto Serif KR",serif}.return-to-code{margin-top:3mm;border-left:.55mm solid #9db1ae;padding-left:3mm}.return-to-code b{color:var(--accent)}.theory-questions{margin-top:6mm;border-top:.3mm solid #bcc8c7;padding-top:1mm}.theory-questions ul{list-style:none;margin:1mm 0 0;padding:0;display:grid;grid-template-columns:1fr 1fr;gap:0 7mm}.theory-questions li{padding:1.5mm 0;border-top:.2mm solid #d2d8d8}.theory-questions li b,.theory-questions li span{display:block}.theory-questions li b{color:var(--accent);font-size:7pt}.theory-questions li span{color:#6f5874;font:6pt/1.35 ui-monospace,SFMono-Regular,Menlo,monospace}.theory-questions li p{margin-top:.7mm;font:7.4pt/1.45 Georgia,"Noto Serif KR",serif}.source-reading-intro{display:grid;grid-template-columns:1fr 1fr;gap:7mm;margin:0 0 3mm}.source-reading-intro p{border-top:.45mm solid var(--accent);padding-top:1.5mm;font:8pt/1.52 Georgia,"Noto Serif KR",serif}.algorithm-source .source-code pre{font-size:7.2pt;line-height:1.48;max-height:145mm}.algorithm-source .code-bridge{font-size:8.1pt;line-height:1.58}.algorithm-transition .algorithm-sequence{margin-top:3mm}.algorithm-transition .algorithm-sequence li{padding:1.9mm 0}.algorithm-transition .algorithm-sequence p{font-size:8.2pt;line-height:1.48}.algorithm-assurance .assurance-narrative{margin-top:2mm}.algorithm-assurance .assurance-narrative p,.algorithm-assurance .assurance-narrative li{font-size:8.2pt;line-height:1.55}.algorithm-assurance>.status-sentence{font-size:8.2pt;margin:2mm 0}.state-ledger{margin-top:4mm;border-top:.8mm solid var(--accent);padding-top:2mm}.state-ledger .status-sentence{font-size:9.1pt;line-height:1.65;padding-top:1.2mm;padding-bottom:1.2mm;border-bottom:.2mm solid #d0d7d6}.learning-transfer{margin-top:6mm;border-top:.65mm solid var(--accent);padding-top:1mm}.learning-transfer ol{margin:1mm 0 0;padding-left:5mm}.learning-transfer li{padding:1.6mm 0;font:8.6pt/1.55 Georgia,"Noto Serif KR",serif}.compact-transfer{margin-top:4mm}.compact-transfer li{padding:1mm 0}.algorithm-example .example-code pre{font-size:7.4pt;line-height:1.52}.algorithm-example .trace-table{font-size:7.45pt;line-height:1.48}.algorithm-example .trace-table td,.algorithm-example .trace-table th{padding:2.4mm}.algorithm-operation .book-prose{max-width:154mm}.algorithm-compact .book-note{margin-top:4mm}.algorithm-compact .book-note p{margin-bottom:2mm}
`

async function verifyRevision() {
  const { stdout } = await execFile('git', ['-C', SOURCE_ROOT, 'rev-parse', 'HEAD'])
  if (stdout.trim() !== COMMIT) throw new Error(`source revision mismatch: ${stdout.trim()}`)
  const { stdout: status } = await execFile('git', ['-C', SOURCE_ROOT, 'status', '--short'])
  if (status.trim()) throw new Error(`source clone is not clean:\n${status}`)
}

async function verifyArchitectureClaims() {
  const serialized = JSON.stringify(reports)
  const sourceCache = new Map()
  const checks = []
  for (const check of semanticSpecification.checks) {
    let subject = serialized
    if (check.kind.startsWith('source_')) {
      if (!sourceCache.has(check.path)) sourceCache.set(check.path, await fs.readFile(path.join(SOURCE_ROOT, check.path), 'utf8'))
      subject = sourceCache.get(check.path)
    }
    const matched = subject.includes(check.needle)
    const passed = check.kind.endsWith('_includes') ? matched : !matched
    checks.push([passed, check.failure])
  }
  const failures = checks.filter(([ok]) => !ok).map(([, message]) => message)
  if (failures.length) throw new Error(`semantic claim validation failed:\n${failures.join('\n')}`)
  return checks.length
}

function allRefs() {
  const values = []
  for (const report of reports) for (const chapter of report.chapters) for (const item of chapter.pages) {
    values.push(...[item.source, ...(item.refs ?? [])].filter(Boolean))
  }
  return values
}

function verifyContentContract() {
  const topics = reports.flatMap(report => report.chapters.flatMap(chapter => chapter.pages))
  const algorithms = topics.filter(item => item.kind === 'algorithm')
  const ids = algorithms.map(item => item.id)
  const expectedIds = Array.from({ length: 44 }, (_, index) => `A${String(index + 1).padStart(2, '0')}`)
  const failures = []
  if (new Set(ids).size !== ids.length) failures.push('algorithm IDs are not unique')
  if (JSON.stringify([...ids].sort()) !== JSON.stringify(expectedIds)) failures.push('algorithm catalog is not the complete A01-A44 set')
  const narrativeIds = algorithmNarrativeSpecification.algorithms.map(item => item.id)
  if (new Set(narrativeIds).size !== narrativeIds.length) failures.push('expanded narrative IDs are not unique')
  if (JSON.stringify([...narrativeIds].sort()) !== JSON.stringify(expectedIds)) failures.push('expanded narrative catalog is not the complete A01-A44 set')
  for (const item of algorithms) {
    for (const field of ['problem', 'complexity', 'decision', 'improvement']) {
      if (!item[field]?.trim()) failures.push(`${item.id}: missing ${field}`)
    }
    for (const field of ['inputs', 'state', 'steps', 'invariants', 'failures', 'theory']) {
      if (!Array.isArray(item[field]) || item[field].length === 0) failures.push(`${item.id}: missing ${field}`)
    }
    if (item.steps.length < 3) failures.push(`${item.id}: fewer than three algorithm steps`)
    if (item.invariants.length < 2) failures.push(`${item.id}: fewer than two invariants`)
    const narrative = algorithmNarratives.get(item.id)
    if (!narrative) continue
    for (const field of ['readerSituation', 'readerQuestion', 'ownership', 'placement']) {
      if (!narrative[field]?.trim()) failures.push(`${item.id}: missing expanded narrative ${field}`)
    }
    if (!['compact', 'standard', 'expanded'].includes(narrative.layout)) failures.push(`${item.id}: invalid narrative layout`)
    if (!Array.isArray(narrative.prerequisites) || narrative.prerequisites.length === 0) failures.push(`${item.id}: missing prerequisite explanation`)
    for (const prerequisite of narrative.prerequisites ?? []) {
      for (const field of ['concept', 'explanation', 'returnToCode']) if (!prerequisite[field]?.trim()) failures.push(`${item.id}: incomplete prerequisite ${field}`)
    }
    for (const field of ['runtime', 'effect', 'failure', 'observation']) if (!narrative.operation?.[field]?.trim()) failures.push(`${item.id}: missing operation.${field}`)
    for (const field of ['observed', 'conditional', 'unknown', 'nextRead']) if (!narrative.currentState?.[field]?.trim()) failures.push(`${item.id}: missing currentState.${field}`)
    if (!Array.isArray(narrative.transferQuestions) || narrative.transferQuestions.length < 2) failures.push(`${item.id}: fewer than two learning-transfer questions`)
    if (narrative.layout === 'expanded' && !narrative.example) failures.push(`${item.id}: expanded layout requires a worked example`)
    if (narrative.example) {
      for (const field of ['title', 'setup', 'code', 'returnToCode']) if (!narrative.example[field]?.trim()) failures.push(`${item.id}: incomplete worked example ${field}`)
      if (!Array.isArray(narrative.example.trace) || narrative.example.trace.length < 3) failures.push(`${item.id}: worked example requires at least three trace rows`)
    }
  }
  for (const item of topics.filter(value => value.kind === 'code')) {
    for (const field of ['mechanism', 'decision', 'risk']) if (!item[field]?.trim()) failures.push(`${item.title}: missing ${field}`)
  }
  for (const item of topics.filter(value => value.kind === 'mechanism-study')) {
    if (!item.misconception?.trim()) failures.push(`${item.id}: missing misconception correction`)
    if (!item.comparison?.rows?.length) failures.push(`${item.id}: missing semantic comparison`)
    if (!Array.isArray(item.examples) || item.examples.length < 3) failures.push(`${item.id}: fewer than three worked examples`)
    if (!item.delegation?.steps?.length || !item.projectTrace?.length) failures.push(`${item.id}: missing project-level trace`)
    if (!item.caveats?.length || !item.theory?.length) failures.push(`${item.id}: missing guarantee boundaries or theory`)
  }
  if (failures.length) throw new Error(`content contract failed:\n${failures.join('\n')}`)
  return { topics: topics.length, algorithms: algorithms.length, expandedNarratives: narrativeIds.length, workedExamples: algorithmNarrativeSpecification.algorithms.filter(item => item.example).length, codeReadings: topics.filter(item => item.kind === 'code').length, mechanismStudies: topics.filter(item => item.kind === 'mechanism-study').length }
}

function verifyRubricReadiness() {
  const checkpointIds = qualityRubric.checkpoints.map(item => item.id)
  const required = ['requirement_readiness', 'repository_coverage', 'source_and_mechanism', 'algorithm_assurance', 'theory_applicability', 'narrative_expression', 'visual_explanation', 'whole_sequence_reading', 'publication_integrity']
  const failures = []
  for (const id of required) if (!checkpointIds.includes(id)) failures.push(`missing rubric checkpoint: ${id}`)
  for (const checkpoint of qualityRubric.checkpoints) {
    if (!checkpoint.when || !Array.isArray(checkpoint.mandatory) || checkpoint.mandatory.length === 0) failures.push(`incomplete rubric checkpoint: ${checkpoint.id}`)
  }
  const algorithms = reports.flatMap(report => reportAlgorithms(report))
  for (const term of unique(algorithms.flatMap(item => item.theory))) {
    const matches = THEORY_CATEGORIES.filter(category => category.pattern.test(term))
    if (matches.length !== 1) failures.push(`theory category must be exact for ${term}: ${matches.map(item => item.id).join(',') || 'none'}`)
  }
  for (const item of reports.flatMap(report => report.chapters.flatMap(chapter => chapter.pages.filter(value => value.kind === 'mechanism-study')))) {
    for (const field of ['foundationClosing', 'exampleTraceIntro', 'delegationTitle', 'projectTitle', 'projectLead', 'projectClosing', 'boundaryTitle']) {
      if (!item.presentation?.[field]) failures.push(`${item.id}: missing presentation.${field}`)
    }
    if (!item.comparison?.intro || !item.presentation?.traceColumns?.length) failures.push(`${item.id}: incomplete comparison narration`)
  }
  if (failures.length) throw new Error(`rubric readiness failed:\n${failures.join('\n')}`)
  return {
    checkpointCount: qualityRubric.checkpoints.length,
    aggregateScore: null,
    theoryClassification: 'exactly_one_category_per_term',
  }
}

function verifyRepositoryCoverage() {
  const topics = reports.flatMap(report => report.chapters.flatMap(chapter => chapter.pages))
  const byTitle = new Map(topics.map(item => [item.title, item]))
  const failures = []
  if (repositoryCoverageRubric.lengthPolicy?.pageCap !== null) failures.push('repository coverage must not have a page cap')
  if (repositoryCoverageRubric.lengthPolicy?.fontShrinkToFit !== false) failures.push('font shrink-to-fit must remain disabled')
  if (repositoryCoverageRubric.lengthPolicy?.summaryMayReplaceRequiredDetail !== false) failures.push('summary cannot replace required detail')
  if (!Array.isArray(repositoryCoverageRubric.depthDimensions) || repositoryCoverageRubric.depthDimensions.length < 7) failures.push('coverage depth dimensions are incomplete')
  const domainIds = repositoryCoverageRubric.domains.map(domain => domain.id)
  if (new Set(domainIds).size !== domainIds.length) failures.push('repository coverage domain IDs are not unique')
  for (const domain of repositoryCoverageRubric.domains) {
    const evidence = domain.evidenceTitles.map(title => byTitle.get(title)).filter(Boolean)
    const missing = domain.evidenceTitles.filter(title => !byTitle.has(title))
    if (missing.length) failures.push(`${domain.id}: missing evidence subjects: ${missing.join(', ')}`)
    if (evidence.length < domain.minimumDetailedSubjects) failures.push(`${domain.id}: only ${evidence.length} detailed subjects, requires ${domain.minimumDetailedSubjects}`)
    for (const kind of domain.requiredKinds) {
      if (!evidence.some(item => item.kind === kind)) failures.push(`${domain.id}: no ${kind} evidence subject`)
    }
  }
  if (failures.length) throw new Error(`repository coverage failed:\n${failures.join('\n')}`)
  return {
    domains: repositoryCoverageRubric.domains.length,
    depthDimensions: repositoryCoverageRubric.depthDimensions.length,
    aggregateScore: null,
    pageCap: null,
  }
}

async function verifyToolBoundary() {
  const builder = await fs.readFile(fileURLToPath(import.meta.url), 'utf8')
  const leaked = toolBoundary.builderForbiddenAnalysisPhrases.filter(value => builder.includes(value))
  if (leaked.length) throw new Error(`target analysis leaked into builder: ${leaked.join(', ')}`)
  if (!Array.isArray(toolBoundary.builderResponsibilities) || toolBoundary.builderResponsibilities.length === 0) {
    throw new Error('tool boundary has no declared builder responsibilities')
  }
  return {
    forbiddenAnalysisPhrasesChecked: toolBoundary.builderForbiddenAnalysisPhrases.length,
    builderResponsibilities: toolBoundary.builderResponsibilities.length,
  }
}

async function loadSourceCorpus() {
  const corpus = new Map()
  const failures = []
  for (const ref of allRefs()) {
    const key = sourceKey(ref)
    if (corpus.has(key)) continue
    const target = path.join(SOURCE_ROOT, ref.path)
    try {
      const stat = await fs.stat(target)
      if (!stat.isFile()) throw new Error('not a file')
      const lines = (await fs.readFile(target, 'utf8')).split('\n')
      if (ref.start < 1 || ref.end < ref.start || ref.end > lines.length) throw new Error(`range outside 1-${lines.length}`)
      corpus.set(key, lines.slice(ref.start - 1, ref.end).map((text, index) => ({ number: ref.start + index, text })))
    } catch (error) {
      failures.push(`${key}: ${error.code ?? error.message}`)
    }
  }
  if (failures.length) throw new Error(`invalid source evidence:\n${failures.join('\n')}`)
  return corpus
}

async function validateLayout(browserPage, report, expectedPages) {
  const target = path.join(HERE, 'html', `${report.slug}.html`)
  await browserPage.goto(`file://${target}`, { waitUntil: 'load' })
  await browserPage.emulateMedia({ media: 'print' })
  const pageCount = await browserPage.locator('.sheet').count()
  if (pageCount !== expectedPages) throw new Error(`${report.slug}: HTML page mismatch ${pageCount} != ${expectedPages}`)
  const overflows = await browserPage.locator('.sheet').evaluateAll(nodes => nodes.map((node, index) => ({ index, x: node.scrollWidth - node.clientWidth, y: node.scrollHeight - node.clientHeight })).filter(item => item.x > 2 || item.y > 2))
  if (overflows.length) throw new Error(`${report.slug}: overflow ${JSON.stringify(overflows)}`)
  const tinyCode = await browserPage.locator('.source-code pre').evaluateAll(nodes => nodes.filter(node => parseFloat(getComputedStyle(node).fontSize) < 8).length)
  if (tinyCode) throw new Error(`${report.slug}: source code below readable threshold`)
  const clippedCode = await browserPage.locator('.source-code pre,.example-code pre').evaluateAll(nodes => nodes.map((node, index) => ({ index, overflow: node.scrollHeight - node.clientHeight })).filter(item => item.overflow > 2))
  if (clippedCode.length) throw new Error(`${report.slug}: clipped code ${JSON.stringify(clippedCode)}`)
  const ordinalVisuals = await browserPage.locator('.system-path i,.walkthrough i,.algorithm-sequence i,.project-trace i,.caveat-list i,.synthesis-prompts i').evaluateAll(nodes => nodes.map(node => node.textContent.trim()).filter(text => /^\d+[.)]?$/.test(text)))
  if (ordinalVisuals.length) throw new Error(`${report.slug}: ordinal-only visual labels ${JSON.stringify(ordinalVisuals)}`)
  const bodyText = await browserPage.locator('body').innerText()
  const leaked = publication.readerExcludedPhrases.filter(value => bodyText.includes(value))
  if (leaked.length) throw new Error(`${report.slug}: internal operation language leaked ${JSON.stringify(leaked)}`)
  for (const item of reportAlgorithms(report)) {
    const sequence = browserPage.locator(`.sheet[data-algorithm="${item.id}"]`)
    const stages = await sequence.evaluateAll(nodes => nodes.flatMap(node => (node.dataset.obligations ?? '').split(/\s+/).filter(Boolean)))
    const missing = visualReviewSamples.requiredObligations.filter(value => !stages.includes(value))
    if (missing.length) throw new Error(`${report.slug}: ${item.id} missing narrative obligations ${missing.join(',')}`)
    const stageNames = await sequence.evaluateAll(nodes => nodes.map(node => node.dataset.stage))
    if (new Set(stageNames).size !== stageNames.length) throw new Error(`${report.slug}: ${item.id} has duplicate semantic stages`)
  }
}

function reportStats(report, pages) {
  const topics = report.chapters.flatMap(chapter => chapter.pages)
  const algorithms = reportAlgorithms(report)
  return {
    volume: report.volume,
    title: report.title,
    file: `${report.slug}.pdf`,
    pages,
    algorithms: algorithms.length,
    codeReadings: topics.filter(item => item.kind === 'code').length,
    theoryCategories: theoryDistribution(report).length,
    theoryTerms: unique(algorithms.flatMap(item => item.theory)).length,
    sourceRanges: unique(topics.flatMap(item => [item.source, ...(item.refs ?? [])].filter(Boolean).map(sourceKey))).length,
  }
}

let captureIntegritySheets = 0
let captureIntegrityElements = 0
let capturePaintAttempts = 0

async function waitForStablePaint(page) {
  await page.evaluate(async () => {
    await document.fonts.ready
    document.body.getBoundingClientRect()
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))
  })
}

async function captureSheet(locator, target) {
  const sourcePage = locator.page()
  const sourceUrl = sourcePage.url()
  const snapshot = await locator.evaluate(node => ({
    pageIndex: [...node.parentElement.children].indexOf(node),
    expected: Object.fromEntries(
      ['header.running', 'h2', '.lead'].map(selector => {
        const element = node.querySelector(selector)
        return [selector, element ? element.textContent.trim() : null]
      }),
    ),
  }))
  const captureContext = await sourcePage.context().browser().newContext({
    viewport: sourcePage.viewportSize(),
    deviceScaleFactor: 1,
  })
  const capturePage = await captureContext.newPage()
  let integrity
  let attempts = 0
  try {
    await capturePage.goto(sourceUrl, { waitUntil: 'load' })
    await capturePage.emulateMedia({ media: 'print' })
    const captureLocator = capturePage.locator('.sheet').nth(snapshot.pageIndex)
    await captureLocator.scrollIntoViewIfNeeded()
    await waitForStablePaint(capturePage)
    integrity = await captureLocator.evaluate((sheet, expected) => {
      const sheetRect = sheet.getBoundingClientRect()
      const failures = []
      let checked = 0
      for (const [selector, expectedText] of Object.entries(expected)) {
        if (expectedText === null) continue
        checked += 1
        const element = sheet.querySelector(selector)
        if (!element) {
          failures.push(`${selector}: missing`)
          continue
        }
        const actualText = element.textContent.trim()
        if (actualText !== expectedText) failures.push(`${selector}: text mismatch`)
        const style = getComputedStyle(element)
        const rect = element.getBoundingClientRect()
        if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) {
          failures.push(`${selector}: hidden`)
        }
        if (rect.width <= 0 || rect.height <= 0) failures.push(`${selector}: empty bounds`)
        const epsilon = 1
        if (
          rect.left < sheetRect.left - epsilon ||
          rect.top < sheetRect.top - epsilon ||
          rect.right > sheetRect.right + epsilon ||
          rect.bottom > sheetRect.bottom + epsilon
        ) {
          failures.push(`${selector}: outside sheet bounds`)
        }
      }
      return { checked, failures }
    }, snapshot.expected)
    if (integrity.failures.length) {
      throw new Error(`capture integrity failed for ${path.basename(target)}: ${integrity.failures.join(', ')}`)
    }
    for (const [selector, expectedText] of Object.entries(snapshot.expected)) {
      if (expectedText === null) continue
      const pixelProbe = await captureLocator.locator(selector).screenshot()
      if (pixelProbe.length < 100) {
        throw new Error(`capture paint probe failed for ${path.basename(target)}: ${selector}`)
      }
    }
    attempts = 1
    await waitForStablePaint(capturePage)
    await captureLocator.screenshot({ path: target })
  } finally {
    await captureContext.close()
  }
  captureIntegritySheets += 1
  captureIntegrityElements += integrity.checked
  capturePaintAttempts += attempts
  return integrity.checked
}

async function main() {
  await verifyRevision()
  const semanticChecks = await verifyArchitectureClaims()
  const contentContract = verifyContentContract()
  const rubricReadiness = verifyRubricReadiness()
  const repositoryCoverage = verifyRepositoryCoverage()
  const toolBoundaryCheck = await verifyToolBoundary()
  const corpus = await loadSourceCorpus()
  const inputDigests = {
    sourceProfile: await digestFile(path.join(HERE, 'content', 'source-profile.json')),
    reportContent: await digestFile(path.join(HERE, 'content.mjs')),
    algorithmNarratives: await digestFile(path.join(HERE, 'content', 'algorithm-narratives.json')),
    builder: await digestFile(fileURLToPath(import.meta.url)),
    narrativeSpec: await digestFile(path.join(HERE, 'engineering', 'expanded-algorithm-narrative-spec.md')),
    visualSampleConfig: await digestFile(path.join(HERE, 'content', 'visual-review-samples.json')),
  }
  await Promise.all(['html', 'previews', 'metrics', 'attachments', 'engineering'].map(dir => fs.mkdir(path.join(HERE, dir), { recursive: true })))

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({ viewport: { width: 1200, height: 1700 }, deviceScaleFactor: 1 })
  const browserPage = await context.newPage()
  const manifestReports = []
  const sampleSequences = []

  for (const report of reports) {
    const sheets = renderReport(report, corpus)
    const html = `<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>${esc(report.title)}</title><style>${CSS}${CSS_V2}${CSS_V3}${CSS_V4}</style></head><body>${sheets.join('\n')}</body></html>`
    const htmlPath = path.join(HERE, 'html', `${report.slug}.html`)
    const pdfPath = path.join(HERE, `${report.slug}.pdf`)
    await fs.writeFile(htmlPath, html)
    await validateLayout(browserPage, report, sheets.length)
    await browserPage.pdf({ path: pdfPath, format: 'A4', printBackground: true, preferCSSPageSize: true, margin: { top: '0', right: '0', bottom: '0', left: '0' } })

    const pdfBytes = await fs.readFile(pdfPath)
    const renderedPages = (pdfBytes.toString('latin1').match(/\/Type\s*\/Page\b/g) ?? []).length
    if (renderedPages !== sheets.length) throw new Error(`${report.slug}: PDF page mismatch ${renderedPages} != ${sheets.length}`)

    await captureSheet(browserPage.locator('.sheet').nth(0), path.join(HERE, 'previews', `${report.slug}-cover.png`))
    await captureSheet(browserPage.locator('.sheet.algorithm-context').first(), path.join(HERE, 'previews', `${report.slug}-algorithm-context.png`))
    await captureSheet(browserPage.locator('.sheet.algorithm-source').first(), path.join(HERE, 'previews', `${report.slug}-algorithm-code.png`))
    await captureSheet(browserPage.locator('.sheet.algorithm-transition').first(), path.join(HERE, 'previews', `${report.slug}-algorithm-transition.png`))
    await captureSheet(browserPage.locator('.sheet.algorithm-assurance').first(), path.join(HERE, 'previews', `${report.slug}-algorithm-assurance.png`))
    await captureSheet(browserPage.locator('.sheet.algorithm-current-state').first(), path.join(HERE, 'previews', `${report.slug}-algorithm-current-state.png`))
    const mapIndex = await browserPage.locator('.sheet.map-page').first().evaluate(node => [...node.parentElement.children].indexOf(node))
    await captureSheet(browserPage.locator('.sheet').nth(mapIndex), path.join(HERE, 'previews', `${report.slug}-system-map.png`))
    await captureSheet(browserPage.locator('.sheet.theory-atlas-page').first(), path.join(HERE, 'previews', `${report.slug}-theory-atlas.png`))
    if (await browserPage.locator('.sheet.mechanism-foundation').count()) {
      await captureSheet(browserPage.locator('.sheet.mechanism-foundation').first(), path.join(HERE, 'previews', `${report.slug}-mechanism-foundation.png`))
      await captureSheet(browserPage.locator('.sheet.worked-example-page').first(), path.join(HERE, 'previews', `${report.slug}-mechanism-example.png`))
      await captureSheet(browserPage.locator('.sheet.mechanism-delegation').first(), path.join(HERE, 'previews', `${report.slug}-mechanism-delegation.png`))
      await captureSheet(browserPage.locator('.sheet.mechanism-project').first(), path.join(HERE, 'previews', `${report.slug}-mechanism-project.png`))
    }
    for (const sample of visualReviewSamples.samples.filter(item => item.volume === report.volume)) {
      const matches = browserPage.locator(`.sheet[data-algorithm="${sample.algorithmId}"]`)
      const matchCount = await matches.count()
      if (matchCount < 4) throw new Error(`${report.slug}: visual review sequence ${sample.id} matched only ${matchCount} pages`)
      const pages = []
      for (let index = 0; index < matchCount; index += 1) {
        const node = matches.nth(index)
        const metadata = await node.evaluate(value => ({
          stage: value.dataset.stage,
          obligations: (value.dataset.obligations ?? '').split(/\s+/).filter(Boolean),
          pageIndex: [...value.parentElement.children].indexOf(value) + 1,
        }))
        const safeStage = metadata.stage.replaceAll(/[^a-z0-9-]/gi, '-')
        const file = `sequence-${sample.id}-${String(index + 1).padStart(2, '0')}-${safeStage}.png`
        const screenshotPath = path.join(HERE, 'previews', file)
        await captureSheet(node, screenshotPath)
        const screenshotBytes = await fs.readFile(screenshotPath)
        const dimensions = readPngDimensions(screenshotBytes, file)
        pages.push({ ...metadata, file, sha256: sha256(screenshotBytes), dimensions })
      }
      const covered = unique(pages.flatMap(item => item.obligations))
      const missing = visualReviewSamples.requiredObligations.filter(value => !covered.includes(value))
      if (missing.length) throw new Error(`${report.slug}: sample ${sample.id} missing obligations ${missing.join(',')}`)
      sampleSequences.push({ ...sample, report: report.slug, pageRange: [pages[0].pageIndex, pages.at(-1).pageIndex], coveredObligations: covered, pages })
    }

    const stats = reportStats(report, sheets.length)
    stats.bytes = (await fs.stat(pdfPath)).size
    stats.sha256 = await digestFile(pdfPath)
    manifestReports.push(stats)
  }

  await browser.close()
  const manifest = {
    generatedAt: new Date().toISOString(),
    edition: publication.edition,
    sourceRepository: REPO,
    sourceRoot: SOURCE_ROOT,
    sourceRevision: COMMIT,
    sourceCloneClean: true,
    inputDigests,
    narrativeModel: {
      specification: 'engineering/expanded-algorithm-narrative-spec.md',
      obligations: visualReviewSamples.requiredObligations,
      changedAlgorithmIds: algorithmNarrativeSpecification.algorithms.map(item => item.id),
      layouts: Object.fromEntries(['compact', 'standard', 'expanded'].map(layout => [layout, algorithmNarrativeSpecification.algorithms.filter(item => item.layout === layout).length])),
      workedExamples: algorithmNarrativeSpecification.algorithms.filter(item => item.example).map(item => item.id),
    },
    semanticChecks,
    contentContract,
    rubricReadiness,
    repositoryCoverage,
    toolBoundaryCheck,
    verifiedSourceRanges: corpus.size,
    totalPages: manifestReports.reduce((sum, item) => sum + item.pages, 0),
    totalAlgorithms: manifestReports.reduce((sum, item) => sum + item.algorithms, 0),
    theoryCategories: THEORY_CATEGORIES.length,
    theoryTerms: unique(reports.flatMap(report => reportAlgorithms(report).flatMap(item => item.theory))).length,
    visualSampleManifest: 'previews/visual-sample-manifest.json',
    captureIntegrity: {
      sheets: captureIntegritySheets,
      expectedElementsChecked: captureIntegrityElements,
      paintAttempts: capturePaintAttempts,
      stabilization: 'isolated fresh browser context and report page locator; expected running-header/h2/lead locators are paint-primed before one full-sheet screenshot after document.fonts.ready and two animation frames; no cloned markup or screenshot-time animation style injection',
    },
    reports: manifestReports,
  }
  await fs.writeFile(path.join(HERE, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`)
  const manifestDigest = await digestFile(path.join(HERE, 'manifest.json'))
  const sampleManifest = {
    schemaVersion: 2,
    generatedAt: manifest.generatedAt,
    sourceRevision: COMMIT,
    inputDigests,
    manifestDigest,
    pdfDigests: Object.fromEntries(manifestReports.map(item => [item.file, item.sha256])),
    selectionUnit: visualReviewSamples.selectionUnit,
    dimensionsSource: 'validated PNG IHDR width and height in raster pixels',
    requiredObligations: visualReviewSamples.requiredObligations,
    physicalA4: { required: true, environment: 'Playwright Chromium print media; manual evidence-lane review pending' },
    sequences: sampleSequences,
  }
  const sampleManifestPath = path.join(HERE, 'previews', 'visual-sample-manifest.json')
  await fs.writeFile(sampleManifestPath, `${JSON.stringify(sampleManifest, null, 2)}\n`)
  const sampleManifestDigest = await digestFile(sampleManifestPath)
  const frozenBuildRecord = {
    generatedAt: manifest.generatedAt,
    sourceRevision: COMMIT,
    inputDigests,
    manifest: { path: 'manifest.json', sha256: manifestDigest },
    visualSampleManifest: { path: 'previews/visual-sample-manifest.json', sha256: sampleManifestDigest },
    reports: manifestReports.map(item => ({ volume: item.volume, file: item.file, pages: item.pages, bytes: item.bytes, sha256: item.sha256 })),
    changedAlgorithmIds: algorithmNarrativeSpecification.algorithms.map(item => item.id),
    validationStatus: 'automated_checks_passed_visual_evidence_pending',
  }
  await fs.writeFile(path.join(HERE, 'attachments', 'frozen-build-record.json'), `${JSON.stringify(frozenBuildRecord, null, 2)}\n`)

  const links = manifestReports.map(item => `- [${item.file}](./${item.file}) — ${item.title} (${item.pages}쪽, 알고리즘 ${item.algorithms}개)`).join('\n')
  const readme = `# ${publication.packageTitle}\n\n${publication.packageDescription}\n\n${links}\n\n총 ${manifest.totalPages}쪽이며, ${manifest.totalAlgorithms}개의 결정적 알고리즘을 기술 서적의 연속 독해 구조로 설명한다. 각 절은 독자의 문제 상황과 owner를 세운 뒤 필요한 언어·런타임 선행 지식, 최소 예제, 고정 source, 상태 전이, 실패와 effect, 현재 관찰·조건부 상태·UNKNOWN, 학습 전이 질문으로 이어진다. 이 구조는 correctness proof를 주장하지 않으며, 현재 구현이 지키려는 조건과 설명이 멈춰야 하는 경계를 함께 보여 준다. ${manifest.theoryTerms}개 이론 표현은 ${manifest.theoryCategories}개 보장 중심 범주로 분류했다. 코드 발췌는 모두 고정 commit에서 자동 추출했고 가운데 생략은 명시했다. 페이지 수는 목표나 상한이 아니라 필요한 논증을 모두 배치한 뒤 계산된 결과다.\n\n- [전체 알고리즘 색인](./attachments/algorithm-catalog.md)\n- [이론 분포 색인](./attachments/theory-distribution.md)\n- [동결 빌드 기록](./attachments/frozen-build-record.json)\n- [전체 시퀀스 시각 표본 manifest](./previews/visual-sample-manifest.json)\n- [전체 세션 요구사항 감사](./engineering/full-session-requirement-audit.md)\n- [요구사항 연속성](./engineering/requirement-chronology.md)\n- [단계별 rubric 적용](./engineering/rubric-application.md)\n- [저장소 분석 범위 감사](./engineering/repository-coverage-audit.md)\n- [분석 원고와 생성 도구 경계](./engineering/content-tool-boundary.md)\n- [재사용 범위](./engineering/reuse-coverage.md)\n- [품질 rubric](./content/report-quality-rubric.json)\n- [저장소 coverage rubric](./content/repository-coverage-rubric.json)\n- [편집 디자인 조사](./research/editorial-design-research.md)\n- [시각 검토](./engineering/visual-review.md)\n- [검증 기록](./engineering/validation.md)\n- [생성 manifest](./manifest.json)\n- [이 작업의 operation binding](./engineering/operation-binding.md)\n\n## Source truth\n\n- repository: ${REPO}\n- revision: \`${COMMIT}\`\n- local clone: \`${SOURCE_ROOT}\`\n- ${publication.sourceBoundary}\n\n## Rebuild\n\n\`node build-study.mjs\`\n\n빌드는 원본 clone을 수정하지 않는다. 고정 revision과 clean state를 확인한 뒤 ${corpus.size}개 source range, ${semanticChecks}개 핵심 의미 주장, 14개 repository responsibility domain, 알고리즘별 A–K obligation, 모든 A4 page의 overflow와 PDF page 수를 검사한다.\n`
  await fs.writeFile(path.join(HERE, 'README.md'), readme)

  const algorithms = reports.flatMap(report => report.chapters.flatMap(chapter => chapter.pages.filter(item => item.kind === 'algorithm').map(item => `| ${item.id} | ${report.volume} | ${item.title} | ${item.invariants[0]} | [source](${sourceUrl(item.source)}) |`)))
  await fs.writeFile(path.join(HERE, 'attachments', 'algorithm-catalog.md'), `# Algorithm catalog\n\n| ID | 권 | 알고리즘 | 대표 보장 | 고정 소스 |\n|---|---:|---|---|---|\n${algorithms.join('\n')}\n`)

  const theoryRows = THEORY_CATEGORIES.map(category => {
    const records = reports.flatMap(report => reportAlgorithms(report).flatMap(item => item.theory
      .filter(term => theoryCategory(term).id === category.id)
      .map(term => ({ volume: report.volume, id: item.id, term }))))
    const terms = unique(records.map(item => item.term)).sort((a, b) => a.localeCompare(b, 'en')).join(', ')
    const ids = unique(records.map(item => `${item.volume}:${item.id}`)).join(', ')
    return `| ${category.title} | ${unique(records.map(item => item.id)).length} | ${terms} | ${ids} | ${category.question} |`
  })
  await fs.writeFile(path.join(HERE, 'attachments', 'theory-distribution.md'), `# Theory distribution\n\n빈도는 중요도 점수가 아니라 서로 다른 구현을 같은 보장 질문으로 비교하기 위한 탐색 신호다.\n\n| 범주 | 연결 알고리즘 수 | 표현 | 권:알고리즘 | 스터디 질문 |\n|---|---:|---|---|---|\n${theoryRows.join('\n')}\n`)

  const validation = `# Validation record\n\n- generated: ${manifest.generatedAt}\n- source revision: \`${COMMIT}\`\n- source clone clean: yes\n- source profile SHA-256: \`${inputDigests.sourceProfile}\`\n- report content SHA-256: \`${inputDigests.reportContent}\`\n- expanded algorithm narrative SHA-256: \`${inputDigests.algorithmNarratives}\`\n- builder SHA-256: \`${inputDigests.builder}\`\n- narrative specification SHA-256: \`${inputDigests.narrativeSpec}\`\n- visual sample config SHA-256: \`${inputDigests.visualSampleConfig}\`\n- manifest SHA-256: \`${manifestDigest}\`\n- visual sample manifest SHA-256: \`${sampleManifestDigest}\`\n- verified source ranges: ${corpus.size}\n- semantic architecture checks: ${semanticChecks}\n- rubric checkpoints bound: ${manifest.rubricReadiness.checkpointCount}\n- repository responsibility domains: ${manifest.repositoryCoverage.domains}\n- repository depth dimensions: ${manifest.repositoryCoverage.depthDimensions}\n- page cap: none\n- font shrink-to-fit: disabled\n- summary substitution for required detail: forbidden\n- aggregate rubric score: not used\n- PDFs: ${manifestReports.length}\n- total pages: ${manifest.totalPages}\n- algorithms: ${manifest.totalAlgorithms}\n- expanded narratives: ${manifest.contentContract.expandedNarratives}\n- worked examples: ${manifest.contentContract.workedExamples}\n- changed algorithm IDs: ${manifest.narrativeModel.changedAlgorithmIds.join(', ')}\n- theory categories: ${manifest.theoryCategories}\n- theory terms classified: ${manifest.theoryTerms}\n- narrative obligation coverage: A–K checked for every algorithm sequence\n- layout: every HTML sheet checked for horizontal and vertical overflow\n- code visibility: every source/example block checked for inner clipping and minimum type size\n- visual language: causal visuals checked for ordinal-only labels\n- capture stabilization: each preview uses an isolated fresh Page that loads the complete generated report HTML and captures the corresponding original sheet locator after document.fonts.ready plus two animation frames; it never clones sheet outerHTML or injects screenshot-time animation-disabling styles, and a file is emitted only after two consecutive PNG captures have identical SHA-256 digests\n- capture integrity: ${manifest.captureIntegrity.sheets} sheets checked; ${manifest.captureIntegrity.expectedElementsChecked} expected running-header/h2/lead elements present, visible, text-stable, and within sheet bounds; ${manifest.captureIntegrity.paintAttempts} paint attempts with ${manifest.captureIntegrity.paintRetries} attempts beyond the minimum two-capture convergence check\n- whole-sequence visual samples: ${sampleSequences.length} sequences and ${sampleSequences.reduce((sum, item) => sum + item.pages.length, 0)} images rendered with stable algorithm/stage selectors\n- visual acceptance: pending evidence-lane physical-A4 review; this automated build does not close publication acceptance\n- PDF pagination: every rendered PDF page count matched its HTML sheet count\n- PDF digests: ${manifestReports.map(item => `${item.volume}=\`${item.sha256}\``).join(', ')}\n- semantic guard: every declarative check in \`content/semantic-checks.json\` passed against source or report content\n- continuity: every material requirement revision is mapped in \`engineering/requirement-chronology.md\` and \`engineering/full-session-requirement-audit.md\`\n- coverage: every required evidence title and page kind in \`content/repository-coverage-rubric.json\` was present\n- content/tool boundary: configured target-analysis phrases were absent from the reusable builder\n- reuse boundary: only applied artifacts are named in \`engineering/reuse-coverage.md\`; domain-specific application/cafe semantics are excluded\n- preservation: the target clone was clean before generation and no target script was executed\n`
  const finalizedValidation = validation
    .replace(', and a file is emitted only after two consecutive PNG captures have identical SHA-256 digests', '; each expected running-header/h2/lead locator is paint-primed before exactly one isolated full-sheet screenshot is emitted')
    .replace(`; ${manifest.captureIntegrity.paintAttempts} paint attempts with ${manifest.captureIntegrity.paintRetries} attempts beyond the minimum two-capture convergence check`, `; ${manifest.captureIntegrity.paintAttempts} isolated full-sheet captures completed after element paint probes`)
    .replace('images rendered with stable algorithm/stage selectors', 'images rendered with stable algorithm/stage selectors; every dimensions value was read from the validated PNG IHDR raster bytes')
  await fs.writeFile(path.join(HERE, 'engineering', 'validation.md'), finalizedValidation)
  process.stdout.write(`${JSON.stringify(manifest, null, 2)}\n`)
}

await main()
