# EIS Wiki v1.8 — Markdown-first Vercel project

전기화학 임피던스 분광법(EIS)의 개념, 측정, 회로 요소, 모델, 검증, 분석 및 응용을 개별 Markdown 노트로 관리하는 Wiki입니다.

## 콘텐츠

- `content/note/`: 개념 노트 190개
- `content/moc/`: 영역 지도 10개
- `content/graph/`: 관계 그래프 문서 7개
- `content/pages/`: 홈 문서 1개
- Typed relations: 710개

각 Markdown 파일의 YAML frontmatter에 안정된 ID, 영역, 유형, 검토 상태 및 typed relation이 저장됩니다. 노트를 수정한 뒤 빌드하면 검색, 본문, 전체 지도와 포커스 그래프가 함께 갱신됩니다.

## 실행

```bash
npm install
npm run verify
npm run dev
```

## Vercel

- Build command: `npm run build`
- Output directory: `dist`
- Node.js: 20 이상
