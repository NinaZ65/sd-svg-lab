import { AbstractCommand } from './AbstractCommand';
import { CommandContext } from './CommandContext';

export class TreeCommand extends AbstractCommand {
  public readonly name = 'tree';
  public readonly description = 'display the current document tree';

  public execute(context: CommandContext): void {
    const canvas = context.document.getCanvas();
    const root = context.document.getRoot();
    const lines = [`svg (${canvas.toString()})`, ...root.renderTree(0)];

    context.output.writeLine(lines.join('\n'));
  }
}
