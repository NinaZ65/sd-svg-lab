import { Shape } from '../Shape';

export class CircleShape extends Shape {
  public constructor(
    id: string,
    private _cx: number,
    private _cy: number,
    private _r: number,
    private _fill?: string,
  ) {
    super(id);
  }

  public get cx(): number { return this._cx; }
  public get cy(): number { return this._cy; }
  public get r(): number { return this._r; }
  public get fill(): string | undefined { return this._fill; }

  public getKind(): string {
    return 'circle';
  }

  public serializeSvg(depth: number): string {
    const fill = this.fill ? ` fill="${this.fill}"` : '';
    return `${'  '.repeat(depth)}<circle id="${this.id}" cx="${this.cx}" cy="${this.cy}" r="${this.r}"${fill}/>`;
  }

  public supportsAttribute(attribute: string): boolean {
    return ['cx', 'cy', 'r', 'fill'].includes(attribute);
  }

  public readAttribute(attribute: string): number | string | undefined {
    switch (attribute) {
      case 'cx': return this.cx;
      case 'cy': return this.cy;
      case 'r': return this.r;
      case 'fill': return this.fill;
      default: return undefined;
    }
  }

  public writeAttribute(attribute: string, value: number | string | undefined): void {
    switch (attribute) {
      case 'cx': this._cx = Number(value); break;
      case 'cy': this._cy = Number(value); break;
      case 'r': this._r = Number(value); break;
      case 'fill': this._fill = value as string | undefined; break;
      default: super.writeAttribute(attribute, value);
    }
  }

  public getDisplayName(): string {
    return `circle#${this.id}`;
  }

  public move(dx: number, dy: number): void {
    this._cx += dx;
    this._cy += dy;
  }

  public scale(factor: number): void {
    this._cx *= factor;
    this._cy *= factor;
    this._r *= factor;
  }

  public captureGeometry(): () => void {
    const { cx, cy, r } = this;
    return () => {
      this._cx = cx;
      this._cy = cy;
      this._r = r;
    };
  }

  public renderTree(depth: number): string[] {
    const indent = '  '.repeat(depth);
    const fillPart = this.fill ? ` fill=${this.fill}` : '';
    return [`${indent}${this.getDisplayName()} cx=${this.cx} cy=${this.cy} r=${this.r}${fillPart}`];
  }
}
