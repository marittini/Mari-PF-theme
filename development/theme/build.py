"""Deterministic offline build. Python standard library only; no runtime imports."""
from pathlib import Path
import argparse, hashlib, json, re, subprocess
BASE = Path(__file__).resolve().parent

def read_json(name):
    return json.loads((BASE / name).read_text(encoding='utf-8'))

def build():
    contract = read_json('module-contracts.json')
    project = read_json('project.json')
    modules = contract['modules']
    ids = {m['id'] for m in modules}
    if len(ids) != len(modules):
        raise ValueError('Duplicate module id')
    chunks = []
    init_orders, cleanup_orders = [], []
    for module in modules:
        source = (BASE / module['file']).read_text(encoding='utf-8')
        if re.search(r'^import\s|\bimport\s*\(', source[source.index('export function'):], re.M):
            raise ValueError(f"Unexpected module import: {module['file']}")
        prefix = 'export function ' + module['factory'] + '(deps)'
        if source.count(prefix) != 1:
            raise ValueError(f"Missing or duplicate factory: {module['file']}")
        dependencies = set(re.findall(r'\bdeps\.([A-Za-z]\w*)\.', source))
        if dependencies != set(module['dependencies']) or not dependencies <= ids:
            raise ValueError(f"Dependency contract changed: {module['id']}: {sorted(dependencies)}")
        for dependency, field in re.findall(r'\bdeps\.(\w+)\.state\.(\w+)', source):
            owner = next(m for m in modules if m['id'] == dependency)
            if field not in owner['state']:
                raise ValueError(f"Unknown state {dependency}.{field} in {module['id']}")
        for dependency, name in re.findall(r'\bdeps\.(\w+)\.(\w+)\s*\(', source):
            owner = next(m for m in modules if m['id'] == dependency)
            if name not in owner['exports']:
                raise ValueError(f"Unknown API {dependency}.{name} in {module['id']}")
        writes = {f'{owner}.{name}' for owner, name in re.findall(r'\bdeps\.(\w+)\.state\.(\w+)\s*(?:\+\+|--|\+=|-=|\|\|=|&&=|\?\?=|=(?!=|>))', source)}
        writes.update(f'{owner}.{name}' for owner, name in re.findall(r'(?:\+\+|--)\s*deps\.(\w+)\.state\.(\w+)', source))
        if writes != set(module['crossStateWrites']):
            raise ValueError(f"Cross-state write contract changed: {module['id']}: {sorted(writes)}")
        plan = re.search(r'  const initialize = \[(.*?)\n  \];\n  const cleanup = \[(.*?)\n  \];', source, re.S)
        actual_init = [int(x) for x in re.findall(r'order: (\d+)', plan.group(1))] if plan else []
        actual_cleanup = [int(x) for x in re.findall(r'order: (\d+)', plan.group(2))] if plan else []
        if actual_init != module['initialize'] or actual_cleanup != module['cleanup']:
            raise ValueError(f"Startup/cleanup order contract changed: {module['id']}")
        init_orders += module['initialize']
        cleanup_orders += module['cleanup']
        chunks.append('// Source: ' + module['file'] + '\n' + source.replace(prefix, prefix.removeprefix('export '), 1))
    if len(init_orders) != len(set(init_orders)) or len(cleanup_orders) != len(set(cleanup_orders)):
        raise ValueError('Duplicate initialization/cleanup sequence')
    app = (BASE / 'src/app.js').read_text(encoding='utf-8')
    imports = set(re.findall(r"^import \{ (\w+) \} from './([^']+)';", app, re.M))
    expected_imports = {(m['factory'], m['file'][4:]) for m in modules}
    if imports != expected_imports:
        raise ValueError('Entry imports and module contract differ')
    registered = set(re.findall(r'modules\.(\w+) = create\w+\(modules\)', app))
    if registered != ids:
        raise ValueError('Entry registration and module contract differ')
    app = re.sub(r'^import .+?;\n', '', app, flags=re.M)
    app = app.replace('export function startApplication', 'function startApplication')
    shadow = assemble_styles('shadow')
    native = assemble_styles('native')
    runtime = '(/* Marinara Platform ' + project['version'] + ' — generated; edit src/ and styles/. */\nfunction(){\n\"use strict\";\n' + '\n'.join(chunks) + '\n' + app + '\nstartApplication();\n})();\n'
    runtime = runtime.replace('__SHADOW_CSS__', json.dumps(shadow, ensure_ascii=False), 1)
    runtime = runtime.replace('__HELP_MARKDOWN__', json.dumps((BASE / 'content/help.md').read_text(encoding='utf-8'), ensure_ascii=False), 1)
    if '__SHADOW_CSS__' in runtime or re.search(r'^export |^import ', runtime, re.M):
        raise ValueError('Unbundled module or missing embedded styles')
    manifest = read_json('manifest.json')
    manifest['config'].update(project)
    return {'extension.js': runtime, 'extension.css': native, 'manifest.json': json.dumps(manifest, ensure_ascii=False, indent=2) + '\n'}

def assemble_styles(kind):
    manifest = read_json('style-order.json')[kind]
    cache, chunks, used = {}, [], set()
    for entry in manifest:
        file = entry['file']
        if file not in cache:
            text = (BASE / file).read_text(encoding='utf-8')
            cache[file] = dict(re.findall(r'/\* @mft-part ([\w-]+) \*/(.*?)/\* @mft-end \*/', text, re.S))
        key = (file, entry['part'])
        if key in used or entry['part'] not in cache[file]:
            raise ValueError(f'Duplicate/missing style part: {key}')
        used.add(key)
        chunks.append(cache[file][entry['part']])
    declared = {(file, part) for file, parts in cache.items() for part in parts}
    if used != declared:
        raise ValueError('Unused style parts; update style-order.json')
    return ''.join(chunks)

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--check', action='store_true', help='Fail if generated files are stale; write nothing')
    args = parser.parse_args()
    outputs = build()
    for name, content in outputs.items():
        path = BASE / name
        if args.check:
            if not path.exists() or path.read_text(encoding='utf-8') != content:
                raise SystemExit('Stale output: ' + name)
        else:
            path.write_text(content, encoding='utf-8', newline='\n')
    print(('Checked' if args.check else 'Built') + ': ' + ', '.join(outputs))
