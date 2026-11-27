import {readdirSync,readFileSync} from 'node:fs';
import {resolve,relative,dirname} from 'node:path';
import ts from 'typescript';

const root=process.cwd();
const config=ts.readConfigFile('tsconfig.json',ts.sys.readFile);
const opciones=ts.parseJsonConfigFileContent(config.config,ts.sys,root).options;
const normalizar=(p:string)=>relative(root,resolve(p)).replaceAll('\\','/');
function archivos(dir:string):string[]{return readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?archivos(resolve(dir,e.name)):[resolve(dir,e.name)]).filter(p=>/\.tsx?$/.test(p));}
function destino(file:string,target:string){return ts.resolveModuleName(target,file,opciones,ts.sys).resolvedModule?.resolvedFileName;}
function dependencias(entry:string,visitas=new Set<string>()):{origen:string;target:string;local?:string}[]{
  const file=resolve(entry);if(visitas.has(file))return [];visitas.add(file);
  return ts.preProcessFile(readFileSync(file,'utf8'),true,true).importedFiles.flatMap(({fileName:target})=>{
    const resolved=destino(file,target);const local=resolved&&normalizar(resolved).startsWith('src/')?normalizar(resolved):undefined;
    const actual={origen:normalizar(file),target,local};
    return local?[actual,...dependencias(local,visitas)]:[actual];
  });
}

test('dominio y aplicación no importan infraestructura, framework ni SDK',()=>{
  const files=archivos('src/servidor/modulos').filter(p=>/[/\\](dominio|aplicacion)[/\\]/.test(p));
  expect(files.length).toBeGreaterThan(5);
  for(const file of files)for(const dep of dependencias(file)){
    expect({dep,permitido:!/(?:^|\/)(infraestructura|presentacion)(?:\/|$)/.test(dep.local??'')&&!/^(?:node:|pg(?:\/|$)|next(?:\/|$)|react(?:\/|$)|@supabase\/)/.test(dep.target)}).toMatchObject({permitido:true});
  }
});

test('el navegador no importa servidor, PostgreSQL ni APIs exclusivas de Node',()=>{
  const entradas=[...archivos('src/cliente'),...archivos('src/app').filter(p=>/^['"]use client['"]/.test(readFileSync(p,'utf8').trimStart()))];
  expect(entradas.length).toBeGreaterThan(15);
  for(const file of entradas)for(const dep of dependencias(file)){
    expect({dep,permitido:!dep.local?.startsWith('src/servidor/')&&!/^(?:node:|pg(?:\/|$)|next\/server$|server-only$)/.test(dep.target)}).toMatchObject({permitido:true});
  }
});

test('contratos y dominio compartidos son independientes de SDK, framework y servidor',()=>{
  const files=archivos('src/compartido');expect(files.length).toBeGreaterThanOrEqual(3);
  for(const file of files)for(const dep of dependencias(file))expect({dep,permitido:!!dep.local?.startsWith('src/compartido/')}).toMatchObject({permitido:true});
});

test('la comprobación de límites resuelve aliases y rutas relativas al mismo archivo',()=>{
  const origen=resolve('src/cliente/presentacion/compartido/api.ts');
  const alias=destino(origen,'@/servidor/composicion');
  const ruta=relative(dirname(origen),resolve('src/servidor/composicion')).replaceAll('\\','/');
  expect(alias&&normalizar(alias)).toBe('src/servidor/composicion.ts');
  expect(destino(origen,ruta.startsWith('.')?ruta:'./'+ruta)).toBe(alias);
  expect(dependencias(resolve('src/servidor/composicion.ts')).some(d=>d.local?.includes('/infraestructura/'))).toBe(true);
});
