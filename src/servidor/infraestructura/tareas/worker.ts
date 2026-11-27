import type { Database } from '../persistencia/database';
import { expirar } from '../persistencia/ocupacion';
export async function tick(db:Database) {
  const tareas=await db.transaction(async c=>{
    await expirar(c);
    // A crashed payment handler cannot cause a second charge or release its resources.
    await c.query("UPDATE pagos SET estado='INCIERTO' WHERE estado='PROCESANDO' AND creado_en<now()-interval '2 minutes'");
    await c.query("UPDATE notificaciones SET estado='PENDIENTE' WHERE estado='ENVIANDO' AND actualizada_en<now()-interval '1 minute'");
    return (await c.query(`UPDATE notificaciones SET estado='ENVIANDO',intentos=intentos+1,actualizada_en=now()
      WHERE id IN (SELECT id FROM notificaciones WHERE estado='PENDIENTE' ORDER BY creada_en LIMIT 10 FOR UPDATE SKIP LOCKED) RETURNING *`)).rows;
  });
  await Promise.all(tareas.map(async tarea=>{
    try {
      if(tarea.escenario==='demora') await new Promise(resolve=>setTimeout(resolve,2000));
      if(tarea.escenario==='fallo') throw new Error('Fallo simulado de mensajería');
      await db.query("UPDATE notificaciones SET estado='ENVIADA',error=NULL,actualizada_en=now() WHERE id=$1",[tarea.id]);
    } catch(error) {
      await db.query("UPDATE notificaciones SET estado='FALLIDA',error=$2,actualizada_en=now() WHERE id=$1",[tarea.id,String(error)]);
    }
  }));
  return tareas.length;
}
