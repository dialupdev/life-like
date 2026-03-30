import { createContext } from "@lit/context";

import type { Layout } from "../core/Layout.ts";
import type { Playback } from "../core/Playback.ts";
import type { World } from "../core/World.ts";

export const appStoreContext = createContext<AppStore>("appStore");

export class AppStore {
  private _world: World;
  private _layout: Layout;
  private _playback: Playback;

  constructor(world: World, layout: Layout, playback: Playback) {
    this._world = world;
    this._layout = layout;
    this._playback = playback;

    this.randomize = this.randomize.bind(this);
    this.rewind = this.rewind.bind(this);

    this.randomize();
  }

  public randomize(): void {
    this._playback.pause();
    this._world.randomize();
    this._layout.zoomToFit();
  }

  public rewind(): void {
    this._playback.pause();
    this._world.rewind();
    this._layout.zoomToFit();
  }
}
