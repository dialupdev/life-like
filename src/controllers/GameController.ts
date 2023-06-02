import { makeObservable, observable, action } from "mobx";
import { Layout, World, Renderer, Config } from "core";

export class GameController {
  private _world: World;
  private _config: Config;
  private _layout: Layout;
  private _renderer: Renderer;

  public playing = false;

  constructor(world: World, config: Config, layout: Layout, renderer: Renderer) {
    this._world = world;
    this._config = config;
    this._layout = layout;
    this._renderer = renderer;

    this._tickRecursive = this._tickRecursive.bind(this);
    this.tick = this.tick.bind(this);
    this.togglePlaying = this.togglePlaying.bind(this);

    makeObservable(this, {
      playing: observable,
      tick: action,
      play: action,
      pause: action,
      reset: action,
    });
  }

  private _tickRecursive(): void {
    if (this.playing) {
      this.tick();
      requestAnimationFrame(this._tickRecursive);
    }
  }

  public tick(): void {
    this._world.tick(this._config);
    this._renderer.update(this._layout, this._world);
  }

  public play(): void {
    this.playing = true;
    this._tickRecursive();
  }

  public pause(): void {
    this.playing = false;
  }

  public togglePlaying(): void {
    this.playing ? this.pause() : this.play();
  }

  public reset(): void {
    this.playing = false;
  }
}
