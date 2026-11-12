import { Shape } from '../model/Shape';
import { AttributeHandler } from './AttributeHandler';

export class AttributeRegistry {
  private readonly handlers = new Map<string, AttributeHandler>();

  public register(handler: AttributeHandler): void {
    if (this.handlers.has(handler.name)) throw new Error(`duplicate registration: attributes/${handler.name}`);
    this.handlers.set(handler.name, handler);
  }

  public matching(shape: Shape, attribute: string): AttributeHandler[] {
    return [...this.handlers.values()].filter(handler => handler.handles(shape, attribute));
  }

  public has(name: string): boolean { return this.handlers.has(name); }
}
