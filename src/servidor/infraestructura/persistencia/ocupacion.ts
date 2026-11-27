import type { PoolClient } from 'pg';
export async function expirar(client: PoolClient) {
  await client.query("UPDATE reservas SET estado='EXPIRADA',vence_en=NULL WHERE estado='PENDIENTE' AND vence_en<=now()");
}
// Peak simultaneous usage, rather than the sum of all reservations overlapping the interval.
export async function ocupado(client: PoolClient, equipoId: string, inicio: string, fin: string): Promise<number> {
  const { rows } = await client.query(`
    WITH activas AS (
      SELECT r.inicio,r.fin,re.cantidad FROM reservas r JOIN reserva_equipos re ON re.reserva_id=r.id
      WHERE re.equipo_id=$1 AND r.estado IN ('PENDIENTE','PROCESANDO','CONFIRMADA')
      AND (r.estado<>'PENDIENTE' OR r.vence_en>now()) AND r.inicio<$3 AND r.fin>$2
    ), puntos AS (SELECT $2::timestamptz AS instante UNION SELECT inicio FROM activas WHERE inicio>=$2)
    SELECT coalesce(max((SELECT coalesce(sum(a.cantidad),0) FROM activas a WHERE a.inicio<=p.instante AND a.fin>p.instante)),0)::int AS cantidad FROM puntos p`, [equipoId,inicio,fin]);
  return rows[0].cantidad;
}
