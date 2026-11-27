import { NextRequest,NextResponse } from 'next/server';
import { ZodError,z } from 'zod';
import { servicios } from '../../../../composicion';
import { AppError,exigir } from '../../../../shared/errores';
import { intervalo,reservaSchema,recursoSchema,pagoSchema,motivoSchema,bloqueoSchema,uuid } from '../../../../modulos/reservas/presentacion/schemas';
import { openapi } from '../../../../openapi';
export const runtime='nodejs';
export const dynamic='force-dynamic';
async function body(req:NextRequest) {
  const text=await req.text();
  exigir(text.length<=32768,413,'CUERPO_GRANDE','La solicitud excede 32 KB.');
  try { return JSON.parse(text); } catch { throw new AppError(400,'JSON_INVALIDO','El cuerpo debe ser JSON válido.'); }
}
async function dispatch(req:NextRequest,context:{params:Promise<{ruta:string[]}>}) {
  try {
    const {ruta}=await context.params; const path=ruta.join('/'),method=req.method;
    const ok=(data:unknown,status=200)=>NextResponse.json(data,{status,headers:{'Cache-Control':'no-store'}});
    if(method==='GET'&&path==='openapi') return ok(openapi);
    if(method==='GET'&&path==='health') {
      await servicios().db.query('SELECT 1');
      return ok({status:'ok',pagos:'simulados',mensajeria:'simulada'});
    }
    const s=servicios();
    if(method==='GET'&&(path==='salas'||path==='equipos')) return ok(await s.catalogo.listar(path,req.nextUrl.searchParams.get('categoria')??undefined));
    if(method==='GET'&&path==='disponibilidad') {
      const input=intervalo.parse(Object.fromEntries(req.nextUrl.searchParams));
      return ok(await s.catalogo.disponibilidad(input.inicio,input.fin));
    }
    if(method==='GET'&&path==='calendario') {
      const input=z.object({salaId:uuid,fecha:z.iso.date()}).strict().parse(Object.fromEntries(req.nextUrl.searchParams));
      return ok(await s.catalogo.calendario(input.salaId,input.fecha));
    }
    const actor=await s.usuarios.autenticar(req.headers.get('authorization'));
    if(method==='GET'&&path==='yo') return ok(actor);
    if(path==='reservas') {
      if(method==='GET') return ok(await s.reservas.listar(actor));
      if(method==='POST') return ok(await s.reservas.crear(actor,reservaSchema.parse(await body(req))),201);
    }
    if(ruta[0]==='reservas'&&ruta[1]) {
      const id=uuid.parse(ruta[1]);
      if(ruta.length===2&&method==='GET') return ok(await s.reservas.obtener(actor,id));
      if(ruta.length===3&&ruta[2]==='cancelacion'&&method==='POST') return ok(await s.reservas.cancelar(actor,id,motivoSchema.parse(await body(req)).motivo));
      if(ruta.length===3&&ruta[2]==='pago'&&method==='POST') {
        const clave=z.string().min(8).max(120).parse(req.headers.get('idempotency-key'));
        const input=pagoSchema.parse(await body(req));
        return ok(await s.reservas.pagar(actor,id,clave,input.escenario,input.mensaje));
      }
    }
    if(ruta[0]==='admin') {
      exigir(actor.role==='ADMIN',403,'PROHIBIDO','Se requiere administrador.');
      if(ruta[1]==='salas'||ruta[1]==='equipos') {
        const tipo=ruta[1];
        if(ruta.length===2&&method==='GET') return ok(await s.catalogo.listar(tipo,undefined,true));
        if(ruta.length===2&&method==='POST') return ok(await s.catalogo.guardar(actor,tipo,recursoSchema.parse(await body(req))),201);
        if(ruta.length===3) {
          const id=uuid.parse(ruta[2]);
          if(method==='PUT') return ok(await s.catalogo.guardar(actor,tipo,recursoSchema.parse(await body(req)),id));
          if(method==='DELETE') { await s.catalogo.eliminar(actor,tipo,id); return new NextResponse(null,{status:204}); }
        }
      }
      if(path==='admin/reservas'&&method==='GET') return ok(await s.reservas.listar(actor));
      if(path==='admin/bloqueos'&&method==='GET') return ok(await s.admin.bloqueos(actor));
      if(path==='admin/bloqueos'&&method==='POST') return ok(await s.admin.crearBloqueo(actor,bloqueoSchema.parse(await body(req))),201);
      if(ruta[1]==='bloqueos'&&ruta.length===3&&method==='DELETE') { await s.admin.desbloquear(actor,uuid.parse(ruta[2])); return new NextResponse(null,{status:204}); }
      if(path==='admin/pagos'&&method==='GET') return ok(await s.admin.pagos(actor));
      if(ruta[1]==='pagos'&&ruta[3]==='conciliacion'&&ruta.length===4&&method==='POST') return ok(await s.admin.conciliar(actor,uuid.parse(ruta[2]),z.object({aprobado:z.boolean()}).strict().parse(await body(req)).aprobado));
      if(path==='admin/notificaciones'&&method==='GET') return ok(await s.admin.notificaciones(actor));
    }
    throw new AppError(404,'RUTA_NO_ENCONTRADA','Ruta o método no disponible.');
  } catch(error) {
    if(error instanceof ZodError) return NextResponse.json({error:{code:'VALIDACION',message:'Revisa los datos enviados.',detalles:error.issues}},{status:400});
    if(error instanceof AppError) return NextResponse.json({error:{code:error.code,message:error.message}},{status:error.status});
    const code=(error as {code?:string})?.code;
    if(code==='23P01') return NextResponse.json({error:{code:'SALA_OCUPADA',message:'El horario se superpone con una reserva o bloqueo.'}},{status:409});
    console.error('Error API',{code,message:error instanceof Error?error.message:'Desconocido'});
    return NextResponse.json({error:{code:'SERVICIO_NO_DISPONIBLE',message:'No fue posible completar la operación. Revisa la conexión y configuración del servidor.'}},{status:503});
  }
}
export {dispatch as GET,dispatch as POST,dispatch as PUT,dispatch as DELETE};
