# 4. Atributos de Calidad

Características que indican cómo debe funcionar el sistema, más allá de sus funcionalidades.

| ID | Atributo de calidad | Escenario de calidad (Medible) |
| :--- | :--- | :--- |
| **AC01** | **Rendimiento** | El calendario y el catálogo deben cargar en menos de 3 segundos, incluso en conexiones de redes móviles (3G/4G). |
| **AC02** | **Disponibilidad** | El sistema debe estar disponible 24/7 (meta del 99.9% de uptime) para permitir reservas fuera de horario comercial. |
| **AC03** | **Seguridad** | Los datos personales y registros de pago deben estar protegidos mediante cifrado TLS/HTTPS y autenticación JWT. |
| **AC04** | **Usabilidad** | La interfaz debe tener un diseño "Mobile-First", asegurando que la conversión (completar reserva) requiera los mínimos clics posibles desde un celular. |
| **AC05** | **Resiliencia** | Si el servicio externo de mensajería (WhatsApp API) falla o se retrasa, el sistema debe confirmar la reserva al cliente en pantalla de todos modos, sin abortar la transacción principal. |