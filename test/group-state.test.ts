import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { CommandHarness } from './CommandHarness';

test('failed group preserves parents, siblings, tree, and history', () => {
  const app = new CommandHarness();
  app.run('init', 'create rect r1 0 0 10 10 red', 'create rect r2 20 0 10 10 blue');
  const root = app.document.getRoot();
  const children = [...root.getChildren()];
  const before = app.tree();
  const svg = app.document.serializeSvg();
  const depth = app.history.getUndoDepth();

  app.run('group bad r1 missing');

  assert.equal(app.messages.at(-1), 'error: no such shape: missing');
  assert.deepEqual(root.getChildren(), children);
  assert.equal(app.document.findById('r1'), children[0]);
  assert.equal(app.document.findById('r2'), children[1]);
  assert.equal(children[0].getParent(), root);
  assert.equal(children[1].getParent(), root);
  assert.equal(app.document.findById('bad'), undefined);
  assert.equal(app.tree(), before);
  assert.equal(app.document.serializeSvg(), svg);
  assert.equal(app.history.getUndoDepth(), depth);
});

for (const command of ['group bad g1 r1', 'group bad r1 g1', 'group bad r1 r1', 'group g1 r1', 'group bad root']) {
  test(`${command} is rejected without mutation`, () => {
    const app = new CommandHarness();
    app.run('init', 'create g g1', 'create rect r1 0 0 10 10 in g1');
    const before = app.document.serializeSvg();
    const depth = app.history.getUndoDepth();
    app.run(command);
    assert.match(app.messages.at(-1)!, /^error:/);
    assert.equal(app.document.serializeSvg(), before);
    assert.equal(app.history.getUndoDepth(), depth);
  });
}

test('group undo restores exact sibling indices across parents and repeated redo', () => {
  const app = new CommandHarness();
  app.run('init', 'create g left', 'create g right');
  for (const parent of ['left', 'right']) {
    for (const id of ['a', 'b', 'c', 'd']) {
      app.run(`create rect ${parent}-${id} 0 0 10 10 in ${parent}`);
    }
  }
  const before = app.document.serializeSvg();
  app.run('group selected left-c right-b left-a');
  const grouped = app.document.serializeSvg();
  assert.ok(app.document.findById('selected'));
  for (let cycle = 0; cycle < 3; cycle += 1) {
    app.run('undo');
    assert.equal(app.document.serializeSvg(), before);
    app.run('redo');
    assert.equal(app.document.serializeSvg(), grouped);
  }
});
