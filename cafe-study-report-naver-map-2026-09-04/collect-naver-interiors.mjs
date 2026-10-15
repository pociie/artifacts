import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const dir = dirname(fileURLToPath(import.meta.url));
const candidates = [
  { district: "강동구", id: "1785389032", queryName: "오플비" },
  { district: "강동구", id: "35701210", queryName: "Elephant Coffee" },
  { district: "강동구", id: "1147652786", queryName: "카페공공장소" },
  { district: "강동구", id: "31905764", queryName: "커피몽타주 성내점" },
  { district: "강동구", id: "1545461507", queryName: "메모러블모먼트" },
  { district: "강동구", id: "2024584509", queryName: "브루브루 천호점" },
  { district: "강동구", id: "2014880028", queryName: "비트카페라운지 천호점" },
  { district: "강동구", id: "1994359615", queryName: "눅스커피" },
  { district: "중랑구", id: "18889495", queryName: "중랑망우공간" },
  { district: "중랑구", id: "36998529", queryName: "카페브릭" },
  { district: "중랑구", id: "1118755333", queryName: "투썸플레이스 신내점" },
  { district: "중랑구", id: "38522522", queryName: "제이식스 상봉점" },
  { district: "중랑구", id: "1395310222", queryName: "시즌모먼트" },
  { district: "중랑구", id: "1131380509", queryName: "카페하인나 상봉점" },
  { district: "중랑구", id: "1114089993", queryName: "오프아이디어" },
  { district: "중랑구", id: "1146827666", queryName: "넛지스 북카페 복합문화공간" }
];

function orca(args, { allowFailure = false } = {}) {
  const result = spawnSync("orca", args, { encoding: "utf8", maxBuffer: 30 * 1024 * 1024 });
  if (result.status !== 0 && !allowFailure) {
    throw new Error(`orca ${args.join(" ")} failed (${result.status}): ${result.stderr || result.stdout}`);
  }
  const start = result.stdout.indexOf("{");
  if (start < 0) {
    if (allowFailure) return null;
    throw new Error(`No JSON from orca ${args.join(" ")}`);
  }
  try {
    const parsed = JSON.parse(result.stdout.slice(start));
    if (!parsed.ok && !allowFailure) throw new Error(JSON.stringify(parsed.error));
    return parsed;
  } catch (error) {
    if (allowFailure) return null;
    throw error;
  }
}

function summary(id) {
  const response = spawnSync("curl", [
    "-sS",
    `https://map.naver.com/p/api/place/summary/${id}`,
    "-H",
    "referer: https://map.naver.com/",
    "-H",
    "accept: application/json",
    "-H",
    "user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/140.0 Safari/537.36"
  ], { encoding: "utf8", maxBuffer: 2 * 1024 * 1024 });
  if (response.status !== 0) throw new Error(`summary ${id}: curl ${response.status}`);
  const payload = JSON.parse(response.stdout);
  const p = payload?.data?.placeDetail;
  if (!p) throw new Error(`summary ${id}: missing placeDetail`);
  return {
    id: String(p.id),
    name: p.name,
    category: p.category?.category ?? null,
    address: p.address?.roadAddress || p.address?.address || null,
    formattedAddress: p.address?.formattedAddress ?? null,
    businessHoursSummary: p.businessHours?.description ?? null
  };
}

function snapshot(page) {
  return orca(["snapshot", "--page", page, "--json"]).result.snapshot;
}

function refFor(snapshotText, accessibleName) {
  const escaped = accessibleName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return snapshotText.match(new RegExp(`button "${escaped}" \\[ref=(e\\d+)\\]`))?.[1] ?? null;
}

function nextImageRef(snapshotText) {
  const line = snapshotText.split("\n").find((value) => value.includes('button "다음 이미지"'));
  if (!line || line.includes("[disabled")) return null;
  return line.match(/ref=(e\d+)/)?.[1] ?? null;
}

function imageUrls(page) {
  const response = orca(["network", "--page", page, "--limit", "1000", "--json"]);
  const urls = response.result.requests
    .map((request) => request.url)
    .filter((url) => url.startsWith("https://search.pstatic.net/common/") && url.includes("src="))
    .filter((url) => !url.includes("blogpfthumb-phinf") && !url.includes("profileImage"));
  const seen = new Set();
  return urls.filter((url) => {
    let key = url;
    try { key = new URL(url).searchParams.get("src") || url; } catch {}
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 12);
}

const venues = [];
for (let index = 0; index < candidates.length; index += 1) {
  const candidate = candidates[index];
  const meta = summary(candidate.id);
  const placeUrl = `https://map.naver.com/p/entry/place/${candidate.id}?placePath=%2Fphoto%3FfilterType%3DAI%2520View%26subFilter%3DINTERIOR`;
  const created = orca(["tab", "create", "--url", placeUrl, "--json"]);
  const page = created.result.browserPageId;
  let snap = snapshot(page);
  const firstRef = refFor(snap, "aiView_0");
  let viewerOpened = false;
  if (firstRef) {
    viewerOpened = Boolean(orca(["click", "--page", page, "--element", `@${firstRef}`, "--json"], { allowFailure: true })?.ok);
  }
  if (viewerOpened) {
    for (let imageIndex = 1; imageIndex < 12; imageIndex += 1) {
      snap = snapshot(page);
      const nextRef = nextImageRef(snap);
      if (!nextRef) break;
      const clicked = orca(["click", "--page", page, "--element", `@${nextRef}`, "--json"], { allowFailure: true });
      if (!clicked?.ok) break;
    }
  }
  const images = imageUrls(page);
  venues.push({
    ...meta,
    district: candidate.district,
    naverMapUrl: `https://map.naver.com/p/entry/place/${candidate.id}?placePath=/photo`,
    photoFilter: "AI View > 내부",
    imageCount: images.length,
    images
  });
  console.log(`[${index + 1}/${candidates.length}] ${meta.name}: ${images.length} internal-image URLs`);
}

const manifest = {
  schemaVersion: "naver-map-cafe-interior-evidence/v1",
  observedAt: new Date().toISOString(),
  constraints: {
    sourceAllowlist: ["map.naver.com", "pcmap.place.naver.com", "search.pstatic.net"],
    reviewsUsedForScoring: false,
    reviewTextRetained: false,
    photoFilter: "네이버 지도 사진 > AI View > 내부",
    candidateCount: venues.length,
    imageCount: venues.reduce((sum, venue) => sum + venue.images.length, 0),
    scoreFieldsPresent: false
  },
  venues
};

const output = join(dir, "naver-map-raw-image-manifest.json");
writeFileSync(output, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Wrote ${output}`);
