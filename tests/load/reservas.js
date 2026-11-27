import http from 'k6/http';
import {check,sleep} from 'k6';
const base=__ENV.BASE_URL||'http://localhost:3000';
const max=Number(__ENV.MAX_VUS||20);
if(![20,100,500,1000,2000].includes(max))throw new Error('MAX_VUS debe ser 20, 100, 500, 1000 o 2000.');
const niveles=[5,20,100,500,1000,2000].filter(n=>n<=max);
export function setup(){const r=http.get(`${base}/api/v1/health`);if(r.status!==200)throw new Error('El servidor de pruebas no está disponible. No se inicia la carga.');}
export const options={stages:[...niveles.map(target=>({duration:'15s',target})),{duration:'10s',target:0}],thresholds:{http_req_duration:['p(95)<3000'],'http_req_duration{name:disponibilidad}':['p(95)<3000'],http_req_failed:['rate<0.01'],checks:['rate>0.99']},summaryTrendStats:['avg','min','med','max','p(90)','p(95)','p(99)']};
export default function() {
  const d=new Date(Date.now()+86400000*3);d.setUTCHours(23,0,0,0);
  const inicio=d.toISOString(),fin=new Date(d.getTime()+3600000).toISOString();
  const responses=http.batch([
    {method:'GET',url:`${base}/api/v1/salas`,params:{tags:{name:'salas'}}},
    {method:'GET',url:`${base}/api/v1/equipos`,params:{tags:{name:'equipos'}}},
    {method:'GET',url:`${base}/api/v1/disponibilidad?inicio=${encodeURIComponent(inicio)}&fin=${encodeURIComponent(fin)}`,params:{tags:{name:'disponibilidad'}}}
  ]);
  for(const r of responses)check(r,{'respuesta 200':r=>r.status===200,'JSON válido':r=>{try{return r.json()!==null;}catch{return false;}}});
  sleep(1);
}
export function handleSummary(data) {return {'test-results/k6-summary.json':JSON.stringify(data,null,2),'stdout':`k6: ${max} VUs máximos. Umbrales y métricas en test-results/k6-summary.json\n`};}
