# Estilo Arquitectónico

## Monolito Modular Serverless

Para el desarrollo inicial de la aplicación web de reservas en Ayacucho, se ha seleccionado el estilo arquitectónico de **Monolito Modular** soportado por una infraestructura Serverless (Backend-as-a-Service).

**Justificación:**
Al ser un proyecto desarrollado por un "Solo Developer", implementar arquitecturas distribuidas complejas (como Microservicios) generaría una sobrecarga innecesaria de configuración y mantenimiento. El Monolito Modular permite tener una única unidad de despliegue (fácil de subir a producción) pero manteniendo el código internamente ordenado por módulos de negocio, lo que facilita su evolución futura.

```mermaid
flowchart TD
    Cliente["📱 Cliente Web Mobile (React/Next.js)"]
    
    subgraph Monolito ["⚙️ Monolito Backend (BaaS - Supabase / Node)"]
        direction TB
        subgraph API ["Capa de Presentación / API"]
            Rutas["Rutas HTTP / Funciones Edge"]
        end
        
        subgraph Modulos ["Capa de Lógica de Negocio (Módulos)"]
            direction LR
            MUsuarios["Módulo Usuarios"]
            MCatalogo["Módulo Catálogo"]
            MReservas["Módulo Reservas"]
        end
        
        subgraph Datos ["Capa de Datos"]
            ORM["ORM / Consultas SQL"]
        end
        
        API --> Modulos
        Modulos --> Datos
    end
    
    BD[("🗄️ Base de Datos PostgreSQL")]
    Pagos["💳 Pasarela de Pago Externa"]
    
    Cliente -- HTTP / REST --> API
    Datos -- SQL --> BD
    MReservas -. HTTP .-> Pagos