# 01. Trabajo realizado

## Objetivo y resultado

Se implementó una primera versión funcional para reservar salas y equipos de ensayo en Ayacucho, partiendo del análisis, drivers, decisiones y C4 del Sprint 1. La implementación se documenta con [SDD](../SDD.md), [trazabilidad RF/HU](../TRAZABILIDAD.md) y [arquitectura real](../ARQUITECTURA.md).

## Implementación y validación son evidencias diferentes

| Área y requisitos | Qué se construyó | Qué se comprobó |
|---|---|---|
| Usuarios y acceso | Supabase Auth, perfil de negocio y roles CLIENTE/ADMIN | Casos unitarios del adaptador con SDK controlado, permisos en integración y acceso real de ambas cuentas |
| RF01-RF02: disponibilidad y sala | Intervalos `[inicio, fin)`, calendario, asignación transaccional y exclusión de sala | Una ganadora entre 20 solicitudes a una misma sala; rechazo SQL directo; reservas consecutivas permitidas |
| RF03-RF04: equipos e importes | Categorías, cantidades, carrito y precios calculados por servidor en céntimos | Cantidades inválidas, duración real de 90 minutos, redondeo y rechazo de precios/identidad enviados por el navegador |
| RF05: pagos | Adaptador simulado, idempotencia y conciliación de resultados inciertos | Aprobación, rechazo, incertidumbre y repetición sin segundo intento; no se valida un banco |
| RF06-RF07: administración y agenda | Alta, edición y baja lógica de recursos; agenda y reservas propias | Restricción por rol/propiedad, invalidación de caché y protección de recursos comprometidos |
| RF08-RF09: pendientes y stock | Diez minutos de espera, worker y asignación por ocupación máxima simultánea | Expiración libera cantidades; dos salas compiten por el último equipo; pagos en proceso conservan asignación |
| RF10-RF11: bloqueos y cancelación | Bloqueo manual, desbloqueo y cancelación con motivo | Conflictos, liberación de recursos y registro de reembolso pendiente; sin devolución bancaria |
| RF12: comprobantes | Comprobante persistido y envío asíncrono simulado | Fallo/demora no revierte la confirmación; el envío se procesa por separado |

Los identificadores y actores completos se mantienen en la matriz de trazabilidad. El hecho de tener una pantalla no se usa como prueba de concurrencia o seguridad: esas garantías se respaldan con casos de integración.

## Arquitectura y organización

Se conserva un monolito modular con Usuarios, Catálogo, Reservas y Pagos. Las capas separan reglas y contratos, servicios de aplicación y adaptadores de infraestructura. El dominio y aplicación se verifican sin dependencia de infraestructura, framework o SDK. La composición conecta implementaciones, incluida la caché de Catálogo mediante `CachePort`.

Next.js mantiene las rutas y API; PostgreSQL y Auth se suministran mediante Supabase. El worker es otro proceso del mismo código, no un microservicio de negocio. No se afirma un despliegue serverless. Los patrones aplicados incluyen Repository, Adapter e inyección de dependencias; consultar [diseño](../../arquitectura/03-diseño-de-software) y [C4](../../arquitectura/04-modelo-c4).

La [reorganización](../ORGANIZACION.md) separó navegador, servidor y contratos compartidos, agrupó documentación y scripts, y conservó los comandos npm. Se comprobaron 63 invariantes sobre evidencias previas, archivo histórico, migración, CSS y OpenAPI. Se eliminaron tres estilos antiguos sin imports. Las rutas públicas y los contratos REST permanecieron iguales.

## Interfaces y evolución visual

El sitio público presenta salas y equipos. La reserva tiene horario, sala, equipos, revisión y pago; conserva la selección durante el acceso y recupera la reserva pendiente. El cliente consulta su espacio y reservas. El administrador dispone de resumen, agenda, catálogo, bloqueos, pagos y comprobantes. Las métricas describen hasta 200 registros recibidos; no son totales globales.

El [tema oscuro](../TEMA-OSCURO.md) aplica una paleta común, foco visible, estados identificados por texto, controles nativos y distribución adaptable. Swagger mantiene esquema claro. Se corrigieron contraste transitorio al habilitar pago y truncamiento del horario en tableta. Sus capturas controladas se conservan separadas de la demostración real anterior.

## Demostración real: Aprobado, proveedores Simulados

El [recorrido real](../evidencias/recorrido-real/resumen.json) se completó el 26/11/2026 a las 22:17 de Lima: ingreso manual con ADMIN y CLIENTE confirmados, consulta de identidad por API, paneles y redirección del cliente fuera de administración. Se creó una reserva con micrófono por S/40 para el 04/12/2026, 19:00-20:00 de Lima, se aprobó el pago simulado y se canceló al terminar para liberar recursos.

La [demostración administrativa previa](../evidencias/demo-supabase.json) comprobó servicios sobre Supabase, comprobantes, fallo de mensajería, recursos y bloqueos. Fue ejecutada desde un script: no se confunde con el recorrido de navegador. Sus estados e importes corresponden a otra ejecución, no a la reserva de S/40.

## Límites y reproducción

Los pagos, conciliaciones, reembolsos pendientes y mensajes no son movimientos o envíos externos reales. La carga de 2.000 VUs no alcanzó el objetivo; el uptime mensual sigue pendiente. La reorganización no cambia esas conclusiones.

Para ejecutar la aplicación, seguir [INICIO](../INICIO.md). Para mostrarla, usar [EXPOSICION](../EXPOSICION.md). No es necesario repetir operaciones sobre Supabase para verificar este documento. El [resumen final](README.md) enlaza las pruebas que respaldan cada conclusión.
