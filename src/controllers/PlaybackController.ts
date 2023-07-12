import { makeObservable, observable, action } from "mobx";
import { Config } from "../core/Config";
import { Layout } from "../core/Layout";
import { Renderer } from "../core/Renderer";
import { World } from "../core/World";

export class PlaybackController {
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

    this.togglePlaying = this.togglePlaying.bind(this);
    this.tickLazy = this.tickLazy.bind(this);
    this._tickRecursive = this._tickRecursive.bind(this);

    makeObservable(this, {
      playing: observable,
      play: action,
      pause: action,
      tickLazy: action,
    });
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

  public tickLazy(): void {
    if (this.playing) {
      return;
    }

    this._tick();
  }

  private _tick(): void {
    this._world.tick(this._config);
    this._renderer.update(this._layout, this._world);
  }

  private _tickRecursive(): void {
    if (this.playing) {
      this._tick();
      requestAnimationFrame(this._tickRecursive);
    }
  }
}
