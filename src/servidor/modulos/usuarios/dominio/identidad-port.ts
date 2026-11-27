import type { Actor } from '../../../../compartido/contratos/tipos';
export interface IdentidadPort { autenticar(token: string): Promise<Actor>; }
