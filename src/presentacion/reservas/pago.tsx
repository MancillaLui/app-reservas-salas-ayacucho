'use client';
import {useEffect,useState} from 'react';
import type {Reserva,EscenarioPago,EscenarioMensaje} from '../../shared/tipos';
import {api} from '../compartido/api';
import {dinero} from '../compartido/formatos';
import {useAccion} from '../compartido/hooks';
import {Avisos,Simulacion} from '../compartido/ui';
export function PagoReserva({reserva,completado}:{reserva:Reserva;completado:(r:Reserva)=>void}){
  const [escenario,setEscenario]=useState<EscenarioPago>('aprobado'),[mensaje,setMensaje]=useState<EscenarioMensaje>('normal'),[ahora,setAhora]=useState(0);const a=useAccion();
  useEffect(()=>{setAhora(Date.now());const t=setInterval(()=>setAhora(Date.now()),1000);return()=>clearInterval(t);},[]);
  const segundos=reserva.vence_en?Math.max(0,Math.ceil((Date.parse(reserva.vence_en)-ahora)/1000)):0;
  const vencida=ahora>0&&segundos===0;
  async function pagar(){await a.ejecutar(async()=>{const result=await api<Reserva>(`reservas/${reserva.id}/pago`,'POST',{escenario,mensaje},{'Idempotency-Key':`web-${reserva.id}`});completado(result);});}
  return <section className="pago-reserva"><Simulacion/><div className="pago-importe"><div><p className="ceja">TU HORARIO ESTÁ PROTEGIDO</p><h2>Confirma tu ensayo</h2></div><strong>{dinero(reserva.total_centimos)}</strong></div><div className={`reloj ${vencida?'vencido':''}`} role="timer">{vencida?'El tiempo de pago terminó. Consulta el estado y crea una nueva reserva si expiró.':`Tiempo restante: ${ahora?String(Math.floor(segundos/60)).padStart(2,'0')+':'+String(segundos%60).padStart(2,'0'):'…'}`}</div><p>La reserva se confirma cuando el simulador aprueba el pago. No se realiza ningún cobro bancario.</p><details className="opciones-demo"><summary>Opciones de la demostración</summary><label>Resultado del pago<select value={escenario} onChange={e=>setEscenario(e.target.value as EscenarioPago)}><option value="aprobado">Aprobado</option><option value="rechazado">Rechazado</option><option value="demora">Aprobado con demora</option><option value="fallo">Resultado incierto</option></select></label><label>Envío del comprobante<select value={mensaje} onChange={e=>setMensaje(e.target.value as EscenarioMensaje)}><option value="normal">Normal</option><option value="demora">Con demora</option><option value="fallo">Con fallo</option></select></label></details><Avisos error={a.error}/><button className="boton ancho" onClick={()=>void pagar()} disabled={a.ocupado||vencida||!ahora}>{a.ocupado?'Procesando pago…':'Confirmar pago simulado'}</button>{a.error&&<p className="nota">Si el resultado es incierto, conserva esta reserva y espera la conciliación del administrador. No realices un segundo cobro.</p>}</section>;
}
