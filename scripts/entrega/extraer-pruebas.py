"""Extrae resultados observados; no ejecuta pruebas ni exporta errores o secretos."""
from pathlib import Path
from datetime import datetime, timezone, timedelta
import hashlib
import json

ROOT = Path(__file__).resolve().parents[2]
DESTINO = ROOT/'docs/sprint-2/evidencias/documentacion-final'

def fecha(ms):
    return datetime.fromtimestamp(ms/1000, timezone.utc).astimezone(timezone(timedelta(hours=-5))).isoformat()

def main():
    origen = ROOT/'test-results/jest-organizacion.json'
    raw = origen.read_bytes()
    report = json.loads(raw.decode('utf-8-sig'))
    if not report.get('success') or report['numPassedTests'] != 89 or report['numFailedTests'] or report['numPendingTests']:
        raise SystemExit('El informe de origen no corresponde a la regresión aprobada de 89 pruebas.')
    orden = ['reglas.test.ts','servicios.test.ts','schemas.test.ts','identidad.test.ts','cache.test.ts','arquitectura.test.ts','postgres.test.ts']
    suites = []
    counts = {'unitarias': 0, 'integracion': 0}
    for result in sorted(report['testResults'], key=lambda s: orden.index(Path(s['name']).name)):
        path = Path(result['name']).resolve()
        if not path.is_relative_to(ROOT/'tests'):
            raise SystemExit('La ruta de una suite no pertenece al proyecto.')
        relative = path.relative_to(ROOT).as_posix()
        tipo = 'integracion' if relative.startswith('tests/integration/') else 'unitarias'
        cases = []
        for assertion in result['assertionResults']:
            if assertion['status'] != 'passed':
                raise SystemExit('Existe un caso no aprobado en la fuente.')
            counts[tipo] += 1
            cases.append({'id': ('I' if tipo == 'integracion' else 'U')+str(counts[tipo]).zfill(2), 'nombre': assertion['fullName'], 'estado': 'Aprobado', 'estadoJest': assertion['status'], 'duracionMs': assertion.get('duration')})
        suites.append({'archivo': relative, 'tipo': tipo, 'inicioLima': fecha(result['startTime']), 'finLima': fecha(result['endTime']), 'aprobadas': len(cases), 'casos': cases})
    if counts != {'unitarias': 53, 'integracion': 36}:
        raise SystemExit('El desglose de casos no coincide con las fuentes documentadas.')
    data = {'origen': 'test-results/jest-organizacion.json', 'sha256Origen': hashlib.sha256(raw).hexdigest(), 'metodo': 'Extracción de campos permitidos del reporte existente. No se volvieron a ejecutar pruebas.', 'inicioLima': fecha(report['startTime']), 'zonaHoraria': 'America/Lima (UTC-05:00)', 'entorno': 'Windows; Jest y PostgreSQL 17 temporal aislado. Identidad y proveedores controlados en pruebas.', 'revisionCodigoPublicadaConCI': '79ee1690b2c2bf675f49b36f7728480a9835b3c6', 'notaRevision': 'El reporte local se produjo durante la preparación de la reorganización, antes de su commit. CI verificó posteriormente esa revisión publicada; no se atribuye el archivo local a una ejecución de CI.', 'totales': {**counts, 'jest': 89, 'suites': len(suites), 'fallidas': 0, 'omitidas': 0}, 'suites': suites}
    DESTINO.mkdir(parents=True, exist_ok=True)
    browser_raw = (ROOT/'test-results/browser.json').read_bytes()
    browser = json.loads(browser_raw.decode('utf-8-sig'))
    cases = []
    def visit(suites):
        for suite in suites:
            for spec in suite.get('specs', []):
                if not spec['ok'] or any(r['status'] != 'passed' for t in spec['tests'] for r in t['results']):
                    raise SystemExit('El informe de navegador contiene casos no aprobados.')
                file = spec['file'].replace('\\', '/')
                if not file.startswith('tests/browser/'):
                    file = 'tests/browser/'+file
                if not (ROOT/file).resolve().is_relative_to(ROOT/'tests/browser') or not (ROOT/file).is_file():
                    raise SystemExit('Ruta de navegador no permitida.')
                cases.append({'id': 'N'+str(len(cases)+1).zfill(2), 'archivo': file, 'linea': spec['line'], 'nombre': spec['title'], 'estado': 'Aprobado'})
            visit(suite.get('suites', []))
    visit(browser.get('suites', []))
    if len(cases) != 21 or browser['stats']['unexpected'] or browser['stats']['flaky'] or browser['stats']['skipped']:
        raise SystemExit('El navegador no corresponde a los 21 casos aprobados documentados.')
    browser_data = {'origen': 'test-results/browser.json', 'sha256Origen': hashlib.sha256(browser_raw).hexdigest(), 'inicio': browser['stats']['startTime'], 'estadisticas': browser['stats'], 'metodo': 'Extracto del reporte existente; no se ejecutó nuevamente el navegador.', 'casos': cases}
    (DESTINO/'pruebas-jest.json').write_text(json.dumps(data, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
    (DESTINO/'pruebas-navegador.json').write_text(json.dumps(browser_data, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
    print('Extracto guardado: 53 unitarias + 36 de integracion; sin rutas absolutas ni errores de ejecucion.')

if __name__ == '__main__':
    main()
