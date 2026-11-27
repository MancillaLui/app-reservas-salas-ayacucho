# 3. Requisitos Funcionales

Funciones específicas que el sistema debe realizar para satisfacer las historias de usuario.

| ID | Requisito funcional |
| :--- | :--- |
| **RF01** | El sistema debe mostrar un calendario interactivo con la disponibilidad de las salas en tiempo real. |
| **RF02** | El sistema debe impedir la creación de reservas en fechas y horas que ya cuentan con una reserva confirmada o en proceso de pago (evitar overbooking). |
| **RF03** | El sistema debe permitir consultar el catálogo de equipos filtrando por categorías. |
| **RF04** | El sistema debe mantener un carrito de reservas que calcule el subtotal de horas de sala y alquiler de equipos. |
| **RF05** | El sistema debe integrar un módulo para el procesamiento o registro de pagos. |
| **RF06** | El sistema debe permitir al administrador realizar operaciones CRUD sobre las entidades Sala y Equipo. |
| **RF07** | El sistema debe mostrar al administrador un listado consolidado de las reservas confirmadas y pendientes. |
| **RF08** | El sistema debe bloquear temporalmente una sala en un horario específico durante 10 minutos al iniciar el proceso de pago, liberándola automáticamente si el pago falla. |
| **RF09** | El sistema debe validar el stock disponible de los equipos extra para el horario seleccionado antes de confirmar una reserva. |
| **RF10** | El sistema debe permitir al administrador bloquear y desbloquear manualmente fechas y horarios específicos para inhabilitar reservas. |
| **RF11** | El sistema debe permitir la cancelación de reservas (por cliente o administrador), actualizando su estado y liberando los recursos. |
| **RF12** | El sistema debe enviar comprobantes de reserva de forma asíncrona mediante un servicio de mensajería (WhatsApp/Correo). |

## Relación entre HU y Requisitos Funcionales

| Historia de usuario | Requisitos funcionales relacionados |
| :--- | :--- |
| **HU01** Ver calendario de disponibilidad | RF01, RF02 |
| **HU02** Agregar equipos según stock | RF03, RF04, RF09 |
| **HU03** Completar pago online | RF05, RF08, RF12 |
| **HU04** Cliente anula reserva | RF11 |
| **HU05** Gestionar catálogo (Admin) | RF06 |
| **HU06** Visualizar panel de reservas (Admin) | RF07 |
| **HU07** Bloqueos manuales (Admin) | RF10 |
| **HU08** Cancelaciones por fuerza mayor (Admin) | RF11 |