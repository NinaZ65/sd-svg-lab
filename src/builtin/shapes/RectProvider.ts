import { ShapeProvider } from '../../core/ShapeProvider';
import { Shape } from '../../model/Shape';
import { RectShape } from '../../model/shapes/RectShape';

export class RectProvider implements ShapeProvider {
  public readonly name = 'rect';
  public create(id: string, args: readonly (string | undefined)[]): Shape {
    return new RectShape(id, Number(args[0]), Number(args[1]), Number(args[2]), Number(args[3]), args[4]);
  }
  public read(id: string, attrs: Readonly<Record<string, string>>): Shape {
    return this.create(id, [attrs.x ?? '0', attrs.y ?? '0', attrs.width ?? '0', attrs.height ?? '0', attrs.fill]);
  }
}
