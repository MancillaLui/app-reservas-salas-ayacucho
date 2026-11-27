# Interfaz intuitiva: integración del prototipo aprobado

Corte: 27 de noviembre de 2026, America/Lima. Esta actualización posterior conserva los resultados históricos del Sprint 2 y añade evidencias de la adaptación del prototipo al frontend real.

## Cambios implementados

- Navegación por tareas: Inicio, Reservas, Salas y equipos, Horarios no disponibles, Pagos, Comprobantes y Ayuda para administración. Inicio, Mis reservas, Reservar sala y Ayuda para músico.
- Azul para acciones principales, lima para navegación seleccionada, colores de estado acompañados de indicadores y texto. Se conservan tipografías e ilustraciones musicales.
- Inicio del músico con acceso al pago pendiente y reserva destacada. Reserva en cinco pasos, equipos opcionales con botón para omitir y resumen desplegable en móvil.
- Mis reservas separa Próximas, Pendientes de pago e Historial. El historial incluye reservas finalizadas, canceladas y expiradas. Los filtros actúan dentro de la pestaña elegida.
- Administración alterna Agenda diaria y Listado. La agenda presenta reservas activas por sala en la fecha seleccionada; los bloqueos manuales conservan su pantalla propia. No se afirma disponibilidad completa a partir de la agenda.
- Pagos separa resultados por pestañas y permite consultar reembolsos pendientes. Comprobantes permite consultar pendientes, en proceso, enviados y fallidos, conservando el detalle persistido, mostrado con etiquetas legibles en lugar de JSON.
- Ayudas dedicadas en `/cliente/ayuda` y `/admin/ayuda`, bajo los layouts protegidos existentes. El selector libre de roles permanece exclusivamente en el prototipo.
- En teléfono: accesos inferiores para músico, menú administrativo, tarjetas para reservas y resumen desplegable. Las tablas administrativas restantes conservan desplazamiento interno.

## Arquitectura y límites

Cambios en presentación: rutas, navegación, componentes y estilos. No se modificaron contratos REST, tablas, identidad, permisos, tarifas, transacciones ni proveedores simulados. Las pantallas siguen consumiendo la API y las operaciones siguen validadas en servidor. Los indicadores se calculan sobre un máximo de 200 registros, no sobre totales globales del negocio.

La agenda es una organización visual de las reservas devueltas, incluyendo los intervalos que cruzan medianoche; la disponibilidad definitiva se consulta y asigna en PostgreSQL. La autorización no depende de pestañas ni botones. No se incorporaron controles ficticios de vencimiento o de envío a la aplicación real.

## Resultados y procedencia

| Comprobación | Resultado | Procedencia |
|---|---|---|
| TypeScript y compilación | Aprobado | Compilación de producción de Next.js |
| Jest | 89 aprobadas: 53 unitarias y 36 de integración | PostgreSQL temporal aislado |
| Cobertura | Líneas 99,45 %, sentencias 98,30 %, funciones 98,16 %, ramas 91,59 % | Mismo alcance de backend; React excluido |
| Navegador | 25 aprobadas | 21 anteriores adaptadas a los textos nuevos y 4 nuevas |
| Móvil y contraste | Aprobado en los escenarios revisados | 1365, 768 y 390 px; muestras con umbral 4,5:1 |
| Acceso con cuentas reales | Confirmado por el usuario | Músico y administrador: reservas y ayuda; comprobación manual |

Las nuevas pruebas verifican pestañas e instrucciones del músico, agenda/listado, pestañas administrativas y tarjetas/navegación/resumen móvil. Los escenarios anteriores conservan reserva, pago, cancelación, permisos, catálogo, bloqueos y comprobantes.

[Resumen verificable y casos](evidencias/interfaz-intuitiva/resumen.json), [contraste del cliente](evidencias/interfaz-intuitiva/contraste-cliente.json) y [contraste administrativo](evidencias/interfaz-intuitiva/contraste-admin.json).

La automatización de la sesión real del navegador no pudo iniciarse por un fallo del entorno. La confirmación manual del usuario se distingue de las pruebas con fixtures y no se presenta como repetición completa del recorrido de reserva sobre Supabase. Se mantienen las evidencias reales anteriores como historial.

## Capturas de la aplicación actualizada

Todas las capturas siguientes usan fixtures controlados. No contienen sesiones reales ni son imágenes del prototipo estático.

- [Cliente en escritorio](evidencias/interfaz-intuitiva/cliente.png) y [cliente móvil](evidencias/interfaz-intuitiva/cliente-movil.png).
- [Administrador en escritorio](evidencias/interfaz-intuitiva/administrador.png) y [administrador móvil](evidencias/interfaz-intuitiva/administrador-movil.png).
- [Reserva en escritorio](evidencias/interfaz-intuitiva/reserva.png) y [reserva móvil](evidencias/interfaz-intuitiva/reserva-movil.png).

## Reproducción y demostración

Con el entorno configurado según [INICIO](INICIO.md), ejecutar `npm run build` y `npm run start`. El worker continúa usando `npm run worker` en otra terminal.

1. Ingresar como músico; consultar pendientes, crear una reserva, omitir o añadir equipos y revisar el resumen.
2. Abrir Mis reservas, alternar pestañas y consultar el detalle; completar pago o cancelar según el estado.
3. Abrir Ayuda y consultar precio, vencimiento y cancelación.
4. Ingresar como administrador; alternar Agenda diaria y Listado. Elegir una fecha con reservas para demostrar la agenda.
5. Revisar catálogo, horarios no disponibles, pestañas de pagos y comprobantes. Mostrar el límite de 200 registros.
6. Revisar menú y tarjetas a 390 px.

Comandos de verificación: `npm run typecheck`, `npm run test:verify`, `npm run api:validate`, `npm run build`. Para navegador, servir la compilación, definir `BASE_URL` y ejecutar `npm run test:browser` con Chrome instalado. Las pruebas privadas interceptan la API y la identidad; no escriben sobre Supabase.

## Entrega

Se regenera `output/entrega-sprint-2.zip` mediante `npm run delivery:prepare`, con manifiesto e integridad comprobada. El ZIP es local e ignorado por Git; el código, las pruebas y las evidencias se publican en GitHub. La presentación académica anterior se conserva como corte histórico; esta guía documenta las pantallas y el total actualizado de navegador.

Pagos y mensajería continúan simulados. No se repitieron pruebas de carga ni mediciones de disponibilidad: la meta de 2.000 VUs sigue no cumplida y el 99,9 % sigue pendiente de observación prolongada. La revisión visual no equivale a auditoría WCAG completa ni estudio con participantes.
