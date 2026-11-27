# Principios de diseño SOLID - Sprint 2

| Principio | Aplicación verificable |
|---|---|
| S - Responsabilidad única | HTTP valida/traduce; servicios coordinan; reglas puras validan; repositorios ejecutan SQL; worker procesa tareas. |
| O - Abierto/cerrado | Un proveedor de pagos alternativo puede implementar ProveedorPago sin cambiar el servicio de Reservas, siempre que respete el contrato. |
| L - Sustitución | El proveedor simulado y sus sustitutos de prueba respetan aprobación, rechazo y resultado incierto. No basta con que coincidan nombres de propiedades. |
| I - Segregación | Contratos separados de identidad, catálogo, reserva, pago, administración y mensajería. |
| D - Inversión de dependencias | Aplicación recibe interfaces; src/servidor/composicion.ts conecta repositorios y adaptadores concretos. |

Las pruebas unitarias sustituyen repositorios y proveedores. Una prueba de arquitectura impide importar infraestructura, presentación o SDK técnicos desde dominio y aplicación. Las pruebas PostgreSQL verifican las garantías que un mock no puede acreditar.

La entidad por sí sola no puede observar solicitudes concurrentes; la exclusión de sala y asignación de equipos se verifican dentro de la transacción. [Pruebas y trazabilidad](../../sprint-2/TRAZABILIDAD.md). [Propuesta previa conservada](../../sprint-1-referencia/03-diseño-de-software/principios-de-diseno.md).
