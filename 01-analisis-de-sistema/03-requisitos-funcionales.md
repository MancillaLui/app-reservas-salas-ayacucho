# 3. Requisitos Funcionales

Funciones específicas que el sistema debe realizar para satisfacer las historias de usuario.

| ID | Requisito funcional |
| :--- | :--- |
| **RF01** | El sistema debe mostrar un calendario interactivo con la disponibilidad de las salas en tiempo real. |
| **RF02** | El sistema debe bloquear automáticamente las fechas y horas que ya cuentan con una reserva confirmada (evitar overbooking). |
| **RF03** | El sistema debe permitir consultar el catálogo de equipos filtrando por categorías. |
| **RF04** | El sistema debe mantener un carrito de reservas que calcule el subtotal de horas de sala y alquiler de equipos. |
| **RF05** | El sistema debe integrar un módulo para el procesamiento o registro de pagos. |
| **RF06** | El sistema debe permitir al administrador realizar operaciones CRUD sobre las entidades Sala y Equipo. |
| **RF07** | El sistema debe mostrar al administrador un listado consolidado de las reservas confirmadas y pendientes. |

## Relación entre HU y Requisitos Funcionales

| Historia de usuario | Requisitos funcionales relacionados |
| :--- | :--- |
| **HU01** Ver calendario de disponibilidad | RF01, RF02 |
| **HU02** Agregar equipos a la reserva | RF03, RF04 |
| **HU03** Completar pago online | RF05 |
| **HU04** Gestionar catálogo | RF06 |
| **HU05** Visualizar panel de reservas | RF07 |