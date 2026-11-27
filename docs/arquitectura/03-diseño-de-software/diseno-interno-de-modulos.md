# Diseño interno de módulos - Sprint 2

## Estructura ejecutable

```text
src/
  app/                    Web, Swagger y route handler /api/v1
  modulos/
    usuarios/             Contrato de identidad, servicio y adaptador Supabase
    catalogo/             Contrato de catálogo, servicio con caché y repositorio PostgreSQL
    reservas/             Reglas, contratos, servicios, repositorio, administración y mensajería
    pagos/                Contrato de proveedor, servicio y simulador
  shared/                 Errores, tipos, intervalos, caché, transacciones, ocupación y worker
  composicion.ts          Inyección de dependencias
scripts/                  Migración, seed, worker y validación local
supabase/migrations/      Esquema, restricciones, índices, RLS y revocaciones
```

Cada módulo publica su API en `index.ts`. Presentación vive en el route handler compartido y las validaciones de reservas; la composición es la única pieza que crea adaptadores concretos de distintos módulos. Los contratos usados por los servicios están en dominio. Las pruebas verifican la dirección de importaciones.

## Flujo de una reserva

1. El cliente autenticado envía sala, intervalo y equipos con ID/cantidad. La identidad se obtiene del token verificado por Supabase; Zod rechaza propiedades adicionales.
2. `ReservasService` valida intervalo y cantidades y llama a `ReservaRepository.crear`.
3. `PgReservaRepository` adquiere el bloqueo transaccional común, expira pendientes, valida sala, stock y tarifas actuales, calcula el importe real y persiste PENDIENTE con diez minutos de vencimiento.
4. Una petición posterior de pago con Idempotency-Key registra un único intento y cambia a PROCESANDO. La transacción se confirma antes de llamar al simulador de Pagos.
5. Aprobación guarda CONFIRMADA y el comprobante en una sola transacción. Rechazo guarda CANCELADA; resultado incierto mantiene recursos hasta conciliación.
6. El worker entrega el comprobante simulado después, sin depender de la duración del request. Cancelaciones y expiraciones liberan la asignación cambiando su estado.

La duración de la sala se calcula a partir de los instantes recibidos y las tarifas proceden de SQL. No existe el stub de dos horas ni una tarifa fija en el caso de uso.

## Contratos y ejemplos reales

Consultar directamente [reglas de reserva](../../../src/servidor/modulos/reservas/dominio/reglas.ts), [servicio de aplicación](../../../src/servidor/modulos/reservas/aplicacion/reservas-service.ts) y [repositorio transaccional](../../../src/servidor/modulos/reservas/infraestructura/pg-reserva-repository.ts). Estos archivos son compilados y probados; la especificación HTTP está en [OpenAPI](../../../src/servidor/documentacion/openapi.ts).

Los ejemplos previos completos, incluidos los stubs, se preservan como [referencia histórica](../../sprint-1-referencia/03-diseño-de-software/diseno-interno-de-modulos.md). No representan la implementación actual. El detalle de decisiones y límites está en [arquitectura del Sprint 2](../../sprint-2/ARQUITECTURA.md).
