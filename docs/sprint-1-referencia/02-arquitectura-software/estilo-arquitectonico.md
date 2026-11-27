# Estilo Arquitectónico

## Monolito Modular con servicios gestionados

Para el desarrollo inicial de la aplicación web de reservas en Ayacucho, se ha seleccionado el estilo arquitectónico de **Monolito Modular** soportado por servicios gestionados de identidad y persistencia (Backend-as-a-Service). La modalidad de ejecución de la API, incluida una posible opción serverless, sigue pendiente de elección.

**Justificación:**
Al ser un proyecto desarrollado por un "Solo Developer", implementar arquitecturas distribuidas complejas (como Microservicios) generaría una sobrecarga innecesaria de configuración y mantenimiento. El Monolito Modular permite tener una única unidad de despliegue (fácil de subir a producción) pero manteniendo el código internamente ordenado por módulos de negocio, lo que facilita su evolución futura.

```mermaid
flowchart TB

    Web["Cliente web<br/>React / Next.js"]
    subgraph MONOLITO["Backend del negocio · Una unidad de despliegue"]
        API["API REST<br/>Rutas y controladores"]
        subgraph MODULOS["Cuatro módulos · Comunicación interna por contratos"]
            Usuarios["Usuarios"]
            Catalogo["Catálogo"]
            Reservas["Reservas"]
            Pagos["Pagos"]
        end
        Infra["Repositorios y adaptadores<br/>Implementaciones técnicas"]
        API --> Usuarios
        API --> Catalogo
        API --> Reservas
        Reservas -->|"Stock y tarifas"| Catalogo
        Reservas -->|"Cobro"| Pagos
        Usuarios --> Infra
        Catalogo --> Infra
        Reservas --> Infra
        Pagos --> Infra
    end
    subgraph BAAS["Servicios gestionados · Fuera del proceso del backend"]
        Auth["Supabase Auth"]
        DB[("PostgreSQL")]
    end
    PagoExt["Proveedor de pagos"]
    Msg["WhatsApp API / correo"]
    Web -->|"HTTPS / REST"| API
    Web -->|"Autenticación"| Auth
    Infra -->|"Persistencia"| DB
    Infra -->|"HTTPS"| PagoExt
    Infra -.->|"Envío asíncrono"| Msg

    classDef persona fill:#E8EDF3,stroke:#475569,color:#172033,stroke-width:1.5px;
    classDef aplicacion fill:#E7F0FC,stroke:#2563A6,color:#142C4C,stroke-width:1.5px;
    classDef dominio fill:#E9F5EC,stroke:#2E7D46,color:#173B24,stroke-width:1.5px;
    classDef infraestructura fill:#F0EAF8,stroke:#7953A3,color:#39244F,stroke-width:1.5px;
    classDef externo fill:#F1F3F5,stroke:#687583,color:#26313D,stroke-width:1.5px;
    class Web,API aplicacion;
    class Usuarios,Catalogo,Reservas,Pagos dominio;
    class Infra,DB infraestructura;
    class Auth,PagoExt,Msg externo;
```

**Lectura:** flechas continuas = comunicación o colaboración; flecha discontinua = envío asíncrono. Azul = presentación/aplicación; verde = negocio; violeta = infraestructura; gris = personas o servicios externos. El diagrama representa una propuesta de diseño.

**Alcance del despliegue:** BaaS delega identidad y persistencia. El runtime y el alojamiento concretos de la API siguen pendientes; usar Supabase no determina por sí solo una ejecución serverless del código Node.js. Las flechas dentro del backend representan colaboración en ejecución, no importaciones entre capas.
