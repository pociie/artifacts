import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const dir = dirname(fileURLToPath(import.meta.url));
const read = (name) => JSON.parse(readFileSync(join(dir, name), "utf8"));
const evidence = read("naver-map-raw-image-manifest.json");
const rubric = read("visual-rubric.json");
const evaluation = read("evaluation.json");
const architecture = read("optimized-agent-architecture.json");
const html = readFileSync(join(dir, "naver-map-cafe-study-report.html"), "utf8");
const errors = [];
const assert = (condition, message) => { if (!condition) errors.push(message); };
const allowedHosts = new Set(evidence.constraints.sourceAllowlist);
const allowedTags = new Set(["wide-table","standard-work-table","supportive-seat","spacious-layout","clear-aisle","window-view","daylight","calm-interior","decor-only","food-menu","exterior","people-obscured","tight-space","partial-unreadable","duplicate"]);
const byId = Object.fromEntries(evidence.venues.map((venue) => [venue.id, venue]));
const weights = Object.fromEntries(rubric.criteria.map((criterion) => [criterion.id, criterion.weight]));
const comparativeIds = ["deskUsability", "seatErgonomics", "spatialOpenness", "lightView", "focusInterior"];
const definitionBytes = readFileSync(join(dir, rubric.definitionBinding.ref));
const definitionDigest = `sha256:${createHash("sha256").update(definitionBytes).digest("hex")}`;

