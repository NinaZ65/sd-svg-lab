import { Plugin, PluginContext } from '../../../src/core/PluginContext';
import { DirCommand } from './DirCommand';
import { NodeDirectoryAdapter } from './NodeDirectoryAdapter';

class DirPlugin implements Plugin {
  public activate(context: PluginContext): void {
    context.registerCommand(new DirCommand(new NodeDirectoryAdapter(), () => process.cwd()));
  }
}

export default new DirPlugin();
