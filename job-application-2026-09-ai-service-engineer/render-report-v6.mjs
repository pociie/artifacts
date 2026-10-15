import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from 'playwright';

const root = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = path.join(root, 'self-introduction-5sets-v6.html');
const outputDir = path.join(root, 'render-check-v6');
fs.mkdirSync(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1240, height: 1754 }, deviceScaleFactor: 1 });
await page.goto(pathToFileURL(htmlPath).href, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);

const pages = await page.evaluate(() => [...document.querySelectorAll('.page')].map((element, index) => ({
  page: index + 1,
  height: element.clientHeight,
  scrollHeight: element.scrollHeight,
  overflowPx: Math.max(0, element.scrollHeight - element.clientHeight),
  textLength: element.innerText.length
})));

for (const item of pages) {
  await page.locator('.page').nth(item.page - 1).screenshot({ path: path.join(outputDir, `page-${String(item.page).padStart(2, '0')}.png`), type: 'png' });
}

const result = {
  html: htmlPath,
  pageCount: pages.length,
  pages,
  overflowPages: pages.filter((item) => item.overflowPx > 2).map((item) => item.page)
};
fs.writeFileSync(path.join(root, 'render-validation-v6.json'), JSON.stringify(result, null, 2));
await browser.close();
console.log(JSON.stringify(result, null, 2));
