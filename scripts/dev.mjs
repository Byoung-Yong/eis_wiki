import {spawn} from 'node:child_process'; import fs from 'node:fs'; const run=()=>spawn('node',['scripts/build.mjs'],{stdio:'inherit'}); run(); fs.watch('content',{recursive:true},()=>run());