assert(rubric.kind === "cafe-visual-study-rubric-profile/v2" && rubric.schemaVersion === 2, "rubric v2 identity mismatch");
assert(rubric.authorityEffect === "none" && rubric.acceptedAsEvidence === false && rubric.automaticPromotion === false, "rubric authority boundary mismatch");
assert(rubric.definitionBinding.disposition === "task_local_hypothesis" && rubric.definitionBinding.digest === definitionDigest, "rubric definition binding mismatch");
assert(rubric.decisionOrder.join(",") === "mandatory,qualifying,comparative,observational", "rubric decision order mismatch");
assert(rubric.criteria.map((criterion) => criterion.id).join(",") === comparativeIds.join(","), "comparative criterion set mismatch");
assert(rubric.criteria.reduce((sum, criterion) => sum + criterion.weight, 0) === 100, "comparative weight total mismatch");
assert(!Object.hasOwn(weights, "evidenceSufficiency"), "evidence sufficiency must not contribute to score");
assert(rubric.observationalCriteria.find((criterion) => criterion.id === "evidenceSufficiency")?.scoreContribution === 0, "evidence sufficiency observation mismatch");
assert(rubric.taskContext.timeBudget.observedDurationMinutes === null && rubric.taskContext.timeBudget.observationState === "unavailable", "unmeasured runtime must stay unavailable");
assert(evidence.constraints.imageCount > 50, "raw image count must be greater than 50");
assert(evidence.constraints.imageCount === evidence.venues.reduce((sum,venue) => sum + venue.images.length, 0), "raw image total mismatch");
assert(evaluation.results.length === 10, "result count must be exactly 10");
assert(evaluation.summary.reviewCount === 0 && evaluation.sourcePolicy.reviewsUsed === false, "reviews must be excluded");
assert(JSON.stringify(evidence).match(/visitorReviews|blogReviews|displayText/) === null, "raw manifest contains review fields");
assert(JSON.stringify(evidence).match(/\"score\"|\"ratings\"|\"rank\"/) === null, "raw manifest contains evaluation fields");
assert(architecture.resourceBounds.additionalBrowserTraversalAfterFreeze === 0, "optimized topology browser traversal mismatch");

for (const venue of evidence.venues) {
  assert(venue.imageCount === venue.images.length, `${venue.name}: image count mismatch`);
  for (const source of venue.images) {
    const url = new URL(source);
    assert(allowedHosts.has(url.hostname), `${venue.name}: disallowed host ${url.hostname}`);
    const nested = url.searchParams.get("src");
    if (nested) assert(/(^|\.)pstatic\.net$/.test(new URL(nested).hostname), `${venue.name}: non-Naver nested image host`);
  }
}

for (const result of evaluation.results) {
  const venue = byId[result.id];
  assert(Boolean(venue), `${result.id}: missing raw venue`);
  assert(["중랑구", "강동구"].includes(venue.district), `${venue?.name}: district gate invalid`);
  assert(/카페/.test(venue.category) && !/(브런치|레스토랑|음식점)/.test(venue.category), `${venue?.name}: category gate invalid`);
  assert(result.imageJudgments.length === venue.images.length, `${venue?.name}: judgment count mismatch`);
  assert(new Set(result.imageJudgments.map((item) => item.index)).size === venue.images.length, `${venue?.name}: duplicate image index`);
  for (const item of result.imageJudgments) {
    assert(item.index >= 0 && item.index < venue.images.length, `${venue.name}: image index out of range`);
    assert(item.tags.every((tag) => allowedTags.has(tag)), `${venue.name}: unknown tag`);
  }
  const accepted = result.imageJudgments.filter((item) => item.accept);
  assert(accepted.every((item) => item.tags.some((tag) => rubric.imageEvidencePolicy.positiveObservationTags.includes(tag))), `${venue.name}: accepted image lacks direct study evidence`);
  assert(accepted.every((item) => item.tags.every((tag) => !rubric.imageEvidencePolicy.absoluteRejectTags.includes(tag))), `${venue.name}: accepted image has absolute reject tag`);
  const work = accepted.some((item) => item.tags.some((tag) => ["wide-table","standard-work-table"].includes(tag)));
  const layout = accepted.some((item) => item.tags.some((tag) => ["spacious-layout","clear-aisle"].includes(tag)));
  assert(accepted.length >= 3 && work && layout && result.gate.passed, `${venue.name}: hard gate invalid`);
  assert(Object.values(result.gate.checks ?? {}).length === 6 && Object.values(result.gate.checks).every(Boolean), `${venue.name}: structured gate checks invalid`);
  const calculated = Number(Object.entries(weights).reduce((sum,[key,weight]) => sum + result.ratings[key] / 5 * weight, 0).toFixed(1));
  assert(calculated === result.score, `${venue.name}: score mismatch ${calculated} != ${result.score}`);
}

const acceptedCount = evaluation.results.reduce((sum,result) => sum + result.imageJudgments.filter((item) => item.accept).length, 0);
assert(acceptedCount === evaluation.summary.acceptedImageCount, "accepted image total mismatch");
const ranks = evaluation.results.map((result) => result.rank);
assert(ranks.join(",") === "1,2,3,4,5,6,7,8,9,10", "ranks are not contiguous");
const script = html.match(/<script>([\s\S]*)<\/script>/)?.[1];
assert(Boolean(script), "inline script missing");
if (script) {
  try { new vm.Script(script); } catch (error) { errors.push(`inline JS syntax: ${error.message}`); }
}
assert(html.includes("리뷰 없이") && html.includes("리뷰 0건 사용"), "review exclusion disclosure missing");
assert(html.includes("내부사진 107장"), "image count disclosure missing");
assert(html.includes("근거 충실도는 순위 비반영"), "observational evidence disclosure missing");

if (errors.length) {
  console.error(JSON.stringify({ ok:false, errors }, null, 2));
  process.exit(1);
}
console.log(JSON.stringify({
  ok:true,
  candidateCount:evidence.venues.length,
  rawImageCount:evidence.constraints.imageCount,
  selectedVenueCount:evaluation.results.length,
  acceptedImageCount:acceptedCount,
  excludedVenueCount:evaluation.excluded.length,
  reviewsUsed:0,
  sourceHosts:[...new Set(evidence.venues.flatMap((venue) => venue.images.map((source) => new URL(source).hostname)))],
  htmlBytes:Buffer.byteLength(html)
}, null, 2));
