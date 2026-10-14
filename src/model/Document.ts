import { Shape } from './Shape';
import { SvgCanvas } from './SvgCanvas';
import { CircleShape } from './shapes/CircleShape';
import { EllipseShape } from './shapes/EllipseShape';
import { GroupShape } from './shapes/GroupShape';
import { LineShape } from './shapes/LineShape';
import { RectShape } from './shapes/RectShape';
import { TextShape } from './shapes/TextShape';

export class Document {
  private canvas: SvgCanvas;
  private readonly root: GroupShape;
  private lastPath: string | null;

  public constructor(width = 800, height = 600) {
    this.canvas = new SvgCanvas(width, height);
    this.root = new GroupShape('root');
    this.lastPath = null;
  }

  public getCanvas(): SvgCanvas {
    return this.canvas;
  }

  public getRoot(): GroupShape {
    return this.root;
  }

  public initialize(width: number, height: number): void {
    this.canvas.resize(width, height);
  }

  public hasShape(id: string): boolean {
    return this.findById(id) !== undefined;
  }

  public findById(id: string): Shape | undefined {
    return this.root.findById(id);
  }

  public findShape(id: string): Shape | undefined {
    return this.findById(id);
  }

  public assertUniqueId(id: string): void {
    if (this.hasShape(id)) {
      throw new Error(`id already exists: ${id}`);
    }
  }

  public setLastPath(path: string | null): void {
    this.lastPath = path;
  }

  public getLastPath(): string | null {
    return this.lastPath;
  }

  public serializeSvg(): string {
    const parts: string[] = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      `<svg xmlns="http://www.w3.org/2000/svg" width="${this.canvas.getWidth()}" height="${this.canvas.getHeight()}" viewBox="0 0 ${this.canvas.getWidth()} ${this.canvas.getHeight()}">`,
    ];

    for (const child of this.root.getChildren()) {
      parts.push(this.serializeShape(child, 1));
    }

