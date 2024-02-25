import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";

import NoteDataProvider from "./NoteDataProvider";

let selectedFile: vscode.TreeItem | undefined;

export function activate(context: vscode.ExtensionContext) {
  const noteDataProvider = new NoteDataProvider();

  const treeView = vscode.window.createTreeView("SideNoteView", {
    treeDataProvider: noteDataProvider,
  });

  treeView.onDidChangeSelection((e) => {
    selectedFile = e.selection[0];
  });

  const noteDir = vscode.workspace
    .getConfiguration()
    .get("storage.path") as string;

  function ensureFileExtension(filename: string) {
    if (!filename.includes(".")) {
      filename += ".txt";
    }
    return filename;
  }

  function ensureFileIsUnique(path: string) {
    if (fs.existsSync(path)) {
      vscode.window.showInformationMessage("File already exists 🙊");
      return false;
    }
    return true;
  }

  context.subscriptions.push(
    vscode.commands.registerCommand("sideNote.refreshView", async () => {
      // refresh to show new tree item (file added directly into noteDir)
      noteDataProvider.refresh();
    }),

    vscode.commands.registerCommand("sideNote.createFile", async () => {
      let fileName = await vscode.window.showInputBox({
        prompt: "Enter the name of the new note",
      });
      if (!fileName) {
        return;
      }
      fileName = ensureFileExtension(fileName);
      const newFilePath = path.join(noteDir, `${fileName}`);
      const newFileUri = vscode.Uri.file(newFilePath);
      if (!ensureFileIsUnique(newFileUri.fsPath)) {
        return;
      }
      // create a new and empty file
      fs.writeFileSync(newFileUri.fsPath, "");
      // open new file in editor
      const document = await vscode.workspace.openTextDocument(newFileUri);
      await vscode.window.showTextDocument(document);
      // refresh to show new tree item (file)
      noteDataProvider.refresh();
    }),

    vscode.commands.registerCommand("sideNote.deleteFile", async () => {
      if (!selectedFile) {
        vscode.window.showErrorMessage("No file selected 🙊");
        return;
      }
      let file = selectedFile as vscode.TreeItem;

      const uri = file.resourceUri as vscode.Uri;
      const fileName = path.basename(uri.fsPath);

      const confirm = await vscode.window.showWarningMessage(
        `Are you sure you want to delete "${fileName}"?`,
        { modal: true },
        "Yes",
        "No"
      );

      if (confirm === "Yes") {
        try {
          fs.unlinkSync(uri.fsPath);
          vscode.window.showInformationMessage("File deleted successfully.");
          noteDataProvider.refresh();
          // if deleted file was open in text editor - remove it
          for (const doc of vscode.workspace.textDocuments) {
            if (doc.uri.fsPath === uri.fsPath) {
              await vscode.commands.executeCommand(
                "workbench.action.closeActiveEditor"
              );
              break;
            }
          }
        } catch (error) {
          const errorMessage = `Failed to delete file: ${
            (error as Error).message
          }`;
          vscode.window.showErrorMessage(errorMessage);
        }
      }
    }),

    vscode.commands.registerCommand("extension.openFile", async (uri) => {
      const document = await vscode.workspace.openTextDocument(uri);
      if (!document) {
        vscode.window.showErrorMessage("Failed to open file 🙊");
        return;
      }
      await vscode.window.showTextDocument(document);
    }),

    vscode.commands.registerCommand("sideNote.renameFile", async () => {
      if (!selectedFile) {
        vscode.window.showErrorMessage("No file selected 🙊");
        return;
      }
      let file = selectedFile as vscode.TreeItem;

      const uri = file.resourceUri as vscode.Uri;
      const oldFileName = path.basename(uri.fsPath);

      let newFileName = await vscode.window.showInputBox({
        prompt: "Enter the new name for the note",
        value: oldFileName,
      });
      if (!newFileName) {
        return;
      }
      newFileName = ensureFileExtension(newFileName);
      const newFilePath = path.join(noteDir, `${newFileName}`);
      const newFileUri = vscode.Uri.file(newFilePath);
      if (!ensureFileIsUnique(newFileUri.fsPath)) {
        return;
      }
      // rename the file
      fs.renameSync(uri.fsPath, newFileUri.fsPath);
      // refresh to show new tree item (file)
      noteDataProvider.refresh();
    })
  );
}

export function deactivate() {}
