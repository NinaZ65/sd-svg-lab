import { Plugin, PluginContext } from '../../../src/core/PluginContext';
import { ModifiedStar } from './ModifiedStar';

class TreeStarPlugin implements Plugin {
  public activate(context: PluginContext): void { context.registerDecorator(new ModifiedStar()); }
}

export default new TreeStarPlugin();
