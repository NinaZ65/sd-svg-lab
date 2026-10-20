import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { GroupShape } from '../src/model/shapes/GroupShape';
import { CommandHarness } from './CommandHarness';

for (const command of ['move b 0.1 0.2', 'scale b 1.3', 'delete b', 'create circle new 1 2 3 in parent', 'group selected c a', 'front b', 'back b', 'addto target b', 'addto parent b']) {
  test(`${command} preserves exact state over repeated undo/redo`, () => {
    const app = new CommandHarness();
    app.run('init', 'create g parent', 'create g target');
    for (const id of ['a', 'b', 'c']) {
      app.run(`create rect ${id} 0.1 0.2 10.1 20.2 in parent`);
    }
    const before = app.document.serializeSvg();
    app.run(command);
    assert.doesNotMatch(app.messages.at(-1)!, /^error:/);
    const after = app.document.serializeSvg();
    assert.notEqual(before, after);
    for (let cycle = 0; cycle < 5; cycle += 1) {
      app.run('undo');
      assert.equal(app.document.serializeSvg(), before, `undo cycle ${cycle}`);
      app.run('redo');
      assert.equal(app.document.serializeSvg(), after, `redo cycle ${cycle}`);
    }
  });
}

for (const command of ['addto outer outer', 'addto inner outer', 'addto outer root', 'addto missing outer', 'addto outer missing']) {
  test(`${command} rejects invalid structure before mutation`, () => {
    const app = new CommandHarness();
    app.run('init', 'create g outer', 'create g inner in outer');
    const before = app.document.serializeSvg();
    const depth = app.history.getUndoDepth();
    app.run(command);
    assert.match(app.messages.at(-1)!, /^error:/);
    assert.equal(app.document.serializeSvg(), before);
    assert.equal(app.history.getUndoDepth(), depth);
  });
}

test('ungroup occupies the original sibling position on execute and redo', () => {
  const app = new CommandHarness();
  app.run('init', 'create g outer', 'create rect before 0 0 1 1 in outer', 'create g nested in outer', 'create rect after 0 0 1 1 in outer');
  app.run('create rect a 0 0 1 1 in nested', 'create rect b 0 0 1 1 in nested');
  const outer = app.document.findById('outer') as GroupShape;
  const before = app.document.serializeSvg();
  app.run('ungroup nested');
  const after = app.document.serializeSvg();
  assert.deepEqual(outer.getChildren().map(shape => shape.id), ['before', 'a', 'b', 'after']);
  for (let cycle = 0; cycle < 5; cycle += 1) {
    app.run('undo');
    assert.equal(app.document.serializeSvg(), before);
    app.run('redo');
    assert.equal(app.document.serializeSvg(), after);
  }
});

test('ungroup rejects a top-level container without mutation', () => {
  const app = new CommandHarness();
  app.run('init', 'create g outer', 'create rect r1 0 0 1 1 in outer');
  const before = app.document.serializeSvg();
  app.run('ungroup outer');
  assert.equal(app.messages.at(-1), 'error: cannot ungroup top-level container: outer');
  assert.equal(app.document.serializeSvg(), before);
});
