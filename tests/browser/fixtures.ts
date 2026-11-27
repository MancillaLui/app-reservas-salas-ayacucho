import type {Page} from '@playwright/test';
import {config} from 'dotenv';
config({path:'.env.local',quiet:true});
export const SALA='10000000-0000-4000-8000-000000000001',EQUIPO='20000000-0000-4000-8000-000000000001',RESERVA='40000000-0000-4000-8000-000000000001';
const rooms=[{id:SALA,nombre:'Sala Wari',categoria:'Sala',precio_centimos:3000,stock:1,activo:true,descripcion:'Espacio para tu banda.'}];
const extras=[{id:EQUIPO,nombre:'Micrófono dinámico',categoria:'Voces',precio_centimos:1000,stock:4,activo:true,descripcion:'Micrófono y pedestal.'}];
export async function preparar(page:Page,rol:'ADMIN'|'CLIENTE',sesionInicial=true){
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL;if(!url)throw new Error('Configura la URL pública de Supabase para las pruebas de sesión.');
  const user={id:'30000000-0000-4000-8000-000000000001',email:'musico@example.test',aud:'authenticated',role:'authenticated',app_metadata:{},user_metadata:{},created_at:'2026-01-01T00:00:00Z'};
  const payload={sub:user.id,exp:Math.floor(Date.now()/1000)+3600,aud:'authenticated',role:'authenticated'};
  const token=Buffer.from(JSON.stringify({alg:'HS256',typ:'JWT'})).toString('base64url')+'.'+Buffer.from(JSON.stringify(payload)).toString('base64url')+'.FIRMA_FICTICIA_SOLO_PRUEBA';
  const session={access_token:token,token_type:'bearer',expires_in:3600,expires_at:payload.exp,refresh_token:'REFRESH_FICTICIO',user};const key='sb-'+new URL(url).hostname.split('.')[0]+'-auth-token';
  if(sesionInicial)await page.addInitScript(({key,session})=>{if(!sessionStorage.getItem('fixture-inicializada')){localStorage.setItem(key,JSON.stringify(session));sessionStorage.setItem('fixture-inicializada','1');}},{key,session});
  await page.route(url+'/auth/v1/**',async route=>{if(new URL(route.request().url()).pathname.endsWith('/logout'))await route.fulfill({status:204});else await route.fulfill({status:200,json:new URL(route.request().url()).pathname.endsWith('/user')?user:session});});
  const day=new Date(Date.now()+86400000*3);day.setUTCHours(23,0,0,0);
  let reserva={id:RESERVA,cliente_id:user.id,sala_id:SALA,sala_nombre:'Sala Wari',inicio:day.toISOString(),fin:new Date(day.getTime()+3600000).toISOString(),estado:'CONFIRMADA',tipo:'RESERVA',total_centimos:4000,vence_en:null as string|null,motivo:null,creada_en:new Date().toISOString(),equipos:[{equipo_id:EQUIPO,cantidad:1,precio_centimos:1000,nombre:'Micrófono dinámico'}]};
  const pedidos:{path:string;method:string;body:Record<string,unknown>|null}[]=[];let recursos=[...rooms],equipos=[...extras],bloqueos:unknown[]=[];
  await page.route('**/api/v1/**',async route=>{
    const req=route.request(),path=new URL(req.url()).pathname.replace('/api/v1/',''),method=req.method(),body=req.postData()?JSON.parse(req.postData()!):null;pedidos.push({path,method,body});const ok=(json:unknown,status=200)=>route.fulfill({status,json});
    if(path==='yo')return ok({id:user.id,email:user.email,role:rol});if(path==='salas')return ok(rooms);if(path==='equipos')return ok(extras);if(path==='calendario')return ok([]);if(path==='disponibilidad')return ok({salas:[{id:SALA,disponible:true}],equipos:[{id:EQUIPO,disponible:4}]});
    if((path==='reservas'||path==='admin/reservas')&&method==='GET')return ok([reserva]);
    if(path==='reservas'&&method==='POST'){reserva={...reserva,...body,sala_id:body.salaId,estado:'PENDIENTE',vence_en:new Date(Date.now()+600000).toISOString()};return ok(reserva,201);}
    if(path===`reservas/${RESERVA}`)return ok(reserva);if(path===`reservas/${RESERVA}/pago`){reserva={...reserva,estado:'CONFIRMADA',vence_en:null};return ok(reserva);}if(path===`reservas/${RESERVA}/cancelacion`){reserva={...reserva,estado:'CANCELADA'};return ok(reserva);}
    if(path==='admin/bloqueos'){if(method==='POST'){bloqueos=[{...reserva,...body,id:RESERVA,sala_nombre:'Sala Wari',estado:'CONFIRMADA'}];return ok(bloqueos[0],201);}return ok(bloqueos);}if(path.startsWith('admin/bloqueos/')){bloqueos=[];return route.fulfill({status:204});}
    if(path==='admin/pagos')return ok([{id:RESERVA,reserva_id:RESERVA,estado:'INCIERTO',monto_centimos:4000,reembolso_pendiente:false,creado_en:new Date().toISOString(),referencia:null}]);if(path.endsWith('/conciliacion'))return ok(reserva);
    if(path==='admin/notificaciones')return ok([{id:RESERVA,reserva_id:RESERVA,tipo:'CONFIRMACION',estado:'ENVIADA',error:null,intentos:1,creada_en:new Date().toISOString(),comprobante:{simulado:true}}]);
    if(/^admin\/(salas|equipos)/.test(path)){const tipo=path.split('/')[1],id=path.split('/')[2];let data=tipo==='salas'?recursos:equipos;if(method==='GET')return ok(data);if(method==='DELETE'){data=data.map(x=>x.id===id?{...x,activo:false}:x);if(tipo==='salas')recursos=data;else equipos=data;return route.fulfill({status:204});}const item={...body,id:id??RESERVA};data=id?data.map(x=>x.id===id?item:x):[...data,item];if(tipo==='salas')recursos=data;else equipos=data;return ok(item,method==='POST'?201:200);}
    return ok({error:{message:'Ruta no preparada: '+path}},501);
  });return {pedidos,user,reserva};
}
