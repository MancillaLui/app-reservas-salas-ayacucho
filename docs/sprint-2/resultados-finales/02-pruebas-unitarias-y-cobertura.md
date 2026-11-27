# 02. Pruebas unitarias y cobertura

## Objetivo, entorno y método

Validar reglas, coordinación de servicios, contratos de entrada, identidad, caché y límites arquitectónicos de manera determinista. La regresión comenzó el 27/11/2026 a las 10:07:48 de Lima, con Jest sobre Windows. Este documento reproduce los resultados existentes; no corresponde a una ejecución nueva.

Las 53 pruebas unitarias no necesitan una conexión real a Supabase. Los repositorios y proveedores de los servicios se controlan en pruebas; el SDK Auth se sustituye en los casos del adaptador. Los casos de arquitectura inspeccionan dependencias reales del código. Son distintos de las 36 pruebas con PostgreSQL del [documento 03](03-integracion-api-y-seguridad.md).

## Resumen por archivo

| Grupo | Casos aprobados | Qué verifica |
|---|---:|---|
| Reglas | 29 | Intervalos, cantidades, importes, propiedad, cancelación y vencimiento |
| Servicios | 11 | Orquestación de reserva, pago, comprobante, identidad y catálogo |
| Schemas | 4 | Entradas rechazadas y escenarios permitidos |
| Identidad | 2 | Rol controlado por servidor y rechazo del token por el SDK controlado |
| Caché | 3 | TTL, invalidación y carga antigua que no debe repoblar |
| Arquitectura | 4 | Dependencias de capas, navegador, compartido y resolución de aliases |
| **Total unitario** | **53** | **Aprobado** |

Un caso negativo aprobado significa que el sistema rechazó la entrada o acceso que debía rechazar. No significa que la funcionalidad falló. Las pruebas parametrizadas aparecen como casos separados en Jest.

## Casos observados

Los nombres y estados siguientes se extraen del [reporte sanitizado](../evidencias/documentacion-final/pruebas-jest.json). Los IDs U permiten relacionarlos con la evidencia; no son nuevos requisitos.

### reglas.test.ts

[Fuente ejecutable](../../../tests/unit/reglas.test.ts). Resultado: **29 Aprobadas**.

| ID | Caso observado | Resultado |
|---|---|---|
| U01 | valida intervalos futuros con desplazamiento explícito | Aprobado |
| U02 | rechaza intervalo inválido fecha inválida / 2026-12-01T19:30:00-05:00 | Aprobado |
| U03 | rechaza intervalo inválido 2026-12-01T18:00:00 / 2026-12-01T19:30:00-05:00 | Aprobado |
| U04 | rechaza intervalo inválido 2026-12-01T18:00:00-05:00 / 2026-12-01T18:00:00-05:00 | Aprobado |
| U05 | rechaza intervalo inválido 2026-12-01T19:30:00-05:00 / 2026-12-01T18:00:00-05:00 | Aprobado |
| U06 | rechaza intervalo inválido 2026-11-25T18:00:00-05:00 / 2026-12-01T19:30:00-05:00 | Aprobado |
| U07 | rechaza intervalo inválido 2026-12-01T18:00:00-05:00 / 2026-12-03T18:00:00-05:00 | Aprobado |
| U08 | calcula 90 minutos y extras por ensayo en céntimos | Aprobado |
| U09 | redondea una duración fraccionaria a céntimos | Aprobado |
| U10 | rechaza total no positivo | Aprobado |
| U11 | permite reservas sin equipos | Aprobado |
| U12 | rechaza cantidad 0 | Aprobado |
| U13 | rechaza cantidad -1 | Aprobado |
| U14 | rechaza cantidad 1.5 | Aprobado |
| U15 | rechaza cantidad NaN | Aprobado |
| U16 | rechaza equipos duplicados | Aprobado |
| U17 | el propietario puede ver su reserva | Aprobado |
| U18 | no permite ver reservas ajenas | Aprobado |
| U19 | administrador puede consultar reservas de cualquier cliente | Aprobado |
| U20 | cliente puede cancelar antes del inicio | Aprobado |
| U21 | cliente no puede cancelar después del inicio | Aprobado |
| U22 | administrador puede cancelar por fuerza mayor después del inicio | Aprobado |
| U23 | no cancela estado CANCELADA | Aprobado |
| U24 | no cancela estado EXPIRADA | Aprobado |
| U25 | no cancela estado PROCESANDO | Aprobado |
| U26 | no cancela un bloqueo por el flujo de reservas | Aprobado |
| U27 | permite pagar una reserva vigente | Aprobado |
| U28 | no paga al alcanzar exactamente el vencimiento | Aprobado |
| U29 | no paga una reserva confirmada | Aprobado |

### servicios.test.ts

[Fuente ejecutable](../../../tests/unit/servicios.test.ts). Resultado: **11 Aprobadas**.

