'use client';
import Link from 'next/link';
import type {Reserva} from '../../shared/tipos';
import {useRecurso} from '../compartido/hooks';
import {Avisos,CabeceraPagina,Cargando,LimiteLista,Vacio} from '../compartido/ui';
import {TablaReservas} from '../reservas/lista';
export function ResumenAdmin(){
  const r=useRecurso<Reserva[]>('admin/reservas');const lista=r.datos??[];
  const proximas=lista.filter(x=>Date.parse(x.fin)>Date.now()&&['CONFIRMADA','PENDIENTE','PROCESANDO'].includes(x.estado)).sort((a,b)=>Date.parse(a.inicio)-Date.parse(b.inicio));
  const metricas=[['Reservas en la lista',lista.length,'▦'],['Confirmadas',lista.filter(x=>x.estado==='CONFIRMADA').length,'✓'],['Pendientes de pago',lista.filter(x=>x.estado==='PENDIENTE').length,'◷'],['En procesamiento',lista.filter(x=>x.estado==='PROCESANDO').length,'◫']];
  return <><CabeceraPagina ceja="EL ESTUDIO, EN UN VISTAZO" titulo="Que todo esté listo para sonar." descripcion="Organiza la agenda y prepara cada sesión desde un solo lugar."><button className="boton secundario" disabled={r.cargando} onClick={()=>void r.recargar()}>Actualizar resumen</button></CabeceraPagina><Avisos error={r.error}/>{r.cargando?<Cargando/>:<><section className="metricas">{metricas.map(([nombre,n,icon])=><article className="tarjeta metrica" key={nombre}><div><p>{nombre}</p><strong>{n}</strong></div><span aria-hidden="true">{icon}</span></article>)}</section><LimiteLista/><section className="admin-bienvenida"><div><p className="ceja">PREPARA LA PRÓXIMA SESIÓN</p><h2>Una agenda clara.<br/>Un estudio en armonía.</h2><p>Revisa los horarios que vienen y mantén tus espacios y equipos al día.</p></div><div className="accesos-admin"><Link href="/admin/catalogo">♫<span>Gestionar catálogo</span></Link><Link href="/admin/bloqueos">◷<span>Bloquear un horario</span></Link><Link href="/admin/pagos">▤<span>Revisar pagos</span></Link></div></section><div className="linea-titulo margen-seccion"><h2>Próximas reservas</h2><Link className="enlace" href="/admin/reservas">Ver agenda completa</Link></div><section className="tarjeta">{proximas.length?<TablaReservas lista={proximas.slice(0,6)} admin/>:<Vacio titulo="La agenda está tranquila" descripcion="Las próximas reservas activas aparecerán aquí."/>}</section></>}</>;
}
