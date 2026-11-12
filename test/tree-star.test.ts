import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ModifiedStar } from '../plugins/tree-star/src/ModifiedStar';
import box from '../plugins/box/src';
import { Assembly } from '../src/host/Assembly';
import { CommandContext } from '../src/commands/CommandContext';
import { HistoryManager } from '../src/history/HistoryManager';
import { ConsoleOutput } from '../src/io/ConsoleOutput';
import { Document } from '../src/model/Document';

class CaptureOutput extends ConsoleOutput {
  public readonly lines: string[] = [];
  public override writeLine(line = ''): void { this.lines.push(line); }
}

function setup(withBox = false) {
  const assembly = new Assembly();
  if (withBox) assembly.activator.activate(box, {
    name: 'box', contributes: { shapes: ['box'], attributes: ['box-attributes'], decorators: ['box-type-label'] },
  });
  const star = new ModifiedStar();
  assembly.decorators.register(star);
  const output = new CaptureOutput();
  const document = new Document(800, 600, assembly.shapes);
  const context = new CommandContext(document, new HistoryManager(), output,
    assembly.attributes, assembly.decorators, () => assembly.commands.all());
  assembly.decorators.onBaseline(document);
  const run = (...commands: string[]) => commands.forEach(command => assembly.commands.execute(command, context));
  const tree = () => { run('tree'); return output.lines.at(-1)!; };
  return { assembly, star, output, document, context, run, tree };
}

test('modified-star tracks edit, save, edit, and undo back to save point', () => {
  const dir = mkdtempSync(join(tmpdir(), 'svg-star-'));
  try {
    const app = setup();
    app.run('init 100 100');
    assert.doesNotMatch(app.tree(), /\*/);
    app.run('create rect r1 0 0 10 10');
    assert.match(app.tree(), /svg \(100x100\) \*/);
    assert.match(app.tree(), /rect#r1.* \*/);
    app.run(`save ${join(dir, 'saved.svg')}`);
    assert.doesNotMatch(app.tree(), /\*/);
    app.run('set r1 x 5');
    assert.match(app.tree(), /rect#r1.* \*/);
    app.run('undo');
    assert.doesNotMatch(app.tree(), /\*/);
    app.run('redo');
    assert.match(app.tree(), /rect#r1.* \*/);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('child edits mark ancestors and box label precedes star', () => {
  const app = setup(true);
  app.run('init', 'create box n1 1 2 80 40 title');
  assert.match(app.tree(), /g#n1 \(box\) \*/);
  app.run('create g outer', 'create rect r1 0 0 1 1 in outer');
  const tree = app.tree();
  assert.match(tree, /g#outer \*/);
  assert.match(tree, /rect#r1.* \*/);
  app.run('set n1 label changed');
  assert.match(app.tree(), /g#n1 \(box\) \*/);
});

test('no decorators retain baseline tree bytes', () => {
  const assembly = new Assembly();
  const output = new CaptureOutput();
  const document = new Document(800, 600, assembly.shapes);
  const context = new CommandContext(document, new HistoryManager(), output,
    assembly.attributes, assembly.decorators, () => assembly.commands.all());
  assembly.commands.execute('init 100 100', context);
  assembly.commands.execute('create rect r1 1 2 3 4', context);
  assembly.commands.execute('tree', context);
  assert.equal(output.lines.at(-1), 'svg (100x100)\ng#root\n  rect#r1 x=1 y=2 w=3 h=4');
});
