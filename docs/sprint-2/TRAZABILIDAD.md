# Matriz de trazabilidad del Sprint 2

Consultar [equivalencias y validación de la reorganización](ORGANIZACION.md). Los identificadores RF/HU y contratos REST se conservan; los módulos están en `src/servidor/modulos` y la interfaz en `src/cliente`.

Los nombres de pruebas corresponden a los archivos de `tests/unit` y `tests/integration/postgres.test.ts`. Los [resultados finales](resultados-finales/README.md) y sus extractos identifican 53 unitarias, 36 de integración y 21 de navegador. [VALIDACION.md](VALIDACION.md) conserva la evolución cronológica.

| RF / HU | Implementación | Validación automatizada / evidencia |
|---|---|---|
| RF01 / HU01 | Catálogo, disponibilidad y selector de intervalo | REST publica disponibilidad con cantidades reales; intervalos consecutivos. |
| RF02 / HU01 | Transacción y exclusión de sala | 20 solicitudes simultáneas: una ganadora; inserción SQL directa rechazada. |
| RF03 / HU02 | Equipos y filtro de categoría | Catálogo filtra categorías y oculta inactivos; consulta pública de equipos. |
| RF04 / HU02 | Carrito y cálculo con tarifas de servidor | 90 minutos más extras; intento de enviar precios por HTTP rechazado. |
| RF05 / HU03 | Módulo Pagos, adaptador e idempotencia | Aprobación, rechazo, pagos simultáneos, resultado incierto y conciliación. |
| RF06 / HU05 | CRUD administrativo y baja lógica | Invalidación de caché, denegación a cliente, recurso comprometido. |
| RF07 / HU06 | Agenda y reservas propias | Propiedad en consulta; lista administrativa y endpoint protegido. |
| RF08 / HU03 | PENDIENTE, vencimiento y worker | Expiración libera cantidades; PROCESANDO sobrevive a reinicio sin liberar. |
| RF09 / HU02 | Asignación de equipos por pico simultáneo | Dos salas compiten por la última unidad; reservas consecutivas no sobrecontadas. |
| RF10 / HU07 | Bloqueos con exclusión compartida | Bloqueo impide reservar; desbloqueo libera; rechazo sobre reservas existentes. |
| RF11 / HU04, HU08 | Cancelación con motivo y reembolso pendiente | Cancelación libera sala/equipos; permiso, estado y límite temporal. |
| RF12 / HU03 | Comprobante persistido y worker de envío | Confirmación con comprobante; fallo y demora no revierten la reserva. |

## Atributos de calidad

| Atributo | Escenario y criterio | Instrumentación / límite |
|---|---|---|
| AC01 Rendimiento | Consultas de catálogo y calendario responden en menos de 3 segundos; usar p95 para la medición de API. | Benchmark HTTP pequeño y script k6 hasta 2.000 VUs. El resultado de API no demuestra carga completa en 3G/4G. |
| AC02 Disponibilidad | Meta 99,9 %; recursos y reservas conservan estado después de reiniciar la aplicación. | Reinstanciación del servicio con PostgreSQL en pruebas. Uptime mensual y recuperación del alojamiento pendientes. |
| AC03 Seguridad | Sesión inválida y acceso a reserva ajena se deniegan; solo ADMIN modifica recursos. | Pruebas del route handler con identidad controlada y SDK controlado en unitarias; recorrido real posterior con ambos roles y TLS de base de datos verificado. HTTPS de alojamiento público, revocaciones y auditoría completa siguen pendientes de validación. |
| AC04 Usabilidad | Recorrido móvil: sesión → horario/sala/extras → revisión → pago → confirmación, sin desbordamiento horizontal. | 21 pruebas de navegador y revisión visual a tres anchos; capturas controladas separadas del recorrido real. Sin estudio con participantes, no se acredita conversión ni número óptimo de clics. |
| AC05 Resiliencia | Fallo o demora de mensajería mantiene CONFIRMADA y no espera la entrega. | Inyección determinista de fallos, comprobación del estado y procesamiento diferido del worker. |

## Entregables y ubicación

| Solicitado | Evidencia |
|---|---|
| Código organizado y primera versión funcional | `src/`, configuración Next.js, scripts y migración. |
| SDD, criterios y tareas | `docs/sprint-2/SDD.md`. |
| API funcional y documentada | `/docs`, `/api/v1/openapi`, pruebas HTTP del route handler. |
| Análisis de base y caché | `docs/sprint-2/ARQUITECTURA.md`. |
| Jest y cobertura | `npm run test:verify`; `coverage/complete`. |
| Evidencias de atributos | `docs/sprint-2/VALIDACION.md`, informes y script k6. |
| CI recomendado | `.github/workflows/validacion.yml`; [ejecución aprobada y revisión identificada](resultados-finales/07-conclusiones-y-pendientes.md). |
