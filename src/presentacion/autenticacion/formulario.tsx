'use client';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {useEffect,useState,type FormEvent} from 'react';
import {supabaseBrowser} from '../../app/cliente';
import {useSesion} from '../compartido/sesion';
import {retornoSeguro} from '../compartido/formatos';
import {useAccion} from '../compartido/hooks';
import {Avisos,Marca} from '../compartido/ui';
import {ArteMusical} from '../publico/arte';
export function FormularioAuth({registro=false}:{registro?:boolean}){
  const [email,setEmail]=useState(''),[password,setPassword]=useState(''),[ver,setVer]=useState(false),[creada,setCreada]=useState(false);
  const {actor,estado,actualizar}=useSesion();const router=useRouter();const a=useAccion();
  const [next,setNext]=useState<string|null>(null);
  useEffect(()=>setNext(new URLSearchParams(window.location.search).get('next')),[]);
  useEffect(()=>{if(estado==='autenticado'&&actor)router.replace(retornoSeguro(new URLSearchParams(window.location.search).get('next'),actor.role));},[estado,actor,router]);
  async function enviar(e:FormEvent){e.preventDefault();await a.ejecutar(async()=>{
    const client=supabaseBrowser();if(!client)throw new Error('El acceso todavía no está configurado. Contacta con el administrador.');
    const result=registro?await client.auth.signUp({email:email.trim(),password,options:{emailRedirectTo:window.location.origin+'/ingresar'}}):await client.auth.signInWithPassword({email:email.trim(),password});
    if(result.error)throw new Error(result.error.message);
    setPassword('');
    if(registro&&!result.data.session){setCreada(true);a.setMensaje('Revisa tu correo y abre el enlace de confirmación. Después podrás iniciar sesión.');return;}
    const user=await actualizar();if(user)router.replace(retornoSeguro(next,user.role));else throw new Error('No pudimos verificar tu perfil. Vuelve a iniciar sesión.');
  });}
  const suffix=next?'?next='+encodeURIComponent(next):'';
  return <main className="auth-pagina"><section className="auth-ilustracion"><Marca/><div><p className="ceja">TU PRÓXIMA SESIÓN EMPIEZA AQUÍ</p><h1>Tu banda<br/>tiene un<br/><em>lugar.</em></h1><p>Un espacio para encontrarse, crear y hacer sonar lo que llevan dentro.</p></div><ArteMusical compacto/><span>AYACUCHO · MÚSICA EN COMUNIDAD</span></section><section className="auth-formulario"><Link href="/" className="enlace">Volver al inicio</Link><div className="auth-caja"><p className="ceja">BIENVENIDO A ENSAYA</p><h2>{registro?'Crea tu espacio.':'Qué bueno verte.'}</h2><p>{registro?'Regístrate para organizar tus ensayos y tener tus reservas a mano.':'Inicia sesión para seguir preparando tu próximo ensayo.'}</p><Avisos error={a.error} mensaje={a.mensaje}/>{creada?<div className="confirmacion-correo"><span aria-hidden="true">✉</span><h3>Confirma tu correo</h3><p>Enviamos las instrucciones a <strong>{email}</strong>. Revisa también la carpeta de spam.</p><Link className="boton" href={'/ingresar'+suffix}>Ir a iniciar sesión</Link></div>:<form onSubmit={enviar}><label>Correo electrónico<input type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="tu@correo.com"/></label><label>Contraseña<div className="campo-password"><input aria-label="Contraseña" type={ver?'text':'password'} autoComplete={registro?'new-password':'current-password'} minLength={6} required value={password} onChange={e=>setPassword(e.target.value)}/><button type="button" onClick={()=>setVer(!ver)} aria-label={ver?'Ocultar contraseña':'Mostrar contraseña'}>{ver?'Ocultar':'Mostrar'}</button></div></label>{registro&&<p className="nota">Usa al menos 6 caracteres. Las cuentas nuevas se crean con rol de cliente.</p>}<button className="boton ancho" disabled={a.ocupado}>{a.ocupado?'Verificando…':registro?'Crear cuenta':'Iniciar sesión'}</button></form>}<p className="auth-alternativa">{registro?'¿Ya tienes cuenta?':'¿Primera vez por aquí?'} <Link href={(registro?'/ingresar':'/registro')+suffix}>{registro?'Inicia sesión':'Crea tu cuenta'}</Link></p><p className="nota">Tus permisos se verifican con el servidor. El acceso administrativo depende del rol de tu cuenta.</p></div></section></main>;
}
