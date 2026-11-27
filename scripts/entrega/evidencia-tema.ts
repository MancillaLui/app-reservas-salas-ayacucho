import {destinoEvidencia} from './destino-evidencia';
import {mkdir,readdir,readFile,writeFile,copyFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
async function main(){
  const browser=JSON.parse(await readFile('test-results/browser.json','utf8'));
  const jest=JSON.parse(await readFile('test-results/jest-oscuro.json','utf8'));
  if(browser.stats.unexpected||browser.stats.skipped||browser.stats.expected!==21||!jest.success||jest.numPassedTests<86||jest.numPassedTests!==jest.numTotalTests)throw new Error('Faltan verificaciones aprobadas para registrar la evidencia.');
  const dir=destinoEvidencia('tema-oscuro');await mkdir(dir,{recursive:true});
  const archivos=(await readdir('test-results/oscuro')).filter(n=>/\.(png|json)$/.test(n));
  for(const name of archivos)await copyFile('test-results/oscuro/'+name,dir+'/'+name);
  const contrastes=(await Promise.all(['admin','cliente'].map(async rol=>JSON.parse(await readFile(`test-results/oscuro/contraste-${rol}.json`,'utf8'))))).flat();
  const ratios=contrastes.flatMap(x=>x.resultados.map((r:{ratio:number})=>r.ratio));
  const cobertura=JSON.parse(await readFile('coverage/complete/coverage-summary.json','utf8')).total;
  const report={fecha:new Date().toISOString(),buildId:(await readFile('.next/BUILD_ID','utf8')).trim(),cssSHA256:createHash('sha256').update(await readFile('src/cliente/estilos/tema.css')).digest('hex'),
    navegador:{...browser.stats,anchos:[1365,768,390],origen:'Chrome contra Next.js de producción en localhost:3001. Recorridos públicos previos leen catálogo real; nuevas revisiones visuales y recorridos privados usan fixtures controlados.',pruebasOriginales:15,pruebasTema:6,contraste:{metodo:'Luminancia relativa sRGB de estilos computados, componiendo transparencias contra fondos de ancestros. Se comprueban muestras de componentes y estados, no una auditoría WCAG completa.',minimoExigido:4.5,minimoObservadoPaneles:Math.min(...ratios),muestrasPaneles:ratios.length}},
    backend:{aprobadas:jest.numPassedTests,suites:jest.numPassedTestSuites,entorno:'PostgreSQL temporal aislado',cobertura},
    limites:['Sin cambios de API, tablas, permisos o reglas de negocio.','Capturas privadas con datos controlados; no sustituyen las evidencias reales anteriores.','Pagos y mensajería simulados. No se repite carga ni se acredita nueva capacidad.','Swagger conserva esquema claro independiente.'],archivos};
  await writeFile(dir+'/resumen.json',JSON.stringify(report,null,2));console.log(`Evidencia de tema oscuro guardada en ${dir}: 21 pruebas de navegador y ${jest.numPassedTests} de backend.`);
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
