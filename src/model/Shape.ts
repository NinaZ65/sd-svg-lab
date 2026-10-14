export abstract class Shape {
  protected constructor(public readonly id: string) {}

  public abstract getKind(): string;

  public abstract getDisplayName(): string;

  public abstract renderTree(depth: number): string[];
}
