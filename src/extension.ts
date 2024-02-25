import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";

import NoteDataProvider from "./NoteDataProvider";

export function activate() {
  const noteDataProvider = new NoteDataProvider();

  vscode.window.createTreeView("SideNoteView", {
    treeDataProvider: noteDataProvider,
  });

  vscode.commands.registerCommand("extension.openFile", async (uri) => {
    const document = await vscode.workspace.openTextDocument(uri);
    await vscode.window.showTextDocument(document);
  });
}

export function deactivate() {}
