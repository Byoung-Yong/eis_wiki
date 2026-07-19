#!/usr/bin/env python3
from __future__ import annotations

from pathlib import Path
import html
import json
import re

root = Path(__file__).resolve().parents[1]
report_path = root / 'reports' / 'RENDER_MATH_INTEGRITY.json'
obj = json.loads((root / 'dist' / 'data' / 'wiki-data.json').read_text(encoding='utf-8'))
by_file = {doc['file']: doc for doc in obj['documents']}

MATH_RE = re.compile(r'\$\$([\s\S]*?)\$\$|(?<!\$)\$(?!\$)([^\n$]+?)(?<!\$)\$(?!\$)')


def normalize(value: str) -> str:
    return re.sub(r'\s+', '', value.strip())


def extract_source(body: str) -> list[str]:
    return [normalize(match.group(1) if match.group(1) is not None else match.group(2)) for match in MATH_RE.finditer(body)]


def extract_rendered(rendered: str) -> list[str]:
    return [normalize(html.unescape(value)) for value in re.findall(r'<annotation encoding="application/x-tex">([\s\S]*?)</annotation>', rendered)]


mismatches: list[dict] = []
total = 0
for relative, document in sorted(by_file.items()):
    source_path = root / 'content' / relative
    if not source_path.exists():
        mismatches.append({'file': relative, 'reason': 'source document missing'})
        continue
    raw = source_path.read_text(encoding='utf-8')
    frontmatter = re.match(r'^---\s*\n[\s\S]*?\n---\s*\n?', raw)
    body = raw[frontmatter.end():] if frontmatter else raw
    source = extract_source(body)
    rendered = extract_rendered(document['html'])
    total += len(source)
    if source != rendered:
        mismatches.append({'file': relative, 'source': source, 'rendered': rendered})

report = {
    'published_documents': len(by_file),
    'math_tokens': total,
    'mismatch_count': len(mismatches),
    'mismatches': mismatches,
}
report_path.parent.mkdir(exist_ok=True)
report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps(report, ensure_ascii=False, indent=2))
raise SystemExit(1 if mismatches else 0)
