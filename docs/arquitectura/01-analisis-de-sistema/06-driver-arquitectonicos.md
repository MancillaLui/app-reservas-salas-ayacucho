# 6. Drivers Arquitectónicos

Requisitos, atributos y restricciones que influyen de manera importante en el diseño.

| ID | Driver arquitectónico | Origen | ¿Por qué influye en la arquitectura? |
| :--- | :--- | :--- | :--- |
| **DA01** | La validación de disponibilidad debe ser estricta y en tiempo real. | RF02 | Exige una base de datos con capacidad transaccional y validaciones fuertes. |
| **DA02** | El desarrollo debe ser sostenible para una sola persona, con bajos costos. | RC01, RC03 | Motiva un monolito modular con base de datos y autenticación gestionadas. La API se ejecuta en Node.js; BaaS no implica serverless. |
| **DA03** | La aplicación debe priorizar la experiencia en dispositivos móviles y cargar rápido. | AC01, AC04 | Define el uso de frameworks responsivos y optimizados para la web (SPA). |
| **DA04** | El sistema debe integrarse con una pasarela de pago externa. | RF05 | Condiciona la forma de comunicación mediante adaptadores seguros (HTTPS). |
| **DA05** | Las fallas en notificaciones externas no deben arruinar una reserva pagada. | RF12 | Motiva persistir el comprobante con la confirmación y procesar su entrega en un worker separado de la petición. |
| **DA06** | Mantenibilidad y evolución modular a largo plazo. | RC01 | Exige usar Clean Architecture para separar reglas de negocio de los detalles técnicos y permitir el escalado. |
