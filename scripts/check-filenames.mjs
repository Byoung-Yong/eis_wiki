import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..','content');
let count=0;
const errors=[];
function walk(dir){
  if(!fs.existsSync(dir)) return;
  for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
    const full=path.join(dir,entry.name);
    if(entry.name!==entry.name.normalize('NFC'))errors.push(`${full}: NFC 아님`);
    if(entry.name.includes('\uFFFD'))errors.push(`${full}: 대체 문자 포함`);
    if(entry.isDirectory())walk(full);else count++;
  }
}
walk(root);
if(errors.length){console.error(errors.join('\n'));process.exit(1)}
console.log(`파일명 검증 통과: ${count}개 파일, 모두 UTF-8 NFC`);
