import { makeObservable, observable } from "mobx";

export class PlaybackModel {
  public playing = false;

  constructor() {
    makeObservable(this, {
      playing: observable,
    });
  }
}
