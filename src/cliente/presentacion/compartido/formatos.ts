export const dinero=(n:number)=>new Intl.NumberFormat('es-PE',{style:'currency',currency:'PEN'}).format(n/100);
export const fecha=(s:string)=>new Intl.DateTimeFormat('es-PE',{dateStyle:'medium',timeStyle:'short',timeZone:'America/Lima'}).format(new Date(s));
export const diaLima=(s:string|Date)=>new Intl.DateTimeFormat('en-CA',{timeZone:'America/Lima',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(s));
export const localISO=(s:string)=>`${s.length===16?s+':00':s}-05:00`;
export const manana=()=>diaLima(new Date(Date.now()+86400000));
export function destino(role:string){return role==='ADMIN'?'/admin':'/cliente';}
export function retornoSeguro(next:string|null,role:string){
  if(next==='/reservar')return next;
  if(role==='ADMIN'&&/^\/admin(?:\/(?:reservas(?:\/[a-f0-9-]{36})?|catalogo|bloqueos|pagos|comprobantes))?$/.test(next??''))return next!;
  if(role==='CLIENTE'&&/^\/cliente(?:\/reservas(?:\/[a-f0-9-]{36})?)?$/.test(next??''))return next!;
  return destino(role);
}
