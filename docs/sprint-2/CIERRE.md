# Cierre verificable del Sprint 2

Este índice relaciona la entrega con el PDF `ENTREGABLE-SPRINT-2.pdf` proporcionado por el estudiante. Fecha de revisión: 26 de noviembre de 2026, America/Lima. El PDF exige implementación, Swagger, Jest/cobertura y resultados de calidad; recomienda GitHub Actions.

| Punto de la consigna | Dónde revisarlo | Estado |
|---|---|---|
| Estilo y enfoque implementados | `src/servidor/modulos`, `src/servidor/composicion.ts`, [arquitectura](ARQUITECTURA.md) y C4 | Implementado |
| SDD, aceptación y tareas | [SDD](SDD.md), [trazabilidad](TRAZABILIDAD.md) | Documentado |
| Endpoints REST / OpenAPI | `/docs`, `/api/v1/openapi`, `src/servidor/documentacion/openapi.ts` | 26 operaciones validadas |
| Base de datos y caché | [Arquitectura](ARQUITECTURA.md), [validación](VALIDACION.md) | Transacciones, restricciones, índices y caché de catálogo |
| SOLID y patrones | `docs/arquitectura/03-diseño-de-software`, código de módulos | Documentado e implementado |
| Jest y cobertura | `tests`, `coverage/complete`, evidencia de regresión | 89 aprobadas (86 previas y tres de arquitectura); 99,45 % líneas backend/contratos |
| Escenarios de calidad | [Resultados](VALIDACION.md), `tests/load` y `evidencias` | Resultados medidos; incluye la meta no alcanzada de 2.000 VUs |
| Primera versión funcional | [Inicio](INICIO.md), [interfaces](INTERFACES.md) | Ejecutable local con Supabase |
| Cuentas reales | [Comprobación de solo lectura](evidencias/cuentas.json) | Un ADMIN y un CLIENTE confirmados; no acredita recorrido UI |
| Navegador | `tests/browser`, [tema oscuro](TEMA-OSCURO.md) | 15 pruebas funcionales conservadas y seis de tema/contraste; evidencia separada por procedencia |
| Recorrido real en navegador | [Informe real](evidencias/recorrido-real/resumen.json), capturas y `npm run evidence:real` | Ambos roles, reserva, pago simulado y cancelación aprobados |
| CI recomendado | [Ejecución aprobada](https://github.com/MancillaLui/app-reservas-salas-ayacucho/actions/runs/45933818473), [evidencia](evidencias/github-actions.json) | Aprobado para el commit funcional `1d32576` |

## Completar la evidencia autenticada

Con la aplicación en el puerto 3000, ejecutar `npm run evidence:real`. Se abre Chrome y se solicita iniciar sesión primero como ADMIN y después como CLIENTE. No escribir contraseñas en terminal o chat. El script no las almacena, no guarda sesiones y no modifica cuentas. Comprueba `/api/v1/yo`, páginas de cada rol y redirección del cliente al visitar administración. Guarda capturas con correos ocultos y un informe de alcance en `evidencias/recorrido-real`.

La versión completa también crea una reserva futura libre desde la interfaz, añade un micrófono si está disponible, confirma el pago simulado y cancela al terminar para liberar el horario. Solo usar contra el entorno de demostración autorizado. El informe indica si se completó ese recorrido. Ante un fallo, revisar el estado en la aplicación antes de repetir; mantener pendiente cualquier paso no observado. El [guion](EXPOSICION.md) explica cómo presentarlo.

## Publicar y comprobar CI

La autorización de GitHub ya se completó con la cuenta propietaria. La rama está [publicada](https://github.com/MancillaLui/app-reservas-salas-ayacucho/tree/codex/sprint-2-entrega) y [CI pasó](https://github.com/MancillaLui/app-reservas-salas-ayacucho/actions/runs/45933818473) para el commit funcional `1d32576`. La evidencia registra ese SHA; los siguientes commits documentales vuelven a ejecutar CI. No se cambió el origen ni se modificó `main`.

Para reproducir la publicación en una próxima actualización:

```powershell
git switch -c codex/sprint-2-entrega
git add -- . ':!.vscode/settings.json'
git diff --cached --stat
git diff --cached --check
git commit -m "Implementa y valida ENSAYA para Sprint 2"
git push -u origin codex/sprint-2-entrega
gh run list --branch codex/sprint-2-entrega --limit 3
```

La exclusión conserva la eliminación local previa de `.vscode/settings.json` fuera del commit. Si ya existe esa rama, usar `git switch codex/sprint-2-entrega`. Revisar el workflow y conservar su enlace/resultado; no afirmar que pasó antes de observarlo. Entregar una URL/rama accesible al docente; si exige la rama principal, integrar mediante la revisión correspondiente.

## Paquete reproducible

`npm run delivery:prepare` prepara `output/entrega-sprint-2.zip` y un manifiesto SHA-256. Incluye código, documentación, configuración de ejemplo y cobertura disponible; excluye `.env.local`, credenciales, Git, dependencias, compilación y temporales. El script comprueba patrones de secretos y las credenciales privadas de la configuración local antes de escribir el ZIP. Es una comprobación adicional, no una auditoría de seguridad completa. No publica ni sustituye el repositorio remoto.

## Límites que deben acompañar la entrega

Pagos y mensajería simulados; no hay cobros ni reembolsos reales. La prueba extrema de 2.000 VUs no cumplió el objetivo; no se vuelve a ejecutar sobre Supabase. El 99,9 % es una meta. La demostración autenticada se conserva en un informe separado de los fixtures de navegador. Publicación y CI inicial completados; la evidencia remota identifica el commit comprobado.
