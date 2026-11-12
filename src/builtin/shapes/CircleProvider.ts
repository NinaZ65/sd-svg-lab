import { ShapeProvider } from '../../core/ShapeProvider';
import { Shape } from '../../model/Shape';
import { CircleShape } from '../../model/shapes/CircleShape';

export class CircleProvider implements ShapeProvider {
  public readonly name = 'circle';
  public create(id: string, args: readonly (string | undefined)[]): Shape {
    return new CircleShape(id, Number(args[0]), Number(args[1]), Number(args[2]), args[3]);
  }
  public read(id: string, attrs: Readonly<Record<string, string>>): Shape {
    return this.create(id, [attrs.cx ?? '0', attrs.cy ?? '0', attrs.r ?? '0', attrs.fill]);
  }
}
