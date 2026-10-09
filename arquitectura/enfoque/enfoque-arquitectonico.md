# Enfoque Arquitectónico: Clean Architecture

Para el desarrollo del sistema de reservas de salas de ensayo y equipos en Ayacucho, se ha seleccionado **Clean Architecture (Arquitectura Limpia)** como el patrón de diseño a nivel interno. 

Este enfoque organiza el sistema alrededor de las reglas de negocio y establece una **regla de dependencia estricta**: el código fuente solo puede apuntar hacia adentro, hacia el núcleo del dominio.

## Definición del Enfoque

| Elemento | Descripción aplicada al Sistema de Reservas |
| :--- | :--- |
| **Patrón / enfoque** | Clean Architecture (Arquitectura Limpia). |
| **Objetivo** | Separar las responsabilidades y controlar las dependencias para que el núcleo del negocio (el motor de reservas) no dependa de la base de datos, la interfaz o agentes externos. |
| **¿Qué problema resuelve?** | Evita el acoplamiento técnico. Por ejemplo, si en el futuro se cambia la pasarela de pago (de Yape a MercadoPago) o la base de datos (de Supabase a Firebase), la lógica de cómo se valida una reserva o se calcula el total no tendrá que modificarse. |
| **Capas definidas** | Presentación, Aplicación, Dominio e Infraestructura. |
| **Beneficios** | - Facilita el mantenimiento y las pruebas unitarias al aislar componentes.<br>- Permite cambiar implementaciones técnicas sin afectar reglas de negocio.<br>- Organiza el código para que un Solo Developer pueda escalarlo sin caos. |

---

## Diagrama de Clean Architecture (Módulo de Reservas)

El siguiente diagrama ilustra cómo fluye la información y cómo se respetan las dependencias (las flechas siempre apuntan hacia el Dominio).

```mermaid
flowchart LR;

%% Estilos
classDef UI fill:#d4e6f1,stroke:#2980b9,stroke-width:2px,color:#000;
classDef APP fill:#d5f5e3,stroke:#27ae60,stroke-width:2px,color:#000;
classDef DOM fill:#fcf3cf,stroke:#f1c40f,stroke-width:2px,color:#000;
classDef INF fill:#e8daef,stroke:#8e44ad,stroke-width:2px,color:#000;

subgraph PRESENTACION ["PRESENTACIÓN (Web / API)"]
    UI_React["Componente UI (React/Next.js)"]:::UI;
    Controller["ReservaController (API)"]:::UI;
end;

subgraph APLICACION ["APLICACIÓN (Casos de Uso)"]
    UC_Crear["CrearReservaUseCase"]:::APP;
    Port_Repo["IReservaRepository (Interfaz)"]:::APP;
    Port_Pago["IPagoService (Interfaz)"]:::APP;
end;

subgraph DOMINIO ["DOMINIO (Núcleo de Negocio)"]
    Ent_Reserva["Entidad: Reserva"]:::DOM;
    Ent_Sala["Entidad: Sala"]:::DOM;
    Regla["Reglas: Validar Overbooking"]:::DOM;
end;

subgraph INFRAESTRUCTURA ["INFRAESTRUCTURA (Detalles Técnicos)"]
    Impl_Repo["ReservaRepositoryImpl (Supabase/PostgreSQL)"]:::INF;
    Impl_Pago["PasarelaPagoAdapter (Yape/Plin API)"]:::INF;
end;

%% Relaciones (Flujo de control y dependencias)
UI_React -->|Petición HTTP| Controller;
Controller -->|Ejecuta| UC_Crear;

UC_Crear -->|Usa| Ent_Reserva;
UC_Crear -->|Aplica| Regla;
Ent_Reserva -.-> Ent_Sala;

UC_Crear -->|Llama a través de interfaz| Port_Repo;
UC_Crear -->|Llama a través de interfaz| Port_Pago;

Impl_Repo -.->|Implementa| Port_Repo;
Impl_Pago -.->|Implementa| Port_Pago;

%% Regla de Dependencia general
PRESENTACION ~~~ APLICACION;
APLICACION ~~~ DOMINIO;
INFRAESTRUCTURA ~~~ APLICACION;