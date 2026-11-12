import { Shape } from '../Shape';

export class EllipseShape extends Shape {
  public constructor(
    id: string,
    private _cx: number,
    private _cy: number,
    private _rx: number,
    private _ry: number,
    private _fill?: string,
  ) {
    super(id);
  }

  public get cx(): number { return this._cx; }
  public get cy(): number { return this._cy; }
  public get rx(): number { return this._rx; }
  public get ry(): number { return this._ry; }
  public get fill(): string | undefined { return this._fill; }

  public getKind(): string {
    return 'ellipse';
  }

  public serializeSvg(depth: number): string {
    const fill = this.fill ? ` fill="${this.fill}"` : '';
    return `${'  '.repeat(depth)}<ellipse id="${this.id}" cx="${this.cx}" cy="${this.cy}" rx="${this.rx}" ry="${this.ry}"${fill}/>`;
  }

  public supportsAttribute(attribute: string): boolean {
    return ['cx', 'cy', 'rx', 'ry', 'fill'].includes(attribute);
  }

  public readAttribute(attribute: string): number | string | undefined {
    switch (attribute) {
      case 'cx': return this.cx;
      case 'cy': return this.cy;
      case 'rx': return this.rx;
      case 'ry': return this.ry;
      case 'fill': return this.fill;
      default: return undefined;
    }
  }

  public writeAttribute(attribute: string, value: number | string | undefined): void {
    switch (attribute) {
      case 'cx': this._cx = Number(value); break;
      case 'cy': this._cy = Number(value); break;
      case 'rx': this._rx = Number(value); break;
      case 'ry': this._ry = Number(value); break;
      case 'fill': this._fill = value as string | undefined; break;
      default: super.writeAttribute(attribute, value);
    }
  }

  public getDisplayName(): string {
    return `ellipse#${this.id}`;
  }

  public move(dx: number, dy: number): void {
    this._cx += dx;
    this._cy += dy;
  }

  public scale(factor: number): void {
    this._cx *= factor;
    this._cy *= factor;
    this._rx *= factor;
    this._ry *= factor;
  }

  public captureGeometry(): () => void {
    const { cx, cy, rx, ry } = this;
    return () => {
      this._cx = cx;
      this._cy = cy;
      this._rx = rx;
      this._ry = ry;
    };
  }

  public renderTree(depth: number): string[] {
    const indent = '  '.repeat(depth);
    const fillPart = this.fill ? ` fill=${this.fill}` : '';
    return [`${indent}${this.getDisplayName()} cx=${this.cx} cy=${this.cy} rx=${this.rx} ry=${this.ry}${fillPart}`];
  }
}
