export type HistoryAction = {
  undo: () => void;
  redo: () => void;
};

export class HistoryManager {
  private readonly undoStack: HistoryAction[];
  private readonly redoStack: HistoryAction[];
  private ioBarrierActive: boolean;

  public constructor() {
    this.undoStack = [];
    this.redoStack = [];
    this.ioBarrierActive = false;
  }

  public record(action: HistoryAction): void {
    this.undoStack.push(action);
    this.redoStack.length = 0;
    this.ioBarrierActive = false;
  }

  public setIoBarrier(): void {
    this.ioBarrierActive = true;
    this.redoStack.length = 0;
  }

  public isIoBarrierActive(): boolean {
    return this.ioBarrierActive;
  }

  public undo(): void {
    if (this.ioBarrierActive) {
      throw new Error('undo not allowed after io command');
    }

    const action = this.undoStack.pop();
    if (!action) {
      return;
    }

    action.undo();
    this.redoStack.push(action);
  }

  public redo(): void {
    if (this.ioBarrierActive) {
      throw new Error('undo not allowed after io command');
    }

    const action = this.redoStack.pop();
    if (!action) {
      return;
    }

    action.redo();
    this.undoStack.push(action);
  }

  public canUndo(): boolean {
    return !this.ioBarrierActive && this.undoStack.length > 0;
  }

  public canRedo(): boolean {
    return !this.ioBarrierActive && this.redoStack.length > 0;
  }

  public getUndoDepth(): number {
    return this.undoStack.length;
  }
}
