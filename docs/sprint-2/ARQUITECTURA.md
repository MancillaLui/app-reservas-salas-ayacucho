# Arquitectura implementada y comportamiento de datos

## Monolito modular y Clean Architecture

La [organización del repositorio](ORGANIZACION.md) separa navegador, servidor y contratos compartidos. La caché se inyecta a Catálogo mediante `CachePort`; su implementación y TTL no cambiaron. PostgreSQL, la coordinación SQL y las tareas periódicas están en infraestructura del servidor.

La presentación evolucionó a páginas de Next.js separadas por rol y componentes en `src/cliente/presentacion`. La sesión y el cliente HTTP son compartidos; las guardas de interfaz consultan la identidad validada por la API. Ver [organización de las interfaces](INTERFACES.md). Este cambio no altera contratos REST, tablas ni reglas de negocio.

Next.js ejecuta la interfaz y una API Node.js en una unidad de despliegue local. Supabase aporta PostgreSQL y Auth como servicios gestionados. No se declara una ejecución serverless: se necesita un proceso Node.js y un worker separado del mismo código para tareas periódicas.

Los cuatro módulos de negocio son Usuarios, Catálogo, Reservas y Pagos. En `src/servidor/modulos`, cada uno separa contratos o reglas de dominio, servicios de aplicación y adaptadores de infraestructura. El límite HTTP y sus validaciones están en presentación. `src/servidor/composicion.ts` crea las implementaciones e inyecta los contratos. Las llamadas a Pagos son internas, mediante su API pública; no hay microservicios.

El dominio no importa Next.js, PostgreSQL ni Supabase. Los controladores invocan servicios de aplicación y no ejecutan SQL. Las reglas puras validan intervalos, cantidades, importes, propiedad y cancelación. Repository y Adapter aíslan persistencia, identidad, pagos y mensajería; los servicios reciben dependencias por constructor. Las pruebas estáticas inspeccionan importaciones del dominio y aplicación.

Los ejemplos de clases del Sprint 1 se concretaron en servicios y funciones puras: `ReservasService` coordina, `PgReservaRepository` persiste y `reglas.ts` contiene reglas. `Reserva` es un tipo de datos y no una entidad con métodos. Esta variación evita afirmar que los ejemplos Markdown previos se ejecutan literalmente.

## Transacciones y límites modulares

Crear una reserva requiere validar sala, tarifas y stock y asignarlos como una unidad atómica. El repositorio transaccional de Reservas consulta las tablas de recursos para esa operación coordinada; es una **excepción explícita** a la regla preliminar de no leer tablas de otro módulo. No se reparten esas lecturas entre conexiones independientes porque perderían la garantía transaccional. Catálogo sigue siendo el propietario de las modificaciones de recursos.

Toda modificación de asignaciones, stock o estados adquiere `pg_advisory_xact_lock(48802)`, compartido por procesos, dentro de una transacción READ COMMITTED. La consulta de datos ocurre después de adquirir el bloqueo. La exclusión GiST de `(sala_id, tstzrange(inicio, fin, '[)'))` protege además los cruces de sala ante escrituras que omitan el bloqueo.

Para equipos se calcula el máximo de cantidades ocupadas simultáneamente sobre los puntos donde puede aumentar la ocupación. Sumar todas las reservas solapadas sobrecontaría dos reservas consecutivas. La garantía de equipos exige que las escrituras sigan el protocolo del repositorio: la base no contiene una restricción agregada de stock equivalente a la exclusión de salas. Por ello las tablas no se exponen a escrituras del navegador.

Se eligió un bloqueo global por sencillez para un único local. Limita el paralelismo y puede convertirse en cuello de botella. Antes de escalar, medir y evolucionar a bloqueos ordenados por recurso, conservando pruebas de concurrencia. Las llamadas a proveedores y las demoras de envío se realizan fuera de la transacción y del bloqueo.

Las lecturas de disponibilidad se optimizaron tras la primera prueba k6: utilizan una sola sentencia SQL con una instantánea consistente y excluyen pendientes vencidas, sin adquirir el bloqueo de asignación ni ejecutar expiraciones. El calendario tampoco bloquea escrituras. El pool tiene diez conexiones y rechaza nuevas operaciones con 503 cuando ya hay cien esperando, para evitar una cola de crecimiento ilimitado.

