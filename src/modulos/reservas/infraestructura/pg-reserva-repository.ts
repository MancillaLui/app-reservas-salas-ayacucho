import { randomUUID } from 'node:crypto';
import type { PoolClient } from 'pg';
import type { Database } from '../../../shared/database';
import { exigir } from '../../../shared/errores';
import { expirar, ocupado } from '../../../shared/ocupacion';
import type { Actor, Reserva, EscenarioMensaje } from '../../../shared/tipos';
import { calcularTotal, puedeVer, validarCancelacion, validarPendiente, validarIntervalo, validarEquipos } from '../dominio/reglas';
import type { CrearReserva, ReservaRepository } from '../dominio/puertos';

export const normalizar = <T>(value: T): T => JSON.parse(JSON.stringify(value));
export async function leerReserva(client: PoolClient, id: string): Promise<Reserva> {
  const { rows } = await client.query(`SELECT r.*,s.nombre AS sala_nombre,
    coalesce((SELECT jsonb_agg(jsonb_build_object('equipo_id',re.equipo_id,'cantidad',re.cantidad,'precio_centimos',re.precio_centimos,'nombre',e.nombre))
    FROM reserva_equipos re JOIN equipos e ON e.id=re.equipo_id WHERE re.reserva_id=r.id),'[]'::jsonb) AS equipos
    FROM reservas r JOIN salas s ON s.id=r.sala_id WHERE r.id=$1`, [id]);
  exigir(rows.length,404,'NO_ENCONTRADO','Reserva no encontrada.');
  return normalizar(rows[0]);
}
export class PgReservaRepository implements ReservaRepository {
  constructor(private readonly db: Database) {}
  async crear(actor: Actor, input: CrearReserva) {
    return this.db.transaction(async client => {
      await expirar(client);
      validarIntervalo(input.inicio,input.fin); validarEquipos(input.equipos);
      const sala = (await client.query('SELECT * FROM salas WHERE id=$1 AND activo=true',[input.salaId])).rows[0];
      exigir(sala,404,'SALA_NO_ENCONTRADA','Sala no disponible.');
      const cruce = await client.query("SELECT 1 FROM reservas WHERE sala_id=$1 AND estado IN ('PENDIENTE','PROCESANDO','CONFIRMADA') AND inicio<$3 AND fin>$2",[input.salaId,input.inicio,input.fin]);
      exigir(!cruce.rowCount,409,'SALA_OCUPADA','La sala está reservada o bloqueada en ese horario.');
      const extras: {equipoId:string;cantidad:number;precio_centimos:number}[] = [];
      for (const item of input.equipos) {
        const equipo = (await client.query('SELECT * FROM equipos WHERE id=$1 AND activo=true',[item.equipoId])).rows[0];
        exigir(equipo,404,'EQUIPO_NO_ENCONTRADO','Equipo no disponible.');
        const usados = await ocupado(client,item.equipoId,input.inicio,input.fin);
        exigir(equipo.stock-usados>=item.cantidad,409,'STOCK_INSUFICIENTE',`Stock insuficiente de ${equipo.nombre}.`);
        extras.push({...item,precio_centimos:equipo.precio_centimos});
      }
      const total = calcularTotal(input.inicio,input.fin,sala.precio_centimos,extras);
      const id = randomUUID();
      await client.query("INSERT INTO reservas(id,cliente_id,sala_id,inicio,fin,estado,total_centimos,vence_en) VALUES($1,$2,$3,$4,$5,'PENDIENTE',$6,now()+interval '10 minutes')",[id,actor.id,input.salaId,input.inicio,input.fin,total]);
      for (const item of extras) await client.query('INSERT INTO reserva_equipos VALUES($1,$2,$3,$4)',[id,item.equipoId,item.cantidad,item.precio_centimos]);
      return leerReserva(client,id);
    });
  }
  async listar(actor: Actor): Promise<Reserva[]> {
    return this.db.transaction(async client => {
      await expirar(client);
      const { rows } = await client.query("SELECT r.*,s.nombre AS sala_nombre FROM reservas r JOIN salas s ON s.id=r.sala_id WHERE r.tipo='RESERVA' AND ($1='ADMIN' OR r.cliente_id=$2) ORDER BY r.inicio DESC LIMIT 200",[actor.role,actor.id]);
      return normalizar(rows);
    });
  }
  obtener(id: string) { return this.db.transaction(async c => { await expirar(c); return leerReserva(c,id); }); }
  cancelar(actor: Actor,id: string,motivo: string) {
    return this.db.transaction(async client => {
      await expirar(client);
      const reserva = await leerReserva(client,id); validarCancelacion(actor,reserva);
      await client.query("UPDATE reservas SET estado='CANCELADA',vence_en=NULL,motivo=$2 WHERE id=$1",[id,motivo]);
      await client.query("UPDATE pagos SET reembolso_pendiente=true WHERE reserva_id=$1 AND estado='APROBADO'",[id]);
      await client.query(`INSERT INTO notificaciones(id,reserva_id,tipo,escenario,comprobante) VALUES($1,$2,'CANCELACION','normal',$3) ON CONFLICT DO NOTHING`,[randomUUID(),id,JSON.stringify({reservaId:id,estado:'CANCELADA',motivo})]);
      return leerReserva(client,id);
    });
  }
  iniciarPago(actor: Actor,id: string,clave: string) {
    return this.db.transaction(async client => {
      await expirar(client);
      const reserva = await leerReserva(client,id); puedeVer(actor,reserva);
      exigir(reserva.tipo==='RESERVA',400,'TIPO_INVALIDO','No se puede pagar un bloqueo.');
      const previo = (await client.query('SELECT * FROM pagos WHERE reserva_id=$1',[id])).rows[0];
      if (previo) {
        exigir(previo.clave===clave,409,'INTENTO_EXISTENTE','Ya existe un intento de pago. Reutiliza su Idempotency-Key.');
        exigir(['APROBADO','RECHAZADO'].includes(previo.estado),409,'PAGO_EN_PROCESO','Pago en proceso o incierto; espera la conciliación.');
        return {reserva,pagoId:previo.id,terminado:true};
      }
      validarPendiente(reserva);
      const pagoId = randomUUID();
      await client.query("INSERT INTO pagos(id,reserva_id,clave,monto_centimos,estado) VALUES($1,$2,$3,$4,'PROCESANDO')",[pagoId,id,clave,reserva.total_centimos]);
      await client.query("UPDATE reservas SET estado='PROCESANDO',vence_en=NULL WHERE id=$1",[id]);
      return {reserva:await leerReserva(client,id),pagoId,terminado:false};
    });
  }
  terminarPago(id: string,pagoId: string,aprobado: boolean,referencia: string,mensaje:EscenarioMensaje='normal') {
    return this.db.transaction(async client => {
      const pago = (await client.query('SELECT * FROM pagos WHERE id=$1 AND reserva_id=$2',[pagoId,id])).rows[0];
      exigir(pago && ['PROCESANDO','INCIERTO'].includes(pago.estado),409,'ESTADO_INVALIDO','El intento ya fue resuelto.');
      const reserva = await leerReserva(client,id);
      exigir(reserva.estado==='PROCESANDO',409,'ESTADO_INVALIDO','La reserva no está procesando un pago.');
      await client.query('UPDATE pagos SET estado=$2,referencia=$3 WHERE id=$1',[pagoId,aprobado?'APROBADO':'RECHAZADO',referencia]);
      await client.query('UPDATE reservas SET estado=$2,motivo=$3 WHERE id=$1',[id,aprobado?'CONFIRMADA':'CANCELADA',aprobado?null:'Pago rechazado']);
      const final = await leerReserva(client,id);
      if (aprobado) await client.query("INSERT INTO notificaciones(id,reserva_id,escenario,comprobante) VALUES($1,$2,$3,$4) ON CONFLICT DO NOTHING",[randomUUID(),id,mensaje,JSON.stringify({reservaId:id,totalCentimos:final.total_centimos,inicio:final.inicio,fin:final.fin,estado:final.estado,referencia,simulado:true})]);
      return final;
    });
  }
  async marcarPagoIncierto(pagoId: string) {
    await this.db.transaction(async c => { await c.query("UPDATE pagos SET estado='INCIERTO' WHERE id=$1 AND estado='PROCESANDO'",[pagoId]); });
  }
}
