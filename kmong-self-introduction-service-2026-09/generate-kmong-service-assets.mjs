import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from 'playwright';

const root = path.dirname(fileURLToPath(import.meta.url));
const sourceDir = path.join(root, 'source-images');
const generatedDir = path.join(root, 'generated-images');
const renderDir = path.join(root, 'render-check');
const sampleDir = path.resolve(root, '../job-application-2026-09-ai-service-engineer');

for (const dir of [generatedDir, renderDir]) fs.mkdirSync(dir, { recursive: true });

const imageData = (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  const mime = ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : 'image/png';
  return `data:${mime};base64,${fs.readFileSync(filePath).toString('base64')}`;
};

const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');

const lines = (value) => escapeHtml(value).replaceAll('\n', '<br>');

const listing = {
  title: 'AI 활용 자기소개서 초안 작성 및 첨삭 가이드',
  oneLine: '자소서가 막막할 때, AI로 초안을 빠르게 만들고 사람의 확인 포인트까지 정리해 드립니다.',
  profile: '일상에서 문제가 생겼을 때 현재 어떤 상황에 놓여 있는지, 무엇 때문에 불편을 느끼는지, 그리고 어떤 해결이 가장 현실적인지를 먼저 고민합니다. 이를 바탕으로 AI를 활용한 정보 탐색, 문서 작성과 정리, 의사결정 지원, 업무 자동화, 아이디어 구체화 등 다양한 방식으로 문제 해결을 제공합니다. 자기소개서도 같은 방식으로 접근합니다. 지원 공고와 문항을 읽고, 경험을 질문과 구조로 정리한 뒤, 빠르게 시작할 수 있는 초안과 본인의 말로 확인할 수 있는 가이드를 함께 제공합니다.',
  description: [
    '[서비스 목적]',
    '자기소개서를 써야 하는데 첫 문장이 막막한 분, 경험은 있지만 어느 문항에 어떻게 연결해야 할지 모르겠는 분, AI에게 받은 문장을 그대로 사용하기 불안한 분을 위한 서비스입니다.',
    '',
    'AI를 활용한 정보 탐색과 문항 구조화로 초안 작성에 필요한 시간을 줄이고, 사람의 관점에서 문항 적합성, 사실 관계, 개인 기여, 면접에서 설명 가능한지를 함께 확인합니다. 글을 예쁘게 꾸미는 것보다 지원자의 경험이 어떤 문제와 선택으로 이어졌는지 읽히게 만드는 데 초점을 둡니다.',
    '',
    '[이 서비스에서 받는 것]',
    '1. 지원 공고와 자기소개서 문항을 읽고 정리한 작성 방향',
    '2. 제공해주신 경험 자료를 바탕으로 한 문항별 초안',
    '3. 지원 직무와 문항에 맞춘 5세트 작성안',
    '4. 작성안별 차이와 선택 기준에 대한 코멘트',
    '5. 초안을 본인의 말로 수정하기 위한 확인 질문과 제출 전 체크리스트',
    '',
    '[샘플 보고서의 특징]',
    '샘플 보고서에는 5개의 작성안, 15개의 문항 답변, 세트별 비교 기준, 편집 관찰 결과, 전문가 검토 코멘트, 면접 전 질문, 제출 전 확인 목록이 들어 있습니다. 같은 경험도 어떤 관점으로 묶고 어떤 순서로 설명하느냐에 따라 다르게 읽힐 수 있도록 비교 가능한 형태로 구성합니다.',
    '',
    '[AI와 사람의 역할]',
    'AI는 공고와 문항의 요구 요소를 정리하고, 경험 메모를 분류하며, 여러 초안 후보를 빠르게 만드는 보조 도구로 활용합니다. 저는 문항의 주어가 맞는지, 개인의 기여와 확인 범위가 분명한지, 면접에서 다시 설명할 수 있는지 검토합니다. 최종 사실 확인과 제출 여부는 의뢰인 본인이 결정합니다.',
    '',
    '[중요한 안내]',
    '이 서비스는 합격을 보장하거나 본인의 경험을 대신 만들어내는 대필 서비스가 아닙니다. 허위 경력과 성과 생성, 타인의 글 복제, 지원서 대신 제출, AI 탐지 회피 보장은 제공하지 않습니다. AI 사용이 제한되는 지원 전형이라면 해당 기관의 기준을 먼저 확인해 주세요.',
    '',
    '[금액 산정 및 제공 방식]',
    '금액은 문항 수, 5세트 초안의 검토 범위, 제공 자료의 범위, 수정 횟수와 희망 납기를 기준으로 산정합니다. 모든 작업은 비대면으로 진행하며 크몽 메시지를 통해 자료를 받고, 문서와 PDF 형태로 전달합니다. 작업 기간은 필요한 자료가 모두 수신된 시점부터 패키지별 3일에서 5일입니다. 문항이나 지원 직무가 크게 변경되는 경우에는 작업 전 범위를 다시 협의합니다.',
    '',
    '[이런 분께 추천합니다]',
    '자기소개서가 막막해서 시작을 미루고 있는 분, 경험은 있으나 문항별 배치가 어려운 분, 여러 초안을 비교해서 자기에게 맞는 방향을 고르고 싶은 분, 초안뿐 아니라 이후에 어떻게 고칠지에 대한 가이드가 필요한 분께 추천합니다.'
  ].join('\n'),
  process: [
    '1. 주문 전 확인: 지원 회사와 직무, 문항 수, 글자 수, 마감일을 메시지로 확인합니다.',
    '2. 자료 수신: 공고와 문항, 이력서 또는 경험 메모, 프로젝트 자료를 전달받습니다.',
    '3. 구조화: 문항이 요구하는 행동과 경험의 근거를 나누고, 부족한 사실은 확인 질문으로 정리합니다.',
    '4. 초안 작성: AI를 활용해 탐색과 구조화를 보조하고, 제공된 사실 범위 안에서 초안을 구성합니다.',
    '5. 사람의 검토: 문항 적합성, 개인 기여, 인과관계, 면접에서 설명 가능한지를 검토합니다.',
    '6. 전달과 수정: 초안과 가이드를 문서 또는 PDF로 전달하고, 패키지에 포함된 수정 범위 안에서 반영합니다.'
  ].join('\n'),
  preparation: [
    '필수: 지원 회사와 직무명, 최신 채용 공고 또는 공고 화면, 자기소개서 문항과 글자 수, 제출 마감일',
    '필수: 이력서 또는 경력·학업·프로젝트 경험 메모, 본인이 직접 수행한 역할과 확인 가능한 결과',
    '선택: 기존 자기소개서 초안, 희망하는 말투, 반드시 살리고 싶은 경험, 사용하고 싶지 않은 표현',
    '개인정보: 주민등록번호, 주소, 계좌번호, 비밀번호와 같이 작업에 필요하지 않은 정보는 보내지 마세요.',
    '최종 확인: 전달된 초안은 본인이 사실과 표현을 확인하고 본인의 말로 수정한 뒤 사용해야 합니다.'
  ].join('\n'),
  refund: [
    '취소 및 환불은 크몽 플랫폼에 고정 노출되는 기본 규정과 관련 법령을 우선 적용합니다.',
    '결제 전에는 작업 범위와 제공 자료를 확인해 주세요. 자료 수신 또는 작업 착수 전 취소 요청은 크몽 규정에 따라 접수합니다.',
    '작업 착수 후에는 실제 진행 범위, 사전 협의 내용, 전달된 작업물과 수정 가능 범위를 기준으로 크몽 정책에 따라 처리합니다.',
    '파일 누락, 파일 오류, 사전 협의 범위와 다른 결과물이 있는 경우에는 구매 확정 전에 크몽 메시지의 수정 요청으로 알려 주세요.',
    '단순 변심, 본인의 사실 확인 미완료, 지원 결과의 미달, 지원 기관의 AI 활용 정책과 같은 외부 결과는 환불 사유가 되지 않을 수 있습니다.',
    '허위 경력, 타인의 글 복제, 과제와 지원서의 대필 요청은 진행하지 않습니다.'
  ].join('\n'),
  keywords: ['자소서', '자기소개서', '첨삭', '초안작성', 'AI자소서'],
  packages: [
    { name: '5세트 초안', price: '79,000원', scope: '문항 3개 5세트 초안과 확인 질문', days: '3일', revisions: '1회', editable: '제공', review: '미포함' },
    { name: '5세트 첨삭', price: '129,000원', scope: '5세트 초안과 문항별 첨삭·선택 코멘트', days: '4일', revisions: '1회', editable: '제공', review: '면접 질문' },
    { name: '5세트 보고서', price: '199,000원', scope: '5세트와 비교형 PDF 검토 보고서·체크리스트', days: '5일', revisions: '2회', editable: '제공', review: '면접 질문·체크리스트' }
  ],
  addons: [
    ['빠른 작업', '일정 가능 여부 확인 후 24시간 단축', '+30,000원'],
    ['추가 문항', '문항 1개 추가 작성 또는 첨삭', '+20,000원'],
    ['추가 검토', '선택한 세트의 심화 코멘트와 질문', '+40,000원'],
    ['추가 수정', '패키지 포함 횟수 이후 1회', '+20,000원'],
    ['면접 질문 확장', '선택 세트 기준 예상 질문과 답변 뼈대', '+30,000원']
  ],
  faq: [
    ['시안은 몇 가지 제공되나요?', '지원하려는 직무와 자기소개서 문항에 맞춰 5세트의 작성안을 제공합니다. 같은 경험을 서로 다른 핵심 관점으로 구성해 비교할 수 있도록 합니다.'],
    ['초안이 없어도 되나요?', '가능합니다. 경험 메모, 이력서, 프로젝트 설명으로 시작할 수 있습니다. 다만 본인의 역할과 사실을 구체적으로 알려주실수록 본인 말에 가까운 초안을 만들 수 있습니다.'],
    ['AI가 자기소개서를 전부 작성하나요?', 'AI는 공고와 문항 탐색, 자료 정리, 초안 후보 작성의 보조 도구로 사용합니다. 문항 적합성과 사실 범위는 사람이 검토하고, 최종 사실 확인과 제출 여부는 의뢰인 본인이 결정합니다.'],
    ['작업은 어느 정도 소요되나요?', '필요한 자료가 모두 수신된 시점부터 기본 3일, 비교 4일, 5세트 보고서 5일 이내입니다. 마감일이 임박했다면 결제 전 가능 여부를 먼저 문의해 주세요.'],
    ['수정은 어디까지 가능한가요?', '패키지에 포함된 횟수 안에서 문항 의도, 사실 반영, 표현 보완을 진행합니다. 지원 직무나 문항이 바뀌거나 새로운 경험을 추가하는 경우에는 추가 범위를 협의합니다.'],
    ['합격을 보장하나요?', '보장하지 않습니다. 자기소개서는 지원 서류의 일부이며 전형 결과는 여러 요소에 의해 결정됩니다. 이 서비스는 빠른 초안과 설명 가능한 수정 방향을 제공하는 데 목적이 있습니다.'],
    ['샘플 보고서와 똑같이 받을 수 있나요?', '샘플은 결과물의 구조와 검토 방식 예시입니다. 실제 제공물은 의뢰인의 문항 수, 자료 범위, 선택한 패키지에 따라 페이지와 표현이 달라집니다.'],
    ['개인정보는 어떻게 보내면 되나요?', '작업에 필요한 정보만 크몽 메시지로 보내 주세요. 주민등록번호, 주소, 계좌번호와 같은 불필요한 민감정보는 가려서 전달해 주세요.'],
    ['급한 일정도 가능한가요?', '자료 수신 일정과 현재 작업량을 확인한 뒤 가능할 때만 빠른 작업 옵션을 안내합니다. 결제 전에 마감일을 알려 주세요.']
  ],
  workRequest: [
    '지원 회사와 직무명',
    '최신 채용 공고 또는 공고 링크',
    '자기소개서 문항, 글자 수, 제출 마감일',
    '이력서 또는 경험 메모와 본인의 역할',
    '기존 초안이 있다면 함께 첨부',
    '원하는 말투와 피하고 싶은 표현',
    '사용해도 되는 경험과 사실 확인이 필요한 내용'
  ]
};

