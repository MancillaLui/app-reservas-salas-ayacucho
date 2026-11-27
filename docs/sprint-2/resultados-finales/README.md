# Sprint 2 de ENSAYA: resultados finales

Actualización posterior: [interfaz intuitiva integrada y validación de 25 pruebas de navegador](../INTERFAZ-INTUITIVA.md). Las cifras y capturas anteriores conservan su fecha histórica.

**Corte documental:** 27 de noviembre de 2026, America/Lima. Este conjunto resume resultados existentes; su redacción no ejecuta carga, migraciones ni operaciones en Supabase. Conserva los informes originales y distingue sus entornos y fechas.

## Resumen académico

El Sprint 2 convirtió el diseño de ENSAYA en una aplicación funcional de reservas de salas y equipos. Se implementaron API REST, persistencia transaccional, autenticación con Supabase, interfaces de cliente y administrador, pruebas automatizadas y documentación arquitectónica. Posteriormente se incorporaron un tema oscuro y una organización explícita de cliente, servidor y contratos compartidos.

Los escenarios funcionales automatizados pasaron. La demostración real completó acceso de ambos roles, reserva, pago simulado y cancelación. La prueba extrema de rendimiento no alcanzó los umbrales; la disponibilidad mensual no se ha acreditado. La entrega incluye esos límites y no los presenta como éxitos.

## Lectura por partes

1. [Trabajo realizado y requisitos](01-trabajo-realizado.md).
2. [Pruebas unitarias y cobertura](02-pruebas-unitarias-y-cobertura.md).
3. [Integración, API y seguridad](03-integracion-api-y-seguridad.md).
4. [Navegador y usabilidad](04-navegador-y-usabilidad.md).
5. [Rendimiento, base de datos y caché](05-rendimiento-base-datos-y-cache.md).
6. [Resiliencia y disponibilidad](06-resiliencia-y-disponibilidad.md).
7. [Conclusiones y pendientes](07-conclusiones-y-pendientes.md).

## Cinco entregables y dónde revisarlos

| Entregable | Evidencia principal |
|---|---|
| Código organizado según la arquitectura | [Código](../../../src), [arquitectura](../ARQUITECTURA.md), [organización y equivalencias](../ORGANIZACION.md), [C4](../../arquitectura/04-modelo-c4) |
| Primera versión funcional | [Ejecución](../INICIO.md), [interfaces](../INTERFACES.md), [recorrido real](../evidencias/recorrido-real/resumen.json) |
| OpenAPI/Swagger | [Especificación](../../../src/servidor/documentacion/openapi.ts), Swagger en `/docs` con la aplicación iniciada |
| Jest y cobertura | [Extracto de 89 casos](../evidencias/documentacion-final/pruebas-jest.json), [detalle unitario](02-pruebas-unitarias-y-cobertura.md), [integración](03-integracion-api-y-seguridad.md) |
| Evidencias y resultados de calidad | [Historial de validación](../VALIDACION.md) y documentos 04, 05 y 06 de este índice |

## Estado de los resultados

| Resultado evaluado | Estado | Alcance demostrado |
|---|---|---|
| Reglas, servicios, contratos y arquitectura | **Aprobado** | 53 casos unitarios |
| Persistencia, concurrencia y API | **Aprobado** | 36 casos de integración en PostgreSQL temporal |
| Total Jest | **Aprobado** | **53 + 36 = 89**, siete suites; cero fallos u omitidas |
| Navegador | **Aprobado** | **21** casos adicionales; no se suman al total Jest |
| Cobertura de líneas | **Aprobado** | 362/364: **99,45 %** en backend/contratos; no incluye React |
| TypeScript, OpenAPI, compilación y CI del código de referencia | **Aprobado** | Revisión `79ee169`; OpenAPI 3.0.3 con 26 operaciones |
| Recorrido real con ADMIN y CLIENTE | **Aprobado** | Supabase real, pago simulado y cancelación al terminar |
| Pagos y mensajería externos | **Simulado** | Sin cargos, reembolsos bancarios ni envíos externos reales |
| k6 hasta 20 VUs | **Aprobado** | 973 solicitudes, 0 errores; p95 global 35,99 ms |
| k6 hasta 2.000 VUs | **No cumplido** | 92.701 solicitudes; 82,97 % de errores |
| Disponibilidad mensual de 99,9 % | **Pendiente de validación** | Sin observación prolongada de un alojamiento |
| Estudio con participantes / auditoría WCAG completa | **Pendiente de validación** | Las revisiones automatizadas no los sustituyen |

**Aprobado** significa que se observó el resultado esperado en el entorno indicado. **No cumplido** identifica una meta medida que falló. **Pendiente de validación** indica ausencia de evidencia suficiente. **Simulado** describe el proveedor utilizado: una prueba puede aprobar usando un proveedor simulado sin acreditar una integración externa real.

## Procedencia y revisión

La regresión Jest local comenzó el 27/11/2026 a las 10:07:48 de Lima; la de navegador, a las 10:10:33. Se produjeron al preparar la reorganización, antes de su commit. El código publicado `79ee1690b2c2bf675f49b36f7728480a9835b3c6` fue validado posteriormente por [GitHub Actions](https://github.com/MancillaLui/app-reservas-salas-ayacucho/actions/runs/46023685788), el mismo día. Los reportes locales no se atribuyen a esa ejecución remota.

El [informe de reorganización](../evidencias/organizacion/resumen.json) registra la regresión final; los [extractos de Jest](../evidencias/documentacion-final/pruebas-jest.json) y [navegador](../evidencias/documentacion-final/pruebas-navegador.json) conservan los casos observados y hashes de sus archivos de origen, sin rutas absolutas, stacks, credenciales ni sesiones. Los [metadatos de CI](../evidencias/documentacion-final/ci-referencia.json) identifican la revisión y pasos aprobados.

Los reportes iniciales con 86 pruebas, capturas anteriores y resultados de carga mantienen sus valores originales. Los números finales proceden de la revisión más reciente de cada tipo; no se presentan todas las mediciones como una sola corrida.

## Presentación para la exposición

[Descargar presentación del Sprint 2](../presentacion/ENSAYA-Sprint-2.pptx): 54 diapositivas con notas del expositor, arquitectura, tecnologías, funcionalidades, pruebas y resultados de calidad.

