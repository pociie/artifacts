# 확장 알고리즘 서술 규격

## 1. 목적과 적용 범위

이 규격은 Architecture & Algorithms Edition에서 알고리즘을 “코드 한 조각,
상태 전이 목록, 불변조건 목록, 이론 용어”로만 설명하는 한계를 교정한다. 이
보고서에서 알고리즘은 교과서의 독립된 계산 절차만을 뜻하지 않는다. 입력을
분류하고, 여러 표현을 하나의 내부 상태로 합치고, 권한을 판정하고, 병렬 결과를
정산하고, 실패 뒤 복구 경로를 선택하는 등 **프로젝트의 다음 상태를 결정하는
구현된 판단**을 뜻한다.

독자는 한 알고리즘 설명을 읽은 뒤 적어도 다음을 자기 문장으로 다시 말할 수
있어야 한다.

- 이 계산은 현재 프로젝트의 어느 책임 안에 있으며 누가 상태를 소유하는가.
- 어떤 관찰 또는 외부 입력이 계산을 시작하고, 그 입력은 어느 경계에서
  신뢰 가능한 내부 표현으로 바뀌는가.
- 코드의 핵심 문법과 런타임 메커니즘이 어떤 상태 변화를 가능하게 하는가.
- 중간 상태, identity, ordering, lifetime 가운데 무엇이 보존되어야 하는가.
- 성공 결과뿐 아니라 실패, 중단, 지연, 재시도, 부분 commit이 어떤 상태를
  남기는가.
- 인접 subsystem은 무엇을 받아 다음 판단을 하며, 무엇은 전달받지 못하는가.
- 고정 snapshot에서 실제로 구현된 상태와 문서만으로 확정할 수 없는 상태는
  각각 무엇인가.
- 현재 선택을 유지·수정하려면 어떤 evidence를 다시 관찰해야 하는가.

이 규격은 고정된 페이지 템플릿이 아니다. 아래 단계는 **논증 의무**이고,
페이지 수, 제목, 순서, 표·코드·서술의 비율은 알고리즘의 의미에 따라 달라질 수
있다. 하나의 단계가 여러 페이지가 될 수 있고, 인과관계가 더 명확해진다면
인접 단계를 한 페이지에서 교차해 설명할 수도 있다. 다만 단계가 합쳐졌다는
이유로 그 단계의 evidence와 판정 질문이 사라져서는 안 된다.

이 보고서의 목적은 algorithm correctness를 형식적으로 증명하는 것이 아니다.
불변조건, precondition, postcondition, 반례는 독자가 “왜 이 코드가 필요하고,
어떤 상황에서 설명이 더 이상 성립하지 않는가”를 구체적으로 이해하도록 돕는
설명 언어다. proof obligation을 모두 채웠다는 인상을 주거나 수학적 완전성을
주장해서는 안 된다. 설명의 성공은 독자가 source를 다시 읽고 현재 시스템의
상태를 재구성하며, 낯선 failure나 변경에도 같은 질문을 적용할 수 있는지로
판정한다.

## 2. 입력과 증거 경계

서술자는 다음 입력만으로 현재 상태를 구성한다.

1. `content/source-profile.json`이 고정한 repository, revision, observation date.
2. 고정 clone의 실제 source와 repository-authored document.
3. `content.mjs`의 현재 report corpus와 source range.
4. `engineering/operation-binding.md`가 정한 source·inference·recommendation·
   unknown 경계와 비목표.
5. 동일 frozen build의 manifest, HTML, PDF, preview와 이들의 digest.

코드가 보여 주지 않는 upstream 의도, 운영 환경의 실제 feature 값, server-side
contract, telemetry backend 결과는 추측으로 메우지 않는다. 이름이나 주석은
유용한 단서이지만 단독으로 동작 보장을 증명하지 않는다. README나 설계 문서의
설명과 code path가 다르면 둘을 섞어 평균적인 결론을 만들지 말고, 문서가
주장하는 상태와 snapshot이 구현하는 상태를 병렬로 기록한다.

## 3. 네 가지 판정 언어

각 의미 있는 문단은 다음 네 판정 중 하나로 읽힐 수 있어야 한다. 배지는 시각적
보조 수단이며, 실제 구분은 문장 안의 evidence와 동사로 유지한다.

### 관찰됨 · OBSERVED

고정 revision의 source range, type declaration, configuration, repository 문서,
manifest 또는 실행 없이 계산 가능한 정적 관계가 직접 뒷받침한다. 문단에는
파일과 줄 범위, 관찰한 symbol이나 branch, 그 값이 바뀌는 지점을 적는다.
“코드가 존재한다”와 “production에서 활성화된다”를 같은 관찰로 쓰지 않는다.

### 해석 · INFERENCE

둘 이상의 관찰을 연결해 owner, 의도 가능한 효과, 구조적 위험을 설명한다.
문단에는 관찰 A와 관찰 B가 어떤 전제로 연결되는지, 그 연결을 깨뜨릴 반례가
무엇인지 적는다. 이름이 비슷하거나 호출 순서가 인접하다는 사실만으로 소유권과
보장을 추론하지 않는다.

### 제안 · RECOMMENDATION

