import * as vscode from 'vscode';
import { SvgDocumentSymbolProvider } from './SvgDocumentSymbolProvider';
import { SvgFileDecorationProvider } from './SvgFileDecorationProvider';

export function activate(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.window.registerFileDecorationProvider(new SvgFileDecorationProvider()),
    vscode.languages.registerDocumentSymbolProvider(
      { scheme: 'file', pattern: '**/*.svg' }, new SvgDocumentSymbolProvider(),
    ),
  );
}

export function deactivate(): void {}
