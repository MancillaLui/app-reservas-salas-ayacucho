# Arquitectura inicial del sistema

## Diagrama de arquitectura

```mermaid
flowchart TB

    Cliente["Cliente / músico"]
    Admin["Administrador"]
    Web["Aplicación web<br/>Calendario, catálogo y panel"]
    subgraph BACKEND["API Backend · Monolito modular"]
        API["API REST<br/>Identidad y permisos"]
        Usuarios["Usuarios<br/>Perfiles y roles"]
        Catalogo["Catálogo<br/>Salas, equipos y tarifas"]
        Reservas["Reservas<br/>Carrito, intervalos y estados"]
        Pagos["Pagos<br/>Operaciones financieras"]
    end
    DB[("PostgreSQL en Supabase")]
    Auth["Autenticación gestionada"]
    PagoExt["Proveedor de pagos"]
    Msg["Mensajería externa"]
    Cliente --> Web
    Admin --> Web
    Web -->|"HTTPS / JSON"| API
    Web -->|"Inicia sesión"| Auth
    API --> Usuarios
    API --> Catalogo
    API --> Reservas
    Reservas -->|"Stock y tarifas"| Catalogo
    Reservas -->|"Solicita pago"| Pagos
    Usuarios --> DB
    Catalogo --> DB
    Reservas -->|"Asignación transaccional"| DB
    Pagos --> DB
    Pagos --> PagoExt
    Reservas -.->|"Comprobantes y alertas"| Msg

    classDef persona fill:#E8EDF3,stroke:#475569,color:#172033,stroke-width:1.5px;
    classDef aplicacion fill:#E7F0FC,stroke:#2563A6,color:#142C4C,stroke-width:1.5px;
    classDef dominio fill:#E9F5EC,stroke:#2E7D46,color:#173B24,stroke-width:1.5px;
    classDef infraestructura fill:#F0EAF8,stroke:#7953A3,color:#39244F,stroke-width:1.5px;
    classDef externo fill:#F1F3F5,stroke:#687583,color:#26313D,stroke-width:1.5px;
    class Cliente,Admin persona;
    class Web,API aplicacion;
    class Usuarios,Catalogo,Reservas,Pagos dominio;
    class DB infraestructura;
    class Auth,PagoExt,Msg externo;
```

**Lectura:** flechas continuas = comunicación o colaboración; flecha discontinua = envío asíncrono. Azul = presentación/aplicación; verde = negocio; violeta = infraestructura; gris = personas o servicios externos. El diagrama representa una propuesta de diseño.
