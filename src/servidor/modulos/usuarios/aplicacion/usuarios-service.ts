import type { IdentidadPort } from '../dominio/identidad-port';
import { exigir } from '../../../../compartido/dominio/errores';
export class UsuariosService {
  constructor(private readonly identidad: IdentidadPort) {}
  autenticar(header: string|null) {
    exigir(header && header.startsWith('Bearer '),401,'NO_AUTENTICADO','Inicia sesión o envía un token Bearer válido.');
    return this.identidad.autenticar(header.slice(7));
  }
}
