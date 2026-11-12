import { GroupShape } from './shapes/GroupShape';

export abstract class Shape {
  private parent: GroupShape | null = null;

  protected constructor(public readonly id: string) {}

  public abstract getKind(): string;

  public abstract getDisplayName(): string;

  public getTreeDisplayName(): string { return this.getDisplayName(); }

  public abstract renderTree(depth: number): string[];

  public abstract serializeSvg(depth: number): string;

  public abstract move(dx: number, dy: number): void;

  public abstract scale(factor: number): void;

  // Capture only local geometry; restoring exact values avoids inverse-transform rounding drift.
  public abstract captureGeometry(): () => void;

  public supportsAttribute(_attribute: string): boolean { return false; }

  public readAttribute(_attribute: string): number | string | undefined { return undefined; }

  public writeAttribute(attribute: string, _value: number | string | undefined): void {
    throw new Error(`unknown attribute: ${attribute}`);
  }

  public findById(id: string): Shape | undefined {
    if (this.id === id) {
      return this;
    }
    return undefined;
  }

  public setParent(parent: GroupShape | null): void {
    this.parent = parent;
  }

  public getParent(): GroupShape | null {
    return this.parent;
  }
}
