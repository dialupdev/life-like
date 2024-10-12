import { makeObservable, action } from "mobx";
import { ConfigStore } from "./ConfigStore";
import { LayoutStore } from "./LayoutStore";
import { PlaybackStore } from "./PlaybackStore";
import { World } from "../core/World";

export class AppStore {
  private _world: World;
  private _configStore: ConfigStore;
  private _layoutStore: LayoutStore;
  private _playbackStore: PlaybackStore;

  constructor(world: World, configStore: ConfigStore, layoutStore: LayoutStore, playbackStore: PlaybackStore) {
    this._world = world;
    this._configStore = configStore;
    this._layoutStore = layoutStore;
    this._playbackStore = playbackStore;

    this.reset = this.reset.bind(this);

    makeObservable(this);

    this.reset();
  }

  @action
  public reset(): void {
    this._playbackStore.pause();
    this._world.randomize(this._configStore.fieldSize, this._configStore.averageDensity);
    this._layoutStore.zoomToFit();
  }
}
