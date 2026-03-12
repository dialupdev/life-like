import { makeObservable, observable, action } from "mobx";
import { Renderer } from "./Renderer";
import { World } from "./World";
import { getUserConfig, setUserConfig } from "../utils/UserConfigUtils";

export class Playback {
  private _world: World;
  private _renderer: Renderer;
  private _lastFrameTime!: number;
  private _currentTime!: number;
  private _elapsedTime!: number;
  private _frameInterval = 1000 / 30;

  @observable public accessor frameRate = 30;
  @observable public accessor playing = false;

  constructor(world: World, renderer: Renderer) {
    this._world = world;
    this._renderer = renderer;

    this._tickRecursive = this._tickRecursive.bind(this);
    this.pause = this.pause.bind(this);
    this.togglePlaying = this.togglePlaying.bind(this);
    this.tickLazy = this.tickLazy.bind(this);
    this.setFrameRate = this.setFrameRate.bind(this);

    getUserConfig("frameRate", (value: string) => parseInt(value, 10), this.setFrameRate);

    makeObservable(this);
  }

  private _tick(): void {
    this._world.tick();
    this._renderer.update();
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

  @action
  public setFrameRate(frameRate: number): void {
    this._frameInterval = 1000 / frameRate;

    this.frameRate = frameRate;

    setUserConfig("frameRate", frameRate.toString());
  }
}
