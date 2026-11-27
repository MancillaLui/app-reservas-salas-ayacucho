# Sprint 2: estado y preparación de la entrega

## Implementado y comprobado

- Aplicación Next.js/TypeScript con API REST, monolito modular y Clean Architecture.
- Supabase real configurado con certificado TLS validado; migración y datos de demostración aplicados.
- Dos cuentas verificadas en Supabase: un ADMIN y un CLIENTE, ambos con correo confirmado. [Evidencia de solo lectura](evidencias/cuentas.json).
- Reserva confirmada de demostración: 27 de noviembre de 2026, 18:00–20:00, hora de Lima, sala y un micrófono, total S/70. No existe cobro bancario.
- Comprobante persistido con entrega simulada, fallo de mensajería aislado, cancelación y liberación de recursos, bloqueo/desbloqueo y alta/edición/desactivación de un equipo de prueba.
- 86 pruebas Jest aprobadas y reporte de cobertura; TypeScript aprobado después de la demostración.
- Swagger/OpenAPI, SDD, trazabilidad, análisis de base de datos/caché y escenarios de calidad.

Las operaciones de la demostración real se ejecutaron mediante los servicios de aplicación desde un script administrativo, no mediante una sesión de navegador. No sustituyen la revisión visual autenticada. Los datos de ejemplo quedan visibles en el panel: una reserva confirmada, otra cancelada y un equipo de prueba desactivado. Los pagos, reembolsos registrados y mensajes son simulados.

## Recorrido comprobado en la interfaz

**Interfaz actualizada:** el acceso es `/ingresar`, el registro `/registro`, la reserva `/reservar`, el espacio del cliente `/cliente` y el panel administrativo `/admin`. Ya no hay una pestaña de administración en el inicio. El menú lateral administrativo contiene agenda, catálogo, bloqueos, pagos y comprobantes. Guion y límites de verificación en [INTERFACES.md](INTERFACES.md).

1. Abrir http://127.0.0.1:3000/ingresar e iniciar sesión con la cuenta existente. Se abrirá `/admin` si su rol es ADMIN.
2. Revisar la reserva confirmada, agenda, pagos y comprobantes. No conciliar ni reembolsar operaciones bancarias: los registros son del simulador.
3. Iniciar sesión con la segunda cuenta CLIENTE, ya registrada y confirmada. No hace falta crear otra cuenta.
4. Como cliente, seleccionar un horario libre en `/reservar`, agregar equipos, revisar el importe y completar un pago simulado. Comprobar `/cliente/reservas`; visitar `/admin` debe redirigir al espacio del cliente.
5. Guardar capturas o video de ambos roles sin contraseñas, tokens ni variables privadas. El calendario ya contiene la reserva de demostración; elegir otro horario libre.

El recorrido real ya se completó con ambos roles: acceso, navegación, redirección de cliente al visitar administración, reserva con micrófono, pago simulado aprobado y cancelación final para liberar recursos. [Informe y capturas](evidencias/recorrido-real/resumen.json). Se usaron ingresos manuales y API/Supabase reales, sin interceptaciones. La reserva de prueba fue de S/40 y quedó cancelada; el reembolso es un registro simulado pendiente, sin movimiento bancario. No se guardaron contraseñas ni sesiones. Los pasos anteriores quedan como guion reproducible, no como pendientes.

## Archivos para presentar

| Requisito del Sprint 2 | Evidencia |
|---|---|
| Código y versión funcional | Repositorio, `src/`, migración, scripts y [guía de ejecución](INICIO.md). |
| Estilo, enfoque, SOLID y patrones | Carpetas de arquitectura/diseño, C4 y [arquitectura implementada](ARQUITECTURA.md). |
| SDD con aceptación y tareas | [SDD](SDD.md) y [trazabilidad](TRAZABILIDAD.md). |
| API REST y Swagger | http://127.0.0.1:3000/docs y `/api/v1/openapi`. |
| Jest y cobertura | `npm run test:verify`, `coverage/complete` y [regresión final](evidencias/regresion-supabase.json). |
| Validación de calidad | [Informe](VALIDACION.md), k6 y capturas en `evidencias/`. |
| Demostración sobre Supabase | [Conexión](evidencias/conexion-supabase.json) y [operaciones reales con proveedores simulados](evidencias/demo-supabase.json). |
| CI recomendado | `.github/workflows/validacion.yml`; pendiente de ejecución en GitHub. |

La cobertura HTML completa se regenera en `coverage/complete/lcov-report/index.html`. Los archivos `.env.local` y credenciales no se entregan ni se suben a Git; se entrega `.env.example`.

## Publicación pendiente

El repositorio de origen está configurado en https://github.com/MancillaLui/app-reservas-salas-ayacucho. Los cambios del Sprint 2 permanecen locales: todavía deben revisarse, incluirse en un commit y subirse. Después, comprobar que GitHub Actions pasa y que el docente puede acceder a la URL. No se ha realizado un push ni se afirma que el workflow remoto ya pasó.

## Límite de calidad que debe explicarse

La corrida de 20 VUs pasó sin errores; la corrida extrema de 2.000 VUs no cumplió el umbral de errores. Las evidencias de carga corresponden al entorno local con PostgreSQL temporal, no a la instancia real de Supabase. No se acredita capacidad productiva de 2.000 usuarios ni disponibilidad mensual de 99,9 %. El entregable debe mostrar las mediciones, el análisis y ese límite con claridad; mejorar esa capacidad requeriría otra iteración de optimización y carga.

## Cierre y exposición

Consultar [CIERRE.md](CIERRE.md) para la revisión contra la consigna, el empaquetado sin secretos y los pasos de GitHub. El [guion actualizado](EXPOSICION.md) sustituye al guion histórico del Sprint 1. La sesión de GitHub CLI está inválida; publicación y CI remoto no se presentan como completados.
