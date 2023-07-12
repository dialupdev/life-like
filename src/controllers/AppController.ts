import { makeObservable, action } from "mobx";
import { LayoutController } from "./LayoutController";
import { Playback } from "../core/Playback";
import { World } from "../core/World";

export class AppController {
  private _world: World;
  private _layoutController: LayoutController;
  private _playback: Playback;

  constructor(world: World, layoutController: LayoutController, playback: Playback) {
    this._world = world;
    this._layoutController = layoutController;
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
    this._layoutController.zoomToFit();
  }
}
