export interface SvgElement {
  readonly tag: string;
  readonly id?: string;
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

      if (source.startsWith('<!--', open)) {
        const end = source.indexOf('-->', open + 4);
        if (end < 0) return [];
        cursor = end + 3;
        continue;
      }
      if (source.startsWith('<![CDATA[', open)) {
        const end = source.indexOf(']]>', open + 9);
        if (end < 0) return [];
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
      const attributes = raw.slice(match[0].length, selfClosing ? raw.lastIndexOf('/') : undefined);
      const id = attributes.match(/(?:^|\s)id\s*=\s*(?:"([^"]*)"|'([^']*)')/);
      const node: SvgElement = {
        tag: match[1], id: id?.[1] ?? id?.[2], start: open,
        end: cursor, openingEnd: cursor, children: [],
      };
      const parent = stack[stack.length - 1];
      (parent ? parent.children : roots).push(node);
      if (!selfClosing) stack.push(node);
    }

    if (stack.length !== 0 || roots.length !== 1 || roots[0].tag !== 'svg') return [];
    return roots;
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
