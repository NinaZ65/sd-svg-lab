import { readFileSync } from 'node:fs';
import { AbstractCommand } from './AbstractCommand';
import { CommandContext } from './CommandContext';

export class ReadCommand extends AbstractCommand {
  public readonly name = 'read';
  public readonly description = 'read an svg file into the current document';

  public execute(context: CommandContext, args: string[]): void {
    const filePath = args[0];
    if (!filePath) {
      context.output.error('read requires a file path');
      return;
    }

    try {
      const content = readFileSync(filePath, 'utf8');
      context.document.deserializeSvg(content, (message) => context.output.warning(message));
      context.document.setLastPath(filePath);
      context.markIoCommand();
      context.output.writeLine(`read ${filePath}`);
    } catch (_error) {
      context.output.error(`cannot read file: ${filePath}`);
    }
  }
}
