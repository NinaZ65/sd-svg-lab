import * as vscode from 'vscode';
import { SvgElement, SvgOutlineParser } from './SvgOutlineParser';

export class SvgDocumentSymbolProvider implements vscode.DocumentSymbolProvider {
  private readonly parser = new SvgOutlineParser();

  public provideDocumentSymbols(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.DocumentSymbol[] {
    if (token.isCancellationRequested) return [];
    return this.parser.parse(document.getText()).map(node => this.toSymbol(document, node));
  }

  private toSymbol(document: vscode.TextDocument, node: SvgElement): vscode.DocumentSymbol {
    const range = new vscode.Range(document.positionAt(node.start), document.positionAt(node.end));
    const selectionRange = new vscode.Range(document.positionAt(node.start), document.positionAt(node.openingEnd));
    const kind = node.tag === 'svg' ? vscode.SymbolKind.File
      : node.tag === 'g' ? vscode.SymbolKind.Namespace : vscode.SymbolKind.Object;
    const symbol = new vscode.DocumentSymbol(
      node.id ? `${node.tag}#${node.id}` : node.tag, '', kind, range, selectionRange,
    );
    symbol.children.push(...node.children.map(child => this.toSymbol(document, child)));
    return symbol;
  }
}
