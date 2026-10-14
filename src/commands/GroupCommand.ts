import { AbstractCommand } from './AbstractCommand';
import { CommandContext } from './CommandContext';
import { GroupShape } from '../model/shapes/GroupShape';

export class GroupCommand extends AbstractCommand {
  public readonly name = 'group';
  public readonly description = 'group multiple shapes under a new container';

  public execute(context: CommandContext, args: string[]): void {
    if (args.length < 2) {
      context.output.error('group requires new group id and at least one child id');
      return;
    }

    const newId = args[0];
    const targetIds = args.slice(1);

    if (context.document.findById(newId)) {
      context.output.error(`id already exists: ${newId}`);
      return;
    }

    const group = new GroupShape(newId);
    const originalEntries: Array<{ shape: any; parent: any; index: number }> = [];

    for (const id of targetIds) {
      const shape = context.document.findById(id);
      if (!shape) {
        context.output.error(`no such shape: ${id}`);
        return;
      }

      const parent = shape.getParent();
      if (!parent) {
        context.output.error(`no such shape: ${id}`);
        return;
      }

      originalEntries.push({ shape, parent, index: parent.indexOf(shape) });
      parent.removeChild(shape);
      group.addChild(shape);
    }

    context.document.getRoot().addChild(group);
    context.recordAction({
      undo: () => {
        context.document.getRoot().removeChild(group);
        for (const entry of originalEntries) {
          const { shape, parent, index } = entry;
          group.removeChild(shape);
          parent.insertChild(index, shape);
        }
      },
      redo: () => {
        const root = context.document.getRoot();
        if (group.getParent() !== root) {
          root.addChild(group);
        }
        for (const entry of originalEntries) {
          const { shape } = entry;
          if (shape.getParent() !== group) {
            const parent = shape.getParent();
            if (parent) {
              parent.removeChild(shape);
            }
            group.addChild(shape);
          }
        }
      },
    });
    context.output.writeLine(`${group.getDisplayName()} created with ${targetIds.length} children`);
  }
}
