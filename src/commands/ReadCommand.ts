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

    let content: string;
    try {
      content = readFileSync(filePath, 'utf8');
    } catch {
      context.output.error(`cannot read file: ${filePath}`);
      return;
    }

    try {
      const warnings: string[] = [];
      context.document.deserializeSvg(content, message => warnings.push(message));
      context.document.setLastPath(filePath);
      context.markIoCommand(true);
      for (const warning of warnings) context.output.warning(warning);
      context.output.writeLine(`read ${filePath}`);
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      context.output.error(`cannot read file: ${filePath} (${reason})`);
    }
  }
}
