# Guía para exponer el proyecto: Reservas de Salas de Ensayo Ayacucho

**Autor:** Luis Alejandro Mancilla Apcho.  
**Curso:** Arquitectura de Software, IS-488.  
**Fecha de preparación:** 30 de octubre de 2026.  
**Base:** documentación actual del proyecto y guías académicas 03 y 04 proporcionadas por el usuario.

## 1. Qué debes demostrar en la exposición

Tu objetivo es demostrar que sabes pasar de una necesidad del negocio a una arquitectura justificada. La secuencia que debes explicar es:

**Problema → requisitos y restricciones → atributos de calidad → drivers → decisiones → estilo → enfoque interno → módulos → diseño → representación C4.**

No basta con decir «uso Node.js y Supabase». Debes explicar por qué los elegiste, qué responsabilidad tiene cada parte y qué problema evita esa organización.

La **Guía 03**, páginas 1 y 9, centra el trabajo en análisis y decisiones, sin exigir desarrollar nuevas funcionalidades. La **Guía 04**, páginas 1 y 13, pide documentación completa del proyecto propio, versionada en un repositorio, y exposición de **12 minutos por equipo**. La entrega indicada es la URL del repositorio, no archivos sueltos. Como trabajas solo, debes poder defender todas las vistas y relacionar cualquier componente con sus requisitos.

**Cómo describir honestamente el avance:**

> «El proyecto se encuentra en la etapa de análisis y diseño arquitectónico. Tenemos requisitos, decisiones, diagramas C4 y ejemplos de código que muestran cómo se organizará la solución. La aplicación ejecutable, las migraciones, las pruebas y las integraciones reales todavía deben implementarse».

Este guion no sustituye los entregables pendientes ni acredita que se hayan realizado las pruebas del laboratorio. Conserva la estructura actual del repositorio.

## 2. Fuentes académicas y aplicación al proyecto

| Fuente | Qué pide o explica | Cómo lo aplicamos |
|---|---|---|
| Guía 03, p. 2 | Distingue negocio, requisitos, calidad, drivers, decisiones, estilo, enfoque, tácticas, componentes, diseño y tecnologías. | Explicar cada concepto por separado y conectarlo con una necesidad de las reservas. |
| Guía 03, pp. 4–5 y 8 | Clean Architecture y separación de responsabilidades con dependencias internas. | Dominio, Aplicación, Presentación e Infraestructura dentro de los módulos. |
| Guía 03, pp. 6–7 | Drivers y ADR; elección del estilo. | Justificar monolito modular, Clean Architecture y adaptadores de pago. |
| Guía 03, p. 9 | Seis entregables iniciales más el enfoque Clean Architecture. | Mostrar análisis y decisiones antes de entrar a clases y métodos. |
| Guía 04, pp. 1–2 | Compara Clean y Hexagonal; define escenarios de calidad. | Explicar nuestra elección y proponer escenarios verificables del sistema. |
| Guía 04, pp. 2–5 | Diferencia arquitectura de diseño; presenta patrones y SOLID. | Separar módulos globales de clases, puertos y métodos internos. |
| Guía 04, p. 6 | Define los cuatro niveles C4. | Contexto, contenedores, componentes y código del sistema de reservas. |
| Guía 04, pp. 7–12 | Organización documental, escenarios, componentes y diseño. | Revisar la cobertura del repositorio e identificar lo que aún falta formalizar. |
| Guía 04, p. 13 | Documentación en repositorio y exposición de 12 minutos. | Ensayar una explicación breve con trazabilidad y dejar detalles como respaldo. |

Las guías usan un marketplace para mascotas como ejemplo. **Nuestro proyecto no necesita vendedores, ERP, envíos ni Angular solo porque aparezcan allí.** Adaptamos el proceso de análisis a músicos, salas, equipos, reservas y pagos. Los códigos de requisitos y drivers de ambos proyectos no tienen que significar lo mismo.

## 3. La frase que resume nuestra arquitectura

> «Proponemos una aplicación web de reservas con un backend organizado como monolito modular y Clean Architecture dentro de sus módulos. La interfaz se comunica mediante API REST. Supabase aporta autenticación y PostgreSQL; los pagos y la mensajería se conectan mediante puertos y adaptadores. Esta organización busca conservar reglas confiables y reducir el mantenimiento para un solo desarrollador».

Memoriza la idea, no necesariamente las palabras. Es la respuesta corta a «¿qué arquitectura utiliza tu proyecto?».

### Diferencias que debes tener claras

