import type { Recurso } from '../../../shared/tipos';
export type TipoRecurso = 'salas' | 'equipos';
export type DatosRecurso = Omit<Recurso,'id'>;
export interface CatalogoRepository {
  listar(tipo: TipoRecurso): Promise<Recurso[]>;
  guardar(tipo: TipoRecurso,datos: DatosRecurso,id?: string): Promise<Recurso>;
  eliminar(tipo: TipoRecurso,id: string): Promise<void>;
  disponibilidad(inicio: string,fin: string): Promise<{salas: {id:string;disponible:boolean}[];equipos:{id:string;disponible:number}[]}>;
  calendario(salaId:string,fecha:string):Promise<{inicio:string;fin:string}[]>;
}