현재 code path를 평가한 뒤 미래의 test, refactoring, instrumentation, type 또는
protocol 변경을 제안한다. 현재 구현의 설명과 같은 시제로 쓰지 않으며, 무엇을
개선하는지와 어떤 새 trade-off를 만드는지 함께 적는다.

### 확인 불가 · UNKNOWN

현재 admitted evidence로 결정할 수 없는 활성화 값, 외부 server contract, 실제
부하, upstream 개발 이유를 명시한다. UNKNOWN은 빈칸이 아니라 경계 기록이다.
확정하려면 필요한 evidence와 그것을 얻더라도 바뀌지 않는 현재 관찰을 함께
적는다.

## 4. 텍스트 표현의 기본 단위

좋은 설명은 키워드 네 개를 나열한 문장이 아니라 다음 관계를 하나의 짧은
논증으로 만든다.

> **주장 → 근거 → 메커니즘 → 프로젝트 결과 → 보장 경계**

예를 들어 “직접 property mutation을 사용한다”는 관찰만으로는 부족하다.
어떤 object가 이미 어느 queue에 전달됐고, queue가 어느 시점에 serialize하며,
replacement가 왜 reference identity를 끊고, 그 결과 usage와 stop reason이 어느
projection에서 달라지는지를 이어 써야 한다. 이때 JavaScript aliasing은 배경
지식이고, transcript consistency는 프로젝트 책임이며, lazy serialization
timing은 보장 경계다.

한 문단은 하나의 중심 질문을 해결한다. 다음 문단은 앞 문단의 결론 중 identity,
state, completion 가운데 무엇을 전제로 받는지 첫 문장에 드러낸다. 절차를
순서대로 적을 필요가 없는 주제에서 억지로 “첫째, 둘째”를 사용하지 않는다.
반대로 ordering이 correctness를 좌우하면 순서를 숨기지 않고 각 전이 전후의
상태를 이름으로 쓴다.

코드 발췌는 장식이나 존재 증명이 아니다. 발췌 앞에서는 독자가 찾아야 할
결정점을 제시하고, 발췌 뒤에서는 다음 네 층을 분리해 해설한다.

- **표현 층:** discriminated union, generic, closure, ref, async generator,
  reference mutation, timer, abort signal처럼 언어가 제공하는 표현.
- **런타임 층:** event loop, suspension, batching, aliasing, serialization,
  filesystem 또는 network I/O에서 실제로 일어나는 동작.
- **프로젝트 층:** 그 메커니즘을 사용해 보존하려는 message identity, authority,
  transcript truth, UI projection, effect settlement 같은 책임.
- **경계 층:** 타입이나 문법이 자동으로 보장하지 않아 test, ordering, single
  writer, read-back 또는 telemetry가 추가로 필요한 부분.

## 5. 결정적 코드 전에 놓는 선행 지식과 예제

결정적인 source를 처음부터 제시하면 숙련자는 symbol을 따라갈 수 있지만,
학습자는 왜 그 branch와 mutation이 중요한지 판단할 기준이 없다. 반대로 이론을
길게 소개한 뒤 코드로 돌아오지 않으면 배경지식은 독립된 교양 설명이 된다.
따라서 복잡한 algorithm은 다음의 **학습 경사**를 따라 설명한다. 이 순서는
페이지 template가 아니라 독자가 필요한 개념을 얻는 순서다.

### 문제 경험에서 시작한다

먼저 사용자가 관찰할 수 있는 현상이나 다음 subsystem이 내려야 하는 결정을
제시한다. 예를 들어 streaming reconstruction은 “문자열을 합친다”가 아니라
“text는 먼저 보이지만 tool input은 완성 전 실행되면 안 되고, usage는 늦게 와도
transcript에 남아야 한다”는 서로 다른 완료 시점의 문제다. 이 문장이 이후의
index accumulator, tagged variant, reference mutation이 필요한 이유를 만든다.

### 필요한 언어 개념만 먼저 가르친다

source에 등장하는 문법을 모두 설명하지 않는다. 독자가 결정점을 이해하는 데
필요한 메커니즘을 작은 독립 예제로 먼저 보인다. 예제는 실제 코드와 같은
semantic pressure를 가지되 project-specific branch를 제거해 한 번에 하나의
개념만 관찰하게 한다.

예를 들어 reference identity가 중요한 코드는 다음 차이를 먼저 보여 줄 수 있다.

```ts
const queued = { message: { usage: 0 } }
const heldByQueue = queued.message

queued.message.usage = 7
// heldByQueue.usage === 7: 같은 object를 수정했다.

queued.message = { ...queued.message, usage: 9 }
// heldByQueue.usage === 7: 새 object 대입은 이미 전달된 reference를 바꾸지 않는다.
```

이 예제의 목적은 mutation을 일반적으로 권장하는 데 있지 않다. queue가 이미 잡은
identity와 late update를 연결해야 하는 특정 상황에서 replacement가 왜 다른
의미가 되는지 보여 주는 것이다. 다음 페이지에서 실제 transcript queue와
`message_delta` code로 돌아와야 예제가 프로젝트 설명이 된다.

### 이론은 이름이 아니라 질문으로 소개한다

