# 독립 시각 검토 요청

## 고정 대상

- manifest: `manifest.json` — 8739d378af84b2eb22bf04c444a6b062c17193cb7f8f71ac9c256ba48e25f4f9
- PDF: `claude-code-system-anatomy-reader-edition-ko.pdf` — ec8ec57ce6363f396d8b34f6387b38df18f385e0675d351393aa675310dd79c7 (103쪽)
- HTML: `html/claude-code-system-anatomy-reader-edition-ko.html` — 7e340ee8ccdee47257954d6267057c371a957827a2ff1192fc1f5b8f4cdd03f3
- preview manifest: `previews/visual-sample-manifest.json` — 05b13c8abc7dec503ac939be2554aceaf137f375073ec775a0fab24ab3017ab6

## cache-safe 절차

1. 위 네 파일의 SHA-256을 먼저 다시 계산하고 하나라도 다르면 검토를 중단한다.
2. preview manifest의 11개 PNG를 새 image context에서 열어 각 파일 hash와 IHDR dimensions를 재검산한다.
3. cover, TOC, reading paths, whole-system map, prose, dense code, comparison table, permission decision diagram, dashboard, algorithm atlas, source index를 원본 해상도로 읽는다.
4. 제목과 다음 문단의 분리, 한글 glyph, 72자 code line의 wrapping, 표의 열·행 경계, 그림 caption과 본문 cross-reference, status label, backlink를 확인한다.
5. PDF를 새 viewer process에서 열어 실제 링크·outline·검색 가능한 한글을 확인하고, 첫 12쪽에 boundary·method·dashboard·map·paths·TOC가 있는지 읽는다.
6. 결과는 이 파일을 수정하지 말고 별도 evidence-owned verdict에 digest와 함께 기록한다.

기계 검증은 PASS했지만 독자 가독성, publication acceptance, physical A4 출력은 PENDING이다. 특히 이전 baseline의 화면 geometry PASS는 새 독자판의 가독성 판정으로 재사용하지 않는다.
