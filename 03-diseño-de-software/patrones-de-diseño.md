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
| Adapter | Módulo Reservas → Pasarela de pagos | Yape y Plin tienen sus propias APIs externas. El negocio no debe depender de ellas. | API REST de Yape / Plin | `pago-port.ts`, `yape-pago.adapter.ts` |
| Repository | Todos los módulos → Base de datos | La lógica de negocio (evitar overbooking) no debe conocer comandos de SQL ni de Supabase. | Supabase Client (PostgreSQL) | `reserva-repository.ts`, `supabase-reserva-repository.ts` |
| Factory | Dominio → Creación de Entidades | Centraliza la lógica de creación de una Reserva, validando que tenga una Sala, Cliente y un mínimo de horas antes de existir. | Métodos estáticos en TypeScript | `reserva.ts` (método `Reserva.crear()`) |

## Cómo funciona cada patrón

| Patrón | En pocas palabras |
|---|---|
| Adapter | Traduce: el caso de uso del sistema dice `validarPago(monto)` y el adaptador lo convierte en la llamada HTTP exacta que requiere la API de Yape. |
| Repository | El caso de uso dice `guardar(reserva)` o `verificarDisponibilidad()`; el repositorio es el único que sabe cómo escribir o consultar eso en Supabase. |
| Factory | En lugar de hacer un `new Reserva()` suelto y sin validaciones, el Factory construye el objeto asegurándose de que cumpla las reglas iniciales del negocio. |

## Beneficio

- **Mantenibilidad:** Si mañana el local de ensayo decide cambiar Supabase por Firebase, o agregar Culqi en lugar de Yape, solo se modifica el Adaptador o el Repositorio. El núcleo de reservas queda intacto.
- **Testabilidad:** Al usar estos patrones, se pueden crear pruebas falsas (mocks) para simular pagos o base de datos sin gastar dinero ni alterar datos reales.

## Patrones previstos para siguientes iteraciones

| Patrón | Dónde se aplicaría | Cuándo |
|---|---|---|
| Observer | Módulo Reservas → Notificaciones | Cuando se implemente el envío automático de correos o mensajes de WhatsApp al músico una vez confirmada su reserva. |
| Decorator | Módulo Catálogo → Caché | Si el sistema crece y las consultas al catálogo de equipos se vuelven lentas, se puede agregar Redis para cachear la disponibilidad sin tocar el repositorio principal. |