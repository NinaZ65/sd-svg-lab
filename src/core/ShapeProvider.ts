import { Shape } from '../model/Shape';

export interface ShapeProvider {
  readonly name: string;
  create(id: string, args: readonly (string | undefined)[]): Shape;
  read(id: string, attributes: Readonly<Record<string, string>>, text: string, children: readonly Shape[]): Shape;
}
