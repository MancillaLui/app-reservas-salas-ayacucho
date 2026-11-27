import {test,expect,type Page,type Locator} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import {preparar,RESERVA} from './fixtures';

async function contraste(elementos:Locator){
  const ratios=await elementos.evaluateAll(nodes=>{
    function rgba(value:string){const n=value.match(/[\d.]+/g)?.map(Number)??[];return [n[0]??0,n[1]??0,n[2]??0,n[3]??1];}
    function luminancia(c:number[]){return c.slice(0,3).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;}).reduce((n,v,i)=>n+v*[.2126,.7152,.0722][i],0);}
    return nodes.filter(n=>n.getBoundingClientRect().width>0).map(node=>{
      let bg=[0,0,0,0];let current:Element|null=node;
      while(current&&bg[3]<.999){const layer=rgba(getComputedStyle(current).backgroundColor),alpha=bg[3]+layer[3]*(1-bg[3]);if(alpha>0)bg=[...bg.slice(0,3).map((v,i)=>(v*bg[3]+layer[i]*layer[3]*(1-bg[3]))/alpha),alpha];current=current.parentElement;}
      const fg=rgba(getComputedStyle(node).color);const composed=fg.slice(0,3).map((v,i)=>v*fg[3]+bg[i]*(1-fg[3]));
      const a=luminancia(composed),b=luminancia(bg);
      return {texto:(node.textContent||node.getAttribute('aria-label')||node.tagName).trim().slice(0,65),ratio:(Math.max(a,b)+.05)/(Math.min(a,b)+.05)};
    });
  });
  expect(ratios.length).toBeGreaterThan(0);
  for(const item of ratios)expect(item.ratio,`Contraste de «${item.texto}»`).toBeGreaterThanOrEqual(4.5);
  return ratios;
}
async function ancho(page:Page){expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(page.viewportSize()!.width);}
async function captura(page:Page,name:string){await mkdir('test-results/oscuro',{recursive:true});await page.screenshot({path:`test-results/oscuro/${name}.png`,fullPage:true});}
async function cargado(page:Page){await expect(page.locator('.cargando')).toHaveCount(0);}

test('tema oscuro: público y autenticación en escritorio, tableta y móvil',async({page})=>{
  test.setTimeout(90000);await preparar(page,'CLIENTE',false);
  for(const width of [1365,768,390]){
    await page.setViewportSize({width,height:1000});await page.goto('/');await expect(page.locator('.sala-presentacion')).toHaveCount(1);
    await expect(page.locator('body')).toHaveCSS('background-color','rgb(11, 16, 32)');await expect(page.locator('html')).toHaveCSS('color-scheme','dark');await ancho(page);
    await contraste(page.locator('.cabecera-publica .boton,.sala-contenido .enlace,.titulo-seccion>p,.sala-contenido small,.cinta-musical'));
    await captura(page,'inicio-'+width);
    for(const path of ['/ingresar','/registro']){await page.goto(path);await expect(page.getByLabel('Correo electrónico')).toBeVisible();await ancho(page);await contraste(page.locator('.auth-caja p,.auth-caja label,.auth-caja input,.auth-caja .boton'));}
    await page.goto('/reservar');await expect(page.getByLabel('Inicio',{exact:true})).not.toHaveValue('');await ancho(page);await contraste(page.locator('.reserva-paso label,.reserva-paso input,.reserva-paso p,.resumen-reserva p,.pasos-reserva li'));
    const input=page.getByLabel('Inicio',{exact:true});await input.focus();await expect(input).toHaveCSS('outline-style','solid');await expect(input).toHaveCSS('outline-width','3px');
    await captura(page,'reserva-'+width);
  }
});

