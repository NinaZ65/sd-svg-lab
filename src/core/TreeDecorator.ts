import { Document } from '../model/Document';
import { Shape } from '../model/Shape';

export interface TreeDecorator {
  readonly name: string;
  readonly order: number;
  label(shape: Shape | null, document: Document): string;
  onBaseline?(document: Document): void;
}