| Concepto | Qué significa | Respuesta de nuestro proyecto |
|---|---|---|
| Necesidad del negocio | Problema que justifica el sistema. | Evitar cruces y centralizar la gestión del local. |
| Estilo arquitectónico | Organización global y forma de despliegue. | Monolito modular; vista general en capas y relación cliente-servidor. |
| Enfoque arquitectónico | Organización interna de responsabilidades y dependencias. | Clean Architecture. |
| Patrón de diseño | Solución a un problema recurrente dentro del diseño. | Repository, Adapter y Factory. |
| Táctica de calidad | Mecanismo dirigido a un atributo de calidad. | Validación de permisos, exclusión transaccional, aislamiento del envío de mensajes. |
| Principio de diseño | Regla para distribuir responsabilidades y dependencias. | SOLID, especialmente responsabilidad única e inversión de dependencias. |
| Tecnología | Herramienta concreta para implementar el diseño. | Node.js, TypeScript, React/Next.js, PostgreSQL y Supabase. |
| Modelo de documentación | Forma de comunicar distintas vistas. | C4 y UML mediante Mermaid; decisiones mediante ADR. |

**No digas:** «C4 es la arquitectura», «Supabase es nuestro estilo» o «Mermaid es un patrón». C4 organiza las vistas, Supabase es un servicio gestionado y Mermaid es la notación utilizada para dibujarlas.

## 4. Guion recomendado de 12 minutos

Esta distribución es una propuesta para ensayar, no un tiempo adicional al de la guía. Suma doce minutos; si el docente incluye preguntas dentro del mismo plazo, reserva parte del cierre reduciendo los ejemplos.

| Tiempo | Tema | Qué debes conseguir |
|---|---|---|
| 0:00–0:45 | Problema, objetivo y estado | Explicar para quién existe el sistema y qué avance se presenta. |
| 0:45–1:30 | Actores y recorridos | Distinguir al músico, al administrador y a los sistemas externos. |
| 1:30–2:45 | Requisitos y restricciones | Elegir los requisitos más arquitectónicos y la limitación de trabajar solo. |
| 2:45–3:45 | Calidad y escenarios | Dar una meta y explicar cómo se comprobaría. |
| 3:45–4:45 | Drivers y decisiones | Mostrar la relación entre problema y elección técnica. |
| 4:45–6:00 | Estilo arquitectónico | Justificar el monolito modular y el uso de servicios gestionados. |
| 6:00–7:00 | Módulos | Explicar responsabilidades e interacciones. |
| 7:00–7:45 | Clean Architecture | Explicar capas y regla de dependencia. |
| 7:45–9:15 | Flujo de reserva y fallos | Recorrer validación, bloqueo, pago, confirmación y mensajería. |
| 9:15–10:15 | Patrones y SOLID | Demostrar dos o tres ejemplos concretos. |
| 10:15–11:00 | Lectura de C4 | Explicar el aumento de detalle y ubicar los componentes ya mostrados. |
| 11:00–12:00 | Estado, pendientes y cierre | Delimitar lo demostrado y el siguiente incremento. |

No necesitas recorrer las 32 diapositivas con el mismo detalle. Puedes explicar C1 al presentar actores, C2 al presentar el estilo, C3 con los módulos y C4 con las clases; al final solo recordar la relación entre esas vistas. Deja tablas extensas y casos adicionales para preguntas.

## 5. Cómo iniciar: problema y solución

### Qué explicar

Las bandas necesitan saber qué sala está libre, qué equipos pueden alquilar y cuánto costará el ensayo. El propietario necesita una agenda única para evitar conflictos y preparar los recursos. La coordinación dispersa por mensajes y llamadas hace difícil mantener esa información consistente.

### Qué puedes decir

> «Mi proyecto propone un sistema web para reservar salas de ensayo y equipos musicales en Ayacucho. El problema es que la coordinación manual puede generar cruces de horarios e información desactualizada. La propuesta centraliza disponibilidad, selección de equipos, pago y administración. La regla principal es que no se confirme una reserva si la sala o los equipos ya están comprometidos en ese intervalo».

**Qué mostrar:** [README](README.md), actores y calendario conceptual de la presentación. No afirmar que ya se redujeron errores o tiempos: todavía no existe una medición de usuarios reales.

## 6. Actores y alcance funcional

| Actor | Qué necesita | Cómo explicarlo |
|---|---|---|
| Cliente, músico o banda | Consultar horarios, seleccionar extras, reservar, pagar y cancelar según política. | «Es quien utiliza la capacidad del local». |
| Administrador o propietario | Mantener catálogo, agenda, bloqueos y cancelaciones. | «Es quien asegura que la información represente la operación real». |
| Proveedor de identidad | Gestionar autenticación y sesiones. | «Nos ayuda a identificar al usuario; después debemos comprobar sus permisos». |
| Proveedor de pago | Procesar o verificar la operación financiera. | «Su respuesta debe validarse antes de confirmar». |
| Servicio de mensajería | Entregar comprobantes y alertas. | «Su fallo no debe invalidar una reserva confirmada». |

El documento de actores enumera los cuatro primeros; mensajería aparece explícitamente en el C4 de contexto y en RF12. Conviene explicar esa diferencia como documentación que debe mantenerse sincronizada.

No presentes el alcance como una plataforma multiempresa. La documentación está centrada en la operación de un local; sedes y múltiples propietarios requieren un alcance adicional.

