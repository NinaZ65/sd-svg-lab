import { AbstractCommand } from './AbstractCommand';
import { CommandContext } from './CommandContext';

export class MoveCommand extends AbstractCommand {
  public readonly name = 'move';
  public readonly description = 'move a shape by dx and dy';

  public execute(context: CommandContext, args: string[]): void {
    if (args.length < 3) {
      context.output.error('move requires id, dx and dy');
      return;
    }

    const target = context.document.findById(args[0]);
    if (!target) {
      context.output.error(`no such shape: ${args[0]}`);
      return;
    }

    const dx = Number(args[1]);
    const dy = Number(args[2]);
    if (!Number.isFinite(dx) || !Number.isFinite(dy)) {
      context.output.error('move requires numeric dx and dy');
      return;
    }

    const restoreGeometry = target.captureGeometry();
    target.move(dx, dy);
    context.recordAction({
      undo: restoreGeometry,
      redo: () => { target.move(dx, dy); },
    });

    context.output.writeLine(`${target.getDisplayName()} moved by (${dx},${dy})`);
  }
}
