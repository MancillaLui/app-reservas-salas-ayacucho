# Diseño interno de módulos

> **Proyecto:** App Web de Reservas de Salas de Ensayo - Ayacucho · **Backend:** Node.js + TypeScript / Supabase  
> **Módulo de referencia:** Reservas  
> **Enfoque arquitectónico:** Clean Architecture dentro de cada módulo del monolito modular  
> **Nivel C4:** 4 – Código · **Versión:** 1.0

---

## 1. Propósito

Este documento describe **cómo se organiza el código dentro de un módulo** del backend. Tiene tres objetivos:

- que todos los módulos de la aplicación (Usuarios, Catálogo, Reservas) se construyan con la misma estructura;
- que las reglas de negocio (ej. validación Anti-Overbooking) queden aisladas de la tecnología (Supabase, Yape);
- que cualquier integrante del proyecto sepa exactamente dónde va cada archivo y de qué puede depender.

## 2. Estructura de carpetas

```text
src/
└── modules/
    └── reservas/
        ├── dominio/
        │   ├── reserva.ts                   Entidad Reserva y sus reglas
        │   ├── equipo-extra.ts              Objeto de valor para alquiler de equipos
        │   ├── estado-reserva.ts            Enumeración (Pendiente, Confirmada, Cancelada)
        │   ├── reserva-repository.ts        Interfaz (puerto) de persistencia
        │   ├── pago-port.ts                 Interfaz (puerto) de cobro
        │   └── resultado-pago.ts            DTO de respuesta de la pasarela
        ├── aplicacion/
        │   ├── crear-reserva.use-case.ts    Caso de uso CrearReserva
        │   └── crear-reserva.command.ts     Datos de entrada del caso de uso
        ├── infraestructura/
        │   ├── supabase-reserva-repository.ts Implementación con BD Supabase
        │   ├── yape-pago.adapter.ts         Implementación con API de Yape
        │   └── plin-pago.adapter.ts         Implementación con API de Plin
        ├── presentacion/
        │   ├── reserva.controller.ts        Traduce HTTP ⇄ caso de uso
        │   └── reservas.routes.ts           Rutas /api/v1/reservas
        ├── reservas.module.ts               Raíz de composición del módulo
        └── index.ts                         API pública del módulo
```

| Archivo | Capa | Responsabilidad | Importa de |
|---|---|---|---|
| `reserva.ts` | Dominio | Crear reservas válidas, evitar overbooking lógico, calcular total | Solo dominio |
| `equipo-extra.ts` | Dominio | Representar un instrumento/equipo adicional y su precio | Nada |
| `estado-reserva.ts` | Dominio | Definir los estados posibles de la reserva | Nada |
| `reserva-repository.ts` | Dominio | Declarar **qué** operaciones de persistencia necesita el módulo | `reserva.ts` |
| `pago-port.ts` | Dominio | Declarar **qué** necesita el módulo para validar pagos | `resultado-pago.ts` |
| `crear-reserva.use-case.ts` | Aplicación | Coordinar la validación, cobro y guardado | Dominio |
| `crear-reserva.command.ts` | Aplicación | Datos de entrada validados del caso de uso | Nada |
| `supabase-reserva-repository.ts` | Infraestructura | Guardar y leer reservas en PostgreSQL vía Supabase | Dominio + SDK Supabase |
| `yape-pago.adapter.ts` | Infraestructura | Traducir `cobrar()` a la API externa de Yape | Dominio + API Yape |
| `reserva.controller.ts` | Presentación | Leer la petición HTTP, invocar el caso de uso y responder | Aplicación |
| `reservas.module.ts` | Composición | Crear las instancias concretas e inyectarlas | Todas las capas |

---

## 3. Capas del módulo y regla de dependencia

**Regla de dependencia:** el código solo puede importar hacia el centro (dominio). El dominio no conoce Express, Supabase ni Yape.

| Capa | Contiene | Responsabilidad | Puede depender de | **No** puede depender de |
|---|---|---|---|---|
| **Dominio** | Entidades, objetos de valor, interfaces (puertos) | Reglas de negocio puras (Anti-overbooking, cálculo de horas) | Nada externo | Aplicación, infraestructura, presentación, Express, Supabase, Yape |
| **Aplicación** | Casos de uso, comandos | Orquestar el flujo de la reserva | Dominio | Infraestructura, presentación, BD |
| **Infraestructura** | Repositorios, adaptadores externos | Implementar persistencia y pasarelas de pago | Dominio, SDK externos | Aplicación, presentación |
| **Presentación** | Controladores, rutas | Traducir HTTP (móvil) a llamadas de caso de uso | Aplicación | Infraestructura, base de datos |

> **Cómo comprobarlo en el código:** Si en la carpeta `dominio/` aparece un import de `@supabase/supabase-js` o `yape-sdk`, la arquitectura se rompió.

---

## 4. Flujo de ejecución: Crear Reserva

