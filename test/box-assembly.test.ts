import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

test('box, stats, and dir match byte for byte in both assembly modes', () => {
  const cwd = mkdtempSync(join(tmpdir(), 'svg-box-assembly-'));
  try {
    mkdirSync(join(cwd, 'docs'));
    writeFileSync(join(cwd, 'demo.svg'), '<svg/>');
    const cli = resolve(__dirname, '../src/cli/CliApp.js');
    const config = resolve(__dirname, '../../plugins.config.json');
    const input = [
      'init 800 600',
      'create box n1 120 100 160 60 "开始"',
      'set n1 fill #f5a623',
      'set n1 label "处理数据 v2"',
      'tree', 'stats', 'dir', 'exit', '',
    ].join('\n');
    const run = (args: string[]) => spawnSync(process.execPath, [cli, ...args], { cwd, input, encoding: 'utf8' });
    const code = run([]);
    const configured = run(['--config', config]);
    assert.equal(code.status, 0);
    assert.equal(configured.status, 0);
    assert.equal(code.stdout, configured.stdout);
    assert.match(code.stdout, /g#n1 \(box\)/);
    assert.match(code.stdout, /rect: 1  text: 1  \(total 2, containers 1\)/);
    assert.match(code.stdout, /\[DIR\]  docs/);
  } finally { rmSync(cwd, { recursive: true, force: true }); }
});
