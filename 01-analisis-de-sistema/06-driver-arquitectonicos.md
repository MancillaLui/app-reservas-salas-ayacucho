# 6. Drivers Arquitectónicos

Requisitos, atributos y restricciones que influyen de manera importante en el diseño.

| ID | Driver arquitectónico | Origen | ¿Por qué influye en la arquitectura? |
| :--- | :--- | :--- | :--- |
| **DA01** | La validación de disponibilidad (evitar overbooking) debe ser estricta y en tiempo real. | RF02 (Funcional) | Exige el uso de una base de datos con capacidad transaccional y validaciones fuertes en el backend. |
| **DA02** | El desarrollo debe ser sostenible para una sola persona, con bajos costos de servidor. | RC01, RC03 (Restricción) | Obliga a adoptar un enfoque Serverless/BaaS, separando el Frontend del Backend de Datos. |
| **DA03** | La aplicación debe priorizar la experiencia en dispositivos móviles y cargar rápido. | AC01, AC04 (Calidad) | Define que la capa de presentación debe utilizar frameworks de diseño responsivo y optimizados para la web. |
| **DA04** | El sistema debe integrarse con una pasarela de pago externa mediante una API. | RF05 (Funcional) | Condiciona la forma de comunicación e integración con sistemas externos de alta seguridad. |