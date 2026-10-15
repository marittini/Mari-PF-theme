"""Regenerate the source ownership and dependency reference (stdlib only)."""
import json
from pathlib import Path
root = Path(__file__).resolve().parents[1]
contracts = json.loads((root / 'module-contracts.json').read_text(encoding='utf-8'))
lines = ['# 모듈 참조', '', '생성: `python3 theme/tools/report-modules.py` (development 폴더 기준).', '', '상태는 각 팩토리 인스턴스가 소유합니다. 의존성은 app.js의 레지스트리로 연결됩니다. 기존 기능 사이의 순환 참조는 유지되며, 팩토리 생성 시 다른 모듈의 기능을 실행하지 않습니다.', '', '| 모듈 | 소스 | 의존 모듈 |', '| --- | --- | --- |']
for m in contracts['modules']:
    lines.append(f"| {m['id']} | `{m['file']}` | {', '.join(m['dependencies']) or '없음'} |")
for m in contracts['modules']:
    lines += ['', f"## {m['id']}", '', f"팩토리: `{m['factory']}`", '', '공개 함수: ' + (', '.join('`'+s+'`' for s in m['exports']) or '없음'), '', '소유 상태: ' + (', '.join('`'+s+'`' for s in m['state']) or '없음'), '', '다른 모듈 상태 쓰기: ' + (', '.join('`'+s+'`' for s in m['crossStateWrites']) or '없음')]
(root / 'MODULES.md').write_text('\n'.join(lines)+'\n', encoding='utf-8')