**Fuentes:** [actores](01-analisis-de-sistema/01-actores.md), [historias](01-analisis-de-sistema/02-historias-de-usuario.md) y [C4 contexto](04-modelo-c4/nivel_1_diagrama_de_contexto.md).

## 7. Requisitos: qué pide el negocio

Hay ocho historias de usuario y doce requisitos funcionales. No hace falta leerlos todos en voz alta; agrúpalos:

| Grupo | Requisitos | Explicación oral |
|---|---|---|
| Disponibilidad | RF01, RF02, RF08 | «El calendario informa y la reserva temporal protege el horario durante el pago». |
| Catálogo, carrito y equipos | RF03, RF04, RF09 | «El cliente selecciona recursos y el servidor comprueba cantidades e importe». |
| Pago | RF05 | «El resultado financiero participa en la confirmación de la reserva». |
| Administración | RF06, RF07, RF10 | «El propietario actualiza recursos, consulta agenda y bloquea horarios». |
| Cancelación | RF11 | «Cancelar cambia el estado y libera los recursos según una política definida». |
| Comunicación | RF12 | «El comprobante se envía sin hacer depender la reserva de WhatsApp». |

Las restricciones RC01–RC04 añaden: una sola persona, costo contenido, aplicación web, BaaS y comunicación REST. La necesidad de mantener el sistema tú mismo influye directamente en la elección del monolito modular.

**Qué puedes decir:**

> «Distingo funciones de restricciones. Reservar y cancelar son funciones; trabajar con un solo desarrollador y usar un backend gestionado son restricciones. Las decisiones arquitectónicas deben responder a ambas».

**Fuentes:** [requisitos](01-analisis-de-sistema/03-requisitos-funcionales.md) y [restricciones](01-analisis-de-sistema/05-restricciones.md).

## 8. Calidad: cómo debe comportarse el sistema

Los atributos actuales son rendimiento, disponibilidad, seguridad, usabilidad y resiliencia. El documento fija menos de tres segundos para catálogo/calendario y una meta de disponibilidad del 99,9 %. **Son metas de diseño; no resultados medidos.**

La Guía 04, p. 9, exige seis partes en cada escenario: fuente, estímulo, artefacto, entorno, respuesta y medida. Un escenario no se completa diciendo «debe ser rápido».

### Ejemplo completo para exponer: caída de mensajería

| Parte | Aplicación a nuestro proyecto |
|---|---|
| Fuente | Servicio externo de mensajería. |
| Estímulo | La solicitud de envío de comprobante falla o no responde dentro del límite configurado. |
| Artefacto | Adaptador de mensajería y caso de uso de reserva. |
| Entorno | El pago ya fue verificado y la confirmación se persistió. |
| Respuesta | Mantener la reserva confirmada, devolver el resultado al cliente y registrar el fallo de entrega. |
| Medida propuesta | En todos los casos de fallo incluidos en la prueba, la reserva conserva su estado y el resultado no espera la finalización del envío. |
| Verificación y estado | Inyectar errores y demoras; revisar respuesta, estado y logs. Pendiente de implementación y prueba. |

### Ejemplos adicionales para preguntas

| Atributo | Fuente / estímulo | Artefacto / entorno | Respuesta y medida propuesta |
|---|---|---|---|
| Rendimiento | Cliente consulta catálogo o calendario. | Web/API con datos y red móvil de prueba definidos. | Mostrar la consulta en menos de 3 s; documentar si se mide carga completa o API y acordar percentil y concurrencia antes de probar. |
| Disponibilidad | Clientes intentan usar operaciones críticas. | Sistema publicado, con monitoreo y periodo mensual definido. | Meta documentada del 99,9 %; acordar operaciones y tratamiento del mantenimiento, registrar interrupciones y calcular disponibilidad. |
| Seguridad | Usuario intenta consultar o cancelar una reserva ajena. | API y persistencia con usuarios y permisos de prueba. | Denegar todos los intentos no autorizados del conjunto definido y comprobar que no se modifican datos. |
| Usabilidad | Músico intenta completar una reserva desde su celular. | Interfaz móvil con tareas y participantes definidos. | Registrar finalización, pasos y errores. El umbral de aceptación aún debe acordarse; «mínimos clics» no es una medida suficiente. |

Estas propuestas no copian los 200 usuarios, los dos segundos ni el 99,5 % del ejemplo de marketplace de la guía. Las medidas deben responder a nuestro local y entorno.

**Qué puedes decir:**

> «La resiliencia se comprobará provocando una falla de mensajería después de persistir una reserva. La respuesta debe conservar la confirmación. Esto es un criterio verificable, no una afirmación de que las pruebas ya pasaron».

**Pendiente de entrega:** actualmente no existe `08-escenarios-atributos-calidad.md`. Esta sección prepara el contenido, pero no sustituye formalmente ese archivo solicitado en la Guía 04. Fuente actual: [atributos de calidad](01-analisis-de-sistema/04-atributos-de-calidad.md).

