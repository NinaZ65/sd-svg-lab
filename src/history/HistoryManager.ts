export type HistoryAction = {
  undo: () => void;
  redo: () => void;
  undoMessage?: string;
  redoMessage?: string;
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

  public undo(): HistoryAction | undefined {
    if (this.ioBarrierActive) {
      throw new Error('undo not allowed after io command');
    }

    const action = this.undoStack.pop();
    if (!action) {
      return;
    }

    action.undo();
    this.redoStack.push(action);
    return action;
  }

  public redo(): HistoryAction | undefined {
    if (this.ioBarrierActive) {
      throw new Error('undo not allowed after io command');
    }

    const action = this.redoStack.pop();
    if (!action) {
      return;
    }

    action.redo();
    this.undoStack.push(action);
    return action;
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
