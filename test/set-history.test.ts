import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { RectShape } from '../src/model/shapes/RectShape';
import { TextShape } from '../src/model/shapes/TextShape';
import { CommandHarness } from './CommandHarness';

test('set keeps old and new values stable through repeated undo/redo', () => {
  const app = new CommandHarness();
  app.run('init', 'create rect r1 0 0 10 10 red', 'set r1 x 5');
  const rect = app.document.findById('r1') as RectShape;
  assert.equal(rect.x, 5);
  for (let cycle = 0; cycle < 5; cycle += 1) {
    app.run('undo');
    assert.equal(rect.x, 0, `undo cycle ${cycle}`);
    app.run('redo');
    assert.equal(rect.x, 5, `redo cycle ${cycle}`);
  }
});

test('setting an absent optional style is undoable and redoable', () => {
  const app = new CommandHarness();
  app.run('init', 'create rect r1 0 0 10 10', 'set r1 fill red');
  const rect = app.document.findById('r1') as RectShape;
  for (let cycle = 0; cycle < 3; cycle += 1) {
    assert.equal(rect.fill, 'red');
    app.run('undo');
    assert.equal(rect.fill, undefined);
    app.run('redo');
    assert.equal(rect.fill, 'red');
  }
});

test('text content and invalid numeric values preserve state and history', () => {
  const app = new CommandHarness();
  app.run('init', 'create text t1 0 0 "before"', 'set t1 text "005"');
  const text = app.document.findById('t1') as TextShape;
  assert.equal(text.text, '005');
  app.run('undo');
  assert.equal(text.text, 'before');
  app.run('redo');
  assert.equal(text.text, '005');
  const before = app.document.serializeSvg();
  const depth = app.history.getUndoDepth();
  app.run('set t1 x invalid');
  assert.match(app.messages.at(-1)!, /^error:/);
  assert.equal(app.document.serializeSvg(), before);
  assert.equal(app.history.getUndoDepth(), depth);
});

test('separate set actions retain independent history values', () => {
  const app = new CommandHarness();
  app.run('init', 'create rect r1 0 0 10 10 red', 'set r1 x 5', 'set r1 x 9');
  const rect = app.document.findById('r1') as RectShape;
  for (let cycle = 0; cycle < 3; cycle += 1) {
    app.run('undo');
    assert.equal(rect.x, 5);
    app.run('undo');
    assert.equal(rect.x, 0);
    app.run('redo');
    assert.equal(rect.x, 5);
    app.run('redo');
    assert.equal(rect.x, 9);
  }
});
