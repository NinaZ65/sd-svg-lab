import { strict as assert } from 'node:assert';
import { Document } from '../src/model/Document';
import { GroupShape } from '../src/model/shapes/GroupShape';
import { RectShape } from '../src/model/shapes/RectShape';
import { TextShape } from '../src/model/shapes/TextShape';

const document = new Document(800, 600);
const flow = new GroupShape('flow');
const rect = new RectShape('start', 10, 20, 40, 30, '#f00');
const label = new TextShape('label', 15, 25, 'demo');

flow.addChild(rect);
flow.addChild(label);
document.getRoot().addChild(flow);

assert.strictEqual(document.findById('flow')?.id, 'flow');
assert.strictEqual(document.findById('start')?.id, 'start');
assert.strictEqual(document.findById('label')?.id, 'label');
assert.strictEqual(document.findById('missing'), undefined);
