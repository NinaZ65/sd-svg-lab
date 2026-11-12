import { Shape } from '../Shape';

export class LineShape extends Shape {
  public constructor(
    id: string,
    private _x1: number,
    private _y1: number,
    private _x2: number,
    private _y2: number,
    private _stroke?: string,
  ) {
    super(id);
  }

  public get x1(): number { return this._x1; }
  public get y1(): number { return this._y1; }
  public get x2(): number { return this._x2; }
  public get y2(): number { return this._y2; }
  public get stroke(): string | undefined { return this._stroke; }

  public getKind(): string {
    return 'line';
  }

  public serializeSvg(depth: number): string {
    const stroke = this.stroke ? ` stroke="${this.stroke}"` : '';
    return `${'  '.repeat(depth)}<line id="${this.id}" x1="${this.x1}" y1="${this.y1}" x2="${this.x2}" y2="${this.y2}"${stroke}/>`;
  }

  public supportsAttribute(attribute: string): boolean {
    return ['x1', 'y1', 'x2', 'y2', 'stroke'].includes(attribute);
  }

  public readAttribute(attribute: string): number | string | undefined {
    switch (attribute) {
      case 'x1': return this.x1;
      case 'y1': return this.y1;
      case 'x2': return this.x2;
      case 'y2': return this.y2;
      case 'stroke': return this.stroke;
      default: return undefined;
    }
  }

  public writeAttribute(attribute: string, value: number | string | undefined): void {
    switch (attribute) {
      case 'x1': this._x1 = Number(value); break;
      case 'y1': this._y1 = Number(value); break;
      case 'x2': this._x2 = Number(value); break;
      case 'y2': this._y2 = Number(value); break;
      case 'stroke': this._stroke = value as string | undefined; break;
      default: super.writeAttribute(attribute, value);
    }
  }

  public getDisplayName(): string {
    return `line#${this.id}`;
  }

  public move(dx: number, dy: number): void {
    this._x1 += dx;
    this._y1 += dy;
    this._x2 += dx;
    this._y2 += dy;
  }

  public scale(factor: number): void {
    this._x1 *= factor;
    this._y1 *= factor;
    this._x2 *= factor;
    this._y2 *= factor;
  }

  public captureGeometry(): () => void {
    const { x1, y1, x2, y2 } = this;
    return () => {
      this._x1 = x1;
      this._y1 = y1;
      this._x2 = x2;
      this._y2 = y2;
    };
  }

  public renderTree(depth: number): string[] {
    const indent = '  '.repeat(depth);
    const strokePart = this.stroke ? ` stroke=${this.stroke}` : '';
    return [`${indent}${this.getDisplayName()} (x1=${this.x1},y1=${this.y1}) -> (x2=${this.x2},y2=${this.y2})${strokePart}`];
  }
}
