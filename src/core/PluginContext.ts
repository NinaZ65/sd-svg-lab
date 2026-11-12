import { Command } from '../commands/Command';
import { AttributeHandler } from './AttributeHandler';
import { ShapeProvider } from './ShapeProvider';
import { TreeDecorator } from './TreeDecorator';
import { Shape } from '../model/Shape';

export interface PluginContext {
  createShape(kind: string, id: string, args: readonly (string | undefined)[]): Shape;
  registerShape(provider: ShapeProvider): void;
  registerCommand(command: Command): void;
  registerDecorator(decorator: TreeDecorator): void;
  registerAttribute(handler: AttributeHandler): void;
}

export interface Plugin {
  activate(context: PluginContext, options?: unknown): void;
}
