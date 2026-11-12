import { Shape } from '../Shape';

export class GroupShape extends Shape {
  private readonly children: Shape[];

  public constructor(id: string, private readonly dataKind?: string) {
    super(id);
    this.children = [];
  }

  public addChild(shape: Shape): void {
    shape.setParent(this);
    this.children.push(shape);
  }

  public insertChild(index: number, shape: Shape): void {
    shape.setParent(this);
    this.children.splice(index, 0, shape);
  }

  public removeChild(shape: Shape): boolean {
    const index = this.children.indexOf(shape);
    if (index < 0) {
      return false;
    }

    shape.setParent(null);
    this.children.splice(index, 1);
    return true;
  }

  public getChildren(): readonly Shape[] {
    return this.children;
  }

  public indexOf(shape: Shape): number {
    return this.children.indexOf(shape);
  }

  public removeChildAt(index: number): Shape | undefined {
    const child = this.children[index];
    if (!child) {
      return undefined;
    }

    child.setParent(null);
    this.children.splice(index, 1);
    return child;
  }

  public clearChildren(): void {
    for (const child of this.children) {
      child.setParent(null);
    }
    this.children.length = 0;
  }

  public getKind(): string {
    return 'g';
  }

  public canRemoveChild(_shape: Shape): boolean { return true; }

  public serializeSvg(depth: number): string {
    const indent = '  '.repeat(depth);
    const kind = this.dataKind ? ` data-kind="${this.dataKind}"` : '';
    const lines = [`${indent}<g id="${this.id}"${kind}>`];
    for (const child of this.children) lines.push(child.serializeSvg(depth + 1));
    lines.push(`${indent}</g>`);
    return lines.join('\n');
  }

  public move(dx: number, dy: number): void {
    for (const child of this.children) {
      child.move(dx, dy);
    }
  }

  public scale(factor: number): void {
    for (const child of this.children) {
      child.scale(factor);
    }
  }

  public captureGeometry(): () => void {
    const restorations = this.children.map(child => child.captureGeometry());
    return () => {
      for (const restore of restorations) {
        restore();
      }
    };
  }

  public getDisplayName(): string {
    return `g#${this.id}`;
  }

  public findById(id: string): Shape | undefined {
    if (this.id === id) {
      return this;
    }

    for (const child of this.children) {
      const found = child.findById(id);
      if (found) {
        return found;
      }
    }

    return undefined;
  }

  public renderTree(depth: number): string[] {
    const indent = '  '.repeat(depth);
    const lines = [`${indent}${this.getTreeDisplayName()}`];

    for (const child of this.children) {
      if (child instanceof GroupShape) {
        lines.push(...child.renderTree(depth + 1));
      } else {
        lines.push(...child.renderTree(depth + 1));
      }
    }

    return lines;
  }
}
