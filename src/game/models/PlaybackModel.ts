import { makeObservable, observable } from "mobx";

export class PlaybackModel {
  public playing = false;
  public ticks = 0;

  constructor() {
    makeObservable(this, {
      playing: observable,
    });
  }
}
