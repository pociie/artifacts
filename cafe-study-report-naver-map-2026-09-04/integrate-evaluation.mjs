import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const dir = dirname(fileURLToPath(import.meta.url));
const evidence = JSON.parse(readFileSync(join(dir, "naver-map-raw-image-manifest.json"), "utf8"));
const rubric = JSON.parse(readFileSync(join(dir, "visual-rubric.json"), "utf8"));
const weights = Object.fromEntries(rubric.criteria.map((criterion) => [criterion.id, criterion.weight]));
const allowedHosts = new Set(evidence.constraints.sourceAllowlist);
const j = (rows) => rows.map(([index, accept, tags]) => ({ index, accept, tags }));

const inputs = [
  {
    id: "35701210",
    imageJudgments: j([
      [0,1,["standard-work-table","supportive-seat","clear-aisle","window-view","daylight","calm-interior"]],
      [1,1,["wide-table","supportive-seat","clear-aisle","calm-interior"]],
      [2,0,["decor-only","people-obscured","partial-unreadable"]],
      [3,1,["supportive-seat","spacious-layout","clear-aisle","window-view","daylight","calm-interior","people-obscured"]],
      [4,1,["wide-table","standard-work-table","supportive-seat","spacious-layout","clear-aisle","window-view","daylight","calm-interior","people-obscured"]],
      [5,0,["decor-only"]],[6,0,["decor-only","partial-unreadable"]],
      [7,1,["wide-table","standard-work-table","supportive-seat","spacious-layout","clear-aisle","calm-interior"]],
      [8,1,["standard-work-table","supportive-seat","spacious-layout","clear-aisle","window-view","calm-interior"]],
      [9,0,["decor-only","partial-unreadable"]]
    ]),
    ratings:{deskUsability:4.3,seatErgonomics:3.4,spatialOpenness:4.1,lightView:4.2,focusInterior:4.0,evidenceSufficiency:4.3},
    visualFindings:["깊이가 있는 대형 목재 공용 테이블과 일반 사각 테이블이 여러 각도에서 확인된다.","등받이 의자와 소파형 좌석이 있고 좌석 구역 사이 통로도 이어진다.","큰 전면 창에서 자연광과 도로·수목 방향 시야가 확인된다.","목재 바닥·벽돌·노출 천장·빈티지 가구의 구성이 일관된다."],
    limitations:["높은 스툴과 휴식형 소파가 섞여 좌석별 작업 자세 편차가 있다.","일부 광각 사진은 이용객이 테이블과 통로 일부를 가린다."],
    verdict:"넓은 작업면·개방된 배치·창가 시야가 고르게 확인되는 균형형 후보.",
    bestFor:"넓은 공용 테이블과 창가를 번갈아 쓰고 싶은 노트북+필기 작업",
    fieldCheck:"원하는 시간대의 공용 테이블 혼잡도와 좌석별 콘센트"
  },
  {
    id: "1147652786",
    imageJudgments:j([
      [0,0,["decor-only"]],[1,0,["decor-only","duplicate"]],[2,0,["decor-only","tight-space","partial-unreadable"]],[3,0,["food-menu","partial-unreadable"]],[4,0,["decor-only","duplicate"]],
      [5,1,["standard-work-table","supportive-seat","clear-aisle","calm-interior"]],[6,0,["decor-only","duplicate"]],
      [7,1,["standard-work-table","supportive-seat","clear-aisle","daylight","calm-interior"]],
      [8,1,["standard-work-table","supportive-seat","clear-aisle","calm-interior"]],
      [9,1,["standard-work-table","supportive-seat","calm-interior","people-obscured"]]
    ]),
    ratings:{deskUsability:2.8,seatErgonomics:3.4,spatialOpenness:2.8,lightView:2.0,focusInterior:3.5,evidenceSufficiency:2.7},
    visualFindings:["벽면형 직사각·소형 원형·2인 테이블은 보이지만 대형 공용 테이블은 보이지 않는다.","높은 등받이 패브릭 의자와 부스형 좌석이 반복 확인된다.","회색 벽과 짙은 청색 좌석의 차분한 색채가 일관된다.","일부 통로는 보이지만 수조와 서비스 설비가 공간을 분절한다."],
    limitations:["커튼으로 창이 대부분 가려져 외부 조망 근거가 약하다.","10장 중 장식·수조·카운터 중심 사진이 6장이라 전체 규모 판단이 제한된다."],
    verdict:"등받이 좌석은 장점이지만 넓은 작업면과 뷰 근거는 최종 10곳 중 가장 약하다.",
    bestFor:"넓은 테이블보다 등받이 좌석과 차분한 색감을 우선하는 짧은 공부",
    fieldCheck:"테이블 실제 깊이, 커튼 개방 여부, 좌석 간 혼잡도"
  },
  {
    id: "31905764",
    imageJudgments:j([
      [0,1,["standard-work-table","tight-space","calm-interior"]],[1,0,["decor-only","window-view","daylight","partial-unreadable"]],
      [2,1,["standard-work-table","supportive-seat","daylight","calm-interior","tight-space"]],[3,0,["duplicate","standard-work-table","tight-space"]],
      [4,0,["decor-only","people-obscured","partial-unreadable"]],[5,1,["wide-table","supportive-seat","spacious-layout","daylight","calm-interior","people-obscured"]],
      [6,0,["decor-only","people-obscured"]],[7,1,["standard-work-table","clear-aisle","window-view","daylight","calm-interior","people-obscured"]],
      [8,0,["decor-only","people-obscured"]],[9,0,["decor-only","partial-unreadable"]]
    ]),
    ratings:{deskUsability:3.3,seatErgonomics:2.5,spatialOpenness:2.8,lightView:3.8,focusInterior:4.0,evidenceSufficiency:2.8},
    visualFindings:["주 좌석 구역의 넓은 직사각 테이블과 창가의 긴 벽면 작업면이 확인된다.","전면 창에서 자연광과 거리 방향 시야가 보인다.","분홍빛 벽·간접조명·목재 가구가 정돈된 현대적 실내를 이룬다.","좁은 골방과 작은 원형 테이블도 있어 작업면 품질 편차가 크다."],
    limitations:["골방과 창가에는 높은 스툴형 좌석이 있어 장시간 자세는 확인이 필요하다.","좌석 구역 전체를 보여주는 사진보다 카운터 중심 사진 비중이 높다."],
    verdict:"창가 작업면과 인테리어는 선명하지만 좌석·공간의 편차가 큰 선택지.",
    bestFor:"밝은 창가나 큰 직사각 테이블을 선점할 수 있는 1인 작업",
    fieldCheck:"창가 작업면 깊이, 스툴 높이, 큰 테이블 이용 가능 여부"
  },
  {
    id: "1545461507",
    imageJudgments:j([
      [0,0,["food-menu"]],[1,0,["food-menu","duplicate"]],[2,0,["decor-only"]],
      [3,1,["spacious-layout","clear-aisle","daylight","calm-interior"]],[4,1,["standard-work-table","supportive-seat","tight-space","calm-interior"]],
      [5,0,["food-menu","people-obscured","partial-unreadable"]],[6,0,["decor-only","duplicate"]],
      [7,1,["spacious-layout","clear-aisle","window-view","daylight","calm-interior"]],
      [8,1,["standard-work-table","supportive-seat","clear-aisle","window-view","daylight","calm-interior","people-obscured"]],
      [9,0,["duplicate","clear-aisle","daylight","calm-interior"]]
    ]),
    ratings:{deskUsability:2.2,seatErgonomics:2.5,spatialOpenness:3.6,lightView:3.3,focusInterior:3.9,evidenceSufficiency:2.6},
    visualFindings:["좌석은 주로 소형 사각 테이블이며 넓은 공용 작업면은 확인되지 않는다.","카운터와 입구 사이에 폭이 넓고 길게 이어지는 통로가 보인다.","전면 유리창에서 자연광과 거리 방향 시야가 들어온다.","무채색 금속 가구와 따뜻한 선형 조명이 절제된 인테리어를 이룬다."],
    limitations:["유효 사진 4장 중 2장은 통로 중심이라 작업면 직접 근거가 적다.","소형 테이블 깊이와 금속 의자의 장시간 착석감은 알 수 없다."],
    verdict:"동선과 정돈된 인테리어는 좋지만 작업면 크기는 제한적으로 보인다.",
    bestFor:"교재가 많지 않은 노트북 중심 작업과 밝고 절제된 공간 선호",
    fieldCheck:"소형 테이블 실측감, 의자 착좌감, 창가 좌석 가용성"
  },
  {
    id: "1994359615",
    imageJudgments:j([
      [0,1,["wide-table","supportive-seat","spacious-layout","window-view","daylight","calm-interior"]],
      [1,1,["standard-work-table","supportive-seat","spacious-layout","clear-aisle","window-view","daylight","calm-interior"]],
      [2,1,["standard-work-table","spacious-layout","clear-aisle","daylight","calm-interior"]],[3,0,["food-menu","people-obscured"]],
      [4,1,["standard-work-table","supportive-seat","spacious-layout","clear-aisle","window-view","daylight","calm-interior","people-obscured"]],
      [5,0,["food-menu","people-obscured"]],[6,0,["food-menu"]],
      [7,1,["standard-work-table","supportive-seat","spacious-layout","clear-aisle","daylight","calm-interior","people-obscured"]],
      [8,1,["wide-table","supportive-seat","window-view","daylight"]],
      [9,1,["standard-work-table","supportive-seat","daylight","calm-interior","people-obscured"]]
    ]),
    ratings:{deskUsability:4.3,seatErgonomics:4.2,spatialOpenness:4.5,lightView:4.6,focusInterior:4.4,evidenceSufficiency:4.8},
    visualFindings:["결합형 넓은 작업면과 여러 표준 크기 테이블이 반복 확인된다.","대부분 등받이가 있고 일부 좌석에는 팔걸이도 보인다.","주문 구역과 좌석 사이의 길고 넓은 통로와 여유 있는 테이블 간격이 보인다.","큰 창 너머 수목 방향 시야와 자연광, 흰 벽·목재 중심의 절제된 실내가 일관된다."],
    limitations:["일부 유효 사진은 이용객이 좌석과 동선 일부를 가린다.","의자의 실제 쿠션감과 장시간 피로도는 사진으로 확정할 수 없다."],
    verdict:"작업면·등받이·여유 공간·수목 뷰가 가장 고르게 반복 확인된 1순위.",
    bestFor:"노트북과 필기물을 함께 펼치는 장시간 집중 작업",
    fieldCheck:"원하는 시간대의 큰 테이블 혼잡도와 콘센트 위치"
  },
  {
    id: "36998529",
    imageJudgments:j([
      [0,0,["decor-only"]],[1,1,["supportive-seat","window-view","daylight","calm-interior"]],
      [2,1,["wide-table","supportive-seat","calm-interior"]],[3,1,["wide-table","supportive-seat","spacious-layout","clear-aisle","calm-interior"]],
      [4,0,["decor-only","partial-unreadable"]],[5,1,["standard-work-table","supportive-seat","clear-aisle","calm-interior"]],
      [6,1,["wide-table","supportive-seat","spacious-layout","clear-aisle","window-view","daylight","calm-interior","people-obscured"]],
      [7,1,["wide-table","supportive-seat","calm-interior"]],
      [8,1,["standard-work-table","supportive-seat","spacious-layout","clear-aisle","window-view","daylight","calm-interior","people-obscured"]],
      [9,0,["food-menu","people-obscured"]]
    ]),
    ratings:{deskUsability:3.8,seatErgonomics:3.7,spatialOpenness:4.3,lightView:4.1,focusInterior:4.2,evidenceSufficiency:4.6},
    visualFindings:["여러 명이 쓸 수 있는 넓은 원형 테이블과 표준 직사각 테이블이 함께 보인다.","목재·라탄 의자와 소파 좌석, 여러 구역으로 나뉜 넓은 실내가 확인된다.","창가 구역은 큰 창과 식물 방향 시야, 자연광을 갖는다.","벽돌·목재·식물·간접조명의 인테리어가 일관된다."],
    limitations:["원형 테이블의 개인별 실제 사용 면적은 확정할 수 없다.","일부 소파 앞 테이블은 낮아 필기 작업 적합성을 알 수 없다."],
    verdict:"구역이 넓고 인테리어 완성도가 높으며 큰 테이블 선택지도 보이는 공간형 후보.",
    bestFor:"여유 있는 공간과 분위기를 중시하는 그룹 또는 개인 공부",
    fieldCheck:"큰 테이블 공동 이용 상태와 소파가 아닌 직립 좌석 가용성"
  },
  {
    id: "1118755333",
    imageJudgments:j([
      [0,1,["wide-table","supportive-seat","calm-interior","people-obscured"]],
      [1,1,["standard-work-table","supportive-seat","calm-interior","people-obscured","tight-space"]],
      [2,0,["food-menu","people-obscured"]],
      [3,1,["wide-table","supportive-seat","spacious-layout","window-view","daylight","calm-interior","people-obscured"]],
      [4,0,["food-menu","partial-unreadable"]],[5,0,["food-menu","people-obscured"]]
    ]),
    ratings:{deskUsability:4.5,seatErgonomics:3.8,spatialOpenness:3.1,lightView:4.0,focusInterior:3.7,evidenceSufficiency:3.0},
    visualFindings:["여러 명이 사용할 수 있는 긴 공용 테이블이 선명하게 보인다.","분리형 부스에는 등받이 좌석·개별 조명·표준 높이 작업면이 확인된다.","창가 구역의 큰 유리창에서 외부 거리 시야와 자연광이 들어온다."],
    limitations:["유효 사진이 정확히 3장으로 최소 게이트만 충족한다.","사람과 전경 가구가 동선 일부를 가려 전체 공간의 여유는 정밀 판정하기 어렵다."],
    verdict:"공용 테이블과 부스 작업면은 뚜렷하지만 공간 전경 근거는 최소 수준.",
    bestFor:"큰 공용 테이블 또는 분리형 부스에서 집중하는 개인 작업",
    fieldCheck:"부스 폭, 큰 테이블 좌석 가용성, 실제 매장 혼잡도"
  },
  {
    id: "38522522",
    imageJudgments:j([
      [0,1,["standard-work-table","supportive-seat","window-view","calm-interior"]],
      [1,1,["wide-table","supportive-seat","spacious-layout","clear-aisle","calm-interior"]],
      [2,1,["wide-table","supportive-seat","spacious-layout","clear-aisle","window-view","calm-interior"]],
      [3,1,["wide-table","supportive-seat","spacious-layout","clear-aisle","calm-interior"]],
      [4,1,["standard-work-table","supportive-seat","clear-aisle","window-view","calm-interior"]],
      [5,1,["standard-work-table","supportive-seat","calm-interior","tight-space"]],
      [6,1,["wide-table","supportive-seat","spacious-layout","daylight","calm-interior","people-obscured"]],
      [7,0,["people-obscured","partial-unreadable"]],
      [8,1,["standard-work-table","supportive-seat","window-view","calm-interior","tight-space"]]
    ]),
    ratings:{deskUsability:4.3,seatErgonomics:3.5,spatialOpenness:4.0,lightView:3.4,focusInterior:3.7,evidenceSufficiency:4.7},
    visualFindings:["중앙의 길고 깊은 공용 테이블과 등받이 의자가 여러 사진에서 반복 확인된다.","중앙 공용석과 창가 좌석 사이에 분명한 이동 통로가 보인다.","전면 유리창과 창가 바 좌석은 있으나 외부 시야는 도심 상가·도로 방향이다.","검은 천장·목재 가구·노출 전구가 따뜻한 인테리어를 만든다."],
    limitations:["벽면 2인석은 공용 테이블보다 작고 좌석 간격도 좁다.","야간 사진 비중이 높아 주간 채광의 지속성은 확인하기 어렵다."],
    verdict:"긴 공용 테이블과 동선 근거가 강한 작업면 중심 후보.",
    bestFor:"넓은 중앙 공용 테이블에서 노트북과 노트를 함께 쓰는 공부",
    fieldCheck:"주간 채광, 공용 테이블 혼잡도, 벽면석 크기"
  },
  {
    id: "1395310222",
    imageJudgments:j([
      [0,0,["decor-only","food-menu"]],[1,0,["decor-only","food-menu","people-obscured"]],
      [2,1,["standard-work-table","supportive-seat","window-view","daylight","people-obscured","tight-space"]],
      [3,1,["standard-work-table","supportive-seat","spacious-layout","clear-aisle","calm-interior","people-obscured"]],
      [4,1,["wide-table","supportive-seat","clear-aisle","window-view","daylight","calm-interior"]],
      [5,0,["decor-only","partial-unreadable"]],[6,1,["standard-work-table","supportive-seat","calm-interior","tight-space"]],
      [7,0,["food-menu","people-obscured","partial-unreadable"]],[8,0,["food-menu","partial-unreadable"]],[9,0,["exterior","standard-work-table","supportive-seat"]]
    ]),
    ratings:{deskUsability:2.8,seatErgonomics:3.2,spatialOpenness:3.2,lightView:3.2,focusInterior:3.9,evidenceSufficiency:3.0},
    visualFindings:["창가 방의 4인 직사각형 테이블과 등받이 목재 의자가 명확히 보인다.","주 좌석은 소형 원형·2인 테이블 비중이 높아 넓은 작업면은 제한적이다.","화이트 벽·목재·식물의 주거형 인테리어가 차분하다.","복도형 동선은 보이지만 식물과 가구로 가려진 각도가 많다."],
    limitations:["공간 전체를 한눈에 보여주는 사진이 적고 채택 사진은 4장이다.","음식·메뉴 사진은 모두 배제했으며 매장 운영 성격은 추가로 추론하지 않았다."],
    verdict:"밝고 차분하지만 넓은 작업면 선택지는 일부 좌석으로 한정된다.",
    bestFor:"창가의 4인 테이블을 확보했을 때의 가벼운 개인 공부",
    fieldCheck:"4인 테이블 개인 이용 가능 여부와 실제 메뉴 운영 성격"
  },
  {
    id: "1131380509",
    imageJudgments:j([
      [0,0,["food-menu","partial-unreadable"]],[1,0,["decor-only","partial-unreadable"]],
      [2,1,["standard-work-table","supportive-seat","spacious-layout","clear-aisle","window-view","daylight","calm-interior","food-menu"]],
      [3,1,["standard-work-table","supportive-seat","window-view","daylight","calm-interior","tight-space"]],
      [4,1,["standard-work-table","supportive-seat","spacious-layout","clear-aisle","window-view","daylight","calm-interior"]],
      [5,1,["standard-work-table","supportive-seat","spacious-layout","clear-aisle","window-view","daylight","calm-interior"]],
      [6,0,["food-menu","decor-only"]],[7,0,["partial-unreadable"]],
      [8,1,["standard-work-table","supportive-seat","spacious-layout","clear-aisle","window-view","daylight","calm-interior"]],
      [9,1,["standard-work-table","supportive-seat","spacious-layout","clear-aisle","window-view","daylight","calm-interior"]]
    ]),
    ratings:{deskUsability:2.8,seatErgonomics:4.2,spatialOpenness:4.8,lightView:5.0,focusInterior:4.1,evidenceSufficiency:4.5},
    visualFindings:["넓은 실내 전경과 좌석 사이의 큰 간격이 여러 사진에서 반복 확인된다.","대형 창 너머 하천 녹지·교량·주거 스카이라인이 선명하게 보인다.","높은 등받이 패브릭·합성가죽 의자가 창가와 중앙에 고르게 보인다.","회색·백색 중심의 단정한 실내와 식물 배치가 시각적 혼잡을 낮춘다."],
    limitations:["테이블 대부분이 소형·중형 원형이며 넓은 직사각 공용 테이블은 확인되지 않는다.","원형 테이블의 정확한 크기와 실제 착좌감은 사진으로 확정할 수 없다."],
    verdict:"하천·녹지 뷰와 압도적인 공간 여유가 강점이지만 테이블 폭은 보통 수준.",
    bestFor:"넓은 공간과 좋은 조망을 우선하고 노트북 한 대 위주로 공부할 때",
    fieldCheck:"원형 테이블 실사용 면적과 창가 좌석 혼잡도"
  }
];

