import { Plugin, PluginContext } from '../../../src/core/PluginContext';
import { BoxAttributeHandler } from './BoxAttributeHandler';
import { BoxProvider } from './BoxProvider';
import { BoxTypeDecorator } from './BoxTypeDecorator';

class BoxPlugin implements Plugin {
  public activate(context: PluginContext, options?: unknown): void {
    const settings = options && typeof options === 'object' ? options as { fill?: unknown } : {};
    if (settings.fill !== undefined && typeof settings.fill !== 'string') throw new Error('box fill option must be a string');
    context.registerShape(new BoxProvider(context.createShape, settings.fill));
    context.registerAttribute(new BoxAttributeHandler());
    context.registerDecorator(new BoxTypeDecorator());
  }
}

export default new BoxPlugin();
