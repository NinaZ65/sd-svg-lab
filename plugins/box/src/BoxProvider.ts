import { ShapeProvider } from '../../../src/core/ShapeProvider';
import { Shape } from '../../../src/model/Shape';
import { RectShape } from '../../../src/model/shapes/RectShape';
import { TextShape } from '../../../src/model/shapes/TextShape';
import { BoxShape } from './BoxShape';

export class BoxProvider implements ShapeProvider {
  public readonly name = 'box';
  public constructor(private readonly defaultFill = '#4a90d9') {}

  public create(id: string, args: readonly (string | undefined)[]): Shape {
    if (args.length < 5) throw new Error('box requires x, y, width, height and title');
    const [x, y, width, height] = args.slice(0, 4).map(Number);
    if (![x, y, width, height].every(Number.isFinite) || width <= 0 || height <= 0) {
      throw new Error('invalid box geometry');
    }
    const rect = new RectShape(`${id}-rect`, x, y, width, height, this.defaultFill);
    const label = new TextShape(`${id}-label`, x + 20, y + 35, args[4] ?? '');
    return new BoxShape(id, rect, label);
  }

  public read(id: string, _attributes: Readonly<Record<string, string>>, _text: string, children: readonly Shape[]): Shape {
    const rect = children.find(child => child.id === `${id}-rect`);
    const label = children.find(child => child.id === `${id}-label`);
    if (!(rect instanceof RectShape) || !(label instanceof TextShape)) throw new Error(`invalid box: ${id}`);
    return new BoxShape(id, rect, label, children);
  }
}