관련 이론은 정의와 키워드 목록이 아니라 source를 다시 읽는 질문으로 바꾼다.

- **상태 기계**는 “몇 단계인가”를 묻기보다 가능한 state와 event, 허용되지 않는
  transition, terminal reason을 구분하게 한다. async stream에서는 content가
  보이는 상태와 metadata가 확정된 상태를 분리하는 데 쓰인다.
- **tagged union**은 type 이름을 분류하는 용어가 아니라 tag가 어떤 illegal
  combination을 제거하고, network input에서는 왜 runtime validation이 여전히
  필요한지 묻게 한다.
- **referential integrity와 identity**는 값이 같아 보이는 두 object가 queue,
  transcript, UI에서 같은 logical message인지 묻게 한다.
- **capability attenuation**은 tool 목록이 적다는 관찰을 넘어 child execution이
  어떤 effect를 행사할 수 있고 inherited context가 권한을 다시 넓히지 않는지
  묻게 한다.
- **optimistic concurrency**는 compare-before-write라는 이름보다 처음 관찰한
  version과 commit 직전 world가 달라질 때 누가 충돌을 발견하고 어떤 state를
  남기는지 묻게 한다.

각 이론 설명에는 “이 이론이 현재 code에서 밝혀 주는 것”과 “이 이론만으로
증명되지 않는 것”이 함께 있어야 한다. 빈도나 권위 있는 이름은 구현의 의도를
증명하지 않는다.

### 작은 event trace로 오개념을 드러낸다

여러 시간축이 만나는 algorithm은 최소 example trace를 둔다. A39라면 다음과
같은 가상 event를 사용할 수 있다.

```text
message_start             -> envelope, usage=0
content_block_start[0]    -> tool input accumulator=""
input_json_delta[0]       -> "{\"path\":"
input_json_delta[0]       -> "\"a.ts\"}"
content_block_stop[0]     -> 이제 JSON parse와 canonical message yield 가능
message_delta             -> 이미 yield된 message에 final usage/stop reason 정산
```

이 trace는 event 순서를 외우게 하는 표가 아니다. 첫 delta에서 JSON을 parse하면
왜 실패하는지, stop과 message_delta가 왜 서로 다른 completion인지, late mutation이
왜 필요한지를 독자가 예상하게 한다. 그런 다음 실제 source에서 같은 decision을
찾게 한다.

### 실제 코드로 돌아와 차이를 설명한다

독립 예제와 실제 project code가 같은 점뿐 아니라 다른 점도 적는다. 실제 A39에는
text, thinking, connector, advisor, error telemetry, idle watchdog가 함께 있고,
provider SDK의 중복·mutation behavior도 방어한다. 따라서 예제가 설명한 identity
하나만으로 전체 algorithm을 설명했다고 말할 수 없다. 배경지식은 source reading의
입구이지 대체물이 아니다.

### 통찰이 누적되는 읽기 순서

한 권 안에서도 독자는 점차 더 넓은 모델을 얻어야 한다. 먼저 관찰 가능한 한
문제를 이해하고, 작은 runtime mechanism을 배우고, 실제 transition을 읽고,
주변 owner와 effect를 연결하고, failure 뒤 남는 state를 본 뒤, 마지막에 현재
system snapshot을 재구성한다. 뒤 절은 앞 절의 결론을 반복 요약하지 않고 다음
범위의 질문을 풀기 위한 전제로 사용한다. 이 누적이 없으면 상세한 문단이 많아도
독자는 독립된 사실 목록만 얻게 된다.

## 6. 확장 서술의 열한 단계

### 단계 A · 독자의 상황과 결정 질문

알고리즘 이름을 정의하기 전에, 이 계산이 없거나 틀렸을 때 사용자가 무엇을
잘못 보거나 시스템이 어떤 결정을 할 수 없게 되는지 실제 상황으로 연다. 입력을
받은 시점과 외부 effect가 확정된 시점을 혼동하지 않는 질문이어야 한다.

- 필수 evidence: 연결되는 UI·CLI·provider·tool·storage 표면 중 최소 하나와
  해당 표면의 source range.
- 허용 판정: 관찰된 진입점, 관찰을 연결한 해석, 확인 불가한 실제 활성화 값.
- 실패 기준: “안정성을 높인다”, “데이터를 처리한다”처럼 대상 state와 실패
  결과가 없는 문장.

### 단계 B · 현재 구조 안의 좌표와 소유권

파일 위치보다 composition root, caller, callee, port/adapter, state owner,
consumer의 관계를 설명한다. 함수가 계산을 수행한다는 사실과 그 함수가 state
lifetime을 소유한다는 주장을 구분한다. shared object, ref, queue, journal처럼
여러 주체가 같은 값을 볼 때에는 writer와 reader를 각각 적는다.

- 필수 evidence: 정의 위치, 최소 한 caller 또는 consumer, 전달되는 context나
  return/yield representation.
- 허용 판정: import/call/type 관계는 관찰, ownership은 근거를 연결한 해석일 수
  있다.
- 현재 상태 기준: reader가 “이 algorithm을 바꾸면 어느 volume의 어느 인접
  subsystem이 영향을 받는가”를 답할 수 있어야 한다.

