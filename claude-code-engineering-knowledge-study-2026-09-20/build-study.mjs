import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { execFile as execFileCallback } from 'node:child_process'
import { promisify } from 'node:util'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { chromium } from 'playwright'
import { analyzeCodebase } from '../claude-code-core-engineering-study-2026-09-20/tools/typescript-architecture-metrics.mjs'

const execFile = promisify(execFileCallback)
const HERE = path.dirname(fileURLToPath(import.meta.url))
const WORKSPACE = path.resolve(HERE, '../../..')
const SOURCE_ROOT = path.resolve(HERE, '../../sources/stupidhumans/claude-code-source-code')
const ANALYSIS_CONFIG_PATH = path.resolve(HERE, '../claude-code-core-engineering-study-2026-09-20/study-config.json')
const CONFIG = JSON.parse(await fs.readFile(ANALYSIS_CONFIG_PATH, 'utf8'))
const REPO = 'https://github.com/stupidhumans/claude-code-source-code'
const COMMIT = '2ca5ddabfed5f220812ea11f029eda03b21bc4c1'
const GH = `${REPO}/blob/${COMMIT}`
const DATE = '2026-09-20'

const esc = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')
const src = (file, line, label = file) => `<a href="${GH}/${file}${line ? `#L${String(line).replace('-', '-L')}` : ''}">${esc(label)}</a>`
const ext = (url, label) => `<a href="${url}">${esc(label)}</a>`
const local = (file, label = file) => {
  const [relative, anchor = ''] = file.split('#')
  return `<a href="${pathToFileURL(path.join(WORKSPACE, relative)).href}${anchor ? `#${anchor}` : ''}">${esc(label)}</a>`
}
const p = text => `<p>${text}</p>`
const strong = (title, text) => `<div class="strong"><b>${title}</b><span>${text}</span></div>`
const refs = items => `<footer class="refs"><b>근거와 연결</b>${items.map(item => `<span>${item}</span>`).join('')}</footer>`
const quote = text => `<blockquote>${text}</blockquote>`
const table = (headers, rows) => `<table><thead><tr>${headers.map(x => `<th>${x}</th>`).join('')}</tr></thead><tbody>${rows.map(row => `<tr>${row.map(x => `<td>${x}</td>`).join('')}</tr>`).join('')}</tbody></table>`
const formula = text => `<div class="formula">${text}</div>`
const chain = items => `<div class="chain">${items.map((item, index) => `${index ? '<i>→</i>' : ''}<div><b>${item[0]}</b><span>${item[1]}</span></div>`).join('')}</div>`
const layers = items => `<div class="layers">${items.map((item, index) => `<div><em>${String(index + 1).padStart(2, '0')}</em><b>${item[0]}</b><span>${item[1]}</span></div>`).join('')}</div>`
const bars = items => { const max = Math.max(...items.map(x => x[1])); return `<div class="bars">${items.map(x => `<div><b>${x[0]}</b><i><span style="width:${(x[1] / max * 100).toFixed(1)}%"></span></i><em>${x[1].toLocaleString()}</em></div>`).join('')}</div>` }
const argue = ({ condition, lens, realization, failure, synthesis }) => `<div class="argument">
  <section><small>성립 조건</small><p>${condition}</p></section>
  <section><small>이론 렌즈</small><p>${lens}</p></section>
  <section><small>코드의 구체화</small><p>${realization}</p></section>
  <section><small>깨지는 지점</small><p>${failure}</p></section>
</div>${synthesis ? strong('해석', synthesis) : ''}`

const S = (kicker, title, question, body) => ({ kicker, title, question, body })

