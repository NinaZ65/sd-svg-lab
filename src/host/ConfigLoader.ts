import { existsSync, readFileSync } from 'node:fs';
import { dirname, isAbsolute, join, parse, resolve } from 'node:path';
import { ConsoleOutput } from '../io/ConsoleOutput';
import { Assembly } from './Assembly';
import { PluginManifest } from './PluginActivator';
import { Plugin } from '../core/PluginContext';

interface ConfigEntry { module: string; enabled?: boolean; options?: unknown }

export class ConfigLoader {
  public constructor(private readonly assembly: Assembly, private readonly output: ConsoleOutput) {}

  public load(configPath: string): void {
    let entries: ConfigEntry[];
    try {
      const config = JSON.parse(readFileSync(configPath, 'utf8')) as { plugins?: unknown };
      if (!config || !Array.isArray(config.plugins) || !config.plugins.every(this.validEntry)) throw new Error('invalid');
      entries = config.plugins;
    } catch {
      this.output.error('invalid plugin config');
      return;
    }
    const base = dirname(resolve(configPath));
    for (const entry of entries) {
      if (entry.enabled === false) continue;
      this.loadOne(entry, base);
    }
  }

  private validEntry(value: unknown): value is ConfigEntry {
    if (!value || typeof value !== 'object') return false;
    const entry = value as Record<string, unknown>;
    return typeof entry.module === 'string' && entry.module.length > 0
      && (entry.enabled === undefined || typeof entry.enabled === 'boolean');
  }

  private loadOne(entry: ConfigEntry, base: string): void {
    const request = entry.module.startsWith('.') || isAbsolute(entry.module) ? resolve(base, entry.module) : entry.module;
    let resolved: string;
    try {
      resolved = require.resolve(request, { paths: [base] });
    } catch {
      this.output.error(`plugin not found: ${entry.module}`);
      return;
    }

    let manifest: PluginManifest;
    try {
      const packagePath = entry.module.startsWith('.') || isAbsolute(entry.module)
        ? resolve(base, entry.module, 'package.json')
        : this.findPackageManifest(resolved, entry.module);
      manifest = JSON.parse(readFileSync(packagePath, 'utf8')) as PluginManifest;
    } catch (error) {
      this.output.error(`plugin failed to activate: ${entry.module} (${this.reason(error)})`);
      return;
    }

    try {
      const loaded = require(resolved) as { default?: Plugin };
      if (!loaded.default) {
        this.output.error(`plugin has no default export: ${entry.module}`);
        return;
      }
      this.assembly.activator.activate(loaded.default, manifest, entry.options);
    } catch (error) {
      const message = this.reason(error);
      this.output.error(message.startsWith('plugin ') || message.startsWith('duplicate registration:')
        ? message : `plugin failed to activate: ${manifest.name} (${message})`);
    }
  }

  private reason(error: unknown): string { return error instanceof Error ? error.message : String(error); }

  private findPackageManifest(resolved: string, packageName: string): string {
    let directory = dirname(resolved);
    while (directory !== parse(directory).root) {
      const candidate = join(directory, 'package.json');
      if (existsSync(candidate)) {
        const value = JSON.parse(readFileSync(candidate, 'utf8')) as { name?: string };
        if (value.name === packageName) return candidate;
      }
      directory = dirname(directory);
    }
    throw new Error(`package manifest not found: ${packageName}`);
  }
}