### 단계 C · 의미 있는 입력과 표현 변환

parameter 이름을 복사하지 말고 각 입력의 origin, trust, identity, version,
optional/partial 상태를 설명한다. 같은 사실이 provider event, canonical message,
UI state, transcript record로 바뀐다면 어떤 정보가 추가·손실·지연되는지 적는다.

- 필수 evidence: type/schema 또는 branch와 실제 변환 코드.
- 허용 판정: type이 표현하는 가능성은 관찰, 실제 production value는 별도
  evidence가 없으면 UNKNOWN.
- 실패 기준: `input`, `state`, `result`처럼 domain meaning 없는 이름만 남는 표.

### 단계 D · 언어·런타임 메커니즘

결정적인 문법이 무엇을 해 주고 무엇을 해 주지 않는지 설명한다. syntax를
쉬운 말로 치환하는 데서 끝내지 말고 frame, reference, task, queue, iterator,
timer, file descriptor 같은 runtime entity의 lifetime을 드러낸다.

- 필수 evidence: 실제 표현이 포함된 code line과 그 표현 뒤의 runtime rule.
- 허용 판정: language mechanism은 일반 설명이 가능하지만, 프로젝트가 그
  mechanism에 맡긴 책임은 별도의 source 연결이 있어야 한다.
- 실패 기준: “yield는 여러 번 반환한다”, “state setter가 값을 바꾼다”처럼
  completion, scheduling, frame 또는 observation timing을 제거한 설명.

### 단계 E · 상태 공간과 전이 서사

절차 목록 대신 state의 의미를 먼저 고정한다. 초기 상태, 가능한 중간 상태,
terminal 상태, error/abort/timeout 상태를 이름 붙이고 event 또는 condition이
어느 전이를 허용하는지 쓴다. 모든 source statement를 순서대로 번역할 필요는
없지만 correctness를 결정하는 branch와 ordering은 빠뜨리지 않는다.

- 필수 evidence: transition을 실제로 만드는 assignment, mutation, yield,
  return, throw, append, replace 또는 effect call.
- 허용 판정: observed transition과 inferred abstract state를 구분한다.
- 현재 상태 기준: 같은 event를 두 번 받음, 중간 중단, late event, stale state
  중 최소 하나를 대입해 다음 state를 설명할 수 있어야 한다.

### 단계 F · 데이터·제어·effect의 교차

알고리즘이 순수 계산인지, control decision인지, 외부 effect를 시작하는지,
이미 시작된 effect를 정산하는지 구분한다. permission, hook, sandbox, abort,
retry가 개입하면 “호출됨”과 “허용됨”, “commit됨”과 “관찰됨”을 다른 상태로
기록한다.

- 필수 evidence: effect boundary 또는 다음 subsystem handoff.
- 허용 판정: commit 여부가 source만으로 불명확하면 UNKNOWN으로 남긴다.
- 실패 기준: function return을 system completion으로 자동 승격하는 설명.

### 단계 G · 보장을 이해하기 위한 논증과 반례

불변조건을 선언하는 데서 끝내지 않고, 어느 전이가 그것을 보존하고 어떤
반례가 깨뜨리는지 설명한다. 이것은 formal proof를 완성하려는 절이 아니라
정상 예제만으로 보이지 않는 코드의 필요성을 드러내는 절이다.
precondition·working invariant·postcondition은 유용하지만 전체 설명을 대체하지
않는다. identity, pairing, ordering, authority, at-most-once/at-least-once,
durability 중 해당하는 보장 언어를 사용한다.

- 필수 evidence: 불변조건마다 supporting branch 또는 check, 반례마다 관찰
  가능한 잘못된 state.
- 허용 판정: code check가 만드는 국소 보장과 end-to-end 보장을 구분한다.
- 현재 상태 기준: reader가 “어떤 test가 이 주장을 falsify하는가”를 답할 수
  있어야 한다.

### 단계 H · 운영, 관찰, 실패 후 상태

log·metric 이름을 나열하지 말고 어떤 decision을 관찰할 수 있게 하는지 쓴다.
timeout, retry, fallback, cleanup, replay, reconciliation이 있으면 terminal reason과
남은 resource/effect를 설명한다. 오류 UI가 떴다는 사실과 rollback이 완료됐다는
주장을 분리한다.

- 필수 evidence: log/metric/receipt/recovery branch 또는 그 부재.
- 허용 판정: instrumentation 존재는 관찰, 실제 backend 수집과 alert 운용은
  evidence가 없으면 UNKNOWN.
- 실패 기준: error path를 “예외를 처리한다” 한 문장으로 닫는 설명.

### 단계 I · 주변 설계와 변경 파급

현재 algorithm이 왜 이 module 또는 adapter에 있고, 어떤 representation을
경계 밖으로 노출하며, 변경 시 어느 consumer contract가 깨지는지 서술한다.
구조 개선을 제안할 때에는 이동할 책임과 남겨 둘 책임, migration seam,
verification oracle을 적는다.

- 필수 evidence: 최소 두 인접 owner 사이의 handoff와 현재 public/internal
  boundary.
- 허용 판정: 현재 구조는 관찰·해석, 더 나은 구조는 RECOMMENDATION.
- 실패 기준: “reducer로 분리”, “모듈화”처럼 새 owner와 검증 방법이 없는 제안.