const reports = [
  {
    volume: '00', slug: '00-reading-code-as-engineering-knowledge', accent: '#c88724', symbol: 'WHY',
    title: '코드를 엔지니어링 지식으로 읽는 법',
    subtitle: '파일을 요약하지 않고, 성립 조건과 실패 압력에서 설계를 재구성한다',
    claim: '중요한 것은 “무슨 코드가 있는가”가 아니라 “어떤 약속을 지키려면 이 코드가 필요해지는가”다.',
    sections: [
      S('POSITION', '분석 대상과 지식 대상을 분리한다', '복원 저장소에서 무엇까지 말할 수 있는가?',
        argue({
          condition: '코드는 실제로 존재하지만 공식 원본·완전한 빌드·장기 이력이 아니다.',
          lens: 'W3C PROV의 관점에서 source entity, 분석 activity, 보고서 entity를 서로 다른 provenance 대상으로 둔다.',
          realization: '고정 commit의 파일·행은 관찰 사실로, 설계 이유는 inference로, 개선 방향은 proposal로 표기한다.',
          failure: '코드가 존재한다는 이유만으로 upstream 의도나 production 활성 상태를 단정하면 reconstruction bias가 된다.',
          synthesis: '이 보고서는 원전을 복원하지 않는다. 관찰 가능한 구현이 닫으려는 문제와 그 한계를 재구성한다.',
        }) + refs([src('README_KR.md', '1-62'), local('artifacts/knowledge/governance/contextual-knowledge-and-repository-bias-control.md', 'repository bias control'), ext('https://www.w3.org/TR/prov-o/', 'W3C PROV-O')])),

      S('CORE QUESTION', '왜 채팅 앱이라는 모델이 부족한가', '사용자가 보는 화면과 시스템이 책임지는 결과 사이에는 무엇이 있는가?',
        argue({
          condition: '코딩 에이전트는 텍스트를 생성하는 데서 끝나지 않고 파일·프로세스·세션을 변화시킨다.',
          lens: '언어 처리계는 description을 실행 가능한 표현으로 낮추고, 보호계는 subject의 요청을 resource effect 앞에서 중재한다.',
          realization: 'Tool 계약, schema parse, permission, tool-specific validation, call, result pairing이 모델 출력과 저장소 효과 사이에 놓인다.',
          failure: '대화 메시지만 추적하면 stale write, denied effect, partial execution, resume 불일치를 설명하지 못한다.',
          synthesis: '가장 생산적인 모델은 “대화 UI”가 아니라 “모델이 제안한 효과를 통제하여 해석하는 런타임”이다.',
        }) + refs([src('src/Tool.ts', '362-700'), src('src/services/tools/toolExecution.ts', '337-577'), ext('https://csrc.nist.gov/pubs/sp/800/207/final', 'NIST SP 800-207')])),

      S('COMPETENCY', '학습 질문이 자료의 범위를 결정한다', '어떤 질문에 답하지 못하면 이 프로젝트를 이해했다고 할 수 없는가?',
        table(['질문', '피상적 답', '요구되는 설명'], [
          ['context', 'prompt를 합친다', '선택·순서·provenance·cache·lossy compact의 결합'],
          ['tool', '함수를 호출한다', '표현 유효성·권한·현재 상태·효과·관찰의 분리'],
          ['turn', 'generator로 반복한다', '부분 효과 뒤 protocol과 durable state의 합류'],
          ['UI', 'React로 그린다', 'canonical state와 interactive projection의 경쟁'],
          ['refactor', '큰 파일을 나눈다', '불변조건 owner와 동등성 oracle을 보존하는 순서'],
        ]) + p('이 질문들은 파일 구조가 아니라 제품 약속에서 출발한다. 코드 탐색은 답을 찾는 수단이며, 질문 자체가 폴더 목록으로 변하지 않는다.') + refs([local('artifacts/knowledge/operations/progressive-knowledge-acquisition-and-modeling.md', 'progressive knowledge acquisition'), local('.collab/artifacts/claude-code-engineering-knowledge-study-2026-09-20/research/knowledge-demand.md', 'knowledge demand')])),

      S('EXPLANATION FORM', '한 페이지는 하나의 인과 주장을 완성한다', '왜 순서도만으로는 설계를 설명할 수 없는가?',
        formula('성립 조건 × 이론 렌즈 × 코드 구체화 × 실패 반례 → 설계 의미') +
        p('실행 순서는 “무엇 다음에 무엇”을 보여 주지만, 왜 경계가 필요한지와 어떤 조건에서 비유가 깨지는지는 보여 주지 않는다. 따라서 본문은 원인과 제약을 먼저 설명하고, 순서는 race·pairing·settlement처럼 시간 자체가 불변조건인 경우에만 사용한다.') +
        strong('독해 규칙', '코드 이름을 이론 용어로 치환하지 않는다. 유사성을 만드는 관찰과 유사성이 끝나는 한계를 함께 적는다.')),

      S('CLAIM TYPES', '사실·추론·비유·제안을 같은 문장에 섞지 않는다', '“이 코드는 transaction이다”라는 말은 어느 수준에서 참인가?',
        table(['종류', '허용되는 말', '필요한 증거'], [
          ['관찰 사실', '특정 branch가 tombstone을 삽입한다', '고정 revision 코드 좌표'],
          ['source-backed inference', 'pairing invariant를 보존하려는 구조다', '여러 코드 관찰 + 반례'],
          ['bounded analogy', 'turn은 saga와 닮았다', '공통 구조 + 차이와 종료점'],
          ['proposal', 'journal과 projection을 분리할 수 있다', '목표 scenario + 위험 + oracle'],
        ]) + strong('비보상 원칙', '코드 좌표가 많아도 잘못된 개념 연결을 보상하지 못하고, 유명한 이론도 직접 코드 관찰을 대체하지 못한다.') + refs([local('artifacts/knowledge/architecture/engineering-decision-rubrics-and-reuse-evaluation.md', 'decision rubric knowledge')])),

      S('ABSTRACTION', '서로 다른 추상화 수준을 연결하되 합치지 않는다', '언어 기능, 패턴, 제품 책임은 어떤 관계인가?',
        layers([
          ['언어 메커니즘', 'async generator, discriminated union, AbortSignal, dynamic import'],
          ['구현 패턴', 'stream protocol, optimistic validation, projection, registry'],
          ['capability', 'context compilation, authorized effect, resume, provider adaptation'],
          ['제품 불변조건', '잘못된 파일을 덮어쓰지 않음, 효과와 관찰의 pairing, 재개 정합성'],
          ['운영 가치', '안전·신뢰성·latency·호환성·변경 가능성'],
        ]) + p('아래 층은 위 층을 실현하지만 동일하지 않다. generator를 제거해도 protocol을 다른 방식으로 보존할 수 있고, generator를 사용해도 cancellation과 durability는 자동으로 생기지 않는다.')),

      S('THEORY MAP', '이론은 이름표가 아니라 반례 생성기다', '배경지식은 코드 설명을 어떻게 더 엄격하게 만드는가?',
        table(['이론', '설명하는 압력', '검사하게 만드는 반례'], [
          ['compiler IR', 'heterogeneous context의 lowering', '변환 뒤 provenance·순서·타입 손실'],
          ['reference monitor', 'effect 앞의 지속적 중재', 'schema 통과를 권한으로 오인'],
          ['OCC / TOCTOU', '읽은 상태와 쓸 상태의 시간차', '검사와 write 사이 await'],
          ['Saga', '되돌릴 수 없는 부분 효과', 'retry가 같은 명령을 중복 실행'],
          ['projection', '여러 소비자 표현', 'UI state를 durable truth로 승격'],
          ['product line', 'build/provider별 가변성', 'gate 밖 static import로 제외 코드 유입'],
        ])),

      S('LOCAL-FIRST', '저장소 지식을 먼저 쓰고 외부 이론은 빈틈만 채운다', '왜 외부 자료가 많을수록 좋은 보고서가 아닌가?',
        argue({
          condition: '현재 저장소는 이미 지식 lifecycle, projection, bias, tradeoff, operating model을 보유한다.',
          lens: 'Progressive acquisition은 competency question과 gap을 먼저 만들고, 필요한 증거만 추가한다.',
          realization: 'local owner 문서가 설명 방법과 경계를 제공하고, 외부 specification·원 논문은 언어/보안/동시성의 residual gap을 채운다.',
          failure: '검색 결과를 chapter 목록으로 바꾸면 repository context와 source applicability가 사라진다.',
          synthesis: '외부 출처의 역할은 권위를 빌리는 것이 아니라 현재 해석을 반증하거나 경계를 정교하게 하는 것이다.',
        }) + refs([local('artifacts/knowledge/README.md'), local('docs/reference/README.md'), local('artifacts/knowledge/operations/progressive-knowledge-acquisition-and-modeling.md')])),

      S('BIAS', '코드 분포는 중요도가 아니라 탐색 신호다', '39,050줄의 shell 관련 코드가 무엇을 증명하는가?',
        p('분량은 구현 비용과 edge-case 표면을 보여 주지만 제품 중요도를 직접 측정하지 않는다. comment의 security marker 역시 실제 취약점 수가 아니다. 분포는 “어디에서 어떤 설명 질문을 더 물을 것인가”를 정하는 탐색 prior로만 쓴다.') +
        table(['관찰', '말할 수 있음', '말할 수 없음'], [
          ['shell/security 밀도', 'parser·platform·policy pressure가 넓다', 'Bash가 가장 중요한 기능이다'],
          ['generator 55개', '메커니즘이 희소하다', '모든 generator가 핵심 turn에 속한다'],
          ['logEvent 1,088회', '관측 seam이 넓다', '운영 품질이 우수하다'],
          ['큰 REPL 파일', '책임 후보가 집적됐다', '분해하면 자동으로 cohesion이 좋아진다'],
        ])),

      S('QUALITY SCENARIO', '“좋은 구조”를 stimulus와 response로 바꾼다', '리팩터링 논의를 어떻게 검증 가능한 질문으로 만드는가?',
        chain([
          ['source', '사용자·IDE·provider·filesystem'],
          ['stimulus', '편집 중 파일 변경·abort·stream 오류'],
          ['environment', 'tool 실행 중·resume·fallback'],
          ['artifact', 'engine·tool·journal·projection'],
          ['response', '거부·repair·settle·retry'],
          ['measure', '중복 효과 0·orphan 0·허용 latency'],
        ]) + p('이 구조는 “maintainability가 좋아진다”를 작은 검증 문제로 내린다. 실제 response measure는 upstream owner가 없으므로 보고서가 임의로 확정하지 않는다.') + refs([local('artifacts/knowledge/architecture/architecture-characteristics-and-tradeoffs.md'), ext('https://www.sei.cmu.edu/library/quality-attribute-workshops-qaws-third-edition/', 'SEI QAW')])),

      S('CORE MODEL', '다섯 책임이 하나의 코드 변경을 성립시킨다', '프로젝트 핵심을 가장 작게 표현하면 무엇인가?',
        formula('Evidence-bearing Context → Proposed Program → Authorized Effect → Typed Observation → Durable Reconciliation') +
        p('Context는 단순 token 묶음이 아니라 출처와 순서를 가진 실행 입력이다. Proposed Program은 tool name과 arguments로 표현된다. Effect는 permission과 현재 상태를 통과해야 한다. Observation은 같은 tool id와 결합해야 하며, reconciliation은 다음 turn·transcript·resume가 같은 과거를 보게 한다.') +
        strong('핵심성 판정', '이 다섯 책임을 직접 소유하거나 그 불변조건을 지지하지 않는 기능은 확장·adapter·projection으로 분류한다.')),

      S('VIDEOS', '영상의 통찰을 중심축 안에 배치한다', 'generator와 UI를 어떻게 과대평가하지 않으면서 활용하는가?',
        table(['영상 주제', '유효한 통찰', '보고서에서의 위치'], [
          [ext('https://www.youtube.com/watch?v=3ZnBDXQQN_E', 'async generator'), 'suspension과 progressive observation', 'turn protocol의 시간 표현'],
          [ext('https://www.youtube.com/watch?v=W83jWFwEnTU&t=61s', 'React/Ink UI'), 'terminal을 state projection으로 구성', 'interactive adapter와 canonical state 경계'],
        ]) + p('두 주제는 큰 축의 일부다. 영상의 설명은 코드를 읽는 hypothesis로 쓰고, ECMAScript·React/Ink owner 자료와 실제 구현으로 범위를 교정한다.')),

      S('STUDY METHOD', '학습은 설명을 재현하는 것이 아니라 반례를 만드는 일이다', '한 개념을 이해했는지 어떻게 확인하는가?',
        layers([
          ['명제', '“Edit는 stale write를 막는다”처럼 falsifiable하게 쓴다.'],
          ['전제', 'read state가 있고 같은 대상 identity를 비교한다.'],
          ['반례', '검사 뒤 write 전에 외부 변경을 삽입한다.'],
          ['관찰', '효과 발생 여부·오류·transcript·resume state를 함께 본다.'],
          ['구조 결론', '어떤 owner와 critical section이 불변조건을 가져야 하는지 설명한다.'],
        ])),

      S('VOLUME MAP', '여섯 권은 기능이 아니라 문제 경계로 나뉜다', '어떤 순서로 읽어야 인과 관계가 유지되는가?',
        table(['권', '문제 경계', '중심 질문'], [
          ['01', 'context compiler', '모델이 보게 되는 세계는 어떻게 만들어지는가'],
          ['02', 'effect interpreter', '제안은 언제 실제 행동이 될 자격을 얻는가'],
          ['03', 'turn semantics', '부분 효과 뒤 한 turn을 어떻게 닫는가'],
          ['04', 'projection', 'UI·SDK·transcript는 어떤 진실을 보여 주는가'],
          ['05', 'evolution', '불변조건을 잃지 않고 구조를 어떻게 바꾸는가'],
        ]) + strong('읽기 경로', '처음에는 00→01→02→03을 읽고, UI 관심자는 04로, 리팩터링·운영 관심자는 05로 이어 간다.')),

      S('LIMIT', '상세함은 확실성의 과장이 아니다', '무엇을 끝까지 unknown으로 남기는가?',
        p('누락된 `src/types/message.ts`와 `src/query/transitions.ts`, incomplete build, shallow history, 실제 provider cohort와 production metric, upstream roadmap은 복원할 수 없다. 이 자료는 그 빈칸을 architecture pattern으로 메우지 않는다.') +
        quote('모르는 것을 지우지 않는 것이 상세한 설명의 일부다.') +
        refs([src('README_KR.md', '1-62'), local('docs/reference/operations/knowledge-reference-lifecycle-rubric-operation.md', 'knowledge lifecycle rubric operation')])),
    ],
  },

  {
    volume: '01', slug: '01-context-compiler-and-representation', accent: '#6556c7', symbol: 'CTX',
    title: 'Context Compiler와 표현의 경제학',
    subtitle: 'prompt를 문자열이 아니라 provenance·순서·cache 제약을 가진 실행 표현으로 이해한다',
    claim: '모델의 추론 품질은 호출 함수보다 호출 전에 어떤 세계를 어떤 순서로 구성했는지에 좌우된다.',
    sections: [
      S('PROBLEM FRAME', '모델은 저장소를 직접 보지 않는다', '코드베이스의 어떤 부분이 실제 model world가 되는가?',
        argue({condition:'모델 입력에는 system, tools, messages, attachments, memory, compact summary가 제한된 budget 안에서 합류한다.',lens:'Knowledge Projection은 canonical source와 consumer-specific compression을 분리한다.',realization:'QueryEngine이 session context를 모으고 queryContext/API layer가 provider request 형태로 낮춘다.',failure:'파일이 저장소에 존재해도 선택·순서·변환에서 빠지면 모델에게는 존재하지 않는다.',synthesis:'context construction은 retrieval이 아니라 세계 모델의 선택·변환·직렬화다.'}) + refs([src('src/QueryEngine.ts','284-325'),src('src/utils/queryContext.ts','1-74'),local('artifacts/knowledge/operations/knowledge-projection-and-contextualization.md')])),
      S('COMPILER ANALOGY', 'compiler 비유는 transformation invariant에서 성립한다', '문맥 조립을 컴파일이라고 부를 근거는 무엇인가?',
        argue({condition:'서로 다른 source language가 provider-specific ordered blocks로 변환된다.',lens:'IR은 여러 front end와 target 사이에서 분석·변환 가능한 공통 표현을 제공한다.',realization:'내부 message/attachment/tool representation이 API payload와 cache layout으로 lowering된다.',failure:'형식적 문법·정적 의미·code generation 전체가 없으므로 일반 compiler와 동일시할 수 없다.',synthesis:'비유의 유효 범위는 typed normalization, ordered transformation, invariant preservation, target lowering이다.'}) + refs([ext('https://llvm.org/docs/LangRef.html','LLVM IR'),ext('https://mlir.llvm.org/docs/LangRef/','MLIR'),src('src/services/api/claude.ts','1387-1495')])),
      S('CONTEXT IR', '좋은 중간 표현은 출처를 잃지 않는다', '문자열 배열보다 무엇이 더 필요할까?',
        table(['필드', '보존해야 할 이유', '손실 시 실패'],[
          ['kind/role','provider protocol과 pairing','user/tool/system 의미 혼동'],
          ['provenance','삭제·압축·재생 판단','summary가 원문처럼 권위화'],
          ['stability class','cache prefix 배치','매 turn cache invalidation'],
          ['visibility','UI/SDK/model 소비 차이','progress가 reasoning history로 유입'],
          ['durability','resume 포함 여부','현재 화면과 재개 state 불일치'],
          ['budget cost','압축/제외 판단','중요 constraint가 뒤늦게 절단'],
        ]) + refs([ext('https://www.w3.org/TR/prov-o/','W3C PROV-O'),src('src/utils/messages.ts','1-180')])),
      S('PROVENANCE', '내용과 유래는 서로 다른 정확성 축이다', '같은 문장이 어디서 왔는지가 왜 중요한가?',
        argue({condition:'user instruction, tool observation, compact summary, memory는 같은 text라도 다른 신뢰·수명·override 규칙을 가진다.',lens:'PROV는 Entity, Activity, Agent와 derivation을 분리한다.',realization:'message kind와 metadata가 projection·resume·provider normalization에서 다른 처리를 받는다.',failure:'압축된 inference를 원 관찰처럼 취급하면 다음 turn이 잘못된 확신을 누적한다.',synthesis:'context correctness는 text accuracy뿐 아니라 lineage와 transformation honesty를 포함한다.'}) + refs([ext('https://www.w3.org/TR/prov-o/','PROV-O'),local('artifacts/knowledge/governance/contextual-knowledge-and-repository-bias-control.md')])),
      S('ORDER', '순서는 의미와 비용을 동시에 바꾼다', '왜 같은 block 집합의 재정렬이 동등하지 않은가?',
        p('instruction precedence, recency, tool/result adjacency, cache prefix가 모두 순서에 의존한다. 따라서 context는 set이 아니라 ordered, typed sequence다. “내용이 같다”는 것은 provider request의 동등성을 보장하지 않는다.') +
        strong('구조적 귀결','정렬 안정성은 performance 최적화가 아니라 semantic/cache compatibility contract가 된다.') + refs([src('src/tools.ts','329-367'),src('src/services/api/claude.ts','1387-1495'),ext('https://platform.claude.com/docs/en/build-with-claude/prompt-caching','Anthropic prompt caching')])),
      S('CACHE PREFIX', 'cache는 data structure의 모양을 architecture로 끌어올린다', '왜 tool 순서를 안정화해야 하는가?',
        argue({condition:'Anthropic cache는 tools→system→messages의 prefix 계층을 사용한다.',lens:'공통 prefix reuse는 동일성 판단이 앞부분의 byte/order 변화에 민감하다는 뜻이다.',realization:'tool pool ordering과 queryContext의 cache-key prefix가 request 조립과 인접한다.',failure:'시간·상태를 static prefix에 섞거나 tool list를 흔들면 의미는 같아도 cache가 깨진다.',synthesis:'cache-aware architecture는 안정 content를 앞에, volatile content를 뒤에 두는 change-frequency partitioning이다.'}) + refs([ext('https://platform.claude.com/docs/en/build-with-claude/prompt-caching','official prompt caching'),src('src/utils/queryContext.ts','1-42'),src('src/tools.ts','329-367')])),
      S('TOOLS AS LANGUAGE', 'tool schema는 모델이 사용할 언어의 문법이다', '왜 도구 추가가 prompt 변경이기도 한가?',
        argue({condition:'모델은 tool name, description, input schema를 통해 가능한 행동을 배운다.',lens:'문법은 표현 가능한 program space를 정의하지만, 실행 권한이나 의미의 참을 보장하지 않는다.',realization:'Tool은 schema와 prompt description, call, result mapping을 한 계약에 결합한다.',failure:'schema만 바꾸고 permission·presentation·history를 갱신하지 않으면 같은 이름의 언어가 다른 의미를 갖는다.',synthesis:'tool registry는 API 목록이 아니라 model-facing language environment다.'}) + refs([src('src/Tool.ts','362-700'),src('src/tools.ts','185-367'),ext('https://modelcontextprotocol.io/specification/2025-06-18/server/tools','MCP Tools')])),
      S('TYPE SYSTEM', 'TypeScript 타입과 runtime schema는 다른 실패를 막는다', '컴파일 성공이 model input을 안전하게 만드는가?',
        table(['경계','보장','보장하지 않음'],[
          ['TypeScript','개발 시 표현 관계','외부 JSON shape'],
          ['Zod/runtime parse','현재 process의 input shape','path 존재·권한·의도'],
          ['tool validation','tool-specific semantic precondition','사용자 승인'],
          ['permission','정책상 실행 가능성','effect 성공·최신 상태'],
          ['result mapping','model/UI 관찰 형태','durable settlement'],
        ]) + p('여러 검증층은 중복이 아니라 서로 다른 proposition을 판정한다.') + refs([src('src/services/tools/toolExecution.ts','337-636'),ext('https://json-schema.org/draft/2020-12','JSON Schema 2020-12')])),
      S('ATTACHMENTS', 'attachment는 메시지 부록이 아니라 late-bound context다', '파일 변화와 hook 결과는 언제 message가 되는가?',
        p('attachment는 UI 입력 순간의 text와 다른 시간에 계산되고, 일부는 API normalization에서 user content로 변환된다. 이것은 context가 한 번에 생성되는 값이 아니라 여러 observation source를 합성한 snapshot임을 보여 준다.') +
        strong('학습 포인트','attachment를 읽을 때 content뿐 아니라 생성 시점, source state, model visibility, transcript durability를 함께 추적한다.') + refs([src('src/utils/attachments.ts','1-220'),src('src/utils/processUserInput/processUserInput.ts','64-269')])),
      S('MEMORY', 'memory는 더 긴 prompt가 아니라 별도 수명의 지식이다', '세션 message와 memory를 왜 구분해야 하는가?',
        argue({condition:'memory는 turn을 넘어 재사용되며 현재 request보다 오래 살 수 있다.',lens:'reusable knowledge와 execution context는 수명·owner·compression 경계가 다르다.',realization:'memdir와 context assembly가 durable knowledge를 현재 query에 투영한다.',failure:'현재 task의 추측이 memory로 승격되면 future context에 authority drift가 생긴다.',synthesis:'memory quality는 recall 양이 아니라 provenance, applicability, invalidation을 보존하는가로 평가해야 한다.'}) + refs([src('src/memdir/memdir.ts','1-220'),local('artifacts/knowledge/operations/knowledge-projection-and-contextualization.md')])),
      S('COMPACTION', 'compact는 요약 기능이 아니라 lossy state migration이다', 'token을 줄이는 대신 무엇을 잃을 수 있는가?',
        argue({condition:'history가 budget을 넘으면 일부 과거를 summary로 바꾸어 다음 request를 계속해야 한다.',lens:'lossy transformation은 source snapshot, omitted claims, reason, invalidation을 추적해야 한다.',realization:'query loop가 budget pressure를 감지하고 compact path를 거쳐 새 context state를 구성한다.',failure:'permission decision, unresolved error, tool pairing 같은 protected fact가 summary에서 사라지면 future action이 달라진다.',synthesis:'compact의 acceptance는 “짧아졌다”가 아니라 future decision equivalence를 얼마나 보존했는가다.'}) + refs([src('src/query.ts','365-543'),src('src/services/compact/compact.ts','1-220'),local('artifacts/knowledge/operations/knowledge-projection-and-contextualization.md')])),
      S('LOSS BUDGET', '모든 token은 같은 가치가 아니다', '무엇을 먼저 압축해야 하는가?',
        table(['정보 종류','손실 비용','처리 원칙'],[
          ['권한·금지 constraint','unauthorized effect','보호·반복 가능'],
          ['unresolved failure','같은 실패 재실행','원인·fingerprint 보존'],
          ['tool identity/pairing','protocol invalid','구조 보존'],
          ['대화 수사·중복 설명','낮음','요약/제거 후보'],
          ['raw observation','상황 의존','digest + 필요한 excerpt'],
          ['derived conclusion','오류 누적','inference 표지 + source 연결'],
        ]) + strong('비보상 규칙','많은 저가치 token을 줄였다는 이득이 protected constraint 하나의 손실을 보상하지 못한다.')),
      S('OBSERVER COPY', '관찰용 변환이 실행 입력을 오염시키면 안 된다', '왜 observer를 위한 clone이 필요한가?',
        p('provider fallback이나 observer instrumentation은 같은 request를 다른 목적으로 본다. 관찰을 위해 mutable message를 수정하면 cache identity와 실제 호출 의미까지 변할 수 있다. 그래서 관찰 projection은 execution input과 identity를 분리해야 한다.') +
        refs([src('src/query.ts','709-787'),local('artifacts/knowledge/operations/knowledge-projection-and-contextualization.md')])),
      S('BUDGET', 'context budget은 단순 길이 제한이 아니다', '어떤 경쟁을 조정하는 정책인가?',
        table(['경쟁','한쪽을 늘릴 때','다른 쪽의 위험'],[
          ['tools vs history','능력 표현 증가','작업 기억 감소'],
          ['raw evidence vs summary','grounding 증가','token/latency 증가'],
          ['stable prefix vs personalization','cache reuse 증가','현재성 감소'],
          ['progress visibility vs reasoning purity','관찰성 증가','noise 유입'],
        ]) + p('따라서 token count 하나로 최적화하지 않고 correctness·cache·latency·omission risk를 vector로 본다.')),
      S('TEST', 'Context compiler는 golden text보다 metamorphic property로 시험한다', 'provider request 전체 snapshot만으로 충분한가?',
        table(['변환','보존되어야 할 property','탐지하려는 실패'],[
          ['tool input 순서 변화 없음','stable prefix hash','비결정적 registry'],
          ['UI-only progress 추가','model request 불변','projection leakage'],
          ['compact 실행','protected constraint 유지','lossy omission'],
          ['observer 활성화','execution payload 불변','instrumentation mutation'],
          ['resume','tool pairing/terminal 유지','history repair drift'],
        ]) + strong('oracle','snapshot은 변화를 보여 주고, metamorphic property는 어떤 변화가 허용되지 않는지 설명한다.')),
      S('DESIGN CONSEQUENCE', '명시적 ContextIR이 필요한 이유', '새 타입을 만드는 것이 complexity를 늘리는가 줄이는가?',
        argue({condition:'현재 context 규칙은 QueryEngine, query, API, messages, compact에 분산된다.',lens:'공통 IR은 transformation contract와 analysis seam을 제공한다.',realization:'source ref, role, visibility, stability, durability, budget cost를 가진 block union을 경계에 둘 수 있다.',failure:'IR이 provider payload를 그대로 복제하거나 모든 metadata를 끌어안으면 새 god object가 된다.',synthesis:'IR의 가치는 중앙화가 아니라 변환 전후에 반드시 보존할 property를 명시하는 데 있다.'}) + refs([src('src/QueryEngine.ts','284-325'),src('src/services/api/claude.ts','1387-1495'),ext('https://llvm.org/docs/LangRef.html','LLVM IR')])),
      S('EXERCISE', '실습: cache hit보다 의미 동등성을 먼저 측정한다', '어떤 실험이 context 설계를 드러내는가?',
        layers([
          ['fixture','같은 task·tools·history에서 volatile timestamp 하나만 바꾼다.'],
          ['observation','request prefix hash, cache read/write token, model-visible blocks를 비교한다.'],
          ['variant','tool order, observer, compact, resume를 하나씩 바꾼다.'],
          ['falsification','동일해야 할 request가 달라지거나 다른 request가 같아지면 실패다.'],
          ['design note','어떤 block field와 owner가 차이를 설명해야 하는지 기록한다.'],
        ])),
      S('CONCLUSION', 'Context는 모델 앞의 작은 운영체제다', '이 권에서 남겨야 할 한 문장은 무엇인가?',
        quote('모델이 보게 되는 세계는 발견되는 것이 아니라, provenance·budget·cache·policy 아래 컴파일된다.') +
        p('따라서 context bug는 prompt wording 문제만이 아니다. 잘못된 source 선택, ordering, projection leakage, lossy migration, cache coupling도 모두 같은 제품 결과를 바꾼다.')),
    ],
  },

  {
    volume: '02', slug: '02-effect-interpreter-and-safety', accent: '#d34e3e', symbol: 'FX',
    title: 'Effect Interpreter와 안전한 코드 변경',
    subtitle: '모델의 tool proposal을 schema·권한·현재 상태·실제 효과의 결합 문제로 읽는다',
    claim: '도구 호출의 핵심은 함수를 실행하는 것이 아니라, 그 실행이 지금 이 대상에 허용되고 여전히 유효한지를 판정하는 일이다.',
    sections: [
      S('PROBLEM FRAME', '모델 출력은 신뢰할 수 없는 프로그램이다', 'tool_use를 단순 데이터로 보면 무엇을 놓치는가?',
        argue({condition:'tool name과 arguments는 파일·shell·network 효과를 표현할 수 있다.',lens:'interpreter는 syntax를 읽고 semantics를 선택하며, protection system은 effect를 중재한다.',realization:'registry lookup→parse→validate→permission→call→result mapping이 작은 실행 pipeline을 이룬다.',failure:'JSON이 valid하다는 이유로 실행하면 model error와 adversarial content가 곧 authority가 된다.',synthesis:'tool runtime은 model proposal language의 interpreter이자 policy enforcement boundary다.'}) + refs([src('src/services/tools/toolExecution.ts','337-636'),src('src/Tool.ts','362-700'),ext('https://modelcontextprotocol.io/specification/2025-06-18/server/tools','MCP Tools')])),
      S('FOUR VALIDITIES', 'valid는 하나의 boolean이 아니다', '도구 입력이 실행될 자격을 얻으려면 무엇이 모두 참이어야 하는가?',
        formula('Representable ∧ Semantically admissible ∧ Authorized ∧ Current-state valid') +
        table(['판정','질문','대표 실패'],[
          ['표현','schema에 맞는가','필수 field 누락'],
          ['의미','이 tool의 precondition을 만족하는가','읽지 않은 파일 편집'],
          ['권한','이 subject가 이 effect를 해도 되는가','deny rule/path 범위'],
          ['현재성','판정 뒤 resource가 그대로인가','mtime/content 변경'],
        ]) + refs([src('src/services/tools/toolExecution.ts','337-636'),ext('https://json-schema.org/draft/2020-12','JSON Schema')])),
      S('REFERENCE MONITOR', 'permission은 호출 전 한 번 묻는 UI가 아니다', 'complete mediation은 어디에 나타나야 하는가?',
        argue({condition:'각 resource access는 subject, action, target, current policy에 따라 달라진다.',lens:'Saltzer–Schroeder의 complete mediation과 least privilege는 모든 접근의 중재와 최소 권한을 요구한다.',realization:'general permission context와 input-specific tool validation이 호출 직전에 결합된다.',failure:'tool 등록 때 “safe”로 분류한 뒤 입력별 target을 다시 보지 않으면 권한이 너무 넓어진다.',synthesis:'permission boundary는 static tool classification보다 실제 effect request 가까이에 있어야 한다.'}) + refs([src('src/Tool.ts','123-240'),src('src/services/tools/toolExecution.ts','337-430'),ext('https://csrc.nist.gov/pubs/sp/800/207/final','NIST least privilege')])),
      S('TOOL CONTRACT', '하나의 Tool 타입에 서로 다른 변화 이유가 모여 있다', '강한 계약과 과결합을 어떻게 구분하는가?',
        table(['facet','consumer','변화 압력'],[
          ['model schema/prompt','provider/model','capability 표현'],
          ['effect implementation','filesystem/process','runtime·platform'],
          ['permission/validation','policy/user','security·authority'],
          ['result mapping','model/protocol','pairing·error semantics'],
          ['presentation','React/Ink','interactive UX'],
          ['telemetry/search','operations','관측·discoverability'],
        ]) + p('한 object가 end-to-end coherence를 제공하는 장점과, 독립 변화가 모두 같은 타입을 흔드는 비용이 동시에 존재한다. 분해는 facet 사이 invariant를 새 adapter가 보존할 때만 개선이다.') + refs([src('src/Tool.ts','362-793')])),
      S('BUILDER DEFAULTS', '기본값은 보이지 않는 정책이다', 'false 하나가 어떤 safety claim을 만드는가?',
        argue({condition:'많은 tool이 공통 builder로 생성되어 생략된 field를 default로 받는다.',lens:'secure default는 미지정 상태에서 권한을 넓히지 않아야 한다.',realization:'concurrency/read-only/destructive 관련 default가 registry 전체의 behavior floor를 만든다.',failure:'`isDestructive=false`를 “안전함”으로 해석하면 tool-specific partial effect를 놓친다.',synthesis:'default는 편의 값이 아니라 새 tool이 증명하기 전까지 적용되는 보수적 policy여야 한다.'}) + refs([src('src/Tool.ts','701-793')])),
      S('READ BEFORE WRITE', 'FileEdit의 읽기 요구는 UX 규칙이 아니다', '왜 모델이 파일을 읽었다는 사실이 write precondition이 되는가?',
        argue({condition:'편집 proposal은 읽은 content와 위치를 전제로 한다.',lens:'optimistic concurrency는 작업 중 lock 대신 commit 직전 관찰 version을 검증한다.',realization:'read state, full-read 요구, content/mtime 검사가 edit validation과 critical section을 구성한다.',failure:'read와 write 사이 외부 변경을 무시하면 syntactically valid patch가 다른 program을 손상한다.',synthesis:'read-before-write는 model grounding과 concurrency control을 같은 evidence에 묶는다.'}) + refs([src('src/tools/FileEditTool/FileEditTool.ts','137-361'),ext('https://db.cs.cmu.edu/papers/1981/kung-tods1981.pdf','Kung & Robinson OCC')])),
      S('TOCTOU', '검사 직후의 await가 correctness를 무너뜨릴 수 있다', '왜 critical section 주석이 구조적 계약인가?',
        argue({condition:'검사 대상은 다른 process나 user가 바꿀 수 있는 shared file이다.',lens:'TOCTOU는 check와 use 사이 property가 변해 protection assumption이 깨지는 문제다.',realization:'staleness check와 write 사이 await를 두지 말라는 경계가 코드에 명시된다.',failure:'permission prompt, telemetry flush, LSP query를 사이에 넣으면 race window가 다시 열린다.',synthesis:'async code에서 “await가 없음”은 미세 최적화가 아니라 atomicity approximation의 일부다.'}) + refs([src('src/tools/FileEditTool/FileEditTool.ts','425-491'),ext('https://cwe.mitre.org/data/definitions/367.html','CWE-367')])),
      S('OCC LIMIT', '파일 편집은 database transaction이 아니다', 'OCC 비유는 어디서 끝나는가?',
        table(['database OCC','FileEdit에서 대응','남는 차이'],[
          ['read set/version','read state + mtime/content','filesystem identity·symlink'],
          ['validation phase','write 직전 stale check','여러 파일 atomicity 없음'],
          ['write phase','파일 content 갱신','crash durability/rollback 별도'],
          ['abort/retry','stale 오류 후 재읽기','모델 재추론과 user intent 변화'],
        ]) + strong('경계','“낙관적 동시성 모양”은 유효하지만 serializable transaction이라고 부르면 과장이다.')),
      S('POST EFFECT', 'write 이후에도 effect는 끝나지 않는다', '파일 bytes 변경과 제품 상태 완료는 같은가?',
        chain([
          ['write','filesystem bytes'],
          ['read-state','future stale check 기준'],
          ['history','undo/recovery 근거'],
          ['LSP/IDE','dependent observer 갱신'],
          ['telemetry','운영 관찰'],
          ['tool_result','model protocol 합류'],
        ]) + p('이 순서는 effect 자체와 projection/observation을 구분하기 위해서만 제시한다. 하나가 실패했을 때 write를 되돌릴 수 있는지, degraded success로 볼지, 다음 turn에 어떤 사실을 알려야 하는지가 핵심이다.') + refs([src('src/tools/FileEditTool/FileEditTool.ts','493-573')])),
      S('SHELL', 'Bash는 문자열이 아니라 또 하나의 언어다', 'prefix allowlist가 왜 쉽게 깨지는가?',
        argue({condition:'shell은 quoting, substitution, pipelines, redirection, env, wrappers를 해석한다.',lens:'injection은 data가 command structure를 바꿀 때 발생한다.',realization:'bashSecurity와 bashPermissions가 syntax와 command semantics를 여러 단계에서 해석한다.',failure:'첫 token만 안전해도 `&&`, `$()`, redirection, env PATH, wrapper가 다른 effect를 추가한다.',synthesis:'shell permission은 command-name 분류가 아니라 program analysis의 축소판이다.'}) + refs([src('src/tools/BashTool/bashSecurity.ts','783-1150'),src('src/tools/BashTool/bashPermissions.ts','1183-1700'),ext('https://cheatsheetseries.owasp.org/cheatsheets/OS_Command_Injection_Defense_Cheat_Sheet.html','OWASP command injection')])),
      S('LANGUAGE GAP', '완전한 shell 해석과 실용적 policy 사이에는 간극이 있다', '어떤 방어를 겹쳐야 하는가?',
        table(['층','역할','단독 한계'],[
          ['prompt','모델이 위험 행동을 덜 제안','adversarial/오류에 취약'],
          ['parser/normalization','실제 구조 추출','shell 방언·dynamic expansion'],
          ['allow/deny policy','알려진 capability 제한','semantic 우회·새 command'],
          ['user confirmation','intent 확인','피로·복잡한 command 이해'],
          ['sandbox','blast radius 제한','설정·platform gap'],
          ['telemetry/recovery','사후 진단','이미 발생한 비가역 효과'],
        ]) + strong('defense in depth','어느 한 층도 “안전한 Bash”를 증명하지 않는다. 각 층은 다른 failure mode를 줄인다.')),
      S('CONCURRENCY', '병렬성은 tool 이름이 아니라 입력별 효과에서 결정된다', 'Read는 항상 병렬이고 Bash는 항상 직렬인가?',
        argue({condition:'같은 tool도 target과 arguments에 따라 resource 충돌 가능성이 달라진다.',lens:'commutativity가 없는 effect의 순서 변경은 observable behavior를 바꾼다.',realization:'`isConcurrencySafe(input)`로 연속 safe group을 병렬화하고 unsafe group은 직렬화한다.',failure:'classifier parse 오류를 safe로 처리하거나 alias resolution 뒤 의미가 달라지면 race가 발생한다.',synthesis:'concurrency policy는 type-level marker보다 effect summary에 가까워야 한다.'}) + refs([src('src/services/tools/toolOrchestration.ts','19-188')])),
      S('ORDERED EFFECTS', '결과 배열 순서와 실행 완료 순서는 다르다', '병렬 실행 후 다음 model turn은 무엇을 보아야 하는가?',
        p('병렬 tool은 완료 시간이 달라도 original tool_use order에 맞추어 result와 context modifier가 합류해야 protocol과 reproducibility가 유지된다. 따라서 orchestration은 throughput뿐 아니라 stable observation order를 소유한다.') +
        strong('설계 질문','완료 순서를 노출할 소비자와 semantic 순서를 요구하는 소비자를 분리했는가?') + refs([src('src/services/tools/toolOrchestration.ts','19-188'),src('src/query.ts','1363-1409')])),
      S('MCP', '확장 protocol은 authority를 상속하지 않는다', '외부 MCP tool이 등록되면 실행 자격도 생기는가?',
        argue({condition:'MCP server는 model-controlled tool surface를 제공할 수 있다.',lens:'capability discovery, schema validity, trust, effect admission은 별도 판단이다.',realization:'MCP client/adapter 결과가 내부 tool execution contract로 들어온다.',failure:'remote description을 local safety classification으로 그대로 받아들이면 provider가 authority owner가 된다.',synthesis:'확장성은 더 많은 tool을 찾는 능력이고, 안전성은 각 tool의 effect를 다시 local policy에 투영하는 능력이다.'}) + refs([src('src/services/mcp/client.ts','1-180'),ext('https://modelcontextprotocol.io/specification/2025-06-18/server','MCP server primitives')])),
      S('PARTIAL EFFECT', '오류는 “아무 일도 없었다”를 뜻하지 않는다', 'tool call이 throw하면 어떤 상태를 가정해야 하는가?',
        table(['사건','가능한 외부 상태','필요한 observation'],[
          ['spawn 후 abort','process가 계속 실행/자식 생성','pid·signal·cleanup receipt'],
          ['write 후 LSP 실패','file은 변경됨','filesystem reread + degraded result'],
          ['network timeout','remote commit 여부 unknown','idempotency key/read-back'],
          ['stream disconnect','tool proposal 일부 수신','실행 시작 여부와 request id'],
        ]) + p('오류 타입은 control-flow 정보가 아니라 effect uncertainty를 표현해야 한다. unknown을 false로 바꾸면 retry가 중복 효과를 만든다.')),
      S('RESULT', 'tool_result는 관찰이자 다음 프로그램의 입력이다', '오류 메시지의 구조가 왜 중요한가?',
        argue({condition:'모델은 result를 읽고 다음 tool proposal을 만든다.',lens:'interpreter의 observation은 다음 transition을 결정하는 typed feedback이다.',realization:'result mapping은 model content, UI display, error status를 구분한다.',failure:'raw exception을 그대로 넣으면 비밀·noise·provider-incompatible shape가 유입되고, 너무 요약하면 recovery evidence가 사라진다.',synthesis:'result contract는 effect truth를 최소 충분하게 전달하는 anti-corruption layer다.'}) + refs([src('src/Tool.ts','362-700'),src('src/services/tools/toolExecution.ts','430-636')])),
      S('SECURITY SCENARIO', '보안은 위험 명사보다 공격 가능한 scenario로 읽는다', 'Bash permission 변경을 어떻게 검토할까?',
        chain([
          ['source','model 또는 pasted untrusted text'],
          ['stimulus','quote 속 substitution과 redirect 제안'],
          ['environment','user가 broad allow rule을 보유'],
          ['artifact','parser + permission + sandbox'],
          ['response','구조를 보수적으로 분해하거나 확인 요구'],
          ['measure','unauthorized effect 0, false block 별도 측정'],
        ]) + p('허용률 평균으로 unauthorized effect를 보상하지 않는다. 안전 hard floor와 usability observation을 분리한다.')),
      S('TEST', 'effect runtime은 negative path가 본체다', '정상 호출 snapshot 외에 무엇을 시험해야 하는가?',
        table(['case','oracle','보존 불변조건'],[
          ['schema 오류','call 미실행','syntax≠authority'],
          ['permission deny','effect 0 + paired result','protocol closure'],
          ['stale edit','write 0','read evidence freshness'],
          ['abort during effect','partial-state receipt','unknown 보존'],
          ['parallel conflict','deterministic serialization','resource consistency'],
          ['adapter throw','sanitized observation','secret/protocol safety'],
        ])),
      S('CONCLUSION', '안전한 tool은 작은 함수가 아니라 작은 제어면이다', '이 권에서 남겨야 할 한 문장은 무엇인가?',
        quote('모델이 무엇을 제안했는지보다, 누가 어떤 현재 상태에서 어떤 효과를 허용했고 무엇을 다시 관찰했는지가 더 중요하다.') +
        p('Tool abstraction의 성공은 call을 통일하는 데 있지 않다. 서로 다른 validation proposition과 partial-effect semantics를 숨기지 않으면서 동일한 turn protocol로 합류시키는 데 있다.')),
    ],
  },
]

