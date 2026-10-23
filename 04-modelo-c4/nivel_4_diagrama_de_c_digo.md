# Nivel 4 · Diagrama de código

> **Proyecto:** App Reservas Salas Ayacucho · **Módulos detallados:** Reservas y Pagos  
> **Modelo:** C4 · Nivel 4 de 4 · **Notación:** UML (Mermaid) · **Versión:** 1.0

---

## 1. Objetivo

Mostrar **cómo está organizado el código** de un componente clave (Módulo de Reservas): sus clases, interfaces y la forma en que colaboran. Se detalla el flujo **Crear Reserva**, que involucra las reglas de *anti-overbooking* y la integración con la pasarela de Yape.

| Aspecto | Descripción |
|---|---|
| Pregunta que responde | ¿Qué clases existen dentro de un módulo y cómo se relacionan? |
| Audiencia | Desarrolladores |
| Notación | UML (diagrama de clases y diagrama de secuencia usando código Mermaid) |
| Por qué solo estos módulos | El nivel 4 se dibuja solo para los componentes más críticos. Reservas concentra las reglas complejas de disponibilidad y el motor de cobros |
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
    }

    namespace Infraestructura {
        class SupabaseReservaRepository
        class YapePagoAdapter
    }

    class ReservaController {
      -crearReserva: CrearReservaUseCase
      +crear(req, res): Promise~void~
    }
    class CrearReservaUseCase {
      -reservaRepo: ReservaRepository
      -pagoPort: PagoPort
      +ejecutar(cmd): Promise~string~
    }
    class Reserva {
      -id: string
      -clienteId: string
      -salaId: string
      -equipos: EquipoExtra[]
      -estado: EstadoReserva
      +crear(salaId, clienteId, fecha, horas, equipos)$ Reserva
      +calcularTotal(precioSala): number
      +marcarConfirmada(numOperacion): void
    }
    class ReservaRepository {
      <<interface>>
      +verificarDisponibilidad(salaId, fecha, hora): Promise~boolean~
      +guardar(reserva): Promise~void~
    }
    class SupabaseReservaRepository {
      -supabase: SupabaseClient
      +verificarDisponibilidad(salaId, fecha, hora)
      +guardar(reserva)
    }
    class PagoPort {
      <<interface>>
      +validarPago(monto, celular, codigo): Promise~ResultadoPago~
    }
    class YapePagoAdapter {
      -api: MockYapeClient
      +validarPago(monto, celular, codigo)
    }

    %% Relaciones
    ReservaController --> CrearReservaUseCase
    CrearReservaUseCase ..> Reserva : crea
    CrearReservaUseCase --> ReservaRepository
    CrearReservaUseCase --> PagoPort
    
    SupabaseReservaRepository ..|> ReservaRepository : implementa
    YapePagoAdapter ..|> PagoPort : implementa
```

### 2.1 Capas de Clean Architecture

| Capa | Contiene | Regla |
|---|---|---|
| **Presentación** | Controladores | Traduce JSON/HTTP de la app móvil a llamadas del caso de uso. |
| **Aplicación** | Casos de uso | Coordina el flujo (validar, cobrar, guardar); no conoce la BD ni APIs externas. |
| **Dominio** | Entidades, objetos de valor, interfaces | Contiene las reglas anti-overbooking y de negocio. |
| **Infraestructura** | Repositorios y adaptadores | Implementa las interfaces usando Supabase y la API de Yape. |

---

## 3. Diagrama de Secuencia: Flujo de Crear Reserva

Este diagrama ilustra el paso a paso desde que el músico envía su solicitud hasta que la reserva se guarda en la base de datos tras validar el pago.

```mermaid
sequenceDiagram
    actor Cliente as Músico (Web)
    participant C as ReservaController<br>(Presentación)
    participant UC as CrearReservaUseCase<br>(Aplicación)
    participant R as Entidad: Reserva<br>(Dominio)
    participant Repo as SupabaseReservaRepo<br>(Infraestructura)
    participant Pago as YapePagoAdapter<br>(Infraestructura)
    participant Yape as API Externa Yape

    Cliente->>C: POST /api/v1/reservas (sala, fecha, Yape token)
    C->>UC: ejecutar(cmd)
    
    %% Regla de Overbooking
    UC->>Repo: verificarDisponibilidad(sala, fecha, hora)
    Repo-->>UC: true (Está libre)
    
    %% Creación de Entidad
    UC->>R: crear(salaId, clienteId, items)
    R-->>UC: pedido [Estado: PENDIENTE]
    UC->>R: calcularTotal()
    R-->>UC: total (S/.)
    
    %% Proceso de Pago
    UC->>Pago: validarPago(total, celular, codigo)
    Pago->>Yape: Solicitud de validación [HTTPS]
    Yape-->>Pago: Respuesta (200 OK)
    Pago-->>UC: ResultadoCobro (aprobado)
    
    %% Condicional de guardado
    alt cobro.aprobado
        UC->>R: marcarConfirmada(autorizacionYape)
        UC->>Repo: guardar(reserva)
        Repo-->>UC: INSERT en PostgreSQL (Supabase)
        UC-->>C: reservaId
        C-->>Cliente: 201 Created { reservaId }
    else pago rechazado
        UC-->>C: PagoRechazadoError
        C-->>Cliente: 402 Payment Required { motivo }
    end
```

---

## 4. Patrones y principios visibles en este nivel

| Elemento del diagrama | Patrón o principio |
|---|---|
| `YapePagoAdapter` | Patrón **Adapter** (Aísla la API externa del núcleo). |
| `ReservaRepository` y `SupabaseReservaRepository` | Patrón **Repository** (El negocio no sabe que se usa PostgreSQL/Supabase). |
| El `CrearReservaUseCase` recibe interfaces (`PagoPort`), no clases concretas | Principio de **Inversión de Dependencias** (Letra 'D' de SOLID). |
| Cada clase hace una sola cosa (Controlador responde HTTP, Entidad calcula total) | Principio de **Responsabilidad Única** (Letra 'S' de SOLID). |
