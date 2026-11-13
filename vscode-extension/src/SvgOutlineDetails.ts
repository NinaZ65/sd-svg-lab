import { SvgElement } from './SvgOutlineParser';

/** Source-level hints only: do not infer CSS, transforms or rendered dimensions. */
export function outlineDetail(node: SvgElement): string {
  const attrs = node.attributes;
  switch (node.tag) {
    case 'svg':
    case 'rect':
    case 'image':
      return attrs.width && attrs.height ? `${attrs.width} × ${attrs.height}` : '';
    case 'circle':
      return attrs.r ? `r=${attrs.r}` : '';
    case 'ellipse':
      return attrs.rx && attrs.ry ? `rx=${attrs.rx} · ry=${attrs.ry}` : '';
    case 'text': {
      const text = Array.from(node.textContent.replace(/\s+/g, ' ').trim());
      if (!text.length) return '';
      return `“${text.slice(0, 32).join('')}${text.length > 32 ? '…' : ''}”`;
    }
    default:
      return '';
  }
}
