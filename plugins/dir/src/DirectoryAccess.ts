export interface DirectoryEntry { readonly name: string; readonly directory: boolean }

/** Port used by the dir command; no Node file system types cross this boundary. */
export interface DirectoryAccess {
  list(path: string): readonly DirectoryEntry[];
}
