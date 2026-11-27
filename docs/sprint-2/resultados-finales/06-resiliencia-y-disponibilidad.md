# 06. Resiliencia y disponibilidad

## Objetivo, entorno y método

Comprobar que fallos de proveedores y tareas diferidas no corrompan reservas ni liberen recursos durante un pago incierto. La evidencia automatizada pertenece a la corrida Jest del 27/11/2026: repositorios y PostgreSQL temporal reales, identidad controlada y proveedores **Simulados**. El [extracto](../evidencias/documentacion-final/pruebas-jest.json) identifica los casos y su estado.

## Escenarios y resultados

| Escenario | Resultado observado | Estado y alcance |
|---|---|---|
| Confirmación y comprobante | Pago aprobado persiste reserva confirmada e intención de comprobante en la transacción | **Aprobado**, integración; proveedor **Simulado** |
| Fallo al programar envío | El servicio conserva confirmación persistida | **Aprobado**, prueba unitaria con dependencia controlada |
| Fallo de entrega | Después de procesar el worker, reserva sigue CONFIRMADA y notificación queda FALLIDA | **Aprobado**, integración con fallo **Simulado** |
| Demora de entrega | La respuesta de pago ocurre antes de procesar el envío; intención PENDIENTE y luego ENVIADA | **Aprobado**, integración con demora **Simulada** |
| Pago incierto | Conserva asignación, impide segundo cobro y exige conciliación | **Aprobado**, integración; sin operación bancaria |
| Vencimiento pendiente | Worker expira la reserva y libera cantidades | **Aprobado**, integración |
| Reinicio lógico del servicio | Una nueva instancia de servicios sobre la misma base recupera la reserva PROCESANDO sin expirar su pago | **Aprobado**, alcance limitado a reinstanciación |
| Error de conexión | El route handler traduce un error inyectado de consulta a HTTP 503 | **Aprobado**, fallo controlado; no se desconectó un alojamiento real |
| Uptime mensual de 99,9 % | No hay una serie de monitoreo prolongado que lo acredite | **Pendiente de validación** |

La prueba de demora exige que la llamada de pago termine en menos de 1.500 ms en su entorno y procesa el envío después; no acredita esa latencia para todos los pagos en producción. Una prueba aprobada de fallo de mensajería demuestra aislamiento del fallo, no un envío externo exitoso.

## Mecanismos implementados

El comprobante y su intención de envío se persisten junto a la confirmación. El worker procesa tareas fuera de la respuesta del pago. Los intentos de pago abandonados y tareas de envío en proceso tienen tratamiento de recuperación, descrito en [arquitectura](../ARQUITECTURA.md). Los errores de entrega se registran; no existe una política general automática de reintento para toda notificación FALLIDA.

La idempotencia evita repetir un intento terminado. Los estados PROCESANDO/INCIERTO no se interpretan como rechazo inmediato que libere la sala. La conciliación administrativa pertenece al simulador. Tras una cancelación de pago aprobado se registra reembolso pendiente para gestión manual, sin devolver dinero automáticamente.

## Evidencia real complementaria

La [demostración administrativa sobre Supabase](../evidencias/demo-supabase.json) registró una reserva que conservó CONFIRMADA ante fallo de mensajería, su cancelación posterior y liberación. La ejecutó un script de servicios, no el navegador. El [recorrido autenticado real](../evidencias/recorrido-real/resumen.json) mostró confirmación y cancelación con cuentas reales, pero no todas las variantes de fallo.

Estos registros usan Supabase real para datos y Auth donde corresponde, manteniendo pagos y mensajes simulados. No acreditan disponibilidad del proveedor de correo, WhatsApp o una pasarela financiera.

## Reproducción y limitaciones

`npm run test:verify` reproduce los escenarios aislados. El worker operativo se inicia con `npm run worker` según [INICIO](../INICIO.md), pero ese comando no debe ejecutarse contra operación solo para comprobar este documento. La redacción no lo ejecutó ni produjo nuevas reservas.

El caso denominado reinicio no termina un proceso del sistema, reinicia PostgreSQL ni simula pérdida de máquina: vuelve a construir servicios sobre la misma base. **Pendiente de validación:** recuperación del alojamiento ante reinicios reales, RTO/RPO, restauración de copias de seguridad, failover y observación mensual. El endpoint de salud y la persistencia ayudan a operar, pero no prueban un SLA de 99,9 %.
