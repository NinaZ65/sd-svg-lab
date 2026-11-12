import { registerBuiltinCommands } from '../builtin/registerBuiltinCommands';
import { registerBuiltinShapes } from '../builtin/registerBuiltinShapes';
import { CommandRegistry } from '../cli/CommandRegistry';
import { AttributeRegistry } from '../core/AttributeRegistry';
import { ShapeRegistry } from '../core/ShapeRegistry';
import { TreeDecoratorRegistry } from '../core/TreeDecoratorRegistry';
import { PluginActivator } from './PluginActivator';

export class Assembly {
  public readonly shapes = new ShapeRegistry();
  public readonly commands = new CommandRegistry();
  public readonly decorators = new TreeDecoratorRegistry();
  public readonly attributes = new AttributeRegistry();
  public readonly activator = new PluginActivator(this.shapes, this.commands, this.decorators, this.attributes);

  public constructor() {
    registerBuiltinShapes(this.shapes);
    registerBuiltinCommands(this.commands);
  }
}
