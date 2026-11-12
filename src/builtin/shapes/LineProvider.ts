import { ShapeProvider } from '../../core/ShapeProvider';
import { Shape } from '../../model/Shape';
import { LineShape } from '../../model/shapes/LineShape';

export class LineProvider implements ShapeProvider {
  public readonly name = 'line';
  public create(id: string, args: readonly (string | undefined)[]): Shape {
    return new LineShape(id, Number(args[0]), Number(args[1]), Number(args[2]), Number(args[3]), args[4]);
  }
  public read(id: string, attrs: Readonly<Record<string, string>>): Shape {
    return this.create(id, [attrs.x1 ?? '0', attrs.y1 ?? '0', attrs.x2 ?? '0', attrs.y2 ?? '0', attrs.stroke]);
  }
}
