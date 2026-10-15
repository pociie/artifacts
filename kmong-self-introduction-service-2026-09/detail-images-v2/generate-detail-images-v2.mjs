import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(root, '../../../..');
const sampleDir = path.join(repoRoot, '.collab/artifacts/job-application-2026-09-ai-service-engineer');
const reportAssetsDir = path.join(sampleDir, 'report-assets-v6');
const sourceDir = path.join(root, 'source');
const generatedDir = path.join(root, 'generated');
const renderDir = path.join(root, 'render-check');

for (const directory of [sourceDir, generatedDir, renderDir]) fs.mkdirSync(directory, { recursive: true });

const fileData = (filePath) => {
  const extension = path.extname(filePath).toLowerCase();
  const mime = extension === '.jpg' || extension === '.jpeg' ? 'image/jpeg' : 'image/png';
  return `data:${mime};base64,${fs.readFileSync(filePath).toString('base64')}`;
};

const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');

const lines = (value) => escapeHtml(value).replaceAll('\n', '<br>');
const background = fileData(path.join(sourceDir, 'background-texture.png'));

const reportPage = (name) => fileData(path.join(sampleDir, 'render-check-v6', name));
const reportAsset = (name) => fileData(path.join(reportAssetsDir, name));

const slides = [
  {
    id: 'detail-01',
    kicker: '01  시작점',
    title: '막막한 순간에,\n바로 시작하는 자기소개서',
    lead: '빈 화면에서 멈춰 있다면, 먼저 문항과 경험의 구조를 잡습니다.',
    kind: 'start',
    source: '표지 · cover-flow 도식'
  },
  {
    id: 'detail-02',
    kicker: '02  비교 가능한 초안',
    title: '한 방향이 아니라,\n비교 가능한 5세트',
    lead: '같은 경험도 관점과 순서에 따라 다르게 읽힙니다. 여러 방향을 비교해 내 말에 가까운 구성을 찾습니다.',
    kind: 'sets',
    source: '평가축과 작성안별 관찰 결과'
  },
  {
    id: 'detail-03',
    kicker: '03  경험 구조화',
    title: '프로젝트 경험을\n한 줄 성과가 아니라 흐름으로',
    lead: '무엇을 했는지뿐 아니라 왜 그렇게 했는지, 어디까지 기여했는지 보이게 만듭니다.',
    kind: 'project',
    source: '프로젝트 경험 구조화 도식'
  },
  {
    id: 'detail-04',
    kicker: '04  첨삭의 기준',
    title: '첨삭의 기준을\n다섯 렌즈로 나눕니다',
    lead: '문장만 다듬지 않고, 직무 연결부터 면접에서 다시 말할 수 있는지까지 확인합니다.',
    kind: 'lenses',
    source: '전문가 관점으로 진행한 첨삭'
  },
  {
    id: 'detail-05',
    kicker: '05  샘플 결과물',
    title: '샘플 보고서 한 장에서\n확인하는 것',
    lead: '초안만 나열하지 않고, 작성안의 관점과 검토 질문을 함께 남깁니다.',
    kind: 'sample',
    source: '작성안 1  사람의 판단을 돕는 AI 서비스'
  },
  {
    id: 'detail-06',
    kicker: '06  AI와 사람의 역할',
    title: 'AI는 빠르게,\n사람은 정확하게',
    lead: '빠르게 만드는 일과 책임 있게 확인하는 일을 분리해 안내합니다.',
    kind: 'roles',
    source: '샘플 보고서의 검토 흐름'
  },
  {
    id: 'detail-07',
    kicker: '07  점수의 의미',
    title: '점수는 합격 예측이\n아닙니다',
    lead: '샘플의 수치는 작성안을 비교하기 위한 편집 관찰 지표이며, 의미와 한계를 함께 표시합니다.',
    kind: 'score',
    source: '작성안별 편집 적합도'
  },
  {
    id: 'detail-08',
    kicker: '08  초안 이후',
    title: '초안의 선택은\n면접 준비로 이어집니다',
    lead: '후보를 고른 뒤 사실을 대조하고, 내 말로 설명할 수 있는지까지 점검합니다.',
    kind: 'interview',
    source: '세트 선택과 면접 준비'
  },
  {
    id: 'detail-09',
    kicker: '09  제출 전 확인',
    title: '제출 전에는\n5가지를 다시 확인합니다',
    lead: '초안에서 끝나지 않고, 다음 수정 행동과 최종 판단 기준까지 정리합니다.',
    kind: 'checklist',
    source: '제출 전 최종 판단'
  }
];

const chip = (label, tone = 'blue') => `<span class="chip ${tone}">${escapeHtml(label)}</span>`;

const evidenceImage = (source, className = '') => `<div class="evidence-frame ${className}">
  <div class="evidence-watermark">SAMPLE REPORT</div>
  <img src="${source}" alt="샘플 보고서 시각 자료">
</div>`;