### 단계 J · 현재 시스템 상태의 재구성

앞선 논증을 한 문단 요약으로 줄이지 않는다. 대신 다음 형식의 상태 장부를
서술형으로 완성한다.

- 지금 실제로 존재하고 작동 경로가 확인된 것.
- feature/configuration 조건 때문에 존재하지만 활성화는 확정할 수 없는 것.
- late, partial, failed, cancelled 상태에서 남는 값과 effect.
- 이 snapshot 밖의 server·운영·upstream 정보라 확인할 수 없는 것.
- 다음 변경자가 먼저 재검증해야 할 source, test, runtime observation.

이 단계가 끝나면 독자는 현재 구현을 이상적인 설계와 혼동하지 않고, 동시에
코드 조각을 전체 시스템이라고 오해하지 않아야 한다.

### 단계 K · 학습 전이와 재검증 질문

마지막에는 내용을 다시 요약하지 않고 새 사례에 적용할 질문을 둔다. 질문은
source line을 다시 찾게 하고, 다른 input 또는 failure를 대입하게 하고, 변경 뒤
어떤 보장이 달라지는지 설명하게 해야 한다.

- 필수 evidence: 이 알고리즘의 실제 symbol, state 또는 invariant를 포함한 질문.
- 실패 기준: 본문을 읽지 않아도 일반론으로 답할 수 있는 질문.

## 7. 구조·요소·설계를 문장으로 표현하는 법

### 구성요소

“A가 B를 호출한다”로 끝내지 않는다. A가 어떤 결정을 소유하고, B에 어떤
representation을 넘기며, B의 completion 가운데 무엇을 다시 관찰하는지 쓴다.
호출 방향과 책임 방향이 다르면 그 차이를 명시한다.

### 데이터 구조와 type

field 목록 대신 각 field가 구분하는 상태를 쓴다. tagged union이라면 tag가
불가능한 조합을 얼마나 제거하는지, runtime input이 type boundary를 우회할 때
어떤 validation이 다시 필요한지 설명한다. generic은 이름만 소개하지 않고
입력과 출력 사이의 관계를 어느 call site까지 보존하는지 추적한다.

### 동시성·stream·queue

시간 순서만 그리지 말고 producer와 consumer가 각각 언제 값을 관찰하는지,
buffer 또는 shared reference가 어떤 state를 보존하는지, terminal과 cancellation이
어떻게 합류하는지 쓴다. 병렬 실행은 시작 순서, completion 순서, merge 순서를
분리한다.

### 문서와 코드의 관계

문서는 intended contract 또는 사용법의 evidence이고 코드는 snapshot의
implemented transition evidence다. 일치하면 서로 다른 종류의 근거가 같은
설명을 지지한다고 쓰고, 불일치하면 하나를 다른 하나로 교정하지 않은 채 drift를
현재 상태로 기록한다.

### 설계 결정

현재 선택, 선택이 해결하는 압력, 치르는 비용, 거부된 대안, 변경 가능한 seam을
연결한다. repository history가 없으면 과거 의도를 발명하지 않고 “현재 구조가
만드는 trade-off”로 제한한다.

## 8. anti-template guardrail

다음 현상은 단계 수를 모두 채웠더라도 실패다.

- 모든 알고리즘이 같은 제목, 같은 문장 수, 같은 네 페이지로 렌더링된다.
- source excerpt 뒤에 실제 symbol과 무관한 공통 문구가 반복된다.
- 입력·state·절차·불변조건을 표로 한 번 나열하고 설명이 끝난다.
- 이론 용어가 특정 transition이나 failure를 설명하지 않는다.
- 이론 이름과 정의를 나열했지만 독자가 실제 code를 읽기 전에 필요한 예제와
  오개념 교정이 없다.
- background section이 실제 source decision으로 돌아오지 않는다.
- 불변조건 목록이 correctness proof처럼 보이지만 적용 범위와 unknown이 없다.
- execution flow가 중요하지 않은 주제에서도 순차 도식이 본문을 대신한다.
- 코드가 긴데 발췌를 줄이는 대신 글자 크기만 줄인다.
- 페이지 여백이 남는데 코드와 본문은 물리 A4에서 읽기 어려운 크기로 유지된다.
- headline이 다음 문단과 떨어지거나 source와 해설이 서로 다른 논증처럼 고립된다.
- 한 algorithm의 첫 source page만 보고 전체 설명의 시각 품질을 판정한다.
- `OBSERVED`, `INFERENCE`, `RECOMMENDATION`, `UNKNOWN`이 배지로만 존재하고
  문장 근거가 구분되지 않는다.

서술의 길이는 단계별 quota가 아니라 설명해야 할 state와 경계의 수에서 나온다.
짧고 국소적인 deterministic mapping은 여섯 단계가 두세 페이지에 합쳐질 수
있고, provider stream·effect permission·recovery처럼 여러 시간축이 만나는
알고리즘은 더 많은 페이지가 필요하다. 긴 내용을 한 문단으로 함축하거나 글자를
줄여 페이지 수를 맞추지 않는다.

