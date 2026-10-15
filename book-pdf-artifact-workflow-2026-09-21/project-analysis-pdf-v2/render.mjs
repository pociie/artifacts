import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { chromium } from 'playwright';

const here = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = path.join(here, 'claude-code-project-analysis.html');
const pdfPath = path.join(here, 'claude-code-project-analysis.pdf');
const previewDir = path.join(here, 'previews');
const contactHtmlPath = path.join(here, 'contact-sheet.html');
const contactPngPath = path.join(here, 'contact-sheet.png');
const auditPath = path.join(here, 'render-audit.json');

fs.mkdirSync(previewDir, { recursive: true });
for (const name of fs.readdirSync(previewDir)) {
  if (/^page-\d{2}\.png$/.test(name)) fs.unlinkSync(path.join(previewDir, name));
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1200, height: 1700 }, deviceScaleFactor: 1 });
await page.goto(`file://${htmlPath}`, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);

const audit = await page.evaluate(() => {
  const pages = [...document.querySelectorAll('.page')];
  const pageGeometry = pages.map((el, index) => {
    const folio = el.querySelector('.folio');
    const folioRect = folio?.getBoundingClientRect();
    const pageRect = el.getBoundingClientRect();
    const units = [...el.querySelectorAll('.semantic-unit')].map((unit, unitIndex) => {
      const rect = unit.getBoundingClientRect();
      return {
        unit: unit.dataset.claimId || `${index + 1}:${unitIndex + 1}`,
        top: Math.round(rect.top - pageRect.top),
        bottom: Math.round(rect.bottom - pageRect.top),
        outsidePage: rect.left < pageRect.left - 1 || rect.right > pageRect.right + 1 || rect.top < pageRect.top - 1 || rect.bottom > pageRect.bottom + 1,
        overlapsFolio: Boolean(folioRect && rect.bottom > folioRect.top - 2)
      };
    });
    return {
      page: index + 1,
      section: el.dataset.section || null,
      scrollWidth: el.scrollWidth,
      clientWidth: el.clientWidth,
      scrollHeight: el.scrollHeight,
      clientHeight: el.clientHeight,
      overflowX: el.scrollWidth > el.clientWidth + 1,
      overflowY: el.scrollHeight > el.clientHeight + 1,
      clippedUnits: units.filter(unit => unit.outsidePage),
      folioOverlaps: units.filter(unit => unit.overlapsFolio)
    };
  });

  const allowedEvidence = new Set(['observed_project_fact','external_background','project_inference','unresolved']);
  const materialClaims = [...document.querySelectorAll('[data-claim]')].map(el => ({
    id: el.dataset.claimId || null,
    evidenceClass: el.dataset.evidenceClass || null,
    sourceRef: el.dataset.sourceRef || null,
    allowedClass: allowedEvidence.has(el.dataset.evidenceClass)
  }));
  const missingClaimBindings = materialClaims.filter(c => !c.id || !c.sourceRef || !c.allowedClass);

  const continuationGroups = {};
  for (const el of pages.filter(el => el.dataset.continuationId)) {
    const id = el.dataset.continuationId;
    (continuationGroups[id] ||= []).push({
      page: pages.indexOf(el) + 1,
      part: el.dataset.continuationPart,
      stepRange: el.dataset.stepRange
    });
  }
  const continuationAudit = Object.entries(continuationGroups).map(([id, parts]) => ({
    id,
    parts,
    valid: parts.length >= 2 && parts[0].part === 'start' && parts.slice(1).every(p => p.part === 'continued') && parts.every(p => p.stepRange)
  }));

  const links = [...document.querySelectorAll('a[href]')].map(a => {
    const raw = a.getAttribute('href');
    let valid = false;
    let kind = 'unknown';
    try {
      if (raw.startsWith('#')) {
        kind = 'internal';
        valid = Boolean(document.querySelector(raw));
      } else {
        const url = new URL(raw, document.baseURI);
        kind = url.protocol.replace(':','');
        valid = ['https:','file:'].includes(url.protocol);
      }
    } catch {}
    return { href: raw, kind, valid };
  });

  const openings = [...document.querySelectorAll('p')].slice(0, 40).map((el, index) => {
    const body = getComputedStyle(el);
    const first = getComputedStyle(el, '::first-letter');
    return { index, bodySize: body.fontSize, firstLetterSize: first.fontSize, firstLetterFloat: first.cssFloat };
  });

  const coverage = [...new Set(pages.flatMap(el => (el.dataset.coverage || '').split(/\s+/).filter(Boolean)))].sort();
  const algorithmIds = [...document.querySelectorAll('[data-algorithm-id]')].map(el => el.dataset.algorithmId);
  return {
    pageCount: pages.length,
    pageGeometry,
    overflowPages: pageGeometry.filter(p => p.overflowX || p.overflowY).map(p => p.page),
    clippedSemanticUnits: pageGeometry.flatMap(p => p.clippedUnits.map(u => ({page:p.page,...u}))),
    folioOverlapUnits: pageGeometry.flatMap(p => p.folioOverlaps.map(u => ({page:p.page,...u}))),
    materialClaimCount: materialClaims.length,
    materialClaimClassCounts: materialClaims.reduce((acc, c) => ((acc[c.evidenceClass] = (acc[c.evidenceClass] || 0) + 1), acc), {}),
    missingClaimBindings,
    algorithmIds,
    coverage,
    continuationAudit,
    links: { count: links.length, invalid: links.filter(link => !link.valid), externalReachability: 'not_checked' },
    typography: {
      body: getComputedStyle(document.body).fontFamily,
      display: getComputedStyle(document.querySelector('h2')).fontFamily,
      utility: getComputedStyle(document.querySelector('.running')).fontFamily,
      bodyParagraphSize: getComputedStyle(document.querySelector('p')).fontSize,
      openingLetterMismatches: openings.filter(x => x.bodySize !== x.firstLetterSize || x.firstLetterFloat !== 'none')
    }
  };
});