const mainAssets = [
  {
    id: 'main-a',
    file: 'main-a-bg.png',
    position: 'center',
    label: 'AI 활용 자기소개서',
    title: '자소서가 막막할 때\n빠르게 시작하세요',
    sub: 'AI 초안 작성 · 사람의 확인 가이드',
    style: 'dark-left'
  },
  {
    id: 'main-b',
    file: 'main-b-bg.png',
    position: 'center',
    label: '작성안 비교형 서비스',
    title: '초안 1개가 아니라\n비교 가능한 5세트',
    sub: '문항별 초안 · 선택 기준 · 면접 전 질문',
    style: 'light-left'
  },
  {
    id: 'main-c',
    file: 'main-c-bg.png',
    position: 'center',
    label: '초안 이후까지 함께',
    title: '초안만 드리지 않습니다\n어떻게 다듬을지까지',
    sub: 'AI 보조 + 사람의 검토 + 본인 최종 확인',
    style: 'dark-left'
  }
];

const detailSlides = [
  {
    id: 'detail-01',
    kicker: '01 · 시작점',
    title: '막막한 순간에,\n바로 시작하는 자기소개서',
    lead: '경험이 없는 것이 아니라, 어떤 순서로 꺼내야 할지 막막할 때 시작하세요.',
    kind: 'steps',
    steps: ['현재 상황 정리', '문항 요구 구조화', '빠른 초안 수령'],
    note: '초안을 받은 뒤 본인의 경험과 말투로 확인하고 수정할 수 있도록 구성합니다.'
  },
  {
    id: 'detail-02',
    kicker: '02 · 제공 범위',
    title: '한 번의 주문으로\n무엇을 받게 되나요?',
    lead: '문장을 대신 써주는 것보다, 시작하고 고칠 수 있는 재료를 남기는 데 초점을 둡니다.',
    kind: 'list',
    items: [
      ['01', '공고·문항 구조화', '지원 직무가 요구하는 행동과 질문의 핵심을 정리합니다.'],
      ['02', '문항별 자기소개서 초안', '제공된 경험 자료를 바탕으로 여러 방향의 초안을 만듭니다.'],
      ['03', '작성안 비교 기준', '어떤 세트가 내 경험과 말하기에 가까운지 비교할 수 있게 합니다.'],
      ['04', '수정·면접 전 가이드', '본인의 사실 확인과 다음 수정 행동을 질문 형태로 남깁니다.']
    ],
    note: '패키지에 따라 작성안 수와 검토 범위가 달라집니다.'
  },
  {
    id: 'detail-03',
    kicker: '03 · 샘플 결과물',
    title: '샘플 보고서에서\n확인할 수 있는 것',
    lead: '실제 샘플은 초안만 나열하지 않고, 선택과 수정에 필요한 맥락을 함께 보여줍니다.',
    kind: 'samples',
    images: ['page-06.png', 'page-10.png'],
    captions: ['작성안별 편집 적합도와 점수의 의미', '한 세트의 문항별 답변과 면접 전 질문'],
    note: '샘플의 점수는 합격 예측이나 역량 인증이 아니라, 작성안의 편집 적합도를 비교하기 위한 참고 지표입니다.'
  },
  {
    id: 'detail-04',
    kicker: '04 · 작성 방식',
    title: '문장을 꾸미기보다\n경험의 순서를 만듭니다',
    lead: '읽는 사람이 이해하고, 지원자가 면접에서 다시 설명할 수 있는 흐름을 먼저 만듭니다.',
    kind: 'flow',
    flow: ['상황\n어떤 문제가 있었나', '선택\n왜 그렇게 했나', '확인\n무엇을 확인했나', '배움\n다음 행동은 무엇인가'],
    note: 'AI는 구조화와 초안 후보 생성에 사용하고, 사실과 개인 기여는 별도로 확인합니다.'
  },
  {
    id: 'detail-05',
    kicker: '05 · 투명한 역할 분리',
    title: 'AI와 사람의 역할을\n분리합니다',
    lead: '빠르게 만드는 일과 책임 있게 확인하는 일을 한 문장으로 섞지 않습니다.',
    kind: 'compare',
    left: ['공고·문항 요구 요소 정리', '경험 메모 분류', '초안 후보 여러 방향 생성', '확인 질문 초안 만들기'],
    right: ['문항의 주어와 목적 확인', '개인 기여와 사실 범위 검토', '면접에서 설명 가능한지 점검', '최종 표현과 제출 여부는 본인 확인'],
    note: 'AI가 만든 문장을 그대로 제출하지 않고, 반드시 본인의 사실과 말투로 확인해 주세요.'
  },
  {
    id: 'detail-06',
    kicker: '06 · 추천 대상',
    title: '이런 분께\n특히 잘 맞습니다',
    lead: '자기소개서를 미루게 되는 이유에 맞춰 필요한 형태를 선택할 수 있습니다.',
    kind: 'list',
    items: [
      ['A', '첫 문장을 쓰지 못하고 있다', '빈 화면을 채울 수 있는 시작점이 필요할 때'],
      ['B', '경험은 있지만 연결이 안 된다', '경험을 문항별 행동과 근거로 나누고 싶을 때'],
      ['C', 'AI 문장이 불안하다', '사실 확인과 수정 포인트를 함께 받고 싶을 때'],
      ['D', '여러 방향을 비교하고 싶다', '1개보다 3개 또는 5개 작성안을 비교하고 싶을 때']
    ],
    note: '합격 보장, 허위 경력 생성, 타인의 글 복제, AI 탐지 회피 보장은 제공하지 않습니다.'
  },
  {
    id: 'detail-07',
    kicker: '07 · 결과물 예시',
    title: '초안 다음에 무엇을\n확인해야 하는지도 남깁니다',
    lead: '샘플 보고서는 작성안 선택과 제출 전 판단까지 이어지는 문서로 구성되어 있습니다.',
    kind: 'samples',
    images: ['page-01.png', 'page-15.png'],
    captions: ['목표·맥락·처리·확인·개선의 전체 흐름', '제출 전 사실 확인과 면접 준비 체크리스트'],
    note: '실제 제공 페이지와 분량은 선택한 패키지와 의뢰인의 자료 범위에 따라 달라집니다.'
  },
  {
    id: 'detail-08',
    kicker: '08 · 진행 절차',
    title: '자료를 보내면\n이 순서로 진행합니다',
    lead: '작업 시작 전에 범위를 확인해 불필요한 왕복을 줄이고, 자료가 수신된 뒤 일정을 계산합니다.',
    kind: 'timeline',
    steps: ['자료 확인', '질문·구조화', '초안 작성', '사람의 검토', '수정·전달'],
    note: '기본 작업 기간은 자료가 모두 수신된 시점부터 패키지별 3일에서 5일입니다.'
  },
  {
    id: 'detail-09',
    kicker: '09 · 구매 전 안내',
    title: '내게 맞는 패키지를\n고르는 기준',
    lead: '문항 수와 필요한 비교 범위를 기준으로 선택해 주세요. 마감이 빠르면 결제 전에 문의해 주세요.',
    kind: 'packages',
    note: '작업 범위, 수정 횟수, 환불 기준은 크몽 등록 화면의 최신 정책과 주문 전 협의 내용을 우선합니다.'
  }
];

