import { Shape } from '../Shape';

export class TextShape extends Shape {
  public constructor(
    id: string,
    public x: number,
    public y: number,
    public text: string,
  ) {
    super(id);
  }

  public getKind(): string {
    return 'text';
  }

  public getDisplayName(): string {
    return `text#${this.id}`;
  }

  public renderTree(depth: number): string[] {
    const indent = '  '.repeat(depth);
    return [`${indent}${this.getDisplayName()} (${this.x},${this.y}) "${this.text}"`];
  }
}
