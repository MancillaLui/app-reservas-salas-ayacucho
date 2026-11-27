# 04. Navegador y usabilidad

## Objetivo, entorno y método

Comprobar recorridos, protección de pantallas, recuperación de selección y presentación adaptable. La última regresión registró **21 casos Aprobados**, cero fallos, omitidos o inestables, contra Next.js de producción en `localhost:3001`, con Chrome y un worker de Playwright. Comenzó el 27/11/2026 a las 10:10:33 de Lima y duró aproximadamente 54,8 segundos.

Fuentes: [extracto de casos](../evidencias/documentacion-final/pruebas-navegador.json), [resumen de la regresión](../evidencias/organizacion/resumen.json) y [configuración](../../../playwright.config.ts). Este documento no representa otra ejecución.

## Procedencia de los datos

| Grupo | Casos | Identidad y API | Qué demuestra |
|---|---:|---|---|
| Interfaces por rol | 12 | Sesiones y respuestas privadas interceptadas mediante fixtures | Navegación y comportamiento de UI con resultados controlados; sin escrituras en Supabase |
| Público y Swagger | 3 | Lecturas públicas de catálogo real y documentación servida por la aplicación | Integración pública básica, reserva previa al acceso, móvil y visor de API |
| Tema oscuro | 6 | Nuevas revisiones visuales con fixtures; Swagger consulta su especificación real | Presentación a tres anchos, contraste de muestras y estados |
| **Total** | **21** | No son 21 cuentas reales ni 21 pruebas Jest | Regresión de navegador |

Los tokens ficticios de fixtures solo se usan con interceptaciones; no se agregó una vía de acceso alternativa a producción. El [recorrido autenticado real](../evidencias/recorrido-real/resumen.json) es una evidencia separada, con cuentas confirmadas y sin interceptaciones.

## Casos observados

| ID | Caso observado | Archivo | Resultado |
|---|---|---|---|
| N01 | cliente tiene su espacio y no consulta endpoints administrativos | [interfaces.spec.ts](../../../tests/browser/interfaces.spec.ts) | Aprobado |
| N02 | sin sesión se redirige a ingresar sin cargar datos privados | [interfaces.spec.ts](../../../tests/browser/interfaces.spec.ts) | Aprobado |
| N03 | administrador tiene resumen y agenda con filtros | [interfaces.spec.ts](../../../tests/browser/interfaces.spec.ts) | Aprobado |
| N04 | catálogo convierte soles a céntimos y tiene formularios independientes | [interfaces.spec.ts](../../../tests/browser/interfaces.spec.ts) | Aprobado |
| N05 | bloqueos se crean y retiran desde su propio formulario | [interfaces.spec.ts](../../../tests/browser/interfaces.spec.ts) | Aprobado |
| N06 | selección sobrevive al acceso y el cliente completa pago | [interfaces.spec.ts](../../../tests/browser/interfaces.spec.ts) | Aprobado |
| N07 | cierre de sesión retira el panel y su acceso directo | [interfaces.spec.ts](../../../tests/browser/interfaces.spec.ts) | Aprobado |
| N08 | panel y menú administrativo se adaptan a móvil | [interfaces.spec.ts](../../../tests/browser/interfaces.spec.ts) | Aprobado |
| N09 | retorno externo se ignora al ingresar y se dirige por rol | [interfaces.spec.ts](../../../tests/browser/interfaces.spec.ts) | Aprobado |
| N10 | cliente cancela desde el detalle con confirmación y motivo | [interfaces.spec.ts](../../../tests/browser/interfaces.spec.ts) | Aprobado |
| N11 | pagos y comprobantes usan sus pantallas y contratos | [interfaces.spec.ts](../../../tests/browser/interfaces.spec.ts) | Aprobado |
| N12 | error al verificar sesión no carga ni muestra datos administrativos | [interfaces.spec.ts](../../../tests/browser/interfaces.spec.ts) | Aprobado |
| N13 | inicio musical y reserva pública conservada al ir a ingresar | [publico.spec.ts](../../../tests/browser/publico.spec.ts) | Aprobado |
| N14 | sitio y reserva móvil sin desbordamiento | [publico.spec.ts](../../../tests/browser/publico.spec.ts) | Aprobado |
| N15 | Swagger conserva las 26 operaciones | [publico.spec.ts](../../../tests/browser/publico.spec.ts) | Aprobado |
| N16 | tema oscuro: público y autenticación en escritorio, tableta y móvil | [tema-oscuro.spec.ts](../../../tests/browser/tema-oscuro.spec.ts) | Aprobado |
| N17 | tema oscuro: páginas de CLIENTE y contraste a tres anchos | [tema-oscuro.spec.ts](../../../tests/browser/tema-oscuro.spec.ts) | Aprobado |
| N18 | tema oscuro: páginas de ADMIN y contraste a tres anchos | [tema-oscuro.spec.ts](../../../tests/browser/tema-oscuro.spec.ts) | Aprobado |
| N19 | tema oscuro: modal, confirmación, vacío y error mantienen legibilidad | [tema-oscuro.spec.ts](../../../tests/browser/tema-oscuro.spec.ts) | Aprobado |
| N20 | tema oscuro: carga, pago pendiente, vencimiento y cancelación tienen estados legibles | [tema-oscuro.spec.ts](../../../tests/browser/tema-oscuro.spec.ts) | Aprobado |
| N21 | Swagger conserva esquema claro independiente del tema oscuro | [tema-oscuro.spec.ts](../../../tests/browser/tema-oscuro.spec.ts) | Aprobado |