## Modelo persistente

| Tabla | Función y controles |
|---|---|
| perfiles | Identidad Supabase y rol de negocio administrado por el servidor. |
| salas / equipos | Recursos, tarifas enteras y estado; stock positivo en equipos. |
| reservas | Asignación de sala, intervalo, tipo, importe y estado; exclusión para estados activos. BLOQUEO comparte la exclusión y no tiene cliente. |
| reserva_equipos | Cantidades y tarifa unitaria histórica de extras. |
| pagos | Un intento por reserva, clave idempotente, resultado y marca de reembolso pendiente. |
| notificaciones | Comprobante JSON y estado de entrega; unicidad por reserva/tipo. |

Hay índices para reservas por cliente, pendientes por vencimiento, equipos asignados y tareas de notificación. Las claves foráneas conservan integridad y la baja lógica conserva el historial. Las migraciones se registran con checksum y no se vuelven a ejecutar; los cambios posteriores requieren una migración nueva. El seed es repetible sin sobrescribir datos existentes.

Para analizar consultas en el entorno de pruebas:

```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT id FROM reservas
WHERE sala_id='10000000-0000-4000-8000-000000000001'
AND estado IN ('PENDIENTE','PROCESANDO','CONFIRMADA')
AND tstzrange(inicio,fin,'[)') && tstzrange(now()+interval '1 day',now()+interval '1 day 1 hour','[)');
```

Un catálogo de demostración pequeño puede usar escaneo secuencial y no permite extrapolar a producción. La consulta funcional de disponibilidad usa comparaciones de extremos; la restricción GiST garantiza integridad, pero no se afirma que acelere automáticamente todas las consultas. Deben medirse índices y planes con datos representativos.

## Caché, recuperación y observabilidad

Solo las listas de catálogo usan caché en memoria de 30 segundos. Una escritura invalida la caché del proceso que la atiende; otros procesos pueden conservar datos hasta el TTL. La disponibilidad, tarifas usadas al reservar y asignación de inventario siempre consultan PostgreSQL. El catálogo visual puede quedar desactualizado brevemente y la API decide el resultado definitivo.

El worker expira PENDIENTE, conserva asignaciones PROCESANDO y marca como INCIERTO un intento abandonado de más de dos minutos. Las confirmaciones y su comprobante se guardan en la misma transacción, evitando perder la intención de envío al reiniciar. Una tarea ENVIANDO abandonada vuelve a PENDIENTE tras un minuto. Se registra el fallo del simulador y no se reintenta automáticamente una FALLIDA. La evolución a un proveedor real requerirá idempotencia de entrega y una política de reintentos.

`/api/v1/health` comprueba PostgreSQL; los errores y el worker emiten logs de servidor. Los datos sobreviven a un nuevo proceso; el worker debe permanecer activo para tareas periódicas. El 99,9 % de disponibilidad sigue siendo una meta: requiere alojamiento, monitoreo y observación prolongada.

## Seguridad e integraciones

La API verifica el token con Supabase y carga el rol desde SQL; no confía en la identidad enviada en el cuerpo ni en user_metadata. RLS y revocaciones impiden acceso directo desde el navegador. La conexión privilegiada del backend elude RLS y por eso las pruebas de autorización de API son esenciales. Las variables de base de datos permanecen exclusivamente en el servidor y no se registran tokens.

Pagos y mensajería son simulados. La conciliación administrativa solo interpreta resultados del simulador, no acredita transacciones bancarias. No se implementan facturación SUNAT, reembolso bancario, Google SSO ni mensajería real. Son integraciones posteriores, no evidencias del Sprint 2.

Referencias técnicas: [Route Handlers de Next.js](https://nextjs.org/docs/app/getting-started/route-handlers), [verificación getUser de Supabase](https://supabase.com/docs/reference/javascript/auth-getuser) y [rangos y exclusión de PostgreSQL](https://www.postgresql.org/docs/current/rangetypes.html).