## 9. 전체 시퀀스 시각 표본 계약

시각 검토 단위는 “알고리즘 첫 페이지 PNG”가 아니라 하나의 알고리즘 논증이
시작해 현재 상태와 재검증 질문으로 닫히는 **전체 시퀀스**다.

### 표본 manifest가 가져야 할 항목

- volume과 algorithm ID.
- frozen content/build/manifest digest.
- 시퀀스 시작·끝 page 또는 안정적인 semantic selector.
- 단계 A–K 각각이 나타나는 page 목록. 한 page가 여러 단계를 맡을 수 있다.
- source, prose, table, state/relationship visual, failure/operation, current-state
  표현의 포함 여부.
- 각 image의 digest와 pixel dimensions.
- physical-A4 확인 여부와 확인 환경.

### 최소 표본 범위

1. 변경된 알고리즘은 시작부터 끝까지 전 page를 검토한다.
2. 변경되지 않은 알고리즘도 각 narrative shape마다 적어도 하나의 전체 시퀀스를
   검토한다. narrative shape는 pure mapping, stream/state machine, permission/effect,
   concurrency/merge, durability/recovery, configuration/migration을 포함한다.
3. 긴 headline, 긴 source path, 가장 많은 transition, 가장 많은 failure, 가장 긴
   current-state narrative를 가진 stress sample을 포함한다.
4. code page만이 아니라 source 해설, transition, assurance, operation, current
   state, theory/learning transfer까지 이어지는 인접 page rhythm을 확인한다.
5. 한 page라도 digest가 바뀌면 그 전체 시퀀스의 visual verdict는 stale이다.

### 시각 판정 질문

- 독자의 눈이 문제 상황에서 code decision point로 자연스럽게 이동하는가.
- code line과 그 아래 해설이 같은 spread 또는 명확한 bridge로 연결되는가.
- 줄바꿈이 type·identifier·한국어 문장의 의미 단위를 해치지 않는가.
- 표와 도식 없이도 같은 관계가 searchable prose로 남아 있는가.
- 색을 보지 않아도 status와 causal relation을 구분할 수 있는가.
- code와 본문이 physical A4에서 확대 없이 읽히는가.
- 마지막 page에서 현재 구현·unknown·recommendation의 경계가 보이는가.

## 10. frozen-build와 revision binding

이 규격이 작성될 때의 기준선은 다음과 같다. 이 값은 새 build의 acceptance가
아니라 기존 판본을 정확히 지칭하는 provenance다.

- source revision: `2ca5ddabfed5f220812ea11f029eda03b21bc4c1`
- source profile SHA-256:
  `27f1955edf206f42d286f11aa9735d70383b74bcc654cd06000e4f6afc33e7e7`
- report content SHA-256:
  `cf7f71e2a8ed5640e69c6e8cb05663dd3e6a2acf57bc44a0de368a62ad482e7e`
- builder SHA-256:
  `36a88e155a29f18351a97f464d023ff016c5fbb9ad5fc497ecb3ff213b3e3dd5`
- manifest SHA-256:
  `10a229559f08d3cc65c1b135981325cc9d714767176763cf1ebcb1fe179bc0a3`
- visual sample config SHA-256:
  `8c2e57e0c76faeddcd0c8adf7b1cca3a20e5ac25a4a46bfec6669462f9683d39`
- manifest generation time: `2026-09-20T13:06:36.370Z`
- baseline pages: `29 / 54 / 76 / 88 / 69 / 61`, total `377`

기준선 PDF digest는 다음과 같다.

| Volume | SHA-256 |
|---|---|
| 01 | `d6d1da8e0c1e898fd3c39655b0b7aaf0281835f46580f609502f8e90b50a18a9` |
| 02 | `8ff03aad4f4f6d2a67bb4cda8fc39cea6665db055dde7ec592efdfe9dd7342ab` |
| 03 | `281417c83b4fc51b2313e726d06bde46d422369d74f55bd7570d3bdafcf15df5` |
| 04 | `2da94a7f62dec1959c37db82df02fca376334556d0fc05ddc046bbf1b38e925f` |
| 05 | `5cf291036eb65c9ca9dbb82327976fd41ac054f3c63932d6d0e5c3268ee271c7` |
| 06 | `d5986926627d435fb718d5cd343a34b5a5aeeb711319d489e6062196810d5a2b` |

후속 판본은 최소한 `sourceRevision`, `sourceProfileDigest`, `contentDigest`,
`builderDigest`, `narrativeSpecDigest`, `manifestDigest`, 각 PDF digest,
`sampleManifestDigest`, `generatedAt`을 한 record에 묶는다. 이 문서 자신의 digest는
자기 참조를 피하기 위해 문서 본문에 쓰지 않고 operation handoff와 evidence
record에 기록한다. evidence lane은 digest가 모두 같은 frozen build를 가리킬 때만
visual verdict를 새 판본에 적용한다.

## 11. worked example · A39를 제한된 네 칸에서 전체 서사로 바꾸기

### 독자 상황

