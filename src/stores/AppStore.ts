import { makeObservable, action } from "mobx";
import { LayoutStore } from "./LayoutStore";
import { Playback } from "../core/Playback";
import { World } from "../core/World";

export class AppStore {
  private _world: World;
  private _layoutStore: LayoutStore;
  private _playback: Playback;

  constructor(world: World, layoutStore: LayoutStore, playback: Playback) {
    this._world = world;
    this._layoutStore = layoutStore;
    this._playback = playback;

    this.reset = this.reset.bind(this);

    makeObservable(this, {
      reset: action,
    });

    this.reset();
  }

  public reset(): void {
    this._playback.pause();
    this._world.randomize();
    this._layoutStore.zoomToFit();
  }
}
