const test = require('node:test');
const assert = require('node:assert/strict');
const { SvgOutlineParser } = require('../out/SvgOutlineParser.js');

const parser = new SvgOutlineParser();

test('nested groups, source offsets, and unnamed text', () => {
  const source = '<svg><g id="outer"><g id="inner"><rect id="r"/></g><text>Hi</text></g></svg>';
  const [svg] = parser.parse(source);
  assert.equal(svg.tag, 'svg');
  assert.equal(svg.children[0].id, 'outer');
  assert.equal(svg.children[0].children[0].id, 'inner');
  const rect = svg.children[0].children[0].children[0];
  assert.equal(source.slice(rect.start, rect.openingEnd), '<rect id="r"/>');
  assert.equal(svg.children[0].children[1].tag, 'text');
  assert.equal(svg.children[0].children[1].id, undefined);
});

test('editing content produces an updated outline', () => {
  const original = '<svg><rect id="before"/></svg>';
  const edited = '<svg><rect id="after"/><circle id="new"/></svg>';
  assert.deepEqual(parser.parse(original)[0].children.map(node => node.id), ['before']);
  assert.deepEqual(parser.parse(edited)[0].children.map(node => node.id), ['after', 'new']);
});

test('incomplete or mismatched XML safely clears the outline', () => {
  assert.deepEqual(parser.parse('<svg><g id="partial"'), []);
  assert.deepEqual(parser.parse('<svg><g></svg>'), []);
  assert.deepEqual(parser.parse('<svg><!-- unfinished'), []);
});

test('quoted angle brackets and comments do not create false nodes', () => {
  const [svg] = parser.parse('<svg><!-- <circle/> --><text data-x="a>b">Hello</text></svg>');
  assert.deepEqual(svg.children.map(node => node.tag), ['text']);
});
