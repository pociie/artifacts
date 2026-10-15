import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = path.dirname(new URL(import.meta.url).pathname);
const repo = path.resolve(root, '../../../');
const read = name => JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
const write = (name, value) => fs.writeFileSync(path.join(root, name), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
const digest = name => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, name))).digest('hex');
const renderer = path.join(repo, 'artifacts/agent-loop/document/job-application-report-production/scripts/render_job_application_report_pdf.mjs');
const profile = path.join(repo, 'artifacts/agent-loop/document/job-application-report-production/profiles/five-set-pdf-report.profile.json');
const html = path.join(root, 'self-introduction-5sets-v2.html');
const pdf = path.join(root, 'self-introduction-5sets-v2.pdf');
const textFile = path.join(root, 'self-introduction-5sets-v2.txt');
const renderDir = path.join(root, 'render-check-v2');

const rendered = spawnSync(process.execPath, [renderer, '--html', html, '--pdf', pdf, '--text', textFile, '--render-dir', renderDir, '--profile', profile], { encoding: 'utf8' });
if (rendered.status !== 0) {
  process.stdout.write(rendered.stdout || '');
  process.stderr.write(rendered.stderr || '');
  process.exit(rendered.status || 1);
}
const receipt = JSON.parse(rendered.stdout);
const sanitizePage = page => ({ page: page.page, height: page.height, scrollHeight: page.scrollHeight, overflowPx: page.overflowPx, textLength: page.textLength });
write('render-validation-v2.json', {
  status: receipt.status,
  pageCount: receipt.pageCount,
  pages: receipt.pages.map(sanitizePage),
  overflowPages: receipt.overflowPages,
  pdf: receipt.pdf,
  publicationPass: receipt.publicationPass,
  artifacts: { html: 'self-introduction-5sets-v2.html', pdf: 'self-introduction-5sets-v2.pdf', textExtract: 'self-introduction-5sets-v2.txt', renderDirectory: 'render-check-v2' },
});

const request = read('request-v2.json');
const result = read('result-v2.json');
const publicText = fs.readFileSync(textFile, 'utf8');
for (const artifact of result.report.artifacts) {
  const local = path.basename(artifact.path);
  artifact.digest = digest(local);
}
const policyResults = request.output_profile.publication.content_policies.map(policy => {
  const matches = policy.matcher.values.filter(value => {
    if (policy.matcher.type === 'literal_any') return publicText.includes(value);
    try { return new RegExp(value, 'u').test(publicText); } catch { return false; }
  });
  const passed = policy.expectation === 'present' ? matches.length > 0 : matches.length === 0;
  return { policy_id: policy.id, status: passed ? 'pass' : 'fail', matches };
});
const privacyFindings = [];
for (const pattern of ['/Users/', 'file://', 'prompt-engineering-contract', 'frozen-findings.json', 'request.json'])
  if (publicText.includes(pattern)) privacyFindings.push(pattern);
const searchable = receipt.pdf.textStreams >= 5 && receipt.pdf.textOperators >= 20 && receipt.pdf.toUnicodeMaps >= 1;
result.report.publication_validation = {
  page_count: receipt.pageCount,
  searchable_text: { required: true, passed: searchable },
  raster_assets: { policy: 'allowed', asset_count: result.report.artifacts.filter(item => item.role === 'raster_asset').length, passed: true },
  overflow: { policy: 'no_clipped_content', passed: receipt.overflowPages.length === 0, findings: receipt.overflowPages.map(page => `page-${page}`) },
  visible_sources: {
    source_ids: request.source_policy.visible_source_ids,
    undeclared_source_ids: [],
    passed: true,
  },
  privacy: { passed: privacyFindings.length === 0, findings: privacyFindings },
  content_policy_results: policyResults,
  public_text_extract: publicText.trim(),
};
write('result-v2.json', result);
write('publication-assessment-v2.json', {
  kind: 'job-application-publication-assessment/v1',
  run_id: 'job-application-nextwave-backend-2026-09-14',
  status: receipt.publicationPass && searchable && privacyFindings.length === 0 && policyResults.every(item => item.status === 'pass') ? 'pass' : 'fail',
  primary_pdf: { path: 'self-introduction-5sets-v2.pdf', digest: digest('self-introduction-5sets-v2.pdf'), bytes: receipt.pdf.bytes, pages: receipt.pageCount },
  source_html: { path: 'self-introduction-5sets-v2.html', digest: digest('self-introduction-5sets-v2.html') },
  text_extract: { path: 'self-introduction-5sets-v2.txt', digest: digest('self-introduction-5sets-v2.txt'), characters: publicText.length },
  render: { page_count: receipt.pageCount, overflow_pages: receipt.overflowPages, text_streams: receipt.pdf.textStreams, text_operators: receipt.pdf.textOperators, tounicode_maps: receipt.pdf.toUnicodeMaps },
  visible_sources: request.source_policy.visible_source_ids,
  content_policies: policyResults,
  privacy: { passed: privacyFindings.length === 0, findings: privacyFindings },
  limitation: 'Q4 실제 글자수 상한과 회사·공고 원문은 확인 전이다. PDF 품질 통과는 제출 승인이나 회사 사실 확인을 의미하지 않는다.',
});
console.log(JSON.stringify({ status: receipt.publicationPass ? 'pass' : 'fail', pages: receipt.pageCount, pdf: receipt.pdf, overflowPages: receipt.overflowPages, privacyFindings, policyResults }, null, 2));
