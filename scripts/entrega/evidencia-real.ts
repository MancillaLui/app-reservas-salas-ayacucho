import {destinoEvidencia} from './destino-evidencia';
import {chromium,expect} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
const base=process.env.BASE_URL??'http://localhost:3000';
const carpeta=destinoEvidencia('recorrido-real');
async function main(){
  await mkdir(carpeta,{recursive:true});
  const browser=await chromium.launch({channel:'chrome',headless:false});
  const resultados:unknown[]=[];
  let reserva:unknown=null;
  try{
    for(const rol of ['ADMIN','CLIENTE']){
      const context=await browser.newContext({viewport:{width:1365,height:900}});
      const page=await context.newPage();
      const ruta=rol==='ADMIN'?'/admin':'/cliente';
      console.log(`Inicia sesión como ${rol} en la ventana de Chrome. No escribas tu contraseña en la terminal.`);
      await page.goto(base+'/ingresar');
      await page.waitForURL(url=>url.pathname===ruta,{timeout:600000});
      // The application obtained its identity from the real API. No route interception,
      // token injection, auth bypass or saved browser session is used here.
      const identidad=await page.evaluate(async()=>{
        const key=Object.keys(localStorage).find(k=>k.startsWith('sb-')&&k.endsWith('-auth-token'));
        const session=key?JSON.parse(localStorage.getItem(key)??'null'):null;
        if(!session?.access_token)return null;
        const r=await fetch('/api/v1/yo',{headers:{Authorization:`Bearer ${session.access_token}`}});
        return r.ok?await r.json():null;
      });
      if(identidad?.role!==rol)throw new Error('El rol autenticado no corresponde a la ventana solicitada.');
      async function captura(path:string,name:string){
        const respuesta=page.waitForResponse(r=>new URL(r.url()).pathname==='/api/v1/'+(rol==='ADMIN'?'admin/reservas':'reservas')&&r.request().method()==='GET');
        await page.goto(base+path);
        if(!(await respuesta).ok())throw new Error('No se cargó la lista real de reservas.');
        await expect(page.locator('.cargando')).toHaveCount(0);
        await page.screenshot({path:`${carpeta}/${name}.png`,fullPage:true,mask:[page.getByText(/[^\s]+@[^\s]+/)]});
      }
      await captura(ruta,rol.toLowerCase());
      await captura(ruta+'/reservas',rol.toLowerCase()+'-reservas');
      if(rol==='CLIENTE'){
        await page.goto(base+'/admin');await page.waitForURL(url=>url.pathname==='/cliente');
        const dia=new Date(Date.now()+7*86400000).toISOString().slice(0,10);
        const inicio=dia+'T19:00',fin=dia+'T20:00';
        const disponibilidad=await (await page.request.get(base+'/api/v1/disponibilidad?'+new URLSearchParams({inicio:inicio+':00-05:00',fin:fin+':00-05:00'}))).json();
        const sala=disponibilidad.salas.find((s:{disponible:boolean})=>s.disponible);
        if(!sala)throw new Error('No hay sala libre para la demostración.');
        await page.goto(base+'/reservar?sala='+sala.id);
        await page.getByLabel('Inicio',{exact:true}).fill(inicio);await page.getByLabel('Fin',{exact:true}).fill(fin);
        await page.getByRole('button',{name:'Continuar',exact:true}).click();
        await expect(page.getByRole('heading',{name:'Elige tu sala',exact:true})).toBeVisible();
        await page.getByRole('button',{name:'Continuar',exact:true}).click();
        await expect(page.getByRole('heading',{name:'Que no falte nada.',exact:true})).toBeVisible();
        const micro=page.getByLabel('Cantidad de Micrófono dinámico');
        if(await micro.count()&&Number(await micro.getAttribute('max'))>0)await micro.fill('1');
        await page.getByRole('button',{name:'Continuar',exact:true}).click();
        await expect(page.getByRole('heading',{name:'Todo listo para tu ensayo.'})).toBeVisible();
        await page.screenshot({path:carpeta+'/revision.png',fullPage:true,mask:[page.getByText(/[^\s]+@[^\s]+/)]});
        await page.getByRole('button',{name:'Reservar mi horario'}).click();
        const pago=page.waitForResponse(r=>r.url().includes('/pago')&&r.request().method()==='POST');
        await page.getByRole('button',{name:'Confirmar pago simulado'}).click();
        const response=await pago;
        if(!response.ok())throw new Error('No se confirmó el pago simulado.');
        const pagada=await response.json();
        if(pagada.estado!=='CONFIRMADA')throw new Error('Estado inesperado de reserva.');
        await page.waitForURL(url=>url.pathname==='/cliente/reservas/'+pagada.id);
        await expect(page.getByText('Tu ensayo está confirmado.',{exact:false})).toBeVisible();
        await page.screenshot({path:carpeta+'/confirmacion.png',fullPage:true,mask:[page.getByText(/[^\s]+@[^\s]+/)]});
        await page.getByRole('button',{name:'Cancelar reserva',exact:true}).click();
        await page.getByLabel('Motivo de cancelación').fill('Cierre de demostración Sprint 2: liberar horario de prueba');
        await page.getByRole('button',{name:'Confirmar cancelación'}).click();
        await expect(page.locator('.estado-cancelada')).toBeVisible();
        await page.screenshot({path:carpeta+'/cancelacion.png',fullPage:true,mask:[page.getByText(/[^\s]+@[^\s]+/)]});
        reserva={id:pagada.id,inicio:pagada.inicio,fin:pagada.fin,totalCentimos:pagada.total_centimos,pago:'SIMULADO_APROBADO',confirmada:true,canceladaAlTerminar:true,reembolso:'Registro pendiente; sin movimiento bancario'};
      }
      resultados.push({rol,identidadAPI:true,navegacion:true,redireccionOtroRol:rol==='CLIENTE'?true:'No aplica'});
      await writeFile(carpeta+'/resumen.json',JSON.stringify({fecha:new Date().toISOString(),base,metodo:'Chrome con inicio de sesión manual y API/Supabase reales; sin interceptaciones',resultados,reservaYPagoEnNavegadorValidados:reserva!==null,reserva,limitacion:'Pagos y mensajes simulados. La reserva de prueba se cancela para liberar recursos.'},null,2));
      await context.close();
    }
    console.log('Acceso real de ambos roles comprobado y capturas guardadas.');
  }finally{await browser.close();}
}
main().catch(()=>{console.error('Recorrido sin completar: revisa el servidor, el rol y el inicio de sesión. No se modificaron cuentas ni contraseñas.');process.exitCode=1;});
