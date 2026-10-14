import { AbstractCommand } from './AbstractCommand';
import { CommandContext } from './CommandContext';
import { CircleShape } from '../model/shapes/CircleShape';
import { EllipseShape } from '../model/shapes/EllipseShape';
import { LineShape } from '../model/shapes/LineShape';
import { RectShape } from '../model/shapes/RectShape';
import { TextShape } from '../model/shapes/TextShape';

export class SetCommand extends AbstractCommand {
  public readonly name = 'set';
  public readonly description = 'set a shape attribute';

  public execute(context: CommandContext, args: string[]): void {
    if (args.length < 3) {
      context.output.error('set requires id, attribute and value');
      return;
    }

    const target = context.document.findById(args[0]);
    if (!target) {
      context.output.error(`no such shape: ${args[0]}`);
      return;
    }

    const attr = args[1];
    const value = args.slice(2).join(' ');

    let oldValue: number | string | undefined;
    let nextValue: number | string | undefined;

    const setValue = (next: number | string): void => {
      if (target instanceof RectShape) {
        if (attr === 'x') { oldValue = target.x; target.x = Number(next); }
        else if (attr === 'y') { oldValue = target.y; target.y = Number(next); }
        else if (attr === 'width') { oldValue = target.width; target.width = Number(next); }
        else if (attr === 'height') { oldValue = target.height; target.height = Number(next); }
        else if (attr === 'fill') { oldValue = target.fill; target.fill = String(next); }
        else { context.output.error(`unknown attribute: ${attr}`); return; }
      } else if (target instanceof CircleShape) {
        if (attr === 'cx') { oldValue = target.cx; target.cx = Number(next); }
        else if (attr === 'cy') { oldValue = target.cy; target.cy = Number(next); }
        else if (attr === 'r') { oldValue = target.r; target.r = Number(next); }
        else if (attr === 'fill') { oldValue = target.fill; target.fill = String(next); }
        else { context.output.error(`unknown attribute: ${attr}`); return; }
      } else if (target instanceof EllipseShape) {
        if (attr === 'cx') { oldValue = target.cx; target.cx = Number(next); }
        else if (attr === 'cy') { oldValue = target.cy; target.cy = Number(next); }
        else if (attr === 'rx') { oldValue = target.rx; target.rx = Number(next); }
        else if (attr === 'ry') { oldValue = target.ry; target.ry = Number(next); }
        else if (attr === 'fill') { oldValue = target.fill; target.fill = String(next); }
        else { context.output.error(`unknown attribute: ${attr}`); return; }
      } else if (target instanceof LineShape) {
        if (attr === 'x1') { oldValue = target.x1; target.x1 = Number(next); }
        else if (attr === 'y1') { oldValue = target.y1; target.y1 = Number(next); }
        else if (attr === 'x2') { oldValue = target.x2; target.x2 = Number(next); }
        else if (attr === 'y2') { oldValue = target.y2; target.y2 = Number(next); }
        else if (attr === 'stroke') { oldValue = target.stroke; target.stroke = String(next); }
        else { context.output.error(`unknown attribute: ${attr}`); return; }
      } else if (target instanceof TextShape) {
        if (attr === 'x') { oldValue = target.x; target.x = Number(next); }
        else if (attr === 'y') { oldValue = target.y; target.y = Number(next); }
        else if (attr === 'text') { oldValue = target.text; target.text = String(next); }
        else { context.output.error(`unknown attribute: ${attr}`); return; }
      } else {
        context.output.error(`unknown attribute: ${attr}`);
        return;
      }

      nextValue = next;
    };

    const nextNum = Number(value);
    const nextValueToApply = Number.isFinite(nextNum) ? nextNum : value;
    setValue(nextValueToApply);
    if (oldValue === undefined || nextValue === undefined) {
      return;
    }

    context.recordAction({
      undo: () => {
        setValue(oldValue as number | string);
      },
      redo: () => {
        setValue(nextValue as number | string);
      },
    });

    context.output.writeLine(`${target.getDisplayName()} updated: ${attr}=${value}`);
  }
}
