import type { CachePort } from '../dominio/cache-port';
import { exigir } from '../../../../compartido/dominio/errores';
import type { Actor, Recurso } from '../../../../compartido/contratos/tipos';
import { validarIntervalo } from '../../../../compartido/dominio/intervalo';
import type { CatalogoRepository, DatosRecurso, TipoRecurso } from '../dominio/catalogo-repository';
export class CatalogoService {
  constructor(private readonly repo: CatalogoRepository, private readonly caches: Record<TipoRecurso,CachePort<Recurso[]>>) {}
  async listar(tipo: TipoRecurso,categoria?: string,admin=false) {
    const rows=await this.caches[tipo].get(()=>this.repo.listar(tipo));
    return rows.filter(row=>(admin||row.activo)&&(!categoria||row.categoria===categoria));
  }
  async guardar(actor: Actor,tipo: TipoRecurso,datos: DatosRecurso,id?: string) {
    exigir(actor.role==='ADMIN',403,'PROHIBIDO','Se requiere administrador.');
    try { return await this.repo.guardar(tipo,datos,id); } finally { this.caches[tipo].invalidate(); }
  }
  async eliminar(actor: Actor,tipo: TipoRecurso,id: string) {
    exigir(actor.role==='ADMIN',403,'PROHIBIDO','Se requiere administrador.');
    try { await this.repo.eliminar(tipo,id); } finally { this.caches[tipo].invalidate(); }
  }
  disponibilidad(inicio:string,fin:string) { validarIntervalo(inicio,fin); return this.repo.disponibilidad(inicio,fin); }
  calendario(salaId:string,fecha:string) {return this.repo.calendario(salaId,fecha);}
}
