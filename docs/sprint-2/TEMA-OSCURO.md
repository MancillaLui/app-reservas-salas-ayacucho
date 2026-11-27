# ENSAYA: estudio musical oscuro

La presentación pública, el acceso, el asistente de reserva y ambos paneles comparten un único tema oscuro. Se conservan las tipografías DM Sans y Space Grotesk, las ilustraciones musicales y la identidad azul/verde. No se añadió selector de tema.

| Uso | Color |
|---|---|
| Fondo | `#0B1020` |
| Tarjetas | `#141D32` |
| Superficie elevada | `#1C2942` |
| Bordes | `#344463` |
| Texto principal / secundario | `#F2F5FC` / `#B4C0D5` |
| Acción principal / enlaces | `#D5F76B` / `#91A7FF` |

## Componentes y accesibilidad

Las variables compartidas de `src/cliente/estilos/tema.css` definen fondos, texto, campos, estados y acciones. Tarjetas, tablas, filtros, calendario, menú móvil y modales usan esas variables. Los estados conservan su texto y añaden indicadores a confirmación, cancelación y errores; la selección también utiliza borde, fondo y atributos accesibles existentes.

Los controles nativos usan `color-scheme: dark`, el foco de teclado tiene contorno visible y los botones deshabilitados conservan texto legible. No se anima el color de fondo de los botones: al habilitar el pago, animar el fondo mientras el texto cambiaba inmediatamente generaba un intervalo de contraste insuficiente. Los horarios distribuyen sus campos según el espacio disponible para evitar truncar fecha y hora en tableta.

Swagger conserva esquema claro propio, incluidos controles de formulario, sin incorporar un selector global. No se modifican rutas, autorización, contratos REST, tablas ni reglas de negocio. No hay dependencias nuevas.

## Comprobación y procedencia

Las 15 pruebas de navegador anteriores se conservan y se añaden seis pruebas visuales: público/autenticación, panel cliente, panel administrador, modal/confirmación/vacío/error, carga/pago/vencimiento/cancelación y aislamiento de Swagger. Se revisan 1365, 768 y 390 píxeles, ausencia de desbordamiento horizontal y contraste de muestras de texto sobre sus fondos efectivos, con mínimo de 4,5:1.

El [informe de esta revisión](evidencias/tema-oscuro/resumen.json) contiene cantidades, procedencia, cobertura, hash de CSS y mínimo de contraste observado en las muestras de paneles. Las mediciones sRGB de estilos computados y composición de transparencias no constituyen una auditoría WCAG completa; no evalúan todos los píxeles de gradientes ni todas las posibles combinaciones de contenido.

Las nuevas pruebas visuales usan sesiones y API interceptadas con fixtures controlados. Las consultas públicas de los tests anteriores conservan su lectura del catálogo real. Las capturas nuevas muestran datos de prueba; no se hacen escrituras en Supabase. Las [evidencias reales anteriores](evidencias/recorrido-real/resumen.json) se mantienen íntegras y corresponden al diseño anterior.

## Capturas

- [Inicio escritorio](evidencias/tema-oscuro/inicio-1365.png), [tableta](evidencias/tema-oscuro/inicio-768.png) y [móvil](evidencias/tema-oscuro/inicio-390.png).
- [Cliente](evidencias/tema-oscuro/cliente-1365.png) y [administrador](evidencias/tema-oscuro/admin-1365.png).
- [Reserva móvil](evidencias/tema-oscuro/reserva-390.png), [modal](evidencias/tema-oscuro/modal-catalogo.png), [confirmación](evidencias/tema-oscuro/confirmacion-admin.png), [error](evidencias/tema-oscuro/error-sesion.png), [pago pendiente](evidencias/tema-oscuro/pago-pendiente.png) y [vencido](evidencias/tema-oscuro/pago-vencido.png).

Para reproducir: compilar con `npm run build`, servir en el puerto 3001, ejecutar `npm run test:browser` con `BASE_URL=http://127.0.0.1:3001`, ejecutar las pruebas backend con salida JSON `npm run test:verify -- --json --outputFile=test-results/jest-oscuro.json` y generar la selección de evidencia con `npx tsx scripts/entrega/evidencia-tema.ts`. El empaquetado sigue usando `npm run delivery:prepare`.

Pagos y mensajería siguen simulados. No se repitió la carga, no cambia el límite documentado de 2.000 VUs ni se acredita disponibilidad mensual.
