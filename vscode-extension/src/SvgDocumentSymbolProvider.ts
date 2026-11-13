import * as vscode from 'vscode';
import { SvgElement, SvgOutlineParser } from './SvgOutlineParser';
import { outlineDetail } from './SvgOutlineDetails';

export class SvgDocumentSymbolProvider implements vscode.DocumentSymbolProvider {
  private readonly parser = new SvgOutlineParser();
  private readonly containers = new Set(['g', 'defs', 'symbol', 'clipPath', 'mask', 'pattern', 'marker', 'a', 'switch']);

  public provideDocumentSymbols(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.DocumentSymbol[] {
    if (token.isCancellationRequested) return [];
    return this.parser.parse(document.getText()).map(node => this.toSymbol(document, node));
  }

  private toSymbol(document: vscode.TextDocument, node: SvgElement): vscode.DocumentSymbol {
    // The full element owns its subtree; navigation selects only the opening tag.
    // Keep source offsets in UTF-16 and let TextDocument handle line endings.
    const range = new vscode.Range(document.positionAt(node.start), document.positionAt(node.end));
    const selectionRange = new vscode.Range(document.positionAt(node.start), document.positionAt(node.openingEnd));
    const kind = node.tag === 'svg' ? vscode.SymbolKind.File
      : this.containers.has(node.tag) ? vscode.SymbolKind.Array
      : ['text', 'tspan', 'textPath'].includes(node.tag) ? vscode.SymbolKind.String : vscode.SymbolKind.Object;
    const symbol = new vscode.DocumentSymbol(
      node.id ? `${node.tag}#${node.id}` : node.tag, outlineDetail(node), kind, range, selectionRange,
    );
    symbol.children.push(...node.children.map(child => this.toSymbol(document, child)));
    return symbol;
  }
}
