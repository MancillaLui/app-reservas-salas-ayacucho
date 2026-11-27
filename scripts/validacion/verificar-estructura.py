"""Comprueba invariantes y enlaces locales vigentes sin modificar archivos."""
from pathlib import Path
import hashlib
import json
import re
from urllib.parse import unquote

ROOT = Path(__file__).resolve().parents[2]

def main():
    baseline = json.loads((ROOT / 'docs/sprint-2/evidencias/organizacion/invariantes.json').read_text(encoding='utf-8'))
    errors = []
    for name, expected in baseline['archivos'].items():
        p = ROOT / name
        accepted = {expected, baseline.get('archivosGitLF', {}).get(name, expected)}
        if not p.is_file() or hashlib.sha256(p.read_bytes()).hexdigest() not in accepted:
            errors.append('Invariante alterada: ' + name)
    checked = 0
    documents = [ROOT/'README.md', ROOT/'certs/README.md'] + list((ROOT/'docs').rglob('*.md'))
    for p in documents:
        if p.is_relative_to(ROOT/'docs/sprint-1-referencia'):
            continue  # Originales preservados: contienen referencias del Sprint 1.
        text = p.read_text(encoding='utf-8')
        for target in re.findall(r'!?\[[^\]\n]*\]\(([^\n)]+)\)', text):
            if re.match(r'^(?:[a-zA-Z][a-zA-Z0-9+.-]*:|#|/)', target):
                continue
            address = unquote(target.split('#', 1)[0].strip('<>'))
            checked += 1
            if not (p.parent/address).exists():
                errors.append(f'Enlace roto: {p.relative_to(ROOT)} -> {target}')
    obsolete = ['src/shared','src/modulos','src/presentacion','01-analisis-de-sistema','02-arquitectura-software','03-diseño-de-software','04-modelo-c4']
    for name in obsolete:
        if (ROOT/name).exists():
            errors.append('Ubicación anterior todavía presente: ' + name)
    package = json.loads((ROOT/'package.json').read_text(encoding='utf-8'))
    for command in package['scripts'].values():
        for name in re.findall(r'scripts/[^\s]+\.(?:ts|py)', command):
            if not (ROOT/name).is_file():
                errors.append('Script npm inexistente: ' + name)
    if errors:
        raise SystemExit('\n'.join(errors))
    print(f'Estructura valida: {len(baseline["archivos"])} hashes conservados y {checked} enlaces locales vigentes.')

if __name__ == '__main__':
    main()
