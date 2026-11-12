import { HistoryAction } from '../history/HistoryManager';
import { Shape } from '../model/Shape';

export class AttributeTransaction {
  private readonly changes: Array<{ shape: Shape; attribute: string; previous: number | string | undefined; next: number | string | undefined }> = [];

  public set(shape: Shape, attribute: string, rawValue: string): void {
    if (!shape.supportsAttribute(attribute)) throw new Error(`unknown attribute: ${attribute}`);
    const previous = shape.readAttribute(attribute);
    const next = typeof previous === 'number' ? Number(rawValue) : rawValue;
    if (typeof next === 'number' && !Number.isFinite(next)) throw new Error(`invalid numeric value: ${rawValue}`);
    shape.writeAttribute(attribute, next);
    this.changes.push({ shape, attribute, previous, next });
  }

  public rollback(): void {
    for (const change of [...this.changes].reverse()) change.shape.writeAttribute(change.attribute, change.previous);
    this.changes.length = 0;
  }

  public toHistoryAction(undoMessage?: string, redoMessage?: string): HistoryAction {
    const changes = [...this.changes];
    return {
      undo: () => { for (const change of [...changes].reverse()) change.shape.writeAttribute(change.attribute, change.previous); },
      redo: () => { for (const change of changes) change.shape.writeAttribute(change.attribute, change.next); },
      undoMessage, redoMessage,
    };
  }
}
