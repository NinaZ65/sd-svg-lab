import { Command } from '../commands/Command';
import { CommandContext } from '../commands/CommandContext';
import { CanvasCommand } from '../commands/CanvasCommand';
import { ExitCommand } from '../commands/ExitCommand';
import { HelpCommand } from '../commands/HelpCommand';
import { InitCommand } from '../commands/InitCommand';
import { TreeCommand } from '../commands/TreeCommand';

export class CommandRegistry {
  private readonly commands: Map<string, Command>;

  public constructor() {
    this.commands = new Map<string, Command>();
    this.register(new HelpCommand());
    this.register(new ExitCommand());
    this.register(new InitCommand());
    this.register(new CanvasCommand());
    this.register(new TreeCommand());
  }

  public register(command: Command): void {
    this.commands.set(command.name.toLowerCase(), command);
  }

  public execute(rawInput: string, context: CommandContext): boolean {
    const trimmed = rawInput.trim();

    if (trimmed.length === 0) {
      return false;
    }

    const [commandName, ...args] = trimmed.split(/\s+/);
    const command = this.commands.get(commandName.toLowerCase());

    if (!command) {
      context.output.error(`unknown command: ${commandName}`);
      return false;
    }

    // The current phase intentionally keeps command dispatch object-oriented and
    // leaves feature commands for subsequent development stages.
    command.execute(context);
    return context.shouldExit;
  }
}
