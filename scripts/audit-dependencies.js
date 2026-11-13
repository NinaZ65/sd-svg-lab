#!/usr/bin/env node
// Static dependency check for the rules in doc/PHASE2_SPEC.md.
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const publicApi = new Set([
  'src/core/PluginContext', 'src/core/ShapeProvider', 'src/core/AttributeHandler',
  'src/core/AttributeTransaction', 'src/core/TreeDecorator',
  'src/commands/Command', 'src/commands/CommandContext',
  'src/model/Shape', 'src/model/Document', 'src/model/shapes/GroupShape',
]);
function files(directory) {
  return fs.readdirSync(path.join(root, directory), { withFileTypes: true }).flatMap(entry => {
    const name = `${directory}/${entry.name}`;
    return entry.isDirectory() ? files(name) : name.endsWith('.ts') ? [name] : [];
  });
}
const sources = ['src', 'plugins', 'vscode-extension/src'].flatMap(files);
const errors = [];
let edges = 0;
let dynamicLoads = 0;
for (const file of sources) {
  const source = ts.createSourceFile(file, fs.readFileSync(path.join(root, file), 'utf8'), ts.ScriptTarget.Latest, true);
  const check = request => {
    edges += 1;
    const target = request.startsWith('.')
      ? path.posix.normalize(path.posix.join(path.posix.dirname(file), request)).replace(/\.ts$/, '') : request;
    const domain = /^src\/(core|model|history)\//.test(file);
    const plugin = file.match(/^plugins\/([^/]+)\//)?.[1];
    let invalid = false;
    if (domain) {
      invalid = /^(plugins\/|src\/(host|builtin|cli|io)\/)/.test(target)
        || /^src\/commands\//.test(target) && target !== 'src/commands/Command'
        || ['fs', 'node:fs', 'fs/promises', 'node:fs/promises', 'readline', 'node:readline'].includes(target);
    }
    if (plugin && request.startsWith('.')) {
      invalid = !target.startsWith(`plugins/${plugin}/`) && !publicApi.has(target);
    }
    if (file.startsWith('vscode-extension/src/')) {
      invalid = !target.startsWith('vscode-extension/src/') && target !== 'vscode';
    }
    if (file === 'src/host/ConfigLoader.ts' && target.startsWith('plugins/')) invalid = true;
    if (invalid) errors.push(`${file} -> ${request}`);
  };
  const visit = node => {
    if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier
      && ts.isStringLiteral(node.moduleSpecifier)) check(node.moduleSpecifier.text);
    if (ts.isCallExpression(node) && (node.expression.getText(source) === 'require'
      || node.expression.kind === ts.SyntaxKind.ImportKeyword)) {
      if (node.arguments.length === 1 && ts.isStringLiteral(node.arguments[0])) check(node.arguments[0].text);
      else {
        dynamicLoads += 1;
        if (file !== 'src/host/ConfigLoader.ts') errors.push(`${file}: dynamic module loading needs review`);
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
}
console.log(`Scanned ${sources.length} TypeScript source files and ${edges} literal module references.`);
console.log(`Dynamic loads: ${dynamicLoads} (only the generic ConfigLoader is permitted).`);
console.log('Checked domain boundaries, plugin public API / package isolation, extension isolation and loader imports.');
if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else console.log('PASS: no dependency rule violations found by static inspection.');
console.log('Limits: this does not prove runtime behavior or inspect eval, computed aliases or plugin side effects.');