## 9. Drivers y ADR: por qué elegimos esta arquitectura

Un driver es un requisito, atributo o restricción con impacto importante en la arquitectura. Un ADR registra la decisión que responde a uno o varios drivers y su justificación.

| Necesidad o restricción | Driver actual | Respuesta arquitectónica |
|---|---|---|
| Evitar cruces | DA01 | Asignación transaccional y exclusión de intervalos en persistencia. |
| Trabajar solo con costo controlado | DA02 | ADR-001: monolito modular con infraestructura gestionada. |
| Reservar desde celular | DA03 | Interfaz responsiva y objetivo de carga rápida. |
| Integrar pago externo | DA04 | ADR-003: puerto de pago y adaptadores. |
| Sobrevivir a fallas de WhatsApp | DA05 | Aislar el envío mediante puerto, adaptador y manejo asíncrono. |
| Mantener y modificar el sistema | DA06 | ADR-002: Clean Architecture y límites modulares. |

No todos los mecanismos anteriores tienen todavía un ADR propio. Hay tres ADR formalmente registrados. Tampoco debe confundirse el número de ADR de nuestro proyecto con el de los ejemplos académicos.

**Qué puedes decir:**

> «No elegí el monolito modular solo por preferencia. Responde a la restricción de mantener el proyecto individualmente. Clean Architecture responde a mantenibilidad, y los adaptadores responden a la dependencia de proveedores externos».

**Fuentes:** [drivers](01-analisis-de-sistema/06-driver-arquitectonicos.md) y [ADR](01-analisis-de-sistema/07-decisiones-arquitectonicas.md).

## 10. Estilo arquitectónico: monolito modular

### Qué significa en nuestro sistema

El backend agrupa Usuarios, Catálogo, Reservas y Pagos en una aplicación desplegable. Los módulos se separan lógicamente y se comunican por contratos, normalmente mediante llamadas en memoria. No se convierten en servicios independientes por tener carpetas distintas.

La vista inicial de presentación, negocio y datos es una representación general en capas. La relación navegador–API es cliente-servidor. Ambas vistas son compatibles con un backend monolítico modular.

### Por qué es adecuado

- Reduce la coordinación de despliegues y la operación para una sola persona.
- Mantiene responsabilidades identificables sin introducir comunicación distribuida entre todos los módulos.
- Permite aprovechar una transacción local para recursos que necesitan consistencia, respetando los límites definidos.
- Facilita construir un flujo completo antes de ampliar funcionalidades.

### Cómo explicar BaaS y serverless sin confundirlos

La documentación denomina la propuesta «Monolito Modular Serverless». Para defenderla, separa las ideas: **monolito modular** describe el backend del negocio; **BaaS** describe los servicios gestionados de identidad y persistencia; **serverless** describe una posible forma de ejecutar funciones o la API.

Supabase no decide automáticamente dónde vive todo nuestro código Node.js. Falta fijar el entorno concreto: las referencias a API Routes y funciones Edge no equivalen a una decisión única ya implementada. Tampoco significa que frontend, Auth y PostgreSQL sean un mismo proceso.

**Qué puedes decir:**

> «El monolito es modular porque separa responsabilidades, pero sus módulos del negocio se despliegan juntos. Supabase es una dependencia gestionada. La forma exacta de ejecutar la API debe concretarse sin cambiar esa separación lógica».

**Fuentes:** [estilo](02-arquitectura-software/estilo-arquitectonico.md) y [arquitectura inicial](02-arquitectura-software/arquitectura-inicial.md).

## 11. Los módulos: qué hace cada uno

### 11.1 Usuarios

**Responsabilidad:** perfiles, roles y relación entre identidad autenticada y usuario del negocio. Supabase Auth atiende autenticación; la aplicación sigue siendo responsable de autorizar operaciones.

**Entradas y salidas:** identidad verificada, consulta de perfil y permisos. No calcula precios ni decide la disponibilidad de una sala.

**Trazabilidad:** actores Cliente/Administrador, restricciones de acceso y AC03. La autenticación es una responsabilidad transversal que complementa los requisitos funcionales; el catálogo RF no contiene un requisito independiente de inicio de sesión.

> «Usuarios permite saber quién está operando. Las rutas comprueban si ese usuario puede ejecutar el caso de uso y acceder a ese recurso».

### 11.2 Catálogo

**Responsabilidad:** salas, equipos, estado, categorías, cantidades y tarifas. Reservas consume su API pública mediante `CatalogoPort`.

**Ejemplo:** el cliente pide dos micrófonos y un amplificador. Catálogo aporta disponibilidad para el intervalo y las tarifas del servidor; no debe confiar en un precio enviado por el navegador.

**Trazabilidad:** RF03, RF06 y RF09; contribuye al cálculo de RF04.

