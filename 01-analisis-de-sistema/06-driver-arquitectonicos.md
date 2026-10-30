# 6. Drivers Arquitectónicos

Requisitos, atributos y restricciones que influyen de manera importante en el diseño.

| ID | Driver arquitectónico | Origen | ¿Por qué influye en la arquitectura? |
| :--- | :--- | :--- | :--- |
| **DA01** | La validación de disponibilidad debe ser estricta y en tiempo real. | RF02 | Exige una base de datos con capacidad transaccional y validaciones fuertes. |
| **DA02** | El desarrollo debe ser sostenible para una sola persona, con bajos costos. | RC01, RC03 | Obliga a adoptar un enfoque Serverless/BaaS, separando Frontend del Backend. |
| **DA03** | La aplicación debe priorizar la experiencia en dispositivos móviles y cargar rápido. | AC01, AC04 | Define el uso de frameworks responsivos y optimizados para la web (SPA). |
| **DA04** | El sistema debe integrarse con una pasarela de pago externa. | RF05 | Condiciona la forma de comunicación mediante adaptadores seguros (HTTPS). |
| **DA05** | Las fallas en notificaciones externas no deben arruinar una reserva pagada. | RF12 | Obliga a implementar patrones asíncronos ("Fire and Forget") y aislar la mensajería. |
| **DA06** | Mantenibilidad y evolución modular a largo plazo. | RC01 | Exige usar Clean Architecture para separar reglas de negocio de los detalles técnicos y permitir el escalado. |