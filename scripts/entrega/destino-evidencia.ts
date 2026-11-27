import {join} from 'node:path';
/** Cada ejecución nueva conserva las evidencias previas y sus metadatos. */
export function destinoEvidencia(nombre:string){
  return join('docs','sprint-2','evidencias','ejecuciones',new Date().toISOString().replaceAll(':','-'),nombre);
}
