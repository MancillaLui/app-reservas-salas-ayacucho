import { readdirSync,readFileSync } from 'node:fs';
import { join } from 'node:path';
function archivos(dir:string):string[] {return readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?archivos(join(dir,e.name)):[join(dir,e.name)]);}
test('dominio y aplicación no importan infraestructura, framework ni SDK',()=>{
  const files=archivos('src/modulos').filter(p=>/[/\\](dominio|aplicacion)[/\\]/.test(p)&&p.endsWith('.ts'));
  expect(files.length).toBeGreaterThan(5);
  for(const file of files) {
    const imports=readFileSync(file,'utf8').matchAll(/(?:import|export)[^;]*?from\s+['"]([^'"]+)['"]/g);
    for(const [,target] of imports) expect({file,target,ok:!/(infraestructura|presentacion|supabase|^pg$|^next|^react)/.test(target)}).toMatchObject({ok:true});
  }
});
