# Guía Maestra de Documentación: App de Reservas de Salas de Ensayo (Ayacucho)

Este documento explica la estructura de carpetas del directorio `docs/` y detalla exactamente qué aspecto del proyecto de **Salas de Ensayo en Ayacucho** se documenta en cada archivo.

---

## 📁 01-analisis-de-sistema
*En esta carpeta definimos el "Qué" y los límites del proyecto antes de programar.*

*   **`01-actores.md`**: Define a los usuarios del sistema. Para nuestro proyecto son el **Cliente/Músico** (que busca y reserva) y el **Administrador** (el dueño del local que gestiona salas y equipos).
*   **`02-historias-del-usuario.md`**: Lo que necesitan los actores. Ej: "Como músico, quiero ver la disponibilidad de la batería en tiempo real para no cruzar mi horario".
*   **`03-requisitos-funcionales.md`**: Las funciones exactas que el sistema debe tener. Ej: El motor *anti-overbooking* (evitar reservas dobles), carrito de compras, y catálogo de equipos.
*   **`04-atributos-de-calidad.md`**: Cómo debe funcionar (lo no funcional). Ej: **Usabilidad** (interfaz Mobile-First para celulares) y **Rendimiento** (carga rápida en redes móviles de Ayacucho).
*   **`05-restricciones.md`**: Las limitaciones del proyecto. Ej: Al ser un "Solo Developer", se debe usar **Backend-as-a-Service (Supabase)** en lugar de servidores propios.
*   **`06-driver-arquitectonicos.md`**: Los factores críticos que moldean la arquitectura. Ej: La necesidad de validar pagos externos (Yape/Plin) y el bajo presupuesto de infraestructura.
*   **`07-decisiones-arquitectonicas.md` (ADR)**: Registro de por qué elegimos ciertas tecnologías. Ej: Por qué elegimos Clean Architecture o un Monolito Modular.
*   **`08-escenarios-atributos-calidad.md`**: Casos de prueba teóricos. Ej: "Escenario de carga: 20 bandas intentan reservar salas un viernes por la noche; el sistema debe responder en menos de 2 segundos".

---

## 📁 02-arquitectura-software
*Aquí definimos el "Cómo" a nivel macro (alto nivel).*

*   **`arquitectura-inicial.md`**: El diagrama de 3 capas básicas (Presentación, Lógica de Negocio, Datos) conectadas a la BD y a la Pasarela de Pagos.
*   **`componentes-arquitectonicos.md`**: Descripción de los grandes bloques del backend: Módulo de Usuarios, Módulo de Catálogo, Módulo de Reservas y Módulo de Pagos.
*   **`enfoque-aquitectonico.md`**: La justificación y diagrama de **Clean Architecture**, explicando cómo el motor de reservas (Dominio) está aislado de Supabase (Infraestructura).
*   **`estilo-arquitectonico.md`**: La explicación de nuestro **Monolito Modular Serverless**. Todo el backend vive junto, pero separado en carpetas ordenadas lógicamente.

---

## 📁 03-diseño-de-software \ diseño-interno
*Aquí detallamos cómo está escrito el código por dentro.*

*   **`diseño-interno-de-modulos.md`**: Cómo se organizan las carpetas en React/Next.js y Node. Cómo un controlador llama a un Caso de Uso (UseCase).
*   **`patrones-de-diseño.md`**: Los patrones de software aplicados. Ej: 
    *   **Patrón Repository**: Para aislar las consultas a Supabase.
    *   **Patrón Adapter**: Para conectar la pasarela de Yape sin ensuciar la lógica principal.
*   **`principios-de-diseño.md`**: Cómo aplicamos los principios **SOLID**. Ej: Responsabilidad Única (SRP) asegurando que la clase que valida fechas no sea la misma clase que procesa el pago.

---

## 📁 04-modelo-c4
*Aquí utilizamos el estándar C4 para mapear el sistema desde lo más general a lo más técnico.*

*   **`Nivel1-DiagramadeContextodelSistema.md`**: El panorama general. Un diagrama simple mostrando al Músico en el centro interactuando con la "App de Reservas Ayacucho", y esta App conectándose a "Yape" y "Supabase".
*   **`Nivel2-DiagramadeContenedores.md`**: Hacemos zoom. Mostramos la "Web App Frontend (React)", la "API Backend" y la "Base de Datos PostgreSQL".
*   **`Nivel3-Diagrama-de-Componentes.md`**: Hacemos más zoom dentro de la API Backend. Mostramos el `AuthComponent`, `ReservaController`, `CatalogoService`, etc.
*   **`Nivel4-DiagramadeCodigo.md`**: El nivel más profundo (UML). Diagramas de clases mostrando cómo interactúa la entidad `Reserva` con `Sala` y `Equipo` a nivel de código (atributos y métodos).