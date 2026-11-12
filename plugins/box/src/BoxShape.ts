import { Shape } from '../../../src/model/Shape';
import { GroupShape } from '../../../src/model/shapes/GroupShape';
import { RectShape } from '../../../src/model/shapes/RectShape';
import { TextShape } from '../../../src/model/shapes/TextShape';

export class BoxShape extends GroupShape {
  public constructor(id: string, private readonly rect: RectShape, private readonly label: TextShape, children: readonly Shape[] = [rect, label]) {
    super(id, 'box');
    for (const child of children) this.addChild(child);
  }

  public override getKind(): string { return 'box'; }
  public override getDisplayName(): string { return `box#${this.id}`; }
  public override getTreeDisplayName(): string { return `g#${this.id}`; }
  public override createdMessage(): string {
    return `box#${this.id} created (g#${this.id} + rect#${this.rect.id} + text#${this.label.id})`;
  }
  public override canRemoveChild(shape: Shape): boolean {
    return shape !== this.rect && shape !== this.label;
  }
  public getRect(): RectShape { return this.rect; }
  public getLabel(): TextShape { return this.label; }
}
