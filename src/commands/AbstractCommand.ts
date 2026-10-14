import { Command } from './Command';
import { CommandContext } from './CommandContext';

export abstract class AbstractCommand implements Command {
  public abstract readonly name: string;
  public abstract readonly description: string;

  public abstract execute(context: CommandContext): void;
}
