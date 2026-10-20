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
    let applyValue: ((next: number | string | undefined) => void) | undefined;

    if (target instanceof RectShape) {
      if (attr === 'x') { oldValue = target.x; applyValue = next => { target.x = Number(next); }; }
      else if (attr === 'y') { oldValue = target.y; applyValue = next => { target.y = Number(next); }; }
      else if (attr === 'width') { oldValue = target.width; applyValue = next => { target.width = Number(next); }; }
      else if (attr === 'height') { oldValue = target.height; applyValue = next => { target.height = Number(next); }; }
      else if (attr === 'fill') { oldValue = target.fill; applyValue = next => { target.fill = next as string | undefined; }; }
    } else if (target instanceof CircleShape) {
      if (attr === 'cx') { oldValue = target.cx; applyValue = next => { target.cx = Number(next); }; }
      else if (attr === 'cy') { oldValue = target.cy; applyValue = next => { target.cy = Number(next); }; }
      else if (attr === 'r') { oldValue = target.r; applyValue = next => { target.r = Number(next); }; }
      else if (attr === 'fill') { oldValue = target.fill; applyValue = next => { target.fill = next as string | undefined; }; }
    } else if (target instanceof EllipseShape) {
      if (attr === 'cx') { oldValue = target.cx; applyValue = next => { target.cx = Number(next); }; }
      else if (attr === 'cy') { oldValue = target.cy; applyValue = next => { target.cy = Number(next); }; }
      else if (attr === 'rx') { oldValue = target.rx; applyValue = next => { target.rx = Number(next); }; }
      else if (attr === 'ry') { oldValue = target.ry; applyValue = next => { target.ry = Number(next); }; }
      else if (attr === 'fill') { oldValue = target.fill; applyValue = next => { target.fill = next as string | undefined; }; }
    } else if (target instanceof LineShape) {
      if (attr === 'x1') { oldValue = target.x1; applyValue = next => { target.x1 = Number(next); }; }
      else if (attr === 'y1') { oldValue = target.y1; applyValue = next => { target.y1 = Number(next); }; }
      else if (attr === 'x2') { oldValue = target.x2; applyValue = next => { target.x2 = Number(next); }; }
      else if (attr === 'y2') { oldValue = target.y2; applyValue = next => { target.y2 = Number(next); }; }
      else if (attr === 'stroke') { oldValue = target.stroke; applyValue = next => { target.stroke = next as string | undefined; }; }
    } else if (target instanceof TextShape) {
      if (attr === 'x') { oldValue = target.x; applyValue = next => { target.x = Number(next); }; }
      else if (attr === 'y') { oldValue = target.y; applyValue = next => { target.y = Number(next); }; }
      else if (attr === 'text') { oldValue = target.text; applyValue = next => { target.text = String(next); }; }
    }

    if (!applyValue) {
      context.output.error(`unknown attribute: ${attr}`);
      return;
    }

    const previousValue = oldValue;
    const nextValue = ['fill', 'stroke', 'text'].includes(attr) ? value : Number(value);
    if (typeof nextValue === 'number' && !Number.isFinite(nextValue)) {
      context.output.error(`invalid numeric value: ${value}`);
      return;
    }

    // Capture values once. Applying undo/redo must never rewrite their payload.
    const apply = applyValue;
    apply(nextValue);
    context.recordAction({
      undo: () => apply(previousValue),
      redo: () => apply(nextValue),
    });

    context.output.writeLine(`${target.getDisplayName()} updated: ${attr}=${value}`);
  }
}
