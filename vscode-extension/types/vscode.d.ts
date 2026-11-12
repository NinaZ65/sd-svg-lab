// Narrow declarations for the stable VS Code APIs used by this extension.
// Runtime implementations are supplied by VS Code's extension host.
declare module 'vscode' {
  export interface Disposable { dispose(): void }
  export interface ExtensionContext { subscriptions: Disposable[] }
  export interface Uri { readonly path: string }
  export interface FileStat { readonly type: FileType }
  export enum FileType { Unknown = 0, File = 1, Directory = 2, SymbolicLink = 64 }
  export interface CancellationToken { readonly isCancellationRequested: boolean }
  export interface TextDocument {
    readonly uri: Uri;
    getText(): string;
    positionAt(offset: number): Position;
  }
  export class Position { constructor(line: number, character: number) }
  export class Range { constructor(start: Position, end: Position) }
  export enum SymbolKind { File = 0, Module = 1, Namespace = 2, Object = 18 }
  export class DocumentSymbol {
    constructor(name: string, detail: string, kind: SymbolKind, range: Range, selectionRange: Range);
    readonly children: DocumentSymbol[];
  }
  export interface DocumentSymbolProvider {
    provideDocumentSymbols(document: TextDocument, token: CancellationToken): DocumentSymbol[];
  }
  export class FileDecoration { constructor(badge?: string, tooltip?: string) }
  export interface FileDecorationProvider {
    provideFileDecoration(uri: Uri): Promise<FileDecoration | undefined>;
  }
  export namespace workspace {
    const fs: { stat(uri: Uri): Promise<FileStat> };
  }
  export namespace window {
    function registerFileDecorationProvider(provider: FileDecorationProvider): Disposable;
  }
  export namespace languages {
    function registerDocumentSymbolProvider(selector: { scheme: string; pattern: string }, provider: DocumentSymbolProvider): Disposable;
  }
}
