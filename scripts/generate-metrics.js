#!/usr/bin/env node
const { execFileSync } = require('node:child_process');
const { mkdirSync, writeFileSync } = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

const baseline = process.argv[2] || 'final';
const current = process.argv[3] || 'p2';
const repo = path.resolve(__dirname, '..');
const git = (...args) => execFileSync('git', args, { cwd: repo, encoding: 'utf8' });
let currentSource = current;
try { git('rev-parse', '--verify', '--quiet', current); }
catch (error) {
  if (current !== 'p2') throw error;
  currentSource = 'HEAD';
  process.stderr.write('p2 is not yet tagged; generating candidate metrics from HEAD. Rerun after tagging.\n');
}
const sourcePaths = ref => git('ls-tree', '-r', '--name-only', ref).trim().split('\n')
  .filter(name => /^(src|plugins|vscode-extension)\/.+\.ts$/.test(name) && !/\.d\.ts$/.test(name));

function category(name) {
  if (name.startsWith('vscode-extension/')) return ['VSCode 扩展', '文件标记、大纲或解析'];
  if (name.startsWith('plugins/')) return ['插件', 'Lab 2 可选插件'];
  if (name.startsWith('src/host/') || name === 'src/cli/CliApp.ts' || name === 'src/cli/ReplLoop.ts' || name.startsWith('src/io/'))
    return ['装配处', '启动、加载或技术适配'];
  if (name.startsWith('src/builtin/') || name.startsWith('src/commands/') && !/\/(Command|CommandContext|AbstractCommand)\.ts$/.test(name)
      || name.startsWith('src/model/shapes/') && !name.endsWith('/GroupShape.ts'))
    return ['插件', '默认图形或内置命令实现'];
  return ['内核', '领域模型、历史或扩展契约'];
}

function complexity(name, source) {
  const file = ts.createSourceFile(name, source, ts.ScriptTarget.Latest, true);
  let count = 0;
  const visit = node => {
    if (ts.isFunctionLike(node) && node.body) count += 1;
    if (ts.isIfStatement(node) || ts.isForStatement(node) || ts.isForOfStatement(node)
      || ts.isForInStatement(node) || ts.isWhileStatement(node) || ts.isDoStatement(node)
      || ts.isCatchClause(node) || ts.isConditionalExpression(node) || ts.isCaseClause(node)) count += 1;
    if (ts.isBinaryExpression(node) && [ts.SyntaxKind.AmpersandAmpersandToken, ts.SyntaxKind.BarBarToken,
      ts.SyntaxKind.QuestionQuestionToken].includes(node.operatorToken.kind)) count += 1;
    ts.forEachChild(node, visit);
  };
  visit(file);
  return count;
}

function snapshot(ref) {
  const rows = sourcePaths(ref).map(name => {
    const source = git('show', `${ref}:${name}`);
    const [bucket, role] = category(name);
    return { name, bucket, role, lines: source.split('\n').length - (source.endsWith('\n') ? 1 : 0), complexity: complexity(name, source) };
  });
  const totals = {};
  for (const row of rows) {
    const item = totals[row.bucket] ||= { files: 0, lines: 0, complexity: 0 };
    item.files += 1;
    item.lines += row.lines;
    item.complexity += row.complexity;
  }
  return { rows, totals };
}

const before = snapshot(baseline);
const after = snapshot(currentSource);
const output = path.join(repo, 'docs', 'metrics');
mkdirSync(output, { recursive: true });
for (const [label, data] of [[baseline, before], [current, after]]) {
  const safe = label.replace(/[^A-Za-z0-9_-]/g, '_');
  writeFileSync(path.join(output, `files-${safe}.tsv`),
    ['path\tbucket\trole\tphysical_lines\tcomplexity', ...data.rows.map(row =>
      `${row.name}\t${row.bucket}\t${row.role}\t${row.lines}\t${row.complexity}`)].join('\n') + '\n');
}
const buckets = ['内核', '装配处', '插件', 'VSCode 扩展'];
const lines = [
  '# CLI 重构指标', '',
  `由 \`node scripts/generate-metrics.js ${baseline} ${current}\` 从 Git 对象生成；比较版本为 \`${baseline}\` 与 \`${current}\`。`,
  '行数为 TypeScript 源文件物理行数。复杂度估算为每个函数/方法 1，加上分支、循环、catch、条件表达式及 `&&` / `||` / `??` 的数量；不计构建产物、依赖包、测试和声明文件。',
  'VSCode 扩展单列，不计入 CLI 增量。', '',
  '| 分类 | 基线文件 | 当前文件 | 基线行数 | 当前行数 | 行数增量 | 基线复杂度 | 当前复杂度 | 复杂度增量 |',
  '|---|---:|---:|---:|---:|---:|---:|---:|---:|',
];
for (const bucket of buckets) {
  const a = before.totals[bucket] || { files: 0, lines: 0, complexity: 0 };
  const b = after.totals[bucket] || { files: 0, lines: 0, complexity: 0 };
  lines.push(`| ${bucket} | ${a.files} | ${b.files} | ${a.lines} | ${b.lines} | ${b.lines - a.lines} | ${a.complexity} | ${b.complexity} | ${b.complexity - a.complexity} |`);
}
lines.push('', `文件与职责详见 \`files-${baseline.replace(/[^A-Za-z0-9_-]/g, '_')}.tsv\` 和 \`files-${current.replace(/[^A-Za-z0-9_-]/g, '_')}.tsv\`。`, '');
writeFileSync(path.join(output, 'summary.md'), lines.join('\n'));
