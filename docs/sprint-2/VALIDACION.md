# Validación del Sprint 2

Fecha: 26 de noviembre de 2026, 18:47 (America/Lima). Entorno: Windows, Node.js v24.22.1, Next.js compilado para producción y PostgreSQL 17 temporal en loopback. El catálogo de carga tiene dos salas y tres equipos, sin reservas. No se utilizaron credenciales reales de Supabase.

## Comprobaciones funcionales

| Comprobación | Resultado observado |
|---|---|
| TypeScript y build | Aprobados. Build ID: zsNm5r7X2jS-xDzVpLPAv. |
| Jest | 86/86 pruebas aprobadas, 7 suites. |
| Cobertura backend y contratos | Líneas 99.44 %, sentencias 98.29 %, ramas 92.41 %, funciones 98.16 %. Excluye componentes React. |
| OpenAPI | Contrato 3.0.3 válido, 26 operaciones y referencias resueltas. |
| Navegador Chrome | 3 pruebas aprobadas: escritorio, móvil de 390 × 844 y Swagger. |
| Concurrencia de sala | De 20 solicitudes simultáneas para el mismo intervalo, exactamente una reserva se asigna. |
| Concurrencia de equipos | Dos salas compiten por la última unidad: solo una la recibe. Se validan además intervalos consecutivos y pico simultáneo. |
| Seguridad | Token ausente/inválido, acceso ajeno y operaciones administrativas del cliente se deniegan; user_metadata no concede ADMIN. |
| Resiliencia | Fallo/demora de mensajería conserva CONFIRMADA; comprobante persistido y resultado ENVIADA/FALLIDA tras el worker. |
| Recuperación | Se conserva PROCESANDO al reinstanciar los servicios; el worker expira pendientes y conserva recursos ante pago incierto. |

Los controles HTTP de integración usan una identidad controlada y el adaptador Supabase se prueba con respuestas simuladas. No acreditan login contra una cuenta real. La revisión de navegador comprueba consultas públicas, calendario, carrito, formulario de sesión y ausencia de desbordamiento horizontal; no completa una reserva autenticada en Supabase.

## Rendimiento y análisis de datos

La primera corrida k6 hasta 2.000 VUs detectó saturación del pool y espera en el bloqueo global de disponibilidad. Su p95 agregado fue 10.133,61 ms, con 63,00 % de errores HTTP; se conserva el [resumen previo](evidencias/k6-antes-optimizacion.json). No se declara ese resultado satisfactorio.

La disponibilidad se cambió a una lectura SQL de una sola instantánea, sin el bloqueo de asignación y sin expiraciones de escritura. Se limitó la cola del pool a cien esperas. Las asignaciones y modificaciones conservan su transacción y su bloqueo. Las pruebas funcionales se volvieron a ejecutar después del cambio.

| Medición final | Resultado |
|---|---|
| Node fetch: 20 clientes / 200 consultas de disponibilidad | 0 errores; promedio 97.69 ms, p95 261.75 ms y máximo 369.37 ms. |
| k6 progresivo hasta 2000 VUs | 92701 solicitudes; 82.97 % de errores; p95 global 1510.92 ms. |
| k6 p95 de disponibilidad | 1414.70 ms. |
| Umbrales k6 finales | No cumplidos a esta carga. El límite queda documentado; no se acredita soporte de 2.000 usuarios en producción. |

Los [resultados k6 de 20 VUs](evidencias/k6-20.json), la [corrida final](evidencias/k6-2000.json) y el [plan EXPLAIN de consulta de salas](evidencias/plan-consulta.json) permiten inspeccionar las mediciones. El plan corresponde a la parte de ocupación de salas con datos pequeños; no representa una prueba de toda la consulta ni de inventario a escala.

La corrida separada de 20 VUs completó 973 solicitudes sin errores, con p95 global de 35,99 ms y p95 de disponibilidad de 51,20 ms. En la corrida extrema, la latencia agregada incluye solicitudes fallidas y respuestas rechazadas: su reducción no demuestra por sí sola una mejora de capacidad. La tasa de errores final fue mayor que en la primera corrida; no se presenta la optimización como solución al límite de 2.000 VUs. El generador de carga y la aplicación comparten equipo, por lo que tampoco se atribuye todo el resultado exclusivamente al backend.

