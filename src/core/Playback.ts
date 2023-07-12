import { Config } from "../core/Config";
import { Layout } from "../core/Layout";
import { Renderer } from "../core/Renderer";
import { World } from "../core/World";

export class Playback {
  private _world: World;
  private _config: Config;
  private _layout: Layout;
  private _renderer: Renderer;
  private _lastFrameTime!: number;
  private _currentTime!: number;
  private _elapsedTime!: number;
  private _frameInterval = 1000 / 30;

  public playing = false;

  constructor(world: World, config: Config, layout: Layout, renderer: Renderer) {
    this._world = world;
    this._config = config;
    this._layout = layout;
    this._renderer = renderer;

    this.tickLazy = this.tickLazy.bind(this);
    this._tickRecursive = this._tickRecursive.bind(this);
  }

  public play(): void {
    this.playing = true;

    this._lastFrameTime = window.performance.now();

    this._tickRecursive();
  }

  public pause(): void {
    this.playing = false;
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

  private _tick(): void {
    this._world.tick(this._config);
    this._renderer.update(this._layout, this._world);
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
}
