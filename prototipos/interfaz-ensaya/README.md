# ENSAYA: prototipo navegable de interfaz

Propuesta en revisión en `codex/prototipo-interfaz`. **No está integrada en `main` ni sustituye la interfaz actual.** Las pantallas utilizan exclusivamente datos ficticios y almacenamiento de sesión del navegador. No se conecta a Supabase, API, correo ni pasarelas de pago.

## Cómo abrirlo

Desde la raíz del repositorio, con Node.js 22 o superior:

```bash
npm run prototipo
```

Abre <http://127.0.0.1:4173>. Mantén esa terminal abierta; `Ctrl+C` detiene el servidor. No es necesario instalar dependencias para servir el prototipo. Las fuentes están incluidas localmente con sus licencias. Para otro puerto, define `PROTOTIPO_PORT` antes de ejecutar el comando.

En la barra superior selecciona **Músico** o **Administrador**. No requiere iniciar sesión. **Restablecer demostración** recupera los ejemplos y elimina solo los cambios ficticios de esta pestaña. Recargar conserva datos y selección; el estado de filtros y pestañas se reinicia al entrar de nuevo a una pantalla. Cerrar la sesión de navegador puede eliminar esos datos.

## Qué cambió en la propuesta

| Área | Propuesta |
|---|---|
| Jerarquía | Una acción principal por sección, títulos directos y ayuda junto a los campos |
| Color | Azul para acciones, lima para selección de navegación, estados con texto e icono |
| Músico | Inicio, reserva guiada en cinco pasos, reservas por pestañas, detalle y ayuda |
| Administrador | Inicio operativo, agenda/listado, catálogo, bloqueos, pagos, comprobantes y ayuda |
| Móvil | Navegación inferior del músico, menú administrativo, resumen desplegable y tarjetas de reservas |
| Interacción | Formularios, filtros, confirmaciones, conservación de selección y anuncios accesibles |

## Recorrido de revisión: músico

1. En **Inicio**, identifica el próximo ensayo y la reserva pendiente. Pulsa **Reservar una sala**.
2. Conserva mañana de **18:00 a 19:00**, en hora de Lima. Prueba una hora de fin anterior al inicio para ver el error.
3. Verifica que **Sala Wari** aparece ocupada y **Sala Huamanga** disponible. Huamanga cuesta S/45 por hora.
4. Añade un micrófono de S/10 por ensayo: el total para una hora será **S/55**. Vuelve atrás y verifica que se conserva la selección. También puedes omitir equipos.
5. Revisa el resumen y pulsa **Reservar y continuar al pago**. El horario queda protegido diez minutos.
6. Elige el resultado del simulador: aprobación, rechazo o incierto. No se solicita tarjeta. **Simular vencimiento** permite ver la liberación del horario sin esperar diez minutos.
7. Tras aprobar, abre el detalle. Cancela con motivo y comprueba que se libera la reserva. El pago aparecerá como reembolso pendiente en administración.
8. Explora **Mis reservas → Próximas / Pendientes de pago / Historial** y **Ayuda**.

## Recorrido de revisión: administrador

1. Cambia el selector superior a **Administrador**. Los indicadores de Inicio se calculan sobre los datos de demostración.
2. Abre **Reservas**, alterna **Agenda diaria** y **Listado**, cambia fecha/sala/estado y aplica los filtros. **Limpiar** permite consultar todo el listado; la agenda sigue mostrando un solo día. Mañana hay varios ejemplos.
3. Desde un detalle puedes cancelar con motivo. El prototipo conserva por separado el estado del pago y el reembolso pendiente.
4. En **Salas y equipos**, alterna las pestañas. Crea un equipo, busca su nombre, edita precio y stock, desactívalo y vuelve a activarlo. Una sala con reserva futura no se puede desactivar.
5. En **Horarios no disponibles**, intenta bloquear Sala Wari mañana de 18:00 a 19:00: se rechaza por cruce. Prueba Sala Huamanga de 10:00 a 11:00 y luego desbloquea con confirmación.
6. En **Pagos → Por conciliar**, abre un resultado incierto y simula aprobación o rechazo. Aprobar confirma; rechazar libera. No se ejecutan transferencias ni reembolsos reales.
7. En **Comprobantes**, consulta pendientes, enviados y fallidos. El detalle pendiente permite simular un envío correcto. Un envío fallido no cancela la reserva.
8. Revisa **Ayuda**. En móvil, abre **Menú** para acceder a las tareas administrativas.

