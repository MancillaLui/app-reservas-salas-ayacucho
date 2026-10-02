# Arquitectura inicial del sistema

## Diagrama de arquitectura

```mermaid
flowchart TD
%% =========================
%% ACTORES
%% =========================
subgraph ACTORES ["ACTORES"]
    Cliente ["Cliente"]
    Admin ["Administrador"]
end

%% =========================
%% PRESENTACIÓN
%% =========================
subgraph PRESENTACION ["PRESENTACIÓN"]
    Web ["Aplicación Web -> API REST"]
end

%% =========================
%% LÓGICA DE NEGOCIO
%% =========================
subgraph NEGOCIO ["LÓGICA DE NEGOCIO"]
    Usuarios ["Usuarios"]
    Catalogo ["Catálogo (Salas y Equipos)"]
    Carrito ["Carrito"]
    Reservas ["Reservas"]
end

%% =========================
%% DATOS
%% =========================
subgraph DATOS ["DATOS"]
    BD ["Base de datos"]
end

%% =========================
%% SISTEMAS EXTERNOS
%% =========================
subgraph EXTERNOS ["SISTEMAS EXTERNOS"]
    Pago ["Pasarela de pago"]
    Auth ["Proveedor de Autenticación"]
end

%% =========================
%% FLUJO PRINCIPAL
%% =========================
ACTORES --> PRESENTACION
PRESENTACION --> NEGOCIO
NEGOCIO --> DATOS

%% Integraciones
DATOS -->|"integraciones"| EXTERNOS

%% =========================
%% DISTRIBUCIÓN HORIZONTAL
%% =========================
Cliente ~~~ Admin
Usuarios ~~~ Catalogo
Catalogo ~~~ Carrito
Carrito ~~~ Reservas
Pago ~~~ Auth

%% =========================
%% ESTILOS
%% =========================
style ACTORES fill:#222, stroke:#fff, stroke-width: 2px,color:#fff
style PRESENTACION fill:#222, stroke:#fff, stroke-width: 2px,color:#fff
style NEGOCIO fill:#222, stroke: #fff, stroke-width: 2px,color:#fff
style DATOS fill:#222, stroke:#fff,stroke-width: 2px,color:#fff
style EXTERNOS fill:#222, stroke:#fff, stroke-width: 2px,color:#fff
style Cliente fill:#222, stroke: #fff,color:#fff
style Admin fill:#222, stroke:#fff,color:#fff
style Web fill:#222, stroke:#fff,color:#fff
style Usuarios fill:#222, stroke: #fff,color:#fff
style Catalogo fill:#222, stroke: #fff,color:#fff
style Carrito fill:#222, stroke: #fff,color:#fff
style Reservas fill:#222, stroke: #fff,color:#fff
style BD fill:#222, stroke:#fff,color:#fff
style Pago fill:#222, stroke:#fff,color:#fff
style Auth fill:#222, stroke:#fff,color:#fff