const sampleImage = (name) => imageData(path.join(sampleDir, 'render-check-v6', name));

const mainAssetHtml = (item) => `
  <div class="main-asset ${item.style}" data-asset="${item.id}" style="background-image:url('${imageData(path.join(sourceDir, item.file))}');background-position:${item.position};">
    <div class="main-copy">
      <div class="asset-label">${escapeHtml(item.label)}</div>
      <div class="main-title">${lines(item.title)}</div>
      <div class="main-sub">${escapeHtml(item.sub)}</div>
    </div>
    <div class="main-mark">자기소개서<br>초안·첨삭</div>
  </div>`;

const detailAssetHtml = (slide) => {
  const common = `<div class="detail-header"><div class="kicker">${escapeHtml(slide.kicker)}</div><h2>${lines(slide.title)}</h2><p>${escapeHtml(slide.lead)}</p></div>`;
  let content = '';

  if (slide.kind === 'steps') {
    content = `<div class="step-stack">${slide.steps.map((step, index) => `<div class="big-step"><span>0${index + 1}</span><strong>${escapeHtml(step)}</strong><i>→</i></div>`).join('')}</div>`;
  }

  if (slide.kind === 'timeline') {
    content = `<div class="timeline">${slide.steps.map((step, index) => `<div class="timeline-item"><span>0${index + 1}</span><strong>${escapeHtml(step)}</strong>${index < slide.steps.length - 1 ? '<i></i>' : ''}</div>`).join('')}</div>`;
  }

  if (slide.kind === 'list') {
    content = `<div class="feature-list">${slide.items.map(([number, title, copy]) => `<div class="feature-row"><span class="feature-number">${escapeHtml(number)}</span><div><strong>${escapeHtml(title)}</strong><p>${escapeHtml(copy)}</p></div></div>`).join('')}</div>`;
  }

  if (slide.kind === 'flow') {
    content = `<div class="flow-grid">${slide.flow.map((step, index) => `<div class="flow-item"><span>${index + 1}</span><strong>${lines(step)}</strong>${index < slide.flow.length - 1 ? '<i>→</i>' : ''}</div>`).join('')}</div>`;
  }

  if (slide.kind === 'compare') {
    content = `<div class="compare-grid"><div class="compare-column ai"><h3>AI 보조</h3>${slide.left.map((item) => `<p><b>+</b>${escapeHtml(item)}</p>`).join('')}</div><div class="compare-column human"><h3>사람의 확인</h3>${slide.right.map((item) => `<p><b>✓</b>${escapeHtml(item)}</p>`).join('')}</div></div>`;
  }

  if (slide.kind === 'samples') {
    content = `<div class="sample-grid">${slide.images.map((image, index) => `<figure><img src="${sampleImage(image)}" alt="샘플 보고서 ${index + 1}"><figcaption>${escapeHtml(slide.captions[index])}</figcaption></figure>`).join('')}</div>`;
  }

  if (slide.kind === 'packages') {
    content = `<div class="mini-packages">${listing.packages.map((pkg) => `<div class="mini-package"><div class="mini-package-name">${escapeHtml(pkg.name)}</div><strong>${escapeHtml(pkg.price)}</strong><p>${escapeHtml(pkg.scope)}</p><small>${escapeHtml(pkg.days)} · 수정 ${escapeHtml(pkg.revisions)}</small></div>`).join('')}</div><div class="prepare-strip"><strong>구매 전 준비</strong><span>공고 · 문항 · 글자 수 · 마감일 · 경험 자료</span></div>`;
  }

  return `<div class="detail-asset" data-asset="${slide.id}">${common}<div class="detail-body">${content}</div><div class="detail-note">${escapeHtml(slide.note)}</div><div class="asset-footer">AI 활용 자기소개서 초안 작성 및 첨삭 가이드</div></div>`;
};

