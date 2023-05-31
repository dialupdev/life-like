import { makeObservable, action } from "mobx";
import { Layout, World, Renderer, Config } from "core";
import { PlaybackModel } from "../models/PlaybackModel";

export class PlaybackController {
  private _world: World;
  private _config: Config;
  private _layout: Layout;
  private _renderer: Renderer;
  private _playbackModel: PlaybackModel;

  constructor(world: World, config: Config, layout: Layout, playbackModel: PlaybackModel, renderer: Renderer) {
    this._world = world;
    this._config = config;
    this._layout = layout;
    this._renderer = renderer;
    this._playbackModel = playbackModel;

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
    this._world.tick(this._config);
    this._renderer.update(this._layout, this._world);
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
  }

  public get model(): Readonly<PlaybackModel> {
    return this._playbackModel;
  }
}