reports.push({
  volume: '03', slug: '03-turn-semantics-recovery-and-durability', accent: '#17866e', symbol: 'TX',
  title: 'Turn Semantics, 복구, 내구성',
  subtitle: '한 번의 모델 호출이 아니라 부분 효과와 실패를 일관된 history로 닫는 문제',
  claim: 'turn은 원자적이지 않다. 그래서 더 엄격한 terminal·pairing·settlement 의미가 필요하다.',
  sections: [
    S('PROBLEM FRAME', 'turn의 경계는 API response보다 넓다', '언제 한 turn이 끝났다고 말할 수 있는가?',
      argue({condition:'한 turn 안에 streaming message, tool proposal, 외부 effect, hook, user abort, transcript write가 섞인다.',lens:'state machine에서 completion은 transition sequence와 terminal state의 의미로 정의된다.',realization:'query generator가 중간 event를 yield하고 terminal reason을 return하며 QueryEngine/entrypoint가 후처리한다.',failure:'HTTP stream 종료만 completion으로 보면 tool effect와 durable history가 아직 합류하지 않았을 수 있다.',synthesis:'turn completion은 transport 종료가 아니라 protocol·effect·durability의 settlement 조건이다.'}) + refs([src('src/query.ts','219-321'),src('src/QueryEngine.ts','209-463')])),
    S('TRANSACTION ANALOGY', 'transaction 비유는 불변조건에서만 쓴다', '어떤 점이 transaction-like하고 어떤 점이 아닌가?',
      table(['성질','turn에서 대응','차이'],[
        ['일관된 종료','terminal reason과 message pairing','여러 외부 system atomic commit 없음'],
        ['중간 상태','progress/tool events','소비자에게 의도적으로 노출'],
        ['abort','generation/tool 취소','이미 실행된 effect rollback 불가'],
        ['log','transcript/session journal','완전한 WAL/redo protocol 아님'],
        ['retry','fallback/recovery branch','중복 효과 방지 별도 필요'],
      ]) + strong('정확한 표현','turn은 “transaction”이라기보다 transaction-like invariants를 가진 long-running interaction이다.')),
    S('SAGA', '부분 효과는 rollback보다 compensation을 요구한다', '왜 실패 후 이전 상태로 돌아간다고 가정할 수 없는가?',
      argue({condition:'파일 write, process spawn, network call은 이미 외부 세계를 바꿀 수 있다.',lens:'Saga는 long-lived work를 여러 transaction과 compensating action으로 본다.',realization:'query는 tool failure/abort를 result와 terminal reason으로 합류시키고 후속 recovery를 선택한다.',failure:'모든 tool에 inverse가 없고, compensation 자체도 실패할 수 있으므로 database saga 구현과 동일하지 않다.',synthesis:'Saga 비유의 가치는 “error=zero effect” 가정을 버리고 부분 효과 receipt와 후속 정합화를 요구하는 데 있다.'}) + refs([ext('https://www.cs.princeton.edu/techreports/1987/070.pdf','Garcia-Molina & Salem, Sagas'),src('src/query.ts','1267-1515')])),
    S('STATE', 'State는 변수 묶음이 아니라 transition의 증거다', 'query state를 읽을 때 무엇을 찾아야 하는가?',
      table(['state 종류','결정하는 것','필요한 증거'],[
        ['messages','다음 model world','role/pairing/provenance'],
        ['tool context','effect capability','permission/abort/session refs'],
        ['recovery guards','재시도 가능성','attempt/fingerprint/limit'],
        ['cost/cache','budget transition','token/cache usage'],
        ['terminal','caller 후처리','reason + final observations'],
      ]) + p('변수가 많다는 사실보다 어떤 transition만 그 값을 바꿀 수 있고, 그 변경이 transcript와 caller에 어떻게 투영되는지가 중요하다.') + refs([src('src/query.ts','179-321')])),
    S('PAIRING', 'tool_use와 tool_result는 protocol상의 괄호다', '왜 orphan message가 단순 표시 오류가 아닌가?',
      argue({condition:'provider와 다음 reasoning은 tool proposal과 관찰을 id로 연결해야 한다.',lens:'well-formed protocol은 open request가 정확히 대응하는 response 또는 명시적 tombstone으로 닫혀야 한다.',realization:'model error/fallback path가 missing result를 repair하거나 failed attempt의 projection을 제거한다.',failure:'orphan tool_use는 다음 request를 invalid하게 만들거나 모델이 effect 결과를 잘못 추론하게 한다.',synthesis:'pairing은 UI 정리 규칙이 아니라 conversation history의 문법 불변조건이다.'}) + refs([src('src/query.ts','709-825'),src('src/query.ts','980-1029')])),
    S('TOMBSTONE', '삭제 표지는 새 데이터가 아니라 실패한 역사를 보존한다', '왜 failed attempt를 그냥 배열에서 지우지 않는가?',
      p('fallback 때 이전 attempt의 content가 새 provider/model path에 노출되면 중복 proposal이나 invalid pairing이 생길 수 있다. tombstone은 “이 entity가 없었다”가 아니라 “이 projection에서 무효화되었다”는 lineage signal이다.') +
      strong('provenance 관점','invalidation event를 남기면 observer와 durable history가 실패 전후 entity를 구분할 수 있다.') + refs([src('src/query.ts','709-741'),ext('https://www.w3.org/TR/prov-constraints/','PROV constraints')])),
    S('FALLBACK', 'fallback은 같은 호출을 다른 provider에 다시 보내는 일이 아니다', '이미 streaming된 output과 effect가 있다면 무엇이 달라지는가?',
      argue({condition:'첫 attempt가 partial text나 tool proposal을 방출했을 수 있다.',lens:'retry safety는 operation identity와 effect uncertainty를 보존해야 한다.',realization:'request/observer projection을 정리하고 cache-related state를 보존하며 recoverable error를 일시 보류한다.',failure:'첫 attempt의 tool이 실행됐는데 두 번째 attempt가 같은 tool을 다시 제안하면 duplicate effect가 발생한다.',synthesis:'fallback policy는 transport availability와 semantic replay safety를 함께 판정해야 한다.'}) + refs([src('src/query.ts','650-825'),src('src/services/api/claude.ts','2464-2501')])),
    S('ASYNC GENERATOR', 'generator는 시간 구조를 값의 타입에 넣는다', 'Promise<Array<Event>>와 무엇이 다른가?',
      argue({condition:'caller는 turn이 끝나기 전 progress·message·tool observation을 소비해야 한다.',lens:'ECMAScript AsyncGenerator는 suspended state와 request queue를 가지며 next/return/throw completion을 구분한다.',realization:'query는 중간 AssistantMessage를 yield하고 최종 terminal state를 return한다.',failure:'consumer가 `.return()`하면 producer cleanup과 외부 effect cancellation이 자동 동치가 아니며, buffer bound도 제공하지 않는다.',synthesis:'generator의 핵심은 반복문 문법이 아니라 producer continuation과 consumer demand 사이의 protocol이다.'}) + refs([src('src/query.ts','219-250'),ext('https://tc39.es/ecma262/multipage/control-abstraction-objects.html#sec-asyncgenerator-objects','ECMAScript AsyncGenerator')])),
    S('GENERATOR STATE', 'suspended-yield는 durable checkpoint가 아니다', '메모리 continuation과 resume session을 왜 구분해야 하는가?',
      table(['개념','보존 위치','process 종료 후'],[
        ['generator local frame','runtime memory','소실'],
        ['yielded event','consumer/UI memory','소비자에 따라 소실'],
        ['transcript record','session storage','복원 후보'],
        ['external effect','filesystem/process/remote','독립적으로 지속 가능'],
        ['resume projection','reader/repair logic','history에서 재구성'],
      ]) + strong('오해 교정','generator가 “멈췄다가 이어진다”는 사실은 crash-resume나 durable workflow를 의미하지 않는다.')),
    S('BACKPRESSURE', 'pull protocol도 무한 producer를 자동으로 통제하지 않는다', 'UI가 느릴 때 어떤 queue가 커지는가?',
      argue({condition:'API stream, generator queue, React update, terminal output은 서로 다른 처리율을 가진다.',lens:'WHATWG Streams는 queue와 desiredSize를 통해 backpressure를 명시한다.',realization:'query yield는 caller가 next를 요청하는 pull 형태지만 내부 provider stream과 progress source는 별도 buffering을 가질 수 있다.',failure:'UI batch만 조절하고 upstream stream을 멈추지 못하면 memory·latency가 누적된다.',synthesis:'backpressure는 syntax property가 아니라 전체 producer–queue–consumer chain의 계약이다.'}) + refs([ext('https://streams.spec.whatwg.org/','WHATWG Streams'),src('src/services/api/claude.ts','1818-1905')])),
    S('ABORT', '취소는 신호이지 과거를 지우는 명령이 아니다', 'AbortSignal이 보장하는 것과 보장하지 않는 것은 무엇인가?',
      argue({condition:'여러 await와 tool adapter가 같은 turn의 cancellation을 관찰한다.',lens:'AbortController는 signal을 한 번 발생시키고 consumer가 협력적으로 반응하게 한다.',realization:'query와 tool context가 abort state를 검사하고 terminal/cleanup path로 이동한다.',failure:'signal을 무시하는 child process, 이미 완료된 write, finally 누락은 그대로 남는다.',synthesis:'취소 correctness는 signal 전달, effect-specific interruption, cleanup, durable reconciliation 네 층으로 나뉜다.'}) + refs([src('src/query.ts','1484-1515'),ext('https://nodejs.org/api/globals.html#class-abortcontroller','Node AbortController')])),
    S('TERMINAL', '종료 reason은 boolean보다 풍부한 caller 계약이다', 'completed=false 하나로 무엇을 잃는가?',
      table(['reason family','보존하는 의미','caller 선택'],[
        ['completed','정상 settlement','result/usage 후처리'],
        ['blocking/context limit','budget policy 중단','compact/새 turn'],
        ['model/provider error','transport/runtime 실패','fallback/표시'],
        ['aborted tools','부분 효과 가능','reconcile/interrupt 표시'],
        ['hook stopped','정책에 의한 중단','이유와 state 보존'],
        ['max turns','운영 한도','resume 가능한 종료'],
      ]) + p('복원본의 transition type 선언 일부는 누락되어 있으므로 variant 목록은 return 지점과 caller 처리에서 재구성한 관찰이다.') + refs([src('src/query.ts','1714-1728'),src('src/QueryEngine.ts','675-760')])),
    S('WRITE ORDER', 'transcript를 일찍 쓰는 것은 latency와 recoverability의 tradeoff다', '왜 query 전 user message를 기록하는가?',
      argue({condition:'process가 generation 중 kill되어도 사용자 입력은 resume에 남아야 한다.',lens:'write-ahead 모양은 effect 이전 intent를 durable record로 남긴다.',realization:'QueryEngine은 loop 시작 전 user message를 transcript에 기록하고 명시적으로 latency tradeoff를 주석화한다.',failure:'기록 성공 뒤 API 호출 전 crash하면 durable history에는 unanswered input이 남는다.',synthesis:'early persistence는 data loss를 줄이는 대신 incomplete-turn repair 의무를 만든다.'}) + refs([src('src/QueryEngine.ts','410-463')])),
    S('JOURNAL', 'sessionStorage는 저장 함수가 아니라 reconciliation system이다', '왜 persistence 파일이 커지는가?',
      p('queue, flush, transcript append, resume, repair, compaction projection, compatibility가 한 곳에 모이면 “쓰기”보다 “역사 해석” 책임이 커진다. 크기는 분해 근거가 아니라 서로 다른 consistency model이 공존한다는 탐색 신호다.') +
      table(['관심사','불변조건','변화 이유'],[
        ['append','순서·identity','runtime event'],
        ['flush','durability boundary','I/O/platform'],
        ['reader','old format 해석','compatibility'],
        ['repair','orphan/incomplete 보정','failure semantics'],
        ['projection','consumer view','SDK/resume/UI'],
      ]) + refs([src('src/utils/sessionStorage.ts','600-865'),src('src/utils/sessionStorage.ts','2090-2245')])),
    S('EVENT SOURCING LIMIT', 'transcript는 event log와 닮았지만 곧바로 event sourcing은 아니다', '어떤 조건이 더 필요할까?',
      table(['필요 조건','현재 관찰','unknown'],[
        ['append-only identity','message records/ids','모든 mutation 규칙'],
        ['versioned event schema','metadata/compat code','공식 schema owner'],
        ['deterministic projection','resume/repair logic','완전 replay corpus'],
        ['effect correlation','tool ids/request refs','외부 effect receipt 완전성'],
        ['snapshot/compaction','compact projection','lossless rebuild 가능 범위'],
      ]) + strong('정확한 표현','event-log 성격과 projection은 관찰되지만 완전한 event-sourced architecture라고 단정하지 않는다.')),
    S('QUEUED INPUT', 'turn 사이 사용자 입력은 동시성 문제다', '현재 turn이 끝나기 전 새 prompt는 어디에 속하는가?',
      argue({condition:'interactive user는 tool 실행/stream 중 새 command를 보낼 수 있다.',lens:'linearization point가 없으면 old turn과 new intent의 순서가 모호해진다.',realization:'queued commands와 context modifiers가 current/next state에 선택적으로 합류한다.',failure:'cancel과 resubmit이 엇갈리면 stale finally가 새 prompt state를 복구하거나 지울 수 있다.',synthesis:'input queue는 UX buffer가 아니라 conversation order를 정의하는 concurrency boundary다.'}) + refs([src('src/query.ts','1535-1643'),src('src/screens/REPL.tsx','2793-2865')])),
    S('RECOVERY TABLE', 'recovery는 exception type이 아니라 상태 전이 표가 필요하다', '어떤 조건이 같아야 retry가 허용되는가?',
      table(['관찰','effect certainty','허용 후보'],[
        ['request 전 실패','none','bounded retry'],
        ['text 일부 수신','none','projection reset/fallback'],
        ['tool proposal 수신, 미실행','none if proven','repair + retry'],
        ['tool 실행 시작','unknown/partial','read-back/reconcile'],
        ['write confirmed, result lost','effect yes','synthesize observation; no blind retry'],
        ['same fingerprint 반복','unchanged','stop/escalate'],
      ])),
    S('CHARACTERIZATION', '복구 의미를 trace로 고정한 뒤 구조를 바꾼다', '어떤 trace가 동등성 oracle인가?',
      layers([
        ['input','messages, tool pool, policy, abort timing, provider attempt'],
        ['events','yielded message/progress/tool ids 순서'],
        ['effects','filesystem/process diff와 receipt'],
        ['terminal','reason, usage, pending state'],
        ['durability','journal records와 resume projection'],
        ['comparison','허용된 adapter 차이와 금지된 semantic drift'],
      ])),
    S('CONCLUSION', 'turn을 닫는다는 것은 역사를 합의하는 일이다', '이 권에서 남겨야 할 한 문장은 무엇인가?',
      quote('stream이 끝났다는 사실보다, proposal·effect·observation·history가 같은 사건을 가리키는지가 중요하다.') +
      p('async generator는 이 합의 과정을 점진적으로 전달한다. 하지만 abort, duplicate effect, transcript durability, resume repair의 의미는 별도 owner와 contract가 닫아야 한다.')),
  ],
})

