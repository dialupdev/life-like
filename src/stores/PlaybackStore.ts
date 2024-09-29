import { makeObservable, observable, action } from "mobx";
import { Playback } from "../core/Playback";

export class PlaybackStore {
  private _playback: Playback;

  @observable public accessor playing = false;

  constructor(playback: Playback) {
    this._playback = playback;

    this.pause = this.pause.bind(this);
    this.togglePlaying = this.togglePlaying.bind(this);
    this.tickLazy = this.tickLazy.bind(this);

    makeObservable(this);
  }

  @action
  public pause(): void {
    this._playback.pause();
    this.playing = false;
  }

  @action
  public togglePlaying(): void {
    this._playback.playing ? this._playback.pause() : this._playback.play();
    this.playing = !this.playing;
  }

  public tickLazy(): void {
    this._playback.tickLazy();
  }
}
