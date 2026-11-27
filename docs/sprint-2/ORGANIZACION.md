# Organización del repositorio ENSAYA

La rama `codex/organizacion-proyecto` propone esta reorganización hacia `codex/sprint-2-entrega`. Conserva Next.js, monolito modular, módulos de negocio, URLs y contratos REST. No se ejecutaron migraciones, seed ni demostraciones que escriban en Supabase.

## Estructura y equivalencias

| Antes | Ahora |
|---|---|
| Carpetas numeradas en la raíz | `docs/arquitectura/01-analisis-de-sistema`, `02-arquitectura-software`, `03-diseño-de-software`, `04-modelo-c4` |
| `src/presentacion` | `src/cliente/presentacion` |
| `src/app/cliente.ts` | `src/cliente/infraestructura/supabase.ts` |
| `src/app/tema.css` | `src/cliente/estilos/tema.css` |
| `src/app/docs/swagger.tsx` | `src/cliente/presentacion/documentacion/swagger.tsx` |
| `src/modulos` | `src/servidor/modulos` |
| `src/composicion.ts` | `src/servidor/composicion.ts` |
| `src/openapi.ts` | `src/servidor/documentacion/openapi.ts` |
| `src/shared/tipos.ts` | `src/compartido/contratos/tipos.ts` |
| `src/shared/errores.ts`, `intervalo.ts` | `src/compartido/dominio` |
| `src/shared/database.ts`, `ocupacion.ts` | `src/servidor/infraestructura/persistencia` |
| `src/shared/cache.ts` | `src/servidor/infraestructura/cache/cache.ts` |
| `src/shared/worker.ts` | `src/servidor/infraestructura/tareas/worker.ts` |
| Guía de exposición de la raíz | [Índice de exposición](GUIA_DE_EXPOSICION_DEL_PROYECTO.md), junto al [guion](EXPOSICION.md) |

`src/app` conserva páginas, layouts y adaptadores de Next.js. `cliente` reúne código de navegador, incluidas las pantallas del administrador; `servidor`, backend y adaptadores; `compartido`, contratos y funciones puras sin SDK, SQL ni framework. El alias `@/` sigue apuntando a `src`.

Los módulos conservan sus capas existentes. La composición crea implementaciones y conecta contratos. El worker y la coordinación SQL se ubican en infraestructura porque acceden a PostgreSQL. Se mantiene la excepción transaccional documentada para asignar sala y equipos.

Las tres hojas antiguas sin imports se eliminaron. El tema oscuro y OpenAPI mantienen exactamente los mismos bytes. Configuraciones de Next.js, TypeScript, Jest y Playwright permanecen en la raíz. Las carpetas generadas siguen ignoradas; no se eliminan bases, credenciales ni temporales del usuario.

## Scripts y documentación

| Grupo | Herramientas |
|---|---|
| `scripts/base-datos` | Migración y seed |
| `scripts/validacion` | PostgreSQL temporal, OpenAPI y verificación de estructura |
| `scripts/demostracion` | Demostración administrativa, cuentas y preview aislado |
| `scripts/operacion` | Entrada del worker |
| `scripts/entrega` | Empaquetado y generadores de evidencias |

Los comandos npm conservan sus nombres y se ejecutan desde la raíz. El empaquetador calcula la raíz desde su nueva ubicación. Las migraciones continúan en `supabase/migrations`, con sus mismos nombres y checksums.

Los generadores nuevos guardan resultados en `docs/sprint-2/evidencias/ejecuciones/<fecha>/<tipo>`. El generador general escribe su informe en la ejecución y no sustituye `VALIDACION.md`. La demostración administrativa conserva su guardia de ejecución previa. Las evidencias anteriores y el archivo del Sprint 1 permanecen íntegros: sus rutas y hashes describen la ejecución original, no la organización actual.

## Caché y límites de dependencia

Catálogo recibía un repositorio y creaba directamente su caché. Al ubicar esta última en infraestructura, se introdujo `CachePort` en el dominio de Catálogo y se inyectan las dos cachés desde la composición. Se conserva el algoritmo original, TTL de 30 segundos e invalidación por tipo. El constructor interno recibe explícitamente las dependencias; no cambia ninguna interfaz HTTP ni tipo intercambiado con el navegador.

Las pruebas de arquitectura resuelven rutas relativas, aliases y dependencias transitivas. Comprueban dominio/aplicación sin infraestructura ni SDK, navegador sin servidor/PostgreSQL/Node y contratos compartidos independientes.

## Validación y conservación

`npm run repo:validate` comprueba enlaces locales vigentes, ausencia de carpetas antiguas y 63 hashes previos del archivo histórico, evidencias, migración, CSS y OpenAPI. La línea base identifica el commit de origen. Una modificación futura deliberada de CSS/OpenAPI exige revisar esa línea base, conservando los informes históricos originales.

Para archivos con CRLF en Windows y LF en Git, la línea base conserva ambos SHA originales. CI admite el hash del blob Git verificado, sin normalizar ni modificar los archivos históricos del espacio de trabajo.

Se mantienen las 86 pruebas previas y se agregan tres de arquitectura: 89 aprobadas. Las 21 pruebas de navegador y compilación también pasaron. El [informe de la revisión](evidencias/organizacion/resumen.json) registra los resultados y su procedencia.

La cobertura conserva su alcance sobre módulos, infraestructura transversal, dominio compartido, API y OpenAPI. Composición, SDK de navegador y React siguen fuera. Líneas: 362/364, 99,45 %; antes 364/366. Las dos líneas ejecutables retiradas corresponden a la importación e inicialización directa de caché en el servicio. Sentencias: 463/471, antes 464/472. Funciones y ramas conservan sus denominadores. No se excluyeron archivos para mantener el porcentaje.

No se modifican reglas, permisos, tablas ni proveedores simulados. No se repitió carga y se conservan sus limitaciones documentadas.
