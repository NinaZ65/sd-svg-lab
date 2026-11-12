import { Shape } from './Shape';
import { SvgCanvas } from './SvgCanvas';
import { GroupShape } from './shapes/GroupShape';
import { ShapeRegistry } from '../core/ShapeRegistry';

export class Document {
  private canvas: SvgCanvas;
  private root: GroupShape;
  private lastPath: string | null;

  public constructor(width = 800, height = 600, private readonly shapes = new ShapeRegistry()) {
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

  public newDocument(width: number, height: number): void {
    this.canvas = new SvgCanvas(width, height);
    this.root = new GroupShape('root');
    this.lastPath = null;
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

  public makeShape(kind: string, id: string, args: readonly (string | undefined)[]): Shape {
    const shape = this.shapes.create(kind, id, args);
    const newIds = new Set<string>();
    const visit = (node: Shape): void => {
      if (newIds.has(node.id) || this.hasShape(node.id)) throw new Error(`id already exists: ${node.id}`);
      newIds.add(node.id);
      if (node instanceof GroupShape) for (const child of node.getChildren()) visit(child);
    };
    visit(shape);
    return shape;
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
      parts.push(child.serializeSvg(1));
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
    const nextCanvas = new SvgCanvas(width, height);
    const nextRoot = new GroupShape('root');

    const seenIds = new Set<string>();
    const svgStart = svgMatch.index ?? 0;
    const svgEnd = closeMatch.index ?? 0;
    const innerMarkup = content.slice(svgStart + svgMatch[0].length, svgEnd);
    for (const child of this.parseChildren(innerMarkup, seenIds, onWarning)) {
      nextRoot.addChild(child);
    }
    this.canvas = nextCanvas;
    this.root = nextRoot;
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

      if (markup[cursor] !== '<') {
        const nextOpen = markup.indexOf('<', cursor);
        if (nextOpen < 0) break;
        cursor = nextOpen;
      }

      const nextTag = markup.slice(cursor).match(/^<\s*(\/)?\s*([A-Za-z0-9]+)\b([^>]*)>/);
      if (!nextTag) {
        throw new Error('invalid svg');
      }

      const isClosing = Boolean(nextTag[1]);
      const tagName = nextTag[2].toLowerCase();
      const fullTag = nextTag[0];

      if (isClosing) {
        throw new Error('invalid svg');
      }

      const attrs = this.parseAttributes(fullTag);
      const id = this.reserveId(tagName, attrs, seenIds, onWarning);
      const selfClosing = /\/\s*>$/.test(fullTag);
      const tagStart = cursor + nextTag[0].length;
      const closeIndex = selfClosing ? tagStart : this.findClosingTag(markup, tagStart, tagName);
      if (closeIndex < 0) throw new Error('invalid svg');
      const innerMarkup = selfClosing ? '' : markup.slice(tagStart, closeIndex);
      const nested = selfClosing ? [] : this.parseChildren(innerMarkup, seenIds, onWarning);
      const shape = this.shapes.read(tagName, id, attrs, innerMarkup, nested);
      if (shape) children.push(shape);
      cursor = selfClosing ? tagStart : closeIndex + `</${tagName}>`.length;
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
      } else if (!/\/\s*>$/.test(match[0])) {
        depth += 1;
      }
    }

    return -1;
  }

  private parseAttributes(rawTag: string): Record<string, string> {
    const attributes: Record<string, string> = {};
    const regex = /([A-Za-z:_-][A-Za-z0-9:_-]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/g;

    let match: RegExpExecArray | null;
    while ((match = regex.exec(rawTag)) !== null) {
      const key = match[1];
      const value = match[2] ?? match[3] ?? match[4] ?? '';
      attributes[key] = value;
    }

    return attributes;
  }

  private reserveId(
    tagName: string,
    attributes: Record<string, string>,
    seenIds: Set<string>,
    onWarning?: (message: string) => void,
  ): string {
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
      if (seenIds.has(id)) throw new Error(`id already exists: ${id}`);
      seenIds.add(id);
    }
    return id;
  }
}
