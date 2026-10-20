import { Shape } from '../Shape';

export class EllipseShape extends Shape {
  public constructor(
    id: string,
    public cx: number,
    public cy: number,
    public rx: number,
    public ry: number,
    public fill?: string,
  ) {
    super(id);
  }

  public getKind(): string {
    return 'ellipse';
  }

  public getDisplayName(): string {
    return `ellipse#${this.id}`;
  }

  public move(dx: number, dy: number): void {
    this.cx += dx;
    this.cy += dy;
  }

  public scale(factor: number): void {
    this.cx *= factor;
    this.cy *= factor;
    this.rx *= factor;
    this.ry *= factor;
  }

  public captureGeometry(): () => void {
    const { cx, cy, rx, ry } = this;
    return () => {
      this.cx = cx;
      this.cy = cy;
      this.rx = rx;
      this.ry = ry;
    };
  }

  public renderTree(depth: number): string[] {
    const indent = '  '.repeat(depth);
    const fillPart = this.fill ? ` fill=${this.fill}` : '';
    return [`${indent}${this.getDisplayName()} cx=${this.cx} cy=${this.cy} rx=${this.rx} ry=${this.ry}${fillPart}`];
  }
}
