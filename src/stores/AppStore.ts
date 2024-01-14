import { makeObservable, action } from "mobx";
import { LayoutStore } from "./LayoutStore";
import { PlaybackStore } from "./PlaybackStore";
import { World } from "../core/World";

export class AppStore {
  private _world: World;
  private _layoutStore: LayoutStore;
  private _playbackStore: PlaybackStore;

  constructor(world: World, layoutStore: LayoutStore, playbackStore: PlaybackStore) {
    this._world = world;
    this._layoutStore = layoutStore;
    this._playbackStore = playbackStore;

    this.reset = this.reset.bind(this);

    makeObservable(this, {
      reset: action,
    });

    this.reset();
  }

  public reset(): void {
    this._playbackStore.pause();
    this._world.randomize();
    this._layoutStore.zoomToFit();
  }
}
