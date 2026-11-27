# 7. Decisiones Arquitectónicas (ADR)

Registro de Decisiones Arquitectónicas (Architecture Decision Record) que responden a los drivers identificados para el sistema de reservas en Ayacucho.

| ID | Decisión arquitectónica | Driver relacionado | Justificación | Resultado |
| :--- | :--- | :--- | :--- | :--- |
| **ADR-001** | Monolito modular con servicios gestionados | DA02 - Desarrollo sostenible (Solo Developer) | Next.js/Node.js ejecuta la web y API; Supabase gestiona PostgreSQL y Auth. Se evita declarar serverless sin un runtime que lo respalde. | Usuarios, Catálogo, Reservas y Pagos en el mismo código; worker periódico en otro proceso local. |
| **ADR-002** | Clean Architecture | DA06 - Mantenibilidad / Evolución modular | Necesitamos separar las reglas estrictas de negocio (como el motor anti-overbooking) de los detalles tecnológicos (como si usamos PostgreSQL o Firebase). | Capas internas: Dominio, Aplicación, Presentación e Infraestructura. |
| **ADR-003** | Integración de pagos mediante interfaces (Adaptadores) | DA04 - Pasarela de pago externa | Permite cambiar de pasarela de pago (de MercadoPago a Culqi, o validación de Yape) en el futuro sin reescribir la lógica de reserva. | Contrato de pagos definido en el Dominio y adaptador técnico en Infraestructura. |

## Decisiones concretadas en Sprint 2

| ID | Decisión | Motivo y consecuencia |
|---|---|---|
| ADR-004 | Asignación coordinada mediante transacción y bloqueo asesor global | Sala, equipos y tarifas se validan en una conexión bajo `pg_advisory_xact_lock(48802)`. La exclusión GiST protege salas. Se permite que el repositorio coordinador lea tablas de recursos; es una excepción documentada al límite preliminar entre módulos. El bloqueo global limita el paralelismo y debe medirse. |
| ADR-005 | Outbox transaccional y worker | Confirmación y comprobante se persisten juntos; el envío simulado ocurre fuera del request. Sustituye el Fire and Forget sin persistencia del ejemplo inicial y permite recuperar tareas abandonadas. |
| ADR-006 | Pago simulado único por reserva e idempotencia | Un resultado incierto conserva recursos en PROCESANDO hasta conciliación administrativa del simulador. No se repite un intento automáticamente. |
| ADR-007 | Caché de catálogo con TTL de 30 segundos | Se invalida localmente tras modificaciones. Disponibilidad, asignación y precios definitivos se consultan siempre en PostgreSQL. |
| ADR-008 | Acceso a datos de negocio exclusivamente mediante API | RLS y revocaciones bloquean acceso directo de roles del navegador. El backend usa conexión privilegiada y valida identidad, rol y propiedad en cada operación. |

El adaptador financiero simulado pertenece al módulo Pagos. Los ejemplos previos de entidades se concretan en tipos y reglas puras. Ver [arquitectura implementada](../../sprint-2/ARQUITECTURA.md).
