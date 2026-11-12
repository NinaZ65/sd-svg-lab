import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { Assembly } from '../src/host/Assembly';
import { ConfigLoader } from '../src/host/ConfigLoader';
import { ConsoleOutput } from '../src/io/ConsoleOutput';
import { Document } from '../src/model/Document';
import { BoxShape } from '../plugins/box/src/BoxShape';

class CaptureOutput extends ConsoleOutput {
  public readonly lines: string[] = [];
  public override writeLine(line = ''): void { this.lines.push(line); }
}

test('stats and dir can be enabled independently, and options reach the same box provider', () => {
  const root = mkdtempSync(join(tmpdir(), 'svg-option-config-'));
  try {
    const config = join(root, 'plugins.config.json');
    const stats = resolve(__dirname, '../../plugins/stats');
    const dir = resolve(__dirname, '../../plugins/dir');
    const box = resolve(__dirname, '../../plugins/box');
    const output = new CaptureOutput();
    const assembly = new Assembly();
    writeFileSync(config, JSON.stringify({ plugins: [
      { module: stats }, { module: dir, enabled: false }, { module: box, options: { fill: '#123456' } },
    ] }));
    new ConfigLoader(assembly, output).load(config);
    assert.deepEqual(output.lines, []);
    assert.equal(assembly.commands.has('stats'), true);
    assert.equal(assembly.commands.has('dir'), false);
    const document = new Document(800, 600, assembly.shapes);
    const shape = document.makeShape('box', 'n1', ['1', '2', '80', '40', 'Title']) as BoxShape;
    assert.equal(shape.getRect().fill, '#123456');

    const other = new Assembly();
    writeFileSync(config, JSON.stringify({ plugins: [{ module: dir }] }));
    new ConfigLoader(other, output).load(config);
    assert.equal(other.commands.has('stats'), false);
    assert.equal(other.commands.has('dir'), true);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('manifest mismatch rolls back every staged category', () => {
  const assembly = new Assembly();
  assert.throws(() => assembly.activator.activate({ activate(context) {
    context.registerShape({ name: 'temporary', create: () => { throw new Error('unused'); }, read: () => { throw new Error('unused'); } });
    context.registerCommand({ name: 'temporary', description: '', execute: () => {} });
  } }, { name: 'bad', contributes: { shapes: ['temporary'] } }), /plugin manifest mismatch/);
  assert.equal(assembly.shapes.get('temporary'), undefined);
  assert.equal(assembly.commands.has('temporary'), false);
});
