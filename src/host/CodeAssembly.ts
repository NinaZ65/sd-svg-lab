import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import stats from '../../plugins/stats/src';
import dir from '../../plugins/dir/src';
import box from '../../plugins/box/src';
import { Plugin } from '../core/PluginContext';
import { Assembly } from './Assembly';
import { PluginManifest } from './PluginActivator';

/** The sole code-composition root. New code-loaded plugins are added here. */
export function assembleCode(): Assembly {
  const assembly = new Assembly();
  const activate = (name: string, plugin: Plugin): void => {
    const packagePath = resolve(__dirname, '../../../plugins', name, 'package.json');
    const manifest = JSON.parse(readFileSync(packagePath, 'utf8')) as PluginManifest;
    assembly.activator.activate(plugin, manifest);
  };
  activate('stats', stats);
  activate('dir', dir);
  activate('box', box);
  return assembly;
}
