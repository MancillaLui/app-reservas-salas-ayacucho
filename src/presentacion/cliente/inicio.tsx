'use client';
import Link from 'next/link';
import type {Reserva} from '../../shared/tipos';
import {useRecurso} from '../compartido/hooks';
import {Avisos,CabeceraPagina,Cargando,LimiteLista,Vacio} from '../compartido/ui';
import {TablaReservas} from '../reservas/lista';
import {ArteMusical} from '../publico/arte';
export function InicioCliente(){
  const r=useRecurso<Reserva[]>('reservas');const proximas=(r.datos??[]).filter(x=>Date.parse(x.fin)>Date.now()&&['PENDIENTE','PROCESANDO','CONFIRMADA'].includes(x.estado)).sort((a,b)=>Date.parse(a.inicio)-Date.parse(b.inicio));
  return <><CabeceraPagina ceja="BIENVENIDO A TU ESPACIO" titulo="Siempre hay algo por crear." descripcion="Organiza tus ensayos y deja espacio para la música."/><section className="cliente-destacado"><div><p className="ceja">TU PRÓXIMA CANCIÓN TE ESPERA</p><h2>Reúne a tu banda.<br/><em>Nosotros ponemos el lugar.</em></h2><Link className="boton lima" href="/reservar">Reservar un ensayo</Link></div><ArteMusical compacto/></section><div className="linea-titulo margen-seccion"><div><p className="ceja">LO QUE VIENE</p><h2>Tus próximos ensayos</h2></div><Link className="enlace" href="/cliente/reservas">Ver todas mis reservas</Link></div><section className="tarjeta"><Avisos error={r.error}/>{r.cargando?<Cargando/>:proximas.length?<TablaReservas lista={proximas.slice(0,5)}/>:<Vacio titulo="El próximo ensayo lo eliges tú" descripcion="Encuentra una sala libre y prepara tu primera sesión." href="/reservar"/>}<LimiteLista/></section></>;
}
