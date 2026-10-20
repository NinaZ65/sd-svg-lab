import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { Document } from '../src/model/Document';
import { GroupShape } from '../src/model/shapes/GroupShape';
import { RectShape } from '../src/model/shapes/RectShape';
import { ShapeFactory } from '../src/model/shapes/ShapeFactory';

test('SVG read and CLI factory produce the same six built-in shape kinds', () => {
  const original = new Document(400, 300);
  const group = ShapeFactory.create('g', 'container', []) as GroupShape;
  original.getRoot().addChild(group);
  for (const [kind, id, args] of [
    ['rect', 'r', ['1', '2', '3', '4', 'red']],
    ['circle', 'c', ['5', '6', '7', 'blue']],
    ['ellipse', 'e', ['8', '9', '10', '11']],
    ['line', 'l', ['12', '13', '14', '15', 'black']],
    ['text', 't', ['16', '17', 'hello world']],
    ['g', 'nested', []],
  ] as const) {
    group.addChild(ShapeFactory.create(kind, id, args));
  }
  const svg = original.serializeSvg();
  const restored = new Document();
  restored.deserializeSvg(svg);
  assert.equal(restored.serializeSvg(), svg);
  assert.deepEqual(restored.getRoot().renderTree(0), original.getRoot().renderTree(0));
  for (const id of ['r', 'c', 'e', 'l', 't', 'nested']) {
    assert.equal(restored.findById(id)?.getParent()?.id, 'container');
  }
});

test('SVG factory preserves defaults, optional styles, generated ids, and unsupported-tag behavior', () => {
  const document = new Document();
  const warnings: string[] = [];
  document.deserializeSvg('<svg><path id="ignored"/><rect/><rect/><g id="nested"><text id="label"> hello world </text></g></svg>', message => warnings.push(message));
  const rect = document.findById('rect1') as RectShape;
  assert.ok(rect instanceof RectShape);
  assert.deepEqual([rect.x, rect.y, rect.width, rect.height, rect.fill], [0, 0, 0, 0, undefined]);
  assert.equal(document.findById('rect2')?.getKind(), 'rect');
  assert.equal(document.findById('label')?.getParent()?.id, 'nested');
  assert.equal(document.findById('ignored'), undefined);
  assert.deepEqual(warnings, ['assigned id rect1 to unnamed <rect>', 'assigned id rect2 to unnamed <rect>']);
  assert.equal(ShapeFactory.fromSvg('constructor', 'unsupported', {}), undefined);
  assert.throws(() => ShapeFactory.create('box', 'future', []), /unknown shape type: box/);
});
