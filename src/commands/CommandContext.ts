import { HistoryManager } from '../history/HistoryManager';
import { Document } from '../model/Document';
import { ConsoleOutput } from '../io/ConsoleOutput';

export class CommandContext {
  public shouldExit = false;

  public constructor(
    public readonly document: Document,
    public readonly history: HistoryManager,
    public readonly output: ConsoleOutput,
  ) {}

  public requestExit(): void {
    this.shouldExit = true;
  }
}
