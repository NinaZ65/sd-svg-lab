import { Shape } from '../Shape';

export class CircleShape extends Shape {
  public constructor(
    id: string,
    public cx: number,
    public cy: number,
    public r: number,
    public fill?: string,
  ) {
    super(id);
  }

  public getKind(): string {
    return 'circle';
  }

  public getDisplayName(): string {
    return `circle#${this.id}`;
  }

  public move(dx: number, dy: number): void {
    this.cx += dx;
    this.cy += dy;
  }

  public scale(factor: number): void {
    this.cx *= factor;
    this.cy *= factor;
    this.r *= factor;
  }

  public captureGeometry(): () => void {
    const { cx, cy, r } = this;
    return () => {
      this.cx = cx;
      this.cy = cy;
      this.r = r;
    };
  }

  public renderTree(depth: number): string[] {
    const indent = '  '.repeat(depth);
    const fillPart = this.fill ? ` fill=${this.fill}` : '';
    return [`${indent}${this.getDisplayName()} cx=${this.cx} cy=${this.cy} r=${this.r}${fillPart}`];
  }
}