## Resultados visuales y de interacción

**Aprobado** en las vistas inspeccionadas a **1365, 768 y 390 píxeles**: no se observó desbordamiento horizontal de la página. Las tablas pueden tener desplazamiento dentro de su contenedor. Se revisaron navegación móvil, formularios, campos de horario, modal, confirmación de desactivación, lista vacía, error de identidad, carga, pago pendiente/vencido y cancelación.

Las muestras comprobadas exigieron contraste mínimo 4,5:1. El [informe del tema](../evidencias/tema-oscuro/resumen.json) registra 414 muestras de paneles y mínimo 6,3488:1, redondeado a 6,35:1. Es una medición de estilos computados y composición de transparencias; no incluye todos los píxeles de gradientes ni todas las combinaciones de contenido. Las pruebas también comprueban foco visible y controles nativos oscuros; Swagger conserva esquema claro independiente.

Durante la mejora visual se detectó contraste transitorio insuficiente al habilitar pago y se retiró la animación de fondo que lo causaba. Se corrigieron campos de fecha/hora truncados en tableta. La regresión posterior pasó; no se ocultan estos hallazgos ni se presentan como fallos pendientes.

## Capturas y evidencia

- [Inicio móvil](../evidencias/tema-oscuro/inicio-390.png), [cliente](../evidencias/tema-oscuro/cliente-1365.png), [administrador](../evidencias/tema-oscuro/admin-1365.png) y [reserva en tableta](../evidencias/tema-oscuro/reserva-768.png).
- [Modal](../evidencias/tema-oscuro/modal-catalogo.png), [error](../evidencias/tema-oscuro/error-sesion.png), [pago pendiente](../evidencias/tema-oscuro/pago-pendiente.png) y [vencido](../evidencias/tema-oscuro/pago-vencido.png).

Estas capturas son del tema oscuro con datos controlados; se conservaron al reorganizar. Las [capturas reales anteriores](../evidencias/recorrido-real/resumen.json) corresponden al diseño previo y a otra ejecución. La reorganización repitió los 21 casos y conservó los mismos bytes de CSS, sin reemplazar las imágenes históricas ni atribuirles una nueva fecha.

## Reproducción

Con variables públicas y conexión local configuradas según [INICIO](../INICIO.md), ejecutar en terminales separadas:

```powershell
npm run build
npm run start -- --hostname 127.0.0.1 --port 3001
```

```powershell
$env:BASE_URL='http://127.0.0.1:3001'
npm run test:browser
```

La configuración usa Chrome instalado. Los resultados y capturas se generan en `test-results`, carpeta ignorada por Git. La presente documentación se elaboró leyendo resultados existentes; no se pidió al usuario volver a registrar cuentas ni repetir reservas.

## Limitaciones

**Pendiente de validación:** estudio con participantes, navegación con lectores de pantalla, auditoría WCAG completa, carga visual en redes 3G/4G y compatibilidad exhaustiva entre navegadores/dispositivos reales. Una ventana de 390 píxeles no acredita por sí sola todos los teléfonos. Las guardas visuales mejoran experiencia; la seguridad depende de los endpoints del servidor.
