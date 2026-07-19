#!/usr/bin/env python3
from __future__ import annotations

from pathlib import Path
import json

root = Path(__file__).resolve().parents[1]
index = (root / 'src' / 'index.html').read_text(encoding='utf-8')
app = (root / 'src' / 'app.js').read_text(encoding='utf-8')
styles = (root / 'src' / 'styles.css').read_text(encoding='utf-8')

checks = {
    'quick_view_overview': 'id="viewOverview"' in index,
    'quick_view_focus': 'id="viewFocus"' in index,
    'quick_depth': 'id="depthQuick"' in index,
    'sigma_overview': 'new Sigma(' in app,
    'forceatlas_layout_data': 'globalGraph' in app,
    'focus_dandelion': 'applyDandelionLayout' in app,
    'focus_animation': 'requestAnimationFrame(stepLocal)' in app,
    'sidebar_sync_function': 'syncSidebarToNote' in app,
    'sidebar_smooth_scroll': "sidebar.scrollTo({top: Math.max(0, targetTop), behavior})" in app,
    'sidebar_target_highlight': '.side-item.sync-target' in styles,
    'community_label_without_number_prefix': "return names ? `${names}" in app and '커뮤니티 ${Number(id)' not in app,
    'inactive_identity_tone': 'focusTone' in app,
    'all_circle_nodes': 'ctx.arc(' in app,
}
errors = [name for name, ok in checks.items() if not ok]
report = {'checks': checks, 'error_count': len(errors), 'errors': errors}
output = root / 'reports' / 'UI_CONTRACT_VALIDATION.json'
output.parent.mkdir(exist_ok=True)
output.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps(report, ensure_ascii=False, indent=2))
raise SystemExit(1 if errors else 0)
