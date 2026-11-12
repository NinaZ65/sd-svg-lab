import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { Assembly } from '../src/host/Assembly';
import { ConfigLoader } from '../src/host/ConfigLoader';
import { ConsoleOutput } from '../src/io/ConsoleOutput';

class CaptureOutput extends ConsoleOutput {
  public readonly lines: string[] = [];
  public override writeLine(line = ''): void { this.lines.push(line); }
}

function makePackage(root: string, folder: string, contributes: object, source: string): string {
  const path = join(root, folder);
  mkdirSync(path);
  writeFileSync(join(path, 'package.json'), JSON.stringify({ name: folder, main: 'index.js', contributes }));
  writeFileSync(join(path, 'index.js'), source);
  return `./${folder}`;
}

const commandSource = (name: string) => `exports.default = { activate(ctx) { ctx.registerCommand({ name: '${name}', description: '', execute() {} }); } };`;

test('config loader reports all required failures, rolls back, and continues', () => {
  const root = mkdtempSync(join(tmpdir(), 'svg-plugins-'));
  try {
    const noDefault = makePackage(root, 'no-default', {}, 'exports.activate = () => {};');
    const mismatch = makePackage(root, 'mismatch', { commands: ['other'] }, commandSource('from-mismatch'));
    const throws = makePackage(root, 'throws', { commands: ['from-throw'] },
      "exports.default = { activate(ctx) { ctx.registerCommand({ name: 'from-throw', execute() {} }); throw new Error('boom'); } };");
    const duplicate = makePackage(root, 'duplicate', { commands: ['help'] }, commandSource('help'));
    const good = makePackage(root, 'good', { commands: ['from-throw'] }, commandSource('from-throw'));
    const configPath = join(root, 'plugins.config.json');
    writeFileSync(configPath, JSON.stringify({ plugins: [
      { module: './missing' }, { module: noDefault }, { module: mismatch },
      { module: throws }, { module: duplicate }, { module: good },
    ] }));
    const assembly = new Assembly();
    const output = new CaptureOutput();
    new ConfigLoader(assembly, output).load(configPath);
    assert.deepEqual(output.lines.map(line => line.split(': ')[1]?.split(':')[0]), [
      'plugin not found', 'plugin has no default export', 'plugin manifest mismatch',
      'plugin failed to activate', 'duplicate registration',
    ]);
    assert.equal(assembly.commands.has('from-mismatch'), false);
    assert.equal(assembly.commands.has('from-throw'), true);
    assert.equal(assembly.commands.has('help'), true);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('invalid config and failed dependency evaluation retain built-ins', () => {
  const root = mkdtempSync(join(tmpdir(), 'svg-invalid-config-'));
  try {
    const bad = makePackage(root, 'bad-dependency', {}, "require('./missing-dependency'); exports.default = { activate() {} };");
    const configPath = join(root, 'plugins.config.json');
    const assembly = new Assembly();
    const output = new CaptureOutput();
    writeFileSync(configPath, '{');
    new ConfigLoader(assembly, output).load(configPath);
    assert.equal(output.lines[0], 'error: invalid plugin config');
    writeFileSync(configPath, JSON.stringify({ plugins: [{ module: bad }] }));
    new ConfigLoader(assembly, output).load(configPath);
    assert.match(output.lines[1], /^error: plugin failed to activate: bad-dependency/);
    assert.equal(assembly.commands.has('help'), true);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('disabled entries are skipped without loading their modules', () => {
  const root = mkdtempSync(join(tmpdir(), 'svg-disabled-plugin-'));
  try {
    const configPath = join(root, 'plugins.config.json');
    writeFileSync(configPath, JSON.stringify({ plugins: [{ module: './missing', enabled: false }] }));
    const output = new CaptureOutput();
    new ConfigLoader(new Assembly(), output).load(configPath);
    assert.deepEqual(output.lines, []);
  } finally { rmSync(root, { recursive: true, force: true }); }
});
