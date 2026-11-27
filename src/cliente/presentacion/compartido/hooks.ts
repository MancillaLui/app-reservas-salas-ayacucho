'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
import {api} from './api';
export function useRecurso<T>(path:string){
  const [datos,setDatos]=useState<T|null>(null),[cargando,setCargando]=useState(true),[error,setError]=useState('');
  const vigente=useRef(0);
  const recargar=useCallback(async()=>{
    const revision=++vigente.current;setCargando(true);setError('');
    try{const result=await api<T>(path);if(revision===vigente.current)setDatos(result);}
    catch(e){if(revision===vigente.current)setError(e instanceof Error?e.message:'No se pudo cargar la información.');}
    finally{if(revision===vigente.current)setCargando(false);}
  },[path]);
  useEffect(()=>{setDatos(null);void recargar();return()=>{vigente.current++;};},[recargar]);
  return {datos,cargando,error,recargar};
}
export function useAccion(){
  const [ocupado,setOcupado]=useState(false),[error,setError]=useState(''),[mensaje,setMensaje]=useState('');
  const lock=useRef(false);
  async function ejecutar(fn:()=>Promise<void>){if(lock.current)return;lock.current=true;setOcupado(true);setError('');setMensaje('');try{await fn();}catch(e){setError(e instanceof Error?e.message:'No se pudo completar la operación.');}finally{lock.current=false;setOcupado(false);}}
  function limpiar(){setError('');setMensaje('');}
  return {ocupado,error,mensaje,setMensaje,ejecutar,limpiar};
}
