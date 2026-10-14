import { AbstractCommand } from './AbstractCommand';
import { CommandContext } from './CommandContext';
import { Shape } from '../model/Shape';

export class DeleteCommand extends AbstractCommand {
  public readonly name = 'delete';
  public readonly description = 'delete a shape';

  public execute(context: CommandContext, args: string[]): void {
    if (args.length === 0) {
      context.output.error('delete requires an id');
      return;
    }

    const target = context.document.findById(args[0]);
    if (!target) {
      context.output.error(`no such shape: ${args[0]}`);
      return;
    }

    const parent = target.getParent();
    if (!parent) {
      context.output.error(`no such shape: ${args[0]}`);
      return;
    }

    const index = parent.indexOf(target);
    parent.removeChild(target);
    context.recordAction({
      undo: () => {
        parent.insertChild(index, target);
      },
      redo: () => {
        parent.removeChild(target);
      },
    });
    context.output.writeLine(`${target.getDisplayName()} deleted`);
  }
}
