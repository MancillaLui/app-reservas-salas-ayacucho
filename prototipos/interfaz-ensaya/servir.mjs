// Servidor estático local. Sin paquetes, API, credenciales ni conexión a Supabase.
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const base = new URL('./', import.meta.url);
const port = Number(process.env.PROTOTIPO_PORT || 4173);
const files = new Map([
  ['/', ['index.html', 'text/html; charset=utf-8']],
  ['/index.html', ['index.html', 'text/html; charset=utf-8']],
  ['/estilos.css', ['estilos.css', 'text/css; charset=utf-8']],
  ['/prototipo.js', ['prototipo.js', 'text/javascript; charset=utf-8']],
  ['/fuentes.css', ['fuentes.css', 'text/css; charset=utf-8']],
  ...['DM-Sans','Space-Grotesk'].flatMap(font => [400,500,600,700].map(weight => [`/fuentes/${font}-${weight}.ttf`, [`fuentes/${font}-${weight}.ttf`, 'font/ttf']])),
]);
createServer(async (req,res) => {
  const item = files.get(new URL(req.url, 'http://localhost').pathname);
  if (!item || !['GET','HEAD'].includes(req.method)) {res.writeHead(404); res.end('No encontrado'); return;}
  try {
    const body = await readFile(fileURLToPath(new URL(item[0], base)));
    res.writeHead(200, {'Content-Type':item[1], 'Cache-Control':'no-store', 'Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'none'; img-src 'self' data:; font-src 'self'; base-uri 'none'; form-action 'none'"});
    res.end(req.method === 'HEAD' ? undefined : body);
  } catch {res.writeHead(500);res.end('No se pudo leer el prototipo');}
}).listen(port, '127.0.0.1', () => console.log(`Prototipo ENSAYA: http://127.0.0.1:${port}`));
