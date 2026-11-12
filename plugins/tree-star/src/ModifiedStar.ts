import { TreeDecorator } from '../../../src/core/TreeDecorator';
import { Document } from '../../../src/model/Document';
import { Shape } from '../../../src/model/Shape';
import { GroupShape } from '../../../src/model/shapes/GroupShape';

export class ModifiedStar implements TreeDecorator {
  public readonly name = 'modified-star';
  public readonly order = 100;
  private baselineSvg: string | undefined;
  private readonly baselineById = new Map<string, string>();

  public onBaseline(document: Document): void {
    this.baselineSvg = document.serializeSvg();
    this.baselineById.clear();
    const capture = (shape: Shape): void => {
      this.baselineById.set(shape.id, shape.serializeSvg(0));
      if (shape instanceof GroupShape) for (const child of shape.getChildren()) capture(child);
    };
    capture(document.getRoot());
  }

  public label(shape: Shape | null, document: Document): string {
    if (this.baselineSvg === undefined) return '';
    if (shape === null) return document.serializeSvg() === this.baselineSvg ? '' : ' *';
    return shape.serializeSvg(0) === this.baselineById.get(shape.id) ? '' : ' *';
  }
}
