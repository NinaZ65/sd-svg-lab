import { AbstractCommand } from './AbstractCommand';
import { CommandContext } from './CommandContext';

export class HelpCommand extends AbstractCommand {
  public readonly name = 'help';
  public readonly description = 'show available commands';

  public execute(context: CommandContext, _args: string[]): void {
    const lines = [
      'Available commands:',
      '  help                    Show available commands',
      '  init [w] [h]            Create a canvas skeleton',
      '  read <file.svg>         Read an SVG document',
      '  save [file.svg]         Save the current SVG document',
      '  canvas [w] [h]          Show or resize the canvas',
      '  tree [id]               Show the document structure',
      '  show <id>               Show a shape summary',
      '  create ...              Create a shape',
      '  move <id> <dx> <dy>     Move a shape',
      '  scale <id> <factor>     Scale a shape or group',
      '  set <id> <attr> <val>   Set a shape attribute',
      '  delete <id>             Remove a shape',
      '  group <new> <id...>     Create a group from existing shapes',
      '  ungroup <id>            Dissolve a group',
      '  addto <gid> <id>        Move a shape into a group',
      '  front <id>              Move a shape to the front',
      '  back <id>               Move a shape to the back',
      '  undo                    Undo the last edit',
      '  redo                    Redo the last undone edit',
      '  exit                    Exit the REPL',
      '',
      'Note: phase 1 includes the structural CLI and core SVG edit model.',
    ];

    context.output.writeLine(lines.join('\n'));
  }
}
