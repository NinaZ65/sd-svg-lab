import { AbstractCommand } from './AbstractCommand';
import { CommandContext } from './CommandContext';

export class InitCommand extends AbstractCommand {
  public readonly name = 'init';
  public readonly description = 'initialize a new document';

  public execute(context: CommandContext): void {
    const args = context.document.getRoot().renderTree(0);
    const width = 800;
    const height = 600;

    context.document.initialize(width, height);
    context.history.record(this.name);
    context.output.writeLine(`canvas ${width}x${height} created`);
    void args;
  }
}