La caché interna solo guarda catálogo durante 30 segundos y se invalida tras modificaciones locales. La disponibilidad consulta PostgreSQL y excluye pendientes vencidas; la prueba no introduce una caché de stock que pueda ocultar conflictos.

## Evidencia visual y reproducibilidad

- [Pantalla de escritorio](evidencias/escritorio.png), [pantalla móvil](evidencias/movil.png) y [Swagger](evidencias/swagger.png).
- [Resumen verificable de esta ejecución](evidencias/resumen.json).
- Ejecutar: npm run typecheck, npm run api:validate, npm run test:verify y npm run build.
- Con la vista local activa: npm run test:browser y el script tests/load/reservas.js con k6. Los detalles están en [INICIO.md](INICIO.md).
- Los informes HTML/LCOV completos se regeneran en coverage/complete. GitHub Actions está preparado; su ejecución remota no se realizó en esta sesión.

## Pendientes que no se presentan como resultados

En la ejecución inicial quedaban pendientes configurar el proyecto real de Supabase, aplicar migraciones/seed, crear las cuentas y asignar ADMIN, y demostrar el recorrido autenticado. El despliegue público, TLS del alojamiento, integraciones financieras y de mensajería reales, reembolsos automáticos, disponibilidad mensual 99,9 %, carga visual 3G/4G y evaluación con usuarios no están acreditados. El 99,9 % sigue siendo una meta.

## Actualización: conexión al proyecto real de Supabase

En una comprobación posterior del 26 de noviembre de 2026 (America/Lima), se completaron las variables locales de Supabase y la configuración de su certificado público CA, manteniendo cifrado y verificación de identidad del pooler. Se aplicó la migración del Sprint 2 y se cargaron dos salas y tres equipos. La conexión de base de datos, el endpoint de salud, el catálogo y Supabase Auth respondieron correctamente. Se comprobó también que los roles de navegador no pueden leer ni modificar directamente las reservas.

Evidencia sin credenciales: [conexión real](evidencias/conexion-supabase.json). Después del ajuste del certificado, TypeScript y las 50 pruebas unitarias pasaron. Las 86 pruebas completas y las mediciones de carga de las secciones anteriores corresponden a su ejecución documentada anterior, no a una nueva corrida sobre Supabase.

La aplicación local y el worker quedaron iniciados para continuar la demostración. El registro por email está habilitado y exige confirmación por correo. Sigue pendiente registrar las cuentas, iniciar sesión, asignar ADMIN y completar una reserva autenticada con ellas; esta actualización no acredita todavía ese recorrido.

## Actualización: demostración de servicios sobre Supabase

Se verificó que la única cuenta tenía correo confirmado y se le asignó ADMIN. Se ejecutaron los servicios de aplicación contra Supabase real: creación de reserva, pago simulado aprobado, confirmación y comprobante; otra reserva conservó CONFIRMADA ante fallo simulado de mensajería y después se canceló, liberando su horario. También se comprobaron bloqueo/desbloqueo de sala y creación, edición y desactivación de un equipo de demostración.

La [evidencia de la demostración](evidencias/demo-supabase.json) registra pasos, estados e identificadores sin credenciales. Estos resultados no constituyen una prueba de recorrido de navegador ni una segunda cuenta cliente. La reserva principal queda confirmada para su inspección visual; las operaciones simuladas no representan cobros, reembolsos ni mensajes externos reales.

Después de configurar TLS se repitieron las 86 pruebas en PostgreSQL temporal aislado y todas pasaron. La cobertura de esta regresión es 99,45 % de líneas, 98,30 % de sentencias, 91,59 % de ramas y 98,16 % de funciones, limitada al backend y contratos. TypeScript también pasó. Véase [regresión posterior](evidencias/regresion-supabase.json). Esta repetición no vuelve a acreditar la carga extrema ni reemplaza las métricas históricas anteriores.

El [estado de entrega](ENTREGA.md) resume las acciones restantes: revisar ambos roles desde la interfaz, conservar evidencia autenticada y publicar los cambios para ejecutar CI remoto.

## Actualización: interfaces separadas por rol

