# 7. Decisiones Arquitectónicas (ADR)

Registro de Decisiones Arquitectónicas (Architecture Decision Record) que responden a los drivers identificados para el sistema de reservas en Ayacucho.

| ID | Decisión arquitectónica | Driver relacionado | Justificación | Resultado |
| :--- | :--- | :--- | :--- | :--- |
| **ADR-001** | Monolito Modular Serverless | DA02 - Desarrollo sostenible (Solo Developer) | Desplegar todo el backend en una sola plataforma sin servidor (ej. Supabase) reduce la carga operativa y costos iniciales, manteniendo el código organizado en módulos lógicos. | Módulos de Catálogo, Reservas y Usuarios centralizados pero separados lógicamente. |
| **ADR-002** | Clean Architecture | DA06 - Mantenibilidad / Evolución modular | Necesitamos separar las reglas estrictas de negocio (como el motor anti-overbooking) de los detalles tecnológicos (como si usamos PostgreSQL o Firebase). | Capas internas: Dominio, Aplicación, Presentación e Infraestructura. |
| **ADR-003** | Integración de pagos mediante interfaces (Adaptadores) | DA04 - Pasarela de pago externa | Permite cambiar de pasarela de pago (de MercadoPago a Culqi, o validación de Yape) en el futuro sin reescribir la lógica de reserva. | Contrato de pagos definido en el Dominio y adaptador técnico en Infraestructura. |