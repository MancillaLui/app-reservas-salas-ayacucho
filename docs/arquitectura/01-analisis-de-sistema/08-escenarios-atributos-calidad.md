# Escenarios de atributos de calidad - Sprint 2

| ID | Fuente | Estímulo | Artefacto | Entorno | Respuesta | Medida y evidencia |
|---|---|---|---|---|---|---|
| EC01 / AC01 | Cliente | Consulta catálogo o calendario | Web/API y PostgreSQL | Entorno de pruebas con datos/carga registrados | Entregar disponibilidad y recursos | Meta original menor de 3 s. Medir p95 de API con carga explícita; no equiparar API con carga completa en 3G/4G. Script k6 hasta 2.000 VUs y benchmark HTTP pequeño. |
| EC02 / AC02 | Operación del sistema | Reinicio del proceso de aplicación | Datos de reservas, pagos y comprobantes | PostgreSQL permanece operativo | Recuperar estado sin liberar pagos inciertos ni perder intención de envío | Reinstanciar servicios y verificar PROCESANDO y tareas persistidas. El 99,9 % mensual necesita monitoreo y no se acredita con esta prueba. |
| EC03 / AC03 | Cliente sin permisos o atacante | Token inválido, reserva ajena u operación administrativa | API, identidad y persistencia | Usuarios/roles de prueba | Rechazar acceso sin modificar datos | 100 % de intentos definidos se deniegan con 401/403; comprobar que user_metadata no concede ADMIN. Supabase real y TLS de alojamiento pendientes de configuración. |
| EC04 / AC04 | Músico | Completar una reserva desde teléfono | Interfaz móvil | Ancho móvil, usuario autenticado, datos de prueba | Elegir horario, sala, extras, revisar y pagar sin desbordamiento | Inspección del recorrido y accesibilidad básica; completar tarea sin errores en demostración. Sin estudio de usuarios no se afirma conversión óptima. |
| EC05 / AC05 | Simulador de mensajería | Demora de 2 s o fallo de entrega | Reserva confirmada y worker | Pago aprobado y comprobante persistido | Responder sin esperar la entrega y mantener CONFIRMADA | Pruebas verifican respuesta previa a la entrega y estados ENVIADA/FALLIDA después del worker. |
| EC06 / DA01 | Clientes concurrentes | Misma sala o último equipo solicitados simultáneamente | Repositorio transaccional y PostgreSQL | 20 solicitudes a una sala y dos salas para un equipo | Asignar solo recursos disponibles | Exactamente una ganadora para la misma sala; no superar stock compartido. Pruebas de integración con PostgreSQL real. |

Resultados, límites del entorno y estado de cada validación: [informe del Sprint 2](../../sprint-2/VALIDACION.md).
