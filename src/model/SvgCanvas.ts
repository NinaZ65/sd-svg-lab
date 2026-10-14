export class SvgCanvas {
  private width: number;
  private height: number;

  public constructor(width = 800, height = 600) {
    this.width = width;
    this.height = height;
  }

  public getWidth(): number {
    return this.width;
  }

  public getHeight(): number {
    return this.height;
  }

  public resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
  }

  public toString(): string {
    return `${this.width}x${this.height}`;
  }
}
