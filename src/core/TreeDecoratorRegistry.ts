import { Document } from '../model/Document';
import { Shape } from '../model/Shape';
import { TreeDecorator } from './TreeDecorator';

export class TreeDecoratorRegistry {
  private readonly decorators = new Map<string, TreeDecorator>();

  public register(decorator: TreeDecorator): void {
    if (this.decorators.has(decorator.name)) throw new Error(`duplicate registration: decorators/${decorator.name}`);
    this.decorators.set(decorator.name, decorator);
  }

  public has(name: string): boolean { return this.decorators.has(name); }

  public onBaseline(document: Document): void {
    for (const decorator of this.decorators.values()) decorator.onBaseline?.(document);
  }

  public decorate(lines: readonly string[], shapes: readonly (Shape | null)[], document: Document): string[] {
    if (lines.length !== shapes.length) throw new Error('tree decoration line mismatch');
    const ordered = [...this.decorators.values()].sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
    return lines.map((line, index) => line + ordered.map(decorator => {
      try {
        const label = decorator.label(shapes[index], document);
        if (typeof label !== 'string') throw new Error('non-string label');
        return label;
      } catch (error) {
        throw new Error(`tree decorator failed: ${decorator.name} (${error instanceof Error ? error.message : String(error)})`);
      }
    }).join(''));
  }
}
