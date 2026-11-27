# Arquitectura del sistema - Sprint 2

La propuesta inicial se concretó en una aplicación Next.js con API REST y un worker del mismo código. Supabase aporta identidad y PostgreSQL. Pagos y mensajería son simulados.

```mermaid
flowchart TB
    Cliente[Cliente músico] --> Web[Web responsiva Next.js]
    Admin[Administrador] --> Web
    Web -->|REST con Bearer| API[API Node.js - monolito modular]
    Web -->|Inicio de sesión| Auth[Supabase Auth]
    API --> Usuarios[Usuarios]
    API --> Catalogo[Catálogo]
    API --> Reservas[Reservas]
    Reservas -->|Contrato interno| Pagos[Pagos simulados]
    Usuarios --> DB[(PostgreSQL en Supabase)]
    Catalogo --> DB
    Reservas -->|Asignación y outbox transaccionales| DB
    Worker[Worker de expiración y envío simulado] --> DB
```

Las flechas representan colaboración en ejecución. No son dependencias de importación. El worker corre en una segunda terminal y no constituye un nuevo módulo de negocio.

La descripción anterior al Sprint 2 se conserva en [la referencia histórica](../docs/sprint-1-referencia/02-arquitectura-software/arquitectura-inicial.md). Consultar [la arquitectura implementada](../docs/sprint-2/ARQUITECTURA.md) para transacciones, caché y límites.
