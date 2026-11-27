import type { Actor } from '../../../shared/tipos';
import { exigir } from '../../../shared/errores';
import { validarIntervalo } from '../../../shared/intervalo';
import type { AdministracionPort,BloqueoInput } from '../dominio/administracion-port';
export class AdministracionService {
  constructor(private readonly repo:AdministracionPort) {}
  private admin(actor:Actor) {exigir(actor.role==='ADMIN',403,'PROHIBIDO','Se requiere administrador.');}
  bloqueos(actor:Actor) {this.admin(actor);return this.repo.bloqueos(actor);}
  crearBloqueo(actor:Actor,input:BloqueoInput) {this.admin(actor);validarIntervalo(input.inicio,input.fin);return this.repo.crearBloqueo(actor,input);}
  desbloquear(actor:Actor,id:string) {this.admin(actor);return this.repo.desbloquear(actor,id);}
  pagos(actor:Actor) {this.admin(actor);return this.repo.pagos(actor);}
  conciliar(actor:Actor,id:string,aprobado:boolean) {this.admin(actor);return this.repo.conciliar(actor,id,aprobado);}
  notificaciones(actor:Actor) {this.admin(actor);return this.repo.notificaciones(actor);}
}
