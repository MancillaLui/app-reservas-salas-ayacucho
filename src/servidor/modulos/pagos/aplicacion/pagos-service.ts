import type { ProveedorPago } from '../dominio/proveedor-pago';
import type { EscenarioPago } from '../../../../compartido/contratos/tipos';
export class PagosService {
  constructor(private readonly proveedor: ProveedorPago) {}
  cobrar(id: string, monto: number, escenario: EscenarioPago) { return this.proveedor.cobrar(id, monto, escenario); }
}
