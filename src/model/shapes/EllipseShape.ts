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

  public renderTree(depth: number): string[] {
    const indent = '  '.repeat(depth);
    const fillPart = this.fill ? ` fill=${this.fill}` : '';
    return [`${indent}${this.getDisplayName()} cx=${this.cx} cy=${this.cy} rx=${this.rx} ry=${this.ry}${fillPart}`];
  }
}
