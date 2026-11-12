import { Plugin, PluginContext } from '../../../src/core/PluginContext';
import { StatsCommand } from './StatsCommand';

class StatsPlugin implements Plugin {
  public activate(context: PluginContext): void { context.registerCommand(new StatsCommand()); }
}

export default new StatsPlugin();
