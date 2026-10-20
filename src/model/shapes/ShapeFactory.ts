import { Shape } from '../Shape';
import { CircleShape } from './CircleShape';
import { EllipseShape } from './EllipseShape';
import { GroupShape } from './GroupShape';
import { LineShape } from './LineShape';
import { RectShape } from './RectShape';
import { TextShape } from './TextShape';

export class ShapeFactory {
  private static readonly svgParameters: Record<string, readonly string[]> = {
    rect: ['x', 'y', 'width', 'height', 'fill'],
    circle: ['cx', 'cy', 'r', 'fill'],
    ellipse: ['cx', 'cy', 'rx', 'ry', 'fill'],
    line: ['x1', 'y1', 'x2', 'y2', 'stroke'],
    text: ['x', 'y', 'text'],
    g: [],
  };

  public static fromSvg(kind: string, id: string, attributes: Record<string, string>, textContent = ''): Shape | undefined {
    if (!Object.prototype.hasOwnProperty.call(this.svgParameters, kind)) {
      return undefined;
    }
    const args = this.svgParameters[kind].map(attribute => {
      if (attribute === 'text') {
        return textContent.trim();
      }
      const fallback = attribute === 'fill' || attribute === 'stroke' ? undefined : '0';
      return attributes[attribute] ?? fallback;
    });
    return this.create(kind, id, args);
  }

  public static create(kind: string, id: string, args: readonly (string | undefined)[]): Shape {
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
        return new TextShape(id, Number(args[0]), Number(args[1]), args[2] ?? '');
      case 'g':
        return new GroupShape(id);
      default:
        throw new Error(`unknown shape type: ${kind}`);
    }
  }
}
