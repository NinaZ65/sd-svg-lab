import { writeFileSync } from 'node:fs';
import { AbstractCommand } from './AbstractCommand';
import { CommandContext } from './CommandContext';

export class SaveCommand extends AbstractCommand {
  public readonly name = 'save';
  public readonly description = 'save the document to an svg file';

  public execute(context: CommandContext, args: string[]): void {
    const filePath = args[0] ?? context.document.getLastPath() ?? 'output.svg';

    try {
      writeFileSync(filePath, context.document.serializeSvg(), 'utf8');
      context.document.setLastPath(filePath);
      context.markIoCommand();
      context.output.writeLine(`saved to ${filePath}`);
    } catch (_error) {
      context.output.error(`cannot write file: ${filePath}`);
    }
  }
}
