import { runAssessment } from './assess-report-v6.mjs';

const result = runAssessment({ write: true });
console.log(JSON.stringify(result, null, 2));
process.exitCode = result.decision.valid ? 0 : 1;
