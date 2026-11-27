import type { EscenarioPago } from '../../../shared/tipos';
export interface ProveedorPago {
  cobrar(pagoId: string, montoCentimos: number, escenario: EscenarioPago): Promise<{ aprobado: boolean; referencia: string }>;
}
