import { AbstractCommand } from './AbstractCommand';
import { CommandContext } from './CommandContext';
import { GroupShape } from '../model/shapes/GroupShape';
import { ShapeFactory } from '../model/shapes/ShapeFactory';

export class CreateCommand extends AbstractCommand {
  public readonly name = 'create';
  public readonly description = 'create a shape';

  public execute(context: CommandContext, args: string[]): void {
    if (args.length < 2) {
      context.output.error('create requires type and id');
      return;
    }

    const kind = args[0];
    const id = args[1];
    const rest = args.slice(2);

    if (context.document.findById(id)) {
      context.output.error(`id already exists: ${id}`);
      return;
    }

    let containerId: string | undefined;
    let payload = rest;
    const inIndex = rest.lastIndexOf('in');
    if (inIndex >= 0) {
      const next = rest[inIndex + 1];
      if (inIndex + 2 !== rest.length) {
        payload = rest.slice(0, inIndex);
        containerId = next;
      }
    }

    try {
      const shape = ShapeFactory.create(kind, id, payload);
      const parent = containerId ? context.document.findById(containerId) : context.document.getRoot();

      if (containerId && !parent) {
        context.output.error(`no such container: ${containerId}`);
        return;
      }

      if (containerId && !(parent instanceof GroupShape)) {
        context.output.error(`not a container: ${containerId}`);
        return;
      }

      if (!containerId && !(context.document.getRoot() instanceof GroupShape)) {
        context.output.error('no document. use \'init\' or \'read\' first');
        return;
      }

      const targetParent = containerId ? parent as GroupShape : context.document.getRoot();
      targetParent.addChild(shape);
      context.recordAction({
        undo: () => {
          targetParent.removeChild(shape);
        },
        redo: () => {
          targetParent.addChild(shape);
        },
      });
      context.output.writeLine(`${shape.getDisplayName()} created${containerId ? ` in ${targetParent.getDisplayName()}` : ''}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'unknown error';
      context.output.error(errorMessage);
    }
  }
}
