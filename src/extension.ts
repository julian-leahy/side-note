import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";

import NoteDataProvider from "./NoteDataProvider";

export function activate() {
  const noteDataProvider = new NoteDataProvider();

  vscode.window.createTreeView("SideNoteView", {
    treeDataProvider: noteDataProvider,
  });
}

export function deactivate() {}
