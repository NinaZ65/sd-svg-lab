import { CommandRegistry } from '../src/cli/CommandRegistry';
import { CommandContext } from '../src/commands/CommandContext';
import { HistoryManager } from '../src/history/HistoryManager';
import { ConsoleOutput } from '../src/io/ConsoleOutput';
import { Document } from '../src/model/Document';
import { ShapeRegistry } from '../src/core/ShapeRegistry';
import { registerBuiltinShapes } from '../src/builtin/registerBuiltinShapes';
import { registerBuiltinCommands } from '../src/builtin/registerBuiltinCommands';

export class CommandHarness extends ConsoleOutput {
  public readonly messages: string[] = [];
  private readonly shapes = new ShapeRegistry();
  public readonly document = new Document(800, 600, this.shapes);
  public readonly history = new HistoryManager();
  private readonly registry = new CommandRegistry();
  private readonly context = new CommandContext(this.document, this.history, this,
    undefined, undefined, () => this.registry.all());

  public constructor() {
    super();
    registerBuiltinShapes(this.shapes);
    registerBuiltinCommands(this.registry);
  }

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
