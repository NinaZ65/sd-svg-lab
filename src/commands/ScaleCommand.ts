import { AbstractCommand } from './AbstractCommand';
import { CommandContext } from './CommandContext';

export class ScaleCommand extends AbstractCommand {
  public readonly name = 'scale';
  public readonly description = 'scale a shape or group by a positive factor';

  public execute(context: CommandContext, args: string[]): void {
    if (args.length < 2) {
      context.output.error('scale requires id and factor');
      return;
    }

    const target = context.document.findById(args[0]);
    if (!target) {
      context.output.error(`no such shape: ${args[0]}`);
      return;
    }

    const factor = Number(args[1]);
    if (!Number.isFinite(factor) || factor <= 0) {
      context.output.error('scale factor must be positive');
      return;
    }

    const restoreGeometry = target.captureGeometry();
    target.scale(factor);
    context.recordAction({
      undo: restoreGeometry,
      redo: () => { target.scale(factor); },
    });

    context.output.writeLine(`${target.getDisplayName()} scaled by ${factor}`);
  }
}