const callout = (label, title, body, tone = 'blue') => `<div class="callout ${tone}">
  <div class="callout-label">${escapeHtml(label)}</div>
  <div class="callout-title">${escapeHtml(title)}</div>
  <div class="callout-body">${escapeHtml(body)}</div>
</div>`;

const step = (number, title, body, tone = '') => `<div class="step ${tone}">
  <div class="step-number">${escapeHtml(number)}</div>
  <div class="step-title">${escapeHtml(title)}</div>
  <div class="step-body">${escapeHtml(body)}</div>
</div>`;

const footer = (slide) => `<div class="footer">
  <div class="footer-left">AI 활용 자기소개서 초안 작성 및 첨삭 · ${escapeHtml(slide.source)}</div>
  <div class="footer-right">샘플 결과물 · 실제 범위는 패키지와 자료에 따라 달라집니다</div>
</div>`;

const base = (slide, content) => `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <style>
    @page { size: 1200px 1600px; margin: 0; }
    :root {
      --navy: #102c52;
      --ink: #152238;
      --muted: #5d6b7e;
      --blue: #2d67bf;
      --sky: #dfeafd;
      --gold: #f4bd57;
      --paper: #f8f4ec;
      --white: #fffdfa;
      --line: #d8e0ea;
      --red: #c94b43;
      --green: #3c7c67;
    }
    * { box-sizing: border-box; }
    html, body { margin: 0; width: 1200px; height: 1600px; }
    body { font-family: Pretendard, "Apple SD Gothic Neo", "Noto Sans KR", Arial, sans-serif; color: var(--ink); background: var(--navy); }
    .page { position: relative; width: 1200px; height: 1600px; overflow: hidden; background: var(--paper); }
    .page::before { content: ""; position: absolute; inset: 0; background-image: url('${background}'); background-size: cover; background-position: center; opacity: .28; }
    .page::after { content: ""; position: absolute; inset: 0; background: linear-gradient(115deg, rgba(255,253,248,.86), rgba(255,253,248,.68) 58%, rgba(231,239,249,.74)); pointer-events: none; }
    .inner { position: relative; z-index: 1; width: 1024px; margin: 0 auto; padding-top: 84px; }
    .topline { display: flex; justify-content: space-between; align-items: center; margin-bottom: 48px; }
    .brand { display: flex; align-items: center; gap: 12px; color: var(--navy); font-size: 18px; font-weight: 800; letter-spacing: -.04em; }
    .brand-mark { width: 30px; height: 30px; border-radius: 9px; background: var(--navy); position: relative; box-shadow: 7px 7px 0 rgba(45,103,191,.18); }
    .brand-mark::before, .brand-mark::after { content: ""; position: absolute; background: var(--gold); border-radius: 4px; }
    .brand-mark::before { width: 5px; height: 17px; left: 9px; top: 6px; transform: rotate(33deg); }
    .brand-mark::after { width: 5px; height: 12px; left: 17px; top: 9px; transform: rotate(33deg); opacity: .72; }
    .top-meta { color: var(--muted); font-size: 15px; font-weight: 700; letter-spacing: .02em; }
    .header { position: relative; }
    .kicker { color: var(--blue); font-size: 19px; font-weight: 900; letter-spacing: .06em; margin-bottom: 20px; }
    h1 { margin: 0; color: var(--navy); font-size: 58px; line-height: 1.12; letter-spacing: -.065em; font-weight: 900; }
    .lead { width: 850px; margin: 26px 0 0; color: #46556b; font-size: 25px; line-height: 1.55; letter-spacing: -.04em; font-weight: 600; }
    .proofbar { display: flex; align-items: center; gap: 12px; margin-top: 30px; }
    .proofbar .pill { padding: 9px 15px; border-radius: 999px; color: var(--navy); background: rgba(223,234,253,.88); border: 1px solid rgba(45,103,191,.16); font-size: 15px; font-weight: 800; }
    .proofbar .small { color: var(--muted); font-size: 14px; font-weight: 700; }
    .content { margin-top: 48px; }
    .card { background: rgba(255,253,250,.94); border: 1px solid rgba(216,224,234,.96); border-radius: 25px; box-shadow: 0 18px 48px rgba(16,44,82,.10); }
    .section-title { display: flex; justify-content: space-between; align-items: baseline; gap: 18px; color: var(--navy); font-size: 24px; font-weight: 900; letter-spacing: -.045em; }
    .section-title span { color: var(--muted); font-size: 14px; font-weight: 800; letter-spacing: 0; }
    .evidence-frame { position: relative; overflow: hidden; background: #eef2f7; border: 1px solid #d4deeb; border-radius: 19px; box-shadow: 0 14px 30px rgba(16,44,82,.13); }
    .evidence-frame img { display: block; width: 100%; height: 100%; object-fit: contain; }
    .evidence-watermark { position: absolute; z-index: 2; top: 13px; left: 14px; padding: 6px 9px; border-radius: 5px; background: rgba(16,44,82,.90); color: #fff; font-size: 10px; font-weight: 900; letter-spacing: .12em; }
    .wide-evidence { width: 100%; height: auto; display: block; border: 1px solid #d9e1eb; border-radius: 16px; background: white; }
    .chip { display: inline-flex; align-items: center; min-height: 31px; padding: 6px 11px; border-radius: 999px; font-size: 14px; font-weight: 900; letter-spacing: -.03em; }
    .chip.blue { color: var(--blue); background: var(--sky); }
    .chip.gold { color: #80530c; background: #fff0c9; }
    .chip.green { color: #27644e; background: #dceee6; }
    .chip.red { color: #873b34; background: #f8dfdb; }
    .note { color: var(--muted); font-size: 15px; line-height: 1.55; letter-spacing: -.035em; font-weight: 600; }
    .footer { position: absolute; z-index: 2; left: 88px; right: 88px; bottom: 36px; display: flex; justify-content: space-between; gap: 20px; padding-top: 16px; border-top: 1px solid rgba(16,44,82,.14); color: #68778b; font-size: 12px; line-height: 1.3; font-weight: 700; letter-spacing: -.02em; }
    .footer-right { text-align: right; }
    .highlight { color: var(--blue); font-weight: 900; }
    .gold-line { display: inline-block; height: 8px; border-radius: 999px; background: var(--gold); }
    .start-card { padding: 30px; }
    .problem-row { display: grid; grid-template-columns: 1fr 64px 1fr; align-items: center; gap: 14px; margin-bottom: 28px; }
    .problem-box { min-height: 164px; padding: 23px; border-radius: 18px; border: 1px solid #e2e7ed; }
    .problem-box.muted { background: #f4f5f5; }
    .problem-box.active { background: #e7f0ff; border-color: #b6cdf2; }
    .problem-label { color: var(--muted); font-size: 14px; font-weight: 900; margin-bottom: 12px; }
    .problem-box.active .problem-label { color: var(--blue); }
    .problem-title { color: var(--navy); font-size: 26px; line-height: 1.25; font-weight: 900; letter-spacing: -.06em; }
    .problem-body { margin-top: 10px; color: #5f6e80; font-size: 15px; line-height: 1.45; font-weight: 600; letter-spacing: -.035em; }
    .arrow { width: 52px; height: 52px; margin: auto; border-radius: 50%; color: white; background: var(--blue); display: grid; place-items: center; font-size: 27px; font-weight: 900; box-shadow: 0 8px 14px rgba(45,103,191,.25); }
    .flow-strip { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 20px; }
    .flow-item { padding: 19px 18px; border-radius: 15px; background: #f7f9fc; border: 1px solid #e1e7ee; }
    .flow-item b { display: block; color: var(--navy); font-size: 18px; letter-spacing: -.05em; }
    .flow-item span { display: block; margin-top: 7px; color: var(--muted); font-size: 14px; line-height: 1.4; font-weight: 600; }
    .sets-card { padding: 28px; }
    .set-tabs { display: flex; gap: 9px; margin: 18px 0 17px; }
    .set-tab { flex: 1; padding: 12px 10px; text-align: center; border-radius: 11px; color: var(--navy); background: #edf3fc; font-size: 15px; font-weight: 900; }
    .set-tab.active { color: white; background: var(--blue); box-shadow: 0 8px 14px rgba(45,103,191,.2); }
    .chart-wrap { padding: 15px; border: 1px solid #dae2eb; border-radius: 16px; background: white; }
    .chart-wrap img { width: 100%; height: auto; display: block; }
    .micro-note { margin-top: 12px; color: #718094; font-size: 13px; line-height: 1.4; font-weight: 700; letter-spacing: -.03em; }
    .three-cols { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 17px; }
    .mini-stat { padding: 18px; border-radius: 15px; background: #f6f8fb; border: 1px solid #e1e7ee; }
    .mini-stat b { display: block; color: var(--blue); font-size: 22px; font-weight: 900; }
    .mini-stat strong { display: block; margin-top: 5px; color: var(--navy); font-size: 16px; font-weight: 900; letter-spacing: -.05em; }
    .mini-stat span { display: block; margin-top: 8px; color: var(--muted); font-size: 13px; line-height: 1.42; font-weight: 600; }
    .project-card { padding: 30px; }
    .project-callout { display: grid; grid-template-columns: 1.05fr .95fr; gap: 24px; align-items: center; }
    .project-copy { padding: 16px 4px 16px 4px; }
    .project-copy .big { color: var(--navy); font-size: 33px; line-height: 1.23; letter-spacing: -.065em; font-weight: 900; }
    .project-copy p { margin: 18px 0 0; color: var(--muted); font-size: 16px; line-height: 1.55; font-weight: 600; letter-spacing: -.04em; }
    .project-flow { margin-top: 26px; padding: 16px; border-radius: 15px; background: white; border: 1px solid #d9e1eb; box-shadow: 0 9px 20px rgba(16,44,82,.08); }
    .project-flow img { display: block; width: 100%; height: auto; }
    .project-lenses { display: grid; grid-template-columns: repeat(5, 1fr); gap: 9px; margin-top: 24px; }
    .project-lens { padding: 14px 10px; min-height: 100px; border-top: 5px solid var(--blue); border-radius: 9px; background: #f6f8fc; }
    .project-lens:nth-child(2) { border-top-color: #4f8bd1; }
    .project-lens:nth-child(3) { border-top-color: var(--gold); }
    .project-lens:nth-child(4) { border-top-color: #69a48c; }
    .project-lens:nth-child(5) { border-top-color: #a37fc8; }
    .project-lens b { display: block; color: var(--navy); font-size: 14px; line-height: 1.25; letter-spacing: -.05em; }
    .project-lens span { display: block; margin-top: 8px; color: var(--muted); font-size: 12px; line-height: 1.35; font-weight: 600; }
    .lenses-card { padding: 28px; }
    .lens-grid { display: grid; grid-template-columns: .9fr 1.1fr; gap: 22px; align-items: start; }
    .lens-list { display: grid; gap: 11px; }
    .lens-item { display: grid; grid-template-columns: 38px 1fr; gap: 11px; align-items: start; padding: 15px; border-radius: 14px; background: #f6f8fb; border: 1px solid #e1e7ee; }
    .lens-num { width: 31px; height: 31px; display: grid; place-items: center; border-radius: 50%; color: white; background: var(--navy); font-size: 14px; font-weight: 900; }
    .lens-item b { display: block; color: var(--navy); font-size: 16px; letter-spacing: -.05em; }
    .lens-item span { display: block; margin-top: 5px; color: var(--muted); font-size: 13px; line-height: 1.35; font-weight: 600; }
    .page-evidence { height: 660px; }
    .sample-card { padding: 28px; }
    .sample-layout { display: grid; grid-template-columns: 1.17fr .83fr; gap: 24px; align-items: stretch; }
    .sample-page { height: 690px; }
    .sample-side { display: grid; gap: 12px; align-content: center; }
    .sample-side .callout { min-height: 145px; }
    .callout { padding: 18px 19px; border-radius: 15px; background: #f5f8fd; border: 1px solid #dce5f0; }
    .callout.gold { background: #fff8e8; border-color: #f1dfb5; }
    .callout.green { background: #eef8f3; border-color: #cbe5d8; }
    .callout.red { background: #fff1ef; border-color: #efd0cb; }
    .callout-label { color: var(--blue); font-size: 12px; font-weight: 900; letter-spacing: .09em; }
    .callout.gold .callout-label { color: #986b18; }
    .callout.green .callout-label { color: #33755d; }
    .callout.red .callout-label { color: #a34a42; }
    .callout-title { margin-top: 7px; color: var(--navy); font-size: 19px; font-weight: 900; letter-spacing: -.06em; }
    .callout-body { margin-top: 7px; color: var(--muted); font-size: 13px; line-height: 1.45; font-weight: 600; letter-spacing: -.035em; }
    .roles-card { padding: 28px; }
    .roles-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
    .role-box { padding: 22px; border-radius: 17px; min-height: 315px; }
    .role-box.ai { background: #eaf2ff; border: 1px solid #bfd4f5; }
    .role-box.human { background: #fff4d9; border: 1px solid #efd9a5; }
    .role-box h3 { margin: 0; color: var(--navy); font-size: 24px; letter-spacing: -.06em; }
    .role-box p { margin: 9px 0 18px; color: var(--muted); font-size: 14px; line-height: 1.42; font-weight: 600; }
    .role-list { display: grid; gap: 10px; }
    .role-list div { display: flex; gap: 10px; align-items: flex-start; color: var(--navy); font-size: 15px; line-height: 1.35; font-weight: 800; letter-spacing: -.045em; }
    .role-list i { flex: none; width: 20px; height: 20px; border-radius: 50%; background: var(--blue); position: relative; }
    .role-box.human .role-list i { background: #c68a26; }
    .role-list i::after { content: ""; position: absolute; width: 7px; height: 4px; left: 6px; top: 6px; border-left: 2px solid white; border-bottom: 2px solid white; transform: rotate(-45deg); }
    .role-result { margin-top: 16px; padding: 18px 21px; border-radius: 15px; background: var(--navy); color: white; }
    .role-result b { font-size: 19px; letter-spacing: -.05em; }
    .role-result span { display: block; margin-top: 7px; color: #d8e5f5; font-size: 14px; line-height: 1.45; font-weight: 600; }
    .role-evidence { display: grid; grid-template-columns: .85fr 1.15fr; gap: 16px; margin-top: 19px; align-items: center; }
    .role-evidence .page-evidence { height: 350px; }
    .score-card { padding: 28px; }
    .score-banner { display: grid; grid-template-columns: 1fr 290px; gap: 18px; align-items: center; padding: 19px 22px; border-radius: 17px; background: #fff1ef; border: 1px solid #f0d1cc; }
    .score-banner b { display: block; color: #8d3e37; font-size: 22px; letter-spacing: -.055em; }
    .score-banner span { display: block; margin-top: 7px; color: #a25d55; font-size: 14px; line-height: 1.4; font-weight: 700; }
    .score-badge { padding: 14px; border-radius: 13px; color: #7f332d; background: #ffe0db; text-align: center; font-size: 14px; line-height: 1.35; font-weight: 900; }
    .score-main { margin-top: 20px; padding: 20px; border-radius: 17px; background: white; border: 1px solid #d9e1eb; }
    .score-main-title { color: var(--navy); font-size: 21px; font-weight: 900; letter-spacing: -.05em; }
    .score-main img { width: 100%; height: auto; display: block; margin-top: 13px; }
    .score-legend { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 16px; }
    .score-legend div { padding: 14px; border-radius: 13px; background: #f6f8fb; border: 1px solid #e1e7ee; }
    .score-legend b { display: block; color: var(--navy); font-size: 15px; letter-spacing: -.04em; }
    .score-legend span { display: block; margin-top: 6px; color: var(--muted); font-size: 12px; line-height: 1.35; font-weight: 600; }
    .interview-card { padding: 28px; }
    .interview-top { display: grid; grid-template-columns: 1.22fr .78fr; gap: 20px; align-items: center; }
    .selection-flow { padding: 17px; background: white; border: 1px solid #d9e1eb; border-radius: 16px; }
    .selection-flow img { display: block; width: 100%; height: auto; }
    .interview-evidence { height: 270px; }
    .interview-steps { display: grid; grid-template-columns: repeat(5, 1fr); gap: 9px; margin-top: 22px; }
    .interview-steps .step { min-height: 126px; }
    .step { padding: 17px; border-radius: 14px; background: #f6f8fb; border: 1px solid #dfe6ee; }
    .step-number { color: var(--blue); font-size: 13px; font-weight: 900; letter-spacing: .05em; }
    .step-title { margin-top: 8px; color: var(--navy); font-size: 17px; font-weight: 900; letter-spacing: -.06em; }
    .step-body { margin-top: 6px; color: var(--muted); font-size: 12px; line-height: 1.38; font-weight: 600; letter-spacing: -.035em; }
    .check-card { padding: 28px; }
    .check-layout { display: grid; grid-template-columns: .84fr 1.16fr; gap: 20px; align-items: stretch; }
    .check-list { display: grid; gap: 10px; }
    .check-item { display: grid; grid-template-columns: 37px 1fr; gap: 12px; align-items: start; padding: 16px; border-radius: 14px; background: white; border: 1px solid #dfe6ee; }
    .check-icon { width: 29px; height: 29px; border-radius: 50%; background: var(--green); position: relative; }
    .check-icon::after { content: ""; position: absolute; width: 10px; height: 5px; left: 8px; top: 9px; border-left: 2px solid white; border-bottom: 2px solid white; transform: rotate(-45deg); }
    .check-item b { display: block; color: var(--navy); font-size: 16px; letter-spacing: -.05em; }
    .check-item span { display: block; margin-top: 4px; color: var(--muted); font-size: 12px; line-height: 1.35; font-weight: 600; }
    .check-evidence { height: 660px; }
    .final-cta { margin-top: 19px; padding: 20px 22px; border-radius: 16px; background: var(--navy); color: white; }
    .final-cta b { font-size: 22px; letter-spacing: -.06em; }
    .final-cta span { display: block; margin-top: 7px; color: #d9e4f3; font-size: 14px; line-height: 1.4; font-weight: 600; }
  </style>
</head>
<body>
  <main class="page">
    <div class="inner">
      <div class="topline">
        <div class="brand"><span class="brand-mark"></span><span>AI 문제 해결형 자기소개서 서비스</span></div>
        <div class="top-meta">SAMPLE DETAIL PAGE · ${String(slide.id).slice(-2)}</div>
      </div>
      <header class="header">
        <div class="kicker">${escapeHtml(slide.kicker)}</div>
        <h1>${lines(slide.title)}</h1>
        <p class="lead">${escapeHtml(slide.lead)}</p>
        <div class="proofbar"><span class="pill">샘플 보고서 기반</span><span class="pill">AI 보조 + 사람의 검토</span><span class="small">실제 보고서의 도식과 페이지를 시각 자료로 사용했습니다.</span></div>
      </header>
      <section class="content">${content}</section>
    </div>
    ${footer(slide)}
  </main>
</body>
</html>`;

