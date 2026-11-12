import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Assembly } from '../src/host/Assembly';
import { CommandContext } from '../src/commands/CommandContext';
import { HistoryManager } from '../src/history/HistoryManager';
import { ConsoleOutput } from '../src/io/ConsoleOutput';
import { Document } from '../src/model/Document';
import { RectShape } from '../src/model/shapes/RectShape';

class CaptureOutput extends ConsoleOutput {
  public readonly lines: string[] = [];
  public override writeLine(line = ''): void { this.lines.push(line); }
}

test('invalid shape providers and throwing command/decorator report errors without crashing CLI', () => {
  const assembly = new Assembly();
  assembly.shapes.register({ name: 'wrong', create: () => new RectShape('other', 0, 0, 1, 1), read: () => new RectShape('other', 0, 0, 1, 1) });
  const output = new CaptureOutput();
  const document = new Document(800, 600, assembly.shapes);
  const context = new CommandContext(document, new HistoryManager(), output,
    assembly.attributes, assembly.decorators, () => assembly.commands.all());
  assembly.commands.execute('create wrong requested', context);
  assert.equal(output.lines.at(-1), 'error: invalid shape provider: wrong');
  assert.equal(document.findById('requested'), undefined);
  assembly.commands.register({ name: 'throwing', description: '', execute: () => { throw new Error('boom'); } });
  assembly.commands.execute('throwing', context);
  assert.equal(output.lines.at(-1), 'error: command failed: throwing (boom)');
  assembly.decorators.register({ name: 'broken', order: 1, label: () => { throw new Error('boom'); } });
  assembly.commands.execute('tree', context);
  assert.equal(output.lines.at(-1), 'error: tree decorator failed: broken (boom)');
  assembly.commands.execute('help', context);
  assert.match(output.lines.at(-1)!, /Available commands:/);
});
