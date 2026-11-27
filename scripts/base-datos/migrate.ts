import { config } from 'dotenv';
config({path:'.env.local'}); config();
import { readFile,readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { Database } from '../../src/servidor/infraestructura/persistencia/database';
async function main() {
  const db=new Database();
  try {
    await db.query('CREATE TABLE IF NOT EXISTS public.schema_migrations(nombre text PRIMARY KEY,checksum text NOT NULL,aplicada_en timestamptz NOT NULL DEFAULT now())');
    for(const file of (await readdir('supabase/migrations')).filter(f=>f.endsWith('.sql')).sort()) {
      const sql=await readFile(`supabase/migrations/${file}`,'utf8');const checksum=createHash('sha256').update(sql).digest('hex');
      await db.transaction(async c=>{
        const previo=(await c.query('SELECT checksum FROM schema_migrations WHERE nombre=$1',[file])).rows[0];
        if(previo) { if(previo.checksum!==checksum) throw new Error(`Migración modificada: ${file}. Crea una migración nueva.`); return; }
        await c.query(sql);await c.query('INSERT INTO schema_migrations(nombre,checksum) VALUES($1,$2)',[file,checksum]);
        console.log(`Aplicada: ${file}`);
      });
    }
  } finally { await db.pool.end(); }
}
main().catch(error=>{console.error(error.message);process.exitCode=1;});
