const E = {
  asyncGenerator: { label: 'ECMAScript async generator specification', url: 'https://tc39.es/ecma262/multipage/control-abstraction-objects.html#sec-asyncgenerator-objects' },
  abort: { label: 'Node.js AbortController / AbortSignal', url: 'https://nodejs.org/api/globals.html#class-abortcontroller' },
  cache: { label: 'Anthropic prompt caching', url: 'https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching' },
  react: { label: 'React render and commit', url: 'https://react.dev/learn/render-and-commit' },
  ink: { label: 'Ink repository and component model', url: 'https://github.com/vadimdemedes/ink' },
  mcp: { label: 'Model Context Protocol specification', url: 'https://modelcontextprotocol.io/specification/latest' },
  jsonSchema: { label: 'JSON Schema 2020-12', url: 'https://json-schema.org/draft/2020-12' },
  cwe367: { label: 'CWE-367 TOCTOU race condition', url: 'https://cwe.mitre.org/data/definitions/367.html' },
  owaspCommand: { label: 'OWASP command injection', url: 'https://owasp.org/www-community/attacks/Command_Injection' },
}

const P = (title, deck, mechanism, meaning, change, question, refs = [], options = {}) => ({
  title,
  deck,
  paragraphs: [mechanism, meaning, change],
  question,
  refs,
  ...options,
})

const report1 = {
  volume: '01',
  slug: '01-runtime-entrypoints-and-conversation-engine',
  short: '런타임과 대화 엔진',
  metricGroup: 'runtime-and-conversation',
  accent: '#28737a',
  title: '런타임 진입점과 대화 엔진',
  subtitle: 'CLI 프로세스가 어떻게 한 번의 요청을 지속 가능한 에이전트 실행으로 바꾸는지 코드의 책임 경계를 따라 읽는다',
  promise: '이 권을 마치면 main.tsx와 QueryEngine, query.ts를 “큰 파일 세 개”가 아니라 서로 다른 수명과 실패를 소유하는 세 층으로 설명할 수 있다.',
  orientation: '화면에서 보이는 프롬프트보다 먼저 프로세스가 실행 형태를 선택하고, QueryEngine이 세션 수명을 붙잡으며, query.ts가 모델 응답과 도구 결과가 교대하는 한 turn의 프로토콜을 수행한다. 우리는 이 셋을 한 줄짜리 흐름으로 축약하지 않고 각각이 보존해야 하는 상태와 실패 의미를 확인한다.',
  chapters: [
    {
      title: '프로세스는 먼저 실행 형태를 고른다',
      thesis: '같은 바이너리가 대화형 터미널, 비대화형 출력, SDK 제어, 특수 진입점을 품으려면 초기화와 제품 동작을 분리해야 한다.',
      paths: ['src/entrypoints/cli.tsx', 'src/main.tsx', 'src/bootstrap/**', 'src/replLauncher.tsx'],
      pages: [
        P('entrypoint는 단순한 main 함수가 아니다', '인자 하나가 렌더러·입출력 계약·오류 표면을 바꾼다.', '같이 <code>src/entrypoints/cli.tsx</code>를 펼치면 가장 먼저 보이는 것은 거대한 기능 구현이 아니라 실행 전 조건을 정리하는 얇은 경계다. 이 경계는 환경과 인자를 읽고 실제 CLI 구현을 불러오며, 번들 진입점이 제품 내부 모듈에 직접 달라붙지 않게 한다.', '이 얇음은 사소하지 않다. 번들러가 요구하는 시작점, 런타임이 요구하는 전역 초기화, 애플리케이션이 요구하는 모드 선택을 한 파일에 섞으면 테스트와 대체 진입점이 모두 어려워진다. entrypoint는 “무엇을 할지”보다 “어떤 세계에서 시작하는지”를 소유한다.', '변경을 검토할 때는 새 옵션을 어느 파일에 추가했는지보다 그 옵션이 프로세스 초기화에 속하는지, 세션 구성에 속하는지, turn 동작에 속하는지를 먼저 묻자. 이 질문이 <code>main.tsx</code>의 추가 비대화를 막는 첫 번째 기준이다.', '새 실행 모드를 넣는다면 어떤 책임까지 entrypoint에 두고 어디서부터 composition으로 넘길 것인가?', ['src/entrypoints/cli.tsx#L1-L120', 'src/main.tsx#L1-L120']),
        P('main.tsx의 크기는 우연이 아니라 결합 신호다', '4천 줄이 넘는 파일은 부트스트랩, 설정, 인증, 모드 선택이 한 교차점에 모였음을 보여 준다.', '<code>main.tsx</code>는 환경 검사, 설정 적재, 인증, 명령 처리, interactive/print 분기, 화면 구성으로 이어지는 여러 수명을 만난다. 그래서 이 파일을 “앱 시작 코드”라고만 부르면 왜 작은 수정이 넓은 회귀 위험을 갖는지 설명하지 못한다.', '여기서 중요한 것은 줄 수 자체가 아니라 서로 다른 변경 이유가 같은 영역에 있다는 점이다. 인증 정책 변경, CLI 옵션 추가, REPL 렌더링 변경은 각각 다른 이해관계인데 같은 composition root에서 부딪힌다. 큰 파일은 곧 나쁜 파일이 아니지만, 변경 이유의 수를 세게 만드는 관찰점이다.', '리팩터링은 함수를 임의로 잘라내는 일이 아니다. 먼저 순수한 옵션 해석, 외부 상태를 읽는 초기화, UI를 만드는 composition을 구분하고, 각 단계 사이에 전달되는 값을 명시해야 한다. 그래야 “작아졌지만 숨은 전역 상태는 그대로”인 분해를 피할 수 있다.', 'main.tsx 안에서 독립적으로 검증 가능한 첫 번째 seam은 어디이며, 그 seam이 전달해야 할 최소 상태는 무엇인가?', ['src/main.tsx#L240-L420', 'src/main.tsx#L3900-L4100']),
        P('대화형과 비대화형은 출력 형식만 다르지 않다', '입력을 기다리는 주체와 결과를 소비하는 주체가 달라지면 런타임 계약도 달라진다.', '대화형 경로에서는 Ink 화면이 사용자 입력, 권한 질문, 진행 상태, 중단을 함께 다룬다. 반면 print/headless 경로에서는 호출자가 메시지 스트림과 종료 상태를 소비한다. 같은 QueryEngine을 사용해도 누가 <code>next()</code>를 호출하고 누가 permission decision을 제공하는지가 달라진다.', '이 차이는 UI를 떼어낸 정도가 아니다. 대화형에서는 사람의 응답을 기다릴 수 있지만 headless에서는 자동 거부나 외부 host callback이 필요하다. 터미널 상태를 전제로 한 로직이 engine 내부로 새면 SDK는 곧바로 불완전한 두 번째 구현이 된다.', '새 기능을 추가할 때 “REPL에서 보인다”와 “engine 결과에 존재한다”를 구분하자. 먼저 canonical event와 상태 전이를 만들고, REPL과 SDK가 각각 그것을 표현하도록 해야 두 표면이 같은 의미를 유지한다.', '권한 요청처럼 대화형 대기가 필요한 사건을 headless 소비자에게는 어떤 타입의 이벤트로 노출해야 하는가?', ['src/main.tsx#L3140-L3350', 'src/QueryEngine.ts#L184-L280', 'src/entrypoints/sdk/coreTypes.ts']),
        P('초기화 순서는 숨은 의존성 지도다', '환경·설정·인증·도구·프롬프트는 서로의 전제이므로 순서가 곧 설계 정보다.', '부트스트랩 코드를 읽을 때 함수 이름만 나열하지 말고 각 단계가 무엇을 생산하고 다음 단계가 무엇을 전제하는지 적어 보자. 예를 들어 cwd와 설정이 정해져야 permission context를 만들 수 있고, 도구 집합과 모델이 정해져야 system prompt를 구성할 수 있다.', '이렇게 읽으면 초기화 순서가 단순한 procedural boilerplate가 아니라 dependency graph의 직렬화라는 점이 보인다. 전역 singleton이나 환경 변수를 뒤늦게 읽는 함수가 있다면 그래프 밖의 숨은 edge이며, 재현성과 테스트를 약화시킨다.', '구조를 개선하려면 모든 것을 DI 컨테이너로 옮길 필요는 없다. 단계별 산출물을 작은 immutable configuration으로 만들고, 늦게 필요한 외부 자원은 명시적 factory로 남기는 편이 이 코드의 현재 형태에 더 맞다.', '초기화 중간에 실패했을 때 이미 만들어진 자원의 정리 책임은 어느 단계가 가져야 하는가?', ['src/bootstrap/state.ts', 'src/main.tsx#L520-L760', 'src/replLauncher.tsx']),
      ],
    },
    {
      title: 'QueryEngine은 세션의 수명을 붙잡는다',
      thesis: 'QueryEngine의 핵심은 API를 호출하는 데 있지 않다. 여러 turn을 가로질러 메시지, 취소, 사용량, 권한 거부와 파일 관찰 상태를 일관되게 유지하는 데 있다.',
      paths: ['src/QueryEngine.ts', 'src/utils/abortController.ts', 'src/utils/processUserInput/**'],
      pages: [
        P('필드 목록에서 세션의 불변조건을 읽는다', '클래스의 private state는 이 객체가 대신 기억해 주는 약속의 목록이다.', '<code>mutableMessages</code>, <code>abortController</code>, 누적 usage, permission denials, read-file state는 서로 다른 이유로 turn 이후에도 남는다. 메시지는 다음 모델 호출의 과거이고, read-file state는 편집의 전제이며, 거부 목록은 SDK 결과의 설명 책임이다.', '이 필드들을 한데 묶은 이유는 모두 “한 번의 submit 호출”보다 긴 수명을 갖기 때문이다. 반대로 turn 안에서만 필요한 임시 상태가 여기에 쌓이기 시작하면 engine은 세션 owner와 작업 scratchpad의 경계를 잃는다.', '새 필드를 추가할 때는 먼저 수명을 적자: process, engine/session, turn, tool call 중 어디까지 살아야 하는가. 이 질문 하나로 reset 위치, 직렬화 여부, 동시 접근 위험이 결정된다.', 'discoveredSkillNames가 매 submit마다 clear되는 이유와 readFileState가 유지되는 이유를 수명 관점에서 비교해 보라.', ['src/QueryEngine.ts#L184-L213']),
        P('submitMessage는 문자열을 받는 함수가 아니라 turn을 여는 문이다', '한 호출 안에서 프롬프트 구성, 입력 정규화, query 실행, 결과 축적이 결합된다.', '메서드 초반의 구조 분해는 engine이 의존하는 capability를 드러낸다. 도구, MCP client, budget, model, app-state 접근자, permission callback이 모두 이번 turn의 실행 환경을 만든다. 이 목록은 API 옵션 모음이 아니라 turn이 성립하기 위한 포트다.', '이후 system prompt parts를 모으고 user input context를 만들며, query가 내보내는 사건을 SDK 메시지로 투영한다. 중요한 점은 request payload가 한 번에 만들어지고 끝나는 것이 아니라 입력 처리와 동적 기능 발견 때문에 turn 중에도 context가 보강될 수 있다는 것이다.', '이 메서드를 분리한다면 “줄 수” 기준이 아니라 setup, protocol execution, projection, settlement의 경계로 잘라야 한다. 각 단계가 실패했을 때 어느 상태까지 durable한지 함께 정의하지 않으면 분해 후에도 의미는 더 흐려진다.', 'submitMessage가 중간에 abort될 때 호출자에게 반드시 남겨야 하는 최소 결과는 무엇인가?', ['src/QueryEngine.ts#L215-L360', 'src/QueryEngine.ts#L520-L700']),
        P('async generator는 turn의 시간을 타입에 넣는다', '결과 하나가 아니라 부분 관찰의 연속을 반환하기 때문에 consumer가 실행 속도와 취소를 함께 제어한다.', '<code>async *submitMessage</code>는 Promise 하나로는 표현하기 어려운 중간 메시지, tool progress, 최종 결과를 차례로 내보낸다. <code>await</code>는 내부 비동기 작업을 기다리고 <code>yield</code>는 외부 소비자에게 현재까지의 관찰을 넘긴다.', '따라서 generator는 단순한 스트리밍 문법이 아니다. producer의 실행이 consumer의 <code>next()</code>에 맞춰 재개되고, 취소·오류·조기 return이 protocol 종료 의미를 갖는다. 영상에서 강조된 generator의 장점은 바로 이 지점에서 프로젝트의 실제 구조와 만난다.', '다만 generator가 내구성을 제공하지는 않는다. yield된 사건과 transcript에 기록된 사건이 어긋날 수 있으므로, 관찰 스트림과 durable journal의 책임을 따로 확인해야 한다.', 'consumer가 generator를 더 이상 순회하지 않을 때 실행 중인 provider stream과 tool effect는 어떻게 닫혀야 하는가?', ['src/QueryEngine.ts#L215-L235', 'src/query.ts#L260-L420'], { external: [E.asyncGenerator], pseudo: 'async function* submit(input) {\n  const context = await prepare(input)\n  for await (const event of runTurn(context)) yield project(event)\n  await settleTurn()\n}' }),
        P('AbortSignal은 취소 요청이지 자동 롤백이 아니다', '하나의 signal이 여러 비동기 경계를 통과해도 이미 일어난 외부 효과는 되돌아가지 않는다.', 'engine이 소유한 AbortController는 provider 요청과 tool context가 공통의 취소 의도를 보게 한다. 각 하위 작업은 signal을 관찰하고 가능한 지점에서 멈춰야 한다. 이 협력적 모델 덕분에 강제 스레드 중단 없이도 정리 코드를 실행할 수 있다.', '하지만 사용자가 중단을 누른 순간 파일 write가 이미 끝났다면 signal은 그 효과를 취소하지 못한다. 따라서 UI의 “중단됨”, query protocol의 종료, 실제 파일 시스템 상태를 같은 것으로 취급하면 안 된다.', '취소 설계는 세 질문으로 검토하자. 새 작업 시작을 막는가, 진행 중 I/O에 signal을 전달하는가, 부분 효과 뒤 어떤 결과를 journal에 남기는가. 이 셋이 모여야 사용자가 본 상태와 실제 상태가 다시 합쳐진다.', 'Bash process와 파일 편집은 같은 AbortSignal을 받아도 왜 서로 다른 settlement가 필요한가?', ['src/QueryEngine.ts#L184-L205', 'src/Tool.ts#L158-L205', 'src/services/tools/toolExecution.ts#L390-L460'], { external: [E.abort] }),
      ],
    },
    {
      title: 'query.ts는 한 turn의 프로토콜을 수행한다',
      thesis: '모델 응답과 도구 실행이 반복된다는 설명만으로는 부족하다. 각 반복에서 메시지 pairing, budget, recovery, stop 이유가 닫혀야 다음 반복이 유효해진다.',
      paths: ['src/query.ts', 'src/query/config.ts', 'src/query/stopHooks.ts', 'src/services/tools/**'],
      pages: [
        P('루프보다 먼저 protocol state를 찾는다', 'query.ts를 while문으로 요약하면 가장 중요한 예외 상태가 사라진다.', '이 파일은 provider 호출, streaming message, tool-use 수집, tool-result 생성, compact와 retry를 한 turn 안에서 조율한다. 반복 자체보다 중요한 것은 현재 메시지가 누구의 응답인지, tool_use id가 어떤 result를 기다리는지, stop_reason이 무엇을 허용하는지다.', '이를 state machine으로 읽으면 조건문이 “잡다한 예외”가 아니라 허용된 전이의 guard로 보인다. 예를 들어 tool result가 빠진 상태로 다음 provider 호출을 하면 API protocol 자체가 깨질 수 있다.', '스터디에서는 각 branch를 실행 순서로 외우지 말고 state와 invariant로 적어 보자. 그러면 파일을 분해할 때도 함수 경계가 아니라 상태 소유권을 기준으로 제안할 수 있다.', '현재 turn을 가장 작은 상태 집합으로 표현한다면 model phase, tool phase, settlement phase에 어떤 필드가 필요한가?', ['src/query.ts#L200-L380', 'src/query.ts#L900-L1120']),
        P('streaming은 텍스트 조각 이상의 사건을 운반한다', '모델 출력은 content delta, usage, stop, error가 섞인 typed event stream이다.', 'API stream을 소비하는 코드는 텍스트를 이어 붙이는 동시에 assistant message의 정체성과 usage를 갱신하고, tool-use block이 완성되는 시점을 판별한다. 즉 화면에 보이는 토큰과 실행에 필요한 구조화 블록이 같은 transport에서 다른 소비자를 가진다.', '이 구조에서 “첫 토큰 latency”와 “메시지 완결성”은 서로 다른 품질이다. UI는 부분 텍스트를 빨리 보여 줄 수 있지만 tool executor는 arguments가 닫힐 때까지 기다려야 한다. 한 스트림을 여러 projection으로 읽는 이유다.', '새 event를 추가한다면 query 내부 처리, SDK projection, transcript persistence, REPL 표시 중 어떤 소비자가 반드시 알아야 하는지 명시해야 한다. 그렇지 않으면 한 표면만 조용히 의미를 잃는다.', '부분 assistant message를 저장하거나 노출할 때 재개 시 중복과 불완전 블록을 어떻게 구별할 것인가?', ['src/query.ts#L420-L660', 'src/services/api/claude.ts#L1800-L2050']),
        P('tool_use와 tool_result는 하나의 대화 원자다', '외부 효과는 두 메시지 사이에서 일어나지만 다음 모델 호출에는 짝이 맞는 기록으로 들어가야 한다.', '모델이 tool_use id를 내보내면 runtime은 해당 도구를 찾고 실행한 뒤 같은 id의 tool_result를 user-side content로 만든다. 성공뿐 아니라 unknown tool, permission denial, abort도 result 형태로 돌아가야 protocol이 닫힌다.', '이 pairing은 데이터베이스 transaction과 동일하지 않다. 실제 shell이나 파일 효과는 이미 일어났을 수 있고 원자적 롤백도 없다. 여기서 원자성은 대화 protocol 관점의 관찰 완결성에 가깝다.', '따라서 오류 처리는 예외를 던지는 것으로 끝나지 않는다. 다음 모델이 무엇을 보게 되는지, transcript가 어떤 상태로 재개되는지까지 포함해야 한다. tool id는 효과·관찰·복구를 잇는 correlation key다.', '도구 구현이 throw한 경우에도 왜 tool_result 형태의 관찰을 남겨야 하는가?', ['src/services/tools/toolExecution.ts#L337-L470', 'src/utils/messages.ts#L5100-L5300']),
        P('budget과 stop은 정책이 protocol을 자르는 방식이다', 'max turns, 비용, token budget은 숫자 옵션이 아니라 종료 의미를 만든다.', 'query는 모델의 자연 종료만 기다리지 않는다. 호출 횟수와 비용, 사용자 취소, hook 결과, provider 오류가 실행을 끝낼 수 있다. 각 종료 원인은 사용자와 SDK가 다른 후속 행동을 선택할 수 있도록 구분되어야 한다.', 'budget check가 루프 바깥에 한 번만 있으면 직전 호출의 사용량을 반영하지 못하고, tool 실행 뒤에만 있으면 이미 새 효과가 시작될 수 있다. 어디에서 검사하는지가 정책의 실제 의미다.', '새 제한을 넣을 때는 측정 단위, 검사 시점, 초과 전 허용 오차, 이미 시작된 작업 처리, 결과 표현을 함께 설계하자. 숫자 상수 하나만 추가하는 변경은 거의 항상 불완전하다.', '비용 상한에 도달했을 때 현재 tool_use를 실행해야 하는가, 거부 result를 만들어야 하는가, turn 전체를 중단해야 하는가?', ['src/query/tokenBudget.ts', 'src/QueryEngine.ts#L500-L690', 'src/query.ts#L1180-L1370']),
      ],
    },
    {
      title: 'Provider 경계에서 의미를 보존한다',
      thesis: '서비스 API 코드는 HTTP 호출 래퍼가 아니다. 내부 메시지와 모델별 요청 형식, cache, retry, fallback의 차이를 흡수하는 anti-corruption layer다.',
      paths: ['src/services/api/claude.ts', 'src/utils/queryContext.ts', 'src/upstreamproxy/**'],
      pages: [
        P('내부 메시지와 provider payload를 같은 타입으로 두지 않는 이유', '세션이 기억해야 할 사실과 특정 API가 요구하는 직렬화는 수명이 다르다.', '내부에는 UI용 메타데이터, transcript 식별자, attachment provenance가 있지만 provider는 정해진 role/content/tool schema만 받는다. API 경계는 이 차이를 지우는 곳이 아니라 의도적으로 변환하는 곳이다.', '내부 타입을 provider SDK 타입으로 곧장 사용하면 SDK 업데이트가 세션 저장 형식까지 흔든다. 반대로 변환 함수가 너무 느슨하면 중요한 tool id나 cache marker가 소실된다. 경계의 품질은 필드 수가 아니라 보존해야 할 invariant의 명시성으로 평가해야 한다.', 'provider를 추가하거나 버전을 올릴 때는 request shape 비교뿐 아니라 stop reason, usage, streaming error가 내부 event로 어떻게 정규화되는지 확인하자.', 'provider가 새로운 content block을 추가했는데 내부 union이 모르면 그것을 버릴 것인가, 보존할 것인가, 명시적으로 실패할 것인가?', ['src/services/api/claude.ts#L300-L620', 'src/utils/queryContext.ts#L1-L179']),
        P('prompt cache는 성능 기능이면서 표현 순서의 제약이다', '재사용 가능한 prefix를 만들려면 system·tool·message 배열의 안정성이 필요하다.', 'Prompt caching은 같은 앞부분을 다시 보내는 비용과 latency를 줄이지만, cache breakpoint 앞의 작은 변화가 큰 miss를 만들 수 있다. 따라서 context builder의 순서와 동적 정보 배치가 곧 캐시 전략이 된다.', '이 프로젝트에서 cache control과 prompt 구성은 별도 관심사가 아니다. tools나 system context가 매 turn 불필요하게 흔들리면 기능상 정답이어도 운영 비용은 악화된다. 반대로 cache hit을 위해 오래된 정보를 고정하면 정확성이 깨진다.', '성능 개선은 hit rate만 보지 말고 어떤 정보가 얼마나 자주 변하며, 그 정보를 prefix 뒤로 옮겨도 의미가 같은지 검토해야 한다. 표현의 안정성과 최신성 사이의 tradeoff다.', '시간·cwd·동적 MCP instructions 중 어떤 정보를 cacheable prefix에 둘 수 있고, 어떤 것은 매 turn 갱신해야 하는가?', ['src/services/api/claude.ts#L1120-L1380', 'src/services/api/promptCacheBreakDetection.ts'], { external: [E.cache] }),
        P('retry와 fallback은 같은 요청의 반복이 아닐 수 있다', 'stream 중간 실패와 호출 전 실패는 이미 관찰된 출력과 비용이 다르다.', '연결 전에 실패하면 같은 request를 다시 보내는 것이 비교적 단순하지만, 일부 토큰이나 tool_use가 이미 전달된 뒤라면 재시도는 중복 메시지와 중복 효과 가능성을 만든다. fallback model은 여기에 모델 행동 차이까지 추가한다.', '따라서 retry 정책은 오류 코드 목록보다 commit point를 먼저 정의해야 한다. consumer에게 어느 사건이 보였는지, assistant message가 journal에 들어갔는지, tool execution이 시작됐는지가 재시도 가능성을 결정한다.', '오류 처리 코드를 리팩터링할 때 모든 provider error를 공통 helper로 합치는 유혹을 경계하자. 공통화할 것은 분류와 backoff이고, 부분 관찰 뒤의 settlement는 protocol layer가 소유해야 한다.', '첫 content delta 이후 연결이 끊겼을 때 “같은 turn 재시도”가 안전하다는 것을 어떤 상태로 판단할 수 있는가?', ['src/services/api/claude.ts#L2200-L2510', 'src/query.ts#L1370-L1570']),
        P('엔진을 바꿀 때 보존해야 할 것은 호출 순서가 아니라 의미다', '리팩터링의 oracle은 사용자에게 보이는 최종 문자열보다 넓다.', 'QueryEngine과 query.ts를 분해하려면 메시지 pairing, permission denial, cancellation, usage aggregation, transcript resume를 동등성 기준으로 잡아야 한다. 이 중 하나라도 잃으면 happy path 테스트가 통과해도 runtime 의미는 달라진다.', '좋은 seam 후보는 context preparation, model stream adapter, tool phase, turn settlement다. 각각 입력과 출력이 typed value로 닫히며 실패 책임도 다르다. 반면 “helpers” 폴더로 조건문을 이동하는 것은 소유권을 만들지 않는다.', '작은 단계로 옮길 때 기존 함수와 새 함수가 같은 event trace를 만드는지 shadow comparison을 사용할 수 있다. 단, 실제 tool effect를 두 번 실행하지 않도록 provider와 effect port를 기록/재생 가능한 경계로 바꿔야 한다.', '리팩터링 전후를 비교하는 최소 trace에는 어떤 event와 상태 snapshot이 들어가야 하는가?', ['src/QueryEngine.ts', 'src/query.ts', 'src/services/tools/toolExecution.ts']),
      ],
    },
  ],
  workshop: {
    title: '한 번의 turn을 코드에서 재구성해 보기',
    deck: '순서를 베끼지 말고, 각 단계가 어떤 상태를 소유하며 무엇을 다음 단계에 보장하는지 기록한다.',
    steps: [
      '<code>entrypoints/cli.tsx</code>에서 선택된 실행 모드가 <code>main.tsx</code>의 어느 composition으로 이어지는지 찾는다.',
      '<code>QueryEngine.submitMessage</code>의 config 구조 분해에서 session-level port와 turn-level option을 두 색으로 구분한다.',
      '<code>query.ts</code>에서 model phase와 tool phase를 나누고, 각 경계를 넘는 message id와 tool_use id를 적는다.',
      'abort, permission denial, unknown tool, provider stream failure 네 반례가 어떤 SDK message와 transcript 상태를 남기는지 비교한다.',
      '리팩터링 seam 하나를 고르고 입력·출력·실패·동등성 oracle을 한 장에 작성한다.',
    ],
    outcome: '한 turn을 “사용자 → 모델 → 도구 → 모델” 화살표가 아니라 상태·식별자·종료 의미를 가진 protocol로 설명할 수 있으면 된다.',
    record: '다음 모임에는 가장 위험한 숨은 전역 의존성 하나와, 그것을 명시적 입력으로 바꿀 때 생길 비용을 가져온다.',
    refs: ['src/QueryEngine.ts', 'src/query.ts', 'src/services/api/claude.ts'],
  },
}

