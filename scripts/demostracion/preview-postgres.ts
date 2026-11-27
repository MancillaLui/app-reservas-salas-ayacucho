import EmbeddedPostgres from 'embedded-postgres';
import { mkdir,readFile,writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import { createServer } from 'node:net';
import { spawn,type ChildProcess } from 'node:child_process';
import { Database } from '../../src/servidor/infraestructura/persistencia/database';
async function puerto():Promise<number> {return new Promise((res,rej)=>{const s=createServer();s.on('error',rej);s.listen(0,'127.0.0.1',()=>{const p=(s.address() as {port:number}).port;s.close(()=>res(p));});});}
async function main() {
  const root=resolve('tmp/postgres');await mkdir(root,{recursive:true});
  const port=await puerto(),password=randomUUID();
  const pg=new EmbeddedPostgres({databaseDir:resolve(root,`preview-${Date.now()}`),port,user:'postgres',password,persistent:true,initdbFlags:['--locale=C','--encoding=UTF8','--no-sync'],postgresFlags:['-h','127.0.0.1','-c','lc_messages=C'],onLog:()=>{},onError:console.error});
  let child:ChildProcess|undefined,db:Database|undefined,started=false;
  const exit=new Promise<void>(resolve=>{process.once('SIGINT',()=>resolve());process.once('SIGTERM',()=>resolve());});
  try {
    console.log('Preparando vista de prueba con PostgreSQL aislado…');await pg.initialise();await pg.start();started=true;await pg.createDatabase('preview_test');
    const url=`postgresql://postgres:${password}@127.0.0.1:${port}/preview_test`;
    db=new Database(url,'disable');await db.query(await readFile('supabase/migrations/202611260001_sprint2.sql','utf8'));
    await db.query("INSERT INTO salas(id,nombre,precio_centimos,descripcion) VALUES('10000000-0000-4000-8000-000000000001','Sala Wari',3000,'Espacio acústico para bandas de hasta 5 integrantes.'),('10000000-0000-4000-8000-000000000002','Sala Huamanga',4500,'Sala amplia para ensambles y sesiones con batería.')");
    await db.query("INSERT INTO equipos(id,nombre,categoria,precio_centimos,stock,descripcion) VALUES('20000000-0000-4000-8000-000000000001','Micrófono dinámico','Voces',1000,4,'Micrófono y pedestal.'),('20000000-0000-4000-8000-000000000002','Amplificador de guitarra','Amplificadores',2000,2,'Amplificador de 60 W.'),('20000000-0000-4000-8000-000000000003','Set de platillos','Percusión',1500,1,'Hi-hat, crash y ride.')");
    const webPort=Number(process.env.PREVIEW_PORT||3000);
    child=spawn(process.execPath,['node_modules/next/dist/bin/next','start','-H','127.0.0.1','-p',String(webPort)],{stdio:'inherit',env:{...process.env,DATABASE_URL:url,DATABASE_SSL:'disable'},windowsHide:true});
    const base=`http://127.0.0.1:${webPort}`;
    for(let attempt=0;attempt<40;attempt++) {try{if((await fetch(`${base}/api/v1/health`)).ok)break;}catch{}await new Promise(r=>setTimeout(r,500));}
    const health=await fetch(`${base}/api/v1/health`);if(!health.ok)throw new Error('La vista de prueba no arrancó.');
    console.log(`Vista local: ${base}. Catálogo conectado a PostgreSQL. El login sigue requiriendo Supabase real.`);
    if(process.argv.includes('--benchmark')) {
      const timings:number[]=[];let failed=0;
      const inicio=new Date(Date.now()+86400000*3).toISOString(),fin=new Date(Date.now()+86400000*3+3600000).toISOString();
      await Promise.all(Array.from({length:20},async()=>{for(let n=0;n<10;n++){const t=performance.now();const r=await fetch(`${base}/api/v1/disponibilidad?${new URLSearchParams({inicio,fin})}`);if(!r.ok)failed++;await r.text();timings.push(performance.now()-t);}}));
      timings.sort((a,b)=>a-b);await mkdir('test-results',{recursive:true});
      const result={fecha:new Date().toISOString(),herramienta:'Node fetch (no k6)',endpoint:'/api/v1/disponibilidad',base:'PostgreSQL temporal, 2 salas y 3 equipos, sin reservas',usuariosConcurrentes:20,solicitudes:timings.length,fallos:failed,p95_ms:timings[Math.ceil(timings.length*.95)-1],max_ms:timings.at(-1),promedio_ms:timings.reduce((a,b)=>a+b,0)/timings.length};
      await writeFile('test-results/http-benchmark.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));
      const plan=await db.query("EXPLAIN (ANALYZE,BUFFERS,FORMAT JSON) SELECT s.id,NOT EXISTS(SELECT 1 FROM reservas r WHERE r.sala_id=s.id AND r.estado IN ('PENDIENTE','PROCESANDO','CONFIRMADA') AND r.inicio<$2 AND r.fin>$1) AS disponible FROM salas s WHERE s.activo",[inicio,fin]);
      await writeFile('test-results/plan-consulta.json',JSON.stringify(plan.rows[0]['QUERY PLAN'],null,2));
      if(failed)process.exitCode=1;
    }
    if(!process.argv.includes('--once'))await Promise.race([exit,new Promise<void>(r=>child!.once('exit',()=>r()))]);
  } finally {child?.kill();if(db)await db.pool.end();if(started)await pg.stop();}
}
main().catch(error=>{console.error(error.message);process.exitCode=1;});
