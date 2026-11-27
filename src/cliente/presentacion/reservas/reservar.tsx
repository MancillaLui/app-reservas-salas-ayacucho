'use client';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {useEffect,useRef,useState} from 'react';
import type {Recurso,Reserva} from '../../../compartido/contratos/tipos';
import {api} from '../compartido/api';
import {dinero,fecha,localISO,manana} from '../compartido/formatos';
import {useAccion,useRecurso} from '../compartido/hooks';
import {Publico} from '../compartido/navegacion';
import {useSesion} from '../compartido/sesion';
import {Avisos,CabeceraPagina,Cargando,Simulacion} from '../compartido/ui';
import {PagoReserva} from './pago';
type Disponibilidad={salas:{id:string;disponible:boolean}[];equipos:{id:string;disponible:number}[]};
type Seleccion={inicio:string;fin:string;salaId:string;cantidades:Record<string,number>;paso:number;pendienteId?:string;propietario?:string;guardado:number};
const CLAVE='ensaya.reserva.v2';
const pasos=['Horario','Sala','Equipos','Revisión','Pago'];
export function Reservar(){
  const {actor,estado}=useSesion();const router=useRouter(),a=useAccion();
  const salas=useRecurso<Recurso[]>('salas'),equipos=useRecurso<Recurso[]>('equipos');
  const [inicio,setInicio]=useState(''),[fin,setFin]=useState(''),[salaId,setSala]=useState(''),[cantidades,setCantidades]=useState<Record<string,number>>({}),[paso,setPaso]=useState(0),[categoria,setCategoria]=useState('');
  const [listo,setListo]=useState(false),[disponibilidad,setDisponibilidad]=useState<Disponibilidad|null>(null),[ocupados,setOcupados]=useState<{inicio:string;fin:string}[]|null>(null),[pendiente,setPendiente]=useState<Reserva|null>(null),[errorCalendario,setErrorCalendario]=useState('');
  const restaurar=useRef<{id:string;propietario?:string}|null>(null);
  useEffect(()=>{
    let draft:Seleccion|null=null;
    try{const raw=sessionStorage.getItem(CLAVE);if(raw){const x=JSON.parse(raw);if(x&&typeof x.inicio==='string'&&typeof x.fin==='string'&&typeof x.salaId==='string'&&x.cantidades&&typeof x.cantidades==='object'&&Date.now()-x.guardado<86400000)draft=x;}}catch{}
    const dia=manana();setInicio(draft?.inicio??`${dia}T18:00`);setFin(draft?.fin??`${dia}T20:00`);
    setSala(new URLSearchParams(window.location.search).get('sala')??draft?.salaId??'');setCantidades(draft?.cantidades??{});
    setPaso(draft?Math.min(3,Math.max(0,Number(draft.paso)||0)):0);
    if(draft?.pendienteId)restaurar.current={id:draft.pendienteId,propietario:draft.propietario};
    setListo(true);
  },[]);
  useEffect(()=>{if(salas.datos?.length)setSala(id=>salas.datos!.some(s=>s.id===id)?id:salas.datos![0].id);},[salas.datos]);
  useEffect(()=>{
    if(!listo)return;
    // Persist only the selection, never a token, password, price, or payment code.
    try{sessionStorage.setItem(CLAVE,JSON.stringify({inicio,fin,salaId,cantidades,paso,pendienteId:pendiente?.id??restaurar.current?.id,propietario:pendiente?actor?.id:restaurar.current?.propietario,guardado:Date.now()}));}catch{}
  },[listo,inicio,fin,salaId,cantidades,paso,pendiente,actor?.id]);
  useEffect(()=>{
    if(estado!=='autenticado'||!actor||!restaurar.current)return;
    const guardada=restaurar.current;restaurar.current=null;
    if(guardada.propietario!==actor.id)return;
    let activo=true;
    api<Reserva>(`reservas/${guardada.id}`).then(r=>{if(activo&&r.estado==='PENDIENTE'){setPendiente(r);setPaso(4);}}).catch(()=>{});
    return()=>{activo=false;};
  },[estado,actor]);
  useEffect(()=>{setDisponibilidad(null);},[inicio,fin]);
  const dia=inicio.slice(0,10);
  useEffect(()=>{
    if(!salaId||!dia)return;let vigente=true;setOcupados(null);setErrorCalendario('');
    const cargar=()=>api<{inicio:string;fin:string}[]>(`calendario?${new URLSearchParams({salaId,fecha:dia})}`).then(r=>{if(vigente){setOcupados(r);setErrorCalendario('');}}).catch(e=>{if(vigente)setErrorCalendario(e.message);});
    void cargar();const timer=setInterval(cargar,30000);return()=>{vigente=false;clearInterval(timer);};
  },[salaId,dia]);
  const sala=salas.datos?.find(s=>s.id===salaId);
  const extras=(equipos.datos??[]).filter(e=>(cantidades[e.id]??0)>0);
  const duracion=(Date.parse(localISO(fin))-Date.parse(localISO(inicio)))/3600000;
  const estimado=Number.isFinite(duracion)&&sala?Math.round(Math.max(0,duracion)*sala.precio_centimos)+extras.reduce((n,e)=>n+e.precio_centimos*cantidades[e.id],0):0;
  async function consultar(){const result=await api<Disponibilidad>(`disponibilidad?${new URLSearchParams({inicio:localISO(inicio),fin:localISO(fin)})}`);setDisponibilidad(result);return result;}
  async function continuar(){await a.ejecutar(async()=>{
    if(paso===0){if(!inicio||!fin||!(duracion>0&&duracion<=24)||Date.parse(localISO(inicio))<=Date.now())throw new Error('Elige un intervalo futuro de hasta 24 horas.');await consultar();}
    if(paso===1){const d=disponibilidad??await consultar();if(!sala||!d.salas.some(s=>s.id===salaId&&s.disponible))throw new Error('La sala no está disponible en tu horario. Elige otro espacio u horario.');}
    if(paso===2){const d=await consultar();for(const e of extras){const n=cantidades[e.id];if(!Number.isInteger(n)||n<1||n>(d.equipos.find(x=>x.id===e.id)?.disponible??0))throw new Error(`Revisa la cantidad de ${e.nombre}; la disponibilidad cambió.`);}}
    setPaso(p=>Math.min(3,p+1));
  });}
  async function crear(){await a.ejecutar(async()=>{
    if(!actor){router.push('/ingresar?next=%2Freservar');return;}
    const r=await api<Reserva>('reservas','POST',{salaId,inicio:localISO(inicio),fin:localISO(fin),equipos:extras.map(e=>({equipoId:e.id,cantidad:cantidades[e.id]}))});
    setPendiente(r);setPaso(4);
  });}
  function pagado(r:Reserva){try{sessionStorage.removeItem(CLAVE);}catch{}router.push(`${actor?.role==='ADMIN'?'/admin':'/cliente'}/reservas/${r.id}`);}
  return <Publico><div className="contenedor pagina-reserva"><CabeceraPagina ceja="TU PRÓXIMO ENSAYO" titulo="Arma tu próxima sesión." descripcion="Un espacio, tu equipo y las ganas de hacer música."/><ol className="pasos-reserva" aria-label="Progreso de reserva">{pasos.map((p,i)=><li key={p} className={i===paso?'actual':i<paso?'completo':''} aria-current={i===paso?'step':undefined}><span>{i<paso?'✓':i+1}</span>{p}</li>)}</ol><Simulacion/><Avisos error={a.error||salas.error||equipos.error}/>{!listo||salas.cargando||equipos.cargando?<Cargando/>:<div className="reserva-layout"><section className="tarjeta reserva-paso" key={paso}>
      {paso===0&&<><p className="ceja">ENCUENTRA EL MOMENTO</p><h2>¿Cuándo ensayamos?</h2><p>Elige inicio y fin. Todos los horarios se muestran en hora de Perú.</p><div className="campos-dobles"><label>Inicio<input type="datetime-local" value={inicio} onChange={e=>setInicio(e.target.value)} required/></label><label>Fin<input type="datetime-local" value={fin} onChange={e=>setFin(e.target.value)} required/></label></div><div className="ayuda-reserva"><span aria-hidden="true">◷</span><p>Las salas se cobran por hora de uso. Puedes reservar un intervalo de hasta 24 horas.</p></div></>}
      {paso===1&&<><p className="ceja">DALE UN LUGAR A TU SONIDO</p><h2>Elige tu sala</h2><div className="opciones-sala">{salas.datos?.map(s=>{const libre=disponibilidad?.salas.find(x=>x.id===s.id)?.disponible;return <button key={s.id} className={`opcion-sala ${salaId===s.id?'elegida':''}`} disabled={libre===false} aria-pressed={salaId===s.id} onClick={()=>setSala(s.id)}><span className="opcion-inicial" aria-hidden="true">{s.nombre.replace(/^Sala\s+/i,'').charAt(0)}</span><div><h3>{s.nombre}</h3><p>{s.descripcion}</p><span className="etiqueta">{libre===false?'Horario ocupado':'Disponible en tu horario'}</span></div><strong>{dinero(s.precio_centimos)}<small>/hora</small></strong></button>;})}</div><div className="calendario"><h3>Horas de {sala?.nombre}</h3><p className="nota">{dia} · Lima. Seleccionar una hora ajusta la duración a una hora y vuelve a consultar los espacios.</p><Avisos error={errorCalendario}/><div className="horas">{Array.from({length:16},(_,i)=>i+8).map(h=>{const start=`${dia}T${String(h).padStart(2,'0')}:00`,a=Date.parse(localISO(start)),ocupado=ocupados?.some(r=>Date.parse(r.inicio)<a+3600000&&Date.parse(r.fin)>a);return <button key={h} className={inicio===start?'elegida':''} disabled={!ocupados||ocupado||a<=Date.now()} onClick={()=>{setInicio(start);setFin(new Date(a+3600000-5*3600000).toISOString().slice(0,16));setPaso(0);}}>{h}:00<small>{ocupado?'Ocupado':!ocupados?'Consultando':'Libre'}</small></button>;})}</div></div></>}
      {paso===2&&<><p className="ceja">COMPLETA TU SET</p><div className="linea-titulo"><h2>Que no falte nada.</h2><label>Categoría<select aria-label="Categoría de equipos" value={categoria} onChange={e=>setCategoria(e.target.value)}><option value="">Todas</option>{Array.from(new Set(equipos.datos?.map(e=>e.categoria))).map(c=><option key={c}>{c}</option>)}</select></label></div><p>Los extras se cobran por unidad y ensayo. También puedes continuar sin equipos.</p><div className="equipos-reserva">{equipos.datos?.filter(e=>!categoria||e.categoria===categoria).map(e=>{const stock=disponibilidad?.equipos.find(x=>x.id===e.id)?.disponible??e.stock;return <article className="equipo-reserva" key={e.id}><span className="equipo-icono" aria-hidden="true">♫</span><div><h3>{e.nombre}</h3><p>{dinero(e.precio_centimos)} por ensayo · {stock} disponibles</p></div><label>Cantidad<input aria-label={`Cantidad de ${e.nombre}`} type="number" min={0} max={stock} value={cantidades[e.id]??0} onChange={ev=>setCantidades({...cantidades,[e.id]:Math.max(0,Math.min(stock,Number(ev.target.value)||0))})}/></label></article>;})}</div></>}
      {paso===3&&<><p className="ceja">ANTES DE SUBIR EL VOLUMEN</p><h2>Todo listo para tu ensayo.</h2><div className="revision-sala"><span aria-hidden="true">♫</span><div><h3>{sala?.nombre}</h3><p>{fecha(localISO(inicio))}<br/>hasta {fecha(localISO(fin))}</p></div></div><h3>Equipos seleccionados</h3>{extras.length?extras.map(e=><div key={e.id} className="fila-resumen"><span>{cantidades[e.id]} × {e.nombre}</span><strong>{dinero(e.precio_centimos*cantidades[e.id])}</strong></div>):<p>Ensayo sin equipos adicionales.</p>}<div className="ayuda-reserva"><p>Al reservar protegemos sala y equipos durante diez minutos. El servidor comprobará el stock y calculará el importe definitivo.</p></div><p className="nota">Puedes cancelar antes del inicio. Los reembolsos se gestionan manualmente.</p>{!actor&&<p className="aviso informativo">Inicia sesión para confirmar. Conservaremos tu selección.</p>}</>}
      {paso===4&&pendiente&&<PagoReserva reserva={pendiente} completado={pagado}/>}
      {paso<4&&<div className="acciones navegacion-pasos">{paso>0&&<button className="boton secundario" disabled={a.ocupado} onClick={()=>setPaso(p=>p-1)}>Anterior</button>}<button className="boton" disabled={a.ocupado||!salas.datos?.length||estado==='cargando'} onClick={()=>void(paso===3?crear():continuar())}>{a.ocupado?'Comprobando…':paso===3?(actor?'Reservar mi horario':'Iniciar sesión y continuar'):'Continuar'}</button></div>}
    </section><aside className="tarjeta resumen-reserva"><p className="ceja">TU SESIÓN</p><h2>Suena a buen plan.</h2><span className="resumen-icono" aria-hidden="true">♬</span><div className="fila-resumen"><span>Sala</span><strong>{sala?.nombre??'Por elegir'}</strong></div><p>{inicio&&fecha(localISO(inicio))}<br/>{Number.isFinite(duracion)&&duracion>0?`${duracion} horas de ensayo`:''}</p>{extras.map(e=><div className="fila-resumen" key={e.id}><span>{cantidades[e.id]} × {e.nombre}</span><strong>{dinero(e.precio_centimos*cantidades[e.id])}</strong></div>)}<div className="total-reserva"><span>{pendiente?'Total confirmado':'Total estimado'}</span><strong>{dinero(pendiente?.total_centimos??estimado)}</strong></div><p className="nota">Sala por duración real. Equipos por ensayo. Tarifas definitivas validadas en el servidor.</p>{pendiente&&<Link className="enlace" href={`${actor?.role==='ADMIN'?'/admin':'/cliente'}/reservas/${pendiente.id}`}>Ver estado de mi reserva</Link>}</aside></div>}</div></Publico>;
}
