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

  public renderTree(depth: number): string[] {
    const indent = '  '.repeat(depth);
    const fillPart = this.fill ? ` fill=${this.fill}` : '';
    return [`${indent}${this.getDisplayName()} cx=${this.cx} cy=${this.cy} r=${this.r}${fillPart}`];
  }
}
