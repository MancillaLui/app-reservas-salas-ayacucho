import { config } from 'dotenv';
config({path:'.env.local'}); config();
import { Database } from '../src/shared/database';
async function main() {
  const db=new Database();
  try { await db.transaction(async c=>{
    await c.query(`INSERT INTO salas(id,nombre,precio_centimos,descripcion) VALUES
      ('10000000-0000-4000-8000-000000000001','Sala Wari',3000,'Espacio acústico para bandas de hasta 5 integrantes.'),
      ('10000000-0000-4000-8000-000000000002','Sala Huamanga',4500,'Sala amplia para ensambles y sesiones con batería.') ON CONFLICT DO NOTHING`);
    await c.query(`INSERT INTO equipos(id,nombre,categoria,precio_centimos,stock,descripcion) VALUES
      ('20000000-0000-4000-8000-000000000001','Micrófono dinámico','Voces',1000,4,'Micrófono y pedestal; tarifa por ensayo.'),
      ('20000000-0000-4000-8000-000000000002','Amplificador de guitarra','Amplificadores',2000,2,'Amplificador de 60 W; tarifa por ensayo.'),
      ('20000000-0000-4000-8000-000000000003','Set de platillos','Percusión',1500,1,'Hi-hat, crash y ride; tarifa por ensayo.') ON CONFLICT DO NOTHING`);
  }); console.log('Catálogo de demostración creado. Crea las cuentas en Supabase Auth; no se incluyen contraseñas.'); }
  finally { await db.pool.end(); }
}
main().catch(error=>{console.error(error.message);process.exitCode=1;});
