import Link from 'next/link';
import {CabeceraPagina} from './ui';
export function Ayuda({admin=false}:{admin?:boolean}){
 const casos=admin?[
 ['¿Por dónde empiezo cada día?','Consulta Inicio y después Reservas. La agenda diaria organiza los ensayos activos por sala; el listado incluye también reservas canceladas y expiradas.'],
 ['¿Cómo cierro una sala por mantenimiento?','Abre Horarios no disponibles y elige sala, inicio, fin y motivo. El servidor rechazará intervalos que se crucen con reservas activas. Desbloquear vuelve a habilitar el horario.'],
 ['¿Cómo resuelvo un pago incierto?','En Pagos selecciona Por conciliar. Revisa el intento y confirma aprobación o rechazo en el simulador. El horario permanece asignado hasta resolverlo. No es una transacción bancaria.'],
 ['¿Qué ocurre al cancelar?','Registra el motivo de fuerza mayor desde el detalle. Se liberan los recursos según las reglas del servidor. Los pagos aprobados quedan registrados para gestión manual del reembolso.'],
 ['¿Un comprobante fallido cancela la reserva?','No. El worker procesa los envíos en segundo plano; los errores quedan registrados sin revertir la confirmación. No existe reintento automático de entregas fallidas.'],
 ['¿Los indicadores son totales del negocio?','No. La API devuelve hasta 200 registros. Los indicadores y filtros describen solamente esa lista.']
 ]:[
 ['¿Cómo reservo una sala?','Pulsa Reservar sala, elige inicio y fin, selecciona una sala disponible y añade equipos si los necesitas. Revisa el total y confirma tu horario antes del pago simulado.'],
 ['¿Qué incluye el precio?','La sala se cobra por duración real. Los equipos se cobran por cantidad y ensayo. El servidor comprueba las tarifas definitivas y la disponibilidad antes de crear la reserva.'],
 ['¿Por qué tengo diez minutos para pagar?','Durante ese plazo protegemos la sala y los equipos. Si la reserva pendiente vence, se liberan los recursos. Consulta nuevamente la disponibilidad para reservar otra vez.'],
 ['¿Puedo omitir los equipos?','Sí. Los equipos adicionales son opcionales. Puedes omitir este paso y volver atrás antes de crear la reserva, conservando tu selección.'],
 ['¿Cómo cancelo un ensayo?','En Mis reservas abre Ver detalle y pulsa Cancelar reserva antes de su inicio. Indica un motivo. Si hubo pago aprobado, su reembolso queda pendiente de gestión manual.'],
 ['¿Qué significa pago simulado?','No se cobra dinero ni se solicitan tarjetas. El simulador permite aprobación, rechazo y resultados inciertos. Un pago incierto conserva el horario mientras administración lo concilia.']
 ];
 return <><CabeceraPagina ceja="UN POCO DE AYUDA" titulo="ENSAYA, paso a paso" descripcion={admin?'Organiza el estudio y resuelve las situaciones frecuentes.':'Respuestas sencillas para preparar tu próximo ensayo.'}/><section className="tarjeta ayuda-plataforma">{casos.map(([q,a],i)=><details key={q} open={i===0}><summary>{q}</summary><p>{a}</p></details>)}</section><section className="tarjeta margen-seccion"><h2>Tu siguiente paso</h2><Link className="boton" href={admin?'/admin/reservas':'/reservar'}>{admin?'Consultar reservas':'Reservar sala'}</Link></section></>;
}
