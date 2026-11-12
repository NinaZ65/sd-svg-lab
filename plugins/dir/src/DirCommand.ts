import { Command } from '../../../src/commands/Command';
import { CommandContext } from '../../../src/commands/CommandContext';
import { DirectoryAccess } from './DirectoryAccess';

export class DirCommand implements Command {
  public readonly name = 'dir';
  public readonly description = 'list the current working directory';
  public readonly helpLine = '  dir                     List the current directory';

  public constructor(private readonly directory: DirectoryAccess, private readonly cwd: () => string) {}

  public execute(context: CommandContext, args: string[]): void {
    if (args.length !== 0) {
      context.output.error('dir does not accept arguments');
      return;
    }
    const path = this.cwd();
    try {
      const entries = [...this.directory.list(path)].sort((a, b) => {
        if (a.directory !== b.directory) return a.directory ? -1 : 1;
        return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
      });
      if (entries.length === 0) context.output.writeLine('(empty directory)');
      else for (const entry of entries) context.output.writeLine(`${entry.directory ? '[DIR]' : '[FILE]'}  ${entry.name}`);
    } catch {
      context.output.error(`cannot read directory: ${path}`);
    }
  }
}
