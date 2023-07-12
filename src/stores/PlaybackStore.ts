import { makeObservable, observable, action } from "mobx";
import { Playback } from "../core/Playback";

export class PlaybackStore {
  private _playback: Playback;

  public frameRate = 24;
  public playing = false;

  constructor(playback: Playback) {
    this._playback = playback;

    this.togglePlaying = this.togglePlaying.bind(this);
    this.tickLazy = this.tickLazy.bind(this);

    makeObservable(this, {
      frameRate: observable,
      playing: observable,
      togglePlaying: action,
      setFrameRate: action,
    });

    this.setFrameRate(24);
  }

  public togglePlaying(): void {
    this._playback.playing ? this._playback.pause() : this._playback.play();

    this.playing = !this.playing;
  }

  public tickLazy(): void {
    this._playback.tickLazy();
  }

  public getFrameRate(): number {
    return this._playback.getFrameRate();
  }

  public setFrameRate(frameRate: number): void {
    this._playback.setFrameRate(frameRate);

    this.frameRate = frameRate;
  }
}