> «Catálogo define qué recursos existen y sus condiciones. Reservas pregunta por ellos sin consultar directamente las tablas internas de Catálogo».

### 11.3 Reservas

**Responsabilidad:** organizar la solicitud, el carrito, el intervalo, los equipos asociados, el total y las transiciones de estado. Es el núcleo del sistema porque coordina la asignación de recursos y la confirmación.

**Ejemplo:** una banda pide la sala A de 18:00 a 20:00 con dos micrófonos. Reservas valida la solicitud, consulta Catálogo, intenta el bloqueo temporal, solicita el resultado del pago y persiste el estado final.

**Trazabilidad:** RF01, RF02, RF04, RF07, RF08, RF10 y RF11; coordina RF09 y RF12 mediante puertos.

> «Reservas coordina el proceso. La garantía frente a solicitudes simultáneas debe respaldarse en una operación atómica de persistencia; la entidad aislada no puede ver todas las solicitudes concurrentes».

### 11.4 Pagos

**Responsabilidad:** interacción con la integración financiera, resultados, referencias e intentos de operación. El caso de uso de Reservas depende del contrato, no de la API particular de Yape.

**Trazabilidad:** RF05 y DA04; participa en el flujo de RF08.

**Precisión:** C4 nivel 3 identifica Pagos como módulo, mientras el ejemplo de Reservas ubica adaptadores financieros en su infraestructura. Debe unificarse ese límite al implementar. No afirmar que ambas estructuras ya están resueltas en código.

> «El puerto permite que Reservas solicite un pago sin conocer el protocolo externo. El proveedor y su API real aún deben confirmarse; el ejemplo actual utiliza una simulación».

### 11.5 Mensajería: integración, no un quinto módulo independiente

La estructura actual usa `MensajeriaPort` y `WhatsAppMensajeriaAdapter` ligados al flujo de Reservas. No existe la necesidad documentada de desplegar un servicio propio de notificaciones.

**Trazabilidad:** RF12 y AC05. La integración entrega comprobantes y alertas; no decide si la reserva es válida.

> «Primero se persiste la confirmación. Luego se inicia el envío sin esperar su entrega y se captura el error, para que una caída de WhatsApp no destruya el resultado de la reserva».

**Fuente común:** [C4 componentes](04-modelo-c4/nivel_3_diagrama_de_componentes.md).

## 12. Enfoque arquitectónico: Clean Architecture

Clean Architecture organiza responsabilidades alrededor del negocio y dirige las dependencias del código hacia las capas internas. La Guía 03, pp. 4–5 y 8, presenta ese objetivo.

| Capa | Qué contiene aquí | Ejemplo | De qué no debe depender |
|---|---|---|---|
| Dominio | Entidades, reglas y contratos internos según nuestra convención. | `Reserva`, `EquipoExtra`, `ReservaRepository`, `CatalogoPort`. | React, Supabase, HTTP o APIs de pago. |
| Aplicación | Casos de uso y comando de entrada. | `CrearReservaUseCase`, `CrearReservaCommand`. | Repositorio concreto, SDK o controlador web. |
| Presentación | Entrada HTTP y traducción de resultados. | `ReservaController`, `/api/v1/reservas`. | No debe concentrar reglas de reserva ni consultas directas. |
| Infraestructura | Implementaciones técnicas de los contratos. | `SupabaseReservaRepository`, `YapePagoAdapter`, `CatalogoInternoAdapter`, `WhatsAppMensajeriaAdapter`. | No debe imponer su protocolo al dominio. |

`reservas.module.ts` es la raíz de composición propuesta: crea implementaciones y las inyecta. Es normal que esa pieza conozca varias capas para conectarlas.

### Cómo justificar que nuestros puertos están en Dominio

La tabla de la Guía 03 ubica puertos o interfaces en Aplicación. Nuestro diseño los declara en Dominio. Explica la variación: en este proyecto se eligieron contratos internos utilizados por los casos de uso y realizados por adaptadores externos. El punto central es que el núcleo no importe infraestructura. La ubicación exacta debe ser una convención consistente, no una afirmación de que hay una única carpeta universal para todos los puertos.

> «El caso de uso no crea un cliente de Supabase. Recibe un `ReservaRepository`. Infraestructura implementa esa interfaz y la composición conecta las piezas. Así puedo probar el caso de uso con una implementación en memoria».

### Clean Architecture y Hexagonal

Ambos enfoques separan negocio y detalles técnicos. Clean destaca capas y dirección de dependencias; Hexagonal destaca puertos y adaptadores de entrada y salida. Nuestro enfoque declarado es **Clean Architecture** y utiliza puertos y adaptadores compatibles con esa separación. Usar un `PagoPort` no significa que debamos afirmar que aplicamos dos arquitecturas completas distintas.

**Fuente del proyecto:** [enfoque](02-arquitectura-software/enfoque/enfoque-arquitectonico.md).

## 13. Diseño interno: explicar una reserva de principio a fin

