# Nivel 4 · Diagrama de código

> **Proyecto:** App Reservas Salas Ayacucho · **Módulos detallados:** Reservas y Pagos  
> **Modelo:** C4 · Nivel 4 de 4 · **Notación:** UML (Mermaid) · **Versión:** 1.1

---

## 1. Objetivo

Mostrar **cómo está organizado el código** de un componente clave (Módulo de Reservas): sus clases, interfaces y la forma en que colaboran. Se detalla el flujo **Crear Reserva**, que involucra las reglas de *anti-overbooking* transaccional y la integración con la pasarela de Yape.

| Aspecto | Descripción |
|---|---|
| Pregunta que responde | ¿Qué clases existen dentro de un módulo y cómo se relacionan? |
| Audiencia | Desarrolladores |
| Notación | UML (diagrama de clases y diagrama de secuencia usando código Mermaid) |
| Por qué solo estos módulos | El nivel 4 se dibuja solo para los componentes más críticos. Reservas concentra las reglas complejas de concurrencia y el motor de cobros |
| Nivel anterior | [nivel_3_diagrama_de_componentes.md](nivel_3_diagrama_de_componentes.md) |

---

## 2. Diagrama de Clases (Módulo Reservas)

El siguiente diagrama UML agrupa las clases por capa. Las flechas continuas muestran dependencias; `..>` indica uso o creación; `..|>` muestra implementación y apunta desde cada adaptador hacia su interfaz. El caso de uso depende de los contratos internos. Azul = presentación/aplicación; verde = dominio; violeta = infraestructura.

```mermaid
classDiagram
    direction LR
    namespace Presentacion {
        class ReservaController
    }
    
    namespace Aplicacion {
        class CrearReservaUseCase
    }

    namespace Dominio {
        class Reserva
        class EquipoExtra
        class EstadoReserva
        class ReservaRepository
        class PagoPort
        class CatalogoPort
        class MensajeriaPort
    }

    namespace Infraestructura {
        class SupabaseReservaRepository
        class YapePagoAdapter
        class CatalogoInternoAdapter
        class WhatsAppMensajeriaAdapter
    }

    class ReservaController {
      -crearReserva: CrearReservaUseCase
      +crear(req, res): Promise~void~
    }
    class CrearReservaUseCase {
      -reservaRepo: ReservaRepository
      -pagoPort: PagoPort
      -catalogoPort: CatalogoPort
      -mensajeriaPort: MensajeriaPort
      +ejecutar(cmd): Promise~string~
    }
    class Reserva {
      -id: string
      -clienteId: string
      -salaId: string
      -fecha: string
      -horaInicio: string
      -horaFin: string
      -fechaExpiracion: Date
      -equipos: EquipoExtra[]
      -estado: EstadoReserva
      +crear(sala, cliente, fecha, inicio, fin, equipos)$ Reserva
      +calcularTotal(precioSala): number
      +marcarConfirmada(numOperacion): void
      +marcarCancelada(motivo): void
    }
    class ReservaRepository {
      <<interface>>
      +verificarDisponibilidad(sala, fecha, inicio, fin): Promise~boolean~
      +guardar(reserva): Promise~void~
      +actualizarEstado(reserva): Promise~void~
    }
    class SupabaseReservaRepository {
      -supabase: SupabaseClient
      +verificarDisponibilidad(sala, fecha, inicio, fin)
      +guardar(reserva)
      +actualizarEstado(reserva)
    }
    class PagoPort {
      <<interface>>
      +validarPago(monto, celular, codigo): Promise~ResultadoPago~
    }
    class YapePagoAdapter {
      -api: MockYapeClient
      +validarPago(monto, celular, codigo)
    }

    class CatalogoPort {
      <<interface>>
      +verificarStock(equipos, horaInicio, horaFin): Promise~boolean~
      +obtenerEquiposParaReserva(equipos): Promise~EquipoExtra[]~
    }
    class CatalogoInternoAdapter {
      +verificarStock(equipos, horaInicio, horaFin)
      +obtenerEquiposParaReserva(equipos): Promise~EquipoExtra[]~
    }
    class MensajeriaPort {
      <<interface>>
      +enviarComprobanteAsync(reserva): Promise~void~
    }
    class WhatsAppMensajeriaAdapter {
      +enviarComprobanteAsync(reserva): Promise~void~
    }

    %% Relaciones
    ReservaController --> CrearReservaUseCase
    CrearReservaUseCase ..> Reserva : crea/modifica
    CrearReservaUseCase --> ReservaRepository
    CrearReservaUseCase --> PagoPort
    CrearReservaUseCase --> CatalogoPort
    CrearReservaUseCase --> MensajeriaPort
    
    SupabaseReservaRepository ..|> ReservaRepository : implementa
    YapePagoAdapter ..|> PagoPort : implementa
    CatalogoInternoAdapter ..|> CatalogoPort : implementa
    WhatsAppMensajeriaAdapter ..|> MensajeriaPort : implementa
    style ReservaController fill:#E7F0FC,stroke:#2563A6,color:#142C4C
    style CrearReservaUseCase fill:#E7F0FC,stroke:#2563A6,color:#142C4C
    style Reserva fill:#E9F5EC,stroke:#2E7D46,color:#173B24
    style EquipoExtra fill:#E9F5EC,stroke:#2E7D46,color:#173B24
    style EstadoReserva fill:#E9F5EC,stroke:#2E7D46,color:#173B24
    style ReservaRepository fill:#E9F5EC,stroke:#2E7D46,color:#173B24
    style PagoPort fill:#E9F5EC,stroke:#2E7D46,color:#173B24
    style CatalogoPort fill:#E9F5EC,stroke:#2E7D46,color:#173B24
    style MensajeriaPort fill:#E9F5EC,stroke:#2E7D46,color:#173B24
    style SupabaseReservaRepository fill:#F0EAF8,stroke:#7953A3,color:#39244F
    style YapePagoAdapter fill:#F0EAF8,stroke:#7953A3,color:#39244F
    style CatalogoInternoAdapter fill:#F0EAF8,stroke:#7953A3,color:#39244F
    style WhatsAppMensajeriaAdapter fill:#F0EAF8,stroke:#7953A3,color:#39244F
```

### 2.1 Capas de Clean Architecture

| Capa | Contiene | Regla |
|---|---|---|
| **Presentación** | Controladores | Traduce JSON/HTTP de la aplicación web a llamadas del caso de uso. |
| **Aplicación** | Casos de uso | Coordina el flujo transaccional y verifica el stock mediante `CatalogoPort`; no conoce la BD ni APIs externas. |
| **Dominio** | Entidades, objetos de valor, interfaces | Contiene las reglas anti-overbooking y estados de negocio. |
| **Infraestructura** | Repositorios y adaptadores | Implementa las interfaces usando Supabase, la API de Yape, el módulo Catálogo y mensajería externa. Se prevé que `SupabaseReservaRepository` delegue el bloqueo de concurrencia a las restricciones de exclusión de PostgreSQL (`tsrange`); la implementación y las pruebas están pendientes. |

---

## 3. Diagrama de Secuencia: Flujo Transaccional de Crear Reserva

`equipos` contiene objetos `{ equipoId, cantidad }`; `horaInicio` y `horaFin` son instantes ISO 8601 completos con fecha y desplazamiento horario. El puerto de stock es una consulta previa: la asignación de cantidades y sala debe validarse transaccionalmente al guardar.

La secuencia principal representa la asignación temporal antes del pago. La exclusión concurrente y la asignación de equipos son garantías propuestas que deben implementarse y probarse en persistencia. La notificación se detalla por separado en la continuación 3.1 para reducir la anchura del diagrama.

```mermaid
%%{init: {"theme": "base", "themeVariables": {"actorBkg": "#FFFFFF", "actorBorder": "#475569", "actorTextColor": "#172033", "signalColor": "#475569", "signalTextColor": "#172033", "noteBkgColor": "#E7F0FC", "noteBorderColor": "#2563A6", "noteTextColor": "#142C4C", "labelBoxBkgColor": "#F1F3F5", "labelBoxBorderColor": "#687583", "labelTextColor": "#26313D"}, "sequence": {"width": 210, "wrap": true, "actorFontSize": 14, "messageFontSize": 14, "noteFontSize": 14}}}%%
sequenceDiagram
    actor Cliente as Músico (Web)
    box rgb(231,240,252) Presentación y aplicación
        participant C as ReservaController<br/>(Presentación)
        participant UC as CrearReservaUseCase<br/>(Aplicación)
    end
    box rgb(233,245,236) Dominio
        participant Catalogo as CatalogoPort<br/>(Contrato)
        participant R as Reserva<br/>(Entidad)
    end
    box rgb(240,234,248) Infraestructura
        participant Repo as SupabaseReservaRepo
        participant Pago as YapePagoAdapter
    end
    box rgb(241,243,245) Externo
        participant Yape as API de Yape
    end

    Cliente->>C: POST /api/v1/reservas (sala, fecha, tiempos, Yape token)
    C->>UC: ejecutar(cmd)
    
    %% Regla de Overbooking
    UC->>Repo: verificarDisponibilidad(sala, fecha, horaInicio, horaFin)
    Repo-->>UC: true (Está libre)
    
    %% Verificación de Stock de Equipos Extra
    UC->>Catalogo: verificarStock(equipos, horaInicio, horaFin)
    Catalogo-->>UC: true (Stock disponible)

    UC->>Catalogo: obtenerEquiposParaReserva(equipos)
    Catalogo-->>UC: equiposResueltos (IDs, cantidades y tarifas del servidor)

    %% Creación de Entidad
    UC->>R: crear(salaId, clienteId, fecha, horaInicio, horaFin, equiposResueltos)
    R-->>UC: pedido [Estado: PENDIENTE, expira en 10 min]
    UC->>R: calcularTotal(precioSala)
    R-->>UC: total (S/.)

    %% Bloqueo Preventivo Transaccional
    UC->>Repo: guardar(reserva)
    Repo-->>UC: Reserva PENDIENTE persistida (bloqueo temporal)
    
    %% Proceso de Pago
    UC->>Pago: validarPago(total, celular, codigo)
    Pago->>Yape: Solicitud de validación [HTTPS]
    Yape-->>Pago: Respuesta (200 OK / Error)
    Pago-->>UC: ResultadoCobro
    
    %% Resolución de Guardado
    alt cobro.aprobado
        UC->>R: marcarConfirmada(autorizacionYape)
        UC->>Repo: actualizarEstado(reserva)
        Repo-->>UC: UPDATE estado = CONFIRMADA
        UC-->>C: reservaId
        C-->>Cliente: 201 Created { reservaId }
        Note over UC,C: Reserva confirmada y persistida.<br/>Continúa en 3.1: envío sin esperar su entrega.
    else pago rechazado
        UC->>R: marcarCancelada(motivo)
        UC->>Repo: actualizarEstado(reserva)
        Repo-->>UC: UPDATE estado = CANCELADA (Libera sala)
        UC-->>C: PagoRechazadoError
        C-->>Cliente: 402 Payment Required { motivo }
    end
```

