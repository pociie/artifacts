import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const readJson = (name) => JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
const rubric = readJson('report-publication-rubric-v6.json');
const content = readJson('self-introduction-content-v5.json');
const assessment = readJson('assessment-operation-v5.json');
const html = fs.readFileSync(path.join(root, 'self-introduction-5sets-v6.html'), 'utf8');
const pdfPath = path.join(root, 'self-introduction-5sets-v6.pdf');
const pdf = fs.existsSync(pdfPath) ? fs.readFileSync(pdfPath).toString('latin1') : '';

const unique = (values) => [...new Set(values)];
const urlsIn = (value) => unique(value.match(/https?:\/\/[^"'< ]+/g) || []);
const hasPath = (value, dottedPath) => dottedPath.split('.').reduce((current, key) => current && current[key], value) !== undefined;
const count = (pattern, value) => (value.match(pattern) || []).length;
const visibleText = (value) => value
  .replace(/<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<script[\s\S]*?<\/script>/gi, ' ')
  .replace(/data:image\/[^;]+;base64,[A-Za-z0-9+/=]+/g, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/\s+/g, ' ');

const pdfTextStats = () => {
  let textStreams = 0;
  let textOperators = 0;
  const flateStreamPattern = /(<<[\s\S]*?>>)\s*stream\r?\n([\s\S]*?)\r?\nendstream/g;
  for (const match of pdf.matchAll(flateStreamPattern)) {
    if (!match[1].includes('/FlateDecode')) continue;
    try {
      const inflated = zlib.inflateSync(Buffer.from(match[2], 'latin1')).toString('latin1');
      const operators = inflated.match(/(?:\bTj\b|\bTJ\b)/g) || [];
      if (/\bBT\b/.test(inflated) && operators.length) {
        textStreams += 1;
        textOperators += operators.length;
      }
    } catch {
      // Image and font streams can also use FlateDecode; non-text streams are ignored.
    }
  }
  return {
    textStreams,
    textOperators,
    toUnicodeMaps: count(/\/ToUnicode\b/g, pdf)
  };
};

function check(checkSpec) {
  switch (checkSpec.type) {
    case 'visibleSources': {
      const actual = urlsIn(html);
      const expected = unique(checkSpec.allowedUrls || []);
      return { status: JSON.stringify(actual) === JSON.stringify(expected) ? 'pass' : 'fail', evidence: { actual, expected } };
    }
    case 'forbiddenTokens': {
      const textSurface = visibleText(html);
      const findings = (checkSpec.tokens || []).filter((token) => textSurface.includes(token.value)).map((token) => ({ value: token.value, reason: token.reason }));
      return { status: findings.length ? 'fail' : 'pass', evidence: { findings, checkedCount: (checkSpec.tokens || []).length } };
    }
    case 'htmlPageCount': {
      const actual = count(/class="page"/g, html);
      return { status: actual === checkSpec.expected ? 'pass' : 'fail', evidence: { actual, expected: checkSpec.expected } };
    }
    case 'answerInventory': {
      const answers = content.sets.flatMap((set) => Object.values(set.answers));
      const lengths = answers.map((answer) => [...answer].length);
      const scores = assessment.assessments.map((item) => item.postRevision.score);
      const inRange = lengths.every((length) => length >= checkSpec.minChars && length <= checkSpec.maxChars);
      const scorePass = scores.every((score) => score >= checkSpec.minScore);
      return {
        status: answers.length === checkSpec.expectedAnswers && inRange && scorePass ? 'pass' : 'fail',
        evidence: { answerCount: answers.length, expectedAnswers: checkSpec.expectedAnswers, minLength: Math.min(...lengths), maxLength: Math.max(...lengths), requiredRange: [checkSpec.minChars, checkSpec.maxChars], scores, minScore: checkSpec.minScore }
      };
    }
    case 'liveEssayText': {
      const actual = count(/class="essay-text"/g, html);
      return { status: actual === checkSpec.expectedBlocks ? 'pass' : 'fail', evidence: { liveTextBlocks: actual, expectedBlocks: checkSpec.expectedBlocks } };
    }
    case 'pdfTextLayer': {
      const actual = pdfTextStats();
      const pass = actual.textStreams >= checkSpec.minTextStreams
        && actual.textOperators >= checkSpec.minTextOperators
        && actual.toUnicodeMaps >= checkSpec.minToUnicodeMaps;
      return {
        status: pass ? 'pass' : 'fail',
        evidence: {
          ...actual,
          minimums: {
            textStreams: checkSpec.minTextStreams,
            textOperators: checkSpec.minTextOperators,
            toUnicodeMaps: checkSpec.minToUnicodeMaps
          }
        }
      };
    }
    case 'pdfFile': {
      const actual = fs.existsSync(pdfPath) ? fs.statSync(pdfPath).size : 0;
      return { status: actual >= checkSpec.minBytes ? 'pass' : 'fail', evidence: { bytes: actual, minBytes: checkSpec.minBytes } };
    }
    case 'pdfPageCount': {
      const actual = count(/\/Type\s*\/Page\b/g, pdf);
      return { status: actual === checkSpec.expected ? 'pass' : 'fail', evidence: { actual, expected: checkSpec.expected } };
    }
    case 'renderValidation': {
      const file = path.join(root, 'render-validation-v6.json');
      if (!fs.existsSync(file)) return { status: 'unavailable', evidence: { reason: 'render-validation-v6.json is absent' } };
      const result = JSON.parse(fs.readFileSync(file, 'utf8'));
      const overflow = result.overflowPages || [];
      return { status: result.pageCount === checkSpec.expectedPages && overflow.length <= checkSpec.maxOverflowPages ? 'pass' : 'fail', evidence: { pageCount: result.pageCount, expectedPages: checkSpec.expectedPages, overflowPages: overflow, maxOverflowPages: checkSpec.maxOverflowPages } };
    }
    case 'rasterAssets': {
      const directory = path.join(root, checkSpec.directory);
      const details = (checkSpec.names || []).map((name) => {
        const file = path.join(directory, `${name}.${checkSpec.format}`);
        return { name, exists: fs.existsSync(file), bytes: fs.existsSync(file) ? fs.statSync(file).size : 0 };
      });
      const pass = details.every((item) => item.exists && item.bytes >= checkSpec.minBytes) && count(/data:image\/png;base64,/g, html) >= checkSpec.names.length;
      return { status: pass ? 'pass' : 'fail', evidence: { format: checkSpec.format, details, embeddedCount: count(/data:image\/png;base64,/g, html) } };
    }
    case 'jsonFields': {
      const file = path.join(root, checkSpec.file);
      if (!fs.existsSync(file)) return { status: 'unavailable', evidence: { reason: `missing ${checkSpec.file}` } };
      const value = JSON.parse(fs.readFileSync(file, 'utf8'));
      const missing = (checkSpec.requiredPaths || []).filter((field) => !hasPath(value, field));
      return { status: missing.length ? 'fail' : 'pass', evidence: { file: checkSpec.file, requiredPaths: checkSpec.requiredPaths, missing } };
    }
    case 'unavailable':
      return { status: 'unavailable', evidence: { reason: checkSpec.reason } };
    default:
      return { status: 'unavailable', evidence: { reason: `unsupported check type: ${checkSpec.type}` } };
  }
}

export function runAssessment({ write = true } = {}) {
  const criteria = rubric.criteria.map((criterion) => {
    const checks = criterion.checks.map((checkSpec) => ({ id: checkSpec.id, ...check(checkSpec) }));
    const status = checks.some((item) => item.status === 'fail') ? 'fail' : checks.some((item) => item.status === 'unavailable') ? 'unavailable' : 'pass';
    return { id: criterion.id, kind: criterion.kind, status, checks, limitation: criterion.limitation };
  });
  const mandatory = criteria.filter((criterion) => criterion.kind === 'mandatory');
  const qualifying = criteria.filter((criterion) => criterion.kind === 'qualifying');
  const observational = criteria.filter((criterion) => criterion.kind === 'observational');
  const mandatoryGate = mandatory.every((criterion) => criterion.status === 'pass');
  const qualifyingPassRate = qualifying.length ? qualifying.filter((criterion) => criterion.status === 'pass').length / qualifying.length : 1;
  const qualifyingGate = qualifyingPassRate >= rubric.decision.qualifyingMinimumPassRate;
  const valid = mandatoryGate && qualifyingGate;
  const result = {
    kind: 'publication-rubric-assessment/v1',
    rubricRef: 'report-publication-rubric-v6.json',
    rubricId: rubric.rubricId,
    rubricRevision: rubric.revision,
    status: valid ? 'passed' : 'blocked',
    authorityEffect: 'none',
    decision: {
      valid,
      mandatoryGate: mandatoryGate ? 'pass' : 'fail',
      qualifyingGate: qualifyingGate ? 'pass' : 'fail',
      qualifyingPassRate,
      qualifyingRequired: rubric.decision.qualifyingMinimumPassRate,
      noCompensation: rubric.decision.noCompensation,
      interpretation: rubric.decision.finalUse
    },
    criteria,
    observationalUnknowns: observational.filter((criterion) => criterion.status === 'unavailable').map((criterion) => ({ id: criterion.id, limitation: criterion.limitation })),
    observedAt: new Date().toISOString()
  };
  if (write) fs.writeFileSync(path.join(root, 'publication-assessment-v6.json'), JSON.stringify(result, null, 2));
  return result;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = runAssessment({ write: true });
  console.log(JSON.stringify(result, null, 2));
  process.exitCode = result.decision.valid ? 0 : 1;
}
