import { spawn } from 'node:child_process';
import { resolve } from 'node:path';
if (process.env.PORT && process.env.PORT !== '3001') {
  console.error('En desarrollo usa PORT=3001; el proxy de Vite apunta a ese puerto.'); process.exit(1);
}
const children = [];
let stopping = false;
function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children) {
    if (child.killed || child.exitCode !== null) continue;
    if (process.platform === 'win32') {
      // Terminate only our child tree, including Node watch and Vite helpers.
      spawn('taskkill', ['/PID', String(child.pid), '/T', '/F'], { windowsHide: true, stdio: 'ignore' });
    } else child.kill('SIGTERM');
  }
  process.exitCode = code;
}
for (const args of [
  ['--use-system-ca', '--watch', '--env-file-if-exists=.env', 'server/index.js'],
  [resolve('node_modules/vite/bin/vite.js')],
]) {
  const child = spawn(process.execPath, args, { stdio: 'inherit', env: { ...process.env, PORT: '3001' } });
  children.push(child);
  child.on('error', () => { console.error('No se pudo iniciar un proceso de desarrollo.'); stop(1); });
  child.on('exit', (code) => { if (!stopping) stop(code ?? 1); });
}
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => stop());