const CSS = String.raw`
@page{size:A4;margin:0}*{box-sizing:border-box}html,body{margin:0;background:#d8dee2;color:#17222c;font-family:"Pretendard","Apple SD Gothic Neo","Noto Sans KR",sans-serif}.sheet{--accent:#356eb3;width:210mm;height:297mm;margin:0 auto;background:#fbfaf7;padding:15mm 17mm 15mm;position:relative;overflow:hidden;break-after:page}.sheet:after{content:"";position:absolute;left:0;right:0;bottom:0;height:4mm;background:linear-gradient(90deg,var(--accent),#182b37 70%)}header{display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #c7d0d5;padding-bottom:3mm;font-size:7.2pt;letter-spacing:.13em;font-weight:800;color:var(--accent)}header em{font-style:normal;font:800 17pt ui-monospace,monospace;color:#a6b0b7}.sheet h2{font-size:22pt;line-height:1.16;letter-spacing:-.04em;margin:6mm 0 2.3mm}.question{font-size:11pt;line-height:1.55;color:#405565;margin:0 0 5mm;border-left:3px solid var(--accent);padding-left:3mm}.sheet main{font-size:8.4pt;line-height:1.48}.sheet main>p{margin:0 0 3mm}.foot{position:absolute;left:17mm;right:17mm;bottom:6mm;display:flex;justify-content:space-between;font-size:6.6pt;color:#6a777f}.cover{color:#f7fafb;background:radial-gradient(circle at 84% 15%,color-mix(in srgb,var(--accent) 70%,transparent),transparent 27%),linear-gradient(147deg,#0e1a23 0 58%,#1c3342 58%);display:flex;flex-direction:column}.cover:after{height:8mm;background:var(--accent)}.cover header{color:#bad0db;border-color:#4a6371}.cover header em{font:700 8pt sans-serif;color:#d6e2e7}.mark{margin-top:23mm;width:34mm;height:34mm;border:2px solid var(--accent);border-radius:50%;display:grid;place-items:center;color:var(--accent);font:900 16pt ui-monospace,monospace}.cover h1{font-size:31pt;line-height:1.08;letter-spacing:-.05em;margin:10mm 0 4mm;max-width:174mm}.cover>p{font-size:12pt;line-height:1.55;color:#d0dce2;max-width:166mm}.cover-claim{margin-top:8mm;border-left:4px solid var(--accent);padding:4mm 5mm;background:#ffffff0d;font-size:12.5pt;line-height:1.48;font-weight:760}.cover-meta{display:grid;grid-template-columns:1fr 1fr;gap:5mm;margin-top:auto}.cover-meta div{border-top:1px solid #526a78;padding:3.5mm}.cover-meta small,.cover-meta b{display:block}.cover-meta small{font-size:7pt;color:#90a8b5;margin-bottom:1mm}.cover-meta b{font-size:9pt}.warning{font-size:7.4pt;line-height:1.45;margin:7mm 0 8mm;color:#bccbd3}.cover .foot{bottom:10mm;color:#b5c6cf}.argument{display:grid;grid-template-columns:1fr 1fr;gap:3.2mm;margin:3.5mm 0}.argument section{border-top:3px solid var(--accent);background:#fff;border-radius:0 0 2mm 2mm;padding:3.3mm;min-height:34mm;box-shadow:0 0 0 1px #d4dade inset}.argument small{display:block;color:var(--accent);font-size:6.5pt;font-weight:900;letter-spacing:.12em;margin-bottom:1.5mm}.argument p{font-size:8pt;margin:0;line-height:1.5}.strong{display:grid;grid-template-columns:37mm 1fr;border-left:4px solid var(--accent);background:#edf2f3;margin:3.5mm 0}.strong b,.strong span{padding:3mm}.strong b{font-size:8.7pt}.strong span{font-size:8pt;border-left:1px solid #ced7db}blockquote{margin:4mm 0;padding:4mm 5mm;border-left:5px solid var(--accent);background:#fff;font-size:12.5pt;line-height:1.48;font-weight:800;color:#293c47}.formula{text-align:center;font:800 12.5pt/1.5 ui-monospace,monospace;padding:4mm;background:#edf2f3;border-radius:2mm;margin:4mm 0;color:#263c49}.chain{display:flex;gap:1.4mm;align-items:stretch;margin:4mm 0}.chain>div{flex:1;min-width:0;background:#fff;border:1px solid #c8d1d6;border-radius:2mm;padding:2.6mm;text-align:center}.chain b,.chain span{display:block}.chain b{font-size:7.4pt}.chain span{font-size:6.3pt;color:#60717b;margin-top:1mm}.chain i{align-self:center;font-style:normal;font-weight:900;color:var(--accent)}.layers{margin:4mm 0}.layers>div{display:grid;grid-template-columns:9mm 38mm 1fr;gap:3mm;align-items:center;padding:2.5mm 3mm;border-bottom:1px solid #d1d8dc;background:#fff}.layers>div:first-child{border-top:3px solid var(--accent)}.layers em{font:700 7.5pt ui-monospace,monospace;color:var(--accent)}.layers b{font-size:8.2pt}.layers span{font-size:7.5pt;color:#52626d}table{width:100%;table-layout:fixed;border-collapse:collapse;margin:3.5mm 0;font-size:7.25pt;line-height:1.38}th{background:#263d4b;color:#fff;text-align:left;padding:2.1mm}td{padding:2mm;border:1px solid #d1d8dc;vertical-align:top;background:#fff}tr:nth-child(even) td{background:#f0f3f3}.bars{margin:4mm 0}.bars>div{display:grid;grid-template-columns:47mm 1fr 18mm;gap:2mm;align-items:center;margin:1.7mm 0}.bars b{font-size:7.2pt}.bars i{height:3.2mm;background:#e0e6e8;border-radius:3mm;overflow:hidden}.bars i span{display:block;height:100%;background:linear-gradient(90deg,var(--accent),#82b4c2)}.bars em{text-align:right;font:7pt ui-monospace,monospace;color:#586873}.refs{margin-top:4mm;padding-top:2.5mm;border-top:1px solid #cbd3d7;display:flex;gap:2mm;flex-wrap:wrap;font-size:6.5pt;color:#60717a}.refs b{color:#263a47}.refs span:not(:last-child):after{content:" ·"}a{color:#17617b;text-decoration:none;border-bottom:1px solid #a3bbc5}code{font:7.3pt ui-monospace,monospace;background:#e9edef;padding:.2mm .7mm;border-radius:.7mm}
`

