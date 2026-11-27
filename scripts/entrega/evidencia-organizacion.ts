import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
async function json(path:string){return JSON.parse(await readFile(path,'utf8'));}
async function main(){
  const [jest,browser,cobertura,base]=await Promise.all([json('test-results/jest-organizacion.json'),json('test-results/browser.json'),json('coverage/complete/coverage-summary.json'),json('docs/sprint-2/evidencias/organizacion/invariantes.json')]);
  if(!jest.success||jest.numPassedTests!==89||browser.stats.expected!==21||browser.stats.unexpected||browser.stats.skipped)throw new Error('La reorganización no tiene todas sus pruebas aprobadas.');
  for(const [path,expected] of Object.entries(base.archivos)){
    const actual=createHash('sha256').update(await readFile(path)).digest('hex');
    if(actual!==expected&&actual!==base.archivosGitLF?.[path])throw new Error('Se modificó una invariante: '+path);
  }
  const datos={fecha:new Date().toISOString(),baseCommit:base.base,rama:'codex/organizacion-proyecto',destinoPropuesto:'codex/sprint-2-entrega',buildId:(await readFile('.next/BUILD_ID','utf8')).trim(),
    backend:{aprobadas:jest.numPassedTests,anteriores:86,nuevasArquitectura:3,suites:jest.numPassedTestSuites,entorno:'PostgreSQL temporal aislado',cobertura:cobertura.total},
    navegador:{...browser.stats,entorno:'Next.js de producción en localhost:3001; casos privados con fixtures controlados, pruebas públicas anteriores de solo lectura contra Supabase'},
    invariantes:{archivosVerificados:Object.keys(base.archivos).length,algoritmo:'SHA-256',cssYOpenapiSinCambios:true,migracionesYArchivoHistoricoSinCambios:true,evidenciasAnterioresSinCambios:true},
    alcanceCobertura:'Mismo alcance lógico: módulos, infraestructura transversal, compartido, API y OpenAPI; excluye composición y navegador.',
    diferenciaCobertura:{antes:{lineas:366,cubiertas:364,sentencias:472},ahora:{lineas:cobertura.total.lines.total,cubiertas:cobertura.total.lines.covered,sentencias:cobertura.total.statements.total},motivo:'La caché se inyecta mediante contrato en lugar de importarse e inicializarse en el servicio. No se excluyeron archivos para mantener cobertura.'},
    limites:['No se ejecutaron migraciones, seed, worker ni demos que escriban en Supabase.','Pagos y mensajería simulados; no se repitió carga.','Las evidencias históricas conservan sus rutas originales como procedencia.','Publicación como propuesta de integración; no altera la rama de entrega hasta integrar.']};
  await writeFile('docs/sprint-2/evidencias/organizacion/resumen.json',JSON.stringify(datos,null,2));
  console.log('Reorganización verificada: 89 pruebas backend, 21 de navegador y '+datos.invariantes.archivosVerificados+' invariantes.');
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
