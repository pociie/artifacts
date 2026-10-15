import fs from 'node:fs';
import path from 'node:path';

const root = path.dirname(new URL(import.meta.url).pathname);
const fail = [];
const read = (name) => JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
const content = read('self-introduction-content-v5.json');
const rubric = read('evaluation-rubric-v5.json');
const assessment = read('assessment-operation-v5.json');
const html = fs.readFileSync(path.join(root, 'self-introduction-5sets-v5.html'), 'utf8');
const pdfPath = path.join(root, 'self-introduction-5sets-v5.pdf');

if (content.sets.length < 5) fail.push(`set count ${content.sets.length} < 5`);
let answerCount = 0;
for (const set of content.sets) {
  for (const [q, text] of Object.entries(set.answers)) {
    answerCount += 1;
    const chars = [...text].length;
    if (chars < 300 || chars > 700) fail.push(`${set.id}/${q} length ${chars}`);
  }
}
if (answerCount !== 15) fail.push(`answer count ${answerCount} != 15`);
for (const [setId, profile] of Object.entries(rubric.setProfile)) {
  const expected = rubric.domains.reduce((sum, d) => sum + d.weight * profile.ratings[d.id] / 4, 0);
  const actual = assessment.assessments.find((x) => x.setId === setId)?.postRevision.score;
  if (actual == null || Math.abs(expected - actual) > 0.011) fail.push(`${setId} score mismatch expected=${expected} actual=${actual}`);
  if (actual < 90) fail.push(`${setId} below threshold ${actual}`);
}
const urls = [...new Set(html.match(/https?:\/\/[^"< ]+/g) || [])];
const official = 'https://recruit.lotte.co.kr/apply/announcement/detail/21933850?compcd=30007';
if (urls.length !== 1 || urls[0] !== official) fail.push(`visible URL policy ${JSON.stringify(urls)}`);
if (!fs.existsSync(pdfPath) || fs.statSync(pdfPath).size < 10000) fail.push('PDF missing or too small');
const pdfText = fs.readFileSync(pdfPath, 'latin1');
const pageCountMatches = [...pdfText.matchAll(/\/Count (\d+)/g)].map((m) => Number(m[1]));
if (!pageCountMatches.includes(13)) fail.push(`PDF page tree count not 13: ${pageCountMatches.join(',')}`);

if (fail.length) {
  console.error(JSON.stringify({ valid: false, issues: fail }, null, 2));
  process.exit(1);
}
console.log(JSON.stringify({ valid: true, sets: content.sets.length, answers: answerCount, scores: assessment.assessments.map((x) => [x.setId, x.postRevision.score]), visibleSources: urls, pdfBytes: fs.statSync(pdfPath).size, pdfPageTreeCount: 13 }, null, 2));