function cover(report) {
  return `<section class="sheet cover" style="--accent:${report.accent}"><header><span>ENGINEERING KNOWLEDGE STUDY</span><em>VOL. ${report.volume}</em></header><div class="mark">${report.symbol}</div><h1>${report.title}</h1><p>${report.subtitle}</p><div class="cover-claim">${report.claim}</div><div class="cover-meta"><div><small>대상 snapshot</small><b>v2.1.88 / ${COMMIT.slice(0, 12)}</b></div><div><small>설명 구조</small><b>조건 · 이론 · 구현 · 반례</b></div></div><div class="warning">제3자 복원 소스에 대한 교육용 분석이다. 코드 관찰, 이론적 비유, 개선 제안을 구분하며 누락 모듈을 추정해 채우지 않는다.</div><div class="foot"><span>Knowledge projection / revised edition</span><span>한국어</span></div></section>`
}

function page(report, section, index, metrics) {
  const body = typeof section.body === 'function' ? section.body(metrics) : section.body
  return `<section class="sheet" style="--accent:${report.accent}"><header><span>${section.kicker}</span><em>${String(index).padStart(2, '0')}</em></header><h2>${section.title}</h2><p class="question">${section.question}</p><main>${body}</main><div class="foot"><span>Claude Code v2.1.88 · engineering knowledge study</span><span>${DATE}</span></div></section>`
}

