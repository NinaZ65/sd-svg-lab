import { AbstractCommand } from './AbstractCommand';
import { CommandContext } from './CommandContext';

export class UndoCommand extends AbstractCommand {
  public readonly name = 'undo';
  public readonly description = 'undo the last edit';

  public execute(context: CommandContext, _args: string[]): void {
    if (context.history.isIoBarrierActive()) {
      context.output.error('undo not allowed after io command');
      return;
    }

    if (!context.history.canUndo()) {
      context.output.error('nothing to undo');
      return;
    }

    context.history.undo();
    context.output.writeLine('undo executed');
  }
}
