import { ShapeProvider } from '../../core/ShapeProvider';
import { Shape } from '../../model/Shape';
import { TextShape } from '../../model/shapes/TextShape';

export class TextProvider implements ShapeProvider {
  public readonly name = 'text';
  public create(id: string, args: readonly (string | undefined)[]): Shape {
    return new TextShape(id, Number(args[0]), Number(args[1]), args[2] ?? '');
  }
  public read(id: string, attrs: Readonly<Record<string, string>>, text: string): Shape {
    return this.create(id, [attrs.x ?? '0', attrs.y ?? '0', text.trim()]);
  }
}
