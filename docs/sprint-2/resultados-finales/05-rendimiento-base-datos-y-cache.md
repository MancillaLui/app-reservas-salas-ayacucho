# 05. Rendimiento, base de datos y caché

## Objetivo, entorno y método

Contrastar consultas con la meta de tres segundos y observar comportamiento al aumentar carga. Se conservan las mediciones documentadas el **26/11/2026** en [VALIDACION](../VALIDACION.md) y el [resumen original](../evidencias/resumen.json). Usaron Next.js de producción y PostgreSQL 17 temporal en el mismo equipo Windows, con dos salas, tres equipos y un catálogo pequeño. No fueron pruebas sobre la instancia real de Supabase.

Las mediciones son ejecuciones separadas: benchmark HTTP de Node, k6 de 20 VUs y k6 hasta 2.000 VUs. No se repitieron para preparar estos documentos ni al aplicar el tema o reorganizar carpetas.

El [script k6](../../../tests/load/reservas.js) aumenta usuarios por escalones de 15 segundos y baja durante diez; consulta salas, equipos y disponibilidad. Exige p95 menor de 3.000 ms, errores HTTP inferiores al 1 % y checks superiores al 99 %. No mide carga de la página completa, logins ni escrituras concurrentes de reserva.

## Resultados observados

| Ejecución | Solicitudes | Errores | p95 observado | Evaluación |
|---|---:|---:|---|---|
| Node fetch: 20 clientes concurrentes | 200 | 0 | Disponibilidad: 261,75 ms; promedio 97,69 ms | **Aprobado** para este benchmark pequeño |
| k6 hasta 20 VUs | 973 | 0 % | Global: 35,99 ms; disponibilidad: 51,20 ms | **Aprobado** en el entorno medido |
| k6 hasta 2.000 VUs | 92.701 | **82,97 %** | Global: 1.510,92 ms; disponibilidad: 1.414,70 ms | **No cumplido**: errores/checks fuera del objetivo |

Fuentes: [benchmark dentro del resumen original](../evidencias/resumen.json), [k6 de 20 VUs](../evidencias/k6-20.json) y [k6 de 2.000 VUs](../evidencias/k6-2000.json).

Aunque el p95 agregado de la corrida extrema sea inferior a tres segundos, incluye solicitudes fallidas y respuestas rechazadas. Con 82,97 % de errores no demuestra una experiencia satisfactoria ni capacidad para 2.000 usuarios. VUs tampoco equivale automáticamente a 2.000 solicitudes simultáneas exitosas.

## Hallazgos y cambios realizados

La [corrida anterior a optimizar](../evidencias/k6-antes-optimizacion.json) mostró p95 agregado de 10.133,61 ms y 63,00 % de errores. Se investigaron saturación del pool y espera en la coordinación de disponibilidad. Se cambió disponibilidad a una lectura SQL de una sola instantánea, sin bloqueo de asignación ni expiración mediante escritura, y se limitó la cola del pool a cien esperas.

Después se repitieron pruebas funcionales y carga. El p95 agregado disminuyó, pero la tasa de errores extrema fue mayor. Por eso el resultado es **No cumplido**; no se presenta la optimización como solución definitiva. Los rechazos 503 controlan la cola, pero también cuentan como solicitudes fallidas para el usuario.

## Base de datos e integridad

La reserva usa transacción, coordinación por bloqueo asesor global y exclusión GiST por sala con intervalos `[inicio, fin)`. Los equipos se asignan considerando el pico de ocupación simultánea. La exclusión de sala también protege escrituras que omitan el servicio; el stock agregado de equipos exige seguir el protocolo de repositorio y no tiene una restricción equivalente en SQL.

Las [pruebas de integración](03-integracion-api-y-seguridad.md) respaldan estas garantías, no la corrida k6 pública. Existen claves foráneas e índices para accesos operativos. El [plan de consulta](../evidencias/plan-consulta.json) y el [análisis de arquitectura](../ARQUITECTURA.md) muestran el estudio de PostgreSQL. Un escaneo secuencial en un catálogo pequeño no basta para concluir que un índice falta o que toda la disponibilidad está optimizada para producción.

## Estrategia de caché

Solo el catálogo se conserva en memoria durante 30 segundos. Las modificaciones invalidan la caché del proceso; otros procesos pueden conservar su copia hasta el TTL. La disponibilidad y las tarifas/asignación al reservar consultan PostgreSQL. La caché no decide el stock transaccional.

Las tres pruebas unitarias verifican reutilización hasta el TTL, invalidación anticipada y que una carga antigua no repueble una caché invalidada. Integración comprueba invalidación por CRUD y protección de recursos comprometidos. La reorganización introdujo `CachePort` e inyección conservando el algoritmo, TTL y comportamiento.

## Reproducción y límites

Seguir [INICIO: carga progresiva](../INICIO.md) en un entorno de pruebas autorizado, comenzando por 20 VUs y conservando cada resumen antes de aumentar carga. El script sobrescribe su salida local, por lo que hay que archivar cada ejecución con fecha y entorno. No lanzar 2.000 VUs sobre la base de operación para mostrar esta documentación.

**Pendiente de validación:** capacidad en alojamiento representativo, datos de volumen real, generador de carga separado, operaciones autenticadas de escritura bajo carga y medición sostenida. La aplicación y el generador compartían equipo; no se atribuye todo el límite a un único componente. Las mejoras futuras deberán medirse de nuevo manteniendo las garantías de concurrencia.
