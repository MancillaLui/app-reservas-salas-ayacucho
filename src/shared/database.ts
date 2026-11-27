import { Pool, type PoolClient, type QueryResultRow } from 'pg';
import { readFileSync } from 'node:fs';
import { AppError } from './errores';
export class Database {
  readonly pool: Pool;
  constructor(url = process.env.DATABASE_URL, ssl = process.env.DATABASE_SSL) {
    if (!url) throw new AppError(503, 'CONFIGURACION_PENDIENTE', 'Configura DATABASE_URL y Supabase siguiendo docs/sprint-2/INICIO.md.');
    const caFile=process.env.DATABASE_SSL_CA_FILE;
    const tls=ssl==='require'?{rejectUnauthorized:true,...(caFile?{ca:readFileSync(caFile,'utf8')}:{})}:undefined;
    this.pool = new Pool({ connectionString: url, ssl: tls, max: 10, connectionTimeoutMillis: 10000, statement_timeout: 15000 });
    this.pool.on('error', error => console.error('Conexión PostgreSQL interrumpida', { code: (error as { code?: string }).code }));
  }
  private capacidad() {if(this.pool.waitingCount>=100)throw new AppError(503,'CAPACIDAD_TEMPORAL','El servidor está ocupado. Intenta nuevamente en unos segundos.');}
  query<T extends QueryResultRow = QueryResultRow>(sql: string, values: unknown[] = []) {this.capacidad();return this.pool.query<T>(sql, values); }
  async transaction<T>(work: (client: PoolClient) => Promise<T>): Promise<T> {
    this.capacidad();const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      // Single local business: one allocation lock. Every resource/state mutation uses it.
      await client.query('SELECT pg_advisory_xact_lock(48802)');
      const result = await work(client);
      await client.query('COMMIT');
      return result;
    } catch (error) { await client.query('ROLLBACK'); throw error; }
    finally { client.release(); }
  }
}
