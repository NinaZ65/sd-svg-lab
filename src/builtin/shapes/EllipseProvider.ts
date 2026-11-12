import { ShapeProvider } from '../../core/ShapeProvider';
import { Shape } from '../../model/Shape';
import { EllipseShape } from '../../model/shapes/EllipseShape';

export class EllipseProvider implements ShapeProvider {
  public readonly name = 'ellipse';
  public create(id: string, args: readonly (string | undefined)[]): Shape {
    return new EllipseShape(id, Number(args[0]), Number(args[1]), Number(args[2]), Number(args[3]), args[4]);
  }
  public read(id: string, attrs: Readonly<Record<string, string>>): Shape {
    return this.create(id, [attrs.cx ?? '0', attrs.cy ?? '0', attrs.rx ?? '0', attrs.ry ?? '0', attrs.fill]);
  }
}
