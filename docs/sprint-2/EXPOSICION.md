# Guion de exposición - Sprint 2 ENSAYA

Duración sugerida: 12 minutos, ajustable a las indicaciones del docente. El PDF del Sprint 2 no establece esta duración. Preparar la aplicación y el worker antes de comenzar; no proyectar `.env.local` ni las herramientas de sesión del navegador.

## 0:00-1:00 - Problema y resultado

«ENSAYA organiza reservas de salas y equipos de ensayo en Ayacucho. El Sprint 1 documentó la arquitectura; en el Sprint 2 la convertimos en una aplicación funcional. El cliente elige horario, sala y extras; el administrador controla agenda y catálogo.»

Mostrar el inicio. Las imágenes son ilustraciones; pagos y mensajes son simulados.

## 1:00-3:00 - Arquitectura implementada

Mostrar C4 nivel 2 y la estructura `src/servidor/modulos`. Next.js contiene presentación y API REST, en un monolito modular con Usuarios, Catálogo, Reservas y Pagos. Supabase proporciona Auth y PostgreSQL. Dentro de cada módulo, las reglas y contratos se separan de los adaptadores e infraestructura siguiendo Clean Architecture.

«Separar cliente y administrador no crea dos backends. Ambas interfaces consumen la misma API. La sesión, el rol y la propiedad se validan en el servidor.»

Repository separa persistencia; Adapter permite simular proveedores; la composición conecta contratos e implementaciones. Relacionar estos ejemplos con inversión de dependencias y responsabilidad única. No llamar a C4 un estilo arquitectónico.

## 3:00-6:00 - Demostración cliente

1. Ingresar como CLIENTE. Mostrar su panel y sus reservas.
2. Elegir un horario futuro libre; seleccionar sala y equipos.
3. Explicar duración real, cantidades e importe en soles. El servidor calcula y persiste céntimos.
4. Crear la reserva pendiente; señalar el vencimiento de diez minutos.
5. Aprobar un pago del simulador. Consultar el detalle confirmado.
6. Explicar que dos solicitudes no pueden ocupar la misma sala: PostgreSQL impone la exclusión y la transacción serializa la asignación de equipos.

No usar ejemplos de pago como evidencia de cobro bancario. Si un escenario falla, conservar el mensaje y explicar lo observado; no afirmar un resultado no comprobado.

## 6:00-8:00 - Demostración administrador

Mostrar agenda, filtro por estado y detalle. Recorrer catálogo, precios en soles, bloqueo de horario, pagos y comprobantes. Las métricas describen hasta 200 registros devueltos por la API, no todo el negocio. Para modificar o bloquear, elegir recursos e intervalos de prueba que no afecten reservas existentes.

Explicar el envío asíncrono: confirmar una reserva no depende del resultado de mensajería. La cancelación libera recursos; un reembolso pendiente es un registro del simulador, sin devolución financiera real.

## 8:00-10:00 - Pruebas y atributos

Mostrar Swagger y el informe `VALIDACION.md`. Hay 89 pruebas backend aprobadas (86 previas y tres adicionales de arquitectura), siete suites y cobertura de líneas de 99,45 % en backend/contratos; no en todo React. Las 21 pruebas de navegador incluyen sesiones privadas controladas y revisión del tema oscuro. Diferenciar esas evidencias de las capturas autenticadas reales, si se han completado.

Mostrar pruebas concurrentes de sala y último equipo, rechazo de acceso ajeno y aislamiento de fallos de proveedores. La caché de 30 segundos solo cubre catálogo; disponibilidad y asignación consultan PostgreSQL.

## 10:00-12:00 - Resultados y límites

«La corrida de 20 usuarios virtuales pasó; la de 2.000 no cumplió la meta. Conservamos el resultado y sus limitaciones. El 99,9 % de disponibilidad es un objetivo pendiente de observación prolongada. Las integraciones externas siguen simuladas.»

Mostrar SDD, trazabilidad y código. Si GitHub Actions todavía no se ejecutó, decir que está configurado, sin presentarlo como una corrida aprobada. Cerrar con la URL accesible del repositorio y el estado real de la entrega.

## Preguntas frecuentes

- **¿Por qué monolito modular?** Reduce la complejidad de despliegue y conserva límites internos para el alcance y equipo actuales.
- **¿Qué impide el doble alquiler?** Transacción, restricción de exclusión por sala y bloqueo coordinado para asignar equipos.
- **¿Ocultar el menú protege administración?** No; cada endpoint comprueba identidad y permisos.
- **¿Por qué no cachear disponibilidad?** Una respuesta obsoleta no debe decidir la asignación; el servidor vuelve a comprobarla en la transacción.
- **¿Qué queda para producción?** Optimización y medición de capacidad, alojamiento/HTTPS, observabilidad prolongada y proveedores reales, según un alcance posterior.
