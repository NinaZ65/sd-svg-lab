import { AbstractCommand } from './AbstractCommand';
import { CommandContext } from './CommandContext';

export class RedoCommand extends AbstractCommand {
  public readonly name = 'redo';
  public readonly description = 'redo the last undone edit';

  public execute(context: CommandContext, _args: string[]): void {
    if (context.history.isIoBarrierActive()) {
      context.output.error('undo not allowed after io command');
      return;
    }

    if (!context.history.canRedo()) {
      context.output.error('nothing to redo');
      return;
    }

    context.history.redo();
    context.output.writeLine('redo executed');
  }
}