사용자는 한 줄씩 생성되는 답변을 즉시 보지만 provider는 완성된 message를 한
번에 보내지 않는다. `message_start`, 여러 index의 `content_block_start`, 서로
다른 variant의 `content_block_delta`, `content_block_stop`, 늦은
`message_delta`가 도착한다. 따라서 여기서 해결하는 문제는 문자열 이어 붙이기가
아니라, 아직 완성되지 않은 여러 block을 화면에 점진적으로 보이면서도 tool
input과 transcript에는 protocol-valid한 canonical message를 남기는 일이다.

### 구조와 소유권

고정 source `src/services/api/claude.ts:1940–2302`의 stream consumer가 provider
event를 받고 `partialMessage`, `contentBlocks`, `usage`, `stopReason`,
`newMessages`를 유지한다. provider SDK는 event를 생산하지만 local accumulator의
state owner는 이 consumer다. 이후 UI와 transcript는 같은 provider event를 직접
해석하지 않고 여기서 yield된 local message와 `stream_event` projection을 각자의
시간축으로 소비한다. 이 구분을 잃으면 transport detail이 모든 consumer의
protocol이 된다.

### 입력과 표현 변환

`content_block_start`는 index에 variant별 accumulator를 만든다. `tool_use`와
`server_tool_use`의 input은 완성 object가 아니라 빈 문자열에서 시작하는 JSON
조각이고, text와 thinking도 SDK가 start와 delta에서 같은 내용을 중복하거나
내부 block을 mutate할 수 있어 local empty accumulator로 다시 시작한다. 이
초기화는 데이터를 버리는 임의 동작이 아니라, 이후 delta sequence를 local
owner가 한 번만 누적한다는 규약을 만든다.

### 언어와 runtime 메커니즘

`contentBlocks[part.index]`는 index별 mutable builder이고 discriminated `type`은
각 delta가 어느 accumulator에 적용될 수 있는지 좁힌다. 하지만 TypeScript의
union은 network event의 실제 순서를 보장하지 않는다. 그래서 start 없이 delta가
오면 명시적 `RangeError`를 던지는 runtime check가 필요하다. 반대로
`message_delta`에서는 immutable replacement가 아니라 direct property mutation을
사용한다. transcript write queue가 `message.message` reference를 잡은 채 약
100ms 뒤 serialize하므로, local variable에 새 object를 대입하면 queue가 보는
identity와 분리되기 때문이다.

### 상태 전이

초기에는 `partialMessage`와 block map이 비어 있다. `message_start`가 envelope와
초기 usage를 만들고, start가 index별 accumulator를 연다. zero or more delta가
같은 index와 variant를 확인하면서 payload를 누적한다. stop은 그 block을
normalize해 assistant message를 만들고 consumer에게 yield한다. 그 뒤 도착하는
`message_delta`가 usage와 stop reason을 마지막 yielded message reference에
정산한다. 따라서 “화면에 content가 나타남”과 “message metadata가 terminal로
확정됨”은 서로 다른 상태다.

### 보장과 반례

보존해야 할 조건은 delta index에 열린 block이 존재하고, delta variant와
accumulator variant가 맞고, partial tool JSON이 stop 전에 실행 input으로
승격되지 않으며, late metadata가 transcript가 serialize할 동일 identity에
반영되는 것이다. start 없는 delta, index 재사용, partial JSON 조기 parse,
yield 직후 deep copy는 각각 다른 조건을 깨뜨린다. 마지막 반례는 content가
정상으로 보여도 transcript usage와 stop reason만 낡게 남을 수 있어 final output
비교만으로 발견하기 어렵다.

### 운영과 실패 뒤 상태

stream idle watchdog는 첫 chunk 전 TTFB와 이후 event gap을 구분하고 timer를
reset한다. timeout이 firing되면 정상 EOF와 다른 terminal reason을 handoff state로
남겨 fallback 경로가 partial message를 성공 완료로 오해하지 않게 한다. 현재
source에는 stall과 streaming error telemetry가 있지만, 실제 backend 수집과 alert
운영 여부는 이 snapshot으로 확인할 수 없다. timer cleanup이 누락되면 정상 종료
뒤 abort가 도착할 수 있고, watchdog abort를 EOF로 취급하면 incomplete block이
성공 projection으로 남을 수 있다.

### 현재 상태 장부

현재 snapshot에서 typed block accumulator, missing-block runtime error, block
completion yield, late metadata direct mutation, raw `stream_event` projection,
idle watchdog는 관찰된다. provider가 malformed sequence를 실제로 보낼 빈도,
feature-gated connector/advisor variant의 production 활성화, transcript queue timing이
모든 runtime에서 동일한지는 확인할 수 없다. reducer 분리와 property-based event
sequence test는 현재 구현 설명이 아니라 권장되는 다음 검증이다. 변경자는 먼저
`1940–2302`의 event ordering과 transcript queue의 serialization timing을 함께
재검증해야 한다.

이 예시는 같은 정보를 열한 개의 고정 카드로 만들라는 뜻이 아니다. 중요한 것은
독자가 provider event에서 UI와 transcript까지 이어지는 현재 system state를
재구성하고, 어느 문장이 관찰이며 어느 문장이 제안인지 식별할 수 있다는 점이다.

## 12. validation checklist

각 selected algorithm과 전체 판본에 다음 checklist를 적용한다. 합계 점수는
사용하지 않는다. 하나라도 필수 항목이 빠지면 해당 algorithm은 수정 대상으로
남는다.

