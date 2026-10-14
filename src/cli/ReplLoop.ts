import readline from 'node:readline';
import { CommandContext } from '../commands/CommandContext';
import { HistoryManager } from '../history/HistoryManager';
import { Document } from '../model/Document';
import { ConsoleInput } from '../io/ConsoleInput';
import { ConsoleOutput } from '../io/ConsoleOutput';
import { CommandRegistry } from './CommandRegistry';

export class ReplLoop {
  private readonly registry: CommandRegistry;
  private readonly output: ConsoleOutput;

  public constructor() {
    this.registry = new CommandRegistry();
    this.output = new ConsoleOutput();
  }

  public run(): void {
    const context = new CommandContext(new Document(), new HistoryManager(), this.output);
    const rl = ConsoleInput.create();

    this.output.writeLine("svg-editor 0.1 — type 'help' for commands");
    rl.setPrompt('svg> ');
    rl.prompt();

    rl.on('line', (line: string) => {
      const trimmed = line.trim();

      if (trimmed.length === 0 || trimmed.startsWith('#')) {
        rl.prompt();
        return;
      }

      const shouldExit = this.registry.execute(trimmed, context);
      if (shouldExit) {
        rl.close();
        return;
      }

      rl.prompt();
    });

    rl.on('close', () => {
      process.exit(0);
    });
  }
}
