import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { resolve, join, sep } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';

const checker = readFileSync(new URL('../scripts/check-secrets.mjs', import.meta.url));
function fixture(run) {
  const prefix = resolve(tmpdir(), 'texta-secrets-test-');
  const root = mkdtempSync(prefix);
  const git = (...args) => {
    const result = spawnSync('git', ['-c', `safe.directory=${root.replace(/\\/g, '/')}`, ...args], { cwd: root, windowsHide: true });
    assert.equal(result.status, 0, 'Git de prueba debe completar sin errores');
  };
  const audit = () => {
    const result = spawnSync(process.execPath, ['scripts/check-secrets.mjs'], { cwd: root, encoding: 'utf8', windowsHide: true });
    return { status: result.status, output: result.stdout + result.stderr };
  };
  try {
    mkdirSync(join(root, 'scripts'));
    writeFileSync(join(root, 'scripts/check-secrets.mjs'), checker);
    writeFileSync(join(root, '.gitignore'), '.env\n.env.*\n!.env.example\n');
    writeFileSync(join(root, '.env.example'), 'GEMINI_API_KEY=\n');
    git('init', '-q');
    run({ root, git, audit });
  } finally {
    const target = resolve(root);
    assert.ok(target.startsWith(prefix) && target.startsWith(resolve(tmpdir()) + sep));
    rmSync(target, { recursive: true, force: true });
  }
}
test('Auditoría permite key privada ignorada y plantilla vacía', () => fixture(({ root, git, audit }) => {
  writeFileSync(join(root, '.env'), 'GEMINI_API_KEY=local-test-credential-only\n');
  git('add', '.gitignore', '.env.example');
  const result = audit();
  assert.equal(result.status, 0);
  assert.ok(!result.output.includes('local-test-credential-only'));
}));
test('Auditoría detecta secreto filtrado al bundle sin imprimirlo', () => fixture(({ root, audit }) => {
  const fake = 'local-test-credential-only';
  writeFileSync(join(root, '.env'), `GEMINI_API_KEY=${fake}\n`);
  mkdirSync(join(root, 'dist'));
  writeFileSync(join(root, 'dist/app.js'), `const leaked = '${fake}';`);
  const result = audit();
  assert.equal(result.status, 1);
  assert.match(result.output, /dist[\\/]app\.js/);
  assert.ok(!result.output.includes(fake));
}));
test('Auditoría detecta credencial en un commit antiguo y archivo env rastreado', () => fixture(({ root, git, audit }) => {
  const fake = 'AI' + 'za' + 'A'.repeat(35);
  writeFileSync(join(root, 'old.txt'), fake);
  git('add', '.');
  git('-c', 'user.name=Audit Test', '-c', 'user.email=audit@example.invalid', 'commit', '-qm', 'Test fixture');
  writeFileSync(join(root, 'old.txt'), 'Sin credenciales');
  writeFileSync(join(root, '.env'), 'GEMINI_API_KEY=\n');
  git('add', '-f', '.env');
  const result = audit();
  assert.equal(result.status, 1);
  assert.match(result.output, /historial\/old\.txt/);
  assert.match(result.output, /archivo de entorno rastreado/);
  assert.ok(!result.output.includes(fake));
}));
