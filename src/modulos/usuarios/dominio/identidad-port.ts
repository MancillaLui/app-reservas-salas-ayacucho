import type { Actor } from '../../../shared/tipos';
export interface IdentidadPort { autenticar(token: string): Promise<Actor>; }
