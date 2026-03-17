import { makeObservable, action } from "mobx";

import type { Playback } from "../core/Playback.ts";
import type { Renderer } from "../core/Renderer.ts";
import type { World } from "../core/World.ts";

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
