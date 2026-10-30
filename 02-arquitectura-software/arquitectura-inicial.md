# Arquitectura inicial del sistema

## Diagrama de arquitectura

```mermaid
flowchart TD;

subgraph ACTORES ["ACTORES"];
Cliente["Cliente"];
Admin["Administrador"];
end;

subgraph PRESENTACION ["PRESENTACIÓN"];
Web["Aplicación Web -> API REST"];
end;

subgraph NEGOCIO ["LÓGICA DE NEGOCIO"];
Usuarios["Usuarios"];
Catalogo["Catálogo (Salas y Equipos)"];
Reservas["Reservas (Motor Core y Carrito)"];
Pagos["Pagos"];
end;

subgraph DATOS ["DATOS"];
BD["Base de datos (Supabase)"];
end;

subgraph EXTERNOS ["SISTEMAS EXTERNOS"];
Pasarela["Pasarela de pago"];
Auth["Proveedor Auth"];
Mensajeria["Mensajería (WhatsApp/Correo)"];
end;

ACTORES --> PRESENTACION;
PRESENTACION -->|"Delega"| NEGOCIO;
NEGOCIO -->|"Persiste estado"| DATOS;
NEGOCIO -->|"Llama API externa"| EXTERNOS;

Cliente ~~~ Admin;
Usuarios ~~~ Catalogo;
Catalogo ~~~ Reservas;
Reservas ~~~ Pagos;
Pasarela ~~~ Auth;

style ACTORES fill:#222, stroke:#fff, stroke-width: 2px,color:#fff;
style PRESENTACION fill:#222, stroke:#fff, stroke-width: 2px,color:#fff;
style NEGOCIO fill:#222, stroke: #fff, stroke-width: 2px,color:#fff;
style DATOS fill:#222, stroke:#fff,stroke-width: 2px,color:#fff;
style EXTERNOS fill:#222, stroke:#fff, stroke-width: 2px,color:#fff;
style Cliente fill:#222, stroke: #fff,color:#fff;
style Admin fill:#222, stroke:#fff,color:#fff;
style Web fill:#222, stroke:#fff,color:#fff;
style Usuarios fill:#222, stroke: #fff,color:#fff;
style Catalogo fill:#222, stroke: #fff,color:#fff;
style Reservas fill:#222, stroke: #fff,color:#fff;
style Pagos fill:#222, stroke: #fff,color:#fff;
style BD fill:#222, stroke:#fff,color:#fff;
style Pasarela fill:#222, stroke:#fff,color:#fff;
style Auth fill:#222, stroke:#fff,color:#fff;
style Mensajeria fill:#222, stroke:#fff,color:#fff;