| ID | Caso observado | Resultado |
|---|---|---|
| U30 | crea una reserva con entrada válida | Aprobado |
| U31 | consulta propiedad antes de devolver el detalle | Aprobado |
| U32 | pago aprobado confirma y programa un comprobante | Aprobado |
| U33 | pago rechazado cancela y no envía confirmación | Aprobado |
| U34 | resultado incierto conserva recursos y no confirma | Aprobado |
| U35 | repetir un pago terminado no vuelve a cobrar | Aprobado |
| U36 | fallo al configurar envío no revierte confirmación persistida | Aprobado |
| U37 | usuarios rechaza solicitudes sin Bearer | Aprobado |
| U38 | usuarios delega verificación del token al proveedor | Aprobado |
| U39 | catálogo filtra categorías y oculta inactivos | Aprobado |
| U40 | catálogo niega mutaciones al cliente | Aprobado |

### schemas.test.ts

[Fuente ejecutable](../../../tests/unit/schemas.test.ts). Resultado: **4 Aprobadas**.

| ID | Caso observado | Resultado |
|---|---|---|
| U41 | la entrada no acepta precios ni clienteId del navegador | Aprobado |
| U42 | rechaza equipos con cantidades fraccionarias | Aprobado |
| U43 | rechaza precios no enteros en catálogo | Aprobado |
| U44 | pago solo acepta escenarios explícitos del simulador | Aprobado |

### identidad.test.ts

[Fuente ejecutable](../../../tests/unit/identidad.test.ts). Resultado: **2 Aprobadas**.

| ID | Caso observado | Resultado |
|---|---|---|
| U45 | ignora rol de user_metadata y consulta rol controlado por el servidor | Aprobado |
| U46 | un token rechazado por Supabase no accede a los perfiles | Aprobado |

### cache.test.ts

[Fuente ejecutable](../../../tests/unit/cache.test.ts). Resultado: **3 Aprobadas**.

| ID | Caso observado | Resultado |
|---|---|---|
| U47 | reutiliza catálogo hasta el TTL y recarga después | Aprobado |
| U48 | invalidación recarga antes del TTL | Aprobado |
| U49 | una carga antigua no repuebla una caché invalidada | Aprobado |

### arquitectura.test.ts

[Fuente ejecutable](../../../tests/unit/arquitectura.test.ts). Resultado: **4 Aprobadas**.

| ID | Caso observado | Resultado |
|---|---|---|
| U50 | dominio y aplicación no importan infraestructura, framework ni SDK | Aprobado |
| U51 | el navegador no importa servidor, PostgreSQL ni APIs exclusivas de Node | Aprobado |
| U52 | contratos y dominio compartidos son independientes de SDK, framework y servidor | Aprobado |
| U53 | la comprobación de límites resuelve aliases y rutas relativas al mismo archivo | Aprobado |


## Cobertura del backend y contratos

La cobertura se obtuvo durante la corrida conjunta de las **89 pruebas Jest**, no únicamente de las 53 unitarias. Los componentes React, el SDK de navegador y la composición no están incluidos.

| Métrica | Cubierto / total | Resultado | Umbral configurado |
|---|---:|---:|---:|
| Líneas | 362 / 364 | **99,45 %** | 85 % |
| Sentencias | 463 / 471 | **98,30 %** | 85 % |
| Funciones | 107 / 109 | **98,16 %** | 80 % |
| Ramas | 207 / 226 | **91,59 %** | 70 % |

**Aprobado** para los umbrales configurados. El alcance conserva módulos, infraestructura transversal, dominio compartido, API y OpenAPI. Las dos líneas retiradas al inyectar caché explican el cambio de 364/366 a 362/364; las sentencias pasan de 464/472 a 463/471. No se excluyeron archivos para sostener el porcentaje. Los denominadores de funciones y ramas se conservan. Las cifras anteriores se mantienen en sus informes originales.

## Reproducción y evidencia

Desde la raíz, `npm test` ejecuta las suites unitarias. Para regenerar la cobertura completa, usar `npm run test:verify`: prepara PostgreSQL temporal para las suites unitarias y de integración. No configurar una base de operación como `TEST_DATABASE_URL`.

El HTML regenerable está en `coverage/complete/lcov-report/index.html`, incluido en el ZIP cuando existe, y la cobertura remota se conserva como artefacto de Actions. No se enlaza ese archivo ignorado como si estuviera versionado en GitHub. Las fuentes versionadas son [configuración de Jest](../../../jest.config.cjs), [configuración completa](../../../jest.all.config.cjs), [extracto de casos](../evidencias/documentacion-final/pruebas-jest.json) e [informe de cobertura y regresión](../evidencias/organizacion/resumen.json).

Para guardar un nuevo reporte local con el nombre que espera el extractor, ejecutar `npm run test:verify -- --json --outputFile=test-results/jest-organizacion.json`. El reporte de navegador se obtiene con el procedimiento del documento 04. Después, `python scripts/entrega/extraer-pruebas.py` toma ambos reportes, valida sus totales y exporta solo campos permitidos, sin ejecutar pruebas. El extractor está ligado a este corte de 89/21 casos; un corte futuro con cantidades diferentes requiere actualizar la documentación y su validación explícitamente.

## Limitaciones

La cobertura indica código ejecutado, no corrección absoluta ni ausencia de vulnerabilidades. Los mocks de identidad no demuestran por sí solos validación criptográfica real; la evidencia complementaria de sesión real se documenta aparte. Las pruebas de arquitectura detectan imports resueltos en los casos inspeccionados, no sustituyen revisión de diseño o de dependencias dinámicas construidas en tiempo de ejecución.
