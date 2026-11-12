import { Shape } from '../model/Shape';
import { AttributeTransaction } from './AttributeTransaction';

export interface AttributeOutcome {
  readonly executeMessage: string;
  readonly undoMessage?: string;
  readonly redoMessage?: string;
}

export interface AttributeHandler {
  readonly name: string;
  handles(shape: Shape, attribute: string): boolean;
  apply(shape: Shape, attribute: string, value: string, transaction: AttributeTransaction): AttributeOutcome;
}
