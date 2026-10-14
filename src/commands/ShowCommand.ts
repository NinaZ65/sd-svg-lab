import { AbstractCommand } from './AbstractCommand';
import { CommandContext } from './CommandContext';

export class ShowCommand extends AbstractCommand {
  public readonly name = 'show';
  public readonly description = 'show a single shape';

  public execute(context: CommandContext, args: string[]): void {
    if (args.length === 0) {
      context.output.error('show requires an id');
      return;
    }

    const shape = context.document.findById(args[0]);
    if (!shape) {
      context.output.error(`no such shape: ${args[0]}`);
      return;
    }

    const parent = shape.getParent();
    context.output.writeLine(`${shape.getDisplayName()} parent=${parent ? parent.getDisplayName() : 'root'}`);
  }
}
