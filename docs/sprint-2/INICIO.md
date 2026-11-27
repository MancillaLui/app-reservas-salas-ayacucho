# Ejecutar el Sprint 2

La aplicación usa Node.js 22 o superior, Next.js, PostgreSQL de Supabase y Supabase Auth. Pagos y mensajería son simulados y no requieren cuentas financieras. No hay contraseñas de demostración ni una vía de acceso que omita la autenticación.

## Configuración de Supabase

1. Crea un proyecto de Supabase. En **Connect**, copia la conexión del **session pooler**, puerto 5432. Codifica los caracteres especiales de la contraseña en la URL.
2. Copia `.env.example` a `.env.local`. Completa `DATABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` con la URL y clave pública de tu proyecto. Mantén `DATABASE_SSL=require` para Supabase. Si tu conexión exige un certificado CA adicional, configura `NODE_EXTRA_CA_CERTS` con ese certificado; no desactives su validación.

   El repositorio incluye el certificado público Supabase Root 2021 CA en `certs/supabase-prod-ca-2021.crt`. Define `DATABASE_SSL_CA_FILE=certs/supabase-prod-ca-2021.crt` para que la aplicación, migraciones y worker verifiquen la cadena TLS y el hostname sin desactivar la validación. También puedes descargar el certificado correspondiente desde Database Settings → SSL Configuration de tu proyecto, según la [documentación oficial](https://supabase.com/docs/guides/platform/ssl-enforcement).
3. En Authentication, habilita Email. Registra dos cuentas con la interfaz. Si la confirmación de correo está activa, confirma ambas antes de iniciar sesión. También puedes crear usuarios confirmados desde el panel de Supabase para la exposición.
4. Instala, migra y carga los recursos de demostración:

```powershell
npm ci
npm run db:migrate
npm run db:seed
npm run dev
```

5. Abre [la aplicación local](http://localhost:3000). Inicia sesión una vez con cada cuenta para crear su perfil de negocio. Luego, en SQL Editor de Supabase, asigna el administrador por correo:

```sql
UPDATE public.perfiles SET rol='ADMIN' WHERE email='TU_CORREO_ADMIN';
```

El rol se consulta desde la base de datos en cada solicitud autenticada; no se obtiene de campos editables del usuario. Una cuenta nueva siempre recibe CLIENTE. La conexión de servidor debe tener permisos para operar las tablas: la conexión `postgres` del pooler cumple esa condición.

6. En una segunda terminal ejecuta el worker y mantenlo activo:

```powershell
npm run worker
```

El worker expira pendientes y procesa comprobantes cada 15 segundos. Las operaciones de asignación limpian los pendientes vencidos; las consultas de calendario y disponibilidad los excluyen directamente sin modificar datos ni adquirir el bloqueo de escritura. La aplicación usa HTTP en localhost; HTTPS debe configurarse en el alojamiento cuando se publique.

## Comprobaciones reproducibles

```powershell
npm run typecheck
npm run api:validate
npm run test:coverage
npm run test:verify
npm run build
npm start
```

`test:verify` inicia PostgreSQL 17 temporal en loopback y un puerto libre, crea `sprint2_test`, ejecuta las pruebas unitarias y de integración y detiene el motor. Los archivos temporales quedan en `tmp/postgres`, ignorados por Git. En Linux debe ejecutarse con un usuario sin privilegios de root. No necesita Docker ni credenciales de Supabase.

Los informes están en `coverage/complete/lcov-report/index.html`, `coverage/complete/lcov.info` y `coverage/complete/coverage-summary.json`. El comando falla si la cobertura global queda por debajo de los umbrales configurados. La cobertura comprende backend, contratos HTTP y OpenAPI; no incluye componentes React.

Para una base PostgreSQL desechable existente, configura `TEST_DATABASE_URL` y `TEST_DATABASE_SSL` y ejecuta `npm run test:integration -- --coverage`. **El nombre debe terminar en `_test`; las pruebas vacían las tablas de negocio de esa base. Nunca uses la base de operación.** En GitHub Actions se utiliza un servicio PostgreSQL 17 independiente.

Para ese comando de Jest directo, establece las variables en la terminal (`$env:TEST_DATABASE_URL='postgresql://.../sprint2_test'` y `$env:TEST_DATABASE_SSL='disable'` en PowerShell). No se cargan automáticamente desde `.env.local`. `test:verify` prepara esas variables por su cuenta para el PostgreSQL temporal.

## Swagger y recorrido de exposición

La interfaz dispone de páginas separadas: `/ingresar` y `/registro` para acceso, `/reservar` para el asistente, `/cliente` para músicos y `/admin` para administradores. El menú administrativo lleva a agenda, catálogo, bloqueos, pagos y comprobantes. Consulta [interfaces y demostración por rol](INTERFACES.md) para el recorrido actualizado; las referencias históricas a pestañas corresponden a la interfaz inicial.

- [Swagger UI](http://localhost:3000/docs) y [OpenAPI JSON](http://localhost:3000/api/v1/openapi).
- Consulta sala y equipos; elige un horario futuro, categoría y cantidades. Reserva y procesa un pago aprobado. Comprueba que la reserva aparece confirmada.
- Como administrador, revisa agenda, catálogo, pagos y comprobantes. Actualiza después de un ciclo del worker.
- Prueba pago rechazado, resultado incierto y fallo de mensajería. Un pago incierto se resuelve desde conciliación administrativa del simulador.
- Bloquea un intervalo libre y verifica que no puede reservarse; desbloquéalo. Cancela una reserva antes del inicio y verifica la liberación.
- Para usar Swagger autenticado, obtén `access_token` de una sesión Supabase de prueba mediante el cliente o su endpoint de login. Introdúcelo en **Authorize** sin el prefijo Bearer. No guardes tokens en capturas, archivos versionados ni colecciones compartidas.

## Vista y medición sin cuenta de Supabase

Después de `npm run build`, `npm run preview:test` inicia un catálogo conectado a PostgreSQL temporal en [127.0.0.1:3000](http://127.0.0.1:3000). Sirve para inspeccionar la interfaz y las consultas públicas; el login continúa requiriendo Supabase real. Detén el proceso con Ctrl+C. No es un modo de autenticación alternativo.

```powershell
npm run preview:test -- --benchmark --once
```

El comando anterior mide 200 solicitudes HTTP de disponibilidad con 20 clientes concurrentes y escribe `test-results/http-benchmark.json`. Es una medición pequeña con Node fetch, distinta de k6 y de una prueba sobre un catálogo representativo de producción.

Con esa vista activa, `npm run test:browser` verifica calendario, carrito, acceso al formulario de sesión, ancho móvil y Swagger con Chrome instalado. Guarda capturas y reporte JSON en `test-results`. Estas pruebas no completan un login real de Supabase.

Para verificar acceso real, ejecutar `npm run evidence:real` con la aplicación conectada a Supabase. Chrome solicitará ingreso manual de ADMIN y CLIENTE. La demostración crea una reserva futura disponible, aprueba un pago simulado y cancela la reserva al finalizar para liberar recursos. Solo usar en el entorno de demostración autorizado. Guarda capturas con correos ocultos e informe en `docs/sprint-2/evidencias/recorrido-real`; no guarda contraseñas ni sesiones. Si falla, consultar el estado en la aplicación antes de repetir para evitar reservas de prueba abandonadas.

## Carga progresiva con k6

Instala k6 desde su distribución oficial. Mantén el servidor y una base exclusiva de pruebas activos. Crea `test-results` antes de ejecutar:

```powershell
New-Item -ItemType Directory -Force test-results
$env:BASE_URL='http://127.0.0.1:3000'
$env:MAX_VUS='20'
k6 run tests/load/reservas.js
```

Después de revisar errores y recursos, repite con `MAX_VUS=100`, `500`, `1000` y `2000` en el entorno de pruebas autorizado. El script asciende por escalones de 15 segundos hasta el máximo indicado y baja durante diez segundos. Evalúa p95 inferior a 3 segundos y errores inferiores al 1 %. Mide API pública, no carga visual 3G/4G ni operaciones de escritura. Conserva cada resumen antes de la siguiente corrida: el archivo de salida se sobrescribe.

## Solución de problemas

- Error de configuración: completa `.env.local`, ejecuta migraciones y reinicia Next.js. Las variables públicas se incorporan al compilar; vuelve a construir si cambian.
- No aparece administración: inicia sesión, asigna el rol en SQL y actualiza la página.
- Comprobante PENDIENTE: revisa que el worker esté ejecutándose. FALLIDA conserva el error del simulador; no implica cancelación ni reintento automático.
- Pago PROCESANDO/INCIERTO: espera o concilia como administrador. Tras dos minutos, el worker marca como inciertos los intentos abandonados por un reinicio. No se repite un cobro automáticamente.
- Recurso comprometido: no se cambia stock/estado mientras tenga reservas futuras activas. Modifica tarifas o cancela primero las reservas afectadas.
- En Windows se usa Webpack para evitar los permisos de junctions que puede exigir Turbopack. No hacen falta cambios en el sistema para esa elección.
