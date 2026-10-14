import { AbstractCommand } from './AbstractCommand';
import { CommandContext } from './CommandContext';

export class InitCommand extends AbstractCommand {
  public readonly name = 'init';
  public readonly description = 'initialize a new document';

  public execute(context: CommandContext, args: string[]): void {
    const width = args.length >= 2 ? Number(args[0]) : 800;
    const height = args.length >= 2 ? Number(args[1]) : 600;

    if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
      context.output.error('invalid canvas size');
      return;
    }

    context.document.initialize(width, height);
    context.markIoCommand();
    context.output.writeLine(`canvas ${width}x${height} created`);
  }
}