## Validación y evidencias

```bash
# Requiere las dependencias de desarrollo instaladas y Google Chrome disponible.
npm run prototipo:validar
```

El comprobador usa Playwright del proyecto, arranca su propio servidor en `127.0.0.1:4187` y lo detiene al terminar. No modifica las cuentas ni los datos de la aplicación real. `PROTOTIPO_TEST_PORT` permite otro puerto. Regenera capturas y [resultados JSON](evidencias/resultados.json).

**18 escenarios automatizados aprobados**, separados de Jest y de las 21 pruebas históricas del Sprint 2. Incluyen recorridos por ambos roles, rechazo y vencimiento, conciliación, filtros, catálogo, bloqueos, envíos, conservación de sesión, menú móvil, foco de diálogo y ausencia de errores JavaScript o peticiones externas.

Se revisan 33 combinaciones de rol/pantalla/ancho a **1365, 768 y 390 px**, sin desbordamiento horizontal del documento. Las tablas administrativas de catálogo/pagos/comprobantes permiten desplazamiento dentro de su contenedor; las reservas se convierten en tarjetas en el teléfono. Se comprueba el contraste de textos seleccionados contra fondos sólidos: mínimo 4,5:1. Las cifras exactas y el alcance de las muestras están en el JSON.

| Pantalla | Escritorio | Móvil |
|---|---|---|
| Inicio músico | [1365 px](evidencias/musico-inicio-1365.png) | [390 px](evidencias/musico-inicio-390.png) |
| Inicio administrador | [1365 px](evidencias/admin-inicio-1365.png) | [390 px](evidencias/admin-inicio-390.png) |
| Reserva: horario | [1365 px](evidencias/musico-reservar-1365.png) | [390 px](evidencias/musico-reservar-390.png) |
| Mis reservas | [1365 px](evidencias/musico-reservas-1365.png) | [390 px](evidencias/musico-reservas-390.png) |
| Agenda administrativa | [1365 px](evidencias/admin-reservas-1365.png) | [390 px](evidencias/admin-reservas-390.png) |

Otros pasos: [sala](evidencias/reserva-sala-1365.png), [revisión](evidencias/reserva-revision-1365.png) y [pago](evidencias/reserva-pago-1365.png). Las capturas de 768 px también están en `evidencias/`.

## Límites y siguiente decisión

- Este prototipo valida interacciones de presentación con fixtures; no acredita permisos, autenticación, transacciones, concurrencia, capacidad ni disponibilidad del backend.
- Las fechas iniciales se generan alrededor del día de apertura en Lima. Los temporizadores son reales dentro de la sesión; puedes restablecer los ejemplos si vencen.
- El cambio de rol es una herramienta del prototipo y no se trasladará como selector de permisos a la aplicación real.
- Los datos se guardan en `sessionStorage` con la clave `ensaya-prototipo-v1`. No hay información personal real. El servidor solo expone una lista de archivos estáticos y escucha en localhost.
- La comprobación de contraste y teclado no constituye una auditoría WCAG completa ni un estudio con músicos o administradores reales.
- La ilustración procede de `ArteMusical` del frontend actual, adaptada a HTML/CSS. Se mantienen DM Sans y Space Grotesk; sus archivos y licencias OFL están en `fuentes/`.

La siguiente decisión es revisar navegación, lenguaje, color y recorrido. Tras aprobar el prototipo, se podrán trasladar los componentes de presentación a Next.js conservando los contratos y las reglas del servidor.
