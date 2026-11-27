# 03. Integración, API y seguridad

## Objetivo, entorno y método

Comprobar la coordinación real entre servicios, repositorios, restricciones y PostgreSQL, además de validaciones y permisos de la API. Se ejecutaron **36 casos**, todos **Aprobados**, en PostgreSQL 17 temporal aislado, dentro de la corrida Jest del 27/11/2026. Fuente: [extracto de integración](../evidencias/documentacion-final/pruebas-jest.json).

La [suite](../../../tests/integration/postgres.test.ts) aplica la migración a una base cuyo nombre termina en `_test`. Los casos REST construyen `NextRequest` e invocan el route handler directamente; no constituyen por sí solos una prueba de red HTTP o despliegue público. La identidad de cliente, tercero y administrador se suministra mediante un adaptador controlado. PostgreSQL, sus transacciones y restricciones sí se ejecutan realmente.

## Casos observados por escenario

Los IDs I y los nombres corresponden al reporte, no a casos inferidos de la documentación.

### Asignación, importes y concurrencia

| ID | Caso observado | Resultado |
|---|---|---|
| I01 | crea con precios reales y calcula 90 minutos más extras | Aprobado |
| I02 | 20 solicitudes simultáneas a la misma sala: exactamente una gana | Aprobado |
| I03 | dos salas compiten por el último equipo: solo una lo recibe | Aprobado |
| I04 | la restricción SQL impide cruces incluso sin el servicio | Aprobado |
| I05 | intervalos consecutivos comparten sala y equipo sin conflicto | Aprobado |
| I06 | stock usa el pico simultáneo, no suma reservas consecutivas | Aprobado |

### Pagos e idempotencia

| ID | Caso observado | Resultado |
|---|---|---|
| I07 | pago aprobado persiste confirmación y comprobante atómicamente | Aprobado |
| I08 | pago rechazado libera sala y equipo | Aprobado |
| I09 | pagos simultáneos e idempotencia producen un único intento | Aprobado |
| I10 | resultado incierto no libera ni repite el cobro; admin concilia | Aprobado |

### Worker, fallos y cancelación

| ID | Caso observado | Resultado |
|---|---|---|
| I11 | worker expira pendientes y libera cantidades | Aprobado |
| I12 | worker no expira pagos en proceso tras un reinicio del servicio | Aprobado |
| I13 | fallo de mensajería no altera reserva y registra fallo de entrega | Aprobado |
| I14 | demora de mensajería ocurre después de responder al pago | Aprobado |
| I15 | cancelación de pago confirmado libera recursos y registra reembolso | Aprobado |

### Propiedad de la reserva

| ID | Caso observado | Resultado |
|---|---|---|
| I16 | cliente ajeno no ve ni cancela ni paga la reserva | Aprobado |

### Bloqueos y catálogo

| ID | Caso observado | Resultado |
|---|---|---|
| I17 | bloqueo manual impide reservar; desbloquear vuelve a habilitar | Aprobado |
| I18 | no bloquea una sala con reservas existentes | Aprobado |
| I19 | CRUD invalida caché y no desactiva recursos comprometidos | Aprobado |

### API, entradas, privacidad y fallos HTTP

| ID | Caso observado | Resultado |
|---|---|---|
| I20 | REST rechaza sesión ausente e inválida | Aprobado |
| I21 | REST rechaza cliente en ruta administrativa | Aprobado |
| I22 | REST crea reserva, consulta y devuelve conflicto sobre el mismo horario | Aprobado |
| I23 | REST rechaza suplantación y precio enviado por el navegador | Aprobado |
| I24 | REST publica Swagger y disponibilidad con cantidades reales | Aprobado |
| I25 | todas las tablas de negocio tienen RLS habilitado | Aprobado |
| I26 | REST salud, identidad y listados públicos funcionan | Aprobado |
| I27 | REST lista solo las reservas propias y permite agenda administrativa | Aprobado |
| I28 | REST paga con clave, devuelve confirmación y permite cancelar | Aprobado |
| I29 | REST administra salas y equipos con baja lógica | Aprobado |
| I30 | REST permite bloquear y desbloquear una sala | Aprobado |
| I31 | REST muestra conflicto SQL en un bloqueo que se superpone | Aprobado |
| I32 | REST concilia pago incierto y lista comprobantes | Aprobado |
| I33 | REST rechaza JSON roto, cuerpos grandes y UUID inválido | Aprobado |
| I34 | REST devuelve 404 en rutas desconocidas y recursos ausentes | Aprobado |
| I35 | calendario público entrega ocupación sin identidades ni motivos | Aprobado |
| I36 | REST traduce una caída de base de datos a 503 | Aprobado |


