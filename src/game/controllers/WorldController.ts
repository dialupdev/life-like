import { Cell } from "../Cell";
import { WorldModel } from "../models/WorldModel";

export class WorldController {
  private _worldModel: WorldModel;

  constructor(worldModel: WorldModel) {
    this._worldModel = worldModel;

    this.randomize();
  }

  private _reset(): void {
    this._worldModel.cells = new Map<string, Cell>();
    this._worldModel.neighborCounts = new Map<string, number>();
  }

  public randomize(): void {
    this._reset();

    for (let x = -40; x <= 40; x++) {
      for (let y = -40; y <= 40; y++) {
        if (Math.random() < 0.5) {
          this._worldModel.spawn(new Cell(x, y));
        }
      }
    }
  }
}
