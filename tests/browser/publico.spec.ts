import {test,expect} from '@playwright/test';
test('inicio musical y reserva pública conservada al ir a ingresar',async({page})=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');await expect(page.getByRole('heading',{name:/Tu banda/,level:1})).toBeVisible();
  await expect(page.locator('.sala-presentacion')).toHaveCount(2);await page.locator('.sala-presentacion').filter({hasText:'Sala Wari'}).getByRole('link',{name:'Ver horarios y reservar'}).click();
  const inicio=page.getByLabel('Inicio',{exact:true});await expect(inicio).not.toHaveValue('');const dia=(await inicio.inputValue()).slice(0,10);
  await inicio.fill(dia+'T12:00');await page.getByLabel('Fin',{exact:true}).fill(dia+'T13:00');await page.getByRole('button',{name:'Continuar',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Elige tu sala',exact:true})).toBeVisible();await page.getByRole('button',{name:/Sala Wari/}).click();await expect(page.getByRole('button',{name:/12:00.*Libre/})).toBeEnabled();await page.getByRole('button',{name:'Continuar',exact:true}).click();
  await page.getByLabel('Cantidad de Micrófono dinámico').fill('2');await expect(page.locator('.total-reserva')).toContainText('50.00');await page.getByRole('button',{name:'Continuar',exact:true}).click();await page.getByRole('button',{name:'Iniciar sesión y continuar'}).click();
  await expect(page).toHaveURL(/\/ingresar\?next=/);await expect(page.getByRole('heading',{name:'Qué bueno verte.'})).toBeVisible();await page.goto('/reservar');await expect(page.getByRole('heading',{name:'Todo listo para tu ensayo.'})).toBeVisible();await expect(page.locator('.total-reserva')).toContainText('50.00');expect(errors).toEqual([]);
});
test('sitio y reserva móvil sin desbordamiento',async({page})=>{
  await page.setViewportSize({width:390,height:844});await page.goto('/');await expect(page.locator('.sala-presentacion')).toHaveCount(2);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:'test-results/interfaz-inicio-movil.png',fullPage:true});
  await page.goto('/reservar');await expect(page.getByLabel('Inicio',{exact:true})).not.toHaveValue('');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:'test-results/interfaz-reserva-movil.png',fullPage:true});
});
test('Swagger conserva las 26 operaciones',async({page})=>{await page.goto('/docs');await expect(page.locator('.swagger-ui .info .title')).toContainText('Reservas de Salas Ayacucho');await expect(page.locator('.swagger-ui .opblock')).toHaveCount(26);});
