# Nivel 2 · Diagrama de contenedores

> **Proyecto:** App Web de Reservas de Salas de Ensayo - Ayacucho  
> **Modelo:** C4 · Nivel 2 de 4 · **Versión:** 1.0

---

## 1. Objetivo

Abrir la caja «App de Reservas» del Nivel 1 y mostrar los **contenedores** que la forman: las aplicaciones web, las APIs y los almacenes de datos que se ejecutan por separado, indicando la tecnología de cada uno y cómo se comunican.

| Aspecto | Descripción |
|---|---|
| Pregunta que responde | ¿De qué piezas ejecutables se compone el sistema y con qué tecnología? |
| Audiencia | Arquitectos, desarrolladores, operaciones |
| Qué es un contenedor | Algo que se ejecuta o almacena datos de forma independiente (Frontend, Backend, Base de Datos). |
| Nivel anterior | [nivel_1_diagrama_de_contexto.md](nivel_1_diagrama_de_contexto.md) |
| Siguiente nivel | [nivel_3_diagrama_de_componentes.md](nivel_3_diagrama_de_componentes.md) |

---

## 2. Diagrama

```mermaid
flowchart TB

    Cliente["Cliente / músico"]
    Admin["Administrador"]
    subgraph APP["Aplicación de reservas · Software propio"]
        Web["Aplicación web<br/>React / Next.js"]
        API["API Backend · Node.js / TypeScript<br/>REST, JWT y RBAC"]
    end
    subgraph BAAS["Supabase · Servicios gestionados"]
        Auth["Supabase Auth<br/>Sesiones y tokens"]
        DB[("PostgreSQL<br/>Datos y restricciones")]
    end
    Pago["Proveedor de pagos<br/>Yape / Plin · Integración por concretar"]
    Msg["Mensajería<br/>WhatsApp API / Resend"]
    Cliente --> Web
    Admin --> Web
    Web -->|"HTTPS / JSON"| API
    Web -->|"HTTPS · Inicia sesión"| Auth
    API -->|"Acceso a datos mediante repositorio"| DB
    API -->|"HTTPS / REST · Valida pago"| Pago
    API -.->|"HTTPS · Comprobantes y alertas"| Msg

    classDef persona fill:#E8EDF3,stroke:#475569,color:#172033,stroke-width:1.5px;
    classDef aplicacion fill:#E7F0FC,stroke:#2563A6,color:#142C4C,stroke-width:1.5px;
    classDef dominio fill:#E9F5EC,stroke:#2E7D46,color:#173B24,stroke-width:1.5px;
    classDef infraestructura fill:#F0EAF8,stroke:#7953A3,color:#39244F,stroke-width:1.5px;
    classDef externo fill:#F1F3F5,stroke:#687583,color:#26313D,stroke-width:1.5px;
    class Cliente,Admin persona;
    class Web,API aplicacion;
    class DB infraestructura;
    class Auth,Pago,Msg externo;
```

**Lectura:** flechas continuas = comunicación o colaboración; flecha discontinua = envío asíncrono. Azul = presentación/aplicación; verde = negocio; violeta = infraestructura; gris = personas o servicios externos. El diagrama representa una propuesta de diseño.

**Acceso a datos:** el SDK de Supabase consume servicios HTTP; una conexión PostgreSQL directa utiliza SQL sobre una conexión de base de datos. Son mecanismos distintos. La selección concreta y la operación transaccional se encapsularán en el repositorio; este diagrama no afirma que ambas vías ya estén implementadas.


---

## 3. Contenedores

| Contenedor | Tecnología | Responsabilidad | Datos que maneja |
|---|---|---|---|
| **Aplicación web** | React.js / Next.js (Tailwind) | Interfaz Mobile-First para clientes (calendario, carrito) y panel para administradores. | Ninguno persistente; solo estado temporal de la pantalla (carrito local). |
| **API Backend** | Node.js (Next.js API Routes) | Monolito modular. Expone la API REST, aplica las reglas anti-overbooking y calcula precios. | Ninguno propio; transita datos entre el frontend y Supabase. |
| **Servicio de Autenticación** | Supabase Auth (BaaS) | Verifica identidades y emite tokens JWT (Google SSO, Email/Pass). | Información de autenticación y sesiones gestionada por Supabase Auth. |
| **Base de datos** | PostgreSQL (Supabase BaaS) | Almacena de forma permanente y relacional la información del negocio con estricta integridad. | Usuarios, Salas, Equipos, Reservas y Detalle de Reservas. |

---

## 4. Relaciones

| Origen | Destino | Descripción | Protocolo |
|---|---|---|---|
| Cliente / Administrador | Aplicación web | Usan la aplicación desde el navegador web (móvil o PC). | HTTPS |
| Aplicación web | Servicio Auth | Inicia sesión y obtiene token de seguridad (JWT). | HTTPS |
| Aplicación web | API Backend | Envía solicitudes de reserva o consulta catálogo. | HTTPS/JSON |
| API Backend | Base de datos | Verifica disponibilidad y guarda reservas confirmadas. | Acceso mediante repositorio; SDK HTTP o conexión SQL por definir |
| API Backend | Pasarela de Pago (Yape) | Solicita la validación del pago o la generación del QR. | HTTPS/REST |
| API Backend | Servicio de Mensajería (WhatsApp API / Resend) | Enviar comprobantes de reserva confirmada y alertas de cancelación. | HTTPS/REST |

---

## 5. Decisiones arquitectónicas reflejadas

| Decisión | Alternativa descartada | Motivo |
|---|---|---|
| **Uso de Backend-as-a-Service (Supabase)** | Crear servidor y BD en AWS/DigitalOcean desde cero | Al ser un "Solo Developer", se delega la infraestructura (Auth y BD) para ahorrar tiempo y costos operativos iniciales. |
| **Frontend separado del backend (React API)** | Vistas generadas en el servidor (Ej. EJS/PHP) | Permite que el frontend sea 100% responsivo y rápido (Mobile-First), comportándose casi como una app nativa. |
| **PostgreSQL como base de datos** | Base de datos NoSQL (MongoDB/Firebase) | El motor de reservas y los pagos requieren transacciones estrictas ACID para prevenir el overbooking. |
| **API Centralizada** | Acceso directo de React a la Base de Datos | Por seguridad y para aplicar Clean Architecture, las reglas de negocio críticas deben ejecutarse en el servidor (API Backend). |

---

## 6. Seguridad entre contenedores

| Comunicación | Medida |
|---|---|
| Navegador → Aplicación web y API | Tráfico cifrado en todo momento con certificado SSL (HTTPS). |
| Aplicación web → API Backend | Validación del token JWT en cada petición mediante middlewares (Supabase Auth) y Validación de Roles (RBAC - Admin/Cliente). Las rutas administrativas exigen un rol de Admin validado en el token firmado, procedente de información controlada por el servidor. |
| API Backend → Base de datos | Se prevén políticas *Row Level Security (RLS)* para limitar el acceso a reservas propias, junto con autorización en la API; su aplicación debe verificarse según la identidad y los privilegios de la conexión. |
| API Backend → Servicio de Mensajería | Comunicación HTTPS; las credenciales de WhatsApp API / Resend se almacenan en variables de entorno del servidor. |
| API Backend → Pasarela de pago | Las credenciales (API Keys) de Yape/Plin viven seguras en las variables de entorno del servidor. |