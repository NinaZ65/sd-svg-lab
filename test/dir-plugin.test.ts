import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { DirCommand } from '../plugins/dir/src/DirCommand';
import { NodeDirectoryAdapter } from '../plugins/dir/src/NodeDirectoryAdapter';
import { DirectoryAccess } from '../plugins/dir/src/DirectoryAccess';
import { CommandContext } from '../src/commands/CommandContext';
import { HistoryManager } from '../src/history/HistoryManager';
import { Document } from '../src/model/Document';
import { ConsoleOutput } from '../src/io/ConsoleOutput';

class CaptureOutput extends ConsoleOutput {
  public readonly lines: string[] = [];
  public override writeLine(line = ''): void { this.lines.push(line); }
}

function setup(access: DirectoryAccess, path = '/fixed'): { command: DirCommand; context: CommandContext; output: CaptureOutput } {
  const output = new CaptureOutput();
  return { command: new DirCommand(access, () => path), context: new CommandContext(new Document(), new HistoryManager(), output), output };
}

test('dir sorts directories before files, includes hidden entries, and leaves state untouched', () => {
  const access: DirectoryAccess = { list: () => [
    { name: 'z.txt', directory: false }, { name: '.hidden', directory: false },
    { name: 'zdir', directory: true }, { name: 'adir', directory: true },
  ] };
  const { command, context, output } = setup(access);
  const before = context.document.serializeSvg();
  const depth = context.history.getUndoDepth();
  command.execute(context, []);
  assert.deepEqual(output.lines, ['[DIR]  adir', '[DIR]  zdir', '[FILE]  .hidden', '[FILE]  z.txt']);
  assert.equal(context.document.serializeSvg(), before);
  assert.equal(context.history.getUndoDepth(), depth);
  assert.equal(context.history.isIoBarrierActive(), false);
});

test('dir handles empty and failed listings without changing the history barrier', () => {
  const empty = setup({ list: () => [] });
  empty.context.history.setIoBarrier();
  empty.command.execute(empty.context, []);
  assert.deepEqual(empty.output.lines, ['(empty directory)']);
  assert.equal(empty.context.history.isIoBarrierActive(), true);
  const failed = setup({ list: () => { throw new Error('denied'); } });
  failed.command.execute(failed.context, []);
  assert.deepEqual(failed.output.lines, ['error: cannot read directory: /fixed']);
  assert.equal(failed.context.history.getUndoDepth(), 0);
});

test('dir combines with real file system adapter, including a hidden file', () => {
  const path = mkdtempSync(join(tmpdir(), 'svg-dir-'));
  try {
    mkdirSync(join(path, 'docs'));
    writeFileSync(join(path, 'demo.svg'), '');
    writeFileSync(join(path, '.hidden'), '');
    const { command, context, output } = setup(new NodeDirectoryAdapter(), path);
    command.execute(context, []);
    assert.deepEqual(output.lines, ['[DIR]  docs', '[FILE]  .hidden', '[FILE]  demo.svg']);
  } finally { rmSync(path, { recursive: true, force: true }); }
});

test('dir gives byte-identical output in code and config assemblies', () => {
  const path = mkdtempSync(join(tmpdir(), 'svg-dir-assembly-'));
  try {
    mkdirSync(join(path, 'docs'));
    writeFileSync(join(path, 'demo.svg'), '');
    const cli = resolve(__dirname, '../src/cli/CliApp.js');
    const config = resolve(__dirname, '../../plugins.config.json');
    const run = (args: string[]) => spawnSync(process.execPath, [cli, ...args], { cwd: path, input: 'dir\nexit\n', encoding: 'utf8' });
    const code = run([]);
    const configured = run(['--config', config]);
    assert.equal(code.status, 0);
    assert.equal(configured.status, 0);
    assert.equal(code.stdout, configured.stdout);
    assert.match(code.stdout, /\[DIR\]  docs/);
  } finally { rmSync(path, { recursive: true, force: true }); }
});
