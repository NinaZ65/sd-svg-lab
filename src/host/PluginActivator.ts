import { CommandRegistry } from '../cli/CommandRegistry';
import { Command } from '../commands/Command';
import { AttributeHandler } from '../core/AttributeHandler';
import { AttributeRegistry } from '../core/AttributeRegistry';
import { Plugin, PluginContext } from '../core/PluginContext';
import { ShapeProvider } from '../core/ShapeProvider';
import { ShapeRegistry } from '../core/ShapeRegistry';
import { TreeDecorator } from '../core/TreeDecorator';
import { TreeDecoratorRegistry } from '../core/TreeDecoratorRegistry';

export type Category = 'shapes' | 'commands' | 'decorators' | 'attributes';
export type Contributions = Partial<Record<Category, readonly string[]>>;
export interface PluginManifest { readonly name: string; readonly contributes?: Contributions }

type Registrations = {
  shapes: ShapeProvider[];
  commands: Command[];
  decorators: TreeDecorator[];
  attributes: AttributeHandler[];
};

export class PluginActivator {
  public constructor(
    private readonly shapes: ShapeRegistry,
    private readonly commands: CommandRegistry,
    private readonly decorators: TreeDecoratorRegistry,
    private readonly attributes: AttributeRegistry,
  ) {}

  public activate(plugin: Plugin, manifest: PluginManifest, options?: unknown): void {
    const staged: Registrations = { shapes: [], commands: [], decorators: [], attributes: [] };
    const context: PluginContext = {
      createShape: (kind, id, args) => this.shapes.create(kind, id, args),
      registerShape: provider => staged.shapes.push(provider),
      registerCommand: command => staged.commands.push(command),
      registerDecorator: decorator => staged.decorators.push(decorator),
      registerAttribute: handler => staged.attributes.push(handler),
    };
    try {
      plugin.activate(context, options);
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      throw new Error(`plugin failed to activate: ${manifest.name} (${reason})`);
    }

    for (const category of ['shapes', 'commands', 'decorators', 'attributes'] as const) {
      const names = staged[category].map(item => item.name);
      const duplicate = names.find((name, index) => names.indexOf(name) !== index || this.has(category, name));
      if (duplicate) throw new Error(`duplicate registration: ${category}/${duplicate}`);
    }

    const actual = this.normalize(staged);
    const declared = this.normalize(manifest.contributes ?? {});
    if (JSON.stringify(actual) !== JSON.stringify(declared)) {
      throw new Error(`plugin manifest mismatch: ${manifest.name} (declared: ${this.describe(declared)}, registered: ${this.describe(actual)})`);
    }

    for (const item of staged.shapes) this.shapes.register(item);
    for (const item of staged.commands) this.commands.register(item);
    for (const item of staged.decorators) this.decorators.register(item);
    for (const item of staged.attributes) this.attributes.register(item);
  }

  private has(category: Category, name: string): boolean {
    switch (category) {
      case 'shapes': return this.shapes.get(name) !== undefined;
      case 'commands': return this.commands.has(name);
      case 'decorators': return this.decorators.has(name);
      case 'attributes': return this.attributes.has(name);
    }
  }

  private normalize(source: Contributions | Registrations): Record<Category, string[]> {
    const names = (category: Category): string[] => {
      const values = source[category] ?? [];
      return values.map(value => typeof value === 'string' ? value : value.name).sort();
    };
    return { shapes: names('shapes'), commands: names('commands'), decorators: names('decorators'), attributes: names('attributes') };
  }

  private describe(value: Record<Category, string[]>): string {
    return (['shapes', 'commands', 'decorators', 'attributes'] as const)
      .map(category => `${category}=[${value[category].join(',')}]`).join('; ');
  }
}
