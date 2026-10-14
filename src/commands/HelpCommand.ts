import { AbstractCommand } from './AbstractCommand';
import { CommandContext } from './CommandContext';

export class HelpCommand extends AbstractCommand {
  public readonly name = 'help';
  public readonly description = 'show available commands';

  public execute(context: CommandContext): void {
    const lines = [
      'Available commands:',
      '  help            Show available commands',
      '  init [w] [h]    Create a canvas skeleton',
      '  canvas [w] [h]  Show or resize the canvas',
      '  tree            Show the document structure',
      '  exit            Exit the REPL',
      '',
      'Note: phase 1 intentionally keeps only the structural CLI layer.',
    ];

    context.output.writeLine(lines.join('\n'));
  }
}
