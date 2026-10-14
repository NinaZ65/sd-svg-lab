import { GroupShape } from './shapes/GroupShape';

export abstract class Shape {
  public parent: GroupShape | null = null;

  protected constructor(public readonly id: string) {}

  public abstract getKind(): string;

  public abstract getDisplayName(): string;

  public abstract renderTree(depth: number): string[];

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
