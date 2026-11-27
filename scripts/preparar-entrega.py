"""Prepara una copia de entrega sin configuración privada; solo usa stdlib."""
from pathlib import Path
import hashlib
import json
import re
import subprocess
import zipfile
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'output'

def main():
    listed = subprocess.check_output(['git', 'ls-files', '-co', '--exclude-standard', '-z'], cwd=ROOT)
    names = sorted(set(listed.decode('utf-8').split('\0')) - {''})
    files = []
    for name in names:
        path = ROOT / name
        parts = Path(name).parts
        if not path.is_file() or path.is_symlink():
            continue
        if any(p in {'.git', '.codex', '.agents', '.aws', '.vscode', 'output', 'node_modules', '.next', 'tmp', 'test-results'} for p in parts):
            continue
        if path.name.startswith('.env') and path.name != '.env.example':
            continue
        if path.suffix.lower() in {'.key', '.pfx', '.p12', '.tsbuildinfo'}:
            continue
        files.append(path)
    coverage = ROOT / 'coverage' / 'complete'
    if coverage.exists():
        files.extend(p for p in coverage.rglob('*') if p.is_file() and not p.is_symlink())
    secrets = []
    env = ROOT / '.env.local'
    if env.exists():
        for line in env.read_text(encoding='utf-8-sig').splitlines():
            if '=' not in line or line.lstrip().startswith('#'):
                continue
            key, value = line.split('=', 1)
            value = value.strip().strip('\"\'')
            if value and not key.startswith('NEXT_PUBLIC_') and ('PASSWORD' in key or 'SECRET' in key or key.endswith('DATABASE_URL')):
                secrets.append(value.encode())
                # Also check the password separately from the complete connection URL.
                if 'DATABASE_URL' in key:
                    from urllib.parse import urlsplit, unquote
                    password = urlsplit(value).password
                    if password and len(password) >= 8:
                        secrets.extend([password.encode(), unquote(password).encode()])
    patterns = [rb'-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----', rb'sb_secret_[A-Za-z0-9_-]{15,}', rb'gh[pousr]_[A-Za-z0-9]{30,}']
    entries = []
    for path in sorted(set(files)):
        data = path.read_bytes()
        name = path.relative_to(ROOT).as_posix()
        if any(s in data for s in secrets) or any(re.search(p, data) for p in patterns):
            raise RuntimeError(f'No se genera el paquete: posible secreto en {name}. Revisar sin imprimir valores.')
        entries.append((name, data))
    OUT.mkdir(exist_ok=True)
    archive = OUT / 'entrega-sprint-2.zip'
    with zipfile.ZipFile(archive, 'w', zipfile.ZIP_DEFLATED) as target:
        for name, data in entries:
            target.writestr('ENSAYA/' + name, data)
    with zipfile.ZipFile(archive) as target:
        if target.testzip() is not None:
            raise RuntimeError('Falló la integridad del ZIP.')
    manifest = {
        'fecha': datetime.now(timezone.utc).isoformat(),
        'archivo': archive.name,
        'sha256': hashlib.sha256(archive.read_bytes()).hexdigest(),
        'totalArchivos': len(entries),
        'secretosDetectados': 0,
        'limites': ['No acredita publicación ni CI remoto.', 'No acredita recorridos no ejecutados.'],
        'archivos': [{'ruta': n, 'sha256': hashlib.sha256(d).hexdigest()} for n, d in entries],
    }
    (OUT / 'manifiesto-entrega.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf-8')
    print(f'ZIP verificado: {len(entries)} archivos; {archive.stat().st_size} bytes; sin secretos detectados.')

if __name__ == '__main__':
    main()
