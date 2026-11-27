'use client';
import {supabaseBrowser} from '../../app/cliente';
export class ApiError extends Error {
  constructor(message:string,public status:number,public code?:string){super(message);}
}
export async function api<T>(path:string,method='GET',data?:unknown,headers:Record<string,string>={}):Promise<T>{
  const client=supabaseBrowser();
  const session=client?await client.auth.getSession():null;
  if(session?.error)throw new ApiError('Tu sesión no se pudo recuperar. Inicia sesión nuevamente.',401);
  const token=session?.data.session?.access_token;
  const response=await fetch(`/api/v1/${path}`,{method,cache:'no-store',headers:{...(data!==undefined?{'Content-Type':'application/json'}:{}),...(token?{Authorization:`Bearer ${token}`} :{}),...headers},...(data!==undefined?{body:JSON.stringify(data)}:{})});
  const result=response.status===204?null:await response.json();
  if(!response.ok){if(response.status===401)window.dispatchEvent(new Event('ensaya:session-invalid'));throw new ApiError(result?.error?.message??'No pudimos completar la solicitud.',response.status,result?.error?.code);}
  return result;
}
