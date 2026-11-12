import { ShapeProvider } from '../../core/ShapeProvider';
import { Shape } from '../../model/Shape';
import { GroupShape } from '../../model/shapes/GroupShape';

export class GroupProvider implements ShapeProvider {
  public readonly name = 'g';
  public create(id: string): Shape { return new GroupShape(id); }
  public read(id: string, attrs: Readonly<Record<string, string>>, _text: string, children: readonly Shape[]): Shape {
    const group = new GroupShape(id, attrs['data-kind']);
    for (const child of children) group.addChild(child);
    return group;
  }
}
