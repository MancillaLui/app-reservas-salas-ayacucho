import type { MensajeriaPort } from '../dominio/puertos';
import type { Database } from '../../../infraestructura/persistencia/database';
import type { Reserva, EscenarioMensaje } from '../../../../compartido/contratos/tipos';
export class MensajeriaSimulada implements MensajeriaPort {
  constructor(private readonly db:Database) {}
  async programar(reserva:Reserva,escenario:EscenarioMensaje) {
    // Receipt + delivery scenario were persisted with confirmation. Check scheduling only;
    // delivery never runs on the request lifecycle.
    void escenario;
    await this.db.query("SELECT id FROM notificaciones WHERE reserva_id=$1 AND tipo='CONFIRMACION'",[reserva.id]);
  }
}
