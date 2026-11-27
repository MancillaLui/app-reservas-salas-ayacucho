import { calcularTotal,puedeVer,validarCancelacion,validarEquipos,validarIntervalo,validarPendiente } from '../../src/modulos/reservas/dominio/reglas';
import type { Actor,Reserva } from '../../src/shared/tipos';
const ahora=Date.parse('2026-11-26T12:00:00-05:00');
const inicio='2026-12-01T18:00:00-05:00',fin='2026-12-01T19:30:00-05:00';
const cliente:Actor={id:'cliente',role:'CLIENTE'},admin:Actor={id:'admin',role:'ADMIN'};
const reserva:Reserva={id:'r',cliente_id:'cliente',sala_id:'s',inicio,fin,tipo:'RESERVA',estado:'PENDIENTE',total_centimos:4500,vence_en:'2026-11-26T12:10:00-05:00',motivo:null,creada_en:'2026-11-26T12:00:00-05:00'};
test('valida intervalos futuros con desplazamiento explícito',()=>expect(()=>validarIntervalo(inicio,fin,ahora)).not.toThrow());
test.each([
  ['fecha inválida',fin],['2026-12-01T18:00:00',fin],[inicio,inicio],[fin,inicio],
  ['2026-11-25T18:00:00-05:00',fin],[inicio,'2026-12-03T18:00:00-05:00']
])('rechaza intervalo inválido %s / %s',(a,b)=>expect(()=>validarIntervalo(a,b,ahora)).toThrow());
test('calcula 90 minutos y extras por ensayo en céntimos',()=>expect(calcularTotal(inicio,fin,3000,[{cantidad:2,precio_centimos:1000}])).toBe(6500));
test('redondea una duración fraccionaria a céntimos',()=>expect(calcularTotal(inicio,'2026-12-01T18:01:00-05:00',1000,[])).toBe(17));
test('rechaza total no positivo',()=>expect(()=>calcularTotal(inicio,inicio,3000,[])).toThrow());
test('permite reservas sin equipos',()=>expect(()=>validarEquipos([])).not.toThrow());
test.each([0,-1,1.5,NaN])('rechaza cantidad %s',cantidad=>expect(()=>validarEquipos([{equipoId:'e',cantidad}])).toThrow());
test('rechaza equipos duplicados',()=>expect(()=>validarEquipos([{equipoId:'e',cantidad:1},{equipoId:'e',cantidad:2}])).toThrow());
test('el propietario puede ver su reserva',()=>expect(()=>puedeVer(cliente,reserva)).not.toThrow());
test('no permite ver reservas ajenas',()=>expect(()=>puedeVer({...cliente,id:'otro'},reserva)).toThrow());
test('administrador puede consultar reservas de cualquier cliente',()=>expect(()=>puedeVer(admin,reserva)).not.toThrow());
test('cliente puede cancelar antes del inicio',()=>expect(()=>validarCancelacion(cliente,reserva,ahora)).not.toThrow());
test('cliente no puede cancelar después del inicio',()=>expect(()=>validarCancelacion(cliente,reserva,Date.parse(fin))).toThrow());
test('administrador puede cancelar por fuerza mayor después del inicio',()=>expect(()=>validarCancelacion(admin,reserva,Date.parse(fin))).not.toThrow());
test.each(['CANCELADA','EXPIRADA','PROCESANDO'] as const)('no cancela estado %s',estado=>expect(()=>validarCancelacion(cliente,{...reserva,estado},ahora)).toThrow());
test('no cancela un bloqueo por el flujo de reservas',()=>expect(()=>validarCancelacion(admin,{...reserva,tipo:'BLOQUEO'},ahora)).toThrow());
test('permite pagar una reserva vigente',()=>expect(()=>validarPendiente(reserva,ahora)).not.toThrow());
test('no paga al alcanzar exactamente el vencimiento',()=>expect(()=>validarPendiente(reserva,Date.parse(reserva.vence_en!))).toThrow());
test('no paga una reserva confirmada',()=>expect(()=>validarPendiente({...reserva,estado:'CONFIRMADA'},ahora)).toThrow());
