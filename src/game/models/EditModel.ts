import { makeObservable, observable } from "mobx";

export default class PositionModel {
  public editing = false;

  constructor() {
    makeObservable(this, {
      editing: observable,
    });
  }
}
