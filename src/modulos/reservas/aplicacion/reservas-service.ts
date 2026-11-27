import type { Actor, EscenarioMensaje, EscenarioPago } from '../../../shared/tipos';
import { AppError } from '../../../shared/errores';
import { puedeVer, validarEquipos, validarIntervalo } from '../dominio/reglas';
import type { CrearReserva, MensajeriaPort, PagoPort, ReservaRepository } from '../dominio/puertos';

export class ReservasService {
  constructor(private readonly repo: ReservaRepository, private readonly pagos: PagoPort, private readonly mensajes: MensajeriaPort) {}
  crear(actor: Actor, input: CrearReserva) { validarIntervalo(input.inicio, input.fin); validarEquipos(input.equipos); return this.repo.crear(actor, input); }
  listar(actor: Actor) { return this.repo.listar(actor); }
  async obtener(actor: Actor, id: string) { const reserva = await this.repo.obtener(id); puedeVer(actor, reserva); return reserva; }
  cancelar(actor: Actor, id: string, motivo: string) { return this.repo.cancelar(actor, id, motivo); }
  async pagar(actor: Actor, id: string, clave: string, escenario: EscenarioPago, mensaje: EscenarioMensaje) {
    const intento = await this.repo.iniciarPago(actor, id, clave);
    if (intento.terminado) return intento.reserva;
    let resultado;
    try { resultado = await this.pagos.cobrar(intento.pagoId, intento.reserva.total_centimos, escenario); }
    catch {
      await this.repo.marcarPagoIncierto(intento.pagoId);
      throw new AppError(503, 'PAGO_INCIERTO', 'El resultado de pago es incierto. La reserva conserva sus recursos hasta la conciliación; no repitas el cobro.');
    }
    const reserva = await this.repo.terminarPago(id, intento.pagoId, resultado.aprobado, resultado.referencia, mensaje);
    if (resultado.aprobado) {
      // Persisted confirmation precedes notification. Delivery is handled by the worker.
      await this.mensajes.programar(reserva, mensaje).catch(error => console.error('Notificación no programada', { reservaId: reserva.id, error: String(error) }));
    }
    return reserva;
  }
}