function documentHtml(report, metrics) {
  const sheets = [cover(report), ...report.sections.map((section, index) => page(report, section, index + 1, metrics))]
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(report.title)}</title><style>${CSS}</style></head><body>${sheets.join('\n')}</body></html>`
}

async function verifyRevision() {
  const { stdout } = await execFile('git', ['-C', SOURCE_ROOT, 'rev-parse', 'HEAD'])
  const revision = stdout.trim()
  if (revision !== COMMIT) throw new Error(`Source revision mismatch: expected ${COMMIT}, got ${revision}`)
  return revision
}

async function verifyLinks(html, reportName) {
  const failures = []
  const hrefs = [...html.matchAll(/href="([^"]+)"/g)].map(match => match[1])
  const sourceLinks = [...new Set(hrefs.filter(href => href.startsWith(`${GH}/`)))]
  for (const href of sourceLinks) {
    const [relative, anchor = ''] = href.slice(GH.length + 1).split('#')
    const file = path.join(SOURCE_ROOT, decodeURIComponent(relative))
    try {
      const stat = await fs.stat(file)
      if (!stat.isFile()) failures.push(`${relative}: not a file`)
      if (anchor) {
        const match = anchor.match(/^L(\d+)(?:-L(\d+))?$/)
        const lines = (await fs.readFile(file, 'utf8')).split('\n').length
        if (!match || Number(match[2] ?? match[1]) > lines) failures.push(`${relative}#${anchor}: ${lines} lines`)
      }
    } catch (error) { failures.push(`${relative}: ${error.code ?? error.message}`) }
  }
  const localLinks = [...new Set(hrefs.filter(href => href.startsWith('file:')))]
  for (const href of localLinks) {
    try {
      const url = new URL(href)
      url.hash = ''
      await fs.access(fileURLToPath(url))
    } catch (error) { failures.push(`${href}: ${error.code ?? error.message}`) }
  }
  if (failures.length) throw new Error(`Invalid links in ${reportName}:\n${failures.join('\n')}`)
  return { source: sourceLinks.length, local: localLinks.length, external: hrefs.length - sourceLinks.length - localLinks.length }
}

