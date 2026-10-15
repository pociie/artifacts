import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const dir = dirname(fileURLToPath(import.meta.url));
const candidates = [
  ["강동구", "1785389032"], ["강동구", "35701210"],
  ["강동구", "1147652786"], ["강동구", "31905764"],
  ["강동구", "1545461507"], ["강동구", "2024584509"],
  ["강동구", "2014880028"], ["강동구", "1994359615"],
  ["중랑구", "18889495"], ["중랑구", "36998529"],
  ["중랑구", "1118755333"], ["중랑구", "38522522"],
  ["중랑구", "1395310222"], ["중랑구", "1131380509"]
];

function command(name, args, maxBuffer = 30 * 1024 * 1024) {
  const result = spawnSync(name, args, { encoding: "utf8", maxBuffer });
  if (result.status !== 0) throw new Error(`${name} failed: ${result.stderr || result.stdout}`);
  return result.stdout;
}

function orca(args) {
  const stdout = command("orca", args);
  const start = stdout.indexOf("{");
  if (start < 0) throw new Error(`No JSON from orca ${args.join(" ")}`);
  const parsed = JSON.parse(stdout.slice(start));
  if (!parsed.ok) throw new Error(JSON.stringify(parsed.error));
  return parsed.result;
}

function summary(id) {
  const payload = JSON.parse(command("curl", [
    "-sS", `https://map.naver.com/p/api/place/summary/${id}`,
    "-H", "referer: https://map.naver.com/",
    "-H", "accept: application/json",
    "-H", "user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/140.0 Safari/537.36"
  ], 2 * 1024 * 1024));
  const p = payload?.data?.placeDetail;
  if (!p) throw new Error(`Missing placeDetail for ${id}`);
  return {
    id: String(p.id), name: p.name,
    category: p.category?.category ?? null,
    address: p.address?.roadAddress || p.address?.address || null,
    formattedAddress: p.address?.formattedAddress ?? null
  };
}

function imagesForPage(page) {
  const requests = orca(["network", "--page", page, "--limit", "1000", "--json"]).requests;
  const seen = new Set();
  return requests.map((request) => request.url)
    .filter((url) => url.startsWith("https://search.pstatic.net/common/") && url.includes("src="))
    .filter((url) => !url.includes("blogpfthumb-phinf") && !url.includes("profileImage"))
    .filter((url) => {
      let key = url;
      try { key = new URL(url).searchParams.get("src") || url; } catch {}
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 12);
}

const tabs = orca(["tab", "list", "--json"]).tabs;
const entryPages = new Map();
for (const tab of tabs) {
  const id = tab.url.match(/\/entry\/place\/(\d+)/)?.[1];
  if (id) entryPages.set(id, tab.browserPageId);
}

const venues = [];
for (const [district, id] of candidates) {
  const page = entryPages.get(id);
  if (!page) continue;
  const meta = summary(id);
  const images = imagesForPage(page);
  venues.push({
    ...meta, district,
    naverMapUrl: `https://map.naver.com/p/entry/place/${id}?placePath=/photo`,
    photoFilter: "AI View > 내부",
    imageCount: images.length,
    images
  });
  console.log(`${meta.name}: ${images.length}`);
}

const manifest = {
  schemaVersion: "naver-map-cafe-interior-evidence/v1",
  observedAt: new Date().toISOString(),
  collectionArchitecture: {
    pattern: "checkpoint-recovery",
    browserPasses: 1,
    note: "중단 시점까지 이미 로드된 네이버 지도 탭의 네트워크 로그를 재탐색 없이 회수"
  },
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
console.log(`Wrote ${output} (${manifest.constraints.imageCount} images)`);
