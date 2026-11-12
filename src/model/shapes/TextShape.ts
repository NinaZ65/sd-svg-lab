import { Shape } from '../Shape';

export class TextShape extends Shape {
  public constructor(
    id: string,
    private _x: number,
    private _y: number,
    private _text: string,
  ) {
    super(id);
  }

  public get x(): number { return this._x; }
  public get y(): number { return this._y; }
  public get text(): string { return this._text; }

  public getKind(): string {
    return 'text';
  }

  public serializeSvg(depth: number): string {
    return `${'  '.repeat(depth)}<text id="${this.id}" x="${this.x}" y="${this.y}">${this.text}</text>`;
  }

  public supportsAttribute(attribute: string): boolean {
    return ['x', 'y', 'text'].includes(attribute);
  }

  public readAttribute(attribute: string): number | string | undefined {
    switch (attribute) {
      case 'x': return this.x;
      case 'y': return this.y;
      case 'text': return this.text;
      default: return undefined;
    }
  }

  public writeAttribute(attribute: string, value: number | string | undefined): void {
    switch (attribute) {
      case 'x': this._x = Number(value); break;
      case 'y': this._y = Number(value); break;
      case 'text': this._text = String(value); break;
      default: super.writeAttribute(attribute, value);
    }
  }

  public getDisplayName(): string {
    return `text#${this.id}`;
  }

  public move(dx: number, dy: number): void {
    this._x += dx;
    this._y += dy;
  }

  public scale(factor: number): void {
    this._x *= factor;
    this._y *= factor;
  }

  public captureGeometry(): () => void {
    const { x, y } = this;
    return () => {
      this._x = x;
      this._y = y;
    };
  }

  public renderTree(depth: number): string[] {
    const indent = '  '.repeat(depth);
    return [`${indent}${this.getDisplayName()} (${this.x},${this.y}) "${this.text}"`];
  }
}