const report2 = {
  volume: '02',
  slug: '02-context-messages-memory-and-session',
  short: '컨텍스트·메시지·세션',
  metricGroup: 'context-message-session',
  accent: '#6256a7',
  title: '컨텍스트, 메시지, 기억과 세션',
  subtitle: '모델이 보게 되는 세계가 어떻게 선택·정규화·압축·저장되고, 재개 시 다시 유효한 대화로 조립되는지 읽는다',
  promise: '이 권을 마치면 context를 “프롬프트 문자열”이 아니라 출처와 순서, 손실, cache, 재개 규칙을 가진 실행 표현으로 설명할 수 있다.',
  orientation: '사용자의 한 줄 입력은 곧바로 API로 가지 않는다. 명령 문법을 통과하고, 여러 attachment와 memory를 만나며, 내부 message union으로 정규화되고, token 압력 아래 compact되며, session journal에서 복구된다. 이 권은 정보가 많아지는 과정뿐 아니라 무엇이 의도적으로 사라지고 무엇이 끝까지 보존되는지를 추적한다.',
  chapters: [
    {
      title: '사용자 입력은 작은 언어로 해석된다',
      thesis: '같은 입력 상자에 들어온 문자열이라도 slash command, shell shortcut, 일반 prompt는 서로 다른 효과와 기록 방식을 가진다.',
      paths: ['src/utils/processUserInput/**', 'src/commands/**', 'src/constants/prompts.ts'],
      pages: [
        P('processUserInput은 문자열 분기보다 큰 경계다', '입력을 어떤 언어로 읽을지 결정하는 순간 권한과 기록 의미가 갈린다.', '일반 텍스트는 모델 입력이 되지만 slash command는 로컬 상태를 바꾸거나 별도 화면을 열 수 있고, shell shortcut은 곧바로 외부 효과를 일으킬 수 있다. 같은 TextInput이라도 semantic category가 다르다.', '이 경계를 parser로 보면 명령 인식, 인자 해석, 실행을 분리해야 하는 이유가 보인다. 인식과 효과가 한 함수에 붙으면 autocomplete, 도움말, audit가 실제 실행 규칙과 쉽게 어긋난다.', '새 입력 문법을 추가할 때는 우선순위와 escaping을 반드시 검토하자. 일반 prompt로 보내려던 문자열이 명령으로 오해되거나, 명령 인자가 transcript에서 다른 형태로 남을 수 있기 때문이다.', '명령 prefix를 escape해 일반 모델 입력으로 보내는 규칙은 어디에서 소유해야 가장 일관적인가?', ['src/utils/processUserInput/processUserInput.ts', 'src/utils/processUserInput/processSlashCommand.tsx', 'src/utils/processUserInput/processBashCommand.tsx']),
        P('slash command는 UI 메뉴가 아니라 로컬 capability다', '명령 목록에는 모델을 거치지 않고 세션·설정·화면을 바꾸는 기능이 모여 있다.', '<code>src/commands/**</code>를 보면 각 명령은 이름과 설명만 가지지 않는다. 활성 조건, 인자 처리, React 화면, state update가 결합된 작은 application service처럼 동작한다.', '이 구조는 명령을 빠르게 추가하기 좋지만, 명령이 app state 내부 구조를 직접 알기 시작하면 command catalog가 두 번째 composition root가 된다. 특히 session을 지우거나 permission mode를 바꾸는 명령은 화면 편의 기능이 아니라 제어 평면이다.', '스터디에서는 명령을 기능별로 외우기보다 effect class로 분류해 보자: pure query, UI navigation, session mutation, external effect. 이 분류는 테스트와 권한 요구를 결정한다.', '새 명령이 “사용자 명시 입력”이라는 이유만으로 별도 permission 확인 없이 외부 효과를 실행해도 되는가?', ['src/commands', 'src/utils/processUserInput/processSlashCommand.tsx']),
        P('attachment는 부가 파일이 아니라 context의 typed source다', '이미지, 진단, MCP resource, task 상태, hook context가 한 message로 낮아지기 전까지 서로 다른 의미를 유지한다.', '<code>normalizeAttachmentForAPI</code> 주변의 큰 switch는 attachment 종류가 얼마나 넓은지 보여 준다. 각 case는 단순 직렬화가 아니라 숨김 여부, provenance, 표시 문구, legacy 호환을 함께 정한다.', '모든 attachment를 일찍 문자열로 바꾸면 구현은 단순해지지만 출처와 보안 등급을 잃는다. 반대로 typed object를 끝까지 유지하면 provider adapter가 복잡해진다. 현재 코드는 내부에서 타입을 유지하고 API 직전에 표현을 낮추는 쪽에 가깝다.', '새 attachment를 설계할 때 model-visible content, transcript-visible content, UI-only metadata를 따로 적자. 세 projection이 같을 필요는 없지만 차이는 의도적이어야 한다.', 'hook이 추가한 context와 사용자가 붙인 파일은 모델에는 모두 text여도 감사와 표시에서는 왜 달라야 하는가?', ['src/utils/messages.ts#L3560-L4285']),
        P('system prompt는 정적 문서가 아니라 구성 결과다', '도구, 모델, 작업 디렉터리, 모드, 조직 정책이 서로 다른 조각을 더한다.', 'QueryEngine은 기본 prompt, memory mechanics, append prompt를 배열로 조립한다. 이때 순서는 단순한 문서 편집 순서가 아니라 지시의 범위와 cache 안정성에 영향을 준다.', '프롬프트 조각을 한 거대한 상수로 합치면 최종 문자열은 보기 쉽지만 어떤 capability가 어떤 지시를 요구했는지 provenance가 사라진다. 반대로 조각이 지나치게 분산되면 실제 모델 입력을 재구성하기 어렵다.', '좋은 개선은 prompt fragment에 owner, activation condition, intended audience를 붙이고 최종 assembly trace를 관찰 가능하게 만드는 것이다. 단, 사용자 데이터나 비밀 prompt를 로그에 그대로 남기지 않아야 한다.', '같은 지시가 system prompt와 tool description에 중복될 때 어느 쪽을 canonical owner로 둘 것인가?', ['src/QueryEngine.ts#L280-L350', 'src/constants/prompts.ts']),
      ],
    },
    {
      title: '메시지는 대화 기록이면서 실행 프로토콜이다',
      thesis: 'role과 text만으로는 tool pairing, partial output, compaction boundary, metadata를 표현할 수 없다. 메시지 모델은 런타임의 내부 IR에 가깝다.',
      paths: ['src/utils/messages.ts', 'src/types/**', 'src/utils/queryContext.ts'],
      pages: [
        P('discriminated union이 가능한 상태를 제한한다', '메시지 type과 subtype은 실행 중 어떤 사건이 존재할 수 있는지 코드로 적는다.', 'assistant, user, system message는 content만 다른 레코드가 아니다. compact boundary, hook result, task notification처럼 runtime 의미가 있는 system subtype들이 별도 형태를 가진다. TypeScript의 discriminated union은 각 case에서 필요한 필드를 좁혀 준다.', '이 메커니즘의 가치는 autocomplete보다 변경 파급을 드러내는 데 있다. 새 subtype을 추가하면 normalization, rendering, persistence가 exhaustive한지 확인할 수 있다. 다만 <code>any</code>와 broad cast가 많아지면 그 안전망은 사라진다.', '타입 리팩터링은 먼저 실제 variant 목록과 consumer matrix를 만든 뒤 해야 한다. 누락된 원본 type 파일이 있는 복원 저장소에서는 컴파일 성공만으로 완전성을 주장할 수 없다는 점도 함께 기억하자.', 'unknown variant를 만났을 때 오래된 세션을 살리기 위해 무시할 것인가, 데이터 손실을 막기 위해 실패할 것인가?', ['src/utils/messages.ts#L1-L240', 'src/types']),
        P('정규화는 정보를 버리는 결정이다', 'provider가 이해하지 못하는 내부 메타데이터를 제거하면서도 protocol 필드는 지켜야 한다.', 'query context 변환은 내부 message에서 API message를 만든다. 이 과정에서 UI용 필드와 내부 origin은 빠질 수 있지만 role 순서, tool_use/tool_result id, content block 순서는 유지되어야 한다.', '정규화를 단순 map 함수로 보면 삭제된 정보의 의미를 놓친다. 어떤 필드는 privacy 때문에 보내지 않고, 어떤 필드는 provider schema에 없어서 보내지 않으며, 어떤 필드는 다음 turn 계산에만 필요하다. 같은 “제거”라도 근거가 다르다.', '변환 함수 옆에 field-level comment를 늘어놓기보다, source-to-target mapping 테스트와 금지 필드 테스트를 두는 편이 더 강한 계약이 된다.', '내부 provenance를 provider에 보내지 않으면서도 응답을 원래 source와 다시 연결하려면 어떤 correlation data가 필요한가?', ['src/utils/queryContext.ts', 'src/services/api/claude.ts#L300-L620']),
        P('tool pairing은 메시지 정리 단계에서도 다시 검사된다', '실행 당시 맞았던 짝도 compaction과 resume 뒤에는 고아가 될 수 있다.', 'messages 유틸리티에는 orphaned tool result 제거, 중복 id 보정, transcript가 mid-turn에서 시작하는 경우의 repair가 있다. 이는 message 배열이 언제나 이상적인 API 대화로 저장된다고 가정하지 않는다는 뜻이다.', 'repair는 편리하지만 위험하다. 조용히 삭제하면 세션은 살아나도 어떤 효과가 실제로 있었는지 설명이 사라질 수 있다. 따라서 API 호환을 위한 projection repair와 원본 journal 보존을 구분해야 한다.', '재개 경로를 고칠 때는 “API가 받아들인다”를 성공 기준으로 삼지 말자. 사용자에게 보이는 과거, 실제 파일 상태, 모델이 보게 될 과거가 얼마나 일치하는지 확인해야 한다.', '고아 tool result를 제거한 사실 자체를 사용자나 telemetry에 알려야 하는 조건은 무엇인가?', ['src/utils/messages.ts#L4980-L5310']),
        P('메시지 ID는 여러 projection을 연결하는 축이다', '화면의 행, transcript record, tool result, SDK event가 같은 사건을 가리키려면 안정된 identity가 필요하다.', '코드를 따라가면 uuid, request id, tool_use id, source assistant uuid가 서로 다른 관계를 표현한다. 하나의 만능 id가 아니라 session/turn/message/tool-call 수준이 구분되어 있다.', 'ID를 단순 문자열로 두면 전달은 쉽지만 잘못된 수준의 id를 섞어도 타입이 막지 못한다. branded type이나 명시적 이름이 유지보수에 도움이 되는 이유다. 실제로 id는 정렬 키가 아니라 인과 관계를 복구하는 열쇠다.', '새 projection을 추가할 때 화면 편의를 위해 id를 재생성하지 말고 canonical identity를 전달하자. 필요한 경우 projection-local key와 domain identity를 별도 필드로 둔다.', '재시도된 provider request는 같은 request id를 유지해야 하는가, 같은 turn 아래 새 attempt id를 가져야 하는가?', ['src/types/ids.ts', 'src/QueryEngine.ts#L600-L700', 'src/services/tools/toolExecution.ts#L350-L390']),
      ],
    },
    {
      title: '기억은 저장보다 선택이 어렵다',
      thesis: 'memory 파일이 존재하는 것만으로 모델이 기억하는 것은 아니다. 발견·관련성 판단·prompt 삽입·갱신이 함께 작동해야 한다.',
      paths: ['src/memdir/**', 'src/services/extractMemories/**', 'src/services/autoDream/**'],
      pages: [
        P('memory directory는 작은 지식 저장소다', '경로와 파일 형식은 저장 위치가 아니라 발견과 범위의 규칙을 만든다.', 'memdir 코드는 개인·프로젝트·팀 기억의 경로와 scan을 다룬다. 모델은 filesystem 전체를 자동으로 기억하지 않으므로, 어떤 디렉터리를 탐색하고 어떤 파일을 후보로 삼는지가 실제 memory capability를 결정한다.', '이 구조는 retrieval system과 닮았지만 vector database와 같지는 않다. 파일 경로, 이름, 최근성, 명시적 prompt가 중요한 신호이며 사용자가 직접 열어볼 수 있다는 장점이 있다.', '새 memory 종류를 추가할 때 저장 API보다 먼저 scope와 precedence를 정하자. 전역 기억과 프로젝트 기억이 충돌할 때 어느 것이 우선인지, 오래된 사실을 어떻게 표시할지 없으면 더 많은 memory가 더 나쁜 context를 만든다.', '팀 memory에 개인 선호나 비밀이 들어가지 않도록 쓰기 경계와 읽기 경계를 각각 어디에서 검사할 것인가?', ['src/memdir/memdir.ts', 'src/memdir/paths.ts', 'src/memdir/memoryScan.ts']),
        P('relevance selection이 model world를 결정한다', '모든 기억을 넣을 수 없으므로 선택 함수는 곧 정보 손실 정책이다.', '<code>findRelevantMemories</code>는 현재 작업과 연결된 memory를 찾으려 한다. 여기서 false negative는 필요한 지식을 잃고, false positive는 token과 주의를 낭비한다. 둘의 비용은 대칭이 아니다.', '관련성 점수만 보면 provenance와 freshness가 빠진다. 오래된 설정이 높은 유사도로 선택될 수 있고, 팀 규칙보다 개인 메모가 먼저 들어갈 수도 있다. 따라서 selection에는 source, age, scope를 함께 고려할 여지가 있다.', '개선 실험은 단순 retrieval hit rate가 아니라 실제 task outcome과 stale-memory harm를 함께 봐야 한다. 현재 코드에서 얻을 수 없는 운영 지표는 보고서가 임의로 성공 기준으로 선언하지 않는다.', '같은 키워드를 가진 상충 memory 두 개를 발견했을 때 모델에 둘 다 보여 줄 것인가, 하나를 선택할 것인가?', ['src/memdir/findRelevantMemories.ts', 'src/memdir/memoryAge.ts']),
        P('extract와 autoDream은 쓰기 권한을 가진 요약기다', '대화에서 기억 후보를 만드는 순간 임시 발언이 장기 지식으로 승격될 수 있다.', 'memory extraction은 세션의 관찰에서 재사용할 사실을 뽑고, autoDream 계열은 유휴 시간에 이를 통합하려 한다. 이 기능은 단순 요약보다 강하다. 다음 세션의 행동을 바꿀 수 있는 durable artifact를 만든다.', '따라서 생성 품질뿐 아니라 admission policy가 필요하다. 누가 말했는지, 사실인지 선호인지, 만료 조건은 무엇인지, 사용자 수정은 어떻게 반영되는지를 잃으면 memory가 권위 없는 prompt injection이 된다.', '코드를 읽을 때 프롬프트 내용만 보지 말고 write target, secret guard, feature gate, consolidation lock을 함께 보자. 이 주변 장치가 기능의 실제 안전 경계다.', '모델이 추출한 기억을 즉시 쓰는 것과 사용자 검토 후 쓰는 것 사이에서 이 프로젝트가 선택한 기본은 무엇이며 왜 그런가?', ['src/services/extractMemories/extractMemories.ts', 'src/services/autoDream/autoDream.ts', 'src/services/autoDream/consolidationLock.ts']),
        P('기억과 skill은 context에 들어오는 방식이 다르다', '기억은 사실 후보이고 skill은 행동 지침이므로 같은 우선순위로 합치면 안 된다.', '파일 편집 경로에서 관련 skill directory를 발견하고 비동기로 로드하는 코드는 작업 대상이 capability discovery를 촉발할 수 있음을 보여 준다. 반면 memory는 과거 사실과 선호를 보강한다.', '둘 다 text로 내려가더라도 trust semantics는 다르다. skill은 실행 방법을 제시하고 tool 사용을 유도할 수 있어 더 강한 instruction surface다. memory의 우연한 문구를 skill처럼 해석하거나 외부 skill을 개인 기억처럼 신뢰하면 경계가 무너진다.', 'context assembly에서 source label과 instruction priority를 보존해야 하는 이유가 여기에 있다. 모델에게 보여 주는 최종 문자열보다 그 문자열이 어떤 권위를 갖는지가 중요하다.', '동적으로 발견된 skill이 현재 turn 중간에 추가될 때 이미 만든 prompt cache와 도구 목록은 어떻게 갱신되어야 하는가?', ['src/tools/FileEditTool/FileEditTool.ts#L387-L430', 'src/skills/loadSkillsDir.ts', 'src/utils/messages.ts#L4180-L4230']),
      ],
    },
    {
      title: '압축과 재개는 과거를 다시 쓰는 작업이다',
      thesis: 'token 한도를 넘지 않기 위해 과거를 줄이되, 다음 행동을 정당화하는 사실과 미완료 효과는 보존해야 한다.',
      paths: ['src/services/compact/**', 'src/utils/sessionStorage.ts', 'src/history.ts', 'src/utils/messages.ts'],
      pages: [
        P('compact는 요약 기능이 아니라 lossy state migration이다', '원본 message history가 더 작은 표현으로 바뀌며 다음 turn의 행동 기반도 달라진다.', 'auto compact는 오래된 대화를 요약하고 boundary message를 남긴다. 이때 사라진 token에는 단순 잡담뿐 아니라 파일을 왜 바꿨는지, 어떤 tool이 실패했는지 같은 결정 근거가 포함될 수 있다.', '따라서 좋은 summary는 “내용을 짧게” 하는 것이 아니라 future action에 필요한 invariant를 보존해야 한다. 열린 task, 수정된 파일, 거부된 권한, 미해결 오류는 일반 서술보다 구조화된 상태에 가깝다.', '압축 품질을 평가할 때 자연스러운 문장과 token 절감만 보지 말자. 압축 전후 동일한 후속 질문에 필요한 사실이 유지되는지, 중복 효과를 유발하지 않는지를 확인해야 한다.', '현재 대화에서 compact 후에도 반드시 보존되어야 할 다섯 가지 실행 사실을 골라 보라.', ['src/services/compact/compact.ts', 'src/services/compact/autoCompact.ts', 'src/services/compact/prompt.ts']),
        P('microcompact는 결과 내용과 tool identity를 분리한다', '큰 tool output을 지워도 무엇을 실행했고 무엇을 얻었는지는 추적되어야 한다.', 'microCompact는 특정 도구 결과를 대상으로 token을 줄이고 어떤 tool id가 정리되었는지 boundary metadata에 남긴다. 이는 출력 payload와 실행 사실을 같은 것으로 보지 않는 설계다.', '여기서 함정은 파일을 읽었다는 사실만 남고 읽은 내용이 사라지는 경우다. 이후 편집이 그 내용에 의존한다면 모델은 stale한 자신감을 가질 수 있다. 반대로 모든 결과를 유지하면 긴 세션이 진행되지 않는다.', '도구별 compaction policy가 필요한 이유다. 재생성 비용이 낮은 검색 결과와, 재실행하면 다른 값을 내는 외부 명령 결과는 같은 방식으로 버릴 수 없다.', '어떤 tool result는 요약하고 어떤 것은 다시 읽도록 tombstone만 남겨야 하는지 판단 기준을 만들어 보라.', ['src/services/compact/microCompact.ts#L40-L120', 'src/utils/messages.ts#L4557-L4580']),
        P('session storage는 화면 상태가 아니라 재구성 재료를 저장한다', '재개 가능한 시스템은 최종 문자열보다 사건의 순서와 identity를 필요로 한다.', 'session storage와 history 코드를 읽으면 메시지 직렬화, 세션 식별, append와 load가 만난다. 저장 포맷은 현재 UI component state와 분리되어야 다른 표면에서도 같은 세션을 열 수 있다.', '내구성은 파일에 썼다는 사실만으로 충분하지 않다. 부분 write, process crash, 버전 변경, 중복 append를 견뎌야 한다. 복구 코드는 그래서 legacy variant와 orphan repair를 다룬다.', '포맷 변경에는 migration만큼 downgrade와 unknown field 보존도 중요하다. 오래된 클라이언트가 새 subtype을 만나도 원본을 손상시키지 않는 전략이 필요하다.', 'session file 쓰기 중 crash가 나면 다음 시작에서 완전한 마지막 record를 어떻게 판별할 수 있는가?', ['src/utils/sessionStorage.ts', 'src/utils/sessionStoragePortable.ts', 'src/history.ts']),
        P('resume는 저장 파일을 읽는 일이 아니라 일관된 과거를 만드는 일이다', 'journal, 실제 workspace, provider protocol이 서로 다른 상태일 수 있다.', '재개 시 messages는 compact boundary 이후로 잘릴 수 있고, 고아 tool result가 정리되며, 현재 파일은 세션 종료 당시와 달라졌을 수 있다. 즉 저장된 기록을 그대로 배열에 넣는 것만으로는 유효한 실행 상태가 되지 않는다.', '복구 과정은 세 truth를 조정한다: 기록된 intent, 관찰된 effect, 현재 외부 상태. 이 셋이 다르면 시스템은 조용히 하나를 정답으로 고르기보다 사용자에게 불확실성을 드러내야 한다.', '구조 개선에서는 raw journal과 model-facing repaired projection을 분리하는 방향이 유용하다. repair가 무엇을 지웠는지 추적할 수 있고, 미래 버전이 원본에서 다시 projection을 만들 수 있기 때문이다.', 'resume 직후 첫 모델 호출 전에 어떤 consistency check를 수행하면 중복 실행 위험을 줄일 수 있는가?', ['src/utils/messages.ts#L4600-L4660', 'src/utils/messages.ts#L4980-L5310', 'src/assistant/sessionHistory.ts']),
      ],
    },
  ],
  workshop: {
    title: '한 입력이 model context가 되기까지의 정보 장부 만들기',
    deck: '추가된 정보만 적지 말고 각 변환에서 사라진 정보, 바뀐 권위, 남은 identity를 함께 기록한다.',
    steps: [
      '일반 prompt, slash command, shell shortcut 세 입력을 골라 <code>processUserInput</code>의 서로 다른 결과를 표로 만든다.',
      'attachment 하나를 골라 internal representation, model-visible text, transcript 표시를 비교한다.',
      'tool_use와 tool_result 한 쌍을 compact 전후로 추적하고 살아남는 id와 사라지는 payload를 적는다.',
      'memory와 skill 한 개씩을 골라 activation condition과 instruction authority 차이를 설명한다.',
      '불완전한 mid-turn transcript를 가정하고 resume repair가 무엇을 제거·추가하는지 검토한다.',
    ],
    outcome: 'context를 문자열 묶음이 아니라 source → typed representation → projection → compacted projection의 계보로 그릴 수 있으면 된다.',
    record: '다음 모임에는 정보 손실이 가장 위험한 변환 하나와, 그 손실을 탐지할 수 있는 테스트를 가져온다.',
    refs: ['src/utils/processUserInput/processUserInput.ts', 'src/utils/messages.ts', 'src/services/compact/compact.ts'],
  },
}

