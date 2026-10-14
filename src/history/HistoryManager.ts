export class HistoryManager {
  private readonly undoStack: string[];
  private readonly redoStack: string[];

  public constructor() {
    this.undoStack = [];
    this.redoStack = [];
  }

  public record(commandName: string): void {
    this.undoStack.push(commandName);
    this.redoStack.length = 0;
  }

  public canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  public canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  public getUndoDepth(): number {
    return this.undoStack.length;
  }
}
