import { CommandContext } from './CommandContext';

export interface Command {
  readonly name: string;
  readonly description: string;
  execute(context: CommandContext): void;
}
