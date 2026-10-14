import { AbstractCommand } from './AbstractCommand';
import { CommandContext } from './CommandContext';

export class CanvasCommand extends AbstractCommand {
  public readonly name = 'canvas';
  public readonly description = 'show or change canvas size';

  public execute(context: CommandContext): void {
    const canvas = context.document.getCanvas();
    context.output.writeLine(`canvas ${canvas.toString()}`);
  }
}
