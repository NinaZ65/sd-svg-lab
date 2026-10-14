import { execFileSync } from 'node:child_process';
import { strict as assert } from 'node:assert';

describeCliSmoke();

function describeCliSmoke(): void {
  const output = execFileSync('node', ['dist/src/cli/CliApp.js'], {
    input: 'help\nexit\n',
    encoding: 'utf8',
    cwd: process.cwd(),
  });

  assert.ok(output.includes('svg-editor 0.1 — type \'help\' for commands'));
  assert.ok(output.includes('svg>'));
  assert.ok(output.includes('help'));
  assert.ok(output.includes('Available commands'));
}
