import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { Shape } from '../src/model/Shape';
import { GroupShape } from '../src/model/shapes/GroupShape';
import { ShapeRegistry } from '../src/core/ShapeRegistry';
import { registerBuiltinShapes } from '../src/builtin/registerBuiltinShapes';
import { CommandHarness } from './CommandHarness';

test('nested Composite transforms all leaf kinds through the Shape interface', () => {
  const outer = new GroupShape('outer');
  const shapes = new ShapeRegistry();
  registerBuiltinShapes(shapes);
  const inner = new GroupShape('inner');
  outer.addChild(inner);
  for (const [kind, id, args] of [
    ['rect', 'r', ['1', '2', '3', '4', 'red']],
    ['circle', 'c', ['5', '6', '7', 'blue']],
    ['ellipse', 'e', ['8', '9', '10', '11']],
    ['line', 'l', ['12', '13', '14', '15', 'black']],
    ['text', 't', ['16', '17', 'hello']],
    ['g', 'empty', []],
  ] as const) {
    inner.addChild(shapes.create(kind, id, args));
  }
  const target: Shape = outer;
  const before = target.renderTree(0);
  const restore = target.captureGeometry();
  target.move(10, -4);
  target.scale(2);
  assert.deepEqual(target.renderTree(0), [
    'g#outer', '  g#inner',
    '    rect#r x=22 y=-4 w=6 h=8 fill=red',
    '    circle#c cx=30 cy=4 r=14 fill=blue',
    '    ellipse#e cx=36 cy=10 rx=20 ry=22',
    '    line#l (x1=44,y1=18) -> (x2=48,y2=22) stroke=black',
    '    text#t (52,26) "hello"',
    '    g#empty',
  ]);
  assert.ok(inner.getChildren().every(child => child.getParent() === inner));
  restore();
  assert.deepEqual(target.renderTree(0), before);
});

test('nested command transforms keep exact floating point history and unrelated siblings', () => {
  const app = new CommandHarness();
  app.run('init', 'create g outer', 'create g inner in outer');
  app.run('create rect r 0.1 0.2 0.3 0.4 red in inner', 'create circle c 0.5 0.6 0.7 in outer');
  app.run('create line outside 1 2 3 4 black');
  const outside = app.document.findById('outside')!;
  const outsideBefore = outside.renderTree(0);
  const before = app.document.serializeSvg();
  app.run('move outer 0.2 0.3');
  const moved = app.document.serializeSvg();
  app.run('scale outer 1.3');
  const scaled = app.document.serializeSvg();
  for (let cycle = 0; cycle < 10; cycle += 1) {
    app.run('undo');
    assert.equal(app.document.serializeSvg(), moved);
    app.run('undo');
    assert.equal(app.document.serializeSvg(), before);
    app.run('redo');
    assert.equal(app.document.serializeSvg(), moved);
    app.run('redo');
    assert.equal(app.document.serializeSvg(), scaled);
    assert.deepEqual(outside.renderTree(0), outsideBefore);
  }
  const depth = app.history.getUndoDepth();
  app.run('scale outer 0', 'move outer invalid 1');
  assert.equal(app.document.serializeSvg(), scaled);
  assert.equal(app.history.getUndoDepth(), depth);
});
