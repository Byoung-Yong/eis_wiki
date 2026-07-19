import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const manifestPath=path.join(root,'baseline','BASELINE_MANIFEST.json');
if(!fs.existsSync(manifestPath))throw new Error('baseline/BASELINE_MANIFEST.json이 없습니다.');
const manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
if(!Array.isArray(manifest.files) || manifest.files.length===0){console.log('기준 manifest가 비어 있습니다. 현재 프로젝트에서 먼저 생성하십시오.');process.exit(0)}
const errors=[];
for(const item of manifest.files){
  const file=path.join(root,item.path.startsWith('content/')?'': 'content',item.path);
  if(!fs.existsSync(file)){errors.push(`누락: ${item.path}`);continue}
  const hash=crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
  if(hash!==item.sha256)errors.push(`변경: ${item.path}`);
}
if(errors.length){console.error(errors.join('\n'));process.exit(1)}
console.log(`기준 콘텐츠 보존 확인: ${manifest.files.length}개 파일 완전 일치`);