Usa un único ejemplo durante la exposición: **sala A, intervalo 18:00–20:00 y dos micrófonos**. Es ilustrativo; no representa una tarifa ni una reserva real.

1. La web envía una solicitud a `POST /api/v1/reservas`.
2. La presentación valida datos y obtiene la identidad autenticada. El comando lleva `equipos: { equipoId, cantidad }[]`; las cantidades deben validarse también en ejecución.
3. `CrearReservaUseCase` consulta disponibilidad de sala y llama a `CatalogoPort.verificarStock(equipos, horaInicio, horaFin)`.
4. Catálogo resuelve datos y tarifas del servidor. Los IDs del comando se convierten a equipos del dominio, sin aceptar precios del cliente.
5. La entidad se crea PENDIENTE con vencimiento de diez minutos y se calcula el importe.
6. El repositorio intenta guardar y asignar sala/equipos de forma transaccional. Si hay un conflicto, se rechaza antes de iniciar el cobro.
7. `PagoPort` permite consultar al proveedor mediante su adaptador.
8. Con pago aprobado, la entidad pasa a CONFIRMADA y se actualiza la persistencia. Con rechazo definitivo, se cancela y se liberan recursos según las reglas.
9. Después de persistir la confirmación se inicia el envío mediante `MensajeriaPort`, sin `await` de entrega y con `.catch(...)` para capturar fallos.
10. La API devuelve el resultado. La entrega del mensaje no condiciona la confirmación.

El diagrama C4 representa el envío después de responder HTTP y el ejemplo inicia la promesa antes de retornar el ID. La idea común es que **no se espera la entrega**. El orden exacto y la continuidad de la tarea deben concretarse con el runtime elegido.

### Tres precisiones que te hacen defender mejor el flujo

- **Consultar stock no asigna inventario.** La consulta puede quedar desactualizada; el guardado debe revalidar y asignar cantidades atómicamente.
- **Diez minutos no se cumplen solos.** Hace falta una operación de expiración coordinada con pagos pendientes o resultados inciertos.
- **Timeout de pago no significa rechazo.** Si el proveedor pudo cobrar, hay que conciliar; no liberar recursos o cobrar de nuevo sin comprobarlo.

### Qué decir sobre los stubs

El ejemplo mantiene dos horas como duración de demostración, una tarifa fija de `30.00` y un cliente simulado de pago. No son una regla comercial ni una integración funcionando. La intención del diseño es consultar tarifas del servidor, calcular duración real y verificar el proveedor.

**Fuente:** [diseño interno](03-diseño-de-software/diseno-interno-de-modulos.md).

## 14. Patrones y SOLID: explicación con ejemplos

### Patrones y mecanismos

| Elemento | Qué puedes decir |
|---|---|
| Repository | «Oculto la persistencia detrás de `ReservaRepository`; el caso de uso pide guardar, no construye SQL». |
| Adapter externo | «El adaptador traduce nuestro contrato al protocolo de Yape o WhatsApp». |
| Adapter interno | «`CatalogoInternoAdapter` comunica Reservas con la API pública de Catálogo sin acceder a sus detalles internos». |
| Factory | «`Reserva.crear` centraliza la construcción y las precondiciones de la entidad». Es un método de fábrica; no es necesario afirmar que existe una Abstract Factory. |
| Fire and Forget | «Inicio una tarea asíncrona y capturo su rechazo sin esperar la entrega». Es un mecanismo de ejecución, no un Observer. |

Fire and Forget no garantiza reintentos ni entrega duradera. Capturar el error evita propagar ese rechazo, pero no asegura que el proceso sobreviva a reinicios. La persistencia de notificaciones pendientes sería una evolución, no una funcionalidad existente.

### Los cinco principios SOLID

| Principio | Cómo explicarlo en este proyecto |
|---|---|
| S — Responsabilidad única | El controlador traduce HTTP; el caso de uso coordina; la entidad mantiene reglas; el repositorio persiste. |
| O — Abierto/cerrado | Un nuevo proveedor compatible puede integrarse con otro adaptador del mismo puerto. Los cambios de contrato de negocio sí pueden requerir modificar casos de uso. |
| L — Sustitución de Liskov | Un adaptador sustituto debe respetar el contrato y su comportamiento, no solo devolver propiedades parecidas. |
| I — Segregación de interfaces | Pago, Catálogo y Mensajería tienen contratos pequeños, en lugar de un servicio gigante que lo haga todo. |
| D — Inversión de dependencias | El caso de uso recibe interfaces; las clases concretas se conectan desde composición. |

**Fuentes:** [patrones](03-diseño-de-software/patrones-de-diseno.md) y [principios](03-diseño-de-software/principios-de-diseno.md).

## 15. Cómo presentar los cuatro niveles C4

La Guía 04, p. 6, establece el aumento progresivo de detalle. Cada nivel responde una pregunta diferente:

