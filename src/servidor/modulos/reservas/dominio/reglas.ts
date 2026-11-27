import { exigir } from '../../../../compartido/dominio/errores';
import type { Actor, EquipoSolicitado, Reserva } from '../../../../compartido/contratos/tipos';

export { validarIntervalo } from '../../../../compartido/dominio/intervalo';
export function validarEquipos(equipos: EquipoSolicitado[]) {
  exigir(new Set(equipos.map(e => e.equipoId)).size === equipos.length && equipos.every(e => e.equipoId && Number.isSafeInteger(e.cantidad) && e.cantidad > 0), 400, 'EQUIPOS_INVALIDOS', 'Los equipos no deben repetirse y las cantidades deben ser enteros positivos.');
}
export function calcularTotal(inicio: string, fin: string, tarifa: number, extras: { cantidad: number; precio_centimos: number }[]) {
  const total = Math.round((Date.parse(fin) - Date.parse(inicio)) / 3600_000 * tarifa) + extras.reduce((sum, e) => sum + e.cantidad * e.precio_centimos, 0);
  exigir(Number.isSafeInteger(total) && total > 0 && total<=2147483647, 400, 'IMPORTE_INVALIDO', 'El importe debe ser positivo y no exceder el límite de 2.147.483.647 céntimos.');
  return total;
}
export function puedeVer(actor: Actor, reserva: Reserva) {
  exigir(actor.role === 'ADMIN' || reserva.cliente_id === actor.id, 403, 'PROHIBIDO', 'No tienes permiso sobre esta reserva.');
}
export function validarCancelacion(actor: Actor, reserva: Reserva, now = Date.now()) {
  puedeVer(actor, reserva);
  exigir(reserva.tipo === 'RESERVA', 400, 'TIPO_INVALIDO', 'Los bloqueos se eliminan desde administración.');
  exigir(['PENDIENTE', 'CONFIRMADA'].includes(reserva.estado), 409, 'ESTADO_INVALIDO', 'La reserva no puede cancelarse en su estado actual.');
  exigir(actor.role === 'ADMIN' || Date.parse(reserva.inicio) > now, 409, 'CANCELACION_TARDIA', 'Solo puedes cancelar antes del inicio.');
}
export function validarPendiente(reserva: Reserva, now = Date.now()) {
  exigir(reserva.estado === 'PENDIENTE' && !!reserva.vence_en && Date.parse(reserva.vence_en) > now, 409, 'RESERVA_NO_PAGABLE', 'La reserva ya no está pendiente o venció.');
}
