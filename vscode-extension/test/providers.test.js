const test = require('node:test');
const assert = require('node:assert/strict');
const Module = require('node:module');

const fakeVscode = {
  FileType: { File: 1, Directory: 2 },
  FileDecoration: class { constructor(badge, tooltip) { this.badge = badge; this.tooltip = tooltip; } },
  workspace: { fs: { stat: async uri => ({ type: uri.type }) } },
  SymbolKind: { File: 0, Namespace: 2, Object: 18 },
  Range: class { constructor(start, end) { this.start = start; this.end = end; } },
  DocumentSymbol: class {
    constructor(name, detail, kind, range, selectionRange) {
      Object.assign(this, { name, detail, kind, range, selectionRange, children: [] });
    }
  },
};
const originalLoad = Module._load;
Module._load = function (request, parent, isMain) {
  if (request === 'vscode') return fakeVscode;
  return originalLoad.call(this, request, parent, isMain);
};
const { SvgFileDecorationProvider } = require('../out/SvgFileDecorationProvider.js');
const { SvgDocumentSymbolProvider } = require('../out/SvgDocumentSymbolProvider.js');
Module._load = originalLoad;

test('file decoration marks only SVG files, not directories or other files', async () => {
  const provider = new SvgFileDecorationProvider();
  assert.equal((await provider.provideFileDecoration({ path: '/example.svg', type: 1 })).badge, '[]');
  assert.equal(await provider.provideFileDecoration({ path: '/folder.svg', type: 2 }), undefined);
  assert.equal(await provider.provideFileDecoration({ path: '/readme.txt', type: 1 }), undefined);
});

test('document symbol ranges locate source and update on edit', () => {
  const provider = new SvgDocumentSymbolProvider();
  const document = source => ({
    getText: () => source,
    positionAt: offset => offset,
  });
  const source = '<svg>\n<g id="a"><rect id="r"/></g>\n</svg>';
  const [svg] = provider.provideDocumentSymbols(document(source), { isCancellationRequested: false });
  assert.equal(svg.children[0].name, 'g#a');
  assert.equal(svg.children[0].children[0].name, 'rect#r');
  const rectRange = svg.children[0].children[0].selectionRange;
  assert.equal(source.slice(rectRange.start, rectRange.end), '<rect id="r"/>');
  const [updated] = provider.provideDocumentSymbols(document(source.replace('id="r"', 'id="new"')), { isCancellationRequested: false });
  assert.equal(updated.children[0].children[0].name, 'rect#new');
  assert.deepEqual(provider.provideDocumentSymbols(document('<svg><g>'), { isCancellationRequested: false }), []);
});