function calculate(ratings) {
  return Number(Object.entries(weights).reduce((sum,[key,weight]) => sum + ratings[key] / 5 * weight, 0).toFixed(1));
}

function isAllowedSource(source) {
  const url = new URL(source);
  if (!allowedHosts.has(url.hostname)) return false;
  const nested = url.searchParams.get("src");
  return !nested || /(^|\.)pstatic\.net$/.test(new URL(nested).hostname);
}

const byId = Object.fromEntries(evidence.venues.map((venue) => [venue.id, venue]));
const results = inputs.map((input) => {
  const venue = byId[input.id];
  const accepted = input.imageJudgments.filter((item) => item.accept);
  const checks = {
    sourceProvenance: venue.images.every(isAllowedSource),
    scopeAndCategory: ["중랑구", "강동구"].includes(venue.district) && /카페/.test(venue.category) && !/(브런치|레스토랑|음식점)/.test(venue.category),
    minimumRelevantImages: accepted.length >= 3,
    workSurfaceCoverage: accepted.some((item) => item.tags.some((tag) => ["wide-table", "standard-work-table"].includes(tag))),
    spatialCoverage: accepted.some((item) => item.tags.some((tag) => ["spacious-layout", "clear-aisle"].includes(tag))),
    prohibitedInferenceExcluded: Object.keys(weights).every((key) => ["deskUsability", "seatErgonomics", "spatialOpenness", "lightView", "focusInterior"].includes(key))
  };
  return {
    ...input,
    score: calculate(input.ratings),
    gate: {
      passed: Object.values(checks).every(Boolean),
      acceptedImageCount: accepted.length,
      checks
    },
    limitations: [...input.limitations, "소음·콘센트·Wi-Fi·실제 혼잡도·장시간 체류 정책은 사진으로 판단하지 않았다."]
  };
}).sort((a,b) => b.score-a.score || b.ratings.deskUsability-a.ratings.deskUsability || b.ratings.seatErgonomics-a.ratings.seatErgonomics || b.ratings.spatialOpenness-a.ratings.spatialOpenness || b.ratings.lightView-a.ratings.lightView)
  .map((result,index) => ({ rank:index+1, ...result }));

