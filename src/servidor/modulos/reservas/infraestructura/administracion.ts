import { randomUUID } from 'node:crypto';
import type { Database } from '../../../infraestructura/persistencia/database';
import type { Actor,Reserva } from '../../../../compartido/contratos/tipos';
import type { PagoRegistro,NotificacionRegistro } from '../dominio/administracion-port';
import { exigir } from '../../../../compartido/dominio/errores';
import { expirar } from '../../../infraestructura/persistencia/ocupacion';
import { validarIntervalo } from '../dominio/reglas';
import { leerReserva, normalizar, PgReservaRepository } from './pg-reserva-repository';
export class AdministracionReservas {
  constructor(private readonly db:Database,private readonly repo:PgReservaRepository) {}
  private admin(actor:Actor) { exigir(actor.role==='ADMIN',403,'PROHIBIDO','Se requiere administrador.'); }
  async bloqueos(actor:Actor) { this.admin(actor); return normalizar((await this.db.query<Reserva>("SELECT r.*,s.nombre AS sala_nombre FROM reservas r JOIN salas s ON s.id=r.sala_id WHERE tipo='BLOQUEO' AND estado='CONFIRMADA' ORDER BY inicio")).rows); }
  crearBloqueo(actor:Actor,input:{salaId:string;inicio:string;fin:string;motivo:string}) {
    this.admin(actor); validarIntervalo(input.inicio,input.fin);
    return this.db.transaction(async c=>{
      await expirar(c);
      const sala=(await c.query('SELECT id FROM salas WHERE id=$1 AND activo=true',[input.salaId])).rows[0];
      exigir(sala,404,'SALA_NO_ENCONTRADA','Sala no encontrada.');
      const id=randomUUID();
      await c.query("INSERT INTO reservas(id,sala_id,inicio,fin,estado,tipo,total_centimos,motivo) VALUES($1,$2,$3,$4,'CONFIRMADA','BLOQUEO',0,$5)",[id,input.salaId,input.inicio,input.fin,input.motivo]);
      return leerReserva(c,id);
    });
  }
  async desbloquear(actor:Actor,id:string) {
    this.admin(actor);
    await this.db.transaction(async c=>{
      const result=await c.query("UPDATE reservas SET estado='CANCELADA' WHERE id=$1 AND tipo='BLOQUEO' AND estado='CONFIRMADA' RETURNING id",[id]);
      exigir(result.rowCount,404,'NO_ENCONTRADO','Bloqueo no encontrado.');
    });
  }
  async pagos(actor:Actor) { this.admin(actor); return normalizar((await this.db.query<PagoRegistro>('SELECT * FROM pagos ORDER BY creado_en DESC LIMIT 200')).rows); }
  async conciliar(actor:Actor,pagoId:string,aprobado:boolean) {
    this.admin(actor);
    const pago=(await this.db.query('SELECT * FROM pagos WHERE id=$1',[pagoId])).rows[0];
    exigir(pago&&pago.estado==='INCIERTO',409,'NO_CONCILIABLE','Solo pueden conciliarse pagos inciertos.');
    return this.repo.terminarPago(pago.reserva_id,pagoId,aprobado,`SIM-CONCILIADO-${pagoId}`);
  }
  async notificaciones(actor:Actor) { this.admin(actor); return normalizar((await this.db.query<NotificacionRegistro>('SELECT * FROM notificaciones ORDER BY creada_en DESC LIMIT 200')).rows); }
}
