import { makeObservable, action } from "mobx";

import { Playback } from "../core/Playback";
import { Renderer } from "../core/Renderer";
import { World } from "../core/World";

export class AppStore {
  private _world: World;
  private _renderer: Renderer;
  private _playback: Playback;

  constructor(world: World, renderer: Renderer, playback: Playback) {
    this._world = world;
    this._renderer = renderer;
    this._playback = playback;

    this.reset = this.reset.bind(this);

    makeObservable(this);

    this.reset();
  }

  @action
  public reset(): void {
    this._playback.pause();
    this._world.randomize();
    this._renderer.zoomToFit();
  }
}