| Paso | Origen → destino | Acción | Capa |
|---|---|---|---|
| 1 | App Móvil → `ReservaController` | `POST /api/v1/reservas` con `clienteId`, `salaId`, `horarios` y `tokenYape` | Presentación |
| 2 | `ReservaController` → `CrearReservaUseCase` | `ejecutar(cmd)` | Presentación → Aplicación |
| 3 | `CrearReservaUseCase` → `ReservaRepository` | Busca si la sala está libre en ese horario (Regla Anti-Overbooking) | Aplicación → Infraestructura |
| 4 | `CrearReservaUseCase` → `Reserva` | Si está libre, `crear(...)`; estado PENDIENTE | Aplicación → Dominio |
| 5 | `CrearReservaUseCase` → `Reserva` | `calcularTotal()` (horas de sala + equipos extra) | Aplicación → Dominio |
| 6 | `CrearReservaUseCase` → `PagoPort` | `cobrar(total, tokenYape)` | Aplicación → Dominio (interfaz) |
| 7 | `YapePagoAdapter` → API Yape | Solicitud de validación de pago por HTTPS | Infraestructura → externo |
| 8 | `CrearReservaUseCase` → `Reserva` | Si es aprobado: `marcarConfirmada(numOperacion)` | Aplicación → Dominio |
| 9 | `CrearReservaUseCase` → `ReservaRepository` | `guardar(reserva)` | Aplicación → Dominio (interfaz) |
| 10 | `SupabaseReservaRepository` → Supabase | `INSERT` en PostgreSQL | Infraestructura → BD |
| 11 | `ReservaController` → App Móvil | `201 Created` con `reservaId` | Presentación |

---

## 5. Código de referencia

### 5.1 Dominio · Entidad e interfaces

```ts
// dominio/reserva.ts
import { EquipoExtra } from './equipo-extra';
import { EstadoReserva } from './estado-reserva';
import { ReglaNegocioError } from '../../../shared/errores';

export class Reserva {
  private constructor(
    readonly id: string,
    readonly salaId: string,
    readonly clienteId: string,
    readonly fecha: string,
    readonly horas: number,
    private readonly equipos: EquipoExtra[],
    private estado: EstadoReserva,
    private numOperacionYape?: string,
  ) {}

  static crear(salaId: string, clienteId: string, fecha: string, horas: number, equipos: EquipoExtra[]): Reserva {
    if (!salaId || !clienteId) throw new ReglaNegocioError('RN-01: La reserva requiere cliente y sala');
    if (horas < 1) throw new ReglaNegocioError('RN-02: El mínimo de ensayo es 1 hora');
    return new Reserva(crypto.randomUUID(), salaId, clienteId, fecha, horas, equipos, EstadoReserva.PENDIENTE);
  }

  calcularTotal(precioSalaPorHora: number): number {
    const totalSala = this.horas * precioSalaPorHora;
    const totalEquipos = this.equipos.reduce((suma, eq) => suma + eq.precioAlquiler, 0);
    return totalSala + totalEquipos;
  }

  marcarConfirmada(numOperacion: string): void {
    if (this.estado !== EstadoReserva.PENDIENTE) {
      throw new ReglaNegocioError('RN-03: Solo una reserva pendiente puede confirmarse');
    }
    this.estado = EstadoReserva.CONFIRMADA;
    this.numOperacionYape = numOperacion;
  }
}
```

```ts
// dominio/reserva-repository.ts
import { Reserva } from './reserva';

export interface ReservaRepository {
  verificarDisponibilidad(salaId: string, fecha: string, horaInicio: string): Promise<boolean>;
  guardar(reserva: Reserva): Promise<void>;
}
```

```ts
// dominio/pago-port.ts
export interface ResultadoPago {
  aprobado: boolean;
  numOperacion?: string;
  motivoRechazo?: string;
}

export interface PagoPort {
  validarPago(monto: number, numeroCelular: string, codigoAprobacion: string): Promise<ResultadoPago>;
}
```

### 5.2 Aplicación · Caso de uso

```ts
// aplicacion/crear-reserva.use-case.ts
import { Reserva } from '../dominio/reserva';
import { ReservaRepository } from '../dominio/reserva-repository';
import { PagoPort } from '../dominio/pago-port';
import { CrearReservaCommand } from './crear-reserva.command';
import { PagoRechazadoError, SalaOcupadaError } from '../../../shared/errores';

export class CrearReservaUseCase {
  constructor(
    private readonly reservaRepo: ReservaRepository, // Interfaz, ignora si es Supabase
    private readonly pagoPort: PagoPort,             // Interfaz, ignora si es Yape
  ) {}

  async ejecutar(cmd: CrearReservaCommand): Promise<string> {
    // 1. Regla Anti-Overbooking
    const disponible = await this.reservaRepo.verificarDisponibilidad(cmd.salaId, cmd.fecha, cmd.horaInicio);
    if (!disponible) throw new SalaOcupadaError('La sala ya está reservada en ese horario');

    // 2. Creación de Entidad
    const reserva = Reserva.crear(cmd.salaId, cmd.clienteId, cmd.fecha, cmd.horas, cmd.equipos);
    
    // NOTA: precioSalaPorHora debería venir del módulo Catálogo internamente
    const total = reserva.calcularTotal(30.00); 

    // 3. Procesar Pago
    const cobro = await this.pagoPort.validarPago(total, cmd.celularYape, cmd.codigoYape);
    if (!cobro.aprobado) throw new PagoRechazadoError(cobro.motivoRechazo);

    // 4. Confirmar y Persistir
    reserva.marcarConfirmada(cobro.numOperacion!);
    await this.reservaRepo.guardar(reserva);
    
    return reserva.id;
  }
}
```

### 5.3 Infraestructura · Adaptador

```ts
// infraestructura/yape-pago.adapter.ts
import { PagoPort, ResultadoPago } from '../dominio/pago-port';
// import yapeClient from 'yape-sdk-node'; 

export class YapePagoAdapter implements PagoPort {
  async validarPago(monto: number, celular: string, codigo: string): Promise<ResultadoPago> {
    // Aquí iría la integración real con el API de Yape o Culqi
    const response = await mockYapeApi.validate(celular, monto, codigo);
    
    return {
      aprobado: response.status === 'OK',
      numOperacion: response.transactionId,
      motivoRechazo: response.status !== 'OK' ? 'Fondos insuficientes o código inválido' : undefined,
    };
  }
}
```