import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

class NoteDataProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
  getTreeItem(
    element: vscode.TreeItem
  ): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return element;
  }

  getChildren(
    element: vscode.TreeItem
  ): vscode.ProviderResult<vscode.TreeItem[]> {
    return;
  }
}

export default NoteDataProvider;
