import { readFile,writeFile,mkdir,copyFile } from 'node:fs/promises';
const destino='docs/sprint-2/evidencias';
async function json(path:string) {return JSON.parse(await readFile(path,'utf8'));}
async function main() {
  const [jest,coverage,api,browser,benchmark,k6]=await Promise.all([json('test-results/jest.json'),json('coverage/complete/coverage-summary.json'),json('test-results/openapi.json'),json('test-results/browser.json'),json('test-results/http-benchmark.json'),json('test-results/k6-summary.json')]);
  if(!jest.success||!api.valido||browser.stats.unexpected)throw new Error('Las comprobaciones funcionales no están completas o tienen fallos.');
  const bajo=await json('test-results/k6-20.json');
  if(k6.metrics.vus_max.values.max!==2000||bajo.metrics.vus_max.values.max!==20)throw new Error('Se requieren corridas identificadas de 20 y 2.000 VUs.');
  const buildId=(await readFile('.next/BUILD_ID','utf8')).trim();
  await mkdir(destino,{recursive:true});
  const resumen={fecha:new Date().toISOString(),node:process.version,buildId,
    jest:{pruebas:jest.numTotalTests,aprobadas:jest.numPassedTests,suites:jest.numPassedTestSuites,exito:jest.success},
    cobertura:coverage.total,alcanceCobertura:'Backend, contratos HTTP y OpenAPI; excluye componentes React',
    openapi:api,navegador:browser.stats,benchmark,
    k6:{maxVUs:k6.metrics.vus_max.values.max,solicitudes:k6.metrics.http_reqs.values.count,tasaErrores:k6.metrics.http_req_failed.values.rate,p95_ms:k6.metrics.http_req_duration.values['p(95)'],p95Disponibilidad_ms:k6.metrics['http_req_duration{name:disponibilidad}']?.values['p(95)'],umbrales:Object.fromEntries(Object.entries(k6.metrics).filter(([,v])=>(v as {thresholds?:unknown}).thresholds).map(([k,v])=>[k,(v as {thresholds:unknown}).thresholds]))},
    limites:['PostgreSQL temporal con 2 salas, 3 equipos y sin reservas en carga pública.','Los controles HTTP autenticados usan identidad controlada en pruebas; Supabase Auth real no se configuró.','Pagos y mensajería simulados.','No mide carga completa en 3G/4G, disponibilidad mensual ni conversión de usuarios.']};
  await writeFile(`${destino}/resumen.json`,JSON.stringify(resumen,null,2));
  for(const [source,target] of [
    ['test-results/k6-summary.json','k6-2000.json'],['test-results/k6-antes-optimizacion.json','k6-antes-optimizacion.json'],
    ['test-results/k6-20.json','k6-20.json'],['test-results/plan-consulta.json','plan-consulta.json'],
    ['test-results/escritorio.png','escritorio.png'],['test-results/movil.png','movil.png'],['test-results/swagger.png','swagger.png']
  ])await copyFile(source,`${destino}/${target}`);
  const p95=(n:number)=>n.toFixed(2);
  const fallos=(resumen.k6.tasaErrores*100).toFixed(2);
  const k6cumple=Object.values(resumen.k6.umbrales).every(t=>Object.values(t as Record<string,{ok:boolean}>).every(v=>v.ok));
  const report=`# Validación del Sprint 2

Fecha: ${new Intl.DateTimeFormat('es-PE',{timeZone:'America/Lima',dateStyle:'long',timeStyle:'short'}).format(new Date()).replace(/\.$/,'')}. Entorno: Windows, Node.js ${process.version}, Next.js compilado para producción y PostgreSQL 17 temporal en loopback. El catálogo de carga tiene dos salas y tres equipos, sin reservas. No se utilizaron credenciales reales de Supabase.

## Comprobaciones funcionales

| Comprobación | Resultado observado |
|---|---|
| TypeScript y build | Aprobados. Build ID: ${buildId}. |
| Jest | ${resumen.jest.aprobadas}/${resumen.jest.pruebas} pruebas aprobadas, ${resumen.jest.suites} suites. |
| Cobertura backend y contratos | Líneas ${coverage.total.lines.pct} %, sentencias ${coverage.total.statements.pct} %, ramas ${coverage.total.branches.pct} %, funciones ${coverage.total.functions.pct} %. Excluye componentes React. |
| OpenAPI | Contrato 3.0.3 válido, ${api.operaciones} operaciones y referencias resueltas. |
| Navegador Chrome | ${browser.stats.expected} pruebas aprobadas: escritorio, móvil de 390 × 844 y Swagger. |
| Concurrencia de sala | De 20 solicitudes simultáneas para el mismo intervalo, exactamente una reserva se asigna. |
| Concurrencia de equipos | Dos salas compiten por la última unidad: solo una la recibe. Se validan además intervalos consecutivos y pico simultáneo. |
| Seguridad | Token ausente/inválido, acceso ajeno y operaciones administrativas del cliente se deniegan; user_metadata no concede ADMIN. |
| Resiliencia | Fallo/demora de mensajería conserva CONFIRMADA; comprobante persistido y resultado ENVIADA/FALLIDA tras el worker. |
| Recuperación | Se conserva PROCESANDO al reinstanciar los servicios; el worker expira pendientes y conserva recursos ante pago incierto. |

Los controles HTTP de integración usan una identidad controlada y el adaptador Supabase se prueba con respuestas simuladas. No acreditan login contra una cuenta real. La revisión de navegador comprueba consultas públicas, calendario, carrito, formulario de sesión y ausencia de desbordamiento horizontal; no completa una reserva autenticada en Supabase.

## Rendimiento y análisis de datos

La primera corrida k6 hasta 2.000 VUs detectó saturación del pool y espera en el bloqueo global de disponibilidad. Su p95 agregado fue 10.133,61 ms, con 63,00 % de errores HTTP; se conserva el [resumen previo](evidencias/k6-antes-optimizacion.json). No se declara ese resultado satisfactorio.

La disponibilidad se cambió a una lectura SQL de una sola instantánea, sin el bloqueo de asignación y sin expiraciones de escritura. Se limitó la cola del pool a cien esperas. Las asignaciones y modificaciones conservan su transacción y su bloqueo. Las pruebas funcionales se volvieron a ejecutar después del cambio.

| Medición final | Resultado |
|---|---|
| Node fetch: 20 clientes / 200 consultas de disponibilidad | ${benchmark.fallos} errores; promedio ${p95(benchmark.promedio_ms)} ms, p95 ${p95(benchmark.p95_ms)} ms y máximo ${p95(benchmark.max_ms)} ms. |
| k6 progresivo hasta ${resumen.k6.maxVUs} VUs | ${resumen.k6.solicitudes} solicitudes; ${fallos} % de errores; p95 global ${p95(resumen.k6.p95_ms)} ms. |
| k6 p95 de disponibilidad | ${resumen.k6.p95Disponibilidad_ms===undefined?'No registrado':p95(resumen.k6.p95Disponibilidad_ms)+' ms'}. |
| Umbrales k6 finales | ${k6cumple?'Cumplidos en este entorno de prueba.':'No cumplidos a esta carga. El límite queda documentado; no se acredita soporte de 2.000 usuarios en producción.'} |

Los [resultados k6 de 20 VUs](evidencias/k6-20.json), la [corrida final](evidencias/k6-2000.json) y el [plan EXPLAIN de consulta de salas](evidencias/plan-consulta.json) permiten inspeccionar las mediciones. El plan corresponde a la parte de ocupación de salas con datos pequeños; no representa una prueba de toda la consulta ni de inventario a escala.

La corrida separada de 20 VUs completó ${bajo.metrics.http_reqs.values.count} solicitudes con ${(bajo.metrics.http_req_failed.values.rate*100).toFixed(2)} % de errores, p95 global de ${p95(bajo.metrics.http_req_duration.values['p(95)'])} ms y p95 de disponibilidad de ${p95(bajo.metrics['http_req_duration{name:disponibilidad}'].values['p(95)'])} ms. En la corrida extrema, la latencia incluye solicitudes fallidas y respuestas rechazadas: reducirla no demuestra por sí solo una mejora de capacidad. No se presenta la optimización como solución al límite de 2.000 VUs. El generador de carga y la aplicación comparten equipo; no se atribuye todo el resultado exclusivamente al backend.

La caché interna solo guarda catálogo durante 30 segundos y se invalida tras modificaciones locales. La disponibilidad consulta PostgreSQL y excluye pendientes vencidas; la prueba no introduce una caché de stock que pueda ocultar conflictos.

## Evidencia visual y reproducibilidad

- [Pantalla de escritorio](evidencias/escritorio.png), [pantalla móvil](evidencias/movil.png) y [Swagger](evidencias/swagger.png).
- [Resumen verificable de esta ejecución](evidencias/resumen.json).
- Ejecutar: npm run typecheck, npm run api:validate, npm run test:verify y npm run build.
- Con la vista local activa: npm run test:browser y el script tests/load/reservas.js con k6. Los detalles están en [INICIO.md](INICIO.md).
- Los informes HTML/LCOV completos se regeneran en coverage/complete. GitHub Actions está preparado; su ejecución remota no se realizó en esta sesión.

## Pendientes que no se presentan como resultados

Configurar el proyecto real de Supabase, aplicar migraciones/seed, crear las cuentas y asignar ADMIN; demostrar el recorrido autenticado con esas cuentas. El despliegue público, TLS del alojamiento, integraciones financieras y de mensajería reales, reembolsos automáticos, disponibilidad mensual 99,9 %, carga visual 3G/4G y evaluación con usuarios no están acreditados. El 99,9 % sigue siendo una meta.
`;
  await writeFile('docs/sprint-2/VALIDACION.md',report);
  console.log('Informe y evidencia generados en docs/sprint-2.');
}
main().catch(error=>{console.error(error.message);process.exitCode=1;});
