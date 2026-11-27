# App Web de Reservas de Salas de Ensayo y Equipos - Ayacucho

## Prototipo e interfaz aprobada

Ejecuta `npm run prototipo` y abre <http://127.0.0.1:4173>. El [prototipo independiente](prototipos/interfaz-ensaya/README.md) permite explorar músico y administrador con datos ficticios. Su diseño aprobado se adaptó a la aplicación real: [navegación, pruebas y evidencias](docs/sprint-2/INTERFAZ-INTUITIVA.md). El selector de rol permanece exclusivamente en el prototipo.

## Organización del repositorio

La propuesta de reorganización está en `codex/organizacion-proyecto`. Consultar [estructura y equivalencias](docs/sprint-2/ORGANIZACION.md): rutas en `src/app`, frontend en `src/cliente`, backend en `src/servidor`, contratos puros en `src/compartido` y arquitectura en `docs/arquitectura`. Los comandos npm existentes se mantienen.

## Sprint 2: aplicación ejecutable

Consultar los [resultados finales por documentos](docs/sprint-2/resultados-finales/README.md): trabajo realizado, 53 pruebas unitarias, 36 de integración, 21 de navegador, cobertura y objetivos de calidad aprobados, no cumplidos o pendientes.

Entrega publicada en la rama `codex/sprint-2-entrega`. [Validación remota aprobada del commit funcional](https://github.com/MancillaLui/app-reservas-salas-ayacucho/actions/runs/45933818473).

Consulta primero el [estado de entrega y los pasos restantes](docs/sprint-2/ENTREGA.md).

Para presentar: [cierre contra la consigna](docs/sprint-2/CIERRE.md) y [guion actualizado del Sprint 2](docs/sprint-2/EXPOSICION.md). `npm run delivery:prepare` genera un paquete local sin configuración privada.

La web tiene un [sitio musical y paneles separados por rol](docs/sprint-2/INTERFACES.md): `/reservar`, `/ingresar`, `/registro`, `/cliente` y `/admin`. El frontend consume la misma API y conserva la autorización y reglas del backend.

La presentación usa una [estética de estudio musical oscuro](docs/sprint-2/TEMA-OSCURO.md), con controles accesibles, capturas a tres anchos y verificaciones de contraste. Swagger mantiene su esquema claro independiente.

La implementación está en `src/`: Next.js y TypeScript, monolito modular con Clean Architecture, PostgreSQL/Supabase Auth, API REST y Swagger. Los pagos y el envío de comprobantes son **simulados**; las reservas y la asignación de inventario se persisten transaccionalmente.

- [Configuración y ejecución local](docs/sprint-2/INICIO.md).
- [Especificaciones SDD](docs/sprint-2/SDD.md), [arquitectura y datos](docs/sprint-2/ARQUITECTURA.md), [trazabilidad](docs/sprint-2/TRAZABILIDAD.md) y [validación](docs/sprint-2/VALIDACION.md).
- API: `/api/v1`; Swagger: `/docs`.
- Verificación: `npm run typecheck`, `npm run test:verify` y `npm run build`.

Antes de iniciar, completa `.env.local`, ejecuta `npm run db:migrate` y `npm run db:seed`. Usa `npm run dev` para la web y, en otra terminal, `npm run worker` para expiración y envío. No se incluyen credenciales ni usuarios preconfigurados. La guía de inicio describe las cuentas y el rol administrador.

Los documentos de arquitectura y C4 se actualizaron con el código real. Las versiones locales previas se conservaron en `docs/sprint-1-referencia` para mantener el trabajo del Sprint 1 y distinguir propuestas de implementación.

## Autor
* MANCILLA APCHO, Luis Alejandro

## Descripción

Este proyecto consiste en el diseño y desarrollo de una plataforma web integral orientada a modernizar y profesionalizar la escena musical en la ciudad de Ayacucho. Tradicionalmente, la coordinación para reservar espacios de ensayo y alquilar equipos se realiza de forma manual (vía mensajes de texto o llamadas), lo que frecuentemente genera cruces de horarios, tiempos de espera prolongados y desinformación sobre el stock real de los instrumentos.

Para resolver esta problemática, la aplicación web centraliza toda la operación del negocio en un entorno digital disponible 24/7, destacando las siguientes características principales:

*   **Motor de Reservas Anti-Overbooking:** Un calendario interactivo en tiempo real que permite a las bandas y músicos solistas visualizar los horarios disponibles, bloqueando automáticamente los espacios confirmados para eliminar cualquier cruce de horarios.
*   **Catálogo Digital Integrado:** Módulo donde los usuarios pueden explorar y añadir a su "carrito de reserva" instrumentos o equipos de sonido adicionales (amplificadores, platillos, micrófonos, etc.), conociendo sus especificaciones y tarifas exactas antes de llegar al local.
*   **Experiencia Mobile-First:** Interfaz de usuario optimizada para smartphones, garantizando que los clientes puedan estructurar su ensayo, registrar sus datos y procesar su pago (vía Yape, Plin o tarjeta) en pocos clics desde cualquier lugar.
*   **Panel de Administración Centralizado:** Un entorno seguro y exclusivo para el propietario del local, diseñado para gestionar el inventario (operaciones CRUD de salas y equipos), aprobar o cancelar solicitudes y visualizar métricas básicas de ocupación.

A nivel estructural, el proyecto aplica patrones de arquitectura de software en tres capas (Presentación, Lógica de Negocio y Datos), comunicadas a través de una API REST. Además, contempla la integración con sistemas externos para delegar de forma segura la autenticación de usuarios y el procesamiento de pagos.

## Caso de estudio
Gestión, automatización y optimización de reservas para locales de ensayo musical y alquiler de equipos de sonido.

## Curso
Arquitectura de Software
