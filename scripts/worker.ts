import { config } from 'dotenv';
config({path:'.env.local'}); config();
import { Database } from '../src/shared/database';
import { tick } from '../src/shared/worker';
const db=new Database();let running=true;
process.on('SIGINT',()=>{running=false;});process.on('SIGTERM',()=>{running=false;});
async function main() {
  console.log('Worker activo: expiración y mensajería simulada. Ctrl+C para detener.');
  try {
    while(running) {
      try {const total=await tick(db);if(total) console.log(`Comprobantes procesados: ${total}`);} catch(error) {console.error('Worker:',error instanceof Error?error.message:String(error));}
      if(running) await new Promise(resolve=>setTimeout(resolve,Math.max(1000,Number(process.env.WORKER_INTERVAL_MS)||15000)));
    }
  } finally {await db.pool.end();}
}
main().catch(error=>{console.error(error.message);process.exitCode=1;});
