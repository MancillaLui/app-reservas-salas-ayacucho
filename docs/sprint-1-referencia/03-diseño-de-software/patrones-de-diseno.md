# Patrones de diseño

## Objetivo

Documentar los patrones de diseño aplicados en el backend de la App de Reservas de Salas de Ensayo, indicando dónde se usan, qué problema resuelven y con qué tecnología se implementan, para asegurar que el desarrollo se mantenga uniforme y escalable.

## Contexto

- **Estilo:** Monolito modular (Node.js / Next.js API Routes).
- **Enfoque interno:** Clean Architecture.
- **Base:** Diagrama de componentes (C4 nivel 3).

## Patrones aplicados

| Patrón | Dónde se usa | Problema que resuelve | Se implementa con | Archivos en el código |
|---|---|---|---|---|
| **Adapter** | Módulo Reservas → Pasarela de pagos y APIs de Mensajería | Aísla los protocolos externos de pago y mensajería para que el negocio dependa de puertos. | API REST de Yape / Plin y WhatsApp API | `pago-port.ts`, `yape-pago.adapter.ts`, `mensajeria-port.ts`, `whatsapp-mensajeria.adapter.ts` |
| **Adapter (Interno)** | Módulo Reservas → Módulo Catálogo | Consulta stock sin acoplar Reservas a las clases internas ni a las tablas de Catálogo. | `CatalogoPort` y llamadas en memoria a la API pública de Catálogo | `catalogo-port.ts`, `catalogo-interno.adapter.ts` |
| **Repository** | Todos los módulos → Base de datos | La lógica de negocio no debe conocer comandos de SQL ni de Supabase. | Supabase Client (PostgreSQL) | `reserva-repository.ts`, `supabase-reserva-repository.ts` |
| **Factory** | Dominio → Creación de Entidades | Centraliza la lógica de creación de una Reserva, validando reglas antes de existir. | Métodos estáticos en TypeScript | `reserva.ts` (método `Reserva.crear()`) |
| **Fire and Forget (Asíncrono)** | Módulo Reservas → Notificaciones | Desacopla el envío de mensajes del flujo principal. Se dispara el evento de notificación sin esperar su finalización. | Funciones asíncronas (`.catch()`) | `mensajeria-port.ts`, `crear-reserva.use-case.ts` |

## Cómo funciona cada patrón

| Patrón | En pocas palabras |
|---|---|
| Adapter | Traduce: `validarPago(monto)` se convierte en la llamada HTTP de Yape; `enviarComprobanteAsync(reserva)` se convierte en el payload JSON exacto que requiere WhatsApp API y se envía sin bloquear la confirmación. |
| Adapter (Interno) | Traduce `verificarStock(equipos, horaInicio, horaFin)` a una llamada a la API pública de Catálogo; Reservas solo conoce `CatalogoPort`. |
| Repository | El caso de uso dice `guardar(reserva)` o `verificarDisponibilidad()`; el repositorio es el único que sabe cómo escribir o consultar eso en Supabase. |
| Factory | En lugar de hacer un `new Reserva()` suelto y sin validaciones, el Factory construye el objeto asegurándose de que cumpla las reglas iniciales del negocio. |

## Beneficio

- **Mantenibilidad:** Si mañana el local de ensayo decide cambiar Supabase por Firebase, o agregar Culqi en lugar de Yape, solo se modifica el Adaptador o el Repositorio. El núcleo de reservas queda intacto.
- **Testabilidad:** Al usar estos patrones, se pueden crear pruebas falsas (mocks) para simular pagos o base de datos sin gastar dinero ni alterar datos reales.

- **Resiliencia:** Aislar la mensajería asíncrona mediante un adaptador y manejar su rechazo con `.catch(...)` evita que una caída de red de WhatsApp invalide una reserva ya pagada y confirmada. El envío no se espera en el flujo principal.

## Patrones previstos para siguientes iteraciones

| Patrón | Dónde se aplicaría | Cuándo |
|---|---|---|
| **Decorator** | Módulo Catálogo → Caché | Si el sistema crece y las consultas al catálogo se vuelven lentas, se puede agregar Redis para cachear la disponibilidad sin tocar el repositorio principal. |
