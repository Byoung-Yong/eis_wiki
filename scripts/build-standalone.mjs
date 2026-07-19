import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const dist = path.join(root, 'dist');
const out = path.join(root, 'releases', 'standalone.html');
fs.mkdirSync(path.dirname(out), {recursive:true});
let html = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
const appCss = fs.readFileSync(path.join(dist, 'assets', 'styles.css'), 'utf8');
let katexCss = fs.readFileSync(path.join(dist, 'assets', 'katex', 'katex.min.css'), 'utf8');
const fontDir = path.join(dist, 'assets', 'katex', 'fonts');
katexCss = katexCss.replace(/url\((?:\.\/)?fonts\/([^\)]+)\)/g, (_, file) => {
  const clean = file.replace(/["']/g, '');
  const bytes = fs.readFileSync(path.join(fontDir, clean));
  const ext = path.extname(clean).slice(1).toLowerCase();
  const mime = ext === 'woff2' ? 'font/woff2' : ext === 'woff' ? 'font/woff' : 'application/octet-stream';
  return `url(data:${mime};base64,${bytes.toString('base64')})`;
});
const data = fs.readFileSync(path.join(dist, 'data', 'wiki-data.js'), 'utf8');
const app = fs.readFileSync(path.join(dist, 'assets', 'app.js'), 'utf8');
html = html.replace(/\s*<link rel="stylesheet" href="\/assets\/styles\.css">/, '')
  .replace(/\s*<link rel="stylesheet" href="\/assets\/katex\/katex\.min\.css">/, '')
  .replace('</head>', `<style>${appCss}\n${katexCss}</style>\n</head>`)
  .replace('<script src="/data/wiki-data.js"></script>', `<script>${data}</script>`)
  .replace('<script src="/assets/app.js"></script>', `<script>${app}</script>`);
fs.writeFileSync(out, html);
console.log(JSON.stringify({out, bytes: fs.statSync(out).size}, null, 2));
