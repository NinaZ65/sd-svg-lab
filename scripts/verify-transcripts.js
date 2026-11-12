#!/usr/bin/env node
const assert = require('node:assert/strict');
const { execFileSync, spawnSync } = require('node:child_process');
const { copyFileSync, existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } = require('node:fs');
const { tmpdir } = require('node:os');
const path = require('node:path');

const repo = path.resolve(__dirname, '..');
const transcriptDir = path.join(repo, 'doc/transcript');
const expectedDir = path.join(transcriptDir, 'expected');
const currentCli = path.join(repo, 'dist/src/cli/CliApp.js');
const config = path.join(repo, 'plugins.config.json');
const updateExpected = process.argv.includes('--update-expected');

function fixture(kind) {
  const dir = mkdtempSync(path.join(tmpdir(), `svg-transcript-${kind}-`));
  if (kind === 'cli-1') {
    copyFileSync(path.join(transcriptDir, 'assets/other.svg'), path.join(dir, 'other.svg'));
  } else if (kind === 'commands') {
    mkdirSync(path.join(dir, 'docs'));
    mkdirSync(path.join(dir, 'plugins'));
    writeFileSync(path.join(dir, 'demo.svg'), '<svg/>\n');
    writeFileSync(path.join(dir, 'package.json'), '{}\n');
  }
  return dir;
}

function run(cli, args, kind) {
  const cwd = fixture(kind);
  try {
    const input = readFileSync(path.join(transcriptDir, `${kind}.txt`));
    const result = spawnSync(process.execPath, [cli, ...args], { cwd, input });
    if (result.status !== 0) throw new Error(`${kind} exited ${result.status}: ${result.stderr}`);
    return result.stdout;
  } finally { rmSync(cwd, { recursive: true, force: true }); }
}

function display(buffer) {
  return buffer.toString('utf8').replace(/\x1b\[[0-9;]*[A-Za-z]/g, '').replace(/\r/g, '');
}

const archive = execFileSync('git', ['archive', 'final'], { cwd: repo });
const checkout = mkdtempSync(path.join(tmpdir(), 'svg-final-source-'));
try {
  const extracted = spawnSync('tar', ['-x', '-C', checkout], { input: archive });
  if (extracted.status !== 0) throw new Error(String(extracted.stderr));
  symlinkSync(path.join(repo, 'node_modules'), path.join(checkout, 'node_modules'));
  execFileSync('npm', ['run', 'build'], { cwd: checkout, stdio: 'pipe' });
  const finalCli = path.join(checkout, 'dist/src/cli/CliApp.js');
  const baseline = run(finalCli, [], 'cli-1');
  const noPlugins = run(currentCli, ['--no-plugins'], 'cli-1');
  assert.deepEqual(noPlugins, baseline, 'Lab 1 session differs from final with optional plugins disabled');
  console.log('PASS: final vs --no-plugins: cli-1.txt');

  for (const kind of ['cli-1', 'box-session', 'commands']) {
    const code = run(currentCli, [], kind);
    const configured = run(currentCli, ['--config', config], kind);
    assert.deepEqual(configured, code, `code/config output differs for ${kind}`);
    console.log(`PASS: code vs config: ${kind}.txt`);
    const expectedPath = path.join(expectedDir, `${kind}.txt`);
    if (updateExpected) {
      mkdirSync(expectedDir, { recursive: true });
      writeFileSync(expectedPath, display(code));
    } else if (existsSync(expectedPath)) {
      assert.equal(display(code), readFileSync(expectedPath, 'utf8'), `expected output differs for ${kind}`);
    }
  }
} finally { rmSync(checkout, { recursive: true, force: true }); }