Se sustituyó la pantalla única por sitio público musical, reserva por pasos, acceso/registro independientes y páginas propias de cliente y administrador. La agenda, catálogo, bloqueos, pagos y comprobantes tienen navegación dedicada. Se conservaron la API REST, los cuatro módulos de negocio, las tablas y las garantías transaccionales.

La compilación de producción pasó y se ejecutaron 15 pruebas de navegador con Chrome contra el puerto de comprobación 3001. Pasaron los recorridos de cliente y administrador, redirección por rol y sin sesión, rechazo de retorno externo, precios en soles, bloqueo/desbloqueo independiente, cierre de sesión, cancelación, conciliación y comprobantes. La reserva conserva la selección al iniciar sesión y recupera la reserva pendiente después de recargar. También se comprobó que un error de identidad no monta el panel ni consulta endpoints administrativos. Se revisaron capturas y ausencia de desbordamiento móvil.

Las 86 pruebas del backend se repitieron en PostgreSQL temporal y pasaron, con 99,45 % de cobertura de líneas de backend/contratos. La cobertura no incluye componentes React. La fuente y los límites de cada comprobación están en [el resumen de interfaces](evidencias/interfaces/resumen.json).

**Alcance de las sesiones:** los recorridos privados del navegador usan fixtures de sesión y de API; no son dos cuentas reales de Supabase. Las consultas públicas de la vista de producción usan el catálogo real, sin escrituras en Supabase durante estas pruebas. Las capturas de [cliente](evidencias/interfaces/interfaz-cliente.png) y [administrador](evidencias/interfaces/interfaz-admin.png) muestran datos controlados. La demostración con ambas cuentas reales sigue pendiente de acceso del usuario. No se repitió la carga extrema ni se acredita una nueva capacidad de 2.000 VUs.

Organización, rutas y guion: [INTERFACES.md](INTERFACES.md).

## Cierre: recorrido autenticado real de ambos roles

El 26 de noviembre de 2026 (America/Lima) se verificaron un ADMIN y un CLIENTE confirmados mediante consulta SQL de solo lectura; la evidencia omite correos e identificadores personales. Después se inició sesión manualmente en Chrome con cada cuenta, consumiendo Supabase Auth y la API real, sin interceptaciones, inyección de tokens ni bypass de autorización.

Se comprobaron los paneles y listados propios, y que CLIENTE es redirigido de `/admin` a `/cliente`. Desde la interfaz del cliente se eligió una sala libre del 4 de diciembre, 19:00-20:00 de Lima, y un micrófono. El servidor calculó S/40, se creó la reserva y el pago simulado aprobado la dejó CONFIRMADA. Se guardó la confirmación y se canceló con motivo de demostración para liberar el horario y el equipo. Quedó CANCELADA con registro de reembolso pendiente del simulador; no hubo cargo ni devolución bancaria real.

Evidencia: [cuentas sin datos personales](evidencias/cuentas.json), [informe del recorrido](evidencias/recorrido-real/resumen.json), [agenda real](evidencias/recorrido-real/admin-reservas.png), [revisión](evidencias/recorrido-real/revision.png), [confirmación](evidencias/recorrido-real/confirmacion.png) y [cancelación](evidencias/recorrido-real/cancelacion.png). Se ocultaron correos en capturas y no se guardaron contraseñas ni sesiones. Las secciones anteriores conservan cronológicamente sus pendientes y límites; esta actualización completa el pendiente de recorrido autenticado.

TypeScript y OpenAPI se verificaron otra vez después de añadir las herramientas de cierre. No se modificó el código funcional de negocio ni se repitió la carga extrema. GitHub CLI presenta una sesión inválida; publicación y ejecución remota de CI siguen pendientes. El ZIP de entrega se genera con comprobación de integridad, manifiesto SHA-256 y búsqueda de secretos locales antes de escribirlo.

## Cierre: publicación y GitHub Actions

