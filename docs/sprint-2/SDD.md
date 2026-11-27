# Especificaciones SDD de las funcionalidades

## Convenciones y decisiones

Actores: músico autenticado y administrador de un único local. Cada especificación contiene comportamiento, aceptación y tareas técnicas implementadas. Son especificaciones de software dirigidas por los requisitos del proyecto; no presuponen un formato adicional del curso que no aparece en el PDF.

La interfaz usa hora de Lima; HTTP recibe instantes ISO 8601 con zona. Los intervalos son `[inicio, fin)`, futuros y de hasta 24 horas. La sala se cobra por duración real, redondeada al céntimo, y los equipos por unidad y ensayo. El servidor calcula el total con tarifas vigentes y conserva las tarifas de equipos asignadas. No se aceptan precios ni identidades de cliente enviados por el navegador. La política de cancelación permite cancelar antes del inicio, con intervención administrativa por fuerza mayor. Los reembolsos quedan registrados para gestión manual.

## Catálogo y disponibilidad

| Requisito | Especificación y criterio de aceptación | Tareas técnicas implementadas |
|---|---|---|
| RF01 | Consultar disponibilidad para un intervalo futuro. La respuesta identifica salas libres y cantidades disponibles de equipos. Dos intervalos adyacentes no se consideran superpuestos. | Calendario por horas con actualización cada 30 segundos, selector de fecha/hora y consulta SQL que excluye pendientes vencidas; sin caché de disponibilidad. |
| RF02 | Rechazar con 409 una reserva superpuesta a una pendiente, en procesamiento, confirmada o a un bloqueo. En solicitudes simultáneas solo se asigna una sala. | Exclusión GiST por sala e intervalo, transacción y bloqueo asesor compartido, traducción HTTP del conflicto SQL. |
| RF03 | Mostrar equipos activos y filtrar por categoría; no incluir recursos desactivados en el catálogo público. | Repositorio de catálogo, servicio con caché de 30 segundos y filtro, listado y selector de categoría. |
| RF04 | Mantener la selección de sala/extras en pantalla y mostrar una estimación. El importe persistido procede del servidor; 90 minutos a S/30/h más un extra de S/10 deben sumar S/55. | Carrito React, cálculo entero de céntimos, consulta transaccional de tarifas y captura de precio de extras. |
| RF09 | Considerar cantidades de equipos de todas las salas en el intervalo. El pico simultáneo nunca supera el stock, aunque varias solicitudes compitan por la última unidad. | Consulta de picos por inicios de reservas y extremo inicial solicitado; asignación serializada junto con la sala; pruebas con equipos compartidos. |

La disponibilidad mostrada es informativa: puede cambiar antes de reservar. La operación de creación siempre vuelve a validar con la base de datos.

## Reserva, pago y comunicación

| Requisito | Especificación y criterio de aceptación | Tareas técnicas implementadas |
|---|---|---|
| RF05 | Pagar una reserva propia vigente mediante un simulador. Aprobación confirma; rechazo cancela. Repetir la misma clave no genera un segundo intento. Un resultado incierto no confirma ni libera recursos. | Módulo Pagos y adaptador simulado, Idempotency-Key obligatorio, registro único por reserva, transiciones protegidas y conciliación administrativa simulada. |
| RF08 | La creación deja PENDIENTE con vencimiento de diez minutos. Una pendiente vencida deja de ocupar sala y equipos. Al iniciar pago pasa a PROCESANDO y no expira hasta resolver el resultado. | Tiempo calculado en PostgreSQL, worker periódico y limpieza previa a operaciones críticas. Las peticiones no esperan la ejecución del proveedor dentro de la transacción SQL. |
| RF11 | El propietario cancela antes del inicio; el administrador puede intervenir por fuerza mayor. Se exige motivo. Cancelar libera recursos y, si hubo pago aprobado, marca reembolso pendiente. | Autorización por propiedad/rol, validación de estado y tiempo, transición transaccional, comprobante de cancelación y registro de reembolso. |
| RF12 | Una confirmación genera un comprobante persistente. La entrega se ejecuta fuera de la petición. Fallo o demora de envío nunca desconfirma la reserva. | Outbox transaccional en notificaciones, worker, estados PENDIENTE/ENVIANDO/ENVIADA/FALLIDA, simulador de envío y recuperación de tareas ENVIANDO abandonadas. |

Estados: `PENDIENTE → PROCESANDO → CONFIRMADA / CANCELADA`; `PENDIENTE → EXPIRADA / CANCELADA`; `CONFIRMADA → CANCELADA`. Un pago INCIERTO mantiene la reserva PROCESANDO hasta su conciliación. No se implementa una pasarela financiera real ni reembolsos automáticos.

## Administración y seguridad

| Requisito | Especificación y criterio de aceptación | Tareas técnicas implementadas |
|---|---|---|
| RF06 | Solo ADMIN crea, actualiza o desactiva salas/equipos. No se borra el historial. Cambiar stock/estado de recursos con compromisos futuros devuelve 409. | Formularios CRUD, endpoints administrativos, validación Zod, baja lógica, invalidación de caché y bloqueo coordinado con reservas. |
| RF07 | ADMIN consulta agenda con cliente, sala, horario y estado; el cliente consulta exclusivamente sus reservas. La lista está limitada a 200 filas, ordenadas por fecha de ensayo descendente. | Consultas autorizadas y panel de agenda, detalle de reserva y actualización manual de datos. |
| RF10 | ADMIN bloquea una sala por mantenimiento sin superponer reservas existentes. Desbloquear conserva el historial y devuelve la disponibilidad. | Bloqueos almacenados como asignaciones de tipo BLOQUEO; misma exclusión SQL, motivo y endpoints de alta/listado/desbloqueo. |

Supabase valida el token mediante `getUser(token)`. El servidor obtiene el rol de `perfiles`; el cliente no puede modificarlo mediante la API. RLS está habilitado sin políticas de acceso directo y se revocan permisos de las tablas a los roles de navegador de Supabase. La conexión privilegiada del backend requiere que la API compruebe propiedad y rol en cada operación.

## Contrato público

Swagger se sirve en `/docs`, y el contrato OpenAPI en `/api/v1/openapi`. Entradas desconocidas se rechazan; los errores contienen `error.code` y `error.message`. Estados comunes: 400 validación, 401 sesión, 403 permisos, 404 recurso, 409 conflicto y 503 dependencia no disponible o pago incierto. El pago rechazado devuelve una reserva CANCELADA con HTTP 200 porque la operación del simulador se completó; la interfaz muestra el rechazo. Las eliminaciones lógicas correctas devuelven 204.

Consultar [la matriz de trazabilidad y pruebas](TRAZABILIDAD.md) para vincular cada especificación con la evidencia ejecutable.
