import * as vscode from 'vscode';

export class SvgFileDecorationProvider implements vscode.FileDecorationProvider {
  public async provideFileDecoration(uri: vscode.Uri): Promise<vscode.FileDecoration | undefined> {
    if (!uri.path.endsWith('.svg')) return undefined;
    try {
      const stat = await vscode.workspace.fs.stat(uri);
      if (stat.type !== vscode.FileType.File) return undefined;
      return new vscode.FileDecoration('[]', 'SVG file');
    } catch {
      return undefined;
    }
  }
}
