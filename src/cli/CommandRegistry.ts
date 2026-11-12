import { Command } from '../commands/Command';
import { CommandContext } from '../commands/CommandContext';

export class CommandRegistry {
  private readonly commands = new Map<string, Command>();

  public register(command: Command): void {
    const name = command.name.toLowerCase();
    if (this.commands.has(name)) throw new Error(`duplicate registration: commands/${name}`);
    this.commands.set(name, command);
  }

  public all(): readonly Command[] { return [...this.commands.values()]; }

  public has(name: string): boolean { return this.commands.has(name.toLowerCase()); }

  public execute(rawInput: string, context: CommandContext): boolean {
    const trimmed = rawInput.trim();
    if (trimmed.length === 0) return false;
    const [commandName, ...args] = this.parseTokens(trimmed);
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
        if (inQuotes) current += ch;
        else if (current.length > 0) { tokens.push(current); current = ''; }
        continue;
      }
      current += ch;
    }
    if (current.length > 0) tokens.push(current);
    return tokens;
  }
}
