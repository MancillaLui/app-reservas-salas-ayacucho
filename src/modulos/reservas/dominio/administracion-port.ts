import type { Actor,Reserva } from '../../../shared/tipos';
export type BloqueoInput={salaId:string;inicio:string;fin:string;motivo:string};
export type PagoRegistro={id:string;reserva_id:string;estado:string;monto_centimos:number;reembolso_pendiente:boolean};
export type NotificacionRegistro={id:string;reserva_id:string;tipo:string;estado:string;error:string|null;comprobante:unknown};
export interface AdministracionPort {
  bloqueos(actor:Actor):Promise<Reserva[]>;
  crearBloqueo(actor:Actor,input:BloqueoInput):Promise<Reserva>;
  desbloquear(actor:Actor,id:string):Promise<void>;
  pagos(actor:Actor):Promise<PagoRegistro[]>;
  conciliar(actor:Actor,id:string,aprobado:boolean):Promise<Reserva>;
  notificaciones(actor:Actor):Promise<NotificacionRegistro[]>;
}
