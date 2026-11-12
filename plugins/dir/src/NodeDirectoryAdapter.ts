import { readdirSync } from 'node:fs';
import { DirectoryAccess, DirectoryEntry } from './DirectoryAccess';

export class NodeDirectoryAdapter implements DirectoryAccess {
  public list(path: string): readonly DirectoryEntry[] {
    return readdirSync(path, { withFileTypes: true }).map(entry => ({
      name: entry.name,
      directory: entry.isDirectory(),
    }));
  }
}
