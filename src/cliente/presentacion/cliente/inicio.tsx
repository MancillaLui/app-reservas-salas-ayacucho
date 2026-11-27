'use client';
import Link from 'next/link';
import type {Reserva} from '../../../compartido/contratos/tipos';
import {useRecurso} from '../compartido/hooks';
import {Avisos,CabeceraPagina,Cargando,LimiteLista,Vacio} from '../compartido/ui';
import {TablaReservas} from '../reservas/lista';
import {ArteMusical} from '../publico/arte';
export function InicioCliente(){
  const r=useRecurso<Reserva[]>('reservas');const proximas=(r.datos??[]).filter(x=>Date.parse(x.fin)>Date.now()&&['PENDIENTE','PROCESANDO','CONFIRMADA'].includes(x.estado)).sort((a,b)=>Date.parse(a.inicio)-Date.parse(b.inicio));
  const pendiente=proximas.find(x=>x.estado==='PENDIENTE');
  return <><CabeceraPagina ceja="BIENVENIDO A TU ESPACIO" titulo="Hola, ¿cuándo ensayamos?" descripcion="Reserva tu sala y encuentra aquí todo lo necesario para tu próximo ensayo."/>{pendiente&&<section className="aviso aviso-pendiente"><div><strong>Tienes una reserva pendiente de pago</strong><p>Completa el pago antes de su vencimiento para conservar el horario.</p></div><Link className="boton" href={`/cliente/reservas/${pendiente.id}`}>Completar pago</Link></section>}<section className="cliente-destacado"><div><p className="ceja">TU PRÓXIMA CANCIÓN TE ESPERA</p><h2>Tu banda pone la música.<br/><em>Nosotros, el espacio.</em></h2><Link className="boton" href="/reservar">Reservar sala</Link></div><ArteMusical compacto/></section><div className="linea-titulo margen-seccion"><div><p className="ceja">LO QUE VIENE</p><h2>Tus próximos ensayos</h2></div><Link className="enlace" href="/cliente/reservas">Ver todas mis reservas</Link></div><section className="tarjeta"><Avisos error={r.error}/>{r.cargando?<Cargando/>:proximas.length?<TablaReservas lista={proximas.slice(0,5)}/>:<Vacio titulo="El próximo ensayo lo eliges tú" descripcion="Encuentra una sala libre y prepara tu primera sesión." href="/reservar"/>}<LimiteLista/></section></>;
}
