import { AbstractCommand } from './AbstractCommand';
import { CommandContext } from './CommandContext';
import { Shape } from '../model/Shape';

export class FrontCommand extends AbstractCommand {
  public readonly name = 'front';
  public readonly description = 'move a shape to the front';

  public execute(context: CommandContext, args: string[]): void {
    if (args.length === 0) {
      context.output.error('front requires an id');
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
      parent.addChild(target);
      context.recordAction({
        undo: () => {
          parent.removeChild(target);
          parent.insertChild(index, target);
        },
        redo: () => {
          parent.removeChild(target);
          parent.addChild(target);
        },
      });
    }
    context.output.writeLine(`${target.getDisplayName()} moved to front`);
  }
}