for(const rol of ['CLIENTE','ADMIN'] as const){
  test(`tema oscuro: páginas de ${rol} y contraste a tres anchos`,async({page})=>{
    test.setTimeout(90000);await preparar(page,rol);const root=rol==='ADMIN'?'/admin':'/cliente';
    const paginas=rol==='ADMIN'?['','/reservas','/catalogo','/bloqueos','/pagos','/comprobantes','/reservas/'+RESERVA]:['','/reservas','/reservas/'+RESERVA];
    const ratios:unknown[]=[];
    for(const width of [1365,768,390]){
      await page.setViewportSize({width,height:1000});
      for(const path of paginas){
        await page.goto(root+path);await expect(page.locator('.contenido-panel h1')).toBeVisible();await cargado(page);await ancho(page);
        ratios.push({width,path:root+path,resultados:await contraste(page.locator('.contenido-panel h1,.contenido-panel .ceja,.contenido-panel .nota,.contenido-panel td,.contenido-panel td small,.contenido-panel .estado,.contenido-panel .boton,.contenido-panel label,.contenido-panel input,.contenido-panel select,.contenido-panel .cabecera-pagina p'))});
        if(!path)await captura(page,rol.toLowerCase()+'-'+width);
      }
    }
    await mkdir('test-results/oscuro',{recursive:true});await writeFile(`test-results/oscuro/contraste-${rol.toLowerCase()}.json`,JSON.stringify(ratios,null,2));
  });
}

test('tema oscuro: modal, confirmación, vacío y error mantienen legibilidad',async({page})=>{
  await preparar(page,'ADMIN');await page.goto('/admin/catalogo');await cargado(page);
  await page.getByRole('button',{name:'Crear sala',exact:true}).click();const modal=page.getByRole('dialog');await expect(modal).toBeVisible();await contraste(modal.locator('label,input,textarea,button'));await captura(page,'modal-catalogo');
  await page.keyboard.press('Escape');await page.getByRole('button',{name:'Desactivar',exact:true}).click();await expect(page.getByRole('button',{name:'Confirmar desactivación'})).toBeVisible();await contraste(page.locator('.confirmacion-baja p,.confirmacion-baja .boton'));await captura(page,'confirmacion-admin');
  await page.goto('/admin/reservas');await page.getByRole('combobox',{name:'Estado',exact:true}).selectOption('CANCELADA');await expect(page.getByRole('heading',{name:'No hay coincidencias'})).toBeVisible();await contraste(page.locator('.vacio h3,.vacio p'));await captura(page,'lista-vacia');
  await page.route('**/api/v1/yo',r=>r.fulfill({status:503,json:{error:{message:'Servicio de identidad temporalmente no disponible'}}}));await page.reload();await expect(page.getByRole('button',{name:'Volver a comprobar sesión'})).toBeVisible();await contraste(page.locator('.aviso.error,.boton'));await captura(page,'error-sesion');
});

test('tema oscuro: carga, pago pendiente, vencimiento y cancelación tienen estados legibles',async({page})=>{
  await preparar(page,'CLIENTE');let liberar!:()=>void;const barrera=new Promise<void>(r=>{liberar=r;});
  await page.route('**/api/v1/reservas',async route=>{if(route.request().method()==='GET')await barrera;await route.fallback();});
  await page.goto('/cliente');await expect(page.locator('.cargando')).toBeVisible();await contraste(page.locator('.cargando'));liberar();await cargado(page);
  await page.goto('/reservar');await page.getByRole('button',{name:'Continuar',exact:true}).click();await page.getByRole('button',{name:'Continuar',exact:true}).click();await page.getByRole('button',{name:'Continuar',exact:true}).click();await page.getByRole('button',{name:'Reservar mi horario'}).click();await expect(page.getByRole('button',{name:'Confirmar pago simulado'})).toBeEnabled();
  await contraste(page.locator('.reloj,.pago-reserva .boton,.simulacion span'));await captura(page,'pago-pendiente');
  await page.clock.install();await page.clock.fastForward(601000);await expect(page.getByRole('button',{name:'Confirmar pago simulado'})).toBeDisabled();await contraste(page.locator('.reloj,.pago-reserva .boton'));await captura(page,'pago-vencido');
  await page.goto('/cliente/reservas/'+RESERVA);await page.getByRole('button',{name:'Cancelar reserva',exact:true}).click();await page.getByLabel('Motivo de cancelación').fill('Demostración controlada');await page.getByRole('button',{name:'Confirmar cancelación'}).click();await expect(page.locator('.estado-cancelada')).toBeVisible();await contraste(page.locator('.estado-cancelada,.aviso.exito'));await captura(page,'cancelacion-cliente');
});

test('Swagger conserva esquema claro independiente del tema oscuro',async({page})=>{
  await page.goto('/docs');await expect(page.locator('.swagger-ui .opblock')).toHaveCount(26);await expect(page.locator('.documentacion-api')).toHaveCSS('background-color','rgb(255, 255, 255)');await expect(page.locator('.documentacion-api')).toHaveCSS('color-scheme','light');
});
