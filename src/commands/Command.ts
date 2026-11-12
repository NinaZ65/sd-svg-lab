import { CommandContext } from './CommandContext';

export interface Command {
  readonly name: string;
  readonly description: string;
  readonly helpLine?: string;
  execute(context: CommandContext, args: string[]): void;
}
