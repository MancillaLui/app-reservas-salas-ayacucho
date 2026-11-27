import {destinoEvidencia} from './destino-evidencia';
import {copyFile,mkdir,readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
async function json(path:string){return JSON.parse(await readFile(path,'utf8'));}
async function main(){
  const [browser,jest,coverage,buildId]=await Promise.all([json('test-results/browser.json'),json('test-results/jest.json'),json('coverage/complete/coverage-summary.json'),readFile('.next/BUILD_ID','utf8')]);
  if(browser.stats.unexpected||browser.stats.expected<15||!jest.success)throw new Error('Las verificaciones de interfaz o backend no están completas.');
  const carpeta=destinoEvidencia('interfaces');await mkdir(carpeta,{recursive:true});
  const capturas=['interfaz-cliente.png','interfaz-admin.png','interfaz-admin-movil.png','interfaz-inicio-movil.png','interfaz-reserva-movil.png'];
  for(const name of capturas)await copyFile('test-results/'+name,carpeta+'/'+name);
  const resumen={fecha:new Date().toISOString(),buildId:buildId.trim(),compilacion:'Next.js producción, Webpack',
    navegador:{...browser.stats,base:'http://127.0.0.1:3001',roles:'Sesiones y respuestas privadas controladas por fixtures de Playwright',publico:'Catálogo público real en Supabase mediante la API local; sin escrituras',supabaseDosCuentasRealesValidado:false},
    backend:{pruebas:jest.numTotalTests,aprobadas:jest.numPassedTests,suites:jest.numPassedTestSuites,entorno:'PostgreSQL temporal aislado',cobertura:coverage.total},
    restricciones:['Sin nuevas tablas ni cambios en contratos REST.','Los fixtures no alteran usuarios, roles ni reservas de Supabase.','La carga de 2.000 VUs no se volvió a ejecutar; conserva el límite documentado.','Queda pendiente demostrar el recorrido autenticado con dos cuentas reales de Supabase.'],capturas,
    contratoOpenapiSHA256:createHash('sha256').update(await readFile('src/servidor/documentacion/openapi.ts')).digest('hex')};
  await writeFile(carpeta+'/resumen.json',JSON.stringify(resumen,null,2));
  console.log(`Evidencia de ${browser.stats.expected} pruebas de navegador y ${jest.numPassedTests} pruebas backend guardada.`);
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
