import { AbstractCommand } from './AbstractCommand';
import { CommandContext } from './CommandContext';

export class BackCommand extends AbstractCommand {
  public readonly name = 'back';
  public readonly description = 'move a shape to the back';

  public execute(context: CommandContext, args: string[]): void {
    if (args.length === 0) {
      context.output.error('back requires an id');
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
    if (index >= 0) {
      parent.removeChildAt(index);
      parent.insertChild(0, target);
      context.recordAction({
        undo: () => {
          parent.removeChild(target);
          parent.insertChild(index, target);
        },
        redo: () => {
          parent.removeChild(target);
          parent.insertChild(0, target);
        },
      });
    }
    context.output.writeLine(`${target.getDisplayName()} moved to back`);
  }
}
