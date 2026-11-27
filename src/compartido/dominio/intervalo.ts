import { exigir } from './errores';
export function validarIntervalo(inicio:string,fin:string,now=Date.now()) {
  const desde=Date.parse(inicio),hasta=Date.parse(fin);
  exigir(Number.isFinite(desde)&&Number.isFinite(hasta)&&/(?:Z|[+-]\d{2}:\d{2})$/.test(inicio)&&/(?:Z|[+-]\d{2}:\d{2})$/.test(fin),400,'INTERVALO_INVALIDO','Usa fechas ISO 8601 con zona horaria.');
  exigir(desde>now&&hasta>desde&&hasta-desde<=24*3600_000,400,'INTERVALO_INVALIDO','El inicio debe ser futuro y la duración mayor a cero y de hasta 24 horas.');
}