const report3 = {
  volume: '03',
  slug: '03-tool-system-and-code-changing-tools',
  short: '도구 시스템과 코드 변경',
  metricGroup: 'tool-system',
  accent: '#b0662f',
  title: '도구 시스템과 코드를 바꾸는 메커니즘',
  subtitle: '모델이 제안한 구조화 호출이 어떻게 검증·권한·실행·관찰을 거쳐 실제 파일과 프로세스의 변화가 되는지 읽는다',
  promise: '이 권을 마치면 Tool을 “함수 호출”이 아니라 schema, 정책, 효과, 진행 사건, 결과 표현을 결합하는 실행 계약으로 설명할 수 있다.',
  orientation: 'Claude Code의 결정적 차이는 답변을 생성하는 데서 끝나지 않고 저장소를 실제로 바꾼다는 데 있다. Tool.ts가 표현 언어를 정의하고, toolExecution이 공통 실행 절차를 보장하며, 개별 도구가 파일·shell·검색의 구체적 의미를 구현한다. 이 권은 그 결합 지점과 분리 가능한 지점을 모두 본다.',
  chapters: [
    {
      title: 'Tool 계약은 한 기능의 전체 생애를 담는다',
      thesis: '입력 schema부터 화면 렌더링까지 한 객체에 모인 이유와 그 비용을 이해해야 새 도구를 안전하게 추가할 수 있다.',
      paths: ['src/Tool.ts', 'src/tools.ts', 'src/types/permissions.ts'],
      pages: [
        P('Tool 타입은 실행 가능한 capability descriptor다', 'name과 call만으로는 모델·정책·UI가 같은 도구를 이해할 수 없다.', '<code>Tool</code> 타입에는 input/output schema, prompt, validation, permission matching, concurrency safety, call, render 함수가 모여 있다. 하나의 정의가 모델에게 보이는 계약과 runtime이 실행하는 계약을 연결한다.', '이 집중은 registry drift를 줄인다. 별도 파일의 JSON schema와 별도 switch의 executor가 어긋나는 일을 막는다. 동시에 UI와 telemetry까지 끌어안으면서 interface가 넓어지고, 작은 도구도 많은 관심사를 알아야 하는 비용이 생긴다.', '새 필드를 추가할 때 모든 tool이 정말 소유해야 하는지 묻자. 공통 lifecycle hook인지, 특정 adapter의 projection인지 구분하지 않으면 Tool 타입은 점점 application container가 된다.', '도구 정의에서 반드시 같은 owner가 가져야 할 필드와 별도 adapter로 분리할 필드를 나눠 보라.', ['src/Tool.ts#L362-L560']),
        P('buildTool은 런타임 기본값과 정적 추론을 합친다', '작은 factory가 60개 이상의 구현에 공통 행동을 주면서 각 도구의 구체 타입을 보존한다.', '<code>buildTool</code>은 defaults를 펼치고 정의를 덮어쓴다. generic <code>BuiltTool&lt;D&gt;</code>는 input/output schema에서 구체 타입을 추론해 call과 renderer 사이를 잇는다.', '이 패턴은 class 상속보다 얕고 조합하기 쉽다. 그러나 마지막 type assertion은 runtime 검증이 아니라 컴파일러와의 계약이다. 복원 소스의 누락 때문에 전체 typecheck가 불완전하다면 assertion의 안전성을 독립적으로 확인해야 한다.', 'factory를 바꿀 때는 runtime default와 type-level default를 함께 시험하자. 기본 <code>checkPermissions</code>가 바뀌면 모든 도구의 보안 의미가 달라질 수 있다.', 'default가 새 필드를 자동 제공하는 편의와 도구가 명시적으로 선택하게 하는 안전성 중 어느 쪽이 적절한가?', ['src/Tool.ts#L721-L792'], { external: [E.jsonSchema], pseudo: 'define Tool<Input, Output>\n  = schema + policy hooks + call + result projection\n\nbuildTool(definition)\n  = shared defaults overridden by explicit behavior' }),
        P('schema validation과 semantic validation은 다르다', '문자열 필드가 존재한다는 사실과 그 파일을 지금 편집해도 된다는 사실은 별개다.', 'input schema는 형태와 기본 타입을 확인한다. <code>validateInput</code>은 old/new string 동일 여부, 파일 존재, read-before-write 상태, 특수 경로처럼 도구 의미를 검사한다. permission check는 다시 사용자가 그 효과를 허용했는지를 판단한다.', '세 검사를 하나로 합치면 오류 메시지는 간단해 보여도 authority가 흐려진다. 형식 오류를 사용자에게 허가받을 수는 없고, schema가 맞는다고 안전한 것도 아니다.', '개별 도구를 리뷰할 때 검사를 표로 나누자: representable, meaningful-now, authorized. 각 검사가 어느 상태를 읽으며 실패 시 어떤 result를 만드는지 보면 누락과 중복이 드러난다.', '존재하지 않는 파일에 대한 Write와 Edit은 같은 schema를 가져도 semantic validation이 왜 달라야 하는가?', ['src/Tool.ts#L480-L520', 'src/tools/FileEditTool/FileEditTool.ts#L137-L386']),
        P('registry는 모델이 사용할 수 있는 언어의 어휘다', '도구 파일이 존재해도 현재 permission context와 mode에서 pool에 들어가지 않으면 모델에게는 없는 기능이다.', '<code>getTools</code>와 pool 조립 코드는 preset, simple mode, deny rule, MCP 도구를 결합한다. 이것은 import 목록이 아니라 현재 세션이 사용할 수 있는 capability set을 계산하는 과정이다.', 'deny된 도구를 모델에게 보여 준 뒤 매번 거부하는 것과 처음부터 목록에서 빼는 것은 모델 행동과 token 사용이 다르다. 현재 코드는 blanket deny를 조기에 필터링해 불가능한 행동을 제안할 확률을 낮춘다.', '동적 registry를 개선할 때 discovery와 authority를 섞지 말자. MCP server가 도구를 광고했다는 사실은 그 도구의 실행 허가가 아니다.', 'tool list가 turn 중 바뀌면 모델에게 이전 목록으로 생성된 호출을 어떻게 처리해야 하는가?', ['src/tools.ts#L250-L388']),
      ],
    },
    {
      title: '공통 실행 파이프라인이 도구의 의미를 지킨다',
      thesis: '도구마다 call 구현은 달라도 unknown 처리, 취소, hook, 권한, 결과 pairing은 같은 순서와 관찰 규칙을 가져야 한다.',
      paths: ['src/services/tools/toolExecution.ts', 'src/services/tools/toolOrchestration.ts'],
      pages: [
        P('unknown tool도 protocol-valid result가 되어야 한다', '찾지 못했다는 runtime 오류를 다음 모델이 이해할 수 있는 관찰로 바꾼다.', '<code>runToolUse</code>는 먼저 현재 pool에서 이름을 찾고, 오래된 transcript를 위한 alias fallback을 확인한다. 그래도 없으면 error tool_result를 같은 id로 만들어 yield한다.', '여기에는 호환성과 protocol 보존이 함께 있다. alias는 과거 이름을 살리지만 모든 base tool로 무제한 fallback하지 않아 현재 deny를 우회하지 않게 범위를 제한한다.', '도구 rename을 설계할 때 source alias, model prompt, persisted transcript, analytics name을 함께 봐야 한다. 문자열 하나만 바꾸면 재개 세션이 깨질 수 있다.', 'deprecated alias를 언제 제거할 수 있으며 그 결정을 뒷받침할 session-version evidence는 무엇인가?', ['src/services/tools/toolExecution.ts#L337-L410']),
        P('실행 전 단계의 순서는 보안 의미를 갖는다', 'backfill, hook, validation, permission이 input을 읽고 바꿀 수 있으므로 어느 버전을 다음 단계가 보는지가 중요하다.', 'toolExecution은 observable input을 보강하고, hooks가 updatedInput을 낼 수 있으며, permission decision도 input을 수정할 수 있다. 마지막 call은 원본이 아니라 승인된 processedInput을 받아야 한다.', '이 pipeline에서 한 단계가 fresh object를 반환하고 다른 단계는 in-place mutation을 기대하면 audit와 transcript hash가 엇갈린다. 코멘트가 clone과 mutation ownership을 세밀하게 다루는 이유다.', '리팩터링 시 “validation을 앞당기자” 같은 변경은 성능 조정이 아니라 의미 변경이다. 어떤 변환 전후의 input을 검사하는지와 사용자가 무엇을 승인했는지 재검토해야 한다.', 'hook이 명령을 수정한 뒤 기존 permission allow rule을 그대로 적용해도 되는가?', ['src/services/tools/toolExecution.ts#L735-L940', 'src/Tool.ts#L460-L520']),
        P('진행 사건과 최종 결과는 다른 계약이다', '오래 걸리는 shell·agent 작업은 완료 전에도 관찰 가능해야 하지만 중간 상태를 성공으로 오해하면 안 된다.', 'tool call은 progress callback과 generator update를 통해 중간 출력을 전달한다. 최종 <code>ToolResult</code>에는 model-facing content와 UI/telemetry에 필요한 structured data가 함께 들어갈 수 있다.', 'progress는 latency 경험을 개선하지만 durable truth는 아니다. process가 죽으면 마지막 progress 이후 실제 상태를 알 수 없고, SDK 소비자가 일부 event를 놓칠 수 있다. 완료 event와 settlement를 별도로 정의해야 한다.', '새 진행 event를 추가할 때 빈도 제한, 순서, 취소 후 발행 여부를 정하자. 너무 세밀한 output은 terminal 렌더와 네트워크 소비자 모두에 backpressure를 만든다.', '같은 tool call에서 progress 순서와 final result 순서를 보장하려면 어떤 producer ownership이 필요한가?', ['src/Tool.ts#L307-L360', 'src/services/tools/toolExecution.ts#L1180-L1460']),
        P('동시성 안전성은 도구 이름이 아니라 구체 입력의 속성이다', 'Read라는 이름도 외부 상태를 건드릴 수 있고 Bash라는 이름도 순수 조회일 수 있다.', '<code>partitionToolCalls</code>는 schema parse 후 각 도구의 <code>isConcurrencySafe(input)</code>를 호출하고, 연속된 안전 호출만 batch로 묶는다. 판정이 실패하면 보수적으로 직렬 실행한다.', '이 설계는 read/write 도구의 고정 목록보다 정교하다. 같은 BashTool도 <code>git status</code>와 <code>rm</code>은 다르다. 그러나 판정 함수가 실제 effect와 불일치하면 race가 생기므로 correctness-critical policy다.', '병렬 batch의 context modifier를 도구 완료 뒤 결정적 순서로 적용하는 것도 중요하다. 실행 완료 순서가 session state 순서를 임의로 바꾸지 않게 한다.', '두 read-only tool이 같은 cache나 rate limit을 갱신한다면 여전히 concurrency-safe라고 할 수 있는가?', ['src/services/tools/toolOrchestration.ts#L19-L188']),
      ],
    },
    {
      title: '파일 도구는 관찰한 상태에 근거해 쓴다',
      thesis: 'Read와 Edit는 별도 편의 기능이 아니라 하나의 낙관적 동시성 계약을 이룬다.',
      paths: ['src/tools/FileReadTool/**', 'src/tools/FileEditTool/**', 'src/tools/FileWriteTool/**'],
      pages: [
        P('Read는 출력과 함께 편집 전제를 만든다', '파일 내용을 모델에 보여 주는 동시에 timestamp·범위·content를 readFileState에 남긴다.', 'FileReadTool은 text, image, notebook 등 형식을 구분하고 offset/limit 및 token 상한을 적용한다. 큰 파일을 무제한 prompt에 넣지 않으면서도 모델이 읽은 범위를 추적한다.', '이 cache는 성능 캐시만이 아니다. Edit가 “마지막으로 읽은 뒤 바뀌지 않았는가”를 판단하는 증거다. 부분 read와 전체 read를 구분하는 이유도 stale 판정의 확실성이 다르기 때문이다.', 'Read 결과 형식을 바꿀 때 UI와 모델 가독성뿐 아니라 Edit가 의존하는 관찰 상태가 그대로 갱신되는지 확인해야 한다.', '부분 범위만 읽은 파일을 편집하도록 허용할 때 어떤 변경은 안전하고 어떤 변경은 추가 read가 필요한가?', ['src/tools/FileReadTool/FileReadTool.ts#L337-L620', 'src/tools/FileReadTool/limits.ts']),
        P('Edit는 read-before-write를 낙관적 잠금으로 사용한다', '파일을 잠그지 않고도 사용자가 바꾼 내용을 덮어쓰지 않기 위해 마지막 관찰과 현재 상태를 비교한다.', 'call 단계는 현재 파일을 동기로 읽고 modification time을 readFileState와 비교한다. full read였다면 timestamp가 달라도 content가 같은 경우 false positive를 줄인다. 다르면 <code>FILE_UNEXPECTEDLY_MODIFIED_ERROR</code>로 중단한다.', '이는 optimistic concurrency control과 닮았다. 오래 잠금을 잡지 않고 commit 직전에 version을 확인한다. 다만 filesystem timestamp와 process-local cache에 의존하므로 완전한 transaction이 아니다.', '이 메커니즘을 제거하고 “항상 최신 파일에서 old_string 검색”만 하면 사용자의 동시 변경 일부를 우연히 보존할 수 있지만 모델이 읽지 않은 문맥에 쓰게 된다. 안전성의 기준은 patch 적용 가능성이 아니라 관찰 근거다.', 'read state의 version token을 content hash로 바꾸면 정확성·비용·대용량 파일에서 어떤 tradeoff가 생기는가?', ['src/tools/FileEditTool/FileEditTool.ts#L387-L475', 'src/tools/FileEditTool/constants.ts'], { external: [E.cwe367] }),
        P('critical window 안의 await 하나가 TOCTOU를 다시 연다', 'stale check와 write 사이에 scheduler가 개입하면 다른 편집이 끼어들 수 있다.', 'FileEditTool은 directory 생성과 history backup 같은 await를 미리 끝낸 뒤, 동기 read·검사·patch·write를 연속 수행한다. 주석이 이 구간에 async operation을 넣지 말라고 명시한다.', 'Node의 한 thread가 모든 race를 없애지는 않는다. await가 event loop에 제어를 돌려주면 다른 task나 외부 process가 파일을 바꿀 수 있다. await를 없애도 외부 process race는 남지만 내부 interleaving 창은 줄어든다.', '리팩터링으로 편리한 async helper를 넣기 전에 이 구간의 시간적 불변조건을 테스트로 고정하자. 구조적으로는 versioned write나 atomic rename 같은 더 강한 primitive가 가능한지도 검토할 수 있다.', '검사 직후 외부 process가 파일을 바꾸는 race까지 막으려면 OS 수준에서 어떤 원자적 조건부 write가 필요한가?', ['src/tools/FileEditTool/FileEditTool.ts#L410-L480']),
        P('쓰기 뒤에는 다른 관찰계를 갱신해야 한다', 'disk write 성공만으로 LSP, file history, diagnostics, transcript가 새 상태를 아는 것은 아니다.', 'Edit는 파일을 쓴 뒤 LSP change/save 알림, diagnostics 정리, history update를 이어 수행한다. 일부는 fire-and-forget이므로 write의 성공과 후속 projection의 성공이 분리된다.', '이 구조는 파일이 canonical effect이고 LSP는 파생 projection임을 보여 준다. 그렇다고 projection 실패가 무시 가능한 것은 아니다. 사용자에게 오래된 diagnostics를 보여 주면 다음 판단이 틀릴 수 있다.', '후속 작업을 transaction처럼 모두 묶기보다 각 실패의 recovery를 정의해야 한다. LSP 알림은 재동기화할 수 있고, history backup은 write 전에 확보해야 하며, transcript는 실제 write 결과를 반영해야 한다.', '파일은 바뀌었지만 LSP 알림이 실패한 경우 tool result를 성공으로 표시하면서 어떤 warning을 남겨야 하는가?', ['src/tools/FileEditTool/FileEditTool.ts#L475-L580', 'src/tools/FileWriteTool/FileWriteTool.ts']),
      ],
    },
    {
      title: 'Shell과 검색 도구는 운영체제를 해석한다',
      thesis: 'BashTool은 문자열을 process에 넘기는 래퍼가 아니라 명령 의미, 경로, 권한, sandbox, streaming output을 중재하는 하위 시스템이다.',
      paths: ['src/tools/BashTool/**', 'src/tools/GrepTool/**', 'src/tools/GlobTool/**', 'src/tools/LSTool/**'],
      pages: [
        P('BashTool의 크기는 shell 문법의 외부성을 반영한다', '하나의 command 문자열에는 파이프, redirect, substitution, environment, compound operator가 들어갈 수 있다.', 'BashTool은 input validation, permission rule 추출, sandbox 선택, process 실행, output streaming과 background 전환을 다룬다. call 한 줄로 보이는 효과 뒤에 parser와 policy가 필요한 이유다.', 'shell은 이미 하나의 프로그래밍 언어이므로 문자열 prefix 비교만으로 effect를 분류할 수 없다. <code>echo</code>도 redirect와 command substitution을 통해 write나 실행을 만들 수 있다.', '도구를 단순화하려면 기능을 없애는 것이 아니라 shell이라는 넓은 language surface를 더 작은 capability로 나누는 선택도 있다. 예를 들어 git query, package test, generic shell은 서로 다른 policy를 가질 수 있다.', '사용자 편의와 분석 가능성 사이에서 generic BashTool을 유지할 최소 이유는 무엇인가?', ['src/tools/BashTool/BashTool.tsx#L420-L700', 'src/tools/BashTool/commandSemantics.ts']),
        P('권한 패턴은 command의 의미를 근사한다', '완전한 shell 해석 없이도 위험한 부분을 보수적으로 찾아야 한다.', 'bashPermissions와 bashSecurity는 compound command를 나누고 prefix rule을 만들며 dangerous construct와 path를 검사한다. 분석 실패나 subcommand 수 초과를 안전하다고 간주하지 않고 보수적 경로로 보낸다.', '이는 정적 분석의 soundness/precision tradeoff다. 너무 느슨하면 우회가 생기고, 너무 엄격하면 harmless command도 매번 사용자에게 묻는다. 편의 때문에 fallback을 allow로 두는 순간 보안 경계가 사라진다.', '새 shell 문법 지원을 추가할 때 parser test뿐 아니라 permission rule canonicalization과 adversarial example을 함께 추가해야 한다.', '<code>git -C dir status</code>와 <code>cd dir && git status</code>를 같은 permission 의미로 정규화할 수 있는가?', ['src/tools/BashTool/bashPermissions.ts', 'src/tools/BashTool/bashSecurity.ts'], { external: [E.owaspCommand] }),
        P('검색 도구는 범용 shell을 좁은 read capability로 바꾼다', 'Glob과 Grep은 입력 공간과 결과 형식을 제한해 모델과 권한 시스템이 더 정확히 추론하게 한다.', '전용 검색 도구는 pattern, path, limit를 schema로 받고 structured result를 반환한다. 같은 일을 shell의 <code>find | xargs grep</code>로 할 수 있어도 permission과 portability, output truncation은 훨씬 다르다.', '좁은 도구가 많아지는 비용은 registry와 prompt의 크기다. 따라서 capability를 쪼갤 때는 보안·정확성·관찰성 이득이 model selection 복잡성을 이기는지 보아야 한다.', '전용 도구의 구현은 내부에서 ripgrep 같은 외부 binary를 쓸 수 있지만, adapter가 exit code와 platform 차이를 내부 result로 정규화해야 한다.', '어떤 작업을 새 전용 도구로 승격할지 판단하는 rubric을 effect 범위, 빈도, portability로 만들어 보라.', ['src/tools/GrepTool/GrepTool.ts', 'src/tools/GlobTool/GlobTool.ts']),
        P('도구 생태계의 구조 개선은 contract test에서 시작한다', '개별 도구 테스트만으로 공통 pipeline과 registry의 조합 오류를 잡기 어렵다.', '도구마다 schema-valid/invalid input, permission allow/ask/deny, abort, success, exception을 같은 contract suite로 돌릴 수 있다. 추가로 read-only 판정과 result pairing을 공통 invariant로 검사한다.', '이런 테스트는 구현을 동일하게 만들지 않는다. 각 도구의 semantic validation과 effect는 다르지만, runtime이 요구하는 최소 프로토콜을 만족하는지 확인한다.', '구조를 domain/tool adapter로 나누고 싶다면 먼저 contract suite를 만들어 이동 전후 trace를 비교하자. 그렇지 않으면 넓은 interface를 분해하는 동안 숨은 default가 사라진다.', '새 Tool implementation이 registry에 들어가기 전에 자동으로 검증할 수 있는 다섯 가지 공통 속성은 무엇인가?', ['src/Tool.ts', 'src/tools.ts', 'src/services/tools/toolExecution.ts']),
      ],
    },
  ],
  workshop: {
    title: 'Edit 한 번을 effect contract로 해부하기',
    deck: '모델의 JSON에서 disk write 이후 projection까지, 각 단계가 받는 input 버전과 실패 결과를 추적한다.',
    steps: [
      '<code>FileEditTool</code>의 schema, semantic validation, permission, call을 서로 다른 색으로 표시한다.',
      '<code>toolExecution</code>에서 hook과 permission이 input을 수정하는 지점을 찾고 최종 call input을 기록한다.',
      'readFileState가 없는 경우, timestamp가 바뀐 경우, content만 같은 경우 세 반례를 비교한다.',
      'write 성공 뒤 LSP·history·transcript 중 하나가 실패하는 상황을 가정해 settlement 표를 만든다.',
      '같은 분석을 BashTool 하나에 적용하고 파일 도구와 달라지는 authority·cancellation을 설명한다.',
    ],
    outcome: 'Tool을 호출 가능한 함수가 아니라 representable → meaningful-now → authorized → effected → observed의 계약으로 설명할 수 있으면 된다.',
    record: '다음 모임에는 공통 Tool contract test 하나와 도구별 semantic test 하나를 의사코드로 준비한다.',
    refs: ['src/Tool.ts', 'src/services/tools/toolExecution.ts', 'src/tools/FileEditTool/FileEditTool.ts'],
  },
}

const report4 = {
  volume: '04',
  slug: '04-permissions-security-and-effect-control',
  short: '권한·보안·효과 통제',
  metricGroup: 'permission-and-safety',
  accent: '#a33e42',
  title: '권한, 보안과 효과 통제',
  subtitle: '모델의 제안과 실제 운영체제 효과 사이에 어떤 판단이 놓이며, 경로·shell·hook·원격 정책이 그 판단을 어떻게 바꾸는지 읽는다',
  promise: '이 권을 마치면 permission dialog를 안전성 전체로 오해하지 않고, authority·validation·isolation·audit가 서로 보완하는 구조를 설명할 수 있다.',
  orientation: '코딩 에이전트의 위험은 모델이 틀릴 수 있다는 사실보다 틀린 제안이 넓은 효과로 번역될 수 있다는 데 있다. 이 저장소는 rule, mode, hook, filesystem 검사, shell 분석, sandbox, managed settings를 겹쳐 놓는다. 우리는 레이어 수를 칭찬하는 대신 각 레이어가 막는 실패와 막지 못하는 실패를 구분한다.',
  chapters: [
    {
      title: '권한은 context와 rule precedence로 계산된다',
      thesis: 'allow/ask/deny 결과는 버튼 하나가 아니라 여러 출처의 규칙, 현재 mode, 도구별 matcher를 합성한 결정이다.',
      paths: ['src/utils/permissions/**', 'src/types/permissions.ts', 'src/Tool.ts'],
      pages: [
        P('ToolPermissionContext는 현재 authority의 snapshot이다', 'mode, rules by source, working directories, UI 가능성이 한 판단 환경을 만든다.', 'Tool.ts의 permission context에는 현재 mode와 규칙뿐 아니라 background agent처럼 prompt를 띄울 수 없는 조건도 들어 있다. 같은 tool input이 interactive main session에서는 ask, background에서는 auto-deny가 될 수 있다.', '이 context를 전역에서 즉석 조회하면 한 실행 중 규칙이 바뀌어 판단 근거가 흔들린다. 반대로 오래된 snapshot을 끝까지 쓰면 사용자 변경을 반영하지 못한다. 어느 단위에서 snapshot을 고정하는지가 중요하다.', '권한 결과와 함께 적용된 rule source와 mode를 남겨야 audit가 가능하다. 단순 boolean은 왜 허용됐는지, 재현 가능한지 설명하지 못한다.', '한 tool call 중 permission setting이 바뀌면 현재 호출과 다음 호출 중 어디부터 새 정책을 적용해야 하는가?', ['src/Tool.ts#L123-L157', 'src/types/permissions.ts']),
        P('deny, ask, allow는 위험 점수의 세 구간이 아니다', '각 결과는 다른 authority 의미와 후속 protocol을 가진다.', 'deny는 정책상 불가능, ask는 현재 context만으로 권한 부족, allow는 조건 충족을 뜻한다. ask를 높은 위험의 deny로 보거나 allow를 안전 보증으로 읽으면 다른 검증 층이 사라진다.', 'permission decision에는 updatedInput, reason, userModified 같은 정보도 따라갈 수 있다. 사용자가 경로를 바꿔 승인했다면 원래 모델 제안이 아니라 수정된 제안이 실행되고 기록되어야 한다.', 'UI는 세 결과를 색으로 표현할 수 있지만 SDK와 background agent는 같은 의미를 다른 방식으로 처리한다. domain decision과 presentation을 분리해야 한다.', '사용자가 input을 수정해 허용한 경우 모델에게는 원안과 수정안 중 무엇을 tool result로 알려야 하는가?', ['src/utils/permissions/PermissionResult.ts', 'src/services/tools/toolExecution.ts#L916-L1140']),
        P('규칙 출처의 precedence가 조직 정책을 실제로 만든다', 'local allow가 managed deny를 덮을 수 있는지 여부는 파일 저장 위치보다 중요한 보안 결정이다.', 'permissions 코드는 여러 source의 rule을 모아 매칭한다. 조직 관리 설정, 프로젝트 설정, 사용자 설정, 세션 선택이 충돌할 수 있으므로 순서와 non-overridable 범위를 명시해야 한다.', '규칙이 문자열 배열로만 보이면 충돌 이유가 숨는다. source와 scope를 유지해야 “이 deny는 조직에서 왔으므로 local override 불가” 같은 결정을 설명할 수 있다.', '새 설정 source를 추가할 때 기존 배열에 끼워 넣지 말고 authority relationship을 먼저 정의하자. precedence test는 보안 회귀를 잡는 핵심이다.', '프로젝트 저장소 안의 설정이 사용자 홈 설정보다 높은 우선순위를 가지면 어떤 공격 경로가 생길 수 있는가?', ['src/utils/permissions/permissions.ts#L1-L260', 'src/utils/settings']),
        P('permission mode는 정책 집합을 선택하는 상태다', 'default, plan, auto, bypass 같은 mode는 같은 rule evaluator의 옵션 이상이다.', 'mode는 어떤 효과를 기본 허용하고 언제 classifier나 사용자 prompt를 기다리는지 바꾼다. plan mode에서 write를 막는 규칙과 bypass mode의 killswitch는 서로 다른 목적을 가진다.', 'mode 전환은 UI preference가 아니라 authority transition이다. 이전 mode를 저장하고 복원하는 필드가 있는 이유도 nested plan entry처럼 상태가 겹칠 수 있기 때문이다.', '전환을 command handler에만 구현하지 말고 현재 mode, 이전 mode, 전환 원인, 허용된 successor를 명시적으로 모델링하면 잘못된 복원을 줄일 수 있다.', '모델이 plan mode 진입을 제안할 때와 사용자가 직접 mode를 바꿀 때 authority 차이는 어떻게 기록해야 하는가?', ['src/Tool.ts#L123-L145', 'src/utils/permissions/permissions.ts', 'src/utils/permissions/autoModeState.ts']),
      ],
    },
    {
      title: '파일 경로는 문자열이 아니라 보안 객체다',
      thesis: '정규화, symlink, UNC, workspace boundary를 고려하지 않으면 눈에 보이는 경로와 실제 effect 대상이 달라진다.',
      paths: ['src/utils/permissions/filesystem.ts', 'src/tools/FileEditTool/**', 'src/utils/file.ts'],
      pages: [
        P('normalize가 matcher보다 먼저 와야 한다', '상대 경로, ~, separator 차이를 그대로 비교하면 같은 대상이 여러 문자열로 나타난다.', 'FileEditTool은 hook과 allowlist가 우회되지 않도록 observable input의 file_path를 확장한다. Windows와 POSIX separator 차이도 read cache lookup과 permission match를 어긋나게 할 수 있다.', '정규화는 편의 변환이 아니라 identity 결정이다. 하지만 symlink를 resolve할지, 사용자가 입력한 경로를 보존할지는 목적에 따라 다르다. 표시용 경로와 authority 판단용 canonical path를 분리할 필요가 있다.', '경로 helper를 공통화할 때 모든 consumer가 같은 normalization을 원하는지 확인하자. git path, UI label, filesystem target은 서로 다른 representation을 가질 수 있다.', '<code>project/link -&gt; /outside</code> symlink를 workspace 내부 경로로 허용하면 실제 effect boundary는 어디가 되는가?', ['src/tools/FileEditTool/FileEditTool.ts#L100-L140', 'src/utils/permissions/filesystem.ts']),
        P('UNC 차단은 검사를 위한 접근도 효과가 될 수 있음을 보여 준다', '존재 여부 확인만 해도 네트워크 인증이 발생할 수 있다.', 'Windows UNC path에 대해 <code>existsSync</code>를 호출하면 SMB 인증이 유발되어 credential leak 가능성이 생긴다. 그래서 Edit validation은 일부 filesystem operation을 permission 판단 전 생략한다.', '이 사례는 “validation은 side-effect free”라는 가정을 깨뜨린다. 외부 resource의 metadata 조회, DNS, symlink resolution도 관찰 가능한 효과가 될 수 있다.', '새 validator를 작성할 때 입력만 검사하는지, filesystem/network를 건드리는지 표시하자. side effect가 있다면 authority 전 단계에서 실행해도 되는지 별도로 검토해야 한다.', '파일 preview를 권한 질문에 보여 주기 위해 먼저 읽는 행위는 어떤 경로에서 이미 민감 정보 접근이 되는가?', ['src/tools/FileEditTool/FileEditTool.ts#L160-L190', 'src/utils/permissions/filesystem.ts']),
        P('working directory boundary는 lexical prefix가 아니다', '비슷한 문자열, parent traversal, symlink 때문에 단순 startsWith는 틀릴 수 있다.', 'filesystem permission 코드는 추가 working directory와 path rule을 다룬다. 경로가 허용 root 아래인지 판단하려면 normalize된 component boundary를 비교하고 platform case sensitivity도 고려해야 한다.', '여러 root를 허용하면 authority surface가 넓어질 뿐 아니라 root 사이의 symlink와 mount 관계도 생긴다. 사용자에게 “이 디렉터리를 추가할까요?”라고 묻는 UI는 실제 범위를 정확히 보여 줘야 한다.', '작업공간 boundary를 refactor할 때 path library 교체만 하지 말고 adversarial corpus를 유지하자: <code>../</code>, prefix collision, junction, case variation, deleted/recreated path.', '허용된 root가 실행 중 symlink로 교체되면 기존 permission decision은 언제 무효화되어야 하는가?', ['src/utils/permissions/filesystem.ts#L1-L260', 'src/QueryEngine.ts#L90-L120']),
        P('TOCTOU는 permission과 effect 사이에도 존재한다', '허가할 때 본 대상이 실행할 때 같은 대상이라는 보장이 필요하다.', '사용자가 특정 파일 경로를 승인한 뒤 call 전에 symlink target이 바뀔 수 있다. permission matcher가 문자열만 승인하고 executor가 나중에 resolve하면 다른 resource에 효과가 갈 수 있다.', '모든 race를 user-space check로 막을 수는 없다. 가능한 경우 file descriptor 기반 작업, no-follow option, atomic primitive를 사용하고 나머지는 sandbox boundary로 제한해야 한다.', '중요한 것은 check를 더 많이 쌓는 것이 아니라 check와 use가 같은 identity를 공유하게 하는 것이다. 검증 결과에 canonical target/version token을 담는 설계가 한 방법이다.', '현재 FileEdit 경로에서 permission decision과 write 사이에 target identity가 바뀔 수 있는 지점을 표시해 보라.', ['src/tools/FileEditTool/FileEditTool.ts#L125-L180', 'src/tools/FileEditTool/FileEditTool.ts#L387-L480'], { external: [E.cwe367] }),
      ],
    },
    {
      title: 'Shell 안전성은 해석과 격리를 겹친다',
      thesis: '명령 문자열 분석은 사용자의 의도를 설명하고, sandbox는 분석이 틀렸을 때 효과 반경을 줄인다. 어느 하나도 다른 하나를 대체하지 않는다.',
      paths: ['src/tools/BashTool/bashSecurity.ts', 'src/tools/BashTool/bashPermissions.ts', 'src/utils/sandbox/**'],
      pages: [
        P('shell parser가 필요한 이유는 quote 하나 때문이다', '공백 split은 인자 경계, substitution, redirect를 이해하지 못한다.', 'bashSecurity는 command를 구조적으로 보려 하고, 실패 시 보수적 판단을 선택한다. quote와 escape를 잘못 해석하면 harmless text 안의 token을 명령으로 보거나 실제 nested command를 놓칠 수 있다.', '완전한 Bash semantics를 재구현하는 것도 위험하다. parser와 실제 shell 버전이 다르면 분석 결과와 실행이 어긋난다. 지원 범위를 명시하고 unknown construct를 안전하게 처리해야 한다.', '보안 코드를 리팩터링할 때 clean-code 관점의 함수 분리보다 parser corpus와 differential test가 우선이다. 문자열 정리가 의미를 바꿀 수 있다.', 'command substitution이 중첩된 입력에서 분석기가 모르는 문법을 만나면 ask, deny, sandbox-only 중 무엇이 적절한가?', ['src/tools/BashTool/bashSecurity.ts', 'src/tools/BashTool/bashPermissions.ts']),
        P('환경 변수는 실행 파일 선택과 라이브러리 로딩을 바꾼다', 'PATH, LD_*, DYLD_*는 같은 command text의 실제 실행 대상을 교체한다.', 'bashPermissions는 binary hijack 관련 변수 패턴을 별도로 다룬다. <code>git status</code>가 허용되어도 PATH가 공격자 디렉터리를 먼저 가리키면 다른 프로그램이 실행될 수 있다.', '따라서 permission rule을 command prefix에만 묶을 수 없다. executable resolution context와 environment mutation도 effect identity의 일부다.', '성능을 위해 parsed command를 cache한다면 환경을 key에 포함해야 한다. 그렇지 않으면 이전 안전 판정을 다른 execution context에 재사용한다.', '명령 승인 UI에 executable의 resolved path를 보여 주는 것이 언제 유용하고 언제 정보 과잉인가?', ['src/tools/BashTool/bashPermissions.ts#L690-L740', 'src/tools/BashTool/pathValidation.ts']),
        P('sandbox는 authority가 아니라 containment다', '허용된 명령도 제한된 filesystem과 network 안에서 실행해 피해 반경을 줄일 수 있다.', 'sandbox adapter는 platform/runtime 차이를 감추고 BashTool이 격리 실행을 선택하도록 돕는다. 하지만 sandbox 내부라는 이유로 모든 command를 자동 허용하면 민감 데이터 읽기나 resource exhaustion 같은 위험이 남는다.', '권한은 “이 효과를 해도 되는가”, sandbox는 “효과가 어디까지 퍼질 수 있는가”를 답한다. 두 질문을 분리하면 sandbox unavailable일 때 fail-open인지 fail-closed인지도 명확해진다.', '사용자에게 sandbox 상태를 보여 주는 UI는 실제 adapter capability와 일치해야 한다. 설정이 켜졌다는 표시와 enforcement가 성공했다는 evidence는 다르다.', 'sandbox 초기화가 실패했을 때 read-only command와 destructive command를 같은 방식으로 처리해야 하는가?', ['src/utils/sandbox/sandbox-adapter.ts', 'src/tools/BashTool/shouldUseSandbox.ts', 'src/components/sandbox/SandboxSettings.tsx']),
        P('destructive warning은 parser 결과의 사용자 projection이다', '위험을 발견하는 것과 사람이 이해할 설명으로 바꾸는 것은 다른 단계다.', 'BashTool 주변에는 destructive command warning과 permission UI가 있다. analyzer가 찾은 위험 요소를 그대로 노출하면 난해하고, 너무 단순화하면 사용자가 실제 범위를 오해한다.', '좋은 warning은 대상, 효과 종류, 되돌릴 수 있는지, 왜 기존 rule로 자동 허용되지 않았는지를 보여 준다. “위험할 수 있음”이라는 일반 문구는 decision support가 아니다.', 'UI 표현을 바꿀 때 analyzer의 severity를 새로 정의하지 말자. presentation은 policy result를 설명하되 authority를 추가하거나 약화하지 않아야 한다.', '복수 subcommand 중 하나만 destructive할 때 전체 명령을 어떻게 요약해야 사용자가 승인 범위를 이해할 수 있는가?', ['src/tools/BashTool/destructiveCommandWarning.ts', 'src/tools/BashTool/UI.tsx']),
      ],
    },
    {
      title: 'Hooks와 원격 정책은 제어 평면을 확장한다',
      thesis: '로컬 permission 외에도 hook, managed settings, feature killswitch가 실행을 바꾼다. 이 경로들의 authority와 failure mode를 따로 보아야 한다.',
      paths: ['src/hooks/**', 'src/services/remoteManagedSettings/**', 'src/services/policyLimits/**'],
      pages: [
        P('hook은 확장점이지 자동으로 신뢰된 판정자가 아니다', 'PreToolUse와 PermissionRequest hook은 input과 decision에 영향을 줄 수 있으므로 출처와 실패 정책이 중요하다.', 'toolExecution은 hook 결과가 updatedInput과 permission decision을 제공하는 경우를 처리한다. 외부 command hook이 allow를 반환했다고 해서 그 command 자체가 신뢰된 authority인지, advisory인지 설정에 따라 달라질 수 있다.', 'hook timeout, crash, malformed output에서 fail-open하면 우회가 되고 fail-closed하면 availability가 떨어진다. 모든 hook에 같은 실패 정책을 쓰기보다 effect class와 deployment trust를 고려해야 한다.', 'hook이 무엇을 보았는지도 privacy surface다. 전체 tool input을 전달하면 secret이 외부 script나 service로 나갈 수 있다.', '사용자 로컬 hook과 조직 관리 hook이 상충할 때 어느 결과가 우선이며 그 이유를 UI에 어떻게 설명할 것인가?', ['src/hooks', 'src/services/tools/toolExecution.ts#L735-L940']),
        P('remote managed settings는 동적 정책 배포 시스템이다', '주기적 fetch, cache, security check가 로컬 동작을 원격 상태와 결합한다.', '저장소 문서는 1시간 polling과 stale cache fallback을 강조한다. 코드를 읽을 때는 endpoint보다 fetch 자격, signature/trust, cache freshness, 위험 변경 확인, 거부 시 종료 경로를 함께 본다.', '원격 설정은 enterprise policy를 빠르게 적용하지만 control-plane outage와 stale policy 문제를 만든다. cache를 쓰면 availability는 높아지지만 revoked rule이 남을 수 있다.', '이 기능을 평가할 때 “원격 제어”라는 가치 판단만으로 끝내지 말자. 어떤 설정이 non-overridable인지, 어떤 change가 사용자 확인을 요구하는지, read-back이 있는지를 구체적으로 보아야 한다.', '서버가 장기간 불가능할 때 stale managed allow와 stale managed deny 중 어느 쪽을 어떻게 처리해야 하는가?', ['src/services/remoteManagedSettings/index.ts#L1-L160', 'src/services/remoteManagedSettings/securityCheck.tsx']),
        P('feature killswitch는 출시 가변성과 긴급 통제를 함께 담는다', '같은 boolean gate라도 실험, cohort, 안전 중단은 서로 다른 운영 의미다.', '권한 bypass, auto mode, voice 같은 기능은 환경과 원격 flag 조합으로 활성화된다. flag 이름만 보아 목적을 추정하기 어려운 경우도 있어 call site와 fallback을 따라가야 한다.', 'killswitch는 사고 대응에 유용하지만 code path가 평소 실행되지 않으면 부패할 수 있다. off 전환이 현재 세션에 즉시 적용되는지 다음 시작부터 적용되는지도 기능마다 다르다.', 'gate를 문서화할 때 이름 목록보다 owner, default, evaluation time, stale behavior, rollback을 기록하자. 그래야 숨은 configuration이 architecture로 드러난다.', '실행 중 auto mode killswitch가 켜졌을 때 진행 중 효과와 다음 tool call을 각각 어떻게 처리해야 하는가?', ['src/utils/permissions/bypassPermissionsKillswitch.ts', 'src/utils/permissions/autoModeState.ts', 'src/services/analytics/sinkKillswitch.ts']),
        P('안전성 보고서는 주장보다 반례를 남겨야 한다', '코드가 방어를 포함한다는 사실과 실제 위협을 충분히 막는다는 결론은 다르다.', '대상 저장소의 자체 문서는 telemetry와 remote control에서 강한 결론을 제시한다. 스터디에서는 해당 symbol, call site, 조건을 확인하되 production cohort와 서버 동작처럼 코드 밖 사실은 unknown으로 남긴다.', '보안 분석은 “취약/안전” 이분법보다 threat scenario가 유용하다. 공격자, 자산, entry, precondition, expected control, residual risk를 적으면 코드의 실제 역할과 한계가 보인다.', '수정 제안도 control을 늘리는 데서 끝나지 않아야 한다. 사용자 부담, false positive, recovery, audit를 함께 평가해야 운영 가능한 안전성이 된다.', 'FileEdit symlink race와 remote setting stale cache 중 하나를 골라 완전한 threat scenario를 작성해 보라.', ['docs/ko/01-텔레메트리와-프라이버시.md', 'docs/ko/04-원격-제어와-킬스위치.md']),
      ],
    },
  ],
  workshop: {
    title: '하나의 위험한 명령에 대한 control stack 검토',
    deck: '각 방어가 무엇을 아는지, 어디에서 실패하는지, 다음 방어가 무엇을 보완하는지 연결한다.',
    steps: [
      '환경 변수 변경과 redirect를 포함한 compound shell command를 하나 만든다.',
      'schema, bash parser, permission rule, user ask, sandbox, process 실행 단계별 입력을 기록한다.',
      'parser unknown, hook timeout, sandbox unavailable, managed setting stale 네 실패를 각각 삽입한다.',
      '각 실패에서 fail-open/fail-closed 결과와 사용자에게 보여야 할 설명을 비교한다.',
      '남는 residual risk 하나를 threat scenario 형식으로 작성한다.',
    ],
    outcome: '“permission이 있으니 안전하다”가 아니라 여러 control이 서로 다른 실패를 줄이며 남는 위험도 존재한다고 설명할 수 있으면 된다.',
    record: '다음 모임에는 control 하나를 제거했을 때 어떤 공격 경로가 새로 열리는지 counterfactual을 준비한다.',
    refs: ['src/utils/permissions/permissions.ts', 'src/tools/BashTool/bashSecurity.ts', 'src/utils/sandbox/sandbox-adapter.ts'],
  },
}

const report5 = {
  volume: '05',
  slug: '05-repl-sdk-extensions-and-agent-features',
  short: 'REPL·SDK·확장·에이전트',
  metricGroup: 'surfaces-and-extensions',
  accent: '#287057',
  title: 'REPL, SDK, 확장과 에이전트 기능',
  subtitle: '하나의 실행 엔진이 터미널 UI·headless SDK·MCP·plugin·skill·subagent라는 서로 다른 표면으로 투영되는 방식을 읽는다',
  promise: '이 권을 마치면 UI와 generator를 프로젝트 전체로 과대평가하지 않으면서도, core runtime을 사람이 쓰고 외부 시스템이 확장하게 만드는 결정적 adapter로 설명할 수 있다.',
  orientation: '사용자는 REPL을 통해 시스템을 경험하지만 같은 core는 SDK와 remote session에서도 소비된다. MCP와 plugin은 외부 capability를 들이고, skill은 instruction을 들이며, AgentTool과 task runtime은 실행을 다시 중첩한다. 이 권은 이들을 하나의 “부가기능” 목록으로 묶지 않고 core와 만나는 계약을 따라간다.',
  chapters: [
    {
      title: 'REPL은 canonical state의 대화형 projection이다',
      thesis: 'Ink component tree는 terminal을 그리지만, 실행의 진실을 소유하기보다 engine state와 event를 사용자가 조작 가능한 화면으로 바꾼다.',
      paths: ['src/screens/REPL.tsx', 'src/components/PromptInput/**', 'src/ink/**', 'src/context/**'],
      pages: [
        P('REPL.tsx의 크기는 화면 수가 아니라 조정 책임의 수다', '메시지 rendering, 입력, modal, permission, background task, compact가 한 terminal session에서 만난다.', '<code>REPL.tsx</code>는 단순 layout component가 아니다. engine event를 state에 반영하고, 여러 context provider와 overlay를 결합하며, 키 입력이 실행 제어로 이어지게 한다.', 'React/Ink를 쓴다고 상태가 자동으로 정리되는 것은 아니다. durable session, engine in-flight state, ephemeral UI state가 한 component에 섞이면 rerender와 resume가 서로 영향을 준다.', '분해할 때 화면 영역별로 자르기 전에 state owner를 나누자. transcript projection, current turn controller, overlay navigation은 변경 이유와 수명이 다르다.', 'REPL state 중 process crash 뒤 복구되어야 할 것과 즉시 버려도 되는 것을 각각 다섯 개 골라 보라.', ['src/screens/REPL.tsx#L1-L260', 'src/context']),
        P('React render는 effect execution과 분리되어야 한다', 'component 함수는 화면 계산이고, tool 실행이나 session append는 명시적 event/effect 경계에서 일어나야 한다.', 'React의 render/commit 구분은 terminal에서도 유효하다. 같은 props와 state로 component가 다시 호출될 수 있으므로 render 중 외부 효과를 수행하면 중복 실행 위험이 생긴다.', 'Ink는 DOM 대신 terminal output을 commit하지만 declarative component model은 같다. 화면을 다시 계산하는 과정과 process에 signal을 보내는 과정은 별도 callback/effect로 유지해야 한다.', 'UI 버그를 조사할 때 rerender 횟수만 세지 말고 어떤 event가 state를 바꾸고 어떤 effect가 그 event를 발생시켰는지 역추적하자. 그래야 core와 UI 사이 feedback loop를 찾을 수 있다.', 'Strict한 반복 render를 가정했을 때 중복 실행되면 안 되는 callback이 component body 안에 숨어 있지 않은가?', ['src/screens/REPL.tsx', 'src/ink.ts'], { external: [E.react, E.ink] }),
        P('PromptInput은 텍스트 박스이면서 mode-aware controller다', 'history, multiline, paste, voice, queued command, suggestion이 입력의 의미를 바꾼다.', 'PromptInput 디렉터리는 main component뿐 아니라 input mode, paste 처리, footer suggestion, history search를 분리한다. 이는 입력 UX가 이미 작은 subsystem임을 보여 준다.', '사용자가 보는 문자열과 submit되는 content block이 다를 수 있으므로, caret와 display state를 canonical prompt로 오해하면 안 된다. 특히 image paste나 command completion은 typed input을 만든다.', '새 입력 기능은 keystroke handler에 바로 넣기보다 input state machine의 transition으로 보자. normal/history-search/permission/modal 사이 keybinding 충돌을 체계적으로 검토할 수 있다.', 'escape와 enter가 mode마다 다른 의미를 가질 때 keybinding resolution의 우선순위를 어디에서 소유해야 하는가?', ['src/components/PromptInput/PromptInput.tsx', 'src/components/PromptInput/inputModes.ts', 'src/components/PromptInput/inputPaste.ts']),
        P('Context provider는 dependency injection이면서 rerender boundary다', 'modal, mailbox, notifications, queued message가 전역 singleton 대신 tree 범위 상태를 제공한다.', 'React context는 깊은 component에 state와 command를 전달한다. 이 덕분에 prop drilling은 줄지만 provider value가 넓으면 작은 변경이 큰 tree를 다시 render하고 ownership이 흐려질 수 있다.', 'context 이름만 보고 domain boundary라고 단정하면 안 된다. 일부는 순수 UI 상태이고 일부는 engine event를 반영한다. provider가 canonical state를 복제하는지, projection만 저장하는지 확인해야 한다.', '개선할 때 context 수를 줄이는 것이 목표가 아니다. read model과 command port를 분리하고, consumer가 필요한 최소 slice만 구독하게 만드는 것이 더 직접적이다.', 'QueuedMessageContext의 state는 engine queue와 같은 진실인가, UI가 보여 주기 위한 projection인가?', ['src/context/QueuedMessageContext.tsx', 'src/context/modalContext.tsx', 'src/context/notifications.tsx']),
      ],
    },
    {
      title: 'SDK와 remote는 같은 엔진의 다른 소비자다',
      thesis: '화면을 제거한 것이 SDK가 아니다. schema, control message, backpressure, permission callback으로 core protocol을 외부에 안정적으로 노출해야 한다.',
      paths: ['src/QueryEngine.ts', 'src/entrypoints/sdk/**', 'src/bridge/**', 'src/remote/**'],
      pages: [
        P('SDK message는 내부 event의 공개 projection이다', '외부 caller에게 필요한 정보와 내부 구현 세부를 구분해야 버전 가능한 계약이 된다.', 'QueryEngine은 internal message와 state를 SDKMessage로 변환해 yield한다. permission denial, usage, partial message 포함 여부처럼 headless consumer에게 필요한 사건이 명시된다.', '내부 object를 그대로 노출하면 빠르게 만들 수 있지만 필드 rename 하나가 public break가 된다. 반대로 지나치게 단순한 result만 주면 host가 progress와 control을 구현할 수 없다.', 'SDK contract를 바꿀 때는 additive field, new union variant, changed ordering을 구분하자. 소비자가 exhaustive switch를 쓸 수 있으므로 새 variant도 호환성 변화다.', '내부에는 있지만 SDK에 내보내지 말아야 할 정보의 기준을 security, stability, usefulness로 정리해 보라.', ['src/QueryEngine.ts#L580-L720', 'src/entrypoints/sdk/coreSchemas.ts', 'src/entrypoints/sdk/coreTypes.ts']),
        P('control schema는 host와 engine 사이의 양방향 protocol이다', '질문을 보내고 답을 받는 SDK는 단순 event stream보다 복잡하다.', 'permission prompt, interrupt, set model 같은 control은 host가 engine 상태를 바꾸는 메시지다. runtime validation schema가 있어야 언어 경계를 넘은 잘못된 message를 초기에 거부할 수 있다.', '이 protocol에는 correlation id와 timeout이 필요하다. permission request에 늦게 도착한 응답이 다음 요청에 적용되면 authority가 잘못 연결된다.', 'control을 추가할 때 request/response 형태뿐 아니라 idempotency, late response, disconnect 중 상태를 설계하자. 이것이 SDK를 안정적 transport contract로 만든다.', 'host가 disconnect된 동안 열린 permission request는 auto-deny, pause, cancel 중 어떤 상태로 수렴해야 하는가?', ['src/entrypoints/sdk/controlSchemas.ts', 'src/entrypoints/sdk/coreSchemas.ts']),
        P('generator 소비 속도가 backpressure를 만든다', 'SDK caller가 event를 읽지 않으면 producer의 진행과 buffer 정책이 영향을 받는다.', 'async iterator는 consumer가 다음 값을 요청하는 구조라 자연스러운 backpressure를 제공할 수 있다. 그러나 내부 callback이 별도 queue에 계속 push하면 queue가 무한히 자랄 수 있다.', 'UI는 빠르게 render할 수 있지만 network bridge는 느리거나 끊길 수 있다. 같은 event source라도 drop 가능한 progress와 반드시 전달할 terminal event를 구분해야 한다.', 'bridge를 설계할 때 sequence number와 resume cursor를 고려하면 disconnect 후 projection을 다시 맞출 수 있다. 다만 실제 tool effect의 exactly-once를 transport alone으로 보장할 수는 없다.', 'progress event를 버려도 되는 최대 조건과 절대 버리면 안 되는 settlement event를 구분해 보라.', ['src/QueryEngine.ts#L215-L280', 'src/bridge', 'src/remote/sdkMessageAdapter.ts'], { external: [E.asyncGenerator] }),
        P('remote permission bridge는 authority를 네트워크 너머로 전달한다', '원격 UI가 승인하더라도 요청 identity와 현재 tool input이 정확히 일치해야 한다.', 'remotePermissionBridge와 session manager는 permission 질문과 응답을 원격 transport에 연결한다. 지연, reconnect, 중복 delivery가 로컬 dialog에는 없던 실패를 만든다.', '승인 token을 session-wide boolean로 만들면 재사용 공격과 잘못된 호출 승인이 가능하다. tool use id, normalized input digest, expiry와 결합해야 한다.', '원격 제어를 추가할 때 local fallback을 명확히 하자. 연결이 끊겼다는 이유로 bypass하거나 무한 대기하면 각각 안전성과 availability가 깨진다.', '원격 승인 후 실행 직전 input이 hook에 의해 바뀌면 기존 승인을 무효화해야 하는가?', ['src/remote/remotePermissionBridge.ts', 'src/remote/RemoteSessionManager.ts', 'src/remote/SessionsWebSocket.ts']),
      ],
    },
    {
      title: 'MCP, plugin, skill은 서로 다른 것을 확장한다',
      thesis: 'MCP는 외부 도구/자원 protocol, plugin은 설치·배포 단위, skill은 model instruction package다. 같은 확장 목록으로 취급하면 trust 경계가 흐려진다.',
      paths: ['src/services/mcp/**', 'src/services/plugins/**', 'src/plugins/**', 'src/skills/**'],
      pages: [
        P('MCP adapter는 외부 capability를 Tool 언어로 번역한다', 'server가 광고한 schema와 transport event를 내부 registry와 permission model에 맞춰야 한다.', 'MCP client/normalization 코드는 server description, tool name, input schema, result content를 내부 형태로 바꾼다. 외부 server가 준 문자열은 신뢰된 코드가 아니므로 이름 충돌과 malformed schema를 다뤄야 한다.', 'MCP specification이 interoperability를 제공해도 로컬 authority는 따로다. server 연결 성공은 tool 실행 허가가 아니며, resource read와 tool effect의 위험도도 다르다.', '새 MCP transport를 추가할 때 protocol mapping과 trust policy를 분리하자. stdio, HTTP, in-process는 인증과 프로세스 경계가 다르지만 내부 Tool contract는 같을 수 있다.', '서로 다른 MCP server가 같은 display name의 tool을 제공할 때 identity와 permission rule을 어떻게 안정적으로 만들 것인가?', ['src/services/mcp/client.ts', 'src/services/mcp/normalization.ts', 'src/services/mcp/types.ts'], { external: [E.mcp] }),
        P('MCP connection manager는 상태 기계다', 'connecting, connected, failed, reconnecting 상태와 tool catalog 변화가 함께 움직인다.', 'MCPConnectionManager와 관리 UI는 server lifecycle을 추적한다. connection이 끊기면 tools와 instructions가 사라지고, model context에도 delta가 전달되어야 한다.', '연결 상태를 boolean 하나로 두면 재시도 중인지 영구 실패인지 구분할 수 없다. 또한 tool list를 즉시 제거할지 진행 중 호출을 마칠지 정책이 필요하다.', '재연결을 개선할 때 exponential backoff만 보지 말고 catalog version과 in-flight call settlement를 함께 보자. stale tool invocation이 가장 위험한 경계다.', 'server reconnect 후 같은 이름의 tool schema가 달라졌다면 현재 session에서 어떻게 version을 구분할 것인가?', ['src/services/mcp/MCPConnectionManager.tsx', 'src/utils/mcpInstructionsDelta.ts']),
        P('plugin은 코드와 설정을 설치하는 공급망 경계다', '검색·설치·업데이트·제거가 filesystem effect와 실행 가능 code admission을 포함한다.', 'PluginInstallationManager와 operations는 plugin artifact의 위치와 lifecycle을 다룬다. 설치 성공은 파일 복사만이 아니라 manifest 해석, dependency, 활성화 상태와 연결된다.', 'plugin이 MCP server나 hook을 포함하면 설치는 새로운 authority surface를 만든다. provenance, version pin, update policy, removal cleanup이 필요하다.', 'UI에서 “공식/설치됨” 배지는 trust를 암시하므로 실제 registry source와 검증 결과에 근거해야 한다. 이름이나 repository URL만으로 승격하면 안 된다.', 'plugin 업데이트가 새로운 permission을 요구할 때 자동 업데이트를 계속할 것인가, 재승인을 요구할 것인가?', ['src/services/plugins/PluginInstallationManager.ts', 'src/services/plugins/pluginOperations.ts', 'src/plugins/builtinPlugins.ts']),
        P('skill은 model 행동을 바꾸는 instruction dependency다', '코드를 실행하지 않아도 prompt 우선순위와 tool 선택을 바꿀 수 있어 별도의 검토가 필요하다.', 'loadSkillsDir는 skill package를 발견하고 model context에 사용할 내용을 준비한다. bundled skill과 사용자/프로젝트 skill은 출처와 신뢰가 다르다.', 'skill을 단순 문서로 보면 prompt injection과 stale instruction 위험을 놓친다. 반대로 전부 code처럼 차단하면 사용자 확장성이 사라진다. scope, explicit invocation, allowed tools 같은 metadata가 중간 지대를 만든다.', 'skill 변경을 리뷰할 때 자연어 품질만 보지 말고 실행 범위, 충돌 규칙, context budget, 비밀 포함 여부를 확인하자.', '프로젝트가 제공한 skill이 사용자 global skill과 같은 이름일 때 어느 것을 선택하고 그 사실을 어떻게 표시해야 하는가?', ['src/skills/loadSkillsDir.ts', 'src/skills/bundledSkills.ts', 'src/skills/mcpSkillBuilders.ts']),
      ],
    },
    {
      title: 'Agent와 Task는 실행을 한 단계 더 중첩한다',
      thesis: 'subagent는 함수 호출이 아니라 독립 context·budget·permission·result projection을 가진 child runtime이며, task는 그 수명과 관찰을 관리한다.',
      paths: ['src/tools/AgentTool/**', 'src/tasks/**', 'src/Task.ts', 'src/tasks.ts'],
      pages: [
        P('AgentTool은 새 conversation engine을 여는 도구다', 'prompt 하나를 넘기는 것처럼 보여도 child의 도구, 모델, memory, permission을 다시 구성한다.', 'AgentTool과 runAgent 코드는 agent definition을 고르고 child context를 만들어 실행한다. parent는 child의 전체 transcript 대신 요약된 result와 progress를 받을 수 있다.', '이 중첩은 context isolation과 병렬 탐색을 가능하게 하지만 비용과 authority가 증폭된다. child가 parent보다 넓은 tool set을 갖거나 permission prompt를 띄울 수 없으면 명시적 정책이 필요하다.', '새 agent type을 추가할 때 persona보다 capability와 termination을 먼저 정의하자. 설명 문구만 다른 agent는 architecture상 별도 runtime일 이유가 약하다.', 'child가 발견한 사실과 실제로 수행한 effect를 parent result에서 어떻게 구분해야 하는가?', ['src/tools/AgentTool/AgentTool.tsx', 'src/tools/AgentTool/runAgent.ts', 'src/tools/AgentTool/builtInAgents.ts']),
        P('Task는 background execution의 lifecycle record다', 'running, completed, failed, killed 상태가 UI pill보다 더 큰 의미를 가진다.', 'LocalAgentTask, LocalShellTask, RemoteAgentTask는 서로 다른 executor를 감싸지만 task id와 status, output 위치, stop 동작을 공통으로 제공한다. parent session은 이 상태를 attachment로 다시 context에 넣는다.', 'background task는 parent turn이 끝난 뒤에도 살아 있을 수 있다. 그래서 process-local object와 session durable reference를 구분해야 한다. 재개 후 running이라고 적힌 task가 실제로 존재하는지도 reconciliation이 필요하다.', 'task abstraction을 통합할 때 모든 종류를 동일 state machine으로 강제하지 말고 공통 lifecycle과 type-specific effect를 분리하자.', 'process restart 뒤 이전 background task의 상태를 unknown으로 둘지 failed로 확정할지 무엇이 더 정직한가?', ['src/Task.ts', 'src/tasks.ts', 'src/tasks/LocalAgentTask/LocalAgentTask.tsx', 'src/tasks/RemoteAgentTask/RemoteAgentTask.tsx']),
        P('병렬 agent는 결과 수보다 context merge가 어렵다', '여러 child가 같은 workspace를 읽고 쓰면 결과의 순서와 충돌을 parent가 해결해야 한다.', 'AgentTool이 여러 탐색을 동시에 수행하면 읽기 결과는 합치기 쉽지만 코드 변경은 shared-state collision을 만든다. task complete 순서가 논리적 우선순위는 아니다.', '따라서 parallelism은 독립성 evidence가 있을 때만 이득이다. read-only 탐색, 별도 worktree, 명시적 ownership이 없으면 빠른 실행이 더 많은 reconciliation 비용을 만든다.', 'parent prompt에 결과를 단순 연결하면 상충 사실과 stale observation이 섞인다. source agent, revision, observed path를 보존한 merge가 필요하다.', '두 agent가 같은 파일에 다른 제안을 낸 경우 parent가 비교할 최소 evidence는 무엇인가?', ['src/tools/AgentTool/runAgent.ts', 'src/tasks/InProcessTeammateTask/InProcessTeammateTask.tsx', 'src/tools/AgentTool/agentMemorySnapshot.ts']),
        P('영상의 UI와 generator를 이 축 안에서 읽는다', '두 메커니즘은 제품의 전부가 아니라 runtime과 사람·host를 잇는 시간적 표현이다.', 'async generator 영상의 핵심은 중단 가능한 progressive event protocol을 이해하는 데 유효하다. React/Ink 영상의 핵심은 canonical state를 declarative terminal projection으로 만드는 데 유효하다.', '그러나 generator만 보아서는 permission·durability를 설명할 수 없고, UI만 보아서는 effect semantics를 설명할 수 없다. 이 프로젝트에서 둘은 QueryEngine과 REPL/SDK adapter 사이를 이어 주는 메커니즘이다.', '스터디 자료는 영상을 chapter 기준으로 승격하지 않고 실제 source path 안에 배치한다. 따라서 영상의 직관을 얻은 뒤 반드시 event identity, state ownership, failure path로 돌아온다.', '같은 partial message를 REPL과 SDK가 다르게 보여도 core 의미가 같다고 말하려면 무엇을 공유해야 하는가?', ['src/QueryEngine.ts', 'src/screens/REPL.tsx', 'src/entrypoints/sdk/coreTypes.ts'], { external: [{ label: 'Async generator 분석 영상', url: 'https://www.youtube.com/watch?v=3ZnBDXQQN_E' }, { label: 'React/Ink UI 분석 영상', url: 'https://www.youtube.com/watch?v=W83jWFwEnTU&t=61s' }] }),
      ],
    },
  ],
  workshop: {
    title: '같은 turn을 REPL과 SDK에서 비교하기',
    deck: 'core event는 같고 projection과 control 방식만 달라지는지, 실제 코드의 타입과 state owner로 확인한다.',
    steps: [
      'partial assistant message, permission request, tool progress, final result 네 사건을 고른다.',
      '각 사건이 QueryEngine에서 어떤 SDKMessage가 되고 REPL에서 어떤 state update와 component가 되는지 찾는다.',
      'consumer가 느리거나 disconnect된 경우 event delivery와 engine 실행이 어떻게 달라지는지 적는다.',
      'MCP tool 하나를 골라 discovery → registry → permission → result normalization을 추적한다.',
      'AgentTool child task 하나를 parent session의 canonical state와 UI projection으로 나누어 그린다.',
    ],
    outcome: 'UI, SDK, remote가 별도 제품 로직이 아니라 core protocol의 서로 다른 adapter/projection이며 각자 고유 실패를 가진다고 설명할 수 있으면 된다.',
    record: '다음 모임에는 projection 하나가 canonical state를 잘못 소유하고 있는 후보와 분리 방안을 가져온다.',
    refs: ['src/screens/REPL.tsx', 'src/QueryEngine.ts', 'src/services/mcp/normalization.ts'],
  },
}

const report6 = {
  volume: '06',
  slug: '06-build-configuration-telemetry-and-reconstruction',
  short: '빌드·구성·운영·복원',
  metricGroup: 'configuration-and-operations',
  accent: '#536472',
  title: '빌드, 구성, 운영과 복원 저장소 읽기',
  subtitle: '번들에서 복원된 코드의 한계를 인정하면서 feature gate·설정·migration·telemetry·리팩터링 신호를 실제 프로젝트 운영 구조로 읽는다',
  promise: '이 권을 마치면 보이는 코드를 공식 원본이나 활성 제품과 동일시하지 않고도, build-time variability와 운영 계측이 설계를 어떻게 형성하는지 구체적으로 설명할 수 있다.',
  orientation: '이 저장소는 정상적인 개발 checkout이 아니라 배포 npm 번들에서 복원된 v2.1.88 snapshot이다. scripts와 stubs는 그 차이를 메우려 하지만 누락된 내부 모듈과 build intrinsic을 완전히 복구할 수 없다. 이 제약을 분석의 변명으로 쓰지 않고, 무엇이 관찰이고 무엇이 추론인지 분리하는 출발점으로 삼는다.',
  chapters: [
    {
      title: '복원 저장소의 출처와 한계를 먼저 고정한다',
      thesis: '코드가 존재한다는 사실, 원래 source tree와 같다는 주장, production에서 활성이라는 주장은 서로 다른 증거를 요구한다.',
      paths: ['README_KR.md', 'QUICKSTART.md', 'package.json', 'scripts/**', 'stubs/**'],
      pages: [
        P('이 snapshot은 무엇이고 무엇이 아닌가', 'npm 패키지 2.1.88의 단일 bundle에서 TypeScript source 형태를 복원한 제3자 저장소다.', 'README는 버전과 추출 경로, 약 1,884개 TS/TSX 파일, 누락된 feature-gated 모듈을 명시한다. 우리가 직접 고정한 commit은 해당 저장소의 특정 상태일 뿐 Anthropic 내부 monorepo revision은 아니다.', '따라서 함수와 call site는 이 snapshot에서의 관찰 사실이다. 원래 파일 경계, 주석의 원작성, production cohort, 미래 roadmap은 더 약한 추론이다. 보고서 전반에서 이 차이를 유지한다.', '연구 자료로서는 충분히 가치가 있다. 단, “Claude Code는 반드시 이렇게 동작한다”보다 “이 배포 snapshot의 복원 코드는 이렇게 구성되어 있다”고 말하는 것이 정확하다.', '한 코드 경로가 존재한다는 사실로 실제 사용자에게 활성화되었다고 결론 내리려면 어떤 추가 evidence가 필요한가?', ['README_KR.md#L1-L70', 'package.json']),
        P('feature()는 runtime if가 아니라 build-time variability다', 'Bun intrinsic이 false로 결정되면 branch와 import가 dead-code elimination 대상이 된다.', 'README와 QUICKSTART는 내부 build에서 <code>feature(FLAG)</code>가 compile time에 해석된다고 설명한다. 배포 bundle에는 false branch의 module이 아예 없을 수 있으므로 source reference만 남고 구현은 복원할 수 없다.', '이 메커니즘은 software product line의 variation point와 닮았다. 하나의 source가 내부/외부, 실험 cohort, platform에 따라 다른 product를 만든다. runtime flag와 달리 배포 후 켤 수 없는 path도 있다.', '분석에서는 missing import를 구현 부재로 기록해야지 임의 stub의 행동으로 추정하면 안 된다. stubs는 build 탐색용이지 원래 semantics의 evidence가 아니다.', '같은 feature 이름이 build-time intrinsic과 runtime GrowthBook gate에 모두 쓰일 때 두 층을 어떻게 구분할 것인가?', ['README_KR.md#L70-L210', 'QUICKSTART.md', 'stubs/bun-bundle.ts']),
        P('prepare와 build script는 서로 다른 복원 전략을 보인다', '원본을 직접 patch하는 경로와 복사본을 transform하는 경로의 안전성이 다르다.', '<code>prepare-src.mjs</code>는 src 안의 bun import와 MACRO를 바꾸는 반면 <code>build.mjs</code>는 build-src로 복사해 transform하고 iterative stub을 만든다. 이름이 비슷해도 source mutation semantics가 다르다.', '복원 도구는 대상 코드를 이해하기 위한 보조물이어야 한다. 원본 snapshot을 바꾸면 이후 분석의 provenance가 흔들린다. 그래서 이번 연구에서는 target build를 실행하지 않고 fixed clone을 read-only evidence로 사용했다.', '범용 분석 도구도 repo-specific 가정을 코드에 하드코딩하지 않고 declarative grouping을 입력으로 받아야 다른 저장소에서 재사용할 수 있다. 분석기와 연구 질문을 분리하는 원칙이다.', 'prepare-src가 원본을 수정하는 현재 script name과 package script 조합은 사용자에게 어떤 오해를 줄 수 있는가?', ['scripts/prepare-src.mjs', 'scripts/build.mjs', 'package.json']),
        P('stub이 build를 통과시켜도 의미는 복원되지 않는다', 'missing module에 빈 export를 만들면 linker 오류는 줄지만 호출 결과와 side effect는 발명된다.', 'build script는 esbuild 오류에서 missing path를 수집해 stub을 만든다. 이는 남은 source를 탐색 가능한 bundle로 만드는 best-effort 전략이지, 기능적으로 동일한 CLI를 증명하는 과정이 아니다.', '특히 security, coordinator, daemon처럼 누락된 모듈은 empty function으로 대체했을 때 fail-open이나 silent no-op가 될 수 있다. 실행 성공을 기능 성공으로 읽으면 가장 위험하다.', '재구성 build를 검증하려면 upstream binary와 differential behavior를 비교해야 하지만 인증·외부 효과·버전 제약이 있다. 비교할 수 없는 영역은 unknown으로 남겨야 한다.', 'stubbed function이 호출되지 않았음을 증명하지 못한 build를 어떤 용도로까지 허용할 수 있는가?', ['scripts/build.mjs#L120-L246', 'QUICKSTART.md']),
      ],
    },
    {
      title: '구성과 migration이 제품 변형을 운영한다',
      thesis: 'feature flag, settings, model alias, command registration은 코드 밖 결정이 runtime 행동을 바꾸게 하는 구성 언어다.',
      paths: ['src/utils/settings/**', 'src/migrations/**', 'src/commands/**', 'src/utils/model/**'],
      pages: [
        P('feature flag 이름보다 evaluation site를 읽는다', '난독화된 flag도 call site와 fallback, audience를 추적하면 실제 영향을 알 수 있다.', '저장소 문서는 <code>tengu_*</code> flag 목록을 발견 중심으로 정리한다. 스터디에서는 이름에서 의미를 추정하기보다 getter가 어디서 호출되고 false/unknown에서 무엇을 하는지 따라간다.', 'flag는 코드 배포 없이 behavior를 바꾸지만 테스트 상태 공간을 곱한다. 두 개의 독립 gate와 환경 변수 조합만으로도 여러 configuration이 생긴다.', '중요 기능에는 configuration matrix와 invariant test가 필요하다. 모든 조합을 exhaustive하게 돌리지 못하면 위험 기반 pairwise와 default/failure path를 우선한다.', 'voice mode처럼 build gate와 runtime killswitch가 겹친 기능의 실제 활성 조건을 boolean expression으로 적어 보라.', ['docs/ko/02-숨겨진-기능과-코드네임.md', 'src/services/analytics/growthbook.ts', 'src/voice/voiceModeEnabled.ts']),
        P('설정 계층은 값 병합이 아니라 authority 병합이다', 'default, user, project, local, managed source는 같은 key라도 수정 권한이 다르다.', 'settings 유틸리티는 여러 위치의 설정을 읽고 병합한다. 단순 object spread는 편하지만 어떤 source가 값을 이겼는지 잃을 수 있다.', '특히 permission과 telemetry, model 선택은 provenance가 필요하다. 사용자가 UI에서 값을 바꿀 수 있어 보여도 managed layer가 덮으면 변경은 반영되지 않는다. UI가 effective value와 source를 함께 보여 줘야 한다.', '설정 구조를 리팩터링할 때 parsed value, source metadata, validation error를 분리하면 fallback과 설명이 쉬워진다. invalid high-priority value를 낮은 값으로 조용히 대체할지도 명시해야 한다.', 'project config가 malformed일 때 전체 시작을 막을지 해당 key만 무시할지 어떤 기준으로 결정할 것인가?', ['src/utils/settings', 'src/services/remoteManagedSettings/types.ts']),
        P('migration은 오래된 durable state와 새 코드의 handshake다', '모델 alias와 설정 key가 바뀌어도 사용자의 이전 선택을 의미 있게 옮겨야 한다.', 'migrations 디렉터리에는 Fennec alias를 Opus로 옮기거나 기본값을 재설정하는 작은 변환이 있다. 각각은 과거 제품 의미를 현재 vocabulary로 번역한다.', 'migration을 파일 이름과 실행 횟수로만 보면 위험하다. idempotency, partial failure, version marker, rollback이 필요하다. 동일 process에서 여러 번 실행돼도 결과가 안정적이어야 한다.', 'migration code는 시간이 지나도 historical contract로 남는다. 현재 이름이 낯설다는 이유로 삭제하면 오래된 설치의 upgrade path가 끊긴다. removal은 지원 최소 버전 evidence와 함께 해야 한다.', 'fennec-fast-latest처럼 하나의 alias가 model과 fast mode 두 설정으로 분해될 때 atomicity를 어떻게 보장할 것인가?', ['src/migrations/migrateFennecToOpus.ts', 'src/migrations/resetProToOpusDefault.ts']),
        P('command catalog는 운영 기능의 발견 표면이다', '80개가 넘는 slash command는 제품 설정과 진단, onboarding, extension 관리를 노출한다.', 'commands tree는 UI 기능 목록이면서 내부 application service registry다. feature gate와 user type에 따라 숨겨진 command도 있다.', '많은 command가 있다는 사실은 중요도를 뜻하지 않지만 운영 복잡도를 보여 준다. 같은 설정을 command, UI panel, config file이 각각 변경하면 write path가 여러 개가 된다.', '구조 개선은 command를 폴더별로 정리하는 데서 끝나지 않는다. underlying use case를 하나로 두고 command와 UI를 adapter로 만들면 validation과 telemetry가 일치한다.', '설정 변경 command 하나를 골라 동일 값을 바꾸는 다른 UI/API 경로가 있는지 찾아보라.', ['src/commands', 'src/utils/processUserInput/processSlashCommand.tsx']),
      ],
    },
    {
      title: 'Telemetry와 비용 코드는 운영의 두 번째 모델이다',
      thesis: '실행 코드가 무엇을 하는지와 운영 코드가 무엇을 관찰하는지는 다르며, 관찰 schema가 팀의 문제 인식을 형성한다.',
      paths: ['src/services/analytics/**', 'src/cost-tracker.ts', 'src/services/api/**'],
      pages: [
        P('analytics pipeline은 event 생산과 sink를 분리한다', '동일 event가 first-party exporter와 제한된 Datadog sink로 다른 policy를 따라간다.', 'analytics 디렉터리에는 metadata 수집, event logger, exporter, sink killswitch가 나뉜다. batch, retry, disk persistence는 네트워크 장애에서도 전달을 지속하게 한다.', '이 구조는 observability reliability를 높이지만 privacy와 retention surface도 넓힌다. 운영 가치와 데이터 최소화는 같은 방향으로 자동 정렬되지 않는다.', '분석할 때 endpoint 목록보다 event taxonomy, common metadata, truncation, opt-out condition을 보자. 어떤 사건이 항상 session/user identifier와 결합되는지가 더 중요한 질문일 수 있다.', '오류 진단에 필요하지만 사용자 식별과 결합할 필요가 없는 metadata를 어떻게 분리할 수 있는가?', ['src/services/analytics/firstPartyEventLogger.ts', 'src/services/analytics/firstPartyEventLoggingExporter.ts', 'src/services/analytics/datadog.ts']),
        P('metadata.ts는 환경을 운영 언어로 번역한다', 'platform, runtime, subscription, repo hash가 모든 event의 분석 차원을 만든다.', '저장소 자체 문서는 넓은 metadata 수집과 tool input truncation을 지적한다. 코드를 보면 어떤 field가 기본, opt-in, hashed, truncated인지 구체적으로 확인할 수 있다.', '해시는 익명화와 동일하지 않다. 안정된 repo hash는 여러 session을 연결할 수 있고 작은 후보 집합에서는 재식별 가능성이 있다. 반대로 진단에는 environment correlation이 유용하다.', 'privacy review는 “원문을 보내는가”만 묻지 말고 linkability, retention, access, purpose를 함께 본다. tool detail 환경 변수처럼 운영자가 켤 수 있는 상세 로그도 별도 threat가 된다.', '동일 버그를 재현하는 데 필요한 최소 environment fingerprint는 무엇이며 어떤 field는 제거할 수 있는가?', ['src/services/analytics/metadata.ts#L200-L520', 'docs/ko/01-텔레메트리와-프라이버시.md']),
        P('비용 추적은 product policy와 protocol state를 잇는다', 'token usage와 모델 가격을 합산해 budget stop, UI 표시, SDK result에 사용한다.', 'cost tracker는 모델별 가격과 usage를 금액으로 바꾼다. prompt cache read/write, thinking token, fallback model이 있으면 단순 input/output 곱셈보다 복잡하다.', '비용은 추정치일 수 있으며 provider billing과 완전히 같다고 가정하면 안 된다. 그렇지만 turn 중 budget enforcement에는 빠른 local estimate가 필요하다.', '모델 출시 때 가격표와 context window를 갱신하라는 marker가 있는 이유다. 운영 상수 변경은 기능 코드 변경만큼 test와 review가 필요하다.', '가격 정보가 오래됐을 때 hard budget stop을 계속 적용하는 것이 사용자에게 더 안전한가?', ['src/cost-tracker.ts', 'src/utils/model', 'docs/ko/05-향후-로드맵.md']),
        P('좋은 계측은 effect와 outcome 사이의 join을 남긴다', 'tool_use count만으로 코드 변경 성공이나 사용자 가치를 알 수 없다.', '이 코드에는 많은 event가 있지만 activity 수가 correctness를 증명하지 않는다. permission denial, tool result, session outcome을 같은 correlation id로 연결해야 실패 원인을 설명할 수 있다.', '반대로 모든 것을 join하기 위해 raw prompt와 path를 수집하면 privacy를 해친다. 최소한의 stable id와 aggregate outcome으로 질문에 답할 수 있는지 먼저 검토해야 한다.', '계측을 추가할 때 “어떤 결정을 위해 필요한가”를 적으면 불필요한 field와 무기한 retention을 줄일 수 있다. dashboard 존재가 measurement validity를 보장하지 않는다.', 'Edit 실패율을 개선하려면 event에 어떤 phase와 reason이 필요하며 source code 내용은 왜 필요하지 않은가?', ['src/services/analytics/index.ts', 'src/services/analytics/metadata.ts', 'src/services/tools/toolExecution.ts']),
      ],
    },
    {
      title: '연구 문서에서 구조 개선 과제로 돌아온다',
      thesis: '발견 목록을 그대로 믿거나 버리지 않고, 그 문서의 탐색법을 core code와 연결해 검증 가능한 리팩터링 질문으로 바꾼다.',
      paths: ['docs/ko/**', 'src/query.ts', 'src/screens/REPL.tsx', 'src/services/api/claude.ts'],
      pages: [
        P('저장소의 기존 보고서는 symbol-led investigation을 사용한다', '특이한 flag·endpoint·codename에서 시작해 정의와 call site를 모으고 주제를 만든다.', '텔레메트리 문서는 exporter와 metadata, 원격 제어 문서는 polling과 killswitch, roadmap 문서는 gate와 prompt marker를 묶는다. 이 방식은 넓은 복원 코드에서 숨은 subsystem을 발견하는 데 효과적이다.', '한계는 discovery가 곧 importance로 보일 수 있다는 점이다. 눈에 띄는 코드네임보다 QueryEngine의 상태 보존이 제품 핵심일 수 있다. 또한 comment는 계획 증거가 아니라 해당 snapshot의 text evidence다.', '새 6권은 기존 문서의 발견을 운영/구성 권에 흡수하되 전체 분류는 runtime responsibility로 다시 세웠다. 발견은 장을 지배하지 않고 해당 core를 설명할 때 사용된다.', '기존 5개 보고서에서 관찰 사실과 미래 추론이 한 문단에 섞인 사례를 하나 찾아 다시 작성해 보라.', ['docs/ko/01-텔레메트리와-프라이버시.md', 'docs/ko/02-숨겨진-기능과-코드네임.md', 'docs/ko/05-향후-로드맵.md']),
        P('큰 파일은 책임 분포를 찾는 지도이지 자동 분해 명령이 아니다', 'query.ts, main.tsx, REPL.tsx, claude.ts는 서로 다른 변화가 한 지점에 모였다는 신호다.', '각 큰 파일에서 import cluster, state owner, error handling, consumer를 보면 후보 seam이 나온다. query는 turn protocol, main은 composition, REPL은 projection controller, claude.ts는 provider adapter로 중심 성격도 다르다.', '모두 같은 “service extraction” 처방을 쓰면 의미가 나빠질 수 있다. state machine은 transition owner를, composition은 dependency graph를, adapter는 normalization contract를 중심으로 나눠야 한다.', '분해 전에는 characterization trace를 만든다. happy path output뿐 아니라 cancellation, permission denial, resume, cache behavior를 포함해야 한다.', '네 큰 파일 중 하나를 골라 변경 이유 세 가지와 그 사이 공유 invariant를 적어 보라.', ['src/query.ts', 'src/main.tsx', 'src/screens/REPL.tsx', 'src/services/api/claude.ts']),
        P('리팩터링은 이동 순서가 설계의 일부다', '공통 contract와 관찰을 먼저 만들지 않으면 파일을 옮기는 동안 오류를 발견할 기준이 사라진다.', '안전한 순서는 대체로 현재 behavior trace 확보, typed seam 도입, 한 책임 이동, dual/shadow 비교, old path 제거다. 실제 effect는 두 번 실행하지 않고 record/replay adapter로 비교한다.', '대규모 cleanup과 기능 변경을 함께 하면 실패 원인을 분리하기 어렵다. 특히 복원 source는 upstream tests와 history가 부족하므로 작은 변경과 명시적 limitation이 더 중요하다.', '구조 개선 목표는 파일 수가 아니라 change consequence다. provider 추가가 query core를 덜 건드리고, 새 UI가 session format을 바꾸지 않게 되는지가 결과다.', 'Tool pipeline을 분리할 때 가장 먼저 고정해야 할 characterization test는 무엇인가?', ['src/services/tools/toolExecution.ts', 'src/Tool.ts', 'src/query.ts']),
        P('이 프로젝트를 이해했다는 기준은 변경을 예측하는 능력이다', '파일 위치를 기억하는 것보다 새 요구가 어느 owner와 invariant를 건드리는지 설명할 수 있어야 한다.', '예를 들어 “원격 SDK에 새로운 progress event 추가” 요구는 QueryEngine projection, control schema, bridge backpressure, REPL compatibility를 건드린다. “Edit에 hash version 추가”는 Read cache, validation, transcript, error UX를 건드린다.', '이 예측은 상위 흐름 나열에서 나오지 않는다. 타입 메커니즘, 수명, identity, authority, projection을 함께 이해할 때 가능하다.', '6권의 마지막에는 각 팀원이 change scenario를 하나 제시하고 영향 graph를 그리는 방식이 좋다. 다른 팀원이 빠진 invariant와 evidence를 질문하면 학습이 코드 리뷰 능력으로 이어진다.', '새 provider를 추가한다는 요구에 대해 반드시 유지해야 할 내부 contract 다섯 개를 말할 수 있는가?', ['src/QueryEngine.ts', 'src/Tool.ts', 'src/utils/messages.ts', 'src/services/api/claude.ts']),
      ],
    },
  ],
  workshop: {
    title: '복원 코드에서 검증 가능한 리팩터링 제안 만들기',
    deck: '기존 문서의 발견 하나를 core responsibility와 연결하고, 코드 밖 추론을 분리한 뒤 작은 구조 개선으로 바꾼다.',
    steps: [
      '기존 <code>docs/ko/**</code> 보고서에서 주장 하나를 고르고 관찰·추론·unknown으로 문장을 나눈다.',
      '관련 symbol의 definition, call site, configuration source, telemetry를 고정 commit에서 추적한다.',
      '그 기능이 여섯 responsibility 중 어느 owner에 속하고 어떤 cross-cutting concern과 만나는지 적는다.',
      'change scenario와 failure scenario를 하나씩 만들고, 현재 구조에서 수정해야 할 파일을 예측한다.',
      'typed seam, validation oracle, 단계적 이동 순서를 포함한 리팩터링 제안을 작성한다.',
    ],
    outcome: '“큰 파일을 나누자”가 아니라 특정 변경의 파급을 줄이면서 기존 protocol과 authority를 보존하는 제안을 낼 수 있으면 된다.',
    record: '스터디 전체의 마지막 기록은 가장 확실한 사실, 가장 유용한 해석, 아직 확인할 수 없는 질문을 각각 하나씩 남긴다.',
    refs: ['README_KR.md', 'docs/ko/05-향후-로드맵.md', 'scripts/build.mjs'],
  },
}

