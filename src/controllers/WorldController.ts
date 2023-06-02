import { World } from "core";

export class WorldController {
  private _world: World;

  constructor(world: World) {
    this._world = world;

    this.randomize();
  }

  public randomize(): void {
    this._world.randomize();
  }
}