### 의미와 evidence

- 독자 상황과 결정 질문이 구체적 state/failure를 이름 붙이는가.
- 모든 중요한 주장은 exact source 또는 repository document로 되돌아갈 수 있는가.
- code excerpt 전후에 읽을 decision point와 해설이 있는가.
- language mechanism, runtime behavior, project responsibility, guarantee boundary가
  구분되는가.
- 결정적인 source 전에 필요한 선행 지식과 최소 example이 있으며, 그 설명이
  실제 source decision으로 되돌아오는가.
- 이론이 정의 목록이 아니라 이 code에 던질 질문과 설명 범위를 제공하는가.
- 독자가 앞 절의 통찰을 이용해 뒤 절에서 더 넓은 system model을 만드는가.
- source·inference·recommendation·unknown이 문장 수준에서 구별되는가.

### 구조와 현재 상태

- definition뿐 아니라 caller/consumer와 state owner가 나타나는가.
- representation 변환에서 추가·손실·지연되는 정보가 설명되는가.
- normal, error, abort/timeout, partial/late 상태를 필요한 범위에서 다루는가.
- 인접 subsystem handoff와 변경 파급을 설명하는가.
- 현재 실제 구현, 조건부 존재, 외부 unknown, 다음 재검증 지점을 구분하는가.

### 보장과 운영

- invariant마다 보존 transition과 falsifying counterexample가 있는가.
- local type/check를 end-to-end guarantee로 과장하지 않는가.
- effect started, committed, observed, compensated를 필요한 경우 구분하는가.
- log/metric/retry/cleanup이 어떤 판단과 복구를 가능하게 하는지 설명하는가.
- current decision과 future recommendation이 다른 시제로 쓰였는가.

### 편집과 시각 검토

- 논증에 필요한 만큼 page가 확장되며 shrink-to-fit이 없는가.
- headline, code, 해설 사이에 orphan이 없는가.
- code와 prose가 physical A4에서 읽히는가.
- 표·도식의 모든 관계가 searchable prose로도 설명되는가.
- visual sample이 algorithm 전체 시퀀스와 frozen digests를 가리키는가.
- narrative shape와 stress sample coverage가 충족되는가.

## 13. material-change signal

다음 변화가 있으면 이 규격의 적용과 frozen evidence를 다시 판정한다.

- source revision 또는 `source-profile.json` 변경.
- algorithm ID, source range, input/state/invariant가 달라짐.
- content schema 또는 renderer가 narrative stages를 표현하는 방식 변경.
- page split, type size, source excerpt 정책, semantic selector 변경.
- state owner, caller/consumer, queue/serialization timing, effect boundary 변경.
- 현재 UNKNOWN을 해소하는 repository evidence가 새로 admitted됨.
- 여섯 권 taxonomy 또는 source/inference/unknown separation 변경.
- PDF, manifest, sample config 중 하나라도 digest가 frozen record와 달라짐.

변화는 이전 visual verdict를 자동으로 실패로 만들지는 않지만 새 build에 대한
적용을 중단시킨다. evidence lane은 새 digest-bound sample을 검사해 verdict를
다시 기록해야 한다.

## 14. 비목표

- target source 또는 repository-authored document를 변경하지 않는다.
- 이 규격만으로 알고리즘의 correctness가 형식적으로 증명됐다고 주장하지 않는다.
- formal proof 형식을 교육적 설명의 완료 기준으로 사용하지 않는다.
- 모든 function을 algorithm으로 승격하지 않는다.
- 모든 알고리즘을 동일한 페이지 수와 동일한 heading으로 렌더링하지 않는다.
- 외부 server, production feature value, upstream history를 추측하지 않는다.
- 이 문서를 reader-facing PDF에 그대로 삽입하지 않는다.
- visual evidence lane의 판정이나 기존 `engineering/visual-review.md` 소유권을
  대체하지 않는다.
- 현재 377쪽 판본을 새 요구사항의 acceptance라고 주장하지 않는다.

## 15. stop condition

다음 조건에서는 prose를 더 써서 공백을 감추지 않고 해당 algorithm 작업을
중단하거나 UNKNOWN으로 남긴다.

- 고정 revision 또는 source range를 재현할 수 없다.
- decisive transition을 뒷받침하는 code가 feature-excluded 또는 missing source에
  있어 현재 clone에서 확인할 수 없다.
- owner 또는 effect boundary를 결정하려면 admitted 범위 밖의 runtime/server
  evidence가 필요하다.
- code와 document가 충돌하지만 어느 쪽이 현재 authority인지 판정할 evidence가
  없다.
- 새 서술을 배치하려면 글자 축소, clipping, source omission 또는 status 경계
  삭제가 필요하다.
- visual sample이 동일 revision/content/builder/manifest/PDF digest에 묶이지 않는다.

중단 시에는 확인된 마지막 state, 남은 unknown, 필요한 다음 evidence, 기존 판본의
어느 설명을 더 이상 신뢰하면 안 되는지를 기록한다. 이것이 불완전한 설명을
완결된 알고리즘으로 보이게 만드는 것보다 우선한다.
