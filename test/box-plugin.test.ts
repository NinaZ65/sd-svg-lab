import { test } from 'node:test';
import assert from 'node:assert/strict';
import box from '../plugins/box/src';
import { BoxShape } from '../plugins/box/src/BoxShape';
import { Assembly } from '../src/host/Assembly';
import { CommandContext } from '../src/commands/CommandContext';
import { AttributeHandler } from '../src/core/AttributeHandler';
import { HistoryManager } from '../src/history/HistoryManager';
import { ConsoleOutput } from '../src/io/ConsoleOutput';
import { Document } from '../src/model/Document';
import { Shape } from '../src/model/Shape';
import { RectShape } from '../src/model/shapes/RectShape';

class CaptureOutput extends ConsoleOutput {
  public readonly lines: string[] = [];
  public override writeLine(line = ''): void { this.lines.push(line); }
}

function setup(withBox = true) {
  const assembly = new Assembly();
  if (withBox) assembly.activator.activate(box, {
    name: '@svgframe/plugin-shape-box',
    contributes: { shapes: ['box'], attributes: ['box-attributes'], decorators: ['box-type-label'] },
  });
  const output = new CaptureOutput();
  const document = new Document(800, 600, assembly.shapes);
  const history = new HistoryManager();
  const context = new CommandContext(document, history, output, assembly.attributes, assembly.decorators,
    () => assembly.commands.all());
  const run = (...commands: string[]) => commands.forEach(command => assembly.commands.execute(command, context));
  return { assembly, output, document, history, context, run };
}

test('box is plugin-only, creates nested composites, and its attributes undo as one unit', () => {
  const absent = setup(false);
  absent.run('create box n1 1 2 3 4 title');
  assert.equal(absent.output.lines.at(-1), 'error: unknown shape type: box');
  const app = setup();
  app.run('init', 'create box n1 120 100 160 60 "开始"', 'create box n2 10 20 80 40 "子节点" in n1');
  const outer = app.document.findById('n1') as BoxShape;
  assert.ok(outer instanceof BoxShape);
  assert.equal(app.document.findById('n2')?.getParent(), outer);
  assert.match(app.document.serializeSvg(), /<g id="n1" data-kind="box">/);
  app.run('set n1 fill #f5a623');
  assert.equal(outer.getRect().readAttribute('fill'), '#f5a623');
  app.run('undo');
  assert.equal(outer.getRect().readAttribute('fill'), '#4a90d9');
  app.run('redo', 'set n1 label "处理数据 v2"');
  assert.equal(outer.getLabel().readAttribute('text'), '处理数据 v2');
  app.run('undo');
  assert.equal(outer.getLabel().readAttribute('text'), '开始');
  assert.equal(app.output.lines.at(-1), 'box#n1 label restored: "开始"');
  app.run('redo');
  assert.equal(outer.getLabel().readAttribute('text'), '处理数据 v2');
  app.run('tree');
  assert.match(app.output.lines.at(-1)!, /g#n1 \(box\)/);
});

test('box read round-trip, downgrade, malformed read rollback, and duplicate id rejection', () => {
  const app = setup();
  app.run('create box n1 1 2 80 40 title');
  const svg = app.document.serializeSvg();
  const restored = setup();
  restored.document.deserializeSvg(svg);
  assert.ok(restored.document.findById('n1') instanceof BoxShape);
  assert.equal(restored.document.serializeSvg(), svg);
  const downgraded = setup(false);
  downgraded.document.deserializeSvg(svg);
  assert.equal(downgraded.document.findById('n1')?.getKind(), 'g');
  assert.match(downgraded.document.serializeSvg(), /data-kind="box"/);
  const before = restored.document.serializeSvg();
  assert.throws(() => restored.document.deserializeSvg(svg.replace('id="n1-label"', 'id="wrong"')), /invalid box: n1/);
  assert.equal(restored.document.serializeSvg(), before);
  assert.throws(() => restored.document.deserializeSvg(svg.replace('id="n1-label"', 'id="n1-rect"')), /id already exists/);
  assert.equal(restored.document.serializeSvg(), before);
});

test('box rejects descendant id collision and structural removal of required children', () => {
  const app = setup();
  app.run('create rect n1-rect 0 0 1 1');
  const before = app.document.serializeSvg();
  const depth = app.history.getUndoDepth();
  app.run('create box n1 1 2 80 40 title');
  assert.equal(app.output.lines.at(-1), 'error: id already exists: n1-rect');
  assert.equal(app.document.serializeSvg(), before);
  assert.equal(app.history.getUndoDepth(), depth);
  app.run('create box n2 1 2 80 40 title', 'create g other');
  const stable = app.document.serializeSvg();
  const stableDepth = app.history.getUndoDepth();
  app.run('delete n2-rect', 'addto other n2-label', 'group moved n2-rect', 'ungroup n2');
  assert.equal(app.document.serializeSvg(), stable);
  assert.equal(app.history.getUndoDepth(), stableDepth);
  assert.equal(app.document.findById('n2-rect')?.getParent()?.id, 'n2');
});

test('partial attribute handler failure rolls back and conflicting handlers do not execute', () => {
  const app = setup();
  app.run('create rect r1 0 0 10 10');
  const rect = app.document.findById('r1') as RectShape;
  const before = app.document.serializeSvg();
  const depth = app.history.getUndoDepth();
  const failing: AttributeHandler = {
    name: 'failing-x',
    handles: (shape: Shape, attr: string) => shape === rect && attr === 'x',
    apply: (_shape, _attr, _value, transaction) => {
      transaction.set(rect, 'x', '5');
      throw new Error('intentional failure');
    },
  };
  app.assembly.attributes.register(failing);
  app.run('set r1 x 9');
  assert.equal(app.output.lines.at(-1), 'error: intentional failure');
  assert.equal(app.document.serializeSvg(), before);
  assert.equal(app.history.getUndoDepth(), depth);
  app.assembly.attributes.register({
    name: 'also-x', handles: failing.handles,
    apply: () => { throw new Error('should not run'); },
  });
  app.run('set r1 x 3');
  assert.match(app.output.lines.at(-1)!, /conflicting attribute handlers/);
  assert.equal(app.document.serializeSvg(), before);
  assert.equal(app.history.getUndoDepth(), depth);
});
