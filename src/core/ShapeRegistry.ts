import { Shape } from '../model/Shape';
import { ShapeProvider } from './ShapeProvider';

export class ShapeRegistry {
  private readonly providers = new Map<string, ShapeProvider>();

  public register(provider: ShapeProvider): void {
    if (this.providers.has(provider.name)) throw new Error(`duplicate registration: shapes/${provider.name}`);
    this.providers.set(provider.name, provider);
  }

  public get(name: string): ShapeProvider | undefined {
    return this.providers.get(name);
  }

  public create(name: string, id: string, args: readonly (string | undefined)[]): Shape {
    const provider = this.get(name.toLowerCase());
    if (!provider) throw new Error(`unknown shape type: ${name}`);
    return provider.create(id, args);
  }

  public read(tag: string, id: string, attributes: Readonly<Record<string, string>>, text: string, children: readonly Shape[]): Shape | undefined {
    const provider = this.get(attributes['data-kind'] ?? tag) ?? this.get(tag);
    return provider?.read(id, attributes, text, children);
  }
}
