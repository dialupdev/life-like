import { makeObservable, action } from "mobx";
import { ConfigStore } from "./ConfigStore";
import { LayoutStore } from "./LayoutStore";
import { Playback } from "../core/Playback";
import { World } from "../core/World";

export class AppStore {
  private _world: World;
  private _configStore: ConfigStore;
  private _layoutStore: LayoutStore;
  private _playback: Playback;

  constructor(world: World, playback: Playback, configStore: ConfigStore, layoutStore: LayoutStore) {
    this._world = world;
    this._playback = playback;
    this._configStore = configStore;
    this._layoutStore = layoutStore;

    this.reset = this.reset.bind(this);

    makeObservable(this);

    this.reset();
  }

  @action
  public reset(): void {
    this._playback.pause();
    this._world.randomize(this._configStore.fieldSize, this._configStore.averageDensity);
    this._layoutStore.zoomToFit();
  }
}
