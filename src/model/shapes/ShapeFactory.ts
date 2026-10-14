import { Shape } from '../Shape';
import { CircleShape } from './CircleShape';
import { EllipseShape } from './EllipseShape';
import { GroupShape } from './GroupShape';
import { LineShape } from './LineShape';
import { RectShape } from './RectShape';
import { TextShape } from './TextShape';

export class ShapeFactory {
  public static create(kind: string, id: string, args: string[]): Shape {
    switch (kind.toLowerCase()) {
      case 'rect':
        return new RectShape(id, Number(args[0]), Number(args[1]), Number(args[2]), Number(args[3]), args[4]);
      case 'circle':
        return new CircleShape(id, Number(args[0]), Number(args[1]), Number(args[2]), args[3]);
      case 'ellipse':
        return new EllipseShape(id, Number(args[0]), Number(args[1]), Number(args[2]), Number(args[3]), args[4]);
      case 'line':
        return new LineShape(id, Number(args[0]), Number(args[1]), Number(args[2]), Number(args[3]), args[4]);
      case 'text':
        return new TextShape(id, Number(args[0]), Number(args[1]), args[2]);
      case 'g':
        return new GroupShape(id);
      default:
        throw new Error(`unknown shape type: ${kind}`);
    }
  }
}