Object.assign(report1, {
  mechanisms: [
    { name: 'async generator', runtime: 'Promise로 감싼 iterator 요청 큐와 suspended/executing/completed 상태를 유지한다.', use: 'QueryEngine과 query가 부분 메시지·도구 진행·최종 결과를 시간 순서로 내보낸다.', trap: 'yield는 저장이나 rollback이 아니다. consumer가 멈췄을 때 외부 효과 정리가 별도로 필요하다.' },
    { name: 'for await…of', runtime: '각 next() 결과를 await하고 iterator가 끝날 때까지 consumer 쪽 제어 흐름을 반복한다.', use: 'provider stream과 tool update를 같은 소비 문법으로 연결한다.', trap: '느린 consumer가 backpressure를 만들지만 내부 별도 queue가 있으면 메모리는 계속 늘 수 있다.' },
    { name: 'AbortController', runtime: 'signal에 한 번 abort 사건을 발행하는 협력적 취소 primitive다.', use: '세션의 중단 의도를 provider 요청과 tool context에 전파한다.', trap: '이미 완료된 파일·process 효과는 되돌리지 않는다.' },
    { name: 'class private state', runtime: 'instance 생애 동안 mutable reference와 누적 상태를 보존한다.', use: '메시지, usage, denial, read-file cache를 여러 turn에 걸쳐 소유한다.', trap: 'turn 임시값까지 instance에 넣으면 reset 경계와 동시성 의미가 흐려진다.' },
    { name: 'structural typing', runtime: '명목 선언보다 필요한 property shape의 호환성으로 값을 연결한다.', use: 'config port와 event projection을 구현체에 덜 결합시킨다.', trap: '넓은 object와 cast는 서로 다른 identity를 우연히 호환시킬 수 있다.' },
    { name: 'dynamic import / adapter', runtime: 'module loading 시점과 dependency availability를 runtime까지 늦춘다.', use: 'provider·feature별 경계를 core가 직접 고정하지 않게 한다.', trap: '실패 시점이 늦어지고 누락 모듈이 compile-time 검증에서 빠질 수 있다.' },
  ],
  sourceIndex: [
    ['src/entrypoints/cli.tsx', '진입 함수와 import 경계', 'process 초기화와 application composition이 어디서 갈리는가'],
    ['src/main.tsx', 'mode 분기와 dependency 생성', '서로 다른 변경 이유가 어느 상태를 공유하는가'],
    ['src/QueryEngine.ts', 'private fields와 submitMessage', 'session/turn/tool-call 수명이 어떻게 구분되는가'],
    ['src/query.ts', 'async generator와 stop branch', '허용 상태 전이와 pairing invariant는 무엇인가'],
    ['src/query/tokenBudget.ts', '검사 함수와 호출 시점', '제한 초과 전에 이미 시작된 효과는 무엇인가'],
    ['src/services/api/claude.ts', 'request lowering과 stream adapter', 'provider 세부가 내부 message에 새는가'],
    ['src/utils/queryContext.ts', 'ordered transformation', '어떤 metadata가 사라지고 어떤 id가 남는가'],
    ['src/utils/abortController.ts', 'signal 생성·결합', '취소 요청 뒤 settlement owner는 누구인가'],
  ],
})

Object.assign(report2, {
  mechanisms: [
    { name: 'discriminated union', runtime: '공통 tag 값으로 variant를 좁혀 각 분기에서 가능한 field를 제한한다.', use: 'assistant/user/system·attachment subtype·compact boundary를 구분한다.', trap: 'default branch와 broad cast가 exhaustive 검사를 무력화할 수 있다.' },
    { name: 'normalization', runtime: '여러 source representation을 정해진 target shape와 순서로 낮춘다.', use: '내부 message와 attachment를 provider payload로 바꾼다.', trap: '삭제한 provenance와 UI metadata는 target에서 되살릴 수 없다.' },
    { name: 'tagged persistence record', runtime: 'version과 kind가 있는 record가 미래 reader의 해석 분기를 만든다.', use: '세션·compact boundary·legacy attachment의 재개 호환을 유지한다.', trap: 'unknown variant를 조용히 버리면 durable evidence가 손실된다.' },
    { name: 'lazy projection', runtime: 'canonical source를 유지한 채 consumer 시점에 필요한 표현을 계산한다.', use: 'model-visible history, transcript, UI history를 다르게 만든다.', trap: 'projection을 다시 canonical state로 저장하면 손실이 누적된다.' },
    { name: 'memoization/cache', runtime: '입력 identity에 따라 계산 결과를 재사용한다.', use: 'memory scan과 prompt prefix 비용을 낮춘다.', trap: 'cwd·설정·age가 cache key에 없으면 stale context가 된다.' },
    { name: 'lossy compaction', runtime: '큰 history를 요약·tombstone·boundary로 치환한다.', use: 'token window 안에서 장기 세션을 계속한다.', trap: '미완료 효과와 판단 근거를 자연어 요약만으로 보존하기 어렵다.' },
  ],
  sourceIndex: [
    ['src/utils/processUserInput/processUserInput.ts', '입력 종류 판별', '문자열이 어느 local capability로 해석되는가'],
    ['src/utils/processUserInput/processSlashCommand.tsx', 'command lookup/dispatch', '인식과 effect가 분리되어 있는가'],
    ['src/utils/messages.ts', 'message/attachment switch', 'variant 추가가 어느 consumer에 전파되는가'],
    ['src/utils/queryContext.ts', 'API projection', 'provider에 보내지 않는 필드의 근거는 무엇인가'],
    ['src/memdir/findRelevantMemories.ts', '관련성 선택', 'freshness·scope·conflict를 어떻게 다루는가'],
    ['src/services/compact/compact.ts', '요약 입력과 boundary', '후속 행동에 필요한 사실을 보존하는가'],
    ['src/services/compact/microCompact.ts', 'tool result 축소', 'payload와 실행 identity가 어떻게 분리되는가'],
    ['src/utils/sessionStorage.ts', 'append/load/version', '부분 write와 legacy record를 어떻게 복구하는가'],
  ],
})

Object.assign(report3, {
  mechanisms: [
    { name: 'generic factory', runtime: '정의 값 D에서 schema와 method signature의 구체 타입을 추론한다.', use: 'buildTool이 공통 default를 주면서 각 도구 input/output 타입을 보존한다.', trap: '마지막 assertion은 runtime 증명이 아니며 default 변경은 전체 도구 의미를 바꾼다.' },
    { name: 'runtime schema', runtime: 'unknown JSON을 실행 전에 성공/실패 result로 검증한다.', use: '모델이 낸 tool arguments를 semantic validation 전에 좁힌다.', trap: 'TypeScript 타입은 실행 중 사라지므로 schema 없이 외부 입력은 안전하지 않다.' },
    { name: 'async iterator composition', runtime: '하위 iterator의 사건을 상위 stream에 순서대로 전달한다.', use: 'permission·call·progress 결과를 query까지 운반한다.', trap: '중간 iterator가 throw/return할 때 final observation을 놓칠 수 있다.' },
    { name: 'input-dependent concurrency', runtime: '같은 함수라도 구체 인자에 따라 병렬 가능성을 다르게 판정한다.', use: '연속된 read-only tool call만 제한된 병렬 batch로 만든다.', trap: '판정 실패를 안전으로 간주하면 shared state race가 생긴다.' },
    { name: 'optimistic concurrency', runtime: '읽은 version과 commit 직전 version을 비교해 stale write를 거부한다.', use: 'Read cache와 Edit의 timestamp/content 검사가 사용자의 동시 변경을 보호한다.', trap: '검사와 write 사이의 await 또는 외부 process race는 별도 문제다.' },
    { name: 'event-loop critical window', runtime: '동기 구간은 같은 thread의 다른 task에 제어를 넘기지 않지만 OS 외부 경쟁은 남는다.', use: 'Edit가 stale check와 write 사이 await를 피한다.', trap: '동기라는 이유만으로 filesystem transaction이라고 부를 수 없다.' },
  ],
  sourceIndex: [
    ['src/Tool.ts', 'Tool/ToolDef/BuiltTool', 'compile-time type와 runtime default가 어디서 만나는가'],
    ['src/tools.ts', 'tool pool assembly', 'discovery와 authority가 분리되는가'],
    ['src/services/tools/toolExecution.ts', 'processedInput pipeline', '사용자가 승인한 정확한 값이 실행되는가'],
    ['src/services/tools/toolOrchestration.ts', 'partitionToolCalls', '병렬 판정과 context merge가 결정적인가'],
    ['src/tools/FileReadTool/FileReadTool.ts', 'readFileState update', '부분 read가 어떤 편집 전제를 남기는가'],
    ['src/tools/FileEditTool/FileEditTool.ts', 'stale check/patch/write', '임계 구간 안에 비동기 gap이 있는가'],
    ['src/tools/BashTool/bashSecurity.ts', 'parse와 unknown 처리', '실제 shell semantics와 어디까지 일치하는가'],
    ['src/tools/GrepTool/GrepTool.ts', 'narrow schema/result', '전용 도구가 generic shell보다 주는 이득은 무엇인가'],
  ],
})

Object.assign(report4, {
  mechanisms: [
    { name: 'immutable context snapshot', runtime: '한 판단에 필요한 mode·rules·roots를 한 값으로 전달한다.', use: 'tool call이 어떤 authority 환경에서 평가됐는지 고정한다.', trap: '오래 유지하면 정책 변경이 반영되지 않고, 매번 읽으면 한 호출 안에서 흔들린다.' },
    { name: 'pattern matcher', runtime: '정규화된 resource와 rule pattern의 일치 여부를 계산한다.', use: '파일 경로와 shell prefix의 allow/deny/ask 후보를 찾는다.', trap: 'canonicalization 전 문자열 비교는 traversal·separator·symlink를 놓친다.' },
    { name: 'result algebra', runtime: 'allow/ask/deny를 boolean 대신 서로 다른 payload를 가진 variant로 표현한다.', use: 'reason, updatedInput, userModified를 실행 pipeline에 보존한다.', trap: 'ask를 deny로 뭉개거나 allow를 안전성 증명으로 오해하기 쉽다.' },
    { name: 'reference monitor', runtime: 'resource effect 직전에 subject 요청과 policy를 중재한다.', use: 'toolExecution의 공통 permission 단계가 모든 도구를 통과시킨다.', trap: 'hook·validator·sandbox가 monitor를 우회하는 별도 효과를 만들 수 있다.' },
    { name: 'sandbox adapter', runtime: '플랫폼별 격리 primitive를 공통 실행 interface 뒤에 둔다.', use: 'Bash process의 filesystem/network 반경을 줄인다.', trap: '격리는 authorization이 아니며 unavailable 시 fallback 정책이 필요하다.' },
    { name: 'TOCTOU identity', runtime: 'check 시점의 resource가 use 시점에도 같은 대상인지 확인하는 문제다.', use: 'path normalization, symlink와 Edit stale 검사를 함께 보게 한다.', trap: 'check를 늘려도 같은 file descriptor/version을 공유하지 않으면 race가 남는다.' },
  ],
  sourceIndex: [
    ['src/types/permissions.ts', 'context/result variants', 'authority 의미가 타입에 충분히 남는가'],
    ['src/utils/permissions/permissions.ts', 'precedence와 matcher', 'managed deny를 local allow가 덮을 수 있는가'],
    ['src/utils/permissions/filesystem.ts', 'path/root 판정', 'lexical path와 real target을 구분하는가'],
    ['src/tools/BashTool/bashPermissions.ts', 'prefix rule 추출', 'environment와 compound command를 포함하는가'],
    ['src/tools/BashTool/bashSecurity.ts', 'parser fallback', 'unknown syntax가 fail-open되지 않는가'],
    ['src/utils/sandbox/sandbox-adapter.ts', 'platform adapter', '실제 enforcement 성공을 확인하는가'],
    ['src/hooks', 'permission-related hook', 'advisory와 authoritative hook이 구분되는가'],
    ['src/services/remoteManagedSettings/index.ts', 'poll/cache/apply', 'stale policy의 availability/security tradeoff는 무엇인가'],
  ],
})

Object.assign(report5, {
  mechanisms: [
    { name: 'React render/commit', runtime: 'component를 순수 계산으로 호출한 뒤 변경분만 host renderer에 commit한다.', use: 'Ink가 terminal 화면을 state의 projection으로 갱신한다.', trap: 'render 중 process/tool effect를 실행하면 재호출 때 중복될 수 있다.' },
    { name: 'context provider', runtime: 'component subtree에 value를 전달하고 value identity 변화로 consumer render를 유발한다.', use: 'modal, queue, notifications, overlay state를 공유한다.', trap: '넓은 mutable value는 ownership과 rerender 범위를 과도하게 넓힌다.' },
    { name: 'async iterator protocol', runtime: 'host가 next/return/throw를 호출해 producer와 양방향 종료 의미를 만든다.', use: 'SDK caller가 engine event를 점진적으로 소비한다.', trap: 'network bridge의 queue와 durable resume는 iterator가 자동 제공하지 않는다.' },
    { name: 'runtime validation schema', runtime: 'wire message를 parse해 control union을 좁힌다.', use: 'SDK/remote의 permission·interrupt·configuration message를 검증한다.', trap: 'schema version과 late response correlation이 없으면 올바른 모양의 잘못된 응답이 된다.' },
    { name: 'adapter normalization', runtime: '외부 protocol의 이름·schema·result를 내부 contract로 변환한다.', use: 'MCP tool과 resource를 Tool registry와 message system에 연결한다.', trap: '연결 성공을 authority나 trust로 승격하면 안 된다.' },
    { name: 'child runtime isolation', runtime: '별도 context, budget, tool set, cancellation을 가진 중첩 실행을 만든다.', use: 'AgentTool과 Task가 subagent/background work를 관리한다.', trap: 'workspace effect와 결과 merge까지 자동 격리되는 것은 아니다.' },
  ],
  sourceIndex: [
    ['src/screens/REPL.tsx', 'state/effect/provider wiring', 'canonical state와 ephemeral UI가 어디서 섞이는가'],
    ['src/components/PromptInput/PromptInput.tsx', 'input mode/key handler', '표시 문자열과 submit payload가 같은가'],
    ['src/context', 'provider value와 command', 'projection이 domain state를 복제하는가'],
    ['src/entrypoints/sdk/coreSchemas.ts', 'public event union', '새 variant가 호환성에 어떤 영향을 주는가'],
    ['src/entrypoints/sdk/controlSchemas.ts', 'request/response id', 'late response와 disconnect를 어떻게 처리하는가'],
    ['src/services/mcp/normalization.ts', 'name/schema/result mapping', 'external server identity를 보존하는가'],
    ['src/services/plugins/PluginInstallationManager.ts', 'install/update lifecycle', '새 executable capability의 provenance는 무엇인가'],
    ['src/tools/AgentTool/runAgent.ts', 'child config/result', 'parent보다 넓은 authority를 갖지 않는가'],
  ],
})

Object.assign(report6, {
  mechanisms: [
    { name: 'compile-time intrinsic', runtime: 'bundler가 표현을 상수로 치환하고 도달 불가능 branch를 제거한다.', use: 'feature()와 MACRO가 배포 variant를 만든다.', trap: 'runtime flag처럼 생각하면 누락 모듈을 나중에 켤 수 있다고 오해한다.' },
    { name: 'dead-code elimination', runtime: '정적으로 false인 branch와 참조를 bundle에서 제거한다.', use: '내부 전용 기능을 외부 npm artifact에서 제외한다.', trap: '복원 source의 dangling import만으로 제거된 구현을 재구성할 수 없다.' },
    { name: 'ESM module graph', runtime: 'static import가 bundle resolution과 side-effect order를 결정한다.', use: 'entrypoint와 provider/service dependency를 구성한다.', trap: 'false branch 안 import도 도구에 따라 resolution될 수 있어 stub이 필요해진다.' },
    { name: 'configuration precedence', runtime: '여러 source의 value를 정해진 우선순위와 validation으로 합친다.', use: 'default/user/project/managed 설정이 effective behavior를 만든다.', trap: 'object spread만 남기면 값의 source와 override 불가 이유가 사라진다.' },
    { name: 'idempotent migration', runtime: '같은 변환을 반복해도 한 번 적용한 것과 같은 durable state를 만든다.', use: 'model alias와 설정 key의 역사적 의미를 새 버전으로 옮긴다.', trap: '부분 write와 복합 설정 분해가 원자적이지 않으면 중간 상태가 남는다.' },
    { name: 'batched telemetry exporter', runtime: 'event를 buffer·batch·retry하고 실패 데이터를 disk에 보존한다.', use: '운영 분석을 network 장애 뒤에도 전달한다.', trap: '신뢰성이 높아질수록 privacy·retention surface도 넓어진다.' },
  ],
  sourceIndex: [
    ['README_KR.md', '출처/누락/통계', 'repository 주장과 직접 측정이 일치하는가'],
    ['scripts/prepare-src.mjs', 'in-place transform', '연구 source provenance를 바꾸는가'],
    ['scripts/build.mjs', 'copy/transform/stub', 'build 성공과 semantic equivalence를 구분하는가'],
    ['stubs/bun-bundle.ts', 'feature fallback', '원래 build-time value의 evidence인가 단지 도구인가'],
    ['src/utils/settings', 'merge/source metadata', 'effective value의 provenance가 남는가'],
    ['src/migrations', 'version transform', 'idempotency와 partial failure를 다루는가'],
    ['src/services/analytics/metadata.ts', '공통 metadata', '진단 목적에 비해 collection이 최소인가'],
    ['docs/ko', 'symbol-led claims', '관찰과 production/roadmap 추론이 분리되는가'],
  ],
})

