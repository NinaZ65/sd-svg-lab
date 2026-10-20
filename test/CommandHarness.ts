import { CommandRegistry } from '../src/cli/CommandRegistry';
import { CommandContext } from '../src/commands/CommandContext';
import { HistoryManager } from '../src/history/HistoryManager';
import { ConsoleOutput } from '../src/io/ConsoleOutput';
import { Document } from '../src/model/Document';

export class CommandHarness extends ConsoleOutput {
  public readonly messages: string[] = [];
  public readonly document = new Document();
  public readonly history = new HistoryManager();
  private readonly registry = new CommandRegistry();
  private readonly context = new CommandContext(this.document, this.history, this);

  public override writeLine(message = ''): void {
    this.messages.push(message);
  }

  public run(...commands: string[]): void {
    for (const command of commands) {
      this.registry.execute(command, this.context);
    }
  }

  public tree(): string {
    this.run('tree');
    return this.messages[this.messages.length - 1];
  }
}
