import { createClient } from '@supabase/supabase-js';
import type { IdentidadPort } from '../dominio/identidad-port';
import type { Database } from '../../../shared/database';
import type { Actor } from '../../../shared/tipos';
import { exigir } from '../../../shared/errores';
export class SupabaseIdentidad implements IdentidadPort {
  constructor(private readonly db:Database) {}
  async autenticar(token:string):Promise<Actor> {
    const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    exigir(url&&key,503,'CONFIGURACION_PENDIENTE','Configura las claves públicas de Supabase.');
    const client=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
    const {data,error}=await client.auth.getUser(token);
    exigir(!error&&data.user,401,'TOKEN_INVALIDO','La sesión es inválida o ha expirado.');
    const user=data.user;
    // Roles come from server-controlled SQL, never editable user_metadata.
    await this.db.query('INSERT INTO perfiles(id,email) VALUES($1,$2) ON CONFLICT(id) DO UPDATE SET email=EXCLUDED.email',[user.id,user.email??'']);
    const {rows}=await this.db.query('SELECT rol FROM perfiles WHERE id=$1',[user.id]);
    return {id:user.id,role:rows[0].rol,email:user.email};
  }
}
