import { makeObservable, observable } from "mobx";

export enum Tool {
  Pencil = "Pencil",
  Eraser = "Eraser",
}

export class EditModel {
  public editing = false;
  public activeTool = Tool.Pencil;

  constructor() {
    makeObservable(this, {
      editing: observable,
      activeTool: observable,
    });
  }
}
