import { AbstractCommand } from './AbstractCommand';
import { CommandContext } from './CommandContext';
import { CircleShape } from '../model/shapes/CircleShape';
import { EllipseShape } from '../model/shapes/EllipseShape';
import { GroupShape } from '../model/shapes/GroupShape';
import { LineShape } from '../model/shapes/LineShape';
import { RectShape } from '../model/shapes/RectShape';
import { Shape } from '../model/Shape';
import { TextShape } from '../model/shapes/TextShape';

export class ScaleCommand extends AbstractCommand {
  public readonly name = 'scale';
  public readonly description = 'scale a shape or group by a positive factor';

  public execute(context: CommandContext, args: string[]): void {
    if (args.length < 2) {
      context.output.error('scale requires id and factor');
      return;
    }

    const target = context.document.findById(args[0]);
    if (!target) {
      context.output.error(`no such shape: ${args[0]}`);
      return;
    }

    const factor = Number(args[1]);
    if (!Number.isFinite(factor) || factor <= 0) {
      context.output.error('scale factor must be positive');
      return;
    }

    const snapshots = new Map<Shape, Record<string, number>>();
    const collect = (shape: Shape): void => {
      if (shape instanceof GroupShape) {
        for (const child of shape.getChildren()) {
          collect(child);
        }
        return;
      }

      if (shape instanceof RectShape) {
        snapshots.set(shape, { x: shape.x, y: shape.y, width: shape.width, height: shape.height });
        return;
      }

      if (shape instanceof CircleShape) {
        snapshots.set(shape, { cx: shape.cx, cy: shape.cy, r: shape.r });
        return;
      }

      if (shape instanceof EllipseShape) {
        snapshots.set(shape, { cx: shape.cx, cy: shape.cy, rx: shape.rx, ry: shape.ry });
        return;
      }

      if (shape instanceof LineShape) {
        snapshots.set(shape, { x1: shape.x1, y1: shape.y1, x2: shape.x2, y2: shape.y2 });
        return;
      }

      if (shape instanceof TextShape) {
        snapshots.set(shape, { x: shape.x, y: shape.y });
      }
    };

    collect(target);
    this.applyScale(target, factor);
    context.recordAction({
      undo: () => {
        for (const [shape, snapshot] of snapshots) {
          if (shape instanceof RectShape) {
            shape.x = snapshot.x ?? shape.x;
            shape.y = snapshot.y ?? shape.y;
            shape.width = snapshot.width ?? shape.width;
            shape.height = snapshot.height ?? shape.height;
          } else if (shape instanceof CircleShape) {
            shape.cx = snapshot.cx ?? shape.cx;
            shape.cy = snapshot.cy ?? shape.cy;
            shape.r = snapshot.r ?? shape.r;
          } else if (shape instanceof EllipseShape) {
            shape.cx = snapshot.cx ?? shape.cx;
            shape.cy = snapshot.cy ?? shape.cy;
            shape.rx = snapshot.rx ?? shape.rx;
            shape.ry = snapshot.ry ?? shape.ry;
          } else if (shape instanceof LineShape) {
            shape.x1 = snapshot.x1 ?? shape.x1;
            shape.y1 = snapshot.y1 ?? shape.y1;
            shape.x2 = snapshot.x2 ?? shape.x2;
            shape.y2 = snapshot.y2 ?? shape.y2;
          } else if (shape instanceof TextShape) {
            shape.x = snapshot.x ?? shape.x;
            shape.y = snapshot.y ?? shape.y;
          }
        }
      },
      redo: () => {
        this.applyScale(target, factor);
      },
    });
    context.output.writeLine(`${target.getDisplayName()} scaled by ${factor}`);
  }

  private applyScale(shape: Shape, factor: number): void {
    if (shape instanceof GroupShape) {
      for (const child of shape.getChildren()) {
        this.applyScale(child, factor);
      }
      return;
    }

    if (shape instanceof RectShape) {
      shape.x *= factor;
      shape.y *= factor;
      shape.width *= factor;
      shape.height *= factor;
      return;
    }

    if (shape instanceof CircleShape) {
      shape.cx *= factor;
      shape.cy *= factor;
      shape.r *= factor;
      return;
    }

    if (shape instanceof EllipseShape) {
      shape.cx *= factor;
      shape.cy *= factor;
      shape.rx *= factor;
      shape.ry *= factor;
      return;
    }

    if (shape instanceof LineShape) {
      shape.x1 *= factor;
      shape.y1 *= factor;
      shape.x2 *= factor;
      shape.y2 *= factor;
      return;
    }

    if (shape instanceof TextShape) {
      shape.x *= factor;
      shape.y *= factor;
    }
  }
}