const contentFor = (slide) => {
  switch (slide.kind) {
    case 'start':
      return `<div class="card start-card">
        <div class="section-title">막막함을 작업 순서로 바꾸는 방식 <span>보고서 표지와 전체 흐름</span></div>
        <div class="problem-row" style="margin-top:20px">
          <div class="problem-box muted"><div class="problem-label">BEFORE</div><div class="problem-title">어디서부터<br>써야 할지 모르겠다</div><div class="problem-body">경험은 있지만 문항과 연결되지 않는 상태</div></div>
          <div class="arrow">→</div>
          <div class="problem-box active"><div class="problem-label">AFTER</div><div class="problem-title">문항·경험·말하기를<br>한 흐름으로 본다</div><div class="problem-body">빠르게 시작하고, 본인 기준으로 확인하는 상태</div></div>
        </div>
        <div class="flow-strip">
          <div class="flow-item"><b>01  목표</b><span>지원 직무와 문항이 원하는 방향을 확인</span></div>
          <div class="flow-item"><b>02  맥락과 처리</b><span>경험의 문제, 선택, 기여를 구조화</span></div>
          <div class="flow-item"><b>03  확인과 개선</b><span>초안을 받은 뒤 본인의 말로 수정</span></div>
        </div>
        <div style="margin-top:28px" class="section-title">샘플 보고서의 첫인상 <span>실제 도식 활용</span></div>
        <div style="margin-top:15px" class="project-flow"><img src="${reportAsset('cover-flow.png')}" alt="샘플 보고서의 목표부터 개선까지의 흐름"></div>
        <div style="margin-top:17px" class="note"><span class="highlight">빠른 시안</span>은 제출을 대신하는 완성본이 아니라, 본인의 경험을 꺼내고 수정할 수 있게 만드는 출발점입니다.</div>
      </div>`;
    case 'sets':
      return `<div class="card sets-card">
        <div class="section-title">샘플 보고서가 비교하게 해주는 것 <span>작성안 5세트</span></div>
        <div class="set-tabs"><div class="set-tab">SET 1</div><div class="set-tab">SET 2</div><div class="set-tab active">SET 3</div><div class="set-tab">SET 4</div><div class="set-tab">SET 5</div></div>
        <div class="chart-wrap"><img src="${reportAsset('score-profile.png')}" alt="다섯 작성안의 편집 적합도 비교 차트"></div>
        <div class="micro-note">샘플 보고서에서는 작성안별 편집 적합도를 같은 기준으로 비교하고, 숫자만이 아니라 세트별 관찰 코멘트와 면접 질문을 함께 제시합니다.</div>
        <div class="three-cols">
          <div class="mini-stat"><b>5세트</b><strong>다른 관점의 초안</strong><span>같은 경험도 서로 다른 핵심 메시지로 구성해 비교합니다.</span></div>
          <div class="mini-stat"><b>문항별</b><strong>역할이 보이는 구조</strong><span>문항마다 무엇을 보여줘야 하는지 먼저 나눕니다.</span></div>
          <div class="mini-stat"><b>선택 기준</b><strong>내가 말할 수 있는가</strong><span>면접에서 다시 설명할 수 있는 방향인지 확인합니다.</span></div>
        </div>
        <div style="margin-top:19px" class="note">샘플의 수치는 <span class="highlight">합격 예측이 아닌 편집 관찰 지표</span>입니다. 실제 작업 범위는 선택한 패키지에 따라 달라집니다.</div>
      </div>`;
    case 'project':
      return `<div class="card project-card">
        <div class="project-callout">
          <div class="project-copy"><div class="big">프로젝트를<br><span class="highlight">문제 해결의 흐름</span>으로 읽습니다.</div><p>업무를 나열하는 데서 멈추지 않고, 문제를 어떻게 정의했고 어떤 책임을 맡아 무엇을 확인했는지 드러나게 구성합니다.</p><div style="margin-top:20px">${chip('문항 적합성', 'blue')} ${chip('개인 기여', 'gold')} ${chip('면접 재현성', 'green')}</div></div>
          <div class="project-flow"><img src="${reportAsset('project-flow.png')}" alt="문제 정의부터 배운 점까지 이어지는 프로젝트 흐름"></div>
        </div>
        <div style="margin-top:27px" class="section-title">보고서에서 강조한 5개의 질문 <span>경험을 설명하는 순서</span></div>
        <div class="project-lenses">
          <div class="project-lens"><b>문제 정의</b><span>무엇이 문제였나</span></div>
          <div class="project-lens"><b>책임 구조화</b><span>내가 맡은 범위는</span></div>
          <div class="project-lens"><b>처리 설계</b><span>어떻게 해결했나</span></div>
          <div class="project-lens"><b>결과 확인</b><span>무엇을 검증했나</span></div>
          <div class="project-lens"><b>배운 점</b><span>다음 행동은 무엇인가</span></div>
        </div>
        <div style="margin-top:20px" class="note">지원자의 경험을 대신 만들어내지 않고, <span class="highlight">제공된 사실 안에서 설명의 순서와 확인 지점</span>을 정리합니다.</div>
      </div>`;
    case 'lenses':
      return `<div class="card lenses-card">
        <div class="lens-grid">
          <div class="lens-list">
            ${callout('01', '서비스 연결', '지원 직무와 경험의 연결이 자연스러운가?', 'blue')}
            ${callout('02', '근거·기여', '본인이 실제로 한 일이 분명한가?', 'gold')}
            ${callout('03', '품질·책임', '결과와 확인 범위를 설명할 수 있는가?', 'green')}
            ${callout('04', '논리적 말하기', '면접에서 다시 말할 수 있는 흐름인가?', 'blue')}
            ${callout('05', '회사 맥락', '공고와 조직의 맥락에 맞게 읽히는가?', 'gold')}
          </div>
          <div class="evidence-frame page-evidence"><div class="evidence-watermark">PAGE 07 · SAMPLE</div><img src="${reportPage('page-07.png')}" alt="전문가 관점으로 진행한 첨삭 샘플 페이지"></div>
        </div>
        <div style="margin-top:22px" class="note">문장 표현만 수정하는 첨삭이 아니라, <span class="highlight">왜 이 문장이 필요한지</span>와 <span class="highlight">다음에 무엇을 확인할지</span>까지 남기는 방식입니다.</div>
      </div>`;
    case 'sample':
      return `<div class="card sample-card">
        <div class="sample-layout">
          <div class="evidence-frame sample-page"><div class="evidence-watermark">PAGE 10 · SAMPLE</div><img src="${reportPage('page-10.png')}" alt="작성안 1 사람의 판단을 돕는 AI 서비스 샘플 페이지"></div>
          <div class="sample-side">
            ${callout('01', '문항별 초안', '직무와 질문에 맞춰 답변을 구체화합니다.', 'blue')}
            ${callout('02', '관점 표시', '이 작성안이 어떤 메시지를 중심으로 하는지 보여줍니다.', 'gold')}
            ${callout('03', '검토 코멘트', '강점뿐 아니라 확인이 필요한 지점을 구분합니다.', 'green')}
            ${callout('04', '면접 전 질문', '초안을 본인의 말로 다시 설명하기 위한 질문을 남깁니다.', 'blue')}
          </div>
        </div>
        <div style="margin-top:20px" class="note">실제 샘플 보고서는 작성안의 점수, 문항별 답변, 전문가 검토, 면접 질문을 한 문서 안에서 연결합니다.</div>
      </div>`;
    case 'roles':
      return `<div class="card roles-card">
        <div class="roles-grid">
          <div class="role-box ai"><h3>AI를 활용하는 부분</h3><p>빠르게 탐색하고 정리해 여러 초안 후보를 만드는 보조 역할</p><div class="role-list"><div><i></i><span>공고·문항 요구 요소 정리</span></div><div><i></i><span>경험 메모와 키워드 분류</span></div><div><i></i><span>초안 후보 여러 방향 생성</span></div><div><i></i><span>확인 질문 초안 만들기</span></div></div></div>
          <div class="role-box human"><h3>사람이 확인하는 부분</h3><p>문항에 맞고 본인이 책임질 수 있는지 검토하는 역할</p><div class="role-list"><div><i></i><span>문항의 주어와 목적 확인</span></div><div><i></i><span>개인 기여와 사실 범위 검토</span></div><div><i></i><span>면접에서 설명 가능한지 점검</span></div><div><i></i><span>최종 표현과 제출 여부는 본인 확인</span></div></div></div>
        </div>
        <div class="role-result"><b>빠른 시안 + 확인 가능한 가이드</b><span>초안을 전달하는 데서 끝나지 않고, 어떤 문장을 왜 고쳐야 하는지와 무엇을 본인이 확인해야 하는지 함께 정리합니다.</span></div>
        <div class="role-evidence"><div class="evidence-frame page-evidence"><div class="evidence-watermark">PAGE 01 · SAMPLE</div><img src="${reportPage('page-01.png')}" alt="샘플 보고서 표지"></div><div class="note">샘플 보고서는 목표, 맥락, 처리, 확인, 개선의 흐름으로 구성되어 있습니다. 실제 제공물도 자료 범위와 패키지에 맞춰 필요한 확인 지점을 안내합니다.</div></div>
      </div>`;
    case 'score':
      return `<div class="card score-card">
        <div class="score-banner"><div><b>숫자를 합격 약속처럼 사용하지 않습니다.</b><span>샘플 보고서의 90점 이상은 편집 검토 후보를 보기 위한 참고선이며, 역량 인증·채용 예측·제출 승인을 뜻하지 않습니다.</span></div><div class="score-badge">편집 적합도<br>비교를 위한 참고 지표</div></div>
        <div class="score-main"><div class="score-main-title">샘플 보고서의 작성안별 편집 적합도</div><img src="${reportAsset('score-profile.png')}" alt="작성안별 편집 적합도 비교 차트"><div class="score-legend"><div><b>무엇을 보나</b><span>작성안이 문항과 지원 맥락에 맞게 정리되었는지</span></div><div><b>어떻게 쓰나</b><span>세트 간 차이를 보고 선택·수정 질문을 만듭니다.</span></div><div><b>무엇은 아닌가</b><span>합격 가능성이나 지원자의 능력을 판정하지 않습니다.</span></div></div></div>
        <div style="margin-top:18px" class="note">결과물을 볼 때 숫자 하나만 고르기보다, <span class="highlight">본인이 사실을 확인하고 면접에서 설명할 수 있는지</span>를 최종 기준으로 삼습니다.</div>
      </div>`;
    case 'interview':
      return `<div class="card interview-card">
        <div class="interview-top"><div class="selection-flow"><img src="${reportAsset('selection-path.png')}" alt="후보 선택부터 최종 결정까지의 흐름"></div><div class="evidence-frame interview-evidence"><div class="evidence-watermark">PAGE 09 · SAMPLE</div><img src="${reportPage('page-09.png')}" alt="세트 선택과 면접 준비 샘플 페이지"></div></div>
        <div style="margin-top:22px" class="section-title">초안을 고르는 기준이 달라집니다 <span>제출 전 말하기 점검</span></div>
        <div class="interview-steps">
          ${step('01', '후보 선택', '문항별로 어떤 세트가 나와 가까운지 고릅니다.')}
          ${step('02', '사실 대조', '역할과 결과가 실제 경험과 맞는지 확인합니다.')}
          ${step('03', '말하기 연습', '면접에서 같은 흐름으로 설명해 봅니다.')}
          ${step('04', '보완', '빠진 근거와 어색한 표현을 다시 채웁니다.')}
          ${step('05', '최종 결정', '최신 공고와 제출 조건을 확인하고 판단합니다.')}
        </div>
        <div style="margin-top:19px" class="note"><span class="highlight">초안 이후의 가이드</span>가 필요한 분께 맞는 서비스입니다. 최종 사실 확인과 제출 여부는 의뢰인 본인이 결정합니다.</div>
      </div>`;
    case 'checklist':
      return `<div class="card check-card">
        <div class="check-layout"><div class="check-list">
          <div class="check-item"><span class="check-icon"></span><div><b>문항별 역할이 분명한가</b><span>각 문항이 같은 이야기를 반복하지 않고 다른 근거를 보여주는가</span></div></div>
          <div class="check-item"><span class="check-icon"></span><div><b>프로젝트 기여를 방어할 수 있는가</b><span>내가 실제로 맡은 범위와 결과를 설명할 수 있는가</span></div></div>
          <div class="check-item"><span class="check-icon"></span><div><b>도메인 관심이 내 견해로 연결되는가</b><span>관심을 나열하지 않고 경험과 판단으로 이어지는가</span></div></div>
          <div class="check-item"><span class="check-icon"></span><div><b>면접에서 재현할 수 있는가</b><span>글과 말의 흐름이 어긋나지 않는가</span></div></div>
          <div class="check-item"><span class="check-icon"></span><div><b>공고와 제출 조건이 최신인가</b><span>마감일, 글자 수, AI 활용 기준을 다시 확인했는가</span></div></div>
        </div><div class="evidence-frame check-evidence"><div class="evidence-watermark">PAGE 15 · SAMPLE</div><img src="${reportPage('page-15.png')}" alt="제출 전 최종 판단 체크리스트 샘플 페이지"></div></div>
        <div class="final-cta"><b>초안만이 아니라, 다음 수정 행동까지</b><span>자기소개서가 막막할 때 빠른 시안을 받고, 그 시안을 어떻게 본인의 글로 다듬을지 안내받고 싶은 분께 제공합니다.</span></div>
      </div>`;
    default:
      throw new Error(`Unknown slide kind: ${slide.kind}`);
  }
};

