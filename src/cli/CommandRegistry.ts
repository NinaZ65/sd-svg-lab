import { AddtoCommand } from '../commands/AddtoCommand';
import { BackCommand } from '../commands/BackCommand';
import { Command } from '../commands/Command';
import { CommandContext } from '../commands/CommandContext';
import { CanvasCommand } from '../commands/CanvasCommand';
import { CreateCommand } from '../commands/CreateCommand';
import { DeleteCommand } from '../commands/DeleteCommand';
import { ExitCommand } from '../commands/ExitCommand';
import { FrontCommand } from '../commands/FrontCommand';
import { GroupCommand } from '../commands/GroupCommand';
import { HelpCommand } from '../commands/HelpCommand';
import { InitCommand } from '../commands/InitCommand';
import { MoveCommand } from '../commands/MoveCommand';
import { ReadCommand } from '../commands/ReadCommand';
import { RedoCommand } from '../commands/RedoCommand';
import { SaveCommand } from '../commands/SaveCommand';
import { ScaleCommand } from '../commands/ScaleCommand';
import { SetCommand } from '../commands/SetCommand';
import { ShowCommand } from '../commands/ShowCommand';
import { TreeCommand } from '../commands/TreeCommand';
import { UndoCommand } from '../commands/UndoCommand';
import { UngroupCommand } from '../commands/UngroupCommand';

export class CommandRegistry {
  private readonly commands: Map<string, Command>;

  public constructor() {
    this.commands = new Map<string, Command>();
    this.register(new HelpCommand());
    this.register(new ExitCommand());
    this.register(new InitCommand());
    this.register(new CanvasCommand());
    this.register(new TreeCommand());
    this.register(new ShowCommand());
    this.register(new CreateCommand());
    this.register(new MoveCommand());
    this.register(new SetCommand());
    this.register(new DeleteCommand());
    this.register(new GroupCommand());
    this.register(new UngroupCommand());
    this.register(new AddtoCommand());
    this.register(new FrontCommand());
    this.register(new BackCommand());
    this.register(new ScaleCommand());
    this.register(new ReadCommand());
    this.register(new SaveCommand());
    this.register(new UndoCommand());
    this.register(new RedoCommand());
  }

  public register(command: Command): void {
    this.commands.set(command.name.toLowerCase(), command);
  }

  public execute(rawInput: string, context: CommandContext): boolean {
    const trimmed = rawInput.trim();

    if (trimmed.length === 0) {
      return false;
    }

    const tokens = this.parseTokens(trimmed);
    const [commandName, ...args] = tokens;
    const command = this.commands.get(commandName.toLowerCase());

    if (!command) {
      context.output.error(`unknown command: ${commandName}`);
      return false;
    }

    command.execute(context, args);
    return context.shouldExit;
  }

  private parseTokens(input: string): string[] {
    const tokens: string[] = [];
    let current = '';
    let inQuotes = false;

    for (const ch of input) {
      if (ch === '"') {
        inQuotes = !inQuotes;
        continue;
      }

      if (ch === ' ' || ch === '\t') {
        if (inQuotes) {
          current += ch;
        } else if (current.length > 0) {
          tokens.push(current);
          current = '';
        }
        continue;
      }

      current += ch;
    }

    if (current.length > 0) {
      tokens.push(current);
    }

    return tokens;
  }
}
