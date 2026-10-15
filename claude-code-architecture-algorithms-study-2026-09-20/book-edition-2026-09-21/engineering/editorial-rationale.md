# 독자판 편집 전환의 측정 근거

## 왜 별도 판이 필요한가

사용자의 가독성 불만은 취향 차이가 아니라 기존 출력의 검증 기준이 독서 경험을
충분히 측정하지 못했다는 신호였다. coordinator가 기존 parent HTML을 read-only로
다시 측정한 결과, 일반 페이지 472개 중 297개(62.9%)가 본문 높이의 60% 미만을
사용했고 67개는 45% 미만이었다. 일반 페이지의 median occupancy는 56%였다.
고정 높이 sheet와 많은 구획은 clipping을 피했지만, 짧은 내용이 페이지를 자주
끊어 서적의 연속성을 만들지 못했다.

글자 크기에도 단위 오류가 있었다. 측정된 text leaf 12,055개 가운데
7,416개(61.5%)가 10 CSS px, 즉 7.5pt보다 작았다. p10은 6.1pt, p25는
6.45pt, median은 7.2pt였다. 과거 validator는 computed CSS px 값을 8과
비교했으므로 8.13px인 6.1pt 텍스트도 통과할 수 있었다. 새 독자판은 모든
threshold를 `px × 0.75 = pt`로 변환해 body 10.5pt, code/table/note 8.5pt,
label/folio 7.5pt를 검사한다.

기존 parent PDF에는 internal href anchor, `/Outlines`, `/StructTreeRoot`가 없었다.
화면에서 문장이 보인다는 사실과 긴 문서를 탐색·검색·보조기술로 읽을 수 있다는
사실은 다르다. 새 PDF는 linked TOC, 장 backlink, 알고리즘·source·glossary
anchor를 HTML에서 제공하고, Playwright의 `outline:true`, `tagged:true`로 PDF를
만든 뒤 PDFKit과 구조 marker로 outline·StructTreeRoot·검색 가능한 한글을
확인한다.

## 편집 결정으로의 변환

새 판은 고정 297mm sheet와 body `overflow:hidden`을 사용하지 않는다. 한 단락의
논리가 페이지 경계를 넘어 자연스럽게 흐르며, Part opener와 첫 appendix처럼
의도한 전환만 새 페이지를 시작한다. 일반 페이지의 content span median은 70%
이상을 목표로 하고 35% 미만 페이지는 cover·Part opener처럼 의도된 경우만
허용한다.

동시에 페이지를 빽빽하게 채우는 것을 목표로 삼지는 않는다. occupancy는 의미를
대신하는 점수가 아니라, 과도한 card 분절과 강제 page break가 되살아났는지 찾는
한 rubric이다. code line, figure caption, table, heading orphan, internal link,
source range, status boundary는 각각 별도의 검사를 유지한다.

## 판정 제한

이 측정은 parent 산출물을 변경하지 않은 read-only audit이며, 새 판의 가독성을
자동으로 증명하지 않는다. screen capture와 PDF 구조 검사는 물리 A4 출력, 실제
스터디 구성원의 이해, publication acceptance를 닫을 수 없다. 그래서 새 판은
digest가 고정된 11개 대표 preview와 PDF를 independent evidence reviewer에게
다시 요청한다.
