const test = require('node:test');
const assert = require('node:assert/strict');
const Module = require('node:module');

const fakeVscode = {
  FileType: { File: 1, Directory: 2 },
  FileDecoration: class { constructor(badge, tooltip) { this.badge = badge; this.tooltip = tooltip; } },
  workspace: { fs: { stat: async uri => ({ type: uri.type }) } },
  SymbolKind: { File: 0, Namespace: 2, String: 14, Array: 17, Object: 18 },
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

function symbols(source) {
  return new SvgDocumentSymbolProvider().provideDocumentSymbols({
    getText: () => source, positionAt: offset => offset,
  }, { isCancellationRequested: false });
}

for (const newline of ['\n', '\r\n']) {
  test(`Outline selects the opening tag and retains container extent with ${JSON.stringify(newline)} lines`, () => {
    const lines = ['<!-- 😀 引导注释 -->', '<svg>', '  <g', '    id="flow">',
      '    <!-- <rect id="fake"/> -->', '    <rect id="start" data-note="a>b"',
      '      width="120" height="60"/>', '    <text>开始😀</text>', '  </g>', '</svg>'];
    const source = lines.join(newline);
    const starts = lines.map((_, index) => lines.slice(0, index).reduce((offset, line) => offset + line.length + newline.length, 0));
    const document = {
      getText: () => source,
      positionAt: offset => {
        const line = starts.findLastIndex(start => start <= offset);
        return { line, character: offset - starts[line] };
      },
    };
    const offsetAt = position => starts[position.line] + position.character;
    const selected = symbol => source.slice(offsetAt(symbol.selectionRange.start), offsetAt(symbol.selectionRange.end));
    const [svg] = new SvgDocumentSymbolProvider().provideDocumentSymbols(document, { isCancellationRequested: false });
    const group = svg.children[0];
    const [rect, text] = group.children;
    assert.equal(selected(group), ['<g', '    id="flow">'].join(newline));
    assert.deepEqual(group.selectionRange.start, { line: 2, character: 2 });
    assert.deepEqual(group.range.end, { line: 8, character: 6 });
    assert.equal(selected(rect), ['<rect id="start" data-note="a>b"', '      width="120" height="60"/>'].join(newline));
    assert.deepEqual(rect.selectionRange.start, { line: 5, character: 4 });
    assert.equal(selected(text), '<text>');
    assert.deepEqual(text.range.end, { line: 7, character: lines[7].length });
    const contained = node => {
      assert.ok(offsetAt(node.range.start) <= offsetAt(node.selectionRange.start));
      assert.ok(offsetAt(node.selectionRange.end) <= offsetAt(node.range.end));
      for (const child of node.children) {
        assert.ok(offsetAt(node.range.start) <= offsetAt(child.range.start));
        assert.ok(offsetAt(child.range.end) <= offsetAt(node.range.end));
        contained(child);
      }
    };
    contained(svg);
  });
}

test('native symbol kinds distinguish SVG roots, containers, shapes and text while preserving source order', () => {
  const [svg] = symbols('<svg><g id="flow"><rect/><text><tspan>开始</tspan></text></g><defs><clipPath><path/></clipPath></defs><custom/></svg>');
  assert.equal(svg.kind, fakeVscode.SymbolKind.File);
  const [group, defs, unknown] = svg.children;
  assert.equal(group.kind, fakeVscode.SymbolKind.Array);
  assert.equal(defs.kind, fakeVscode.SymbolKind.Array);
  assert.equal(defs.children[0].kind, fakeVscode.SymbolKind.Array);
  assert.deepEqual(group.children.map(node => node.name), ['rect', 'text']);
  assert.equal(group.children[0].kind, fakeVscode.SymbolKind.Object);
  assert.equal(group.children[1].kind, fakeVscode.SymbolKind.String);
  assert.equal(group.children[1].children[0].kind, fakeVscode.SymbolKind.String);
  assert.equal(unknown.kind, fakeVscode.SymbolKind.Object);
});

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

test('Outline details show explicit geometry without changing symbol names or inventing CSS dimensions', () => {
  const [svg] = symbols(`<svg width="400" height="220"><g id="flow">
    <rect data-note='width="fake" id="fake"' id="start" width="120" height="60"/>
    <circle r="0"/><ellipse rx="10" ry="20"/><rect style="width:30px;height:40px"/>
    <path d="M0 0"/></g></svg>`);
  assert.equal(svg.detail, '400 × 220');
  assert.equal(svg.children[0].detail, '');
  const [rect, circle, ellipse, styled, path] = svg.children[0].children;
  assert.equal(rect.name, 'rect#start');
  assert.equal(rect.detail, '120 × 60');
  assert.equal(circle.detail, 'r=0');
  assert.equal(ellipse.detail, 'rx=10 · ry=20');
  assert.equal(styled.detail, '');
  assert.equal(path.detail, '');
});

test('text hints normalize whitespace, handle nested text and XML entities, and keep Unicode intact', () => {
  const [svg] = symbols('<svg><text> 开始\n<tspan>审核 &amp; &#x1F600;</tspan><!-- omitted --><![CDATA[ <完成> &amp;]]></text><text/></svg>');
  assert.equal(svg.children[0].name, 'text');
  assert.equal(svg.children[0].detail, '“开始 审核 & 😀 <完成> &amp;”');
  assert.equal(svg.children[1].detail, '');
  assert.equal(symbols(`<svg><text>${'😀'.repeat(33)}</text></svg>`)[0].children[0].detail, `“${'😀'.repeat(32)}…”`);
  assert.equal(symbols('<svg><text>A &amp; B</text></svg>')[0].children[0].detail, '“A & B”');
  assert.equal(symbols('<svg><text>已更新</text></svg>')[0].children[0].detail, '“已更新”');
  assert.deepEqual(symbols('<svg><text>未完成'), []);
});