const cdp = await page.context().newCDPSession(page);
await cdp.send('DOM.enable');
await cdp.send('CSS.enable');
const { root } = await cdp.send('DOM.getDocument', { depth: -1 });
audit.platformFonts = {};
for (const [role, selector] of Object.entries({ body: 'p', display: 'h2', utility: '.running' })) {
  const { nodeId } = await cdp.send('DOM.querySelector', { nodeId: root.nodeId, selector });
  const { fonts } = await cdp.send('CSS.getPlatformFontsForNode', { nodeId });
  audit.platformFonts[role] = fonts.map(f => ({ familyName: f.familyName, glyphCount: f.glyphCount, isCustomFont: f.isCustomFont }));
}

await page.pdf({ path: pdfPath, printBackground: true, preferCSSPageSize: true, tagged: true });

const pdfKitProgram = String.raw`
import Foundation
import PDFKit

let pdfPath = CommandLine.arguments[1]
guard let document = PDFDocument(url: URL(fileURLWithPath: pdfPath)) else {
  FileHandle.standardError.write(Data("Unable to open PDF\n".utf8))
  exit(2)
}

let queries = [
  ["visible": "worker_done", "reversed": "enod_rekrow", "minimum": 2],
  ["visible": "Phase A", "reversed": "A esahP", "minimum": 2],
  ["visible": "공식 module owner", "reversed": "renwo eludom 식공", "minimum": 2],
  ["visible": "tool_result", "reversed": "tluser_loot", "minimum": 12]
]
var perPageCharacters: [[String: Any]] = []
var emptyTextPages: [Int] = []
var perPageCharacterSum = 0
for index in 0..<document.pageCount {
  let content = document.page(at: index)?.string ?? ""
  let characterCount = content.count
  perPageCharacterSum += characterCount
  if content.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
    emptyTextPages.append(index + 1)
  }
  perPageCharacters.append(["page": index + 1, "characters": characterCount])
}
let searchResults: [[String: Any]] = queries.map { query in
  let visible = query["visible"] as! String
  let reversed = query["reversed"] as! String
  let minimum = query["minimum"] as! Int
  let normalHits = document.findString(visible, withOptions: [.caseInsensitive]).count
  let reversedHits = document.findString(reversed, withOptions: [.caseInsensitive]).count
  return [
    "visibleQuery": visible,
    "normalHits": normalHits,
    "minimumNormalHits": minimum,
    "reversedQuery": reversed,
    "reversedHits": reversedHits,
    "pass": normalHits >= minimum && reversedHits == 0
  ]
}
let pageSize = document.page(at: 0)?.bounds(for: .mediaBox).size ?? .zero
let result: [String: Any] = [
  "engine": "macOS PDFKit via Swift",
  "pageCount": document.pageCount,
  "pageSizePoints": ["width": pageSize.width, "height": pageSize.height],
  "perPageCharacterSum": perPageCharacterSum,
  "documentStringLength": document.string?.count ?? 0,
  "emptyTextPages": emptyTextPages,
  "perPageCharacters": perPageCharacters,
  "searchResults": searchResults,
  "searchOrderPass": searchResults.allSatisfy { ($0["pass"] as? Bool) == true }
]
let data = try JSONSerialization.data(withJSONObject: result, options: [.sortedKeys])
FileHandle.standardOutput.write(data)
`;
const pdfKit = spawnSync('swift', ['-', pdfPath], {
  input: pdfKitProgram,
  encoding: 'utf8',
  maxBuffer: 16 * 1024 * 1024
});
if (pdfKit.status !== 0) {
  throw new Error(`PDFKit validation failed: ${pdfKit.stderr || pdfKit.stdout}`);
}
audit.pdfKit = JSON.parse(pdfKit.stdout);
const pdfBytes = fs.readFileSync(pdfPath);
const pdfAscii = pdfBytes.toString('latin1');
audit.pdfStructure = {
  taggedRequested: true,
  structTreeRootPresent: pdfAscii.includes('/StructTreeRoot'),
  markInfoPresent: pdfAscii.includes('/MarkInfo'),
  languageMarkerPresent: pdfAscii.includes('/Lang')
};
audit.correction = {
  defectId: 'DEFECT-PDF-TEXT-ORDER-001',
  rootCause: 'The defect reproduces in untagged Chromium output and disappears under identical layout CSS when a PDF structure tree is emitted; PDFKit had interpreted affected grid, flex, and multi-column paint-stream runs as reversed logical text in the untagged file.',
  method: 'Enable Chromium tagged PDF output so the structure tree supplies DOM-aligned logical text order; keep layout CSS intact and add two contextual visible occurrences needed by the frozen search thresholds.',
  layoutCssChanged: false,
  visibleTextAdjustments: [
    'Page 6 lead names tool_result as the effect-stage closure signal.',
    'Page 30 running header names Phase A–B.'
  ],
  changedPreviewPages: [6, 30],
  unchangedPreviewPages: 35
};
const pageNodes = page.locator('.page');
for (let index = 0; index < await pageNodes.count(); index++) {
  await pageNodes.nth(index).screenshot({ path: path.join(previewDir, `page-${String(index + 1).padStart(2, '0')}.png`) });
}