Se autorizó GitHub CLI con la cuenta propietaria y se publicó la rama `codex/sprint-2-entrega`. La [ejecución remota](https://github.com/MancillaLui/app-reservas-salas-ayacucho/actions/runs/45933818473) del commit funcional `1d325761bfe9047c29a3c76cb19d9df929d66c63` terminó en SUCCESS. Pasaron instalación limpia, TypeScript, validación de OpenAPI, Jest con PostgreSQL 17 aislado, generación de cobertura y compilación de producción. El reporte de cobertura quedó como artefacto de Actions. [Evidencia con SHA y pasos](evidencias/github-actions.json).

El [enlace de entrega](https://github.com/MancillaLui/app-reservas-salas-ayacucho/tree/codex/sprint-2-entrega) apunta a la rama publicada; `main` se conserva. Esta actualización sustituye el pendiente de autenticación/publicación de las secciones cronológicas anteriores. No representa un despliegue web, nuevas pruebas de carga ni uso de proveedores financieros reales.

## Actualización: presentación musical oscura

El 27 de noviembre de 2026 (America/Lima) se aplicó un único tema oscuro al sitio, autenticación, reserva y paneles. Swagger conserva su esquema claro. Los cambios funcionales de presentación se limitan a CSS y la clase de aislamiento visual de la documentación; no cambian API, tablas, permisos, tarifas ni reglas de negocio.

La compilación de producción y TypeScript pasaron. Se repitieron las 86 pruebas backend en PostgreSQL temporal aislado: siete suites aprobadas y cobertura de líneas de 99,45 %. OpenAPI validó las mismas 26 operaciones. Pasaron 21 pruebas de navegador: las 15 previas y seis nuevas de tema. Se comprobaron 1365, 768 y 390 píxeles sin desbordamiento horizontal, foco visible, controles, modales, estados de carga/error/vacío, confirmación, pago pendiente, vencimiento y cancelación.

Las muestras de texto y componentes exigieron contraste mínimo 4,5:1; las 414 muestras de paneles tuvieron mínimo observado de 6,35:1. La medición usa estilos computados y composición de fondos; no acredita una auditoría WCAG completa ni todas las combinaciones de contenido. Se corrigió una transición de fondo que producía contraste insuficiente al habilitar el botón de pago y se adaptaron los campos de fecha/hora para evitar truncamiento en tableta.

[Informe reproducible y procedencia](evidencias/tema-oscuro/resumen.json), [documentación y capturas](TEMA-OSCURO.md). Las capturas nuevas usan fixtures de sesión/API; no se hicieron escrituras en Supabase. Las evidencias auténticas del recorrido anterior se conservaron intactas. No se repitió la carga extrema ni se modifican sus límites; pagos y mensajes continúan simulados.

## Actualización: reorganización del repositorio

El 27 de noviembre de 2026 (America/Lima) se reorganizó el código en cliente, servidor y compartido; la documentación arquitectónica pasó a `docs/arquitectura` y los scripts se agruparon por responsabilidad. Se conservaron las rutas de Next.js, contratos REST, migraciones, estilo visual y reglas. La caché se conecta a Catálogo mediante `CachePort` e inyección desde composición para mantener aplicación independiente de infraestructura.

Pasaron 89 pruebas Jest (86 anteriores y tres adicionales de arquitectura), 21 pruebas de navegador contra producción local, TypeScript, OpenAPI con 26 operaciones y compilación. El verificador de estructura comprueba 63 hashes y enlaces de documentación vigente; incluye las migraciones, CSS, OpenAPI, archivo histórico y todas las evidencias anteriores. No se ejecutaron demos ni operaciones de escritura sobre Supabase.

La cobertura de líneas permanece en 99,45 %, con alcance equivalente: 362/364 líneas en lugar de 364/366. La diferencia corresponde a la importación e inicialización de caché retirada del servicio. Sentencias: 463/471 (98,30 %); funciones: 107/109 (98,16 %); ramas: 207/226 (91,59 %). No se excluyeron archivos para sostener el porcentaje.

[Organización, equivalencias y reproducción](ORGANIZACION.md), [resultados observados](evidencias/organizacion/resumen.json) y [línea base de hashes](evidencias/organizacion/invariantes.json). Los informes anteriores conservan sus rutas y hashes como procedencia histórica. Las nuevas ejecuciones de generadores se guardan en carpetas fechadas y no sustituyen este informe.

La revisión se publica como propuesta desde `codex/organizacion-proyecto` hacia `codex/sprint-2-entrega`; la integración requiere observar CI. No se repitió carga ni cambian las limitaciones de pagos, mensajería, capacidad o disponibilidad.