const render = async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1200, height: 1600 }, deviceScaleFactor: 1 });
  const manifest = [];
  for (const slide of slides) {
    const html = base(slide, contentFor(slide));
    await page.setContent(html, { waitUntil: 'networkidle' });
    await page.screenshot({ path: path.join(generatedDir, `${slide.id}.png`), type: 'png' });
    await page.screenshot({ path: path.join(renderDir, `${slide.id}.png`), type: 'png' });
    manifest.push({
      file: `${slide.id}.png`,
      width: 1200,
      height: 1600,
      format: 'PNG',
      source: slide.source,
      purpose: '크몽 상세 이미지',
      sampleReport: 'self-introduction-5sets-v6.pdf'
    });
  }
  await browser.close();
  fs.writeFileSync(path.join(root, 'detail-images-v2-manifest.json'), JSON.stringify({
    version: 'v2',
    generatedAt: new Date().toISOString(),
    dimensions: { width: 1200, height: 1600 },
    uploadConstraints: { minWidth: 652, maxWidth: 2000, maxHeight: 3000, formats: ['PNG', 'JPG', 'GIF'] },
    sourceReport: path.relative(repoRoot, path.join(sampleDir, 'self-introduction-5sets-v6.pdf')),
    assets: manifest
  }, null, 2));
};

await render();
