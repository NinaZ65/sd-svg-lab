import { TreeDecorator } from '../../../src/core/TreeDecorator';
import { Document } from '../../../src/model/Document';
import { Shape } from '../../../src/model/Shape';
import { BoxShape } from './BoxShape';

export class BoxTypeDecorator implements TreeDecorator {
  public readonly name = 'box-type-label';
  public readonly order = 10;
  public label(shape: Shape | null, _document: Document): string { return shape instanceof BoxShape ? ' (box)' : ''; }
}
