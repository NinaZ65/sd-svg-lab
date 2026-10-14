import { AbstractCommand } from './AbstractCommand';
import { CommandContext } from './CommandContext';
import { CircleShape } from '../model/shapes/CircleShape';
import { EllipseShape } from '../model/shapes/EllipseShape';
import { GroupShape } from '../model/shapes/GroupShape';
import { LineShape } from '../model/shapes/LineShape';
import { RectShape } from '../model/shapes/RectShape';
import { Shape } from '../model/Shape';
import { TextShape } from '../model/shapes/TextShape';

export class MoveCommand extends AbstractCommand {
  public readonly name = 'move';
  public readonly description = 'move a shape by dx and dy';

  public execute(context: CommandContext, args: string[]): void {
    if (args.length < 3) {
      context.output.error('move requires id, dx and dy');
      return;
    }

    const target = context.document.findById(args[0]);
    if (!target) {
      context.output.error(`no such shape: ${args[0]}`);
      return;
    }

    const dx = Number(args[1]);
    const dy = Number(args[2]);
    if (!Number.isFinite(dx) || !Number.isFinite(dy)) {
      context.output.error('move requires numeric dx and dy');
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
        snapshots.set(shape, { x: shape.x, y: shape.y });
        return;
      }

      if (shape instanceof CircleShape) {
        snapshots.set(shape, { cx: shape.cx, cy: shape.cy });
        return;
      }

      if (shape instanceof EllipseShape) {
        snapshots.set(shape, { cx: shape.cx, cy: shape.cy });
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
    if (target instanceof GroupShape) {
      for (const child of target.getChildren()) {
        this.applyMovement(child, dx, dy);
      }
    } else {
      this.applyMovement(target, dx, dy);
    }

    context.recordAction({
      undo: () => {
        for (const [shape, snapshot] of snapshots) {
          if (shape instanceof RectShape) {
            shape.x = snapshot.x ?? shape.x;
            shape.y = snapshot.y ?? shape.y;
          } else if (shape instanceof CircleShape) {
            shape.cx = snapshot.cx ?? shape.cx;
            shape.cy = snapshot.cy ?? shape.cy;
          } else if (shape instanceof EllipseShape) {
            shape.cx = snapshot.cx ?? shape.cx;
            shape.cy = snapshot.cy ?? shape.cy;
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
        if (target instanceof GroupShape) {
          for (const child of target.getChildren()) {
            this.applyMovement(child, dx, dy);
          }
        } else {
          this.applyMovement(target, dx, dy);
        }
      },
    });

    context.output.writeLine(`${target.getDisplayName()} moved by (${dx},${dy})`);
  }

  private applyMovement(shape: Shape, dx: number, dy: number): void {
    if (shape instanceof GroupShape) {
      for (const child of shape.getChildren()) {
        this.applyMovement(child, dx, dy);
      }
      return;
    }

    if (shape instanceof RectShape) {
      shape.x += dx;
      shape.y += dy;
      return;
    }

    if (shape instanceof CircleShape) {
      shape.cx += dx;
      shape.cy += dy;
      return;
    }

    if (shape instanceof EllipseShape) {
      shape.cx += dx;
      shape.cy += dy;
      return;
    }

    if (shape instanceof LineShape) {
      shape.x1 += dx;
      shape.y1 += dy;
      shape.x2 += dx;
      shape.y2 += dy;
      return;
    }

    if (shape instanceof TextShape) {
      shape.x += dx;
      shape.y += dy;
    }
  }
}
