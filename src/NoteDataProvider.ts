import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

class NoteDataProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
  // listen for changes in the tree view
  private _onDidChangeTreeData: vscode.EventEmitter<
    vscode.TreeItem | undefined | null | void
  > = new vscode.EventEmitter<vscode.TreeItem | undefined | null | void>();

  readonly onDidChangeTreeData: vscode.Event<
    vscode.TreeItem | undefined | null | void
  > = this._onDidChangeTreeData.event;

  // path to local dir where note are located
  private noteDir: string;

  constructor() {
    this.noteDir = vscode.workspace
      .getConfiguration()
      .get("storage.path") as string;
  }

  // call this anytime to refresh tree view
  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  // this needs to be implemented (interface) but not required for extension
  // so just return what it is given
  getTreeItem(
    element: vscode.TreeItem
  ): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return element;
  }

  getChildren(
    element: vscode.TreeItem
  ): vscode.ProviderResult<vscode.TreeItem[]> {
    // check the dir to where the notes will be stored exists!
    if (!fs.existsSync(this.noteDir)) {
      vscode.window.showInformationMessage("Set the storage path in settings!");
      return Promise.resolve([]);
    }

    // array of all files in this directory
    const files = fs.readdirSync(this.noteDir);
    return files
      .filter((file) => {
        const ext = path.extname(file).toLowerCase();
        const isDirectory = fs
          .statSync(path.join(this.noteDir, file))
          .isDirectory();
        return (
          !file.startsWith(".") &&
          ![".png", ".jpeg", ".webp", ".jpg"].includes(ext) &&
          !isDirectory
        );
      })
      .sort((a, b) => {
        const extA = path.extname(a);
        const extB = path.extname(b);
        return extA.localeCompare(extB);
      })
      .map((file) => {
        const treeItem = new vscode.TreeItem(path.basename(file));
        treeItem.resourceUri = vscode.Uri.file(path.join(this.noteDir, file));
        treeItem.command = {
          command: "extension.openFile",
          title: "Open File",
          arguments: [treeItem.resourceUri],
        };
        return treeItem;
      });
  }
}

export default NoteDataProvider;
