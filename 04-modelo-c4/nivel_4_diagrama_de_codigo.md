# C4 nivel 4 - Código de reservas implementado

Los nombres corresponden a archivos TypeScript ejecutables. `Reserva` es un tipo de datos; las reglas son funciones puras. No existe una clase Yape ni un cliente financiero real.

```mermaid
classDiagram
    class ReservasService {
      +crear(actor, input)
      +listar(actor)
      +obtener(actor, id)
      +cancelar(actor, id, motivo)
      +pagar(actor, id, clave, escenario, mensaje)
    }
    class ReservaRepository {
      <<interface>>
      +crear(actor, input)
      +iniciarPago(actor, id, clave)
      +terminarPago(id, pagoId, aprobado, referencia, mensaje)
    }
    class PagoPort {
      <<interface>>
      +cobrar(id, monto, escenario)
    }
    class MensajeriaPort {
      <<interface>>
      +programar(reserva, escenario)
    }
    class PgReservaRepository
    class PagosService
    class PagoSimulado
    class MensajeriaSimulada
    class Database {
      +transaction(work)
      +query(sql, values)
    }
    ReservasService --> ReservaRepository
    ReservasService --> PagoPort
    ReservasService --> MensajeriaPort
    PgReservaRepository ..|> ReservaRepository
    PagosService ..|> PagoPort
    MensajeriaSimulada ..|> MensajeriaPort
    PagosService --> PagoSimulado
    PgReservaRepository --> Database
    MensajeriaSimulada --> Database
```

```mermaid
sequenceDiagram
    participant Web
    participant API
    participant S as ReservasService
    participant R as PgReservaRepository
    participant DB as PostgreSQL
    participant P as PagosService
    Web->>API: POST /reservas con JWT y selección
    API->>S: crear(actor verificado, input)
    S->>R: crear(actor, input)
    R->>DB: Transacción, bloqueo, validación y asignación
    DB-->>R: PENDIENTE, vence en 10 minutos
    R-->>API: Reserva y total del servidor
    API-->>Web: 201 Created
    Web->>API: POST /reservas/id/pago con Idempotency-Key
    API->>S: pagar(actor, id, clave, escenario)
    S->>R: iniciarPago
    R->>DB: Intento único y estado PROCESANDO
    S->>P: cobrar fuera de transacción SQL
    P-->>S: Resultado simulado
    S->>R: terminarPago
    R->>DB: CONFIRMADA y comprobante en la misma transacción
    API-->>Web: 200 con reserva confirmada
    Note over DB: El worker entrega el comprobante posteriormente.
```

La secuencia muestra aprobación. Rechazo cancela y libera; resultado incierto conserva PROCESANDO hasta conciliación administrativa. La entrega del mensaje no participa en la respuesta de pago.

Fuentes ejecutables: [servicio](../src/modulos/reservas/aplicacion/reservas-service.ts), [contratos](../src/modulos/reservas/dominio/puertos.ts), [repositorio](../src/modulos/reservas/infraestructura/pg-reserva-repository.ts). [Diagrama previo conservado](../docs/sprint-1-referencia/04-modelo-c4/nivel_4_diagrama_de_codigo.md).