    parts.push('</svg>');
    return parts.join('\n');
  }

  public deserializeSvg(content: string, onWarning?: (message: string) => void): void {
    const svgMatch = content.match(/<svg\b[^>]*>/i);
    if (!svgMatch) {
      throw new Error('invalid svg');
    }

    const closeTag = /<\/\s*svg\s*>/i;
    const closeMatch = content.match(closeTag);
    if (!closeMatch) {
      throw new Error('invalid svg');
    }

    const svgAttrs = this.parseAttributes(svgMatch[0]);
    const width = Number(svgAttrs.width ?? this.canvas.getWidth());
    const height = Number(svgAttrs.height ?? this.canvas.getHeight());
    this.canvas = new SvgCanvas(width, height);
    this.root.clearChildren();

    const seenIds = new Set<string>();
    const svgStart = svgMatch.index ?? 0;
    const svgEnd = closeMatch.index ?? 0;
    const innerMarkup = content.slice(svgStart + svgMatch[0].length, svgEnd);
    for (const child of this.parseChildren(innerMarkup, seenIds, onWarning)) {
      this.root.addChild(child);
    }
  }

  private serializeShape(shape: Shape, indentLevel: number): string {
    const indent = '  '.repeat(indentLevel);
    if (shape instanceof GroupShape) {
      const lines = [`${indent}<g id="${shape.id}">`];
      for (const child of shape.getChildren()) {
        lines.push(this.serializeShape(child, indentLevel + 1));
      }
      lines.push(`${indent}</g>`);
      return lines.join('\n');
    }

    if (shape.getKind() === 'rect') {
      const rect = shape as unknown as { id: string; x: number; y: number; width: number; height: number; fill?: string };
      const fill = rect.fill ? ` fill="${rect.fill}"` : '';
      return `${indent}<rect id="${shape.id}" x="${rect.x}" y="${rect.y}" width="${rect.width}" height="${rect.height}"${fill}/>`;
    }

    if (shape.getKind() === 'circle') {
      const circle = shape as unknown as { id: string; cx: number; cy: number; r: number; fill?: string };
      const fill = circle.fill ? ` fill="${circle.fill}"` : '';
      return `${indent}<circle id="${shape.id}" cx="${circle.cx}" cy="${circle.cy}" r="${circle.r}"${fill}/>`;
    }

    if (shape.getKind() === 'ellipse') {
      const ellipse = shape as unknown as { id: string; cx: number; cy: number; rx: number; ry: number; fill?: string };
      const fill = ellipse.fill ? ` fill="${ellipse.fill}"` : '';
      return `${indent}<ellipse id="${ellipse.id}" cx="${ellipse.cx}" cy="${ellipse.cy}" rx="${ellipse.rx}" ry="${ellipse.ry}"${fill}/>`;
    }

    if (shape.getKind() === 'line') {
      const line = shape as unknown as { id: string; x1: number; y1: number; x2: number; y2: number; stroke?: string };
      const stroke = line.stroke ? ` stroke="${line.stroke}"` : '';
      return `${indent}<line id="${shape.id}" x1="${line.x1}" y1="${line.y1}" x2="${line.x2}" y2="${line.y2}"${stroke}/>`;
    }

    if (shape.getKind() === 'text') {
      const text = shape as unknown as { id: string; x: number; y: number; text: string };
      return `${indent}<text id="${shape.id}" x="${text.x}" y="${text.y}">${text.text}</text>`;
    }

    return `${indent}<g id="${shape.id}"/>`;
  }

  private parseChildren(markup: string, seenIds: Set<string>, onWarning?: (message: string) => void): Shape[] {
    const children: Shape[] = [];
    let cursor = 0;

    while (cursor < markup.length) {
      while (cursor < markup.length && /\s/.test(markup[cursor])) {
        cursor += 1;
      }

      if (cursor >= markup.length) {
        break;
      }

      const nextTag = markup.slice(cursor).match(/^<\s*(\/)?\s*([A-Za-z0-9]+)\b([^>]*)>/);
      if (!nextTag) {
        break;
      }

      const isClosing = Boolean(nextTag[1]);
      const tagName = nextTag[2].toLowerCase();
      const fullTag = nextTag[0];

      if (isClosing) {
        break;
      }

      const attrs = this.parseAttributes(fullTag);
      const selfClosing = /\/\s*>$/.test(fullTag);
      const tagStart = cursor + nextTag[0].length;

      if (selfClosing) {
        const shape = this.createShape(tagName, attrs, seenIds, onWarning);
        if (shape) {
          children.push(shape);
        }
        cursor = tagStart;
        continue;
      }

      const closeIndex = this.findClosingTag(markup, tagStart, tagName);
      if (closeIndex < 0) {
        break;
      }

      const innerMarkup = markup.slice(tagStart, closeIndex);
      const group = this.createShape(tagName, attrs, seenIds, onWarning, innerMarkup);

      if (group instanceof GroupShape) {
        for (const child of this.parseChildren(innerMarkup, seenIds, onWarning)) {
          group.addChild(child);
        }
        children.push(group);
      } else if (group) {
        children.push(group);
      }

      cursor = closeIndex + `</${tagName}>`.length;
    }

    return children;
  }

  private findClosingTag(markup: string, startIndex: number, tagName: string): number {
    const tagRegex = /<\s*(\/)?\s*([A-Za-z0-9]+)\b([^>]*)>/g;
    tagRegex.lastIndex = startIndex;
    let depth = 1;

    let match: RegExpExecArray | null;
    while ((match = tagRegex.exec(markup)) !== null) {
      const isClosing = Boolean(match[1]);
      const currentName = match[2].toLowerCase();

      if (currentName !== tagName) {
        continue;
      }

      if (isClosing) {
        depth -= 1;
        if (depth === 0) {
          return match.index;
        }
      } else {
        depth += 1;
      }
    }

    return -1;
  }

  private parseAttributes(rawTag: string): Record<string, string> {
    const attributes: Record<string, string> = {};
    const regex = /([A-Za-z:_-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/g;

    let match: RegExpExecArray | null;
    while ((match = regex.exec(rawTag)) !== null) {
      const key = match[1];
      const value = match[2] ?? match[3] ?? match[4] ?? '';
      attributes[key] = value;
    }

    return attributes;
  }

  private createShape(
    tagName: string,
    attributes: Record<string, string>,
    seenIds: Set<string>,
    onWarning?: (message: string) => void,
    textContent = '',
  ): Shape | undefined {
    let id = attributes.id ?? undefined;
    if (!id) {
      let candidate = `${tagName}1`;
      let index = 1;
      while (seenIds.has(candidate)) {
        index += 1;
        candidate = `${tagName}${index}`;
      }
      id = candidate;
      seenIds.add(id);
      onWarning?.(`assigned id ${id} to unnamed <${tagName}>`);
    } else {
      seenIds.add(id);
    }

    if (tagName === 'g') {
      return new GroupShape(id);
    }

    if (tagName === 'rect') {
      return new RectShape(
        id,
        Number(attributes.x ?? 0),
        Number(attributes.y ?? 0),
        Number(attributes.width ?? 0),
        Number(attributes.height ?? 0),
        attributes.fill ?? undefined,
      );
    }

    if (tagName === 'circle') {
      return new CircleShape(
        id,
        Number(attributes.cx ?? 0),
        Number(attributes.cy ?? 0),
        Number(attributes.r ?? 0),
        attributes.fill ?? undefined,
      );
    }

    if (tagName === 'ellipse') {
      return new EllipseShape(
        id,
        Number(attributes.cx ?? 0),
        Number(attributes.cy ?? 0),
        Number(attributes.rx ?? 0),
        Number(attributes.ry ?? 0),
        attributes.fill ?? undefined,
      );
    }

    if (tagName === 'line') {
      return new LineShape(
        id,
        Number(attributes.x1 ?? 0),
        Number(attributes.y1 ?? 0),
        Number(attributes.x2 ?? 0),
        Number(attributes.y2 ?? 0),
        attributes.stroke ?? undefined,
      );
    }

    if (tagName === 'text') {
      const x = Number(attributes.x ?? 0);
      const y = Number(attributes.y ?? 0);
      return new TextShape(id, x, y, textContent.trim());
    }

    return undefined;
  }
}
