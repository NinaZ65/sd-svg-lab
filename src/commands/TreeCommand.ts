import { AbstractCommand } from './AbstractCommand';
import { CommandContext } from './CommandContext';
import { Shape } from '../model/Shape';
import { GroupShape } from '../model/shapes/GroupShape';

export class TreeCommand extends AbstractCommand {
  public readonly name = 'tree';
  public readonly description = 'display the current document tree';

  public execute(context: CommandContext, args: string[]): void {
    const canvas = context.document.getCanvas();
    const root = context.document.getRoot();

    if (args.length === 0) {
      const lines = [`svg (${canvas.toString()})`, ...root.renderTree(0)];
      const shapes: (Shape | null)[] = [null, ...this.flatten(root)];
      try { context.output.writeLine(context.decorators.decorate(lines, shapes, context.document).join('\n')); }
      catch (error) { context.output.error(error instanceof Error ? error.message : 'tree decoration failed'); }
      return;
    }

    const target = context.document.findById(args[0]);
    if (!target) {
      context.output.error(`no such shape: ${args[0]}`);
      return;
    }

    const lines = [`${target.getTreeDisplayName()}`, ...target.renderTree(1)];
    const shapes = [target, ...this.flatten(target)];
    try { context.output.writeLine(context.decorators.decorate(lines, shapes, context.document).join('\n')); }
    catch (error) { context.output.error(error instanceof Error ? error.message : 'tree decoration failed'); }
  }

  private flatten(shape: Shape): Shape[] {
    return shape instanceof GroupShape
      ? [shape, ...shape.getChildren().flatMap(child => this.flatten(child))]
      : [shape];
  }
}
