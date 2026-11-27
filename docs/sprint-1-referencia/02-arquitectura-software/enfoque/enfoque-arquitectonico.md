# Enfoque Arquitectónico: Clean Architecture

Para el desarrollo del sistema de reservas de salas de ensayo y equipos en Ayacucho, se ha seleccionado **Clean Architecture (Arquitectura Limpia)** como el patrón de diseño a nivel interno. 

Este enfoque organiza el sistema alrededor de las reglas de negocio y establece una **regla de dependencia estricta**: el código fuente solo puede apuntar hacia adentro, hacia el núcleo del dominio.

## Definición del Enfoque

| Elemento | Descripción aplicada al Sistema de Reservas |
| :--- | :--- |
| **Patrón / enfoque** | Clean Architecture (Arquitectura Limpia). |
| **Objetivo** | Separar las responsabilidades y controlar las dependencias para que el núcleo del negocio (el motor de reservas) no dependa de la base de datos, la interfaz o agentes externos. |
| **¿Qué problema resuelve?** | Evita el acoplamiento técnico. Por ejemplo, si en el futuro se cambia la pasarela de pago o el proveedor de correo, la lógica de cómo se valida una reserva no tendrá que modificarse. |
| **Capas definidas** | Presentación, Aplicación, Dominio e Infraestructura. |
| **Beneficios** | - Facilita el mantenimiento y las pruebas unitarias al aislar componentes.<br>- Permite cambiar implementaciones técnicas sin afectar reglas de negocio.<br>- Organiza el código para que un Solo Developer pueda escalarlo sin caos. |

---

## Diagrama de Clean Architecture (Módulo de Reservas)

El siguiente diagrama ilustra cómo fluye la información y cómo se respetan las dependencias (las flechas continuas apuntan hacia el centro, aplicando Inversión de Dependencias).

```mermaid
flowchart TB

    subgraph PRESENTACION["Presentación"]
        Controller["ReservaController"]
    end
    subgraph APLICACION["Aplicación"]
        UC["CrearReservaUseCase"]
    end
    subgraph DOMINIO["Dominio · Entidades y contratos internos"]
        Reserva["Reserva<br/>Reglas y estados"]
        RepoPort["ReservaRepository"]
        PagoPort["PagoPort"]
        CatalogoPort["CatalogoPort"]
        MsgPort["MensajeriaPort"]
    end
    subgraph INFRA["Infraestructura"]
        Repo["SupabaseReservaRepository"]
        Pago["YapePagoAdapter"]
        Catalogo["CatalogoInternoAdapter"]
        Msg["WhatsAppMensajeriaAdapter"]
    end
    Controller -->|"Invoca"| UC
    UC --> Reserva
    UC --> RepoPort
    UC --> PagoPort
    UC --> CatalogoPort
    UC --> MsgPort
    Repo -.->|"Implementa"| RepoPort
    Pago -.->|"Implementa"| PagoPort
    Catalogo -.->|"Implementa"| CatalogoPort
    Msg -.->|"Implementa"| MsgPort

    classDef persona fill:#E8EDF3,stroke:#475569,color:#172033,stroke-width:1.5px;
    classDef aplicacion fill:#E7F0FC,stroke:#2563A6,color:#142C4C,stroke-width:1.5px;
    classDef dominio fill:#E9F5EC,stroke:#2E7D46,color:#173B24,stroke-width:1.5px;
    classDef infraestructura fill:#F0EAF8,stroke:#7953A3,color:#39244F,stroke-width:1.5px;
    classDef externo fill:#F1F3F5,stroke:#687583,color:#26313D,stroke-width:1.5px;
    class Controller,UC aplicacion;
    class Reserva,RepoPort,PagoPort,CatalogoPort,MsgPort dominio;
    class Repo,Pago,Catalogo,Msg infraestructura;
```

**Lectura:** flecha continua = dependencia de código; flecha discontinua = implementación de un contrato. Las dependencias apuntan hacia Aplicación/Dominio. Los contratos internos no importan SDK ni adaptadores.

La interacción externa de los adaptadores se muestra en las vistas de despliegue y contenedores; este diagrama se concentra en dependencias internas. La exclusión concurrente debe respaldarse en persistencia, no solo en la entidad.
