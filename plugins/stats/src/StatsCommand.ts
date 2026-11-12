import { Command } from '../../../src/commands/Command';
import { CommandContext } from '../../../src/commands/CommandContext';
import { Shape } from '../../../src/model/Shape';
import { GroupShape } from '../../../src/model/shapes/GroupShape';

export class StatsCommand implements Command {
  public readonly name = 'stats';
  public readonly description = 'count SVG leaves and containers';
  public readonly helpLine = '  stats                   Count shapes by type';

  public execute(context: CommandContext, args: string[]): void {
    if (args.length !== 0) {
      context.output.error('stats does not accept arguments');
      return;
    }
    const counts = new Map<string, number>();
    let containers = 0;
    let total = 0;
    const visit = (shape: Shape): void => {
      if (shape instanceof GroupShape) {
        containers += 1;
        for (const child of shape.getChildren()) visit(child);
      } else {
        const kind = shape.getKind();
        counts.set(kind, (counts.get(kind) ?? 0) + 1);
        total += 1;
      }
    };
    for (const child of context.document.getRoot().getChildren()) visit(child);
    const parts = [...counts].map(([kind, count]) => `${kind}: ${count}`);
    parts.push(`(total ${total}, containers ${containers})`);
    context.output.writeLine(parts.join('  '));
  }
}
