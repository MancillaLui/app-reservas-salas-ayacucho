import { Database } from './shared/database';
import { CatalogoService } from './modulos/catalogo';
import { PgCatalogoRepository } from './modulos/catalogo/infraestructura/pg-catalogo-repository';
import { ReservasService } from './modulos/reservas';
import { PgReservaRepository } from './modulos/reservas/infraestructura/pg-reserva-repository';
import { AdministracionReservas } from './modulos/reservas/infraestructura/administracion';
import { AdministracionService } from './modulos/reservas/aplicacion/administracion-service';
import { MensajeriaSimulada } from './modulos/reservas/infraestructura/mensajeria-simulada';
import { PagosService, PagoSimulado } from './modulos/pagos';
import { UsuariosService } from './modulos/usuarios';
import { SupabaseIdentidad } from './modulos/usuarios/infraestructura/supabase-identidad';
export function crearServicios(db=new Database()) {
  const repo=new PgReservaRepository(db);
  return {db,catalogo:new CatalogoService(new PgCatalogoRepository(db)),
    reservas:new ReservasService(repo,new PagosService(new PagoSimulado()),new MensajeriaSimulada(db)),
    usuarios:new UsuariosService(new SupabaseIdentidad(db)),admin:new AdministracionService(new AdministracionReservas(db,repo))};
}
type Servicios=ReturnType<typeof crearServicios>;
const state=globalThis as typeof globalThis & {serviciosReservas?:Servicios};
export function servicios() { return state.serviciosReservas??=(crearServicios()); }
