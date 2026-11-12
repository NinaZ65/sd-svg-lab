import { Shape } from '../Shape';

export class RectShape extends Shape {
  public constructor(
    id: string,
    private _x: number,
    private _y: number,
    private _width: number,
    private _height: number,
    private _fill?: string,
  ) {
    super(id);
  }

  public get x(): number { return this._x; }
  public get y(): number { return this._y; }
  public get width(): number { return this._width; }
  public get height(): number { return this._height; }
  public get fill(): string | undefined { return this._fill; }

  public getKind(): string {
    return 'rect';
  }

  public serializeSvg(depth: number): string {
    const fill = this.fill ? ` fill="${this.fill}"` : '';
    return `${'  '.repeat(depth)}<rect id="${this.id}" x="${this.x}" y="${this.y}" width="${this.width}" height="${this.height}"${fill}/>`;
  }

  public supportsAttribute(attribute: string): boolean {
    return ['x', 'y', 'width', 'height', 'fill'].includes(attribute);
  }

  public readAttribute(attribute: string): number | string | undefined {
    switch (attribute) {
      case 'x': return this.x;
      case 'y': return this.y;
      case 'width': return this.width;
      case 'height': return this.height;
      case 'fill': return this.fill;
      default: return undefined;
    }
  }

  public writeAttribute(attribute: string, value: number | string | undefined): void {
    switch (attribute) {
      case 'x': this._x = Number(value); break;
      case 'y': this._y = Number(value); break;
      case 'width': this._width = Number(value); break;
      case 'height': this._height = Number(value); break;
      case 'fill': this._fill = value as string | undefined; break;
      default: super.writeAttribute(attribute, value);
    }
  }

  public getDisplayName(): string {
    return `rect#${this.id}`;
  }

  public move(dx: number, dy: number): void {
    this._x += dx;
    this._y += dy;
  }

  public scale(factor: number): void {
    this._x *= factor;
    this._y *= factor;
    this._width *= factor;
    this._height *= factor;
  }

  public captureGeometry(): () => void {
    const { x, y, width, height } = this;
    return () => {
      this._x = x;
      this._y = y;
      this._width = width;
      this._height = height;
    };
  }

  public renderTree(depth: number): string[] {
    const indent = '  '.repeat(depth);
    const fillPart = this.fill ? ` fill=${this.fill}` : '';
    return [`${indent}${this.getDisplayName()} x=${this.x} y=${this.y} w=${this.width} h=${this.height}${fillPart}`];
  }
}
