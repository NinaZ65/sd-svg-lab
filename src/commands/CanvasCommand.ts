import { AbstractCommand } from './AbstractCommand';
import { CommandContext } from './CommandContext';

export class CanvasCommand extends AbstractCommand {
  public readonly name = 'canvas';
  public readonly description = 'show or change canvas size';

  public execute(context: CommandContext, args: string[]): void {
    const canvas = context.document.getCanvas();

    if (args.length === 0) {
      context.output.writeLine(`canvas ${canvas.toString()}`);
      return;
    }

    if (args.length !== 2) {
      context.output.error('canvas expects width and height');
      return;
    }

    const width = Number(args[0]);
    const height = Number(args[1]);

    if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
      context.output.error('canvas size must be positive');
      return;
    }

    context.document.initialize(width, height);
    context.markIoCommand();
    context.output.writeLine(`canvas ${width}x${height} created`);
  }
}
