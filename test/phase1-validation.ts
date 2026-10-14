import { strict as assert } from 'node:assert';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

function runCli(input: string): string {
  return execFileSync('node', ['dist/src/cli/CliApp.js'], {
    input,
    cwd: process.cwd(),
    encoding: 'utf8',
  });
}

function expect(condition: boolean, message: string): void {
  assert.ok(condition, message);
}

function main(): void {
  const output1 = runCli([
    'init 200 100',
    'create rect r1 0 0 10 10 red',
    'create text t1 5 5 "A"',
    'create g g1',
    'addto g1 r1',
    'addto g1 t1',
    'move g1 10 20',
    'scale g1 2',
    'tree',
    'exit',
  ].join('\n'));
  expect(output1.includes('rect#r1 x=20 y=40'), 'group composite move and scale should affect children');
  expect(output1.includes('text#t1'), 'group tree should still show the nested text element');

  const output2 = runCli([
    'init 200 100',
    'create rect r1 0 0 10 10 red',
    'move r1 5 5',
    'undo',
    'redo',
    'tree',
    'exit',
  ].join('\n'));
  expect(output2.includes('undo executed'), 'undo should execute after a valid edit');
  expect(output2.includes('redo executed'), 'redo should execute after undo');
  expect(output2.includes('rect#r1 x=5 y=5'), 'redo should restore the moved rectangle');

  const tempDir = mkdtempSync(join(tmpdir(), 'svg-cli-'));
  const filePath = join(tempDir, 'demo.svg');

  try {
    const output3 = runCli([
      'init 200 100',
      'create rect r1 0 0 10 10 red',
      'save ' + filePath,
      'undo',
      'create circle c1 20 20 5 blue',
      'undo',
      'tree',
      'exit',
    ].join('\n'));
    expect(output3.includes('error: undo not allowed after io command'), 'undo after IO should be blocked');
    expect(output3.includes('circle#c1 created'), 'a fresh edit should still be allowed after the IO barrier');
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }

  const output4 = runCli([
    'init 200 100',
    'create rect r1 0 0 10 10 red',
    'scale r1 0',
    'scale r1 -1',
    'tree',
    'exit',
  ].join('\n'));
  expect(output4.includes('error: scale factor must be positive'), 'scale factor validation should reject zero and negatives');
  expect(output4.includes('rect#r1 x=0 y=0 w=10 h=10'), 'invalid scale should not mutate the shape');

  const output5 = runCli([
    'init 200 100',
    'create rect r1 0 0 10 10 red',
    'set r1 something 42',
    'tree',
    'exit',
  ].join('\n'));
  expect(output5.includes('error: unknown attribute: something'), 'unknown attributes should be rejected');
  expect(output5.includes('rect#r1 x=0 y=0 w=10 h=10'), 'unknown attributes should not alter the rect');

  const readDir = mkdtempSync(join(tmpdir(), 'svg-read-'));
  const readPath = join(readDir, 'input.svg');
  const svgContent = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="100">',
    '<rect x="0" y="0" width="20" height="10"/>',
    '<circle id="c1" cx="30" cy="30" r="10"/>',
    '<rect x="50" y="10" width="30" height="15"/>',
    '</svg>',
  ].join('\n');
  writeFileSync(readPath, svgContent, 'utf8');

  try {
    const output6 = runCli([`read ${readPath}`, 'tree', 'exit'].join('\n'));
    expect(output6.includes('warning: assigned id rect1 to unnamed <rect>'), 'missing ids should receive warning and generated ids');
    expect(output6.includes('circle#c1'), 'named elements should keep their ids after read');
    expect(output6.includes('rect#rect1'), 'unnamed elements should get generated ids after read');
  } finally {
    rmSync(readDir, { recursive: true, force: true });
  }
}

main();
