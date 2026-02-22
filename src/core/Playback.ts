import { makeObservable, observable, action } from "mobx";
import { Config } from "../core/Config";
import { Renderer } from "../core/Renderer";
import { World } from "../core/World";

export class Playback {
  private _config: Config;
  private _world: World;
  private _renderer: Renderer;
  private _lastFrameTime!: number;
  private _currentTime!: number;
  private _elapsedTime!: number;
  private _frameInterval = 1000 / 30;

  @observable public accessor playing = false;

  constructor(config: Config, world: World, renderer: Renderer) {
    this._config = config;
    this._world = world;
    this._renderer = renderer;

    this._tickRecursive = this._tickRecursive.bind(this);
    this.pause = this.pause.bind(this);
    this.togglePlaying = this.togglePlaying.bind(this);
    this.tickLazy = this.tickLazy.bind(this);

    makeObservable(this);
  }

  private _tick(): void {
    this._world.tick(this._config);
    this._renderer.update(this._world);
  }

  private _tickRecursive(): void {
    if (!this.playing) {
      return;
    }

    // Queue the next iteration of the loop
    requestAnimationFrame(this._tickRecursive);

    this._currentTime = window.performance.now();
    this._elapsedTime = this._currentTime - this._lastFrameTime;

    // If enough time has elapsed, perform the tick
    if (this._elapsedTime > this._frameInterval) {
      // Adjust for frameInterval not being a multiple of rAF's interval (16.7ms)
      this._lastFrameTime = this._currentTime - (this._elapsedTime % this._frameInterval);

      this._tick();
    }
  }

  @action
  private _play(): void {
    this.playing = true;

    this._lastFrameTime = window.performance.now();

    this._tickRecursive();
  }

  @action
  public pause(): void {
    this.playing = false;
  }

  @action
  public togglePlaying(): void {
    this.playing ? this.pause() : this._play();
  }

  public tickLazy(): void {
    if (this.playing) {
      return;
    }

    this._tick();
  }

  public setFrameRate(frameRate: number): void {
    this._frameInterval = 1000 / frameRate;
  }
}