const packageRows = listing.packages.map((pkg) => `<tr><th>${escapeHtml(pkg.name)}</th><td>${escapeHtml(pkg.price)}</td><td>${escapeHtml(pkg.scope)}</td><td>${escapeHtml(pkg.days)}</td><td>${escapeHtml(pkg.revisions)}</td><td>${escapeHtml(pkg.review)}</td></tr>`).join('');
const addonRows = listing.addons.map(([name, scope, price]) => `<tr><th>${escapeHtml(name)}</th><td>${escapeHtml(scope)}</td><td>${escapeHtml(price)}</td></tr>`).join('');
const faqMarkup = (items) => items.map(([question, answer]) => `<div class="faq-row"><h4>${escapeHtml(question)}</h4><p>${escapeHtml(answer)}</p></div>`).join('');

const html = `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<title>크몽 서비스 등록 제안서 · AI 활용 자기소개서 초안 작성 및 첨삭</title>
<style>
@page { size: A4; margin: 0; }
:root { --navy:#102d4f; --blue:#2f66ad; --blue2:#6c8fbd; --ink:#203044; --muted:#66778b; --line:#d7e0ea; --pale:#f2f6fa; --cream:#fbfaf7; --gold:#bd8a35; --green:#1b765c; --coral:#d77d66; }
* { box-sizing:border-box; }
html, body { margin:0; padding:0; background:#dbe2ea; color:var(--ink); font-family:Arial, "Noto Sans KR", "Apple SD Gothic Neo", sans-serif; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
body { font-size:10.5px; line-height:1.55; }
.page { width:210mm; height:297mm; margin:0 auto 8mm; padding:18mm 17mm 15mm; background:white; position:relative; overflow:hidden; break-after:page; }
.page:last-child { break-after:auto; }
.cover-page { background:linear-gradient(138deg, #f9f7f1 0%, #fff 48%, #eaf1f8 100%); }
.eyebrow, .kicker, .asset-label { letter-spacing:.12em; text-transform:uppercase; font-size:9px; font-weight:700; color:var(--blue); }
.cover-kicker { margin-top:6mm; }
h1 { color:var(--navy); font-size:31px; line-height:1.18; letter-spacing:-.05em; margin:22mm 0 7mm; }
h2 { margin:0; color:var(--navy); font-size:21px; line-height:1.25; letter-spacing:-.045em; }
h3 { color:var(--navy); margin:0; font-size:13px; }
h4 { margin:0; color:var(--navy); font-size:12px; }
p { margin:0; }
.cover-lead { width:115mm; font-size:13px; line-height:1.7; color:#465a70; }
.cover-rule { width:42mm; height:3px; background:var(--blue); margin:11mm 0 7mm; }
.cover-flow { position:absolute; left:17mm; right:17mm; bottom:55mm; display:grid; grid-template-columns:repeat(5,1fr); gap:4mm; }
.cover-flow div { min-height:28mm; background:rgba(255,255,255,.78); border-top:3px solid var(--blue); padding:4mm 3mm; box-shadow:0 3px 15px rgba(16,45,79,.06); }
.cover-flow strong { display:block; color:var(--navy); font-size:12px; margin-bottom:2mm; }
.cover-flow span { color:var(--muted); font-size:9px; line-height:1.5; }
.cover-stamp { position:absolute; right:17mm; top:24mm; border:1px solid var(--blue); color:var(--blue); padding:3mm 4mm; font-weight:700; font-size:9px; letter-spacing:.05em; }
.footer { position:absolute; left:17mm; right:17mm; bottom:8mm; border-top:1px solid var(--line); padding-top:3mm; color:#8290a0; font-size:8px; display:flex; justify-content:space-between; }
.section-head { display:flex; justify-content:space-between; align-items:flex-end; border-bottom:2px solid var(--navy); padding-bottom:4mm; margin-bottom:7mm; }
.section-head .number { font-size:32px; color:var(--blue); font-weight:700; line-height:1; margin-right:3mm; }
.section-title-line { display:flex; align-items:flex-end; gap:2mm; }
.small-caps { color:var(--muted); font-size:9px; font-weight:700; letter-spacing:.08em; }
.lead { color:#465a70; font-size:11.5px; line-height:1.7; margin-bottom:7mm; }
.callout { background:var(--pale); border-left:4px solid var(--blue); padding:5mm; color:#38516d; margin:6mm 0; }
.callout strong { color:var(--navy); }
.grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:6mm; }
.grid-3 { display:grid; grid-template-columns:repeat(3,1fr); gap:4mm; }
.info-block { border-top:2px solid var(--blue); padding-top:3mm; }
.info-block h3 { margin-bottom:2mm; }
.info-block p, .info-block li { color:#53677c; font-size:10px; line-height:1.65; }
.info-block ul { margin:0; padding-left:4mm; }
.tag-row { display:flex; flex-wrap:wrap; gap:2mm; margin-top:3mm; }
.tag { padding:1.5mm 3mm; border:1px solid #b9cce2; color:var(--blue); background:#f6f9fc; border-radius:99px; font-size:9px; font-weight:700; }
.listing-box { white-space:pre-line; background:#fbfcfd; border:1px solid var(--line); padding:5mm; color:#35495f; line-height:1.68; font-size:9.8px; }
.listing-box.tall { min-height:137mm; }
.table { width:100%; border-collapse:collapse; margin-top:4mm; font-size:9px; }
.table th, .table td { border-bottom:1px solid var(--line); padding:2.6mm 2mm; text-align:left; vertical-align:top; }
.table thead th { color:var(--navy); background:var(--pale); border-top:1px solid var(--navy); border-bottom:1px solid var(--navy); }
.table tbody th { color:var(--navy); width:27mm; }
.table .price { color:var(--green); font-weight:700; }
.note { color:var(--muted); font-size:9px; margin-top:4mm; }
.mini-note { background:#fff8eb; border-left:3px solid var(--gold); padding:3mm; color:#775d2b; font-size:9px; margin-top:4mm; }
.process-list, .prep-list { margin:0; padding:0; list-style:none; }
.process-list li, .prep-list li { padding:2.5mm 0 2.5mm 8mm; border-bottom:1px solid var(--line); position:relative; color:#445c73; }
.process-list li::before { content:'→'; position:absolute; left:1mm; color:var(--blue); font-weight:700; }
.prep-list li::before { content:'✓'; position:absolute; left:1mm; color:var(--green); font-weight:700; }
.faq-row { padding:3.5mm 0; border-bottom:1px solid var(--line); }
.faq-row p { margin-top:1.5mm; color:#53677c; font-size:9.5px; line-height:1.55; }
.url { color:var(--blue); font-size:8.5px; word-break:break-all; }
.rubric-table { width:100%; border-collapse:collapse; margin-top:4mm; }
.rubric-table th, .rubric-table td { padding:3mm 2.5mm; border-bottom:1px solid var(--line); text-align:left; vertical-align:top; }
.rubric-table th { width:29mm; color:var(--navy); }
.rubric-table td { color:#53677c; }
.score { display:inline-block; min-width:14mm; text-align:center; padding:1mm 2mm; margin-right:2mm; background:#eaf2fb; color:var(--blue); font-weight:700; border-radius:99px; }
.asset-gallery { display:grid; grid-template-columns:1fr 1fr; gap:5mm; align-items:start; }
.gallery-item { border:1px solid var(--line); background:#fafcfe; padding:2mm; }
.gallery-item img { width:100%; display:block; }
.gallery-item figcaption { color:var(--muted); font-size:8.5px; margin-top:2mm; }
.three-up { display:grid; grid-template-columns:1fr; gap:4mm; }
.three-up .main-asset { width:100%; height:65mm; }
.three-up .main-title { font-size:17px; }
.three-up .main-sub { font-size:8px; }
.main-asset { width:652px; height:488px; position:relative; overflow:hidden; background-size:cover; border-radius:3px; color:white; }
.main-asset::after { content:''; position:absolute; inset:0; pointer-events:none; }
.main-asset.dark-left::after { background:linear-gradient(90deg, rgba(8,31,57,.91) 0%, rgba(8,31,57,.72) 38%, rgba(8,31,57,.06) 75%, rgba(8,31,57,0) 100%); }
.main-asset.light-left::after { background:linear-gradient(90deg, rgba(255,255,255,.93) 0%, rgba(255,255,255,.75) 38%, rgba(255,255,255,.04) 80%); }
.main-copy { position:absolute; z-index:1; left:38px; top:58px; width:330px; }
.main-asset.light-left { color:var(--navy); }
.main-title { font-size:32px; line-height:1.18; font-weight:800; letter-spacing:-.065em; margin-top:16px; }
.main-sub { font-size:14px; line-height:1.45; margin-top:18px; color:inherit; opacity:.86; font-weight:600; }
.main-asset.light-left .asset-label { color:var(--blue); }
.main-mark { position:absolute; z-index:1; right:23px; bottom:20px; font-size:10px; line-height:1.25; letter-spacing:.08em; text-align:right; opacity:.75; font-weight:700; }
.detail-asset { width:652px; height:920px; position:relative; overflow:hidden; background:linear-gradient(135deg,#fff 0%,#fbfaf7 100%); padding:48px 46px 44px; color:var(--ink); }
.detail-asset::before { content:''; position:absolute; top:0; left:0; right:0; height:10px; background:var(--blue); }
.detail-header h2 { font-size:31px; line-height:1.16; margin-top:11px; }
.detail-header p { color:#5c6f82; font-size:13px; line-height:1.65; margin-top:18px; max-width:540px; }
.detail-body { margin-top:43px; }
.detail-note { position:absolute; left:46px; right:46px; bottom:63px; border-left:4px solid var(--gold); background:#fff8eb; padding:11px 15px; color:#775d2b; font-size:10px; line-height:1.5; }
.asset-footer { position:absolute; left:46px; right:46px; bottom:22px; border-top:1px solid var(--line); padding-top:8px; color:#8190a1; font-size:8px; letter-spacing:.04em; }
.step-stack { display:grid; gap:12px; }
.big-step { min-height:76px; display:flex; align-items:center; padding:18px 20px; background:#eef4fa; border-top:3px solid var(--blue); position:relative; }
.big-step span { color:var(--blue); font-size:18px; font-weight:800; margin-right:20px; }
.big-step strong { font-size:18px; color:var(--navy); }
.big-step i { font-style:normal; color:var(--blue); font-size:24px; margin-left:auto; }
.feature-list { display:grid; gap:0; border-top:1px solid var(--navy); }
.feature-row { display:grid; grid-template-columns:48px 1fr; gap:14px; padding:18px 0; border-bottom:1px solid var(--line); }
.feature-number { color:var(--blue); font-size:16px; font-weight:800; }
.feature-row strong { color:var(--navy); font-size:16px; }
.feature-row p { color:#607285; font-size:11px; margin-top:4px; }
.flow-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; }
.flow-item { min-height:195px; background:#f0f5fa; border-top:3px solid var(--blue); padding:18px 12px; position:relative; }
.flow-item span { display:block; color:var(--blue); font-size:14px; font-weight:800; }
.flow-item strong { display:block; white-space:pre-line; color:var(--navy); font-size:15px; line-height:1.45; margin-top:24px; }
.flow-item i { font-style:normal; position:absolute; right:-12px; top:80px; color:var(--blue); font-size:22px; z-index:2; }
.compare-grid { display:grid; grid-template-columns:1fr 1fr; gap:18px; }
.compare-column { padding:20px; border-top:4px solid var(--blue); background:#f0f5fa; min-height:270px; }
.compare-column.human { border-top-color:var(--green); background:#f1f8f5; }
.compare-column h3 { font-size:17px; margin-bottom:16px; }
.compare-column p { padding:9px 0; border-bottom:1px solid rgba(32,48,68,.12); color:#52677b; font-size:11px; }
.compare-column p b { display:inline-block; margin-right:8px; color:var(--blue); }
.compare-column.human p b { color:var(--green); }
.sample-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
.sample-grid figure { margin:0; border:1px solid var(--line); padding:5px; background:white; }
.sample-grid img { width:100%; height:356px; object-fit:cover; object-position:top; display:block; }
.sample-grid figcaption { font-size:10px; color:#53677c; line-height:1.45; padding:10px 6px 5px; }
.timeline { display:grid; grid-template-columns:repeat(5,1fr); gap:4px; }
.timeline-item { background:#eef4fa; min-height:150px; padding:14px 9px; position:relative; text-align:center; border-top:3px solid var(--blue); }
.timeline-item span { color:var(--blue); font-weight:800; font-size:13px; }
.timeline-item strong { display:block; color:var(--navy); font-size:13px; margin-top:42px; }
.timeline-item i { position:absolute; right:-10px; top:70px; width:16px; height:2px; background:var(--blue); z-index:2; }
.mini-packages { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; }
.mini-package { min-height:245px; padding:18px 13px; background:#f0f5fa; border-top:4px solid var(--blue); }
.mini-package:nth-child(2) { border-top-color:#597fb1; }
.mini-package:nth-child(3) { border-top-color:var(--green); background:#f1f8f5; }
.mini-package-name { color:var(--navy); font-weight:800; font-size:14px; margin-bottom:15px; }
.mini-package strong { color:var(--green); font-size:19px; }
.mini-package p { color:#53677c; font-size:10px; line-height:1.5; margin-top:12px; }
.mini-package small { display:block; color:var(--muted); margin-top:18px; font-size:9px; }
.prepare-strip { margin-top:28px; border:1px solid var(--line); padding:16px; display:flex; justify-content:space-between; gap:12px; background:#fff; }
.prepare-strip strong { color:var(--navy); }
.prepare-strip span { color:#5b6e81; }
.asset-sheet { display:block; position:absolute; left:0; top:0; width:652px; z-index:9999; }
@media screen { .page { box-shadow:0 4px 24px rgba(16,45,79,.14); } }
@media print { body { background:white; } .page { margin:0; box-shadow:none; } }
@media print { .asset-sheet { display:none; } }
</style>
</head>
<body>
<section class="page cover-page">
  <div class="cover-stamp">크몽 등록용 제안서 · 초안</div>
  <div class="eyebrow cover-kicker">SERVICE LISTING / SELF-INTRODUCTION</div>
  <h1>AI 활용 자기소개서<br>초안 작성 및 첨삭<br>서비스 제안서</h1>
  <div class="cover-rule"></div>
  <p class="cover-lead">막막한 순간에 빠르게 초안을 만들고, 초안 이후에 무엇을 확인하고 어떻게 고칠지까지 안내하는 서비스의 등록 문안과 이미지 시안입니다.</p>
  <div class="cover-flow">
    <div><strong>문제</strong><span>무엇부터 써야 할지 막막함</span></div>
    <div><strong>정리</strong><span>공고·문항·경험을 구조화</span></div>
    <div><strong>초안</strong><span>빠르게 비교 가능한 작성안</span></div>
    <div><strong>검토</strong><span>사실·기여·면접 설명 가능성</span></div>
    <div><strong>선택</strong><span>본인의 말로 확인하고 수정</span></div>
  </div>
  <div class="footer"><span>크몽 서비스 등록 제안서</span><span>2026.09</span></div>
</section>

<section class="page">
  <div class="section-head"><div class="section-title-line"><span class="number">01</span><h2>판매 포지셔닝과 등록 전략</h2></div><span class="small-caps">buyer decision</span></div>
  <p class="lead">이 서비스의 구매 이유를 “AI로 대신 써드립니다”가 아니라 “막막함을 줄이고, 본인이 확인할 수 있는 초안을 빠르게 받습니다”로 잡습니다. 크몽에서 구매자가 확인하는 서비스 설명, 상세 이미지, 패키지, 리뷰와 전문가 정보를 한 흐름으로 연결합니다.</p>
  <div class="grid-2">
    <div class="info-block"><h3>한 줄 포지셔닝</h3><p>${escapeHtml(listing.oneLine)}</p></div>
    <div class="info-block"><h3>핵심 구매 상황</h3><p>첫 문장이 막막함 · 경험과 문항 연결이 어려움 · AI 문장의 사실성 확인이 필요함 · 초안 이후 수정 기준이 없음</p></div>
  </div>
  <div class="callout"><strong>판매 메시지의 중심</strong><br>빠른 초안은 시작을 돕고, 검토 가이드는 초안을 본인의 말로 바꾸게 합니다. 둘을 함께 제공하는 것이 이 서비스의 차별점입니다.</div>
  <h3>검색·비교 화면에서 드러낼 신뢰 신호</h3>
  <table class="rubric-table">
    <tr><th><span class="score">01</span>문제 선명도</th><td>누가 언제 어떤 막막함을 겪는지 첫 문장과 메인 이미지에서 바로 이해됩니다.</td></tr>
    <tr><th><span class="score">02</span>결과 구체성</th><td>초안 수, 문항 수, 보고서와 가이드 제공 여부를 패키지별로 비교할 수 있습니다.</td></tr>
    <tr><th><span class="score">03</span>범위 투명성</th><td>작업 기간, 수정 횟수, 추가 요금, 의뢰인 준비사항과 제외 범위를 숨기지 않습니다.</td></tr>
    <tr><th><span class="score">04</span>사람다운 신뢰</th><td>AI 사용 범위와 최종 사실 확인 주체를 분리해, 과장된 자동 작성 서비스로 보이지 않게 합니다.</td></tr>
    <tr><th><span class="score">05</span>실물 증빙</th><td>샘플 보고서의 실제 구조, 작성안 비교, 면접 전 질문과 제출 전 체크리스트를 상세 이미지로 보여줍니다.</td></tr>
    <tr><th><span class="score">06</span>다음 행동</th><td>구매자가 공고, 문항, 글자 수, 경험 자료를 준비하면 바로 주문을 시작할 수 있습니다.</td></tr>
  </table>
  <p class="note">이 rubric은 광고 표현과 구매자 이해도를 점검하기 위한 기준입니다. 서비스 품질, 합격 가능성, 매출을 보장하는 평가가 아닙니다.</p>
  <div class="footer"><span>01 · 판매 포지셔닝과 등록 전략</span><span>크몽 등록 제안서</span></div>
</section>

<section class="page">
  <div class="section-head"><div class="section-title-line"><span class="number">02</span><h2>크몽 입력값 한눈에 보기</h2></div><span class="small-caps">listing fields</span></div>
  <div class="info-block"><h3>서비스 제목 제안</h3><p style="font-size:15px;color:var(--navy);font-weight:700;margin-top:2mm;">${escapeHtml(listing.title)}</p><p class="note">검색어를 포함하되, 결과를 과장하는 표현은 제목에 넣지 않습니다.</p></div>
  <div class="grid-2" style="margin-top:7mm;">
    <div class="info-block"><h3>주요 특징 문구</h3><p>신입 · 경력 · 학업<br>인사팀 근무 · 자기소개서 · 한국어<br>AI 활용 초안 작성 · 문항별 첨삭 · 비교형 가이드</p></div>
    <div class="info-block"><h3>검색 키워드 5개</h3><div class="tag-row">${listing.keywords.map((keyword) => `<span class="tag">${escapeHtml(keyword)}</span>`).join('')}</div><p class="note">키워드는 실제 제공 범위와 일치하는 표현만 사용합니다.</p></div>
  </div>
  <div class="info-block" style="margin-top:8mm;"><h3>전문가 소개에 넣을 핵심 문장</h3><div class="listing-box">${lines(listing.profile)}</div></div>
  <div class="mini-note"><strong>프로필·증빙 주의</strong><br>인사팀 근무, 경력, 자격, 누적 건수와 같이 구매자의 판단에 영향을 주는 이력은 실제 증빙 가능한 범위만 기재합니다. 증빙할 수 없는 경력을 이미지에 먼저 넣지 않습니다.</div>
  <div class="footer"><span>02 · 크몽 입력값 한눈에 보기</span><span>크몽 등록 제안서</span></div>
</section>

<section class="page">
  <div class="section-head"><div class="section-title-line"><span class="number">03</span><h2>서비스 설명 · 바로 붙여 넣는 본문</h2></div><span class="small-caps">description</span></div>
  <div class="listing-box tall">${lines(listing.description)}</div>
  <p class="note">특수문자 제한이 있는 입력창을 고려해 본문에는 꺾쇠 괄호와 백틱을 사용하지 않았습니다. 등록 전 실제 입력창에서 줄바꿈과 글자 수를 한 번 확인해 주세요.</p>
  <div class="footer"><span>03 · 서비스 설명</span><span>크몽 등록 제안서</span></div>
</section>

<section class="page">
  <div class="section-head"><div class="section-title-line"><span class="number">04</span><h2>서비스 제공 절차와 의뢰인 준비사항</h2></div><span class="small-caps">workflow</span></div>
  <div class="grid-2">
    <div class="info-block"><h3>서비스 제공 절차</h3><div class="listing-box" style="margin-top:3mm;">${lines(listing.process)}</div></div>
    <div class="info-block"><h3>의뢰인 준비사항</h3><div class="listing-box" style="margin-top:3mm;">${lines(listing.preparation)}</div></div>
  </div>
  <div class="callout" style="margin-top:9mm;"><strong>사람에게 이야기하듯 안내하는 문장</strong><br>초안이 아직 없어도 괜찮습니다. 메모처럼 적어둔 경험, 이력서의 한 줄, 프로젝트에서 맡은 역할만 있어도 시작할 수 있습니다. 다만 사실을 확인할 수 있는 자료가 많을수록 결과물은 더 본인의 말에 가까워집니다.</div>
  <h3 style="margin-top:9mm;">구매 전 확인 메시지 예시</h3>
  <div class="listing-box" style="margin-top:3mm;">안녕하세요. 주문 전 아래 네 가지만 확인해 주시면 작업 범위를 빠르게 안내드릴 수 있습니다.

1. 지원 회사와 직무
2. 자기소개서 문항과 글자 수
3. 제출 마감일
4. 가지고 계신 경험 자료 또는 기존 초안

초안이 없어도 괜찮습니다. 반대로 이미 작성한 글이 있다면 함께 보내주시면 초안 작성과 첨삭 중 어떤 방식이 더 적합한지 먼저 말씀드리겠습니다.</div>
  <div class="footer"><span>04 · 서비스 제공 절차와 의뢰인 준비사항</span><span>크몽 등록 제안서</span></div>
</section>

<section class="page">
  <div class="section-head"><div class="section-title-line"><span class="number">05</span><h2>가격 정보 · 패키지와 추가 옵션</h2></div><span class="small-caps">packages</span></div>
  <p class="lead">가격은 문항 수, 작성안 수, 자료량, 검토와 수정 범위, 납기를 기준으로 나눕니다. 아래 금액은 초기 등록을 위한 권장 시범 판매가이며, 실제 작업 시간과 리뷰가 쌓인 뒤 조정할 수 있습니다.</p>
  <table class="table">
    <thead><tr><th>패키지</th><th>권장가</th><th>제공 범위</th><th>기간</th><th>수정</th><th>추가 검토</th></tr></thead>
    <tbody>${packageRows}</tbody>
  </table>
  <p class="note">세 패키지 모두 비대면 문서 제공을 기본으로 하고, 제공 자료가 충분히 수신된 시점부터 기간을 계산합니다. 문항 수가 3개를 넘거나 지원 전형이 크게 달라지면 주문 전 범위를 조정합니다.</p>
  <h3 style="margin-top:9mm;">추가 가격 제안</h3>
  <table class="table"><thead><tr><th>추가 항목</th><th>제공 방식</th><th>권장 추가가</th></tr></thead><tbody>${addonRows}</tbody></table>
  <div class="mini-note"><strong>운영 팁</strong><br>처음부터 옵션을 많이 열기보다 기본 패키지 3개로 구매 결정을 단순하게 만든 뒤, 실제 문의에서 반복되는 요청만 추가 옵션으로 확장하는 편이 관리하기 쉽습니다.</div>
  <div class="footer"><span>05 · 가격 정보</span><span>크몽 등록 제안서</span></div>
</section>

<section class="page">
  <div class="section-head"><div class="section-title-line"><span class="number">06</span><h2>자주 묻는 질문과 취소·환불 안내</h2></div><span class="small-caps">trust & policy</span></div>
  <div class="grid-2"><div>${faqMarkup(listing.faq.slice(0, Math.ceil(listing.faq.length / 2)))}</div><div>${faqMarkup(listing.faq.slice(Math.ceil(listing.faq.length / 2)))}</div></div>
  <h3 style="margin-top:7mm;">취소 및 환불 규정 입력안</h3>
  <div class="listing-box" style="margin-top:3mm;">${lines(listing.refund)}</div>
  <p class="note">크몽 고객센터의 고정 규정과 관련 법령이 우선하므로, 실제 서비스 등록 화면에 표시되는 최신 문구와 충돌하지 않는지 등록 직전에 다시 확인합니다.</p>
  <div class="footer"><span>06 · 자주 묻는 질문과 취소·환불</span><span>크몽 등록 제안서</span></div>
</section>

<section class="page">
  <div class="section-head"><div class="section-title-line"><span class="number">07</span><h2>메인 이미지 초안 3가지</h2></div><span class="small-caps">652 × 488 px</span></div>
  <p class="lead">메인 이미지는 서비스의 전체 설명을 담는 곳이 아니라, 검색 결과에서 구매자의 현재 문제와 기대 결과를 2초 안에 이해시키는 첫 장면입니다. 세 안은 같은 서비스라도 서로 다른 구매 이유를 시험하도록 구성했습니다.</p>
  <div class="three-up">${mainAssets.map(mainAssetHtml).join('')}</div>
  <p class="note">권장 선택: 첫 등록은 A안으로 시작하고, 문의 내용이 “여러 시안을 보고 싶다”에 집중되면 B안, “AI 문장이 불안하다”에 집중되면 C안으로 교체 테스트합니다.</p>
  <div class="footer"><span>07 · 메인 이미지 초안</span><span>실제 PNG는 별도 폴더에 저장</span></div>
</section>

<section class="page">
  <div class="section-head"><div class="section-title-line"><span class="number">08</span><h2>상세 이미지 1–3 · 문제와 결과</h2></div><span class="small-caps">detail image set</span></div>
  <div class="asset-gallery">${detailSlides.slice(0,3).map((slide) => `<figure class="gallery-item"><img src="${pathToFileURL(path.join(generatedDir, `${slide.id}.png`)).href}" alt="${escapeHtml(slide.title)}"><figcaption>${escapeHtml(slide.kicker)} · ${escapeHtml(slide.title.replaceAll('\n',' '))}</figcaption></figure>`).join('')}</div>
  <p class="note">상세 이미지는 순서를 바꾸어도 되지만, 1–3번은 서비스가 해결하는 문제와 구매자가 받는 결과를 먼저 보여주는 구성이 좋습니다.</p>
  <div class="footer"><span>08 · 상세 이미지 1–3</span><span>652 px 이상 가로형</span></div>
</section>

<section class="page">
  <div class="section-head"><div class="section-title-line"><span class="number">09</span><h2>상세 이미지 4–6 · 방식과 적합한 사람</h2></div><span class="small-caps">detail image set</span></div>
  <div class="asset-gallery">${detailSlides.slice(3,6).map((slide) => `<figure class="gallery-item"><img src="${pathToFileURL(path.join(generatedDir, `${slide.id}.png`)).href}" alt="${escapeHtml(slide.title)}"><figcaption>${escapeHtml(slide.kicker)} · ${escapeHtml(slide.title.replaceAll('\n',' '))}</figcaption></figure>`).join('')}</div>
  <p class="note">AI 활용 범위를 사람의 확인과 분리해 표시하면 기대치 불일치와 불필요한 환불 문의를 줄이는 데 도움이 됩니다.</p>
  <div class="footer"><span>09 · 상세 이미지 4–6</span><span>652 px 이상 가로형</span></div>
</section>

<section class="page">
  <div class="section-head"><div class="section-title-line"><span class="number">10</span><h2>상세 이미지 7–9 · 증빙과 구매 판단</h2></div><span class="small-caps">detail image set</span></div>
  <div class="asset-gallery">${detailSlides.slice(6,9).map((slide) => `<figure class="gallery-item"><img src="${pathToFileURL(path.join(generatedDir, `${slide.id}.png`)).href}" alt="${escapeHtml(slide.title)}"><figcaption>${escapeHtml(slide.kicker)} · ${escapeHtml(slide.title.replaceAll('\n',' '))}</figcaption></figure>`).join('')}</div>
  <p class="note">샘플 보고서 화면은 개인 정보가 포함되지 않은 현재 작업물 예시로 사용하고, 실제 구매자의 결과물처럼 오해될 수 있는 표현은 넣지 않습니다.</p>
  <div class="footer"><span>10 · 상세 이미지 7–9</span><span>652 px 이상 가로형</span></div>
</section>

<section class="page">
  <div class="section-head"><div class="section-title-line"><span class="number">11</span><h2>등록 전 최종 체크리스트</h2></div><span class="small-caps">publication checklist</span></div>
  <p class="lead">등록 문안과 이미지는 구매자의 기대치를 만드는 약속입니다. 아래 항목을 모두 확인한 뒤 실제 크몽 입력창에 옮깁니다.</p>
  <table class="rubric-table">
    <tr><th><span class="score">PASS</span>메인 이미지</th><td>652 × 488 px, 한눈에 읽히는 핵심 문장 1개, 과장 없는 결과 표현, 로고와 워터마크 없음</td></tr>
    <tr><th><span class="score">PASS</span>상세 이미지</th><td>가로 652 px 이상, 서비스 범위·절차·실물 예시·패키지 비교·주의사항 포함</td></tr>
    <tr><th><span class="score">PASS</span>서비스 본문</th><td>판매 목적, 제공 범위, 금액 기준, 작업 방식, AI 사용 범위, 제외 범위가 모두 확인됨</td></tr>
    <tr><th><span class="score">PASS</span>구매 전 정보</th><td>문항 수·글자 수·기간·수정 횟수·준비자료·환불 기준을 구매 전에 알 수 있음</td></tr>
    <tr><th><span class="score">PASS</span>증빙과 포트폴리오</th><td>전문가 이력은 증빙 가능한 것만 기재하고, 샘플 결과물은 실제 구조를 보여주되 개인 정보와 내부 작업 토큰을 노출하지 않음</td></tr>
    <tr><th><span class="score">CHECK</span>운영 검증</th><td>10건 정도의 문의·주문·수정 사유를 모은 뒤 가격, 패키지, FAQ와 메인 이미지를 다시 조정</td></tr>
  </table>
  <div class="callout"><strong>마지막으로 한 번 더 확인할 문장</strong><br>이 서비스가 고객에게 약속하는 것은 “합격”이 아니라 “빠르게 시작할 수 있는 초안과, 그 초안을 본인의 말로 다듬기 위한 확인 기준”입니다.</div>
  <h3 style="margin-top:11mm;">조사에 사용한 공개 자료</h3>
  <p class="url">크몽 서비스 소개 · https://support.kmong.com/hc/ko/articles/13179212554137--서비스-소개-쉽고-편하고-안전한-크몽-이용-방법</p>
  <p class="url">크몽 전문가 등록 안내 · https://kmong.com/seller/become-a-seller</p>
  <p class="url">크몽 광고 소개 · https://kmong.com/seller/kmong-ads</p>
  <p class="url">크몽 상품정보고시 안내 · https://support.kmong.com/hc/ko/articles/26989990318745--서비스-포트폴리오-상품정보고시가-무엇인가요</p>
  <p class="url">온라인 마켓플레이스 구매자 안내 · https://consumer.ftc.gov/articles/buying-online-marketplace</p>
  <p class="note">공개 자료는 서비스 상세 정보, 구매자 신뢰, 이미지와 정책 안내를 설계하기 위한 참고 자료입니다. 플랫폼 정책과 법령은 등록 시점의 최신 내용을 다시 확인해야 합니다.</p>
  <div class="footer"><span>11 · 등록 전 최종 체크리스트</span><span>크몽 등록 제안서</span></div>
</section>

<div class="asset-sheet">${mainAssets.map(mainAssetHtml).join('')}${detailSlides.map(detailAssetHtml).join('')}</div>
</body>
</html>`;