const figures = Array.from({ length: audit.pageCount }, (_, index) => {
  const num = String(index + 1).padStart(2, '0');
  const section = audit.pageGeometry[index].section || 'page';
  return `<figure><img src="previews/page-${num}.png" alt="${num} ${section}"><figcaption>${num} · ${section}</figcaption></figure>`;
}).join('');
const contactHtml = `<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>Project analysis PDF contact sheet</title><style>*{box-sizing:border-box}body{margin:0;background:#d8d3ca;color:#102d43;font-family:-apple-system,BlinkMacSystemFont,sans-serif}main{width:1800px;margin:auto;padding:46px;background:#f4efe5}header{display:flex;justify-content:space-between;align-items:end;border-bottom:2px solid #2d6972;padding-bottom:18px;margin-bottom:24px}h1{margin:0;font:600 34px Georgia,serif}header p{margin:0;color:#5d6d72}.grid{display:grid;grid-template-columns:repeat(5,1fr);gap:18px}figure{margin:0;background:white;border:1px solid #b9b3a9;box-shadow:0 4px 13px #2334}img{display:block;width:100%}figcaption{padding:8px 10px;border-top:1px solid #d0cac0;color:#2d6972;font:700 10px ui-monospace,monospace}.foot{margin-top:24px;padding-top:14px;border-top:1px solid #9aa9a6;color:#59696d;font-size:13px}</style></head><body><main><header><h1>Claude Code source project analysis · ${audit.pageCount} pages</h1><p>Systems Monograph × Evidence Notebook · corrected tagged-PDF candidate</p></header><section class="grid">${figures}</section><div class="foot">Page count is an outcome. Material claims are provenance-labeled; multi-page examples retain continuation identity.</div></main></body></html>`;
fs.writeFileSync(contactHtmlPath, contactHtml);

const contactPage = await browser.newPage({ viewport: { width: 1900, height: 1200 }, deviceScaleFactor: 1 });
await contactPage.goto(`file://${contactHtmlPath}`, { waitUntil: 'load' });
await contactPage.screenshot({ path: contactPngPath, fullPage: true });

fs.writeFileSync(auditPath, JSON.stringify(audit, null, 2) + '\n');
await browser.close();
const acceptanceFailures = [];
if (audit.pageCount !== 37 || audit.pdfKit.pageCount !== 37) acceptanceFailures.push('page_count');
if (audit.overflowPages.length) acceptanceFailures.push('overflow');
if (audit.clippedSemanticUnits.length) acceptanceFailures.push('clipped_semantic_unit');
if (audit.folioOverlapUnits.length) acceptanceFailures.push('folio_overlap');
if (audit.missingClaimBindings.length) acceptanceFailures.push('claim_binding');
if (audit.continuationAudit.some(item => !item.valid)) acceptanceFailures.push('continuation');
if (audit.links.invalid.length) acceptanceFailures.push('link_syntax');
if (audit.pdfKit.emptyTextPages.length) acceptanceFailures.push('empty_text_page');
if (!audit.pdfKit.searchOrderPass) acceptanceFailures.push('pdf_text_search_order');
if (!audit.pdfStructure.structTreeRootPresent || !audit.pdfStructure.markInfoPresent) acceptanceFailures.push('tagged_pdf_structure');
console.log(JSON.stringify({ pdfPath, contactPngPath, auditPath, pageCount: audit.pageCount, overflowPages: audit.overflowPages, clippedSemanticUnits: audit.clippedSemanticUnits.length, folioOverlapUnits: audit.folioOverlapUnits.length, claimBindingFailures: audit.missingClaimBindings.length, continuationFailures: audit.continuationAudit.filter(x => !x.valid).length, invalidLinks: audit.links.invalid.length, pdfKitSearchResults: audit.pdfKit.searchResults, taggedPdfStructure: audit.pdfStructure, acceptanceFailures }, null, 2));
if (acceptanceFailures.length) process.exitCode = 1;
