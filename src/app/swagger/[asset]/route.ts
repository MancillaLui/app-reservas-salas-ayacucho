import { readFile } from 'node:fs/promises';
import path from 'node:path';
export const runtime='nodejs';
export async function GET(_req:Request,context:{params:Promise<{asset:string}>}) {
  const {asset}=await context.params;
  if(!['swagger-ui.css','swagger-ui-bundle.js'].includes(asset))return new Response('Not found',{status:404});
  const content=await readFile(path.join(process.cwd(),'node_modules','swagger-ui-dist',asset));
  return new Response(content,{headers:{'Content-Type':asset.endsWith('.css')?'text/css':'application/javascript','Cache-Control':'public,max-age=86400'}});
}