const listingMarkdown = `# ${listing.title}

## 한 줄 소개

${listing.oneLine}

## 전문가 소개

${listing.profile}

## 서비스 설명

${listing.description}

## 서비스 제공 절차

${listing.process}

## 의뢰인 준비사항

${listing.preparation}

## 취소 및 환불 규정 입력안

${listing.refund}

## 가격 제안

| 패키지 | 권장가 | 제공 범위 | 작업 기간 | 수정 | 추가 검토 |
| --- | ---: | --- | --- | --- | --- |
${listing.packages.map((pkg) => `| ${pkg.name} | ${pkg.price} | ${pkg.scope} | ${pkg.days} | ${pkg.revisions} | ${pkg.review} |`).join('\n')}

## 추가 가격

| 추가 항목 | 제공 방식 | 권장 추가가 |
| --- | --- | ---: |
${listing.addons.map(([name, scope, price]) => `| ${name} | ${scope} | ${price} |`).join('\n')}

## 검색 키워드

${listing.keywords.join(', ')}

## 자주 묻는 질문

${listing.faq.map(([question, answer]) => `### ${question}\n\n${answer}`).join('\n\n')}

## 작업 전 요청사항

${listing.workRequest.map((item) => `- ${item}`).join('\n')}

## 이미지 파일