| Nivel | Pregunta | Qué señalar en nuestro diagrama |
|---|---|---|
| C1 — Contexto | ¿Quién usa el sistema y con qué externos se relaciona? | Cliente, administrador, sistema de reservas, identidad, pago y mensajería. |
| C2 — Contenedores | ¿Qué aplicaciones y almacenes de datos lo componen? | Aplicación web, API, Supabase Auth y PostgreSQL; integraciones de pago y mensajes. |
| C3 — Componentes | ¿Cómo se divide el interior de la API? | Rutas con JWT/RBAC y módulos Usuarios, Catálogo, Reservas y Pagos. La base de datos es un contenedor relacionado, no una clase interna. |
| C4 — Código | ¿Qué clases y contratos resuelven el caso crítico? | Controlador, caso de uso, entidad, repositorio, puertos y adaptadores. |

**Qué puedes decir:**

> «Primero muestro el sistema como una caja; luego abro sus aplicaciones; después el backend; finalmente el caso de uso de Reservas. No son cuatro sistemas diferentes, sino cuatro niveles de detalle del mismo diseño».

Un contenedor C4 no significa necesariamente Docker. En C3 las llamadas entre módulos del monolito son internas; no dibujarlas como peticiones HTTP entre microservicios. En C4 la flecha de implementación va del adaptador al contrato que implementa.

**Fuentes:** [C1](04-modelo-c4/nivel_1_diagrama_de_contexto.md), [C2](04-modelo-c4/nivel_2_diagrama_de_contenedores.md), [C3](04-modelo-c4/nivel_3_diagrama_de_componentes.md) y [C4](04-modelo-c4/nivel_4_diagrama_de_codigo.md).

## 16. Cómo responder de qué requisito nace cada componente

Esta es una de las preguntas expresamente destacadas en la Guía 04, p. 13. Puedes responder con esta tabla:

| Componente o mecanismo | Origen | Justificación breve |
|---|---|---|
| Calendario | HU01, RF01 | El cliente necesita elegir un horario disponible. |
| Exclusión de sala y bloqueo temporal | RF02, RF08, DA01 | Dos clientes no deben comprometer el mismo recurso. |
| Catálogo y CRUD | RF03, RF06 | Consultar y mantener recursos. |
| Stock por cantidades e intervalo | HU02, RF09 | Evitar compartir más equipos de los que existen. |
| Carrito y cálculo de importe | RF04 | Revisar el conjunto de sala y extras antes de pagar. |
| Puerto y adaptador de pago | RF05, DA04, ADR-003 | Integración externa sin acoplar el negocio. |
| Agenda administrativa | RF07 | Preparar la atención del local. |
| Bloqueo manual | HU07, RF10 | Inhabilitar recursos por mantenimiento o cierre. |
| Cancelación | HU04/HU08, RF11 | Gestionar cambios y liberar recursos según política. |
| Mensajería asíncrona | RF12, AC05, DA05 | Notificar sin abortar una confirmación persistida. |
| Autenticación y RBAC | Actores, AC03 | Restringir operaciones y propiedad de reservas. |
| Monolito modular | RC01, DA02, ADR-001 | Mantener una solución viable para una sola persona. |
| Capas y puertos internos | DA06, ADR-002 | Facilitar mantenimiento y pruebas del negocio. |

## 17. Preguntas probables del docente y respuestas

### ¿Por qué no microservicios?

> «La restricción es desarrollar y mantener el proyecto individualmente. Un monolito modular conserva separación lógica con menos coordinación operativa. No hay una necesidad demostrada de desplegar cada módulo por separado».

### ¿Tu arquitectura es en capas o Clean Architecture?

> «La vista inicial agrupa presentación, negocio y datos. Clean Architecture precisa cómo separar responsabilidades y dirigir dependencias dentro de los módulos. El estilo global del backend sigue siendo monolito modular».

### ¿La entidad Reserva impide por sí sola el overbooking?

> «No. Valida reglas del objeto. La concurrencia entre solicitudes debe resolverse con una asignación atómica en persistencia, respaldada por restricciones de exclusión y validación transaccional de inventario».

### ¿Qué ocurre si dos salas piden el último micrófono?

> «Una consulta booleana previa no es suficiente. El guardado debe asignar cantidades por intervalo dentro de una operación consistente y rechazar el conflicto antes del pago. Es una garantía que falta implementar y probar».

### ¿Qué ocurre si Yape cobra y la red falla?

> «El resultado es incierto. Debemos conservar una referencia del intento y consultar o conciliar con el proveedor. No afirmamos rechazo ni repetimos el cobro automáticamente. El contrato actual de ejemplo debe ampliarse para ese caso».

### ¿Qué ocurre si WhatsApp no funciona?

> «La reserva ya confirmada permanece consultable. Se captura y registra el fallo del envío. Si necesitamos reintentos fiables, debemos persistir la intención de notificar; eso aún no está implementado».

### ¿Por qué poner interfaces si eres el único desarrollador?

