import { Shape } from '../Shape';

export class LineShape extends Shape {
  public constructor(
    id: string,
    public x1: number,
    public y1: number,
    public x2: number,
    public y2: number,
    public stroke?: string,
  ) {
    super(id);
  }

  public getKind(): string {
    return 'line';
  }

  public getDisplayName(): string {
    return `line#${this.id}`;
  }

  public move(dx: number, dy: number): void {
    this.x1 += dx;
    this.y1 += dy;
    this.x2 += dx;
    this.y2 += dy;
  }

  public scale(factor: number): void {
    this.x1 *= factor;
    this.y1 *= factor;
    this.x2 *= factor;
    this.y2 *= factor;
  }

  public captureGeometry(): () => void {
    const { x1, y1, x2, y2 } = this;
    return () => {
      this.x1 = x1;
      this.y1 = y1;
      this.x2 = x2;
      this.y2 = y2;
    };
  }

  public renderTree(depth: number): string[] {
    const indent = '  '.repeat(depth);
    const strokePart = this.stroke ? ` stroke=${this.stroke}` : '';
    return [`${indent}${this.getDisplayName()} (x1=${this.x1},y1=${this.y1}) -> (x2=${this.x2},y2=${this.y2})${strokePart}`];
  }
}