async function verifyClaimMap(claimMap) {
  const failures = []
  const ids = new Set()
  let codeEvidenceCount = 0
  for (const claim of claimMap.claims ?? []) {
    if (!claim.id || ids.has(claim.id)) failures.push(`duplicate or missing claim id: ${claim.id}`)
    ids.add(claim.id)
    if (!claim.kind || !claim.statement || !claim.limitation) failures.push(`${claim.id}: missing kind, statement, or limitation`)
    for (const evidence of claim.codeEvidence ?? []) {
      codeEvidenceCount++
      const match = evidence.match(/^(.+)#L(\d+)(?:-L(\d+))?$/)
      if (!match) { failures.push(`${claim.id}: malformed code evidence ${evidence}`); continue }
      const file = path.join(SOURCE_ROOT, match[1])
      try {
        const lines = (await fs.readFile(file, 'utf8')).split('\n').length
        if (Number(match[3] ?? match[2]) > lines) failures.push(`${claim.id}: ${evidence} exceeds ${lines} lines`)
      } catch (error) { failures.push(`${claim.id}: ${evidence} ${error.code ?? error.message}`) }
    }
    for (const ref of claim.knowledgeRefs ?? []) {
      const [relative] = ref.split('#')
      try { await fs.access(path.join(WORKSPACE, relative)) } catch (error) { failures.push(`${claim.id}: ${ref} ${error.code ?? error.message}`) }
    }
    for (const ref of claim.externalRefs ?? []) {
      try { new URL(ref) } catch { failures.push(`${claim.id}: invalid external URL ${ref}`) }
    }
  }
  if (failures.length) throw new Error(`Invalid claim map:\n${failures.join('\n')}`)
  return { claims: ids.size, codeEvidence: codeEvidenceCount }
}

async function writeReadme(manifest, metrics) {
  const links = manifest.reports.map(report => `- [${report.file}](./${report.file}) — ${report.title} (${report.pages}쪽)`).join('\n')
  const text = `# Claude Code Engineering Knowledge Study

이 판은 코드와 기술 항목을 나열하지 않고 각 핵심 주제를 **성립 조건 → 이론 렌즈 → 코드 구체화 → 실패 반례 → 설계 의미**로 설명한다. 실행 흐름은 pairing, race, settlement처럼 시간 순서 자체가 불변조건인 경우에만 사용한다.

## Reports

${links}

총 ${manifest.totalPages}쪽이다.

## Engineering and knowledge composition

- [Operation binding](./engineering/operation-binding.md)
- [Generated knowledge projection and bias ledger](./engineering/knowledge-projection.md)
- [Validation record](./engineering/validation.md)
- [Knowledge demand and gap register](./research/knowledge-demand.md)
- [Claim/source/limitation map](./research/claim-map.json)
- [External primary-source notes](./research/external-source-notes.md)
- [Generated evidence metrics](./metrics/evidence-metrics.json)
- [Generation manifest](./manifest.json)

저장소의 six-mode routing, artifact reuse resolution, progressive knowledge acquisition, knowledge projection/contextualization, repository bias control, architecture characteristic/tradeoff rubric, Engineering Operating Model, reference lifecycle, PDF information-design 지식을 우선 사용했다. 외부 조사는 이 reusable coverage가 남긴 기술 이론 gap에 한정했다.

이 디렉터리는 generated project-purpose projection이다. canonical \`artifacts/knowledge/**\`, \`docs/reference/**\`, Loop Architecture unit을 수정하거나 대체하지 않는다.

## Fixed source

- clone: \`${SOURCE_ROOT}\`
- upstream: ${REPO}
- revision: \`${manifest.revision}\`
- measured: ${metrics.total.files.toLocaleString()} TypeScript/TSX files, ${metrics.total.lines.toLocaleString()} physical lines

대상은 제3자 복원 저장소이며 incomplete build와 missing modules가 있다. 분석 중 대상 build/runtime은 실행하지 않았다.

## Reproduction

\`build-study.mjs\`는 서술과 PDF를 만들며, AST/lexical 계측은 이전 판에서 만든 범용 설정 기반 분석기를 재사용한다. 분석기에는 이 저장소 이름이나 분류가 하드코딩되어 있지 않다.

\`\`\`sh
node build-study.mjs
\`\`\`

## Validation

- fixed clone revision 확인
- claim map JSON과 source/local link 존재 및 source line anchor 범위 확인
- ${manifest.linkCounts.source}개 code link와 ${manifest.linkCounts.local}개 local knowledge link 검증
- Chromium A4 rendering, 각 sheet 수직 overflow, PDF header와 object page count 확인
- cover 및 각 권 대표 본문 페이지 visual inspection

분포 수치는 설명 질문을 선택하기 위한 evidence이지 중요도, 결함 수, 품질 점수가 아니다.
`
  await fs.writeFile(path.join(HERE, 'README.md'), text)
}

async function main() {
  const revision = await verifyRevision()
  const claimMap = JSON.parse(await fs.readFile(path.join(HERE, 'research/claim-map.json'), 'utf8'))
  if (claimMap.targetRevision !== revision) throw new Error('Claim map revision mismatch')
  const claimMapValidation = await verifyClaimMap(claimMap)
  const metrics = await analyzeCodebase({ sourceRoot: SOURCE_ROOT, config: CONFIG })
  const htmlDir = path.join(HERE, 'html')
  const previewDir = path.join(HERE, 'previews')
  const metricsDir = path.join(HERE, 'metrics')
  await Promise.all([fs.mkdir(htmlDir,{recursive:true}),fs.mkdir(previewDir,{recursive:true}),fs.mkdir(metricsDir,{recursive:true})])
  await fs.writeFile(path.join(metricsDir,'evidence-metrics.json'),`${JSON.stringify({...metrics,sourceRevision:revision},null,2)}\n`)

  const browser = await chromium.launch({headless:true})
  const context = await browser.newContext()
  const out = []
  const linkCounts = { source: 0, local: 0, external: 0 }
  try {
    for (const report of reports) {
      const html = documentHtml(report, metrics)
      const htmlFile = path.join(htmlDir,`${report.slug}.html`)
      const pdfFile = path.join(HERE,`${report.slug}.pdf`)
      const counts = await verifyLinks(html, report.slug)
      for (const key of Object.keys(linkCounts)) linkCounts[key] += counts[key]
      await fs.writeFile(htmlFile,html)
      const p = await context.newPage({viewport:{width:1280,height:1600}})
      await p.goto(pathToFileURL(htmlFile).href,{waitUntil:'networkidle'})
      await p.emulateMedia({media:'print'})
      const overflow = await p.$$eval('.sheet', sheets => sheets.map((sheet,index)=>({index,delta:sheet.scrollHeight-sheet.clientHeight})).filter(x=>x.delta>1))
      if (overflow.length) throw new Error(`Overflow ${report.slug}: ${JSON.stringify(overflow)}`)
      await p.pdf({path:pdfFile,format:'A4',printBackground:true,margin:{top:0,right:0,bottom:0,left:0}})
      await p.locator('.sheet').first().screenshot({path:path.join(previewDir,`${report.slug}-cover.png`)})
      const sampleIndex = Math.min(6, report.sections.length)
      await p.locator('.sheet').nth(sampleIndex).screenshot({path:path.join(previewDir,`${report.slug}-sample.png`)})
      await p.close()
      const bytes = await fs.readFile(pdfFile)
      if (bytes.subarray(0,5).toString('ascii') !== '%PDF-') throw new Error(`Invalid PDF ${pdfFile}`)
      const observedPages = (bytes.toString('latin1').match(/\/Type\s*\/Page\b/g) ?? []).length
      const expectedPages = report.sections.length + 1
      if (observedPages !== expectedPages) throw new Error(`PDF page mismatch ${report.slug}: ${observedPages}/${expectedPages}`)
      out.push({volume:report.volume,title:report.title,file:path.basename(pdfFile),pages:expectedPages,links:counts})
    }
  } finally { await context.close(); await browser.close() }
  const manifest = {kind:'generated-study-manifest/v1',generatedAt:new Date().toISOString(),repository:REPO,sourceRoot:SOURCE_ROOT,revision,claimMapValidation,reports:out,totalPages:out.reduce((n,x)=>n+x.pages,0),linkCounts}
  await fs.writeFile(path.join(HERE,'manifest.json'),`${JSON.stringify(manifest,null,2)}\n`)
  await writeReadme(manifest,metrics)
  process.stdout.write(`${JSON.stringify(manifest,null,2)}\n`)
}

reports.push({
  volume: '04', slug: '04-projections-repl-sdk-and-ui', accent: '#247ca5', symbol: 'VIEW',
  title: 'Projection, REPL, SDK, UI',
  subtitle: '화면을 중심으로 읽지 않고 동일한 conversation truth의 서로 다른 소비자 표현으로 읽는다',
  claim: 'UI는 핵심 상태가 아니다. 그러나 입력·취소·지연·가시성을 조정하기 때문에 핵심 불변조건을 쉽게 침범할 수 있다.',
  sections: [
    S('PROBLEM FRAME', '같은 turn도 소비자마다 다른 모습이 필요하다', 'REPL, SDK, transcript가 왜 같은 배열을 공유하면 안 되는가?',
      argue({condition:'REPL은 progress와 interactive control을, SDK는 stable event를, transcript는 resume fidelity를 요구한다.',lens:'projection은 한 source model에서 목적별 view를 파생하며 canonical state와 수명을 구분한다.',realization:'QueryEngine/query event가 REPL rendering, SDK result, session record로 각각 변환된다.',failure:'UI 편의를 위해 제거한 event가 transcript에도 사라지거나 SDK normalization이 core state를 mutate하면 drift가 생긴다.',synthesis:'surface 차이는 formatting이 아니라 fidelity·latency·durability policy 차이다.'}) + refs([src('src/QueryEngine.ts','175-238'),src('src/screens/REPL.tsx','2661-2865'),local('artifacts/knowledge/operations/knowledge-projection-and-contextualization.md')])),
    S('CANONICAL STATE', '정식 상태는 가장 상세한 화면이 아니다', '어떤 state가 다음 transition을 결정하는가?',
      table(['후보','장점','canonical로 삼을 때 위험'],[
        ['React state','즉시 interaction','render lifecycle·ephemeral'],
        ['yielded events','시간 순서','consumer 중단 시 불완전'],
        ['query internal state','transition fidelity','process-local'],
        ['transcript','durable','repair/format lag'],
        ['SDK result','stable public view','의도적 정보 축약'],
      ]) + strong('판정 기준','다음 core transition을 결정하는 owner와 crash 후 복원 source는 같을 수도 다를 수도 있으며, 그 관계가 명시되어야 한다.')),
    S('QUERYENGINE', '추출된 engine은 migration seam이다', 'wrapper가 존재한다는 사실이 ownership 이전을 의미하는가?',
      argue({condition:'headless/SDK와 future REPL이 공통 conversation lifecycle을 필요로 한다.',lens:'strangler-style extraction은 old entrypoint를 유지한 채 새 owner로 책임을 옮긴다.',realization:'QueryEngine 주석은 lifecycle/session ownership과 ask에서의 추출 목적을 직접 밝힌다.',failure:'REPL에 queryGuard, prompt restore, abort orchestration이 남아 있으면 ownership이 중복된다.',synthesis:'새 class의 존재보다 어떤 invariant의 마지막 writer가 어디인지가 migration 진척을 말해 준다.'}) + refs([src('src/QueryEngine.ts','175-238'),src('src/screens/REPL.tsx','2661-2865')])),
    S('REACT', 'render와 commit 사이에 core effect를 두지 않는다', 'React의 render model이 agent runtime에 주는 제약은 무엇인가?',
      argue({condition:'render는 state의 UI description을 계산하며 다시 실행될 수 있다.',lens:'React owner 문서는 trigger→render→commit을 구분한다.',realization:'Ink components는 query state를 화면 요소로 투영하고 hooks가 input/render coordination을 맡는다.',failure:'render path에서 tool effect나 durable write를 시작하면 재-render와 UI lifecycle이 core semantics를 바꾼다.',synthesis:'UI component는 observation을 그려야 하며 effect authority와 canonical transition은 engine boundary에 남아야 한다.'}) + refs([ext('https://react.dev/learn/render-and-commit','React render and commit'),src('src/screens/REPL.tsx','2661-2865')])),
    S('INK', 'terminal UI는 DOM과 다른 물리적 제약을 가진다', '같은 React가 왜 다른 운영 문제를 만드는가?',
      table(['terminal 조건','구조적 영향','실패 형태'],[
        ['ANSI diff output','render batching 필요','flicker/jank'],
        ['TTY 여부','interactive capability 변화','CI/piped output 오작동'],
        ['alternate screen/scrollback','history visibility 정책','출력 소실'],
        ['폭·unicode','layout 측정','wrap/정렬 오류'],
        ['stdin raw mode','input ownership','shortcut 충돌'],
      ]) + p('Ink는 component model을 제공하지만 terminal의 stateful output과 lifecycle은 별도 adapter 책임이다.') + refs([ext('https://github.com/vadimdemedes/ink','Ink owner repository'),src('src/ink/reconciler.ts','1-180')])),
    S('PROGRESS', '보이는 진행과 정식 결과를 구분한다', 'progress event를 history에 모두 저장해야 하는가?',
      argue({condition:'긴 tool은 사용자가 멈추지 않도록 중간 관찰을 제공해야 한다.',lens:'projection은 목적에 맞게 detail을 선택하되 source truth를 바꾸지 않는다.',realization:'tool progress/final result가 같은 stream을 공유하는 hack이 명시되어 있다.',failure:'progress를 model history에 넣으면 noise와 token cost가 증가하고, 아예 버리면 운영 진단이 어려워진다.',synthesis:'progress는 UI/telemetry projection이며 terminal observation과 identity·durability를 분리해야 한다.'}) + refs([src('src/services/tools/toolExecution.ts','337-577')])),
    S('GENERATION GUARD', 'generation number는 stale continuation을 격리한다', '왜 boolean `isRunning`으로 부족한가?',
      argue({condition:'cancel 직후 새 query가 시작되면 이전 async finally가 나중에 실행될 수 있다.',lens:'generation token은 continuation이 어느 epoch에 속하는지 확인한다.',realization:'REPL queryGuard가 current generation과 callback/finally의 generation을 비교한다.',failure:'old finally가 prompt/input state를 복구하면 새 turn의 UI를 덮는다.',synthesis:'generation guard는 UI trick이 아니라 overlapping lifecycle의 ownership fence다.'}) + refs([src('src/screens/REPL.tsx','2793-2865')])),
    S('INPUT OWNERSHIP', 'prompt field는 단순 문자열 state가 아니다', '입력 중 text와 제출된 command의 경계는 어디인가?',
      p('interactive surface는 draft text, submitted input, queued command, restored-on-error prompt를 구분해야 한다. 이 상태를 query engine message와 합치면 cancel/resubmit race에서 무엇이 이미 durable한지 모호해진다.') +
      strong('구조적 귀결','draft ownership은 REPL adapter에, accepted input identity와 turn admission은 conversation owner에 둔다.') + refs([src('src/screens/REPL.tsx','2661-2865'),src('src/utils/processUserInput/processUserInput.ts','141-269')])),
    S('SDK', 'SDK는 headless UI가 아니라 protocol consumer다', '화면을 없애면 어떤 계약이 더 엄격해지는가?',
      table(['interactive REPL','SDK/headless','공통 core'],[
        ['human confirmation UI','callback/policy port','permission decision semantics'],
        ['incremental render','typed event stream','event identity/order'],
        ['prompt restore','caller retry data','terminal reason'],
        ['terminal width/TTY','transport serialization','message/tool contracts'],
      ]) + p('SDK는 internal object를 노출하는 shortcut이 아니라, UI 없이도 lifecycle을 완결할 수 있는 stable projection이 필요하다.')),
    S('TRANSCRIPT', '검색 가능한 기록과 재생 가능한 기록은 다르다', 'UI search용 text가 resume source가 될 수 있는가?',
      argue({condition:'search는 사람이 찾기 쉬운 flattening을 원하고 resume는 typed event fidelity를 원한다.',lens:'같은 source에서 파생된 projection도 목적과 loss budget이 다르다.',realization:'Tool contract에 transcript/search 관련 presentation surface가 effect/result와 함께 존재한다.',failure:'검색 index를 canonical record로 재사용하면 id·variant·metadata가 손실된다.',synthesis:'human-readable projection과 replayable journal을 분리하고 derivation을 연결해야 한다.'}) + refs([src('src/Tool.ts','362-700'),src('src/utils/sessionStorage.ts','2090-2245')])),
    S('RECONCILIATION', '여러 projection은 결국 같은 사건으로 합류해야 한다', '동일성을 무엇으로 판단할까?',
      table(['identity','연결 대상','검출 가능한 drift'],[
        ['queryChainId','parent/subturn','인과 단절'],
        ['request/attempt id','fallback streams','중복/누락 attempt'],
        ['tool_use id','proposal/result','orphan pairing'],
        ['session/message id','journal/resume','duplicate history'],
        ['generation id','REPL continuation','stale UI mutation'],
      ]) + strong('관측 원칙','timestamp proximity만으로 같은 사건을 추정하지 않고 명시 identity로 join한다.')),
    S('LATENCY', 'UI latency는 core ordering을 바꾸라는 압력이 된다', '반응성을 위해 무엇을 늦추고 무엇을 먼저 해야 하는가?',
      table(['선택','얻는 것','지는 것'],[
        ['user record 선쓰기','kill 후 resume','초기 latency/incomplete turn'],
        ['render batching','terminal 안정성','progress freshness'],
        ['observer clone','instrumentation 격리','copy cost'],
        ['stream raw buffer 최적화','CPU/memory','복잡한 assembly'],
        ['tool parallelism','turn latency','ordering/reconciliation 부담'],
      ]) + p('성능은 독립 concern이 아니라 durability·fidelity·concurrency와 tradeoff point를 만든다.')),
    S('ACCESSIBILITY', 'terminal에서 보이는 것과 전달되는 것은 다르다', '색과 animation만으로 상태를 표현하면 무엇이 손실되는가?',
      p('permission, running, failed, interrupted 상태는 색상 외 label과 terminal text로도 구분되어야 SDK log·screen reader·plain output에서 의미가 남는다. UI의 시각적 강조는 protocol variant를 대신할 수 없다.') +
      refs([local('artifacts/knowledge/sources/report-information-design-and-raster-pdf-v6.md','local information design knowledge')])),
    S('BOUNDARY FITNESS', 'projection 경계는 import rule로 고정할 수 있다', '새 구조가 다시 결합되는 것을 어떻게 막는가?',
      table(['fitness','막는 회귀'],[
        ['engine core → React/Ink 금지','presentation이 state owner가 됨'],
        ['presenter → effect call 금지','render 재실행이 effect 발생'],
        ['journal record → UI type 금지','durability가 surface lifecycle에 결합'],
        ['CoreEvent exhaustive mapping','SDK/REPL 중 한쪽 event 누락'],
        ['projection mutation 금지','observer가 canonical input 변경'],
      ])),
    S('EXERCISE', '실습: 두 surface의 허용 차이를 명시한다', 'REPL과 SDK trace는 어디까지 같아야 하는가?',
      layers([
        ['fixture','text success, tool progress, deny, abort, fallback, resume'],
        ['core trace','proposal/effect/observation/terminal identity를 비교'],
        ['REPL-only','draft, key input, visual batch를 허용'],
        ['SDK-only','serialized callback/result shape를 허용'],
        ['failure','core event 누락 또는 서로 다른 durable history'],
      ])),
    S('CONCLUSION', '화면은 truth를 보여 주지만 truth를 소유하지 않는다', '이 권에서 남겨야 할 한 문장은 무엇인가?',
      quote('좋은 UI 분리는 React 파일을 옮기는 일이 아니라, interactive lifecycle이 core history와 effect authority를 바꾸지 못하게 하는 일이다.') +
      p('REPL과 SDK는 같은 conversation engine의 소비자여야 하지만 동일한 projection일 필요는 없다. 차이는 명시적이고 testable해야 한다.')),
  ],
})

reports.push({
  volume: '05', slug: '05-structural-evolution-and-engineering-operation', accent: '#356eb3', symbol: 'EVOLVE',
  title: '구조 진화와 엔지니어링 운영',
  subtitle: '코드 분포를 설계 결론으로 오인하지 않고 불변조건·가변성·검증 순서로 리팩터링한다',
  claim: '구조 개선은 파일을 작게 만드는 작업이 아니라, 실패했을 때 책임을 판정할 수 있도록 의미의 소유권을 다시 배치하는 작업이다.',
  sections: [
    S('PROBLEM FRAME', '큰 파일은 원인이 아니라 증상일 수 있다', '어떤 결합이 실제 구조 문제인가?',
      argue({condition:'QueryEngine/query/REPL/Tool/sessionStorage에 여러 변화 이유가 겹친다.',lens:'cohesion은 함께 변해야 하는 것의 결속이고 coupling은 독립 변화가 서로를 흔드는 정도다.',realization:'turn lifecycle, UI, provider, effect, persistence가 동일 type/file boundary를 가로지른다.',failure:'줄 수 기준으로 자르면 protocol invariant가 여러 module에 복제된다.',synthesis:'분해 단위는 코드 양이 아니라 state/effect/invariant ownership이다.'}) + refs([src('src/QueryEngine.ts','175-238'),src('src/Tool.ts','362-793'),src('src/utils/sessionStorage.ts','600-865')])),
    S('DISTRIBUTION', '분포는 설계 질문을 고르는 도구다', '어떤 책임 영역에 어떤 압력이 모이는가?', metrics => {
      const ids=['conversation-engine','message-context-persistence','tool-runtime-contract','shell-effect-tools','permission-security','interactive-sdk-surfaces']
      return bars(ids.map(id=>[id,metrics.groups[id].lines])) +
        p('line 분포는 importance rank가 아니다. shell 영역에서는 security 질문을, interactive 영역에서는 reliability/concurrency 질문을, persistence 영역에서는 performance/recovery 질문을 우선 탐색하게 하는 research prior다.') +
        refs([local('.collab/artifacts/claude-code-engineering-knowledge-study-2026-09-20/metrics/evidence-metrics.json','generated metrics')])
    }),
    S('LANGUAGE DISTRIBUTION', '언어 메커니즘의 희소성과 집중을 함께 본다', 'generator가 핵심이라는 말은 수치로 어떻게 교정되는가?', metrics => {
      const rows=['conversation-engine','message-context-persistence','tool-runtime-contract','interactive-sdk-surfaces','extension-adapters'].map(id=>[
        id,
        metrics.groups[id].syntax.asyncFunctions.toLocaleString(),
        metrics.groups[id].syntax.asyncGenerators.toLocaleString(),
        metrics.groups[id].syntax.yieldExpressions.toLocaleString(),
        metrics.groups[id].syntax.awaitExpressions.toLocaleString(),
      ])
      return table(['영역','async fn','async gen','yield','await'],rows) + p(`전체 async generator는 ${metrics.syntax.asyncGenerators.toLocaleString()}개이고 await는 ${metrics.syntax.awaitExpressions.toLocaleString()}개다. 희소한 generator가 turn protocol에서 결정적일 수 있지만, 비동기 correctness의 대부분은 일반 await 경계와 cancellation/cleanup에 분포한다.`)
    }),
    S('PRESSURE MAP', '주석의 문제 언어를 architecture hypothesis로 바꾼다', 'Without this, previously, race 같은 표현은 무엇을 알려 주는가?', metrics => {
      const ids=['conversation-engine','message-context-persistence','shell-effect-tools','interactive-sdk-surfaces','extension-adapters']
      return table(['영역','reliability','performance','security','compatibility','concurrency'],ids.map(id=>{const x=metrics.groups[id].pressure;return [id,x.reliability,x.performance,x.security,x.compatibility,x.concurrency]})) +
        p('이는 lexical marker를 포함한 comment line 수다. incident 수나 품질 점수가 아니며, 어떤 quality scenario를 먼저 작성할지 선택하는 단서다.')
    }),
    S('QUALITY SCENARIOS', '분포를 검증 가능한 scenario로 내린다', 'metric에서 architecture decision으로 바로 점프하지 않으려면?',
      table(['관찰 신호','scenario','response measure 후보'],[
        ['FileEdit race 주석','외부 변경이 validation 직후 발생','stale overwrite 0'],
        ['fallback branch','stream 뒤 provider 오류','duplicate tool effect 0'],
        ['REPL generation guard','cancel 직후 resubmit','new prompt state 손실 0'],
        ['cache comments','tool/context 순서 변화','semantic-equivalent prefix 안정'],
        ['session repair','kill 후 resume','orphan pair 0, unknown 보존'],
      ]) + refs([local('artifacts/knowledge/architecture/architecture-characteristics-and-tradeoffs.md')])),
    S('QUERYENGINE MIGRATION', '추출의 완료 조건은 call site 수가 아니다', '새 engine이 무엇을 소유해야 migration이 끝나는가?',
      table(['책임','현재 신호','완료 oracle'],[
        ['turn admission','submit/process input','모든 entrypoint 동일 trace'],
        ['context build','session + query context','provider request equivalence'],
        ['terminal settlement','query return handling','terminal reason 완전성'],
        ['durability ordering','transcript write','kill/resume corpus'],
        ['surface projection','REPL/SDK adapters','허용 차이 명시'],
      ]) + p('migration은 REPL 코드를 복사해 class로 넣는 일이 아니라 last writer와 invariant owner를 하나씩 이동하는 과정이다.') + refs([src('src/QueryEngine.ts','175-238'),src('src/screens/REPL.tsx','2661-2865')])),
    S('TOOL DECOMPOSITION', 'facet 분해는 계약을 약하게 만들 위험도 있다', '어떤 seam부터 만들어야 하는가?',
      layers([
        ['compat adapter','기존 Tool을 새 facet view로 투영'],
        ['effect facet','validate/call/result truth'],
        ['authority facet','permission request와 decision evidence'],
        ['model facet','name/description/schema/cache identity'],
        ['presentation facet','REPL render/search/progress'],
        ['fitness','effect↔React, presenter↔call 의존 금지'],
      ]) + p('한 번에 interface를 교체하지 않고 기존 contract snapshot과 event trace로 facet 사이 의미 손실을 탐지한다.')),
    S('PERSISTENCE SPLIT', 'journal, reader, repair, projection은 다른 시간 방향을 가진다', '왜 하나의 service에서 분리할 가치가 있는가?',
      table(['unit','시간 방향','핵심 contract'],[
        ['writer','현재→future','append identity/order/flush'],
        ['reader','past→current','versioned decoding'],
        ['repair','invalid past→admissible past','명시 rule + loss record'],
        ['projector','history→consumer view','deterministic/loss budget'],
        ['compactor','history→summary entity','provenance/omission'],
      ]) + strong('분해 기준','함수 종류가 아니라 서로 다른 failure semantics와 compatibility owner를 기준으로 한다.')),
    S('VARIABILITY', 'feature gate는 if문보다 넓은 제품군 문제다', '왜 dynamic import와 excluded symbol 검사가 필요한가?',
      argue({condition:'provider/build/cohort에 따라 포함 가능한 code와 capability가 달라진다.',lens:'Software Product Line은 commonality와 variability, feature constraint를 모델링한다.',realization:'feature() call, mode filtering, dynamic module loading이 artifact/runtime variant를 만든다.',failure:'gate 밖 static import나 문자열이 build artifact에 남으면 runtime false여도 product constraint를 위반한다.',synthesis:'feature variability는 code path뿐 아니라 module graph와 produced artifact를 acceptance 대상으로 만든다.'}) + refs([ext('https://www.sei.cmu.edu/library/feature-oriented-domain-analysis-foda-feasibility-study/','SEI FODA'),src('src/tools.ts','271-367')])),
    S('VARIABILITY MATRIX', '모든 gate 조합을 시험할 수 없다', '조합 폭발을 어떻게 줄이되 위험을 숨기지 않는가?',
      table(['축','대표 값','상호작용 위험'],[
        ['entrypoint','REPL/SDK/bridge','projection 차이'],
        ['provider','direct/Bedrock/Vertex','header/cache/tool support'],
        ['feature','on/off/cohort','module/artifact inclusion'],
        ['platform','POSIX/Windows','shell/path/mtime'],
        ['failure','success/abort/fallback','repair/duplicate effect'],
      ]) + p('pairwise selection은 coverage 도구일 뿐 safety-critical interaction을 대체하지 않는다. known high-risk triples는 별도 scenario로 고정한다.')),
    S('CHARACTERIZATION', '불완전 복원본에서는 기존 의미를 먼저 포획한다', 'unit test를 더 쓰는 것만으로 왜 부족한가?',
      argue({condition:'완전한 test suite/build module과 missing type source가 없다.',lens:'characterization은 현재 observable behavior를 migration oracle로 만든다.',realization:'CoreEvent sequence, effect diff, terminal, journal/resume, request hash를 fixture별로 기록한다.',failure:'현재 bug까지 무비판적으로 영구화하거나 observer가 behavior를 바꾸면 oracle이 오염된다.',synthesis:'characterization은 정답 선언이 아니라 의도적으로 바꿀 차이와 보존할 차이를 분리하는 baseline이다.'})),
    S('OBSERVABILITY', 'telemetry는 활동량이 아니라 인과 join을 제공해야 한다', 'logEvent가 많다는 사실만으로 무엇이 부족한가?',
      table(['identity','join','결정 지원'],[
        ['query chain','parent/subturn','recursive work 원인'],
        ['request attempt','fallback/provider','실패 funnel'],
        ['tool use','proposal/effect/result','partial/duplicate effect'],
        ['session/message','runtime/durable','resume drift'],
        ['feature cohort','variant/result','rollout 비교'],
      ]) + p('event count는 acceptance가 아니다. exact input→decision→effect→outcome join이 없으면 최적화 주장은 보류한다.') + refs([local('docs/architecture/engineering-operating-model.md#EOM-tier-rule','Engineering Operating Model')])),
    S('REFACTOR ORDER', '위험이 높은 의미부터 owner를 고정한다', '어떤 순서가 문제 원인을 분리하는가?',
      layers([
        ['01 trace baseline','현재 turn/effect/durability 의미를 고정'],
        ['02 conversation owner','QueryEngine으로 admission·terminal·ordering 통합'],
        ['03 projection adapters','REPL/SDK 차이를 명시'],
        ['04 Tool facets','model/authority/effect/presentation 분리'],
        ['05 journal model','writer/reader/repair/projector 분리'],
        ['06 variability fitness','variant별 module/artifact 검사'],
      ]) + strong('순서의 이유','동시에 여러 축을 바꾸면 semantic drift의 owner와 rollback 지점을 찾을 수 없다.')),
    S('TRADEOFF', '좋은 분리는 latency와 comprehensibility를 악화시킬 수 있다', '구조 결정의 sensitivity point는 어디인가?',
      table(['tactic','강화','약화 가능성','sensitivity'],[
        ['더 많은 validation layer','safety/diagnosis','latency/UX','tool call critical path'],
        ['세분화된 facet','replaceability/testability','adapter 수/trace 복잡도','cross-facet invariant'],
        ['더 durable한 기록','recoverability','I/O latency/privacy','pre-query flush'],
        ['강한 isolation','security','capability/usability','shell/tool coverage'],
        ['더 많은 feature gate','rollout safety','combination complexity','persistent format'],
      ]) + p('Tier 0/1 safety·correctness를 평균 점수로 희생하지 않고, 그 feasible set 안에서 Tier 2/3 비용을 비교한다.')),
    S('FITNESS', '문서의 경계를 CI 실패로 바꾼다', '새 structure가 다시 무너지지 않게 하는 최소 규칙은?',
      table(['rule','evidence'],[
        ['engine core에서 React/Ink import 금지','dependency fitness'],
        ['provider payload는 ContextIR assembler만 생성','construction-site scan'],
        ['ToolEffect에서 Presenter import 금지','boundary map'],
        ['journal record는 versioned union','schema + historical corpus'],
        ['feature excluded symbol/string 검사','build artifact scan'],
        ['CoreEvent projection exhaustive','compile-time + fixture'],
      ]) + strong('완료 조건','디렉터리가 그럴듯한 것이 아니라 잘못된 dependency와 누락된 variant가 자동으로 실패해야 한다.')),
    S('OPERATING LOOP', '리팩터링은 배포 뒤 feedback까지 포함한다', '코드 merge가 끝이 아닌 이유는 무엇인가?',
      chain([
        ['scenario','보존할 response/measure'],
        ['baseline','trace + cohort + limitation'],
        ['migration','작은 seam과 rollback'],
        ['validation','deterministic + adversarial'],
        ['rollout','feature cohort + telemetry'],
        ['settlement','effect/read-back/unknown'],
        ['learning','repeated failure를 owner surface로'],
      ]) + refs([local('docs/architecture/engineering-operating-model.md','Engineering Operating Model')])),
    S('STUDY ASSESSMENT', '용어 암기가 아니라 설계 판단을 평가한다', '학습자가 무엇을 만들어야 하는가?',
      table(['수준','과제','통과 기준'],[
        ['mechanism','async generator state를 설명','return/throw/cancel 비대칭 포함'],
        ['invariant','tool pairing 반례 구성','fallback/abort/resume 모두 설명'],
        ['effect','Edit race 재현','TOCTOU window와 limitation 명시'],
        ['architecture','Tool facet proposal','adapter/oracle/rollback 포함'],
        ['operation','rollout scenario 작성','identity join과 unknown 보존'],
        ['critique','보고서 비유 반박','코드·1차 자료로 경계 수정'],
      ])),
    S('CONCLUSION', '진화 가능한 구조는 의미의 이동을 추적할 수 있다', '이 권에서 남겨야 할 한 문장은 무엇인가?',
      quote('리팩터링의 단위는 파일이 아니라 invariant ownership이고, 완료의 증거는 diff가 아니라 실패 scenario에서의 동등성이다.') +
      p('분포와 주석은 어디를 볼지 알려 주고, 이론은 어떤 반례를 만들지 알려 준다. 최종 구조 판단은 고정된 코드 관찰·quality scenario·검증 가능한 migration seam의 결합에서 나온다.')),
  ],
})

await main()
