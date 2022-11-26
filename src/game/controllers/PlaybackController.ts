import { makeObservable, action } from "mobx";
import PlaybackModel from "../models/PlaybackModel";
import LifecycleSystem from "../systems/LifecycleSystem";
import RenderSystem from "../systems/RenderSystem";

export default class PlaybackController {
  private _playbackModel: PlaybackModel;
  private _lifecycleSystem: LifecycleSystem;
  private _renderSystem: RenderSystem;

  constructor(playbackModel: PlaybackModel, lifecycleSystem: LifecycleSystem, renderSystem: RenderSystem) {
    this._playbackModel = playbackModel;
    this._lifecycleSystem = lifecycleSystem;
    this._renderSystem = renderSystem;

    this._tickRecursive = this._tickRecursive.bind(this);
    this.tick = this.tick.bind(this);
    this.togglePlaying = this.togglePlaying.bind(this);

    makeObservable(this, {
      tick: action,
      play: action,
      pause: action,
      reset: action,
    });
  }

  private _tickRecursive(): void {
    if (this._playbackModel.playing) {
      this.tick();
      requestAnimationFrame(this._tickRecursive);
    }
  }

  public tick(): void {
    this._playbackModel.ticks++;
    this._lifecycleSystem.tick();
    this._renderSystem.tick();
  }

  public play(): void {
    this._playbackModel.playing = true;
    this._tickRecursive();
  }

  public pause(): void {
    this._playbackModel.playing = false;
  }

  public togglePlaying(): void {
    this._playbackModel.playing ? this.pause() : this.play();
  }

  public reset(): void {
    this._playbackModel.playing = false;
    this._playbackModel.ticks = 0;
  }

  public get model(): Readonly<PlaybackModel> {
    return this._playbackModel;
  }
}
