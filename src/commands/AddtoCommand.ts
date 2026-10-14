import { AbstractCommand } from './AbstractCommand';
import { CommandContext } from './CommandContext';
import { GroupShape } from '../model/shapes/GroupShape';

export class AddtoCommand extends AbstractCommand {
  public readonly name = 'addto';
  public readonly description = 'move an existing shape into a group';

  public execute(context: CommandContext, args: string[]): void {
    if (args.length < 2) {
      context.output.error('addto requires group id and child id');
      return;
    }

    const group = context.document.findById(args[0]);
    const child = context.document.findById(args[1]);

    if (!group || !(group instanceof GroupShape)) {
      context.output.error(`no such container: ${args[0]}`);
      return;
    }

    if (!child) {
      context.output.error(`no such shape: ${args[1]}`);
      return;
    }

    const parent = child.getParent();
    const index = parent ? parent.indexOf(child) : -1;
    if (parent) {
      parent.removeChild(child);
    }

    group.addChild(child);
    context.recordAction({
      undo: () => {
        group.removeChild(child);
        if (parent) {
          parent.insertChild(index, child);
        }
      },
      redo: () => {
        const activeParent = child.getParent();
        if (activeParent && activeParent !== group) {
          activeParent.removeChild(child);
        }
        group.addChild(child);
      },
    });
    context.output.writeLine(`${child.getDisplayName()} added to ${group.getDisplayName()}`);
  }
}
