'use client';
import {createContext,useCallback,useContext,useEffect,useRef,useState} from 'react';
import type {Actor} from '../../shared/tipos';
import {supabaseBrowser} from '../../app/cliente';
import {api,ApiError} from './api';
type Estado='cargando'|'anonimo'|'autenticado'|'error';
type Sesion={actor:Actor|null;estado:Estado;error:string;actualizar:()=>Promise<Actor|null>;salir:()=>Promise<void>};
const Context=createContext<Sesion|null>(null);
export function SesionProvider({children}:{children:React.ReactNode}){
  const [actor,setActor]=useState<Actor|null>(null),[estado,setEstado]=useState<Estado>('cargando'),[error,setError]=useState('');
  const version=useRef(0);
  const actualizar=useCallback(async()=>{
    const revision=++version.current;setEstado('cargando');setError('');
    try{
      const client=supabaseBrowser();const session=client?await client.auth.getSession():null;
      if(session?.error)throw session.error;
      if(!session?.data.session){if(revision===version.current){setActor(null);setEstado('anonimo');}return null;}
      const user=await api<Actor>('yo');
      if(revision===version.current){setActor(user);setEstado('autenticado');}return user;
    }catch(e){if(revision===version.current){setActor(null);setEstado(e instanceof ApiError&&e.status===401?'anonimo':'error');setError(e instanceof Error?e.message:'No se pudo validar tu sesión.');}return null;}
  },[]);
  const salir=useCallback(async()=>{
    const client=supabaseBrowser();if(client){const {error}=await client.auth.signOut();if(error)throw error;}
    version.current++;setActor(null);setEstado('anonimo');
    try{sessionStorage.removeItem('ensaya.reserva.v2');}catch{}
  },[]);
  useEffect(()=>{
    let activo=true;void actualizar();
    const invalidar=()=>{version.current++;setActor(null);setEstado('anonimo');};
    window.addEventListener('ensaya:session-invalid',invalidar);
    const client=supabaseBrowser();
    const subscription=client?.auth.onAuthStateChange((evento,session)=>{
      if(evento==='INITIAL_SESSION')return;
      if(!session){invalidar();return;}
      setTimeout(()=>{if(activo)void actualizar();},0);
    }).data.subscription;
    return()=>{activo=false;version.current++;subscription?.unsubscribe();window.removeEventListener('ensaya:session-invalid',invalidar);};
  },[actualizar]);
  return <Context.Provider value={{actor,estado,error,actualizar,salir}}>{children}</Context.Provider>;
}
export function useSesion(){const value=useContext(Context);if(!value)throw new Error('Falta SesionProvider');return value;}
