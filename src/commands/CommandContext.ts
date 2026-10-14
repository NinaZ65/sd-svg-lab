import { HistoryAction, HistoryManager } from '../history/HistoryManager';
import { Document } from '../model/Document';
import { ConsoleOutput } from '../io/ConsoleOutput';

export class CommandContext {
  public shouldExit = false;

  public constructor(
    public readonly document: Document,
    public readonly history: HistoryManager,
    public readonly output: ConsoleOutput,
  ) {}

  public recordAction(action: HistoryAction): void {
    this.history.record(action);
  }

  public markIoCommand(): void {
    this.history.setIoBarrier();
  }

  public requestExit(): void {
    this.shouldExit = true;
  }
}
