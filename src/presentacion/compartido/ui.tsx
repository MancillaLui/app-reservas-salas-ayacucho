'use client';
import Link from 'next/link';
import type {Reserva} from '../../shared/tipos';
export function Marca(){return <Link href="/" className="marca" aria-label="ENSAYA, inicio"><span className="marca-signo" aria-hidden="true">≋</span><span>ENSAYA<small>AYACUCHO</small></span></Link>;}
export function Avisos({error,mensaje}:{error?:string;mensaje?:string}){return <div className="avisos" aria-live="polite">{error&&<p className="aviso error" role="alert">{error}</p>}{mensaje&&<p className="aviso exito" role="status">{mensaje}</p>}</div>;}
export function Cargando({texto='Cargando tu espacio…'}:{texto?:string}){return <div className="cargando" role="status"><span className="pulso"/>{texto}</div>;}
export function Vacio({titulo,descripcion,href,accion}:{titulo:string;descripcion:string;href?:string;accion?:string}){return <div className="vacio"><span aria-hidden="true">♬</span><h3>{titulo}</h3><p>{descripcion}</p>{href&&<Link className="boton" href={href}>{accion??'Reservar un ensayo'}</Link>}</div>;}
export function Estado({estado}:{estado:string}){return <span className={`estado estado-${estado.toLowerCase()}`}>{estado.replaceAll('_',' ')}</span>;}
export function CabeceraPagina({ceja,titulo,descripcion,children}:{ceja?:string;titulo:string;descripcion?:string;children?:React.ReactNode}){return <div className="cabecera-pagina"><div>{ceja&&<p className="ceja">{ceja}</p>}<h1>{titulo}</h1>{descripcion&&<p>{descripcion}</p>}</div>{children}</div>;}
export function LimiteLista(){return <p className="nota">Se muestran hasta 200 registros devueltos por la API. Los filtros y resúmenes se aplican a esta lista.</p>;}
export function EnlaceReserva({reserva,admin=false}:{reserva:Reserva;admin?:boolean}){return <Link className="enlace" href={`${admin?'/admin':'/cliente'}/reservas/${reserva.id}`}>Ver detalle</Link>;}
export function Simulacion(){return <p className="simulacion"><span>DEMO ACADÉMICA</span> Pagos y mensajería simulados · sin cobros reales</p>;}
