# Principios de diseño (SOLID)

## Objetivo

Documentar cómo se aplican los principios SOLID en el backend de la App de Reservas de Salas de Ensayo, organizado con Clean Architecture, para que cada módulo se programe de forma uniforme y las reglas de negocio (como el anti-overbooking) no dependan de la tecnología.

## Contexto

- **Estilo:** Monolito modular (Node.js + TypeScript).
- **Enfoque interno:** Clean Architecture (presentación, aplicación, dominio, infraestructura).
- **Módulo de referencia:** Reservas, porque es el core del negocio e integra la base de datos (Supabase) y la validación de pagos externos (Yape/Plin).

## SOLID en el módulo Reservas

![SOLID en el módulo Reservas](/img/solid-modulo-reservas.png)

| Principio | Dónde se aplica (capa) | Cómo se cumple en la App de Reservas | Archivos |
|---|---|---|---|
| **S** · Responsabilidad única | Todas las capas | Cada clase tiene una sola tarea: el controlador recibe la petición HTTP, el caso de uso coordina la reserva, la entidad aplica la regla anti-overbooking y el repositorio guarda en Supabase. | `reserva.controller.ts`, `crear-reserva.use-case.ts`, `reserva.ts`, `supabase-reserva-repository.ts` |
| **O** · Abierto/cerrado | Infraestructura | Para agregar una nueva pasarela (ej. Plin o Niubiz) se crea un nuevo adaptador; el caso de uso de crear reserva no se modifica. | `yape-pago.adapter.ts`, `plin-pago.adapter.ts` |
| **L** · Sustitución de Liskov | Infraestructura | Yape y Plin devuelven el mismo resultado estructurado `{ aprobado, numOperacion, motivoRechazo }`; el caso de uso funciona exactamente igual con cualquiera de los dos. | `yape-pago.adapter.ts`, `plin-pago.adapter.ts` |
| **I** · Segregación de interfaces | Dominio | Cada interfaz tiene solo lo que Reservas necesita: `PagoPort` solo valida el pago, `ReservaRepository` solo guarda y verifica disponibilidad de salas. | `pago-port.ts`, `reserva-repository.ts` |
| **D** · Inversión de dependencias | Aplicación | El caso de uso recibe interfaces por el constructor y no conoce Yape, Supabase ni Express; las implementaciones reales se conectan en la raíz del módulo. | `crear-reserva.use-case.ts`, `reservas.module.ts` |

## Qué pasaría sin SOLID en la App de Reservas

| Situación real | Sin SOLID | Con SOLID |
|---|---|---|
| Se agrega Plin además de Yape | Hay que modificar y llenar de `if/else` el caso de uso de reserva. | Solo se crea un nuevo adaptador `PlinPagoAdapter`. |
| Se cambia Supabase por Firebase | Se rompe y reescribe toda la lógica del módulo Reservas. | Solo se reemplaza el `SupabaseReservaRepository`. |
| Se quiere probar la lógica de reserva | Se necesita conexión a internet, Supabase y la API de Yape real. | Se prueba localmente en milisegundos con implementaciones falsas (mocks) en memoria. |
| Cambia la regla de mínimo de horas | Hay que buscarla por controladores, rutas y servicios. | Está aislada de forma segura en la entidad `Reserva`. |

## Relación con Clean Architecture y los patrones

| Principio | Lo cumple en el proyecto |
|---|---|
| Responsabilidad única | La estricta separación en capas de Clean Architecture. |
| Abierto/cerrado y Liskov | El patrón Adapter (para validación de Yape y conexión con el módulo Catálogo). |
| Segregación de interfaces | Los puertos declarados en el dominio (`PagoPort`, `ReservaRepository`). |
| Inversión de dependencias | El patrón Repository y la Regla de Dependencia: las capas externas (Infraestructura/Presentación) dependen del Dominio, y no al revés. |