---

### 3.1 Continuación: comprobante asíncrono

Esta secuencia continúa exclusivamente después de confirmar y persistir la reserva en el flujo anterior. No se espera la entrega para devolver el resultado HTTP. La ubicación exacta del inicio de la tarea respecto de la respuesta depende del runtime: el ejemplo inicia la promesa antes de retornar el identificador. No se introduce un nuevo proceso ni una garantía de entrega duradera.

```mermaid
%%{init: {"theme": "base", "themeVariables": {"actorBkg": "#FFFFFF", "actorBorder": "#475569", "actorTextColor": "#172033", "signalColor": "#475569", "signalTextColor": "#172033", "noteBkgColor": "#E7F0FC", "noteBorderColor": "#2563A6", "noteTextColor": "#142C4C", "labelBoxBkgColor": "#F1F3F5", "labelBoxBorderColor": "#687583", "labelTextColor": "#26313D"}, "sequence": {"width": 280, "wrap": true, "actorFontSize": 14, "messageFontSize": 14, "noteFontSize": 14}}}%%
sequenceDiagram
    box rgb(231,240,252) Aplicación
        participant UC as CrearReservaUseCase
    end
    box rgb(233,245,236) Dominio
        participant PortMsg as MensajeriaPort<br/>(Contrato)
    end
    box rgb(240,234,248) Infraestructura
        participant Adapter as WhatsAppMensajeriaAdapter
    end
    box rgb(241,243,245) Externo
        participant Externo as Servicio de mensajería
    end
    Note over UC,Adapter: Precondición: reserva confirmada y persistida
    UC-)PortMsg: enviarComprobanteAsync(reserva)
    PortMsg-)Adapter: enviarComprobanteAsync(reserva)
    Adapter-)Externo: Enviar comprobante [HTTPS / JSON]
    Note over PortMsg,Adapter: El puerto es un contrato, no un objeto ejecutable adicional.<br/>La delegación representa el despacho a su implementación.
    Note over UC,Adapter: Fire and Forget: sin esperar entrega.<br/>El rechazo se captura con .catch().
```

**Colores de las secuencias:** azul = presentación/aplicación; verde = dominio; violeta = infraestructura; gris = servicio externo. Las bandas agrupan responsabilidades, no procesos de despliegue. `CatalogoPort` también representa un contrato ejecutado por su adaptador interno.

**Lectura de las secuencias:** `->>` = llamada; `-->>` = retorno; `-)` = mensaje asíncrono. Fire and Forget aísla el fallo de entrega; no garantiza reintentos ni continuidad tras un reinicio.

---

## 4. Patrones y principios visibles en este nivel

| Elemento del diagrama | Patrón o principio |
|---|---|
| El flujo de Guardado Temporal | **Exclusión transaccional de intervalos** y asignación consistente de recursos, pendientes de implementación y pruebas. |
| `YapePagoAdapter` | Patrón **Adapter** (Aísla la API externa del núcleo). |
| `ReservaRepository` y `SupabaseReservaRepository` | Patrón **Repository** (El negocio no sabe que se usa PostgreSQL/Supabase). |
| `CatalogoPort` | Puerto del Dominio para verificar stock sin acoplar Reservas a la implementación de Catálogo. |
| El `CrearReservaUseCase` recibe interfaces (`ReservaRepository`, `PagoPort`, `CatalogoPort`, `MensajeriaPort`), no clases concretas | Principio de **Inversión de Dependencias** (Letra 'D' de SOLID). |
| Cada clase hace una sola cosa (Controlador responde HTTP, Entidad calcula total) | Principio de **Responsabilidad Única** (Letra 'S' de SOLID). |
