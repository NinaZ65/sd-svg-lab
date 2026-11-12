import { AttributeHandler, AttributeOutcome } from '../../../src/core/AttributeHandler';
import { AttributeTransaction } from '../../../src/core/AttributeTransaction';
import { Shape } from '../../../src/model/Shape';
import { BoxShape } from './BoxShape';

export class BoxAttributeHandler implements AttributeHandler {
  public readonly name = 'box-attributes';
  public handles(shape: Shape, attribute: string): boolean {
    return shape instanceof BoxShape && (attribute === 'fill' || attribute === 'label');
  }
  public apply(shape: Shape, attribute: string, value: string, transaction: AttributeTransaction): AttributeOutcome {
    if (!(shape instanceof BoxShape)) throw new Error('not a box');
    if (attribute === 'fill') {
      transaction.set(shape.getRect(), 'fill', value);
      return { executeMessage: `box#${shape.id} fill propagated to ${shape.getRect().id}` };
    }
    const previous = String(shape.getLabel().readAttribute('text'));
    transaction.set(shape.getLabel(), 'text', value);
    return {
      executeMessage: `box#${shape.id} label updated: "${value}"`,
      undoMessage: `box#${shape.id} label restored: "${previous}"`,
      redoMessage: `box#${shape.id} label updated: "${value}"`,
    };
  }
}