for (const result of results) {
  const count = byId[result.id]?.images.length;
  if (count === undefined || result.imageJudgments.length !== count) throw new Error(`image count mismatch: ${result.id}`);
  if (!result.gate.passed) throw new Error(`final venue failed gate: ${result.id}`);
}

const evaluation = {
  schemaVersion: "naver-map-visual-cafe-evaluation/v2",
  observedAt: evidence.observedAt,
  rubricRef: "visual-rubric.json",
  rubricRevision: rubric.revision,
  architectureRef: "optimized-agent-architecture.json",
  scoringPolicy: "mandatory and qualifying criteria first; weighted comparison over five study-environment dimensions only; evidence sufficiency is observational",
  sourcePolicy: {
    images: "네이버 지도 사진 > AI View > 내부에서 실제 로드된 이미지 URL만 사용",
    placeIdentity: "네이버 지도 장소 요약의 이름·카테고리·주소만 사용",
    reviewsUsed: false,
    externalSourcesUsed: false
  },
  workers: [
    { lane:"visual_eval_gangdong_a", venueIds:["35701210","1147652786","31905764","1545461507"], workspaceWrites:false },
    { lane:"visual_eval_mixed_b", venueIds:["2014880028","1994359615","36998529","1118755333"], workspaceWrites:false },
    { lane:"visual_eval_jungnang_c", venueIds:["38522522","1395310222","1131380509"], workspaceWrites:false }
  ],
  summary: {
    candidateCount: evidence.constraints.candidateCount,
    visuallyEvaluatedImageCount: evidence.constraints.imageCount,
    nonzeroEvidenceVenueCount: evidence.venues.filter((v) => v.images.length > 0).length,
    selectedVenueCount: results.length,
    acceptedImageCount: results.reduce((sum,r) => sum + r.gate.acceptedImageCount, 0),
    finalVenueRejectedImageCount: results.reduce((sum,r) => sum + r.imageJudgments.filter((x) => !x.accept).length, 0),
    reviewCount: 0
  },
  results,
  excluded: [
    { id:"1785389032", name:"오플비", reason:"중단 복구 시 오래된 탭의 내부사진 네트워크 로그가 남지 않아 시각 근거 0장" },
    { id:"2024584509", name:"브루브루 천호점", reason:"네이버 지도 내부사진 필터에서 유효 이미지가 로드되지 않아 시각 근거 0장" },
    { id:"18889495", name:"중랑망우공간", reason:"네이버 지도 내부사진 필터에서 유효 이미지가 로드되지 않아 시각 근거 0장" },
    { id:"2014880028", name:"비트카페라운지 천호점", reason:"12장 중 공부환경 직접 근거는 2장뿐이라 최소 3장 하드게이트 미충족" }
  ]
};

writeFileSync(join(dir, "evaluation.json"), `${JSON.stringify(evaluation, null, 2)}\n`);
console.log(JSON.stringify(evaluation.summary));
console.log(results.map((r) => `${r.rank}. ${byId[r.id].name} ${r.score}`).join("\n"));
