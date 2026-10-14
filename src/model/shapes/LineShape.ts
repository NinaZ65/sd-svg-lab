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

  public renderTree(depth: number): string[] {
    const indent = '  '.repeat(depth);
    const strokePart = this.stroke ? ` stroke=${this.stroke}` : '';
    return [`${indent}${this.getDisplayName()} (x1=${this.x1},y1=${this.y1}) -> (x2=${this.x2},y2=${this.y2})${strokePart}`];
  }
}
