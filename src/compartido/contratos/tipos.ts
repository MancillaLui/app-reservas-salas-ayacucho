export type Actor = { id: string; role: 'CLIENTE' | 'ADMIN'; email?: string };
export type EquipoSolicitado = { equipoId: string; cantidad: number };
export type Recurso = { id: string; nombre: string; categoria: string; precio_centimos: number; stock: number; activo: boolean; descripcion: string };
export type EstadoReserva = 'PENDIENTE' | 'PROCESANDO' | 'CONFIRMADA' | 'CANCELADA' | 'EXPIRADA';
export type Reserva = {
  id: string; cliente_id: string | null; sala_id: string; inicio: string; fin: string;
  estado: EstadoReserva; tipo: 'RESERVA' | 'BLOQUEO'; total_centimos: number;
  vence_en: string | null; motivo: string | null; creada_en: string;
  sala_nombre?: string; equipos?: { equipo_id: string; cantidad: number; precio_centimos: number; nombre?: string }[];
};
export type EscenarioPago = 'aprobado' | 'rechazado' | 'demora' | 'fallo';
export type EscenarioMensaje = 'normal' | 'demora' | 'fallo';
