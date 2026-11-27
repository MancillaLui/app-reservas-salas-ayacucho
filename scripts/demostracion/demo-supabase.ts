import {config} from 'dotenv';
config({path:'.env.local',quiet:true});
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {Database} from '../../src/servidor/infraestructura/persistencia/database';
import {crearServicios} from '../../src/servidor/composicion';
import {tick} from '../../src/servidor/infraestructura/tareas/worker';
import type {Actor} from '../../src/compartido/contratos/tipos';
import {exigir} from '../../src/compartido/dominio/errores';

// Demo explicitly writes simulated business operations to the configured Supabase.
// It never signs in, creates credentials, or runs destructive integration fixtures.
async function main(){
  const archivo='docs/sprint-2/evidencias/demo-supabase.json';
  try{const anterior=JSON.parse(await readFile(archivo,'utf8'));if(anterior.completada){console.log('La demostración ya está registrada. Consulta docs/sprint-2/evidencias/demo-supabase.json.');return;}}catch{}
  const db=new Database(),s=crearServicios(db);
  const reporte:Record<string,unknown>={fecha:new Date().toISOString(),completada:false,entorno:'Supabase real',ejecucion:'Servicios de aplicación invocados desde script administrativo; no prueba de navegador ni de sesión JWT',pagos:'Simulados; sin cobros reales',mensajeria:'Simulada; sin envío de correo o WhatsApp',pasos:[]};
  const pasos=reporte.pasos as unknown[];
  async function guardar(paso:string,datos:Record<string,unknown>){pasos.push({paso,...datos});await mkdir('docs/sprint-2/evidencias',{recursive:true});await writeFile(archivo,JSON.stringify(reporte,null,2));console.log(paso+': OK');}
  try{
    const perfiles=(await db.query("SELECT p.id,p.rol,u.email_confirmed_at IS NOT NULL AS confirmado FROM perfiles p JOIN auth.users u ON u.id=p.id")).rows;
    exigir(perfiles.length===1,409,'SELECCION_REQUERIDA','La asignación automática requiere exactamente un perfil.');
    exigir(perfiles[0].confirmado,409,'CONFIRMACION_PENDIENTE','Primero confirma el correo de tu cuenta.');
    await db.query("UPDATE perfiles SET rol='ADMIN' WHERE id=$1",[perfiles[0].id]);
    const actor:Actor={id:perfiles[0].id,role:'ADMIN'};
    await guardar('Rol administrador asignado',{cuentaUnica:true,correoConfirmado:true});
    const salas=await s.catalogo.listar('salas'),equipos=await s.catalogo.listar('equipos');
    const equipo=equipos.find(e=>e.nombre.includes('Micrófono'))??equipos[0];
    exigir(salas.length&&equipo,409,'CATALOGO_VACIO','Faltan recursos de demostración.');
    const dia=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Lima',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(Date.now()+86400000));
    let inicio=Date.parse(dia+'T18:00:00-05:00'),salaId='';
    for(let intento=0;intento<7;intento++){
      const disp=await s.catalogo.disponibilidad(new Date(inicio).toISOString(),new Date(inicio+2*3600000).toISOString());
      salaId=(salas.find(r=>r.nombre.includes('Wari')&&disp.salas.some(a=>a.id===r.id&&a.disponible))??salas.find(r=>disp.salas.some(a=>a.id===r.id&&a.disponible)))?.id??'';
      if(salaId&&disp.equipos.some(e=>e.id===equipo.id&&e.disponible>=1))break;
      salaId='';inicio+=86400000;
    }
    exigir(salaId,409,'SIN_HORARIO','No se encontró un horario libre para la demostración.');
    const intervalo=(offset:number,duracion:number)=>({inicio:new Date(inicio+offset*3600000).toISOString(),fin:new Date(inicio+(offset+duracion)*3600000).toISOString()});
    const principal=await s.reservas.crear(actor,{salaId,...intervalo(0,2),equipos:[{equipoId:equipo.id,cantidad:1}]});
    await guardar('Reserva pendiente creada',{reservaId:principal.id,estado:principal.estado,totalCentimos:principal.total_centimos,inicio:principal.inicio,fin:principal.fin});
    const confirmada=await s.reservas.pagar(actor,principal.id,'demo-'+principal.id,'aprobado','normal');
    exigir(confirmada.estado==='CONFIRMADA',500,'DEMO_FALLO','La reserva no se confirmó.');
    await tick(db);
    const recibo=(await s.admin.notificaciones(actor)).find(n=>n.reserva_id===principal.id&&n.tipo==='CONFIRMACION');
    exigir(recibo&&['ENVIADA','ENVIANDO'].includes(recibo.estado),500,'DEMO_FALLO','No se procesó el comprobante.');
    await guardar('Pago y comprobante simulados',{reservaId:principal.id,estado:confirmada.estado,comprobanteEstado:recibo.estado});
    const secundaria=await s.reservas.crear(actor,{salaId,...intervalo(4,1),equipos:[]});
    await s.reservas.pagar(actor,secundaria.id,'demo-'+secundaria.id,'aprobado','fallo');
    await tick(db);
    const vigente=await s.reservas.obtener(actor,secundaria.id);
    const fallida=(await s.admin.notificaciones(actor)).find(n=>n.reserva_id===secundaria.id&&n.tipo==='CONFIRMACION');
    exigir(vigente.estado==='CONFIRMADA'&&fallida?.estado==='FALLIDA',500,'DEMO_FALLO','La prueba de resiliencia no se completó.');
    await guardar('Fallo de mensajería aislado',{reservaId:secundaria.id,reservaEstado:vigente.estado,envioEstado:fallida.estado});
    const cancelada=await s.reservas.cancelar(actor,secundaria.id,'DEMO Sprint 2: cancelación administrativa de prueba');
    const libre=await s.catalogo.disponibilidad(secundaria.inicio,secundaria.fin);
    exigir(cancelada.estado==='CANCELADA'&&libre.salas.some(r=>r.id===salaId&&r.disponible),500,'DEMO_FALLO','No se liberó la sala.');
    await guardar('Cancelación y liberación comprobadas',{reservaId:secundaria.id,estado:cancelada.estado,reembolso:'Solo registro simulado pendiente; no existe cobro bancario'});
    const bloqueo=await s.admin.crearBloqueo(actor,{salaId,...intervalo(7,1),motivo:'DEMO Sprint 2: mantenimiento temporal'});
    const bloqueada=await s.catalogo.disponibilidad(bloqueo.inicio,bloqueo.fin);
    exigir(bloqueada.salas.some(r=>r.id===salaId&&!r.disponible),500,'DEMO_FALLO','El bloqueo no se aplicó.');
    await s.admin.desbloquear(actor,bloqueo.id);
    const desbloqueada=await s.catalogo.disponibilidad(bloqueo.inicio,bloqueo.fin);
    exigir(desbloqueada.salas.some(r=>r.id===salaId&&r.disponible),500,'DEMO_FALLO','El bloqueo no se retiró.');
    await guardar('Bloqueo y desbloqueo comprobados',{bloqueoId:bloqueo.id,estadoFinal:'CANCELADA'});
    const nuevo=await s.catalogo.guardar(actor,'equipos',{nombre:'Equipo DEMO Sprint 2',categoria:'Demostración',precio_centimos:100,stock:1,activo:true,descripcion:'Registro administrativo de prueba; queda desactivado al finalizar.'});
    const {id,...datos}=nuevo;
    await s.catalogo.guardar(actor,'equipos',{...datos,nombre:'Equipo DEMO Sprint 2 actualizado'},id);
    await s.catalogo.eliminar(actor,'equipos',id);
    exigir(!(await s.catalogo.listar('equipos')).some(e=>e.id===id),500,'DEMO_FALLO','El recurso no se desactivó.');
    await guardar('CRUD de catálogo comprobado',{recursoId:id,creado:true,actualizado:true,desactivado:true});
    await tick(db);
    reporte.completada=true;
    reporte.reservaConfirmada=principal.id;
    reporte.pendientes=['Crear o utilizar una segunda cuenta cliente para demostrar ambos roles desde la interfaz.','Revisar visualmente el panel administrador y completar un recorrido con sesión de navegador.','Publicar el código y evidencias en el repositorio de entrega y ejecutar GitHub Actions.','La carga de 2.000 VUs sigue sin cumplir el umbral de errores.'];
    await writeFile(archivo,JSON.stringify(reporte,null,2));
    console.log('Demostración completada y evidencia guardada.');
  }finally{await db.pool.end();}
}
main().catch(error=>{console.error('Demostración detenida:',error instanceof Error?error.message:'Error desconocido');process.exitCode=1;});
