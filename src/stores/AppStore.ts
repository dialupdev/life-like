import { makeObservable, action } from "mobx";
import { LayoutStore } from "./LayoutStore";
import { PlaybackStore } from "./PlaybackStore";
import { Library } from "../core/Library";
import { World } from "../core/World";

export class AppStore {
  private _world: World;
  private _library: Library;
  private _layoutStore: LayoutStore;
  private _playbackStore: PlaybackStore;

  constructor(world: World, library: Library, layoutStore: LayoutStore, playbackStore: PlaybackStore) {
    this._world = world;
    this._library = library;
    this._layoutStore = layoutStore;
    this._playbackStore = playbackStore;

    this.reset = this.reset.bind(this);

    makeObservable(this, {
      reset: action,
    });

    this.reset();
  }

  public async loadPattern(filename: string): Promise<void> {
    this._playbackStore.pause();

    try {
      const response = await fetch(`/patterns/${filename}`);
      const patternString = await response.text();

      this._library.loadPattern(patternString, this._world);

      this._layoutStore.zoomToFit();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    }
  }

  public reset(): void {
    this._playbackStore.pause();
    this._world.randomize();
    this._layoutStore.zoomToFit();
  }
}
