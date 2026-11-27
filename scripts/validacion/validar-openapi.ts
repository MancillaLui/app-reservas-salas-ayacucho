import SwaggerParser from '@apidevtools/swagger-parser';
import { mkdir,writeFile } from 'node:fs/promises';
import { openapi } from '../../src/servidor/documentacion/openapi';
async function main() {
  const parsed=await SwaggerParser.validate(JSON.parse(JSON.stringify(openapi)));
  if(!('openapi' in parsed)||parsed.openapi!=='3.0.3')throw new Error('Versión OpenAPI incorrecta.');
  const operaciones=Object.values(openapi.paths).reduce<number>((sum,p)=>sum+Object.keys(p as object).length,0);
  await mkdir('test-results',{recursive:true});
  await writeFile('test-results/openapi.json',JSON.stringify({valido:true,version:parsed.openapi,operaciones,fecha:new Date().toISOString()},null,2));
  console.log(`OpenAPI ${parsed.openapi} válido; ${operaciones} operaciones y referencias resueltas.`);
}
main().catch(error=>{console.error(error.message);process.exitCode=1;});
