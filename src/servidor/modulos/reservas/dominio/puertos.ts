import type { Actor, EquipoSolicitado, EscenarioMensaje, EscenarioPago, Reserva } from '../../../../compartido/contratos/tipos';
export type CrearReserva = { salaId: string; inicio: string; fin: string; equipos: EquipoSolicitado[] };
export interface ReservaRepository {
  crear(actor: Actor, input: CrearReserva): Promise<Reserva>;
  listar(actor: Actor): Promise<Reserva[]>;
  obtener(id: string): Promise<Reserva>;
  cancelar(actor: Actor, id: string, motivo: string): Promise<Reserva>;
  iniciarPago(actor: Actor, id: string, clave: string): Promise<{ reserva: Reserva; pagoId: string; terminado: boolean }>;
  terminarPago(id: string, pagoId: string, aprobado: boolean, referencia: string, mensaje?: EscenarioMensaje): Promise<Reserva>;
  marcarPagoIncierto(pagoId: string): Promise<void>;
}
export interface PagoPort {
  cobrar(pagoId: string, montoCentimos: number, escenario: EscenarioPago): Promise<{ aprobado: boolean; referencia: string }>;
}
export interface MensajeriaPort {
  programar(reserva: Reserva, escenario: EscenarioMensaje): Promise<void>;
}
