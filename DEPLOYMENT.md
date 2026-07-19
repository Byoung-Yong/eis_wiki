# Vercel deployment

1. 이 폴더 전체를 Git 저장소에 업로드합니다.
2. Vercel에서 저장소를 연결합니다.
3. Framework preset은 `Other`를 사용합니다.
4. Build command는 `npm run build`, Output directory는 `dist`로 지정합니다.
5. 이후 `content/**/*.md`를 수정하고 push하면 자동으로 다시 빌드됩니다.

생성된 `dist/`는 배포 결과물이며 원본 콘텐츠는 `content/`입니다.
