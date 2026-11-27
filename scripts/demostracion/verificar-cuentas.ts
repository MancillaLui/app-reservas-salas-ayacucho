import {destinoEvidencia} from '../entrega/destino-evidencia';
import {config} from 'dotenv';
config({path:'.env.local',quiet:true});
import {mkdir,writeFile} from 'node:fs/promises';
import {Database} from '../../src/servidor/infraestructura/persistencia/database';
async function main(){
  const db=new Database();
  try{
    const datos=await db.query("SELECT COALESCE(p.rol,'SIN_PERFIL') AS rol,u.email_confirmed_at IS NOT NULL AS confirmado,count(*)::int AS cantidad FROM auth.users u LEFT JOIN public.perfiles p ON p.id=u.id GROUP BY 1,2 ORDER BY 1,2");
    const informe={fecha:new Date().toISOString(),metodo:'Consulta SQL de solo lectura; sin correos, IDs ni credenciales',cuentas:datos.rows,recorridoNavegadorValidado:false};
    const carpeta=destinoEvidencia('cuentas');await mkdir(carpeta,{recursive:true});
    await writeFile(carpeta+'/cuentas.json',JSON.stringify(informe,null,2));
    console.log(JSON.stringify(informe,null,2));
  }finally{await db.pool.end();}
}
main().catch(()=>{console.error('No se pudieron comprobar las cuentas. Revisa la conexión local.');process.exitCode=1;});