const visuals = {
  'async generator는 turn의 시간을 타입에 넣는다': { kind: 'code', title: 'AsyncGenerator가 표현하는 producer ↔ consumer 계약', code: 'async function* submit(input): AsyncGenerator<Event> {\n  const ctx = await prepare(input)\n  for await (const event of runTurn(ctx)) {\n    yield project(event)\n  }\n  await settle(ctx)\n}', notes: [{ label: 'await', text: 'producer 내부의 비동기 작업이 끝날 때까지 현재 재개 지점을 보존한다.' }, { label: 'yield', text: '완료가 아니라 현재 관찰 하나를 consumer에게 넘기고 suspended-yield 상태가 된다.' }, { label: 'return/throw', text: 'iterator 종료와 실패도 protocol의 일부이며 외부 effect 정리는 별도다.' }], mechanism: 'async generator 객체는 상태와 resume 요청 큐를 보유한다. Promise 하나처럼 한 번 완료되는 값이 아니라 next() 호출마다 진행되는 상태 기계다.' },
  'AbortSignal은 취소 요청이지 자동 롤백이 아니다': { kind: 'flow', title: '취소 요청이 실제 중단으로 번역되는 위치', steps: [{ title: 'UI/Host', text: '사용자가 interrupt를 요청한다.' }, { title: 'Controller', text: 'AbortController가 signal을 한 번 abort한다.' }, { title: 'Provider/Tool', text: '각 작업이 signal을 관찰하고 새 I/O를 멈춘다.' }, { title: 'Settlement', text: '이미 발생한 효과와 중단 결과를 기록한다.' }], mechanism: 'AbortSignal은 broadcast되는 상태와 사건일 뿐 thread를 강제 종료하지 않는다. listener와 I/O API가 협력해야 하며 completed write는 취소되지 않는다.' },
  '루프보다 먼저 protocol state를 찾는다': { kind: 'state', title: '한 turn의 허용 상태', states: [{ name: 'MODEL', text: 'streaming assistant blocks' }, { name: 'TOOLS', text: 'paired tool calls/results' }, { name: 'SETTLE', text: 'usage·journal·stop' }, { name: 'DONE', text: 'terminal SDK result' }], transitions: [{ when: 'tool_use', text: 'MODEL → TOOLS' }, { when: 'tool_result', text: 'TOOLS → MODEL 또는 SETTLE' }, { when: 'abort/error', text: '현재 effect 관찰 후 SETTLE' }, { when: 'stop_reason', text: 'MODEL → SETTLE → DONE' }], mechanism: 'while문은 상태 기계의 한 구현일 뿐이다. 실제 안전성은 상태별 허용 event와 tool id pairing, terminal transition에 있다.' },
  'retry와 fallback은 같은 요청의 반복이 아닐 수 있다': { kind: 'compare', title: '재시도 가능성을 가르는 commit point', headers: ['실패 시점', '이미 관찰된 것', '단순 retry 위험'], rows: [['요청 전', '없음', '상대적으로 낮음'], ['첫 delta 전', '요청 비용 가능', '중복 billing 확인 필요'], ['partial text 후', 'UI/SDK가 일부 출력 소비', '중복 assistant content'], ['tool_use 후', '외부 effect 시작 가능', '중복 실행']], mechanism: 'retry 판단은 error code만으로 결정되지 않는다. consumer-visible event와 effect 시작 여부가 시도 identity를 바꾼다.' },

  'discriminated union이 가능한 상태를 제한한다': { kind: 'code', title: 'tag가 TypeScript control-flow narrowing을 만드는 방식', code: 'type Message =\n  | { type: "assistant"; blocks: Block[] }\n  | { type: "system"; subtype: Boundary }\n  | { type: "user"; content: Content[] }\n\nif (message.type === "system") {\n  handleBoundary(message.subtype)\n}', notes: [{ label: 'type field', text: 'runtime에도 남는 식별자라 persistence와 switch 양쪽에서 쓸 수 있다.' }, { label: 'narrowing', text: '분기 안에서 해당 variant의 field만 접근하게 한다.' }, { label: 'exhaustiveness', text: 'never 검사를 쓰면 새 variant의 누락 consumer를 compile time에 찾을 수 있다.' }], mechanism: 'TypeScript 타입은 실행 시 사라지지만 tag 문자열은 남는다. 그래서 외부 JSON에는 runtime schema가, 내부 분기에는 union narrowing이 모두 필요하다.' },
  'attachment는 부가 파일이 아니라 context의 typed source다': { kind: 'flow', title: 'Attachment가 세 projection으로 갈라지는 과정', steps: [{ title: 'Typed source', text: 'image·diagnostic·task·MCP resource' }, { title: 'Policy', text: 'origin·visibility·legacy 규칙' }, { title: 'Model', text: 'provider content blocks' }, { title: 'Transcript/UI', text: '서로 다른 표시와 metadata' }], mechanism: '한 번 문자열로 평탄화하면 source type과 authority를 잃는다. 그래서 내부 union을 유지하다 consumer 경계에서 projection한다.' },
  'compact는 요약 기능이 아니라 lossy state migration이다': { kind: 'compare', title: '압축 전후에 달라지는 정보의 성격', headers: ['정보', '그대로 보존', '요약 가능', '다시 읽기 필요'], rows: [['tool_use id', '필수', '', ''], ['결정 이유', '', '조건부', ''], ['대용량 Read 결과', '', '요약/tombstone', '파일 재읽기'], ['미완료 task', '상태·id', '진행 문구', 'runtime reconcile']], mechanism: 'compaction은 reversible compression이 아니다. future action을 위한 최소 상태를 먼저 구조화하고 자연어 요약은 그 위에 둬야 한다.' },
  'resume는 저장 파일을 읽는 일이 아니라 일관된 과거를 만드는 일이다': { kind: 'flow', title: 'Resume에서 합쳐야 하는 세 가지 truth', steps: [{ title: 'Journal', text: '기록된 intent와 message order' }, { title: 'Workspace', text: '현재 파일·process·task 상태' }, { title: 'Protocol', text: 'provider가 수용할 pairing' }, { title: 'Projection', text: 'repair 사실을 보존한 model history' }], mechanism: 'load는 deserialization이고 resume는 reconciliation이다. 동일하지 않은 세 상태를 조용히 하나로 덮지 않는 것이 중요하다.' },

  'Tool 타입은 실행 가능한 capability descriptor다': { kind: 'code', title: 'Tool contract를 구성하는 네 층', code: 'type Tool<I, O> = {\n  inputSchema: Schema<I>\n  validateInput(input: I): Validation\n  checkPermissions(input: I): Decision\n  call(input: I, ctx: Context): Promise<O>\n  renderResult(output: O): View\n}', notes: [{ label: 'Schema', text: 'unknown JSON을 I로 좁히는 runtime boundary다.' }, { label: 'Policy', text: '형식이 맞는 입력이 현재 허가되었는지 별도 판단한다.' }, { label: 'Projection', text: 'model result와 human UI가 같은 O에서 다른 표현을 만든다.' }], mechanism: 'generic은 compile-time 관계를 보존하지만 JSON 입력을 검증하지 않는다. schema와 generic이 서로 다른 층을 담당한다.' },
  'buildTool은 런타임 기본값과 정적 추론을 합친다': { kind: 'code', title: 'Generic factory가 정의 D의 구체 타입을 되돌려 주는 이유', code: 'function buildTool<D extends ToolDef>(def: D): BuiltTool<D> {\n  return {\n    ...defaults,\n    userFacingName: () => def.name,\n    ...def\n  } as BuiltTool<D>\n}', notes: [{ label: 'D extends', text: '최소 shape를 요구하면서 literal name과 schema type을 잃지 않는다.' }, { label: 'spread order', text: 'def가 default를 덮어쓰므로 runtime 의미가 순서에 달려 있다.' }, { label: 'as BuiltTool<D>', text: '컴파일러에게 주는 주장이지 실행 검사가 아니다.' }], mechanism: 'TypeScript structural typing과 conditional/inferred type은 factory 호출부의 구체 타입을 보존한다. 마지막 assertion의 타당성은 contract test가 보완해야 한다.' },
  '실행 전 단계의 순서는 보안 의미를 갖는다': { kind: 'flow', title: 'processedInput이 만들어지는 실제 pipeline', steps: [{ title: 'Parse', text: 'schema로 unknown을 typed input으로 좁힌다.' }, { title: 'Backfill/Hook', text: '경로 보강과 허용된 input 수정' }, { title: 'Validate', text: '현재 상태에서 의미가 있는지 검사' }, { title: 'Permission', text: '승인된 최종 input을 결정' }, { title: 'Call', text: '동일한 input으로 effect 실행' }], mechanism: '각 단계가 새 object를 반환하는지 in-place로 바꾸는지가 중요하다. 사용자가 본 값과 call이 받은 값의 identity가 일치해야 한다.' },
  '동시성 안전성은 도구 이름이 아니라 구체 입력의 속성이다': { kind: 'state', title: '연속 tool call의 batch 분할', states: [{ name: 'PARSE', text: 'schema safeParse' }, { name: 'CLASSIFY', text: 'isConcurrencySafe(input)' }, { name: 'READ BATCH', text: 'bounded concurrent execution' }, { name: 'WRITE', text: 'single serial effect' }], transitions: [{ when: 'safe + previous safe', text: '같은 read batch에 추가' }, { when: 'unsafe', text: '단독 serial batch 생성' }, { when: 'parse/analysis error', text: '보수적으로 unsafe' }, { when: 'batch done', text: 'modifier를 deterministic order로 적용' }], mechanism: 'Promise 병렬성보다 중요한 것은 shared state에 대한 commutativity다. read-only라는 이름이 아니라 구체 effect가 순서 독립적인지 판단한다.' },
  'Edit는 read-before-write를 낙관적 잠금으로 사용한다': { kind: 'flow', title: 'FileReadState가 version token으로 쓰이는 방식', steps: [{ title: 'READ', text: 'content·timestamp·range 저장' }, { title: 'PROPOSE', text: '모델이 old/new string 제안' }, { title: 'CHECK', text: '현재 timestamp/content와 비교' }, { title: 'WRITE', text: 'stale이 아니면 patch commit' }], mechanism: 'lock을 오래 잡지 않고 commit 직전에 version을 비교하는 optimistic concurrency다. timestamp는 약한 token이라 full content fallback이 보완한다.' },
  'critical window 안의 await 하나가 TOCTOU를 다시 연다': { kind: 'code', title: 'Event loop 관점의 Edit 임계 구간', code: 'await prepareDirectoryAndHistory()\n\nconst current = readSynchronously(path)\nassertNotStale(current, lastRead)\nconst next = applyPatch(current, edit)\nwriteSynchronously(path, next)\n\nnotifyLspLater()', notes: [{ label: 'await before', text: '긴 준비 작업은 stale check 전에 끝내 내부 interleaving 창을 줄인다.' }, { label: 'sync window', text: '같은 JS thread의 다른 task에 제어를 넘기지 않는다.' }, { label: 'external race', text: '다른 process는 여전히 파일을 바꿀 수 있으므로 완전한 transaction은 아니다.' }], mechanism: 'await는 continuation을 microtask/event-loop에 예약한다. check와 use 사이 await를 넣으면 다른 task가 동일 state를 바꿀 기회가 생긴다.' },

  'deny, ask, allow는 위험 점수의 세 구간이 아니다': { kind: 'code', title: 'Boolean이 아닌 permission result algebra', code: 'type Decision =\n  | { behavior: "allow"; updatedInput?: Input }\n  | { behavior: "ask"; reason: Reason; preview?: View }\n  | { behavior: "deny"; reason: Reason }\n\nswitch (decision.behavior) { /* exhaustive */ }', notes: [{ label: 'allow', text: '안전하다는 뜻이 아니라 현재 authority 조건이 충족되었다는 뜻이다.' }, { label: 'ask', text: '사람/host의 추가 결정을 기다리는 protocol state다.' }, { label: 'deny', text: '정책상 실행하지 않으며 같은 id의 관찰을 남겨야 한다.' }], mechanism: 'discriminated union은 각 결과가 가져야 할 payload를 강제한다. number score 하나로 줄이면 authority 의미와 후속 행동이 사라진다.' },
  '규칙 출처의 precedence가 조직 정책을 실제로 만든다': { kind: 'flow', title: 'Effective permission을 만드는 source hierarchy', steps: [{ title: 'Managed', text: '조직이 강제하는 non-overridable floor' }, { title: 'Project', text: '저장소 범위 rule' }, { title: 'User', text: '개인 기본값' }, { title: 'Session', text: '현재 prompt에서의 일시 결정' }], mechanism: '단순 object spread가 아니라 source-aware merge여야 한다. 값과 함께 provenance를 유지해야 UI와 audit가 “왜”를 설명한다.' },
  'TOCTOU는 permission과 effect 사이에도 존재한다': { kind: 'flow', title: 'Path 문자열 승인만으로 부족한 이유', steps: [{ title: 'Input path', text: 'project/link/file' }, { title: 'Check', text: '허용 root 아래로 보임' }, { title: 'Mutation', text: 'symlink target 변경' }, { title: 'Use', text: '실제 target은 root 밖' }], mechanism: 'resource identity를 문자열로만 전달하면 check와 use가 다른 대상을 볼 수 있다. file descriptor·no-follow·version token이 더 강한 연결을 제공한다.' },
  'sandbox는 authority가 아니라 containment다': { kind: 'compare', title: 'Permission과 sandbox가 답하는 서로 다른 질문', headers: ['층', '핵심 질문', '실패 시 결과'], rows: [['Permission', '이 subject가 이 effect를 해도 되는가', '무권한 실행'], ['Validation', '입력이 현재 상태에서 의미 있는가', '잘못된 대상/명령'], ['Sandbox', '효과가 어디까지 퍼질 수 있는가', '피해 반경 확대'], ['Audit', '무엇이 실제로 일어났는가', '복구·설명 불가']], mechanism: '여러 control은 중복이 아니라 서로 다른 실패 모델을 가진다. 하나가 있다는 이유로 다른 층을 생략할 수 없다.' },

  'React render는 effect execution과 분리되어야 한다': { kind: 'flow', title: 'Ink 화면 갱신과 외부 effect의 경계', steps: [{ title: 'Event', text: 'engine/keyboard가 state update 요청' }, { title: 'Render', text: 'component를 순수 계산' }, { title: 'Commit', text: 'terminal diff 적용' }, { title: 'Effect handler', text: '명시적 callback이 engine command 실행' }], mechanism: 'React는 component를 다시 호출할 수 있다. render가 pure해야 동일 입력에서 중복 process/tool effect가 발생하지 않는다.' },
  'Context provider는 dependency injection이면서 rerender boundary다': { kind: 'state', title: 'Provider value가 만드는 두 가지 결합', states: [{ name: 'OWNER', text: 'state와 command 생성' }, { name: 'PROVIDER', text: 'subtree에 value 전달' }, { name: 'CONSUMER', text: 'slice를 읽어 render' }, { name: 'EFFECT', text: 'command로 owner 변경' }], transitions: [{ when: 'value identity change', text: 'consumer rerender' }, { when: 'command()', text: 'owner state transition' }, { when: 'wide value', text: '불필요한 consumer까지 갱신' }, { when: 'duplicated state', text: 'canonical/projection drift' }], mechanism: 'Context는 전역 변수 대체재이지만 domain boundary를 자동 생성하지 않는다. read model과 command port를 나눠야 ownership이 선명해진다.' },
  'SDK message는 내부 event의 공개 projection이다': { kind: 'flow', title: 'Internal event에서 public SDK contract로', steps: [{ title: 'Core event', text: 'rich internal message/state' }, { title: 'Redaction', text: 'private·unstable field 제거' }, { title: 'Schema', text: 'versioned public union 검증' }, { title: 'Host', text: 'progress/control/result 소비' }], mechanism: 'projection은 복사가 아니라 안정성 경계다. 내부 field를 그대로 노출하면 리팩터링이 public breaking change가 된다.' },
  'MCP adapter는 외부 capability를 Tool 언어로 번역한다': { kind: 'flow', title: 'MCP server에서 내부 Tool까지', steps: [{ title: 'Discover', text: 'server capability와 schema 수신' }, { title: 'Normalize', text: '이름·identity·content mapping' }, { title: 'Register', text: '현재 tool pool에 반영' }, { title: 'Authorize', text: 'local permission을 별도 적용' }, { title: 'Project', text: 'result를 message/UI로 변환' }], mechanism: 'protocol interoperability와 local trust는 별개다. 외부 schema는 runtime validation 입력이지 authority 증거가 아니다.' },
  'AgentTool은 새 conversation engine을 여는 도구다': { kind: 'state', title: 'Parent와 child runtime의 경계', states: [{ name: 'PARENT', text: 'outer context·budget' }, { name: 'SPAWN', text: 'agent config projection' }, { name: 'CHILD', text: '독립 message/tool loop' }, { name: 'RESULT', text: 'summary·effect evidence' }], transitions: [{ when: 'tool_use', text: 'parent가 child request 생성' }, { when: 'progress', text: 'task projection만 parent에 전달' }, { when: 'complete', text: 'bounded result 합류' }, { when: 'cancel', text: 'child signal과 task status reconcile' }], mechanism: '함수 호출 stack이 아니라 중첩된 state machine이다. child context isolation이 shared filesystem effect까지 격리하지는 않는다.' },

  'feature()는 runtime if가 아니라 build-time variability다': { kind: 'code', title: 'Build-time gate가 module graph를 바꾸는 방식', code: 'if (feature("INTERNAL_MODE")) {\n  const module = require("./internal/worker")\n  start(module)\n}\n\n// external build\nfeature("INTERNAL_MODE")  →  false\nfalse branch               →  removed', notes: [{ label: 'constant folding', text: 'bundler가 feature 호출을 상수로 치환한다.' }, { label: 'DCE', text: '도달 불가능한 branch와 module reference가 bundle에서 사라진다.' }, { label: 'reconstruction', text: '남은 import 이름은 구현 내용을 복구하는 evidence가 아니다.' }], mechanism: 'compile-time intrinsic은 프로그램 실행 전에 module graph를 바꾼다. runtime flag와 달리 배포 후 값을 바꿔도 제거된 code는 돌아오지 않는다.' },
  'prepare와 build script는 서로 다른 복원 전략을 보인다': { kind: 'compare', title: '두 스크립트의 source mutation 차이', headers: ['경로', '대상', '효과', '분석 위험'], rows: [['prepare-src', 'src/**', 'Bun import/MACRO 직접 치환', '원본 snapshot 변형'], ['build', 'build-src/**', '복사본 transform', '비교적 provenance 보존'], ['stub loop', 'missing paths', '빈 module 생성', 'semantic equivalence 아님']], mechanism: '빌드 성공은 syntax/module closure의 증거일 수 있지만 누락 구현의 behavior를 증명하지 않는다.' },
  'feature flag 이름보다 evaluation site를 읽는다': { kind: 'flow', title: 'Flag의 실제 의미를 찾는 추적 순서', steps: [{ title: 'Definition', text: 'default와 source' }, { title: 'Evaluation', text: 'build/start/turn/call 중 시점' }, { title: 'Call site', text: '켜질 때 생기는 capability' }, { title: 'Fallback', text: 'unknown/off/stale의 행동' }, { title: 'Observation', text: '어떤 event로 확인 가능한가' }], mechanism: 'flag 이름은 의미를 소유하지 않는다. evaluation time과 fallback이 실제 availability·safety semantics를 결정한다.' },
  'analytics pipeline은 event 생산과 sink를 분리한다': { kind: 'flow', title: '운영 event가 전송될 때까지', steps: [{ title: 'Produce', text: 'domain event와 correlation id' }, { title: 'Enrich', text: '공통 environment metadata' }, { title: 'Buffer', text: 'batch·size·time window' }, { title: 'Persist/Retry', text: '실패 event를 disk에 보존' }, { title: 'Sink', text: '1P/Datadog별 policy' }], mechanism: 'reliable delivery는 data minimization과 별도 품질이다. retry와 disk persistence가 강화될수록 retention과 access review가 더 중요해진다.' },
  '큰 파일은 책임 분포를 찾는 지도이지 자동 분해 명령이 아니다': { kind: 'compare', title: '같은 “큰 파일”에 다른 분해 기준이 필요한 이유', headers: ['파일', '중심 성격', '좋은 seam'], rows: [['main.tsx', 'composition', '초기화 산출물과 mode'], ['query.ts', 'state machine', 'transition/settlement owner'], ['REPL.tsx', 'projection controller', 'read model과 command'], ['claude.ts', 'provider adapter', 'normalization/retry boundary']], mechanism: 'line count는 탐색 신호일 뿐이다. 변경 이유와 invariant가 다른데 같은 extraction 처방을 쓰면 coupling을 이동시키기만 한다.' },
}

const allReports = [report1, report2, report3, report4, report5, report6]
for (const report of allReports) {
  for (const chapter of report.chapters) {
    for (const page of chapter.pages) {
      if (visuals[page.title]) {
        page.visual = visuals[page.title]
        delete page.pseudo
      }
    }
  }
}

export const reports = allReports
