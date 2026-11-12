import { test } from 'node:test';
import assert from 'node:assert/strict';
import { StatsCommand } from '../plugins/stats/src/StatsCommand';
import { CommandHarness } from './CommandHarness';
import { CommandContext } from '../src/commands/CommandContext';

test('stats counts leaf types in first-seen DFS order and containers', () => {
  const harness = new CommandHarness();
  harness.run('init 100 100', 'create g g1', 'create rect r1 0 0 1 1 in g1',
    'create circle c1 0 0 1 in g1', 'create rect r2 0 0 1 1', 'create g empty');
  const command = new StatsCommand();
  const context = new CommandContext(harness.document, harness.history, harness);
  const before = harness.document.serializeSvg();
  command.execute(context, []);
  assert.equal(harness.messages.at(-1), 'rect: 2  circle: 1  (total 3, containers 2)');
  assert.equal(harness.document.serializeSvg(), before);
});