> «Las utilizo en límites relevantes: persistencia, pagos, catálogo y mensajería. Permiten probar el flujo sin servicios reales y evitar que un cambio técnico se propague al negocio. No necesito abstraer cada función trivial».

### ¿RLS y JWT ya garantizan toda la seguridad?

> «Son parte del diseño. Debemos validar identidad, rol y propiedad del recurso y comprobar qué políticas aplica la conexión usada. Las políticas y pruebas ejecutables aún deben construirse».

### ¿Ya cumple tres segundos y 99,9 %?

> «No hay resultados medidos. Son metas documentadas que deben convertirse en escenarios con entorno, carga, operaciones y procedimiento de medición».

### ¿Qué parte corresponde a la siguiente etapa?

> «Implementar una reserva completa con datos pequeños y pagos simulados, respaldada por migraciones y pruebas de concurrencia. Después integrar el proveedor real y la operación administrativa».

## 18. Qué falta respecto a las guías y cómo decirlo

| Punto solicitado o relevante | Estado observado | Cómo presentarlo |
|---|---|---|
| Análisis, drivers, ADR, estilo y enfoque | Documentados en las carpetas actuales. | Mostrar evidencia y explicar su relación. |
| Diseño interno, patrones y SOLID | Documentados mediante ejemplos. | Explicar que el código está dentro del Markdown, no como aplicación ejecutable. |
| Cuatro niveles C4 | Archivos presentes. | Revisar coherencia entre las vistas antes de entregar. |
| `docs/` y `tecnologia/` según Guía 04, pp. 7–8 | El repositorio mantiene las secciones directamente en la raíz. | Reconocer la diferencia; aquí se conserva tu estructura. Acordar o realizar la adaptación si la docente exige esa organización literal. |
| Escenarios completos en archivo 08 | No existe todavía el archivo solicitado. | Usar la sección 8 como borrador y formalizar el entregable posteriormente. |
| Componentes arquitectónicos en documento/imagen | La explicación y diagrama existen dentro de C4 nivel 3. | Verificar si deben presentarse también en el documento específico indicado en la guía. |
| Pruebas del ejemplo de laboratorio | No acreditadas por esta revisión. | No inventar su ejecución ni trasladar resultados de GoPet a nuestro proyecto. |
| Código ejecutable y despliegue | No encontrados en el árbol revisado. | No confundir documentación suficiente para explicar el diseño con un producto funcionando. |
| Versionado y URL del repositorio | Deben verificarse antes de la entrega. | Comprobar que los archivos locales estén incluidos en la versión publicada que revisará la docente. |

Tres archivos de arquitectura siguen teniendo bloques Mermaid sin cierre: arquitectura inicial, estilo y enfoque. Es un pendiente de formato que conviene resolver para exponer sin problemas de renderizado; este guion no los modifica.

## 19. Lista de preparación antes de exponer

- [ ] Ensayar en voz alta con cronómetro y ajustar a doce minutos.
- [ ] Poder explicar la frase de arquitectura de la sección 3 sin leerla.
- [ ] Relacionar cada módulo con uno o varios requisitos.
- [ ] Tener abiertos los documentos de requisitos, ADR, diseño interno y C4.
- [ ] Revisar que diagramas y vínculos se visualicen correctamente.
- [ ] Distinguir metas de calidad de resultados comprobados.
- [ ] Identificar lo que aún está pendiente frente a la Guía 04.
- [ ] Tener la URL real del repositorio y verificar que contiene el material que vas a mostrar.
- [ ] Usar la presentación como apoyo visual; dejar el detalle técnico como respaldo.
- [ ] Preparar respuestas sobre concurrencia, stock, pago incierto y caída de mensajes.

## 20. Cierre sugerido

> «La propuesta busca que los músicos reserven con disponibilidad y precios confiables, mientras el propietario mantiene una agenda centralizada. Elegimos un monolito modular porque el proyecto será mantenido por una sola persona, y Clean Architecture para proteger las reglas del negocio frente a detalles técnicos. C4 nos permite comunicar la solución desde el contexto hasta las clases. El siguiente paso es convertir este diseño en un flujo ejecutable y probar sus garantías, especialmente concurrencia, pagos y recuperación».

## 21. Referencias de consulta

- [Guía 03: Análisis y selección de estilos y enfoques arquitectónicos](<C:/Users/ALEJANDRO/Desktop/Lab Arquitectura de software/Informes/GUIA-003-ASF.pdf>). Referencias principales: pp. 1–2, 4–9.
- [Guía 04: Análisis, arquitectura y diseño de software. Documentación C4](<C:/Users/ALEJANDRO/Desktop/Lab Arquitectura de software/Informes/GUIA-004-ASF.pdf>). Referencias principales: pp. 1–6 y 7–13.

Los ejemplos y propuestas de este guion adaptan esas guías al sistema de reservas. Las rutas de los PDF son locales; no viajarán con el repositorio si las guías no se incorporan mediante el procedimiento que corresponda.
