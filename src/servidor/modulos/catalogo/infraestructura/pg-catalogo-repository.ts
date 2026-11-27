import { randomUUID } from 'node:crypto';
import type { Database } from '../../../infraestructura/persistencia/database';
import { exigir } from '../../../../compartido/dominio/errores';
import { expirar, ocupado } from '../../../infraestructura/persistencia/ocupacion';
import type { Recurso } from '../../../../compartido/contratos/tipos';
import type { CatalogoRepository, DatosRecurso, TipoRecurso } from '../dominio/catalogo-repository';
export class PgCatalogoRepository implements CatalogoRepository {
  constructor(private readonly db: Database) {}
  calendario(salaId:string,fecha:string) {
    return (async()=>{
      exigir((await this.db.query('SELECT id FROM salas WHERE id=$1 AND activo=true',[salaId])).rowCount,404,'SALA_NO_ENCONTRADA','Sala no encontrada.');
      const inicio=`${fecha}T00:00:00-05:00`,fin=new Date(Date.parse(inicio)+86400000).toISOString();
      const {rows}=await this.db.query("SELECT inicio,fin FROM reservas WHERE sala_id=$1 AND estado IN ('PENDIENTE','PROCESANDO','CONFIRMADA') AND (estado<>'PENDIENTE' OR vence_en>now()) AND inicio<$3 AND fin>$2 ORDER BY inicio",[salaId,inicio,fin]);
      return rows.map(r=>({inicio:new Date(r.inicio).toISOString(),fin:new Date(r.fin).toISOString()}));
    })();
  }
  async listar(tipo:TipoRecurso):Promise<Recurso[]> { return (await this.db.query<Recurso>(`SELECT * FROM ${tipo} ORDER BY nombre`)).rows; }
  guardar(tipo:TipoRecurso,datos:DatosRecurso,id?:string):Promise<Recurso> {
    return this.db.transaction(async client=>{
      await expirar(client);
      if(id) {
        const existe=(await client.query(`SELECT * FROM ${tipo} WHERE id=$1`,[id])).rows[0];
        exigir(existe,404,'NO_ENCONTRADO','Recurso no encontrado.');
        // Keep existing commitments safe; stock changes and deactivation wait until all future use is released.
        if(datos.stock!==existe.stock||datos.activo!==existe.activo) {
          const uso=tipo==='salas'
            ? await client.query("SELECT 1 FROM reservas WHERE sala_id=$1 AND fin>now() AND estado IN ('PENDIENTE','PROCESANDO','CONFIRMADA') LIMIT 1",[id])
            : await client.query("SELECT 1 FROM reserva_equipos re JOIN reservas r ON r.id=re.reserva_id WHERE re.equipo_id=$1 AND r.fin>now() AND r.estado IN ('PENDIENTE','PROCESANDO','CONFIRMADA') LIMIT 1",[id]);
          exigir(!uso.rowCount,409,'RECURSO_COMPROMETIDO','Cancela o finaliza las reservas futuras antes de cambiar stock o estado.');
        }
      }
      const values=[id??randomUUID(),datos.nombre,datos.categoria,datos.precio_centimos,tipo==='salas'?1:datos.stock,datos.activo,datos.descripcion];
      const result=await client.query(`INSERT INTO ${tipo}(id,nombre,categoria,precio_centimos,stock,activo,descripcion) VALUES($1,$2,$3,$4,$5,$6,$7)
        ON CONFLICT(id) DO UPDATE SET nombre=$2,categoria=$3,precio_centimos=$4,stock=$5,activo=$6,descripcion=$7 RETURNING *`,values);
      return result.rows[0];
    });
  }
  async eliminar(tipo:TipoRecurso,id:string) {
    await this.db.transaction(async client=>{
      await expirar(client);
      const existe=(await client.query(`SELECT id FROM ${tipo} WHERE id=$1`,[id])).rowCount;
      exigir(existe,404,'NO_ENCONTRADO','Recurso no encontrado.');
      const uso=tipo==='salas'
        ?await client.query("SELECT 1 FROM reservas WHERE sala_id=$1 AND fin>now() AND estado IN ('PENDIENTE','PROCESANDO','CONFIRMADA') LIMIT 1",[id])
        :await client.query("SELECT 1 FROM reserva_equipos re JOIN reservas r ON r.id=re.reserva_id WHERE re.equipo_id=$1 AND r.fin>now() AND r.estado IN ('PENDIENTE','PROCESANDO','CONFIRMADA') LIMIT 1",[id]);
      exigir(!uso.rowCount,409,'RECURSO_COMPROMETIDO','Cancela o finaliza las reservas futuras antes de desactivar el recurso.');
      await client.query(`UPDATE ${tipo} SET activo=false WHERE id=$1`,[id]);
    });
  }
  disponibilidad(inicio:string,fin:string) {
    // Informational reads use one SQL snapshot and never wait for the allocation lock.
    return (async()=>{
      const {rows}=await this.db.query(`WITH activas AS (
        SELECT r.sala_id,r.inicio,r.fin FROM reservas r WHERE r.estado IN ('PENDIENTE','PROCESANDO','CONFIRMADA')
        AND (r.estado<>'PENDIENTE' OR r.vence_en>now()) AND r.inicio<$2 AND r.fin>$1
      ), asignados AS (
        SELECT re.equipo_id,re.cantidad,r.inicio,r.fin FROM reservas r JOIN reserva_equipos re ON re.reserva_id=r.id
        WHERE r.estado IN ('PENDIENTE','PROCESANDO','CONFIRMADA') AND (r.estado<>'PENDIENTE' OR r.vence_en>now()) AND r.inicio<$2 AND r.fin>$1
      ), puntos AS (
        SELECT id AS equipo_id,$1::timestamptz AS instante FROM equipos WHERE activo
        UNION SELECT equipo_id,greatest(inicio,$1::timestamptz) FROM asignados
      ), picos AS (
        SELECT p.equipo_id,max((SELECT coalesce(sum(a.cantidad),0) FROM asignados a WHERE a.equipo_id=p.equipo_id AND a.inicio<=p.instante AND a.fin>p.instante)) AS cantidad FROM puntos p GROUP BY p.equipo_id
      ) SELECT jsonb_build_object(
        'salas',(SELECT coalesce(jsonb_agg(jsonb_build_object('id',s.id,'disponible',NOT EXISTS(SELECT 1 FROM activas a WHERE a.sala_id=s.id))),'[]'::jsonb) FROM salas s WHERE s.activo),
        'equipos',(SELECT coalesce(jsonb_agg(jsonb_build_object('id',e.id,'disponible',e.stock-coalesce(p.cantidad,0))),'[]'::jsonb) FROM equipos e LEFT JOIN picos p ON p.equipo_id=e.id WHERE e.activo)
      ) AS data`,[inicio,fin]);
      return rows[0].data as {salas:{id:string;disponible:boolean}[];equipos:{id:string;disponible:number}[]};
    })();
  }
}
