export interface SvgElement {
  readonly tag: string;
  readonly id?: string;
  readonly attributes: Readonly<Record<string, string>>;
  textContent: string;
  readonly start: number;
  end: number;
  readonly openingEnd: number;
  readonly children: SvgElement[];
}

/** Parse just the XML structure needed for Outline, rejecting incomplete edits. */
export class SvgOutlineParser {
  public parse(source: string): SvgElement[] {
    const roots: SvgElement[] = [];
    const stack: SvgElement[] = [];
    let cursor = 0;

    while (cursor < source.length) {
      const open = source.indexOf('<', cursor);
      if (open < 0) {
        break;
      }
      this.appendText(stack, this.decodeText(source.slice(cursor, open)));

      if (source.startsWith('<!--', open)) {
        const end = source.indexOf('-->', open + 4);
        if (end < 0) return [];
        cursor = end + 3;
        continue;
      }
      if (source.startsWith('<![CDATA[', open)) {
        const end = source.indexOf(']]>', open + 9);
        if (end < 0) return [];
        this.appendText(stack, source.slice(open + 9, end));
        cursor = end + 3;
        continue;
      }
      if (source.startsWith('<?', open)) {
        const end = source.indexOf('?>', open + 2);
        if (end < 0) return [];
        cursor = end + 2;
        continue;
      }

      const end = this.findTagEnd(source, open);
      if (end < 0) return [];
      const raw = source.slice(open + 1, end);
      cursor = end + 1;
      if (raw.startsWith('!')) continue;

      if (raw.startsWith('/')) {
        const closing = raw.slice(1).trim();
        const node = stack.pop();
        if (!node || closing !== node.tag) return [];
        node.end = cursor;
        continue;
      }

      const match = raw.match(/^([A-Za-z_][A-Za-z0-9_.:-]*)\b/);
      if (!match) return [];
      const selfClosing = /\/\s*$/.test(raw);
      const attributeSource = raw.slice(match[0].length, selfClosing ? raw.lastIndexOf('/') : undefined);
      const attributes: Record<string, string> = Object.create(null);
      for (const attribute of attributeSource.matchAll(/([A-Za-z_][\w:.-]*)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)) {
        attributes[attribute[1]] = this.decodeText(attribute[2] ?? attribute[3]);
      }
      const node: SvgElement = {
        tag: match[1], id: attributes.id, attributes, textContent: '', start: open,
        end: cursor, openingEnd: cursor, children: [],
      };
      const parent = stack[stack.length - 1];
      (parent ? parent.children : roots).push(node);
      if (!selfClosing) stack.push(node);
    }

    if (stack.length !== 0 || roots.length !== 1 || roots[0].tag !== 'svg') return [];
    return roots;
  }

  private appendText(stack: SvgElement[], text: string): void {
    const owner = [...stack].reverse().find(node => node.tag === 'text');
    if (owner) owner.textContent += text;
  }

  private decodeText(text: string): string {
    const named: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };
    return text.replace(/&(amp|lt|gt|quot|apos|#\d+|#x[\da-fA-F]+);/g, (entity, name: string) => {
      if (name in named) return named[name];
      const point = name.startsWith('#x') ? parseInt(name.slice(2), 16) : Number(name.slice(1));
      return point > 0 && point <= 0x10ffff && !(point >= 0xd800 && point <= 0xdfff)
        ? String.fromCodePoint(point) : entity;
    });
  }

  private findTagEnd(source: string, start: number): number {
    let quote: string | undefined;
    for (let index = start + 1; index < source.length; index += 1) {
      const char = source[index];
      if (quote) {
        if (char === quote) quote = undefined;
      } else if (char === '"' || char === "'") {
        quote = char;
      } else if (char === '>') {
        return index;
      }
    }
    return -1;
  }
}