## Resultados que tuvieron éxito

- **Concurrencia:** exactamente una ganadora entre 20 solicitudes por la misma sala; dos salas no reciben simultáneamente la última unidad de equipo. Intervalos consecutivos se permiten sin sobrecontar stock.
- **Integridad:** la exclusión SQL rechaza cruces incluso al intentar una inserción sin el servicio. El cálculo usa duración y tarifas persistidas; el navegador no decide precio ni identidad.
- **Permisos y privacidad:** se rechazan sesión ausente/inválida, operaciones administrativas de clientes y operaciones sobre reservas ajenas. El calendario publica ocupación sin identidades ni motivos.
- **Pagos y recursos:** idempotencia evita un segundo intento; rechazo o cancelación libera recursos; incertidumbre conserva asignación hasta conciliación. Los proveedores son **Simulados**.
- **API y entradas:** se comprueban schemas, JSON roto, cuerpo excesivo, UUID inválido, conflictos, recursos ausentes y traducción de errores a respuestas documentadas.

La comprobación de RLS habilitado en tablas no equivale a una auditoría completa de políticas. La conexión privilegiada del servidor elude RLS, por lo que la autorización de API sigue siendo esencial.

## OpenAPI/Swagger

La [especificación](../../../src/servidor/documentacion/openapi.ts) mantiene OpenAPI 3.0.3 y **26 operaciones**; `npm run api:validate` comprueba la estructura y referencias. Las pruebas también consultan la especificación y el navegador verifica Swagger. Con la aplicación iniciada, abrir `/docs` y `/api/v1/openapi`. Swagger documenta autenticación, entradas y respuestas; su validez estructural no sustituye el resultado funcional de los endpoints.

## Evidencia real complementaria de Supabase

La [comprobación de conexión](../evidencias/conexion-supabase.json), del 26/11/2026 en Lima, verificó cifrado, certificado/hostname, salud, catálogo, Auth y restricciones de acceso directo a reservas. El campo de autenticación pendiente describe ese momento inicial; no invalida la comprobación posterior.

La [verificación de cuentas](../evidencias/cuentas.json) comprobó un ADMIN y un CLIENTE confirmados. El [recorrido real](../evidencias/recorrido-real/resumen.json) del 26/11/2026 a las 22:17 de Lima utilizó ingreso manual en Chrome, API y Supabase reales, sin interceptaciones. Pasaron identidad, navegación y redirección del cliente desde administración, reserva por S/40, confirmación con pago simulado y cancelación final. Las capturas de [confirmación](../evidencias/recorrido-real/confirmacion.png) y [cancelación](../evidencias/recorrido-real/cancelacion.png) respaldan ese recorrido.

Esa demostración es distinta de las 36 pruebas con identidad controlada y no es una nueva ejecución de estas. También es distinta de la demostración administrativa por servicios, que no utilizó una sesión de navegador.

## Reproducción y límites

`npm run test:verify` reproduce la corrida aislada completa. `npm run test:integration:local` ejecuta solo integración con PostgreSQL temporal. Para una base de pruebas propia, seguir [INICIO](../INICIO.md); los casos vacían tablas de esa base y no deben apuntar a la operación real.

No se midió seguridad mediante pentest, revocación masiva de sesiones ni análisis completo de vulnerabilidades. El HTTPS de un alojamiento público sigue **Pendiente de validación**. La sesión real complementa los mocks, pero no convierte todas las pruebas de permisos en escenarios end-to-end con usuarios reales. No hubo pagos, devoluciones bancarias ni envíos externos reales.
