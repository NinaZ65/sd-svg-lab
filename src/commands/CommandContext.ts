import { HistoryAction, HistoryManager } from '../history/HistoryManager';
import { Document } from '../model/Document';
import { ConsoleOutput } from '../io/ConsoleOutput';
import { AttributeRegistry } from '../core/AttributeRegistry';
import { TreeDecoratorRegistry } from '../core/TreeDecoratorRegistry';
import { Command } from './Command';

export class CommandContext {
  public shouldExit = false;

  public constructor(
    public readonly document: Document,
    public readonly history: HistoryManager,
    public readonly output: ConsoleOutput,
    public readonly attributes = new AttributeRegistry(),
    public readonly decorators = new TreeDecoratorRegistry(),
    public readonly availableCommands: () => readonly Command[] = () => [],
  ) {}

  public recordAction(action: HistoryAction): void {
    this.history.record(action);
  }

  public markIoCommand(establishBaseline = false): void {
    this.history.setIoBarrier();
    if (establishBaseline) this.decorators.onBaseline(this.document);
  }

  public requestExit(): void {
    this.shouldExit = true;
  }
}
