'use client';
import Link from 'next/link';
import {usePathname,useRouter} from 'next/navigation';
import {useEffect,useState} from 'react';
import {useSesion} from './sesion';
import {destino} from './formatos';
import {Avisos,Cargando,Marca} from './ui';
export function Publico({children}:{children:React.ReactNode}){
  const {actor,estado}=useSesion();
  return <><header className="cabecera-publica"><Marca/><nav aria-label="Principal"><Link href="/#salas">Nuestras salas</Link><Link href="/reservar">Reservar</Link><Link className="boton pequeno" href={actor?destino(actor.role):'/ingresar'}>{actor?'Mi espacio':estado==='cargando'?'Mi cuenta':'Iniciar sesión'}</Link></nav></header><main>{children}</main><footer className="pie"><Marca/><p>Tu espacio. Tu banda. Tu sonido.</p><Link href="/docs">Documentación API</Link></footer></>;
}
export function Protegido({rol,children}:{rol:'ADMIN'|'CLIENTE';children:React.ReactNode}){
  const {actor,estado,error,actualizar}=useSesion();const router=useRouter(),path=usePathname();
  useEffect(()=>{
    // During a concurrent navigation the old layout may still be mounted.
    // It must not redirect a route that already belongs to another layout.
    const base=rol==='ADMIN'?'/admin':'/cliente';
    if(path!==base&&!path.startsWith(base+'/'))return;
    if(estado==='anonimo')router.replace('/ingresar?next='+encodeURIComponent(path));else if(estado==='autenticado'&&actor&&actor.role!==rol)router.replace(destino(actor.role));
  },[estado,actor,rol,path,router]);
  if(estado==='error')return <div className="contenedor"><Avisos error={error}/><button className="boton" onClick={()=>void actualizar()}>Volver a comprobar sesión</button></div>;
  if(estado!=='autenticado'||actor?.role!==rol)return <Cargando texto="Verificando tu sesión y permisos…"/>;
  return children;
}
export function PanelLayout({admin=false,children}:{admin?:boolean;children:React.ReactNode}){
  const {actor,salir}=useSesion();const router=useRouter(),path=usePathname();
  const [abierto,setAbierto]=useState(false),[error,setError]=useState(''),[saliendo,setSaliendo]=useState(false);
  const items=admin?[['/admin','Inicio','◫'],['/admin/reservas','Reservas','▦'],['/admin/catalogo','Salas y equipos','♫'],['/admin/bloqueos','Horarios no disponibles','◷'],['/admin/pagos','Pagos','▤'],['/admin/comprobantes','Comprobantes','▧'],['/admin/ayuda','Ayuda','?']]:[['/cliente','Inicio','◫'],['/cliente/reservas','Mis reservas','▦'],['/reservar','Reservar sala','＋'],['/cliente/ayuda','Ayuda','?']];
  useEffect(()=>setAbierto(false),[path]);
  useEffect(()=>{function cerrar(e:KeyboardEvent){if(e.key==='Escape')setAbierto(false);}window.addEventListener('keydown',cerrar);return()=>window.removeEventListener('keydown',cerrar);},[]);
  async function logout(){setSaliendo(true);try{await salir();window.location.assign('/');}catch(e){setError(e instanceof Error?e.message:'No se pudo cerrar sesión.');setSaliendo(false);}}
  return <div className={`panel-app ${admin?'administrador':'musico'}`}><aside id="navegacion-panel" className={`lateral ${abierto?'abierto':''}`}><Marca/><p className="etiqueta-rol">{admin?'CONTROL DEL ESTUDIO':'ESPACIO DEL MÚSICO'}</p><nav aria-label={admin?'Administración':'Cliente'}>{items.map(([url,label,icon])=><Link key={url} href={url} className={(path===url||(url.endsWith('/reservas')&&path.startsWith(url+'/')))?'activo':''} aria-current={path===url?'page':undefined}><span aria-hidden="true">{icon}</span>{label}</Link>)}</nav><div className="lateral-final"><p>Ayacucho suena mejor<br/><strong>cuando ensayamos.</strong></p><Link href="/">Visitar sitio público</Link><Link href="/docs">API / Swagger</Link></div></aside><div className="area-panel"><header className="barra-panel"><button className="menu-movil boton secundario pequeno" aria-controls="navegacion-panel" aria-expanded={abierto} onClick={()=>setAbierto(!abierto)}>{abierto?'Cerrar menú':'Abrir menú'}</button><span className="ruta-panel">ENSAYA <span>/</span> {admin?'Administración':'Mi espacio'}</span><div className="perfil"><span className="avatar" aria-hidden="true">{actor?.email?.charAt(0).toUpperCase()??'E'}</span><div><strong>{admin?'Administrador':'Músico'}</strong><small>{actor?.email}</small></div><button className="boton texto pequeno" disabled={saliendo} onClick={()=>void logout()}>{saliendo?'Cerrando…':'Salir'}</button></div></header><main id="contenido-panel" className="contenido-panel"><Avisos error={error}/>{children}</main><footer className="pie-panel">ENSAYA · Ayacucho <span>Pagos y mensajes simulados</span></footer></div>{!admin&&<nav className="navegacion-inferior" aria-label="Accesos del músico">{items.map(([url,label,icon])=><Link key={url} href={url} aria-current={path===url?'page':undefined}><span aria-hidden="true">{icon}</span>{label==='Reservar sala'?'Reservar':label}</Link>)}</nav>}</div>;
}
