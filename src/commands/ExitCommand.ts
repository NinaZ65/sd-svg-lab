import { AbstractCommand } from './AbstractCommand';
import { CommandContext } from './CommandContext';

export class ExitCommand extends AbstractCommand {
  public readonly name = 'exit';
  public readonly description = 'exit the editor shell';

  public execute(context: CommandContext, _args: string[]): void {
    context.requestExit();
  }
}
