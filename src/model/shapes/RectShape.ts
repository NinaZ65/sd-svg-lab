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

  public renderTree(depth: number): string[] {
    const indent = '  '.repeat(depth);
    const fillPart = this.fill ? ` fill=${this.fill}` : '';
    return [`${indent}${this.getDisplayName()} x=${this.x} y=${this.y} w=${this.width} h=${this.height}${fillPart}`];
  }
}
