import { ShapeRegistry } from '../core/ShapeRegistry';
import { CircleProvider } from './shapes/CircleProvider';
import { EllipseProvider } from './shapes/EllipseProvider';
import { GroupProvider } from './shapes/GroupProvider';
import { LineProvider } from './shapes/LineProvider';
import { RectProvider } from './shapes/RectProvider';
import { TextProvider } from './shapes/TextProvider';

export function registerBuiltinShapes(registry: ShapeRegistry): void {
  registry.register(new RectProvider());
  registry.register(new CircleProvider());
  registry.register(new EllipseProvider());
  registry.register(new LineProvider());
  registry.register(new TextProvider());
  registry.register(new GroupProvider());
}
