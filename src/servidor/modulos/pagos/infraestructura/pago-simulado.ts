import type { ProveedorPago } from '../dominio/proveedor-pago';
import type { EscenarioPago } from '../../../../compartido/contratos/tipos';
export class PagoSimulado implements ProveedorPago {
  async cobrar(pagoId: string, montoCentimos: number, escenario: EscenarioPago) {
    if (montoCentimos <= 0) throw new Error('Importe inválido');
    if (escenario === 'demora') await new Promise(resolve => setTimeout(resolve, 1500));
    if (escenario === 'fallo') throw new Error('Timeout simulado: requiere conciliación');
    return { aprobado: escenario !== 'rechazado', referencia: `SIM-${pagoId}` };
  }
}
