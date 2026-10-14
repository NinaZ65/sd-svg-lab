import { Shape } from '../Shape';

export class GroupShape extends Shape {
  private readonly children: Shape[];

  public constructor(id: string) {
    super(id);
    this.children = [];
  }

  public addChild(shape: Shape): void {
    this.children.push(shape);
  }

  public getChildren(): readonly Shape[] {
    return this.children;
  }

  public getKind(): string {
    return 'g';
  }

  public getDisplayName(): string {
    return `g#${this.id}`;
  }

  public renderTree(depth: number): string[] {
    const indent = '  '.repeat(depth);
    const lines = [`${indent}${this.getDisplayName()}`];

    for (const child of this.children) {
      lines.push(...child.renderTree(depth + 1));
    }

    return lines;
  }
}
