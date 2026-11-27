import EmbeddedPostgres from 'embedded-postgres';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import { createServer } from 'node:net';
import { spawn } from 'node:child_process';
async function puerto():Promise<number> {return new Promise((res,rej)=>{const server=createServer();server.on('error',rej);server.listen(0,'127.0.0.1',()=>{const port=(server.address() as {port:number}).port;server.close(()=>res(port));});});}
async function main() {
  const root=resolve('tmp/postgres');await mkdir(root,{recursive:true});
  const port=await puerto(),password=randomUUID();
  const databaseDir=resolve(root,`run-${Date.now()}`);
  // persistent=true avoids any implicit recursive deletion. All temporary files stay in tmp/postgres.
  const pg=new EmbeddedPostgres({databaseDir,port,user:'postgres',password,persistent:true,initdbFlags:['--locale=C','--encoding=UTF8','--no-sync'],postgresFlags:['-h','127.0.0.1','-c','lc_messages=C'],onLog:message=>{if(process.env.PG_DEBUG)console.log(message);},onError:console.error});
  let started=false;
  try {
    console.log('Inicializando PostgreSQL temporal…');
    await pg.initialise();console.log('Iniciando motor PostgreSQL…');await pg.start();started=true;await pg.createDatabase('sprint2_test');
    console.log('PostgreSQL temporal iniciado en loopback. Base aislada: sprint2_test.');
    const code=await new Promise<number>(res=>{
      const args=process.argv.slice(2),all=args.includes('--all');
      const child=spawn(process.execPath,['node_modules/jest/bin/jest.js','--config',all?'jest.all.config.cjs':'jest.integration.config.cjs','--runInBand',...args.filter(a=>a!=='--all')],{stdio:'inherit',env:{...process.env,TEST_DATABASE_URL:`postgresql://postgres:${password}@127.0.0.1:${port}/sprint2_test`,TEST_DATABASE_SSL:'disable'},windowsHide:true});
      child.on('error',error=>{console.error(error.message);res(1);});child.on('exit',code=>res(code??1));
    });
    process.exitCode=code;
  } finally {if(started)await pg.stop();}
}
main().catch(error=>{console.error('No fue posible ejecutar PostgreSQL temporal:',error.message);process.exitCode=1;});
