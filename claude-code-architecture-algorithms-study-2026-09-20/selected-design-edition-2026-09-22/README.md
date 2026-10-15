# Claude Code 시스템 해부 — 선택 디자인판

다섯 스터디의 요구사항 계보와 기존 103쪽 독자판의 전체 내용을 보존하면서, 선택된 Systems Monograph × Evidence Notebook 형식으로 다시 렌더한 별도 edition이다.

## 출력

- [PDF](./claude-code-system-anatomy-selected-design-ko.pdf) — 111쪽, SHA-256 `8748dd73c9a2dcea9a26c08ec685d545d79d55d172f647e51b68ade06429d90b`
- [HTML](./html/claude-code-system-anatomy-selected-design-ko.html)
- [contact sheet](./contact-sheet.png)
- [manifest](./manifest.json) — SHA-256 `9e7af80c5c26e6ce2f86eab6ab73316ccd8973b9ed0513140caeb025d17782ee`
- [요구사항 연대기](./engineering/requirement-chronology.md)
- [디자인 바인딩](./engineering/design-binding.md)
- [검증](./engineering/validation.md)

## 재생성

```sh
node --check build-selected-design.mjs
node build-selected-design.mjs
```

Machine checks와 작성자 측 시각 검토는 독립 acceptance, physical A4, grayscale, assistive-technology 또는 publication acceptance를 대신하지 않는다.
