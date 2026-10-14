import { AbstractCommand } from './AbstractCommand';
import { CommandContext } from './CommandContext';

export class TreeCommand extends AbstractCommand {
  public readonly name = 'tree';
  public readonly description = 'display the current document tree';

  public execute(context: CommandContext, args: string[]): void {
    const canvas = context.document.getCanvas();
    const root = context.document.getRoot();

    if (args.length === 0) {
      const lines = [`svg (${canvas.toString()})`, ...root.renderTree(0)];
      context.output.writeLine(lines.join('\n'));
      return;
    }

    const target = context.document.findById(args[0]);
    if (!target) {
      context.output.error(`no such shape: ${args[0]}`);
      return;
    }

    const lines = [`${target.getDisplayName()}`, ...target.renderTree(1)];
    context.output.writeLine(lines.join('\n'));
  }
}
