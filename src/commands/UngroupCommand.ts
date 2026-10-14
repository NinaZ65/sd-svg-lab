import { AbstractCommand } from './AbstractCommand';
import { CommandContext } from './CommandContext';
import { GroupShape } from '../model/shapes/GroupShape';

export class UngroupCommand extends AbstractCommand {
  public readonly name = 'ungroup';
  public readonly description = 'ungroup a group';

  public execute(context: CommandContext, args: string[]): void {
    if (args.length === 0) {
      context.output.error('ungroup requires a group id');
      return;
    }

    const group = context.document.findById(args[0]);
    if (!group) {
      context.output.error(`no such shape: ${args[0]}`);
      return;
    }

    if (!(group instanceof GroupShape)) {
      context.output.error(`no such shape: ${args[0]}`);
      return;
    }

    const parent = group.getParent();
    if (!parent) {
      context.output.error(`cannot ungroup top-level container: ${group.id}`);
      return;
    }

    const groupIndex = parent.indexOf(group);
    const children = [...group.getChildren()];
    parent.removeChild(group);
    for (const child of children) {
      group.removeChild(child);
      parent.addChild(child);
    }

    context.recordAction({
      undo: () => {
        for (const child of children) {
          const childParent = child.getParent();
          if (childParent) {
            childParent.removeChild(child);
          }
        }
        parent.insertChild(groupIndex, group);
        for (const child of children) {
          group.addChild(child);
        }
      },
      redo: () => {
        const currentParent = group.getParent();
        if (currentParent) {
          currentParent.removeChild(group);
        }
        for (const child of [...children]) {
          const childParent = child.getParent();
          if (childParent) {
            childParent.removeChild(child);
          }
          parent.addChild(child);
        }
      },
    });

    context.output.writeLine(`${group.getDisplayName()} ungrouped`);
  }
}
