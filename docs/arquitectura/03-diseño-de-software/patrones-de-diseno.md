# Patrones aplicados - Sprint 2

| Patrón o mecanismo | Implementación real | Propósito |
|---|---|---|
| Repository | ReservaRepository / PgReservaRepository; CatalogoRepository / PgCatalogoRepository | Separar coordinación de negocio de persistencia. |
| Adapter | SupabaseIdentidad, PagoSimulado y MensajeriaSimulada | Traducir identidad y resultados de proveedores a contratos internos. |
| Inyección de dependencias | Constructores de servicios y src/servidor/composicion.ts | Probar reglas con sustitutos y conectar implementaciones sin importar infraestructura desde dominio/aplicación. |
| Caché con TTL | Cache y CatalogoService | Reutilizar listas por 30 segundos, con invalidación tras cambios. |
| Outbox transaccional | Tabla notificaciones y worker | Persistir confirmación e intención de envío juntas; procesar la entrega fuera del request. |
| Exclusión de intervalos | Restricción GiST y bloqueo asesor de transacción | Evitar cruces de sala y coordinar cantidades compartidas. |
| Idempotencia | Pago único por reserva y clave obligatoria | Evitar un nuevo intento al repetir la misma solicitud de pago. |

La propuesta de `Reserva.crear` como Factory se sustituyó por tipos y funciones puras; no se declara un patrón Factory inexistente. El Fire and Forget del ejemplo evolucionó a una intención persistente procesada por worker, porque una promesa sin esperar no sobrevive necesariamente a reinicios.

No se implementó Redis ni se cachea disponibilidad. Los adaptadores de pago son del módulo Pagos; no se presenta Yape como integración real. Ver [diseño interno](diseno-interno-de-modulos.md) y [versión previa](../../sprint-1-referencia/03-diseño-de-software/patrones-de-diseno.md).
