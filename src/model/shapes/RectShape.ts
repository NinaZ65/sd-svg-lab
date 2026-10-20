import { Shape } from '../Shape';

export class RectShape extends Shape {
  public constructor(
    id: string,
    public x: number,
    public y: number,
    public width: number,
    public height: number,
    public fill?: string,
  ) {
    super(id);
  }

  public getKind(): string {
    return 'rect';
  }

  public getDisplayName(): string {
    return `rect#${this.id}`;
  }

  public move(dx: number, dy: number): void {
    this.x += dx;
    this.y += dy;
  }

  public scale(factor: number): void {
    this.x *= factor;
    this.y *= factor;
    this.width *= factor;
    this.height *= factor;
  }

  public captureGeometry(): () => void {
    const { x, y, width, height } = this;
    return () => {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
    };
  }

  public renderTree(depth: number): string[] {
    const indent = '  '.repeat(depth);
    const fillPart = this.fill ? ` fill=${this.fill}` : '';
    return [`${indent}${this.getDisplayName()} x=${this.x} y=${this.y} w=${this.width} h=${this.height}${fillPart}`];
  }
}
