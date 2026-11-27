# 07. Conclusiones y pendientes

## Conclusión académica

ENSAYA cuenta con código organizado, primera versión funcional, API documentada, pruebas y resultados de calidad. Los cinco tipos de entregable están preparados. Las metas de calidad se evalúan por sus resultados: completar la documentación no significa que todas se hayan alcanzado.

## Qué tuvo éxito

| Resultado | Estado y evidencia |
|---|---|
| Implementación coherente con arquitectura | **Aprobado** en revisión, límites de dependencias y pruebas; [organización](../ORGANIZACION.md), [C4](../../arquitectura/04-modelo-c4) |
| Reglas, servicios y entradas | **Aprobado**, 53 unitarias; [detalle](02-pruebas-unitarias-y-cobertura.md) |
| Concurrencia, persistencia y API | **Aprobado**, 36 de integración; [detalle](03-integracion-api-y-seguridad.md) |
| Navegación y revisión visual | **Aprobado**, 21 de navegador; [detalle y procedencia](04-navegador-y-usabilidad.md) |
| Recorrido con cuentas reales | **Aprobado**, acceso, reserva, pago simulado y cancelación; [informe](../evidencias/recorrido-real/resumen.json) |
| Cobertura configurada | **Aprobado**, 99,45 % de líneas en backend/contratos; no incluye toda la interfaz |
| OpenAPI, TypeScript y compilación | **Aprobado**, revisión publicada comprobada en CI; 26 operaciones |
| Carga de 20 VUs | **Aprobado** para ese entorno y consultas; [medición](../evidencias/k6-20.json) |
| Aislamiento de fallos de proveedores | **Aprobado** en escenarios simulados; [resiliencia](06-resiliencia-y-disponibilidad.md) |

## Objetivo medido que no se cumplió

**No cumplido: carga progresiva hasta 2.000 VUs.** Se observaron 92.701 solicitudes y 82,97 % de errores. La medición se conserva y no acredita capacidad satisfactoria aunque el p95 agregado de 1.510,92 ms sea menor de tres segundos. Las optimizaciones de disponibilidad y control de cola no resolvieron el objetivo extremo.

## Pendientes de validación y alcance simulado

| Elemento | Estado | Qué haría falta |
|---|---|---|
| Disponibilidad de 99,9 % mensual | **Pendiente de validación** | Alojamiento, monitoreo y observación prolongada |
| Capacidad representativa de producción | **Pendiente de validación** | Datos y entorno realistas, generador separado y nuevas mediciones; corregir la meta no cumplida |
| Recuperación operativa y backups | **Pendiente de validación** | Reinicios reales, restauración y objetivos de recuperación medidos |
| Usabilidad con participantes | **Pendiente de validación** | Tareas observadas y evaluación con usuarios |
| Auditoría completa de accesibilidad y seguridad | **Pendiente de validación** | Revisión especializada adicional a las pruebas actuales |
| HTTPS y operación pública | **Pendiente de validación** | Configurar y comprobar alojamiento público; la conexión de base de datos ya verifica TLS |
| Pagos y conciliación | **Simulado** | Seleccionar e integrar proveedor real y validar sus escenarios |
| Mensajería | **Simulado** | Proveedor externo, seguimiento e idempotencia/reintentos definidos |
| Reembolso financiero | **Simulado** en el registro actual | Procedimiento/proveedor real; no se automatizó devolución bancaria |

No se presentan estos pendientes como fallos nuevos de la regresión funcional ni se oculta la meta de rendimiento que sí fue medida y falló. Despliegue y proveedores reales son trabajo posterior al alcance implementado; no se ejecutan para redactar este cierre.

## Revisión publicada y CI comprobado

La revisión de código comprobada es **`79ee1690b2c2bf675f49b36f7728480a9835b3c6`** en `codex/organizacion-proyecto`. La [ejecución de referencia](https://github.com/MancillaLui/app-reservas-salas-ayacucho/actions/runs/46023685788) terminó en **success**, el 27/11/2026 a las 10:19 de Lima. Pasaron instalación limpia, estructura/invariantes, TypeScript, OpenAPI, Jest con PostgreSQL 17, compilación y publicación de cobertura como artefacto. [Copia de metadatos y SHA](../evidencias/documentacion-final/ci-referencia.json).

Los reportes locales de casos se produjeron durante la preparación de esa reorganización; no se presentan como reportes descargados de CI. Las 21 pruebas de navegador son locales y no forman parte del workflow remoto actual. El nuevo commit documental vuelve a ejecutar CI al publicarse; su resultado se consulta en la propuesta, sin atribuirle fechas o SHA de la referencia anterior.

## Entrega y estado de integración

- [Rama de reorganización y documentos](https://github.com/MancillaLui/app-reservas-salas-ayacucho/tree/codex/organizacion-proyecto).
- [Propuesta de integración #2](https://github.com/MancillaLui/app-reservas-salas-ayacucho/pull/2), dirigida a `codex/sprint-2-entrega`.
- [Rama de entrega conservada](https://github.com/MancillaLui/app-reservas-salas-ayacucho/tree/codex/sprint-2-entrega).
- [Ejecución local](../INICIO.md), [índice de entrega](../ENTREGA.md) y [guion de exposición](../EXPOSICION.md).

Al corte, la reorganización se presenta mediante propuesta; no se afirma que esté fusionada en la rama de entrega ni en `main`. Para revisar estos documentos antes de integrar, usar el enlace de la rama de reorganización. El paquete local `output/entrega-sprint-2.zip` incluye la documentación y cobertura disponible, excluyendo credenciales; se genera con `npm run delivery:prepare`.

## Mejoras posteriores priorizadas

Investigar los cuellos de capacidad con métricas de consultas, pool y coordinación, conservando las garantías de reserva; repetir carga en un entorno separado y representativo. Después, preparar operación monitorizada y recuperación, validar con usuarios e integrar proveedores reales según el alcance acordado. No añadir nuevas pantallas como sustituto de demostrar los atributos pendientes.
