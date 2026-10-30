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
| Nivel anterior | `Nivel3-Diagrama-de-Componentes.md` |

---

## 2. Diagrama de Clases (Módulo Reservas)

El siguiente diagrama UML muestra la estructura interna del módulo aplicando Clean Architecture. Las flechas apuntan siempre hacia el Dominio (el centro).

```mermaid
classDiagram
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
    }

    namespace Infraestructura {
        class SupabaseReservaRepository
        class YapePagoAdapter
        class CatalogoInternoAdapter
    }

    class ReservaController {
      -crearReserva: CrearReservaUseCase
      +crear(req, res): Promise~void~
    }
    class CrearReservaUseCase {
      -reservaRepo: ReservaRepository
      -pagoPort: PagoPort
      -catalogoPort: CatalogoPort
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
      +verificarStock(equipos): Promise~boolean~
    }
    class CatalogoInternoAdapter {
      +verificarStock(equipos)
    }

    %% Relaciones
    ReservaController --> CrearReservaUseCase
    CrearReservaUseCase ..> Reserva : crea/modifica
    CrearReservaUseCase --> ReservaRepository
    CrearReservaUseCase --> PagoPort
    CrearReservaUseCase --> CatalogoPort
    
    SupabaseReservaRepository ..|> ReservaRepository : implementa
    YapePagoAdapter ..|> PagoPort : implementa
    CatalogoInternoAdapter ..|> CatalogoPort : implementa
```

### 2.1 Capas de Clean Architecture

| Capa | Contiene | Regla |
|---|---|---|
| **Presentación** | Controladores | Traduce JSON/HTTP de la app móvil a llamadas del caso de uso. |
| **Aplicación** | Casos de uso | Coordina el flujo transaccional y verifica el stock mediante `CatalogoPort`; no conoce la BD ni APIs externas. |
| **Dominio** | Entidades, objetos de valor, interfaces | Contiene las reglas anti-overbooking y estados de negocio. |
| **Infraestructura** | Repositorios y adaptadores | Implementa las interfaces usando Supabase, la API de Yape y el módulo Catálogo. `SupabaseReservaRepository` delega el bloqueo de concurrencia a las restricciones de exclusión de PostgreSQL (`tsrange`). |

---

## 3. Diagrama de Secuencia: Flujo Transaccional de Crear Reserva

Este diagrama ilustra el paso a paso asegurando que la sala se bloquea temporalmente en la base de datos antes de contactar a la pasarela de pago, evitando condiciones de carrera.

```mermaid
sequenceDiagram
    actor Cliente as Músico (Web)
    participant C as ReservaController<br>(Presentación)
    participant UC as CrearReservaUseCase<br>(Aplicación)
    participant Catalogo as CatalogoPort<br>(Dominio)
    participant R as Entidad: Reserva<br>(Dominio)
    participant Repo as SupabaseReservaRepo<br>(Infraestructura)
    participant Pago as YapePagoAdapter<br>(Infraestructura)
    participant Yape as API Externa Yape
    participant Msg as ServicioMensajeria<br>(Externo)

    Cliente->>C: POST /api/v1/reservas (sala, fecha, tiempos, Yape token)
    C->>UC: ejecutar(cmd)
    
    %% Regla de Overbooking
    UC->>Repo: verificarDisponibilidad(sala, fecha, horaInicio, horaFin)
    Repo-->>UC: true (Está libre)
    
    %% Verificación de Stock de Equipos Extra
    UC->>Catalogo: verificarStock(equipos)
    Catalogo-->>UC: true (Stock disponible)

    %% Creación de Entidad
    UC->>R: crear(salaId, clienteId, items)
    R-->>UC: pedido [Estado: PENDIENTE, expira en 10 min]
    UC->>R: calcularTotal()
    R-->>UC: total (S/.)

    %% Bloqueo Preventivo Transaccional
    UC->>Repo: guardar(reserva)
    Repo-->>UC: INSERT en PostgreSQL (Bloqueo Temporal Exitoso)
    
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
        UC-)Msg: enviarComprobanteAsync(reserva)
        Note over UC,Msg: Se ejecuta en segundo plano (Fire and Forget)<br>para no bloquear si WhatsApp falla.
    else pago rechazado
        UC->>R: marcarCancelada(motivo)
        UC->>Repo: actualizarEstado(reserva)
        Repo-->>UC: UPDATE estado = CANCELADA (Libera sala)
        UC-->>C: PagoRechazadoError
        C-->>Cliente: 402 Payment Required { motivo }
    end
```

---

## 4. Patrones y principios visibles en este nivel

| Elemento del diagrama | Patrón o principio |
|---|---|
| El flujo de Guardado Temporal | **Bloqueo Pesimista / Transaccional** (Evita reservas simultáneas). |
| `YapePagoAdapter` | Patrón **Adapter** (Aísla la API externa del núcleo). |
| `ReservaRepository` y `SupabaseReservaRepository` | Patrón **Repository** (El negocio no sabe que se usa PostgreSQL/Supabase). |
| `CatalogoPort` | Puerto del Dominio para verificar stock sin acoplar Reservas a la implementación de Catálogo. |
| El `CrearReservaUseCase` recibe interfaces (`ReservaRepository`, `PagoPort`, `CatalogoPort`), no clases concretas | Principio de **Inversión de Dependencias** (Letra 'D' de SOLID). |
| Cada clase hace una sola cosa (Controlador responde HTTP, Entidad calcula total) | Principio de **Responsabilidad Única** (Letra 'S' de SOLID). |
