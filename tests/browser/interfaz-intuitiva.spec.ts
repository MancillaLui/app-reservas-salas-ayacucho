import {test,expect} from '@playwright/test';
import {preparar} from './fixtures';

test('músico encuentra pestañas e instrucciones sin consultar administración',async({page})=>{
 const f=await preparar(page,'CLIENTE');await page.goto('/cliente/reservas');
 await expect(page.getByRole('button',{name:'Próximas',exact:true})).toHaveAttribute('aria-pressed','true');
 await page.getByRole('button',{name:'Pendientes de pago',exact:true}).click();await expect(page.getByRole('heading',{name:'No hay coincidencias'})).toBeVisible();
 await page.goto('/cliente/ayuda');await expect(page.getByRole('heading',{name:'ENSAYA, paso a paso'})).toBeVisible();await expect(page.getByText('¿Cómo reservo una sala?',{exact:true})).toBeVisible();
 expect(f.pedidos.some(x=>x.path.startsWith('admin/'))).toBe(false);
});

test('agenda diaria conserva listado y filtros sobre las reservas devueltas',async({page})=>{
 await preparar(page,'ADMIN');await page.goto('/admin/reservas');await expect(page.getByRole('button',{name:'Agenda diaria',exact:true})).toHaveAttribute('aria-pressed','true');
 await expect(page.getByText('Sin ensayos activos para esta fecha y filtros.',{exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Listado',exact:true}).click();await expect(page.getByRole('link',{name:'Ver detalle',exact:true})).toBeVisible();
 await page.route('**/api/v1/admin/reservas',r=>r.fulfill({json:[{id:'noche',sala_id:'sala-noche',sala_nombre:'Sala nocturna',inicio:'2030-01-01T23:00:00-05:00',fin:'2030-01-02T01:00:00-05:00',estado:'CONFIRMADA',total_centimos:6000}]}));await page.reload();await page.getByLabel('Fecha del ensayo').fill('2030-01-02');await expect(page.locator('.agenda-evento')).toHaveCount(1);await page.getByLabel('Fecha del ensayo').fill('2030-01-03');await expect(page.locator('.agenda-evento')).toHaveCount(0);
 await page.goto('/admin/ayuda');await expect(page.getByText('¿Los indicadores son totales del negocio?',{exact:true})).toBeVisible();
});

test('pestañas de pagos y comprobantes utilizan los datos de API',async({page})=>{
 const f=await preparar(page,'ADMIN');await page.goto('/admin/pagos');await page.getByRole('button',{name:'Por conciliar',exact:true}).click();await expect(page.locator('.estado-incierto')).toBeVisible();
 await page.getByRole('button',{name:'Reembolsos pendientes',exact:true}).click();await expect(page.getByRole('heading',{name:'Sin operaciones para mostrar'})).toBeVisible();
 await page.goto('/admin/comprobantes');await page.getByRole('button',{name:'Fallidos',exact:true}).click();await expect(page.getByRole('heading',{name:'Sin comprobantes para mostrar'})).toBeVisible();
 expect(f.pedidos.some(x=>x.method==='POST')).toBe(false);
});

test('móvil tiene tarjetas, navegación del músico y resumen desplegable',async({page})=>{
 await preparar(page,'CLIENTE');await page.setViewportSize({width:390,height:844});await page.goto('/cliente/reservas');
 await expect(page.getByRole('navigation',{name:'Accesos del músico'})).toBeVisible();await expect(page.locator('.reservas-adaptables thead')).not.toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(390);
 await page.getByRole('navigation',{name:'Accesos del músico'}).getByRole('link',{name:'Reservar',exact:true}).click();
 await expect(page.getByLabel('Inicio',{exact:true})).not.toHaveValue('');await expect(page.locator('.contenido-resumen')).not.toBeVisible();await page.locator('.resumen-reserva summary').click();await expect(page.locator('.contenido-resumen')).toBeVisible();
});
