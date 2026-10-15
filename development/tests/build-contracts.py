"""Build checks need Python standard library and Node only."""
from pathlib import Path
import subprocess,tempfile,shutil,json,hashlib
root=Path(__file__).resolve().parents[1]
def run(base,*args):
    return subprocess.run(['python3',str(base/'theme/build.py'),*args],text=True,capture_output=True)
assert run(root,'--check').returncode==0
with tempfile.TemporaryDirectory() as tmp:
    base=Path(tmp);shutil.copytree(root/'theme',base/'theme')
    assert run(base).returncode==0
    before={name:hashlib.sha256((base/'theme'/name).read_bytes()).hexdigest() for name in ['extension.js','extension.css','manifest.json']}
    assert run(base).returncode==0
    assert before=={name:hashlib.sha256((base/'theme'/name).read_bytes()).hexdigest() for name in before}
    help_file=base/'theme/content/help.md';help_source=help_file.read_text();help_file.write_text(help_source+'\n새 도움말 내용');assert run(base,'--check').returncode!=0;assert run(base).returncode==0;assert '새 도움말 내용' in (base/'theme/extension.js').read_text();help_file.write_text(help_source);assert run(base).returncode==0
    target=base/'theme/src/features/design.js';source=target.read_text();target.write_text(source+'\n// deps.missing.state.value\n')
    assert run(base,'--check').returncode!=0
    target.write_text(source)
    contract=base/'theme/module-contracts.json';data=json.loads(contract.read_text());saved=contract.read_text();data['modules'][0]['crossStateWrites'].append('core.unapproved');contract.write_text(json.dumps(data));assert run(base).returncode!=0;contract.write_text(saved)
    output=base/'theme/extension.css';output.write_text(output.read_text()+'\n/* stale */');assert run(base,'--check').returncode!=0;assert run(base).returncode==0
    styles=base/'theme/style-order.json';data=json.loads(styles.read_text());data['native'].append(data['native'][0]);styles.write_text(json.dumps(data));assert run(base).returncode!=0
print('PASS deterministic build, stale-output detection, dependency and cross-state-write guards, duplicate CSS cascade detection.')
