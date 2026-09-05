import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const root = new URL('.', import.meta.url).pathname.replace(/^\/(.:)/, '$1');
const port = Number(process.env.PORT || 4173);
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml'
};

createServer(async (request, response) => {
  try {
    const requested = decodeURIComponent(new URL(request.url, `http://${request.headers.host}`).pathname);
    const relative = requested === '/' ? 'index.html' : requested.slice(1);
    const filePath = normalize(join(root, relative));
    if (!filePath.startsWith(normalize(root))) throw new Error('Invalid path');
    const info = await stat(filePath);
    const finalPath = info.isDirectory() ? join(filePath, 'index.html') : filePath;
    response.writeHead(200, { 'Content-Type': mime[extname(finalPath)] || 'application/octet-stream' });
    response.end(await readFile(finalPath));
  } catch {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Not found');
  }
}).listen(port, '127.0.0.1', () => {
  console.log(`遗产继承情景计算器已启动：http://127.0.0.1:${port}`);
});
