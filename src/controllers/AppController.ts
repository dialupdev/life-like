import { makeObservable, action } from "mobx";
import { LayoutController } from "./LayoutController";
import { PlaybackController } from "./PlaybackController";
import { World } from "../core/World";

export class AppController {
  private _world: World;
  private _layoutController: LayoutController;
  private _playbackController: PlaybackController;

  constructor(world: World, layoutController: LayoutController, playbackController: PlaybackController) {
    this._world = world;
    this._layoutController = layoutController;
    this._playbackController = playbackController;

    this.reset = this.reset.bind(this);

    makeObservable(this, {
      reset: action,
    });

    this.reset();
  }

  public reset(): void {
    this._playbackController.pause();
    this._world.randomize();
    this._layoutController.zoomToFit();
  }
}
