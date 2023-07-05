import { makeObservable, observable, action } from "mobx";
import { LayoutController } from "./LayoutController";
import { Config } from "../core/Config";
import { Layout } from "../core/Layout";
import { Renderer } from "../core/Renderer";
import { World } from "../core/World";

export class AppController {
  private _world: World;
  private _config: Config;
  private _layout: Layout;
  private _renderer: Renderer;
  private _layoutController: LayoutController;

  public playing = false;

  constructor(world: World, config: Config, layout: Layout, renderer: Renderer, layoutController: LayoutController) {
    this._world = world;
    this._config = config;
    this._layout = layout;
    this._renderer = renderer;
    this._layoutController = layoutController;

    this._tickRecursive = this._tickRecursive.bind(this);
    this.tickLazy = this.tickLazy.bind(this);
    this.togglePlaying = this.togglePlaying.bind(this);
    this.reset = this.reset.bind(this);

    makeObservable(this, {
      playing: observable,
      tickLazy: action,
      play: action,
      pause: action,
      reset: action,
    });

    this.reset();
  }

  private _tickRecursive(): void {
    if (this.playing) {
      this._tick();
      requestAnimationFrame(this._tickRecursive);
    }
  }

  private _tick(): void {
    this._world.tick(this._config);
    this._renderer.update(this._layout, this._world);
  }

  public tickLazy(): void {
    if (this.playing) {
      return;
    }

    this._tick();
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
    this.pause();
    this._world.randomize();
    this._layoutController.zoomToFit();
  }
}
