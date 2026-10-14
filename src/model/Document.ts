import { Shape } from './Shape';
import { SvgCanvas } from './SvgCanvas';
import { GroupShape } from './shapes/GroupShape';

export class Document {
  private canvas: SvgCanvas;
  private readonly root: GroupShape;
  private readonly shapes: Map<string, Shape>;

  public constructor(width = 800, height = 600) {
    this.canvas = new SvgCanvas(width, height);
    this.root = new GroupShape('root');
    this.shapes = new Map<string, Shape>();
    this.registerShape(this.root);
  }

  public getCanvas(): SvgCanvas {
    return this.canvas;
  }

  public getRoot(): GroupShape {
    return this.root;
  }

  public initialize(width: number, height: number): void {
    this.canvas.resize(width, height);
  }

  public registerShape(shape: Shape): void {
    if (this.shapes.has(shape.id)) {
      throw new Error(`id already exists: ${shape.id}`);
    }

    this.shapes.set(shape.id, shape);
  }

  public hasShape(id: string): boolean {
    return this.shapes.has(id);
  }

  public findShape(id: string): Shape | undefined {
    return this.shapes.get(id);
  }
}