- 메인 이미지 초안: generated-images/main-a.png, generated-images/main-b.png, generated-images/main-c.png
- 상세 이미지: generated-images/detail-01.png부터 generated-images/detail-09.png

## 운영 메모

- 가격은 초기 시범 판매가로 제안했으며, 실제 작업 시간과 주문 범위 확인 후 조정합니다.
- 전문가 경력, 증빙, 작업 건수와 같은 신뢰 정보는 확인 가능한 범위만 입력합니다.
- 크몽의 최신 취소·환불 규정과 상품정보고시를 등록 직전에 재확인합니다.
- AI는 탐색·정리·초안 보조에 사용하며, 허위경력·대필·합격 보장·AI 탐지 회피 보장은 하지 않습니다.
`;

const manifest = {
  schemaVersion: 'kmong-self-introduction-service-assets/v1',
  status: 'draft-for-review',
  authorityEffect: 'none',
  generatedAt: new Date().toISOString(),
  output: {
    pdf: 'kmong-service-listing-proposal-v1.pdf',
    html: 'kmong-service-listing-proposal-v1.html',
    copy: 'kmong-listing-copy-v1.md',
    mainImages: mainAssets.map((item) => `generated-images/${item.id}.png`),
    detailImages: detailSlides.map((slide) => `generated-images/${slide.id}.png`)
  },
  sampleReport: {
    source: '../job-application-2026-09-ai-service-engineer/self-introduction-5sets-v6.pdf',
    supportingRenderedPages: ['page-01.png', 'page-06.png', 'page-10.png', 'page-15.png']
  },
  research: {
    rubricFile: 'marketing-rubric-v1.md',
    researchNotes: 'research-notes-v1.md',
    sources: [
      'https://support.kmong.com/hc/ko/articles/13179212554137--서비스-소개-쉽고-편하고-안전한-크몽-이용-방법',
      'https://kmong.com/seller/become-a-seller',
      'https://kmong.com/seller/kmong-ads',
      'https://support.kmong.com/hc/ko/articles/26989990318745--서비스-포트폴리오-상품정보고시가-무엇인가요',
      'https://consumer.ftc.gov/articles/buying-online-marketplace'
    ],
    rubric: ['problem clarity', 'deliverable specificity', 'scope transparency', 'human trust', 'evidence', 'next action']
  },
  imageGeneration: {
    mode: 'built-in image_gen',
    purpose: 'three text-free editorial background variants for main images',
    sourceImages: ['source-images/main-a-bg.png', 'source-images/main-b-bg.png', 'source-images/main-c-bg.png']
  },
  constraints: [
    'Do not claim pass or hiring outcomes.',
    'Do not present AI output as an unverified final application.',
    'Do not include credentials or portfolio claims without evidence.',
    'Use the latest Kmong policies at the time of registration.'
  ]
};

const htmlPath = path.join(root, 'kmong-service-listing-proposal-v1.html');
const pdfPath = path.join(root, 'kmong-service-listing-proposal-v1.pdf');
const copyPath = path.join(root, 'kmong-listing-copy-v1.md');
const manifestPath = path.join(root, 'kmong-service-assets-manifest-v1.json');

fs.writeFileSync(htmlPath, html);
fs.writeFileSync(copyPath, listingMarkdown);
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1450, height: 1100 }, deviceScaleFactor: 1 });
await page.goto(pathToFileURL(htmlPath).href, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);

for (const item of mainAssets) {
  await page.locator(`.asset-sheet [data-asset="${item.id}"]`).screenshot({ path: path.join(generatedDir, `${item.id}.png`), type: 'png' });
}
for (const slide of detailSlides) {
  await page.locator(`.asset-sheet [data-asset="${slide.id}"]`).screenshot({ path: path.join(generatedDir, `${slide.id}.png`), type: 'png' });
}

await page.reload({ waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
await page.evaluate(() => document.querySelector('.asset-sheet')?.remove());
for (let index = 0; index < await page.locator('.page').count(); index += 1) {
  await page.locator('.page').nth(index).screenshot({ path: path.join(renderDir, `page-${String(index + 1).padStart(2, '0')}.png`), type: 'png' });
}
await page.pdf({ path: pdfPath, format: 'A4', printBackground: true, preferCSSPageSize: true, margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' } });

const pages = await page.evaluate(() => [...document.querySelectorAll('.page')].map((element, index) => ({
  page: index + 1,
  height: element.clientHeight,
  scrollHeight: element.scrollHeight,
  overflowPx: Math.max(0, element.scrollHeight - element.clientHeight),
  textLength: element.innerText.length
})));
const imageFiles = [...mainAssets.map((item) => item.id), ...detailSlides.map((slide) => slide.id)].map((id) => {
  const file = path.join(generatedDir, `${id}.png`);
  const stat = fs.statSync(file);
  return { id, file: path.relative(root, file), bytes: stat.size };
});
const renderValidation = { html: path.relative(process.cwd(), htmlPath), pageCount: pages.length, pages, overflowPages: pages.filter((item) => item.overflowPx > 2).map((item) => item.page), imageFiles };
fs.writeFileSync(path.join(root, 'render-validation-v1.json'), JSON.stringify(renderValidation, null, 2));
await browser.close();

console.log(JSON.stringify({ pdf: pdfPath, html: htmlPath, copy: copyPath, manifest: manifestPath, ...renderValidation }, null, 2));
