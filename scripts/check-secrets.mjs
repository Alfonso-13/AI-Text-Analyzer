import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, relative, basename } from 'node:path';
import { parseEnv } from 'node:util';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const findings = new Set();
function git(args, input) {
  const result = spawnSync('git', ['-c', `safe.directory=${root.replace(/\\/g, '/').replace(/\/$/, '')}`, ...args], { cwd: root, input, maxBuffer: 64 * 1024 * 1024, windowsHide: true });
  if (result.status !== 0) throw new Error('No se pudo completar la inspección Git.');
  return result.stdout;
}
const knownSecrets = [];
for (const name of readdirSync(root).filter(name => /^\.env(?:\.|$)/.test(name) && name !== '.env.example')) {
  try {
    for (const [key, value] of Object.entries(parseEnv(readFileSync(resolve(root, name), 'utf8')))) {
      if (/(?:KEY|TOKEN|SECRET|PASSWORD)/i.test(key) && value.length >= 12) knownSecrets.push(value);
    }
  } catch { throw new Error('No se pudo inspeccionar la configuración local. No se imprimieron valores.'); }
}
const patterns = [
  ['Google API key', /AIza[0-9A-Za-z_-]{35}/],
  ['GitHub token', /(?:gh[pousr]_[A-Za-z0-9]{36,}|github_pat_[A-Za-z0-9_]{40,})/],
  ['Private key', /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],
];
function inspect(path, data) {
  const content = data.toString('utf8');
  if (knownSecrets.some(secret => content.includes(secret))) findings.add(`${path}: coincide con un secreto local`);
  for (const [label, pattern] of patterns) if (pattern.test(content)) findings.add(`${path}: posible ${label}`);
}
function realEnv(path) { return /^\.env(?:\.|$)/.test(basename(path)) && basename(path) !== '.env.example'; }
const tracked = git(['ls-files', '-z']).toString().split('\0').filter(Boolean);
for (const path of tracked) if (realEnv(path)) findings.add(`${path}: archivo de entorno rastreado`);
const files = git(['ls-files', '--cached', '--others', '--exclude-standard', '-z']).toString().split('\0').filter(Boolean);
for (const path of new Set(files)) if (existsSync(resolve(root, path))) inspect(path, readFileSync(resolve(root, path)));
for (const path of ['.env', '.env.local', '.env.production', '.env.backup', 'server/.env']) {
  const ignored = spawnSync('git', ['-c', `safe.directory=${root.replace(/\\/g, '/').replace(/\/$/, '')}`, 'check-ignore', '--no-index', '-q', path], { cwd: root, windowsHide: true });
  if (ignored.status !== 0) findings.add(`${path}: no está excluido por Git`);
}
const objects = git(['rev-list', '--objects', '--all']).toString().trim().split('\n').filter(Boolean);
const batch = git(['cat-file', '--batch'], objects.map(line => line.split(' ')[0]).join('\n') + '\n');
let offset = 0;
let blobs = 0;
for (const line of objects) {
  const end = batch.indexOf(10, offset);
  const [, type, rawSize] = batch.subarray(offset, end).toString().split(' ');
  const size = Number(rawSize);
  if (end < 0 || !Number.isSafeInteger(size)) throw new Error('Respuesta Git inválida.');
  const path = line.includes(' ') ? line.slice(line.indexOf(' ') + 1) : '(objeto Git)';
  if (type === 'blob') {
    blobs++;
    if (realEnv(path)) findings.add(`historial/${path}: archivo de entorno versionado`);
    inspect(`historial/${path}`, batch.subarray(end + 1, end + 1 + size));
  }
  offset = end + 1 + size + 1;
}
let artifacts = 0;
function inspectBuild(dir) {
  if (!existsSync(dir)) return;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = resolve(dir, entry.name);
    if (entry.isDirectory()) inspectBuild(path);
    else { artifacts++; inspect(relative(root, path), readFileSync(path)); }
  }
}
inspectBuild(resolve(root, 'dist'));
if (findings.size) {
  console.error('Auditoría fallida. Solo se muestran rutas y tipos; nunca valores:');
  for (const finding of findings) console.error(`- ${finding}`);
  process.exitCode = 1;
} else console.log(`Sin secretos detectados: ${new Set(files).size} archivos, ${blobs} blobs Git y ${artifacts} artefactos. Entornos locales excluidos y no rastreados. Esta revisión no sustituye un escáner especializado.`);
