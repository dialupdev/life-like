import Cell from "../Cell";
import WorldModel from "../models/WorldModel";
import ConfigModel from "../models/ConfigModel";
import type { System } from "./System";

export default class LifecycleSystem implements System {
  private _worldModel: WorldModel;
  private _configModel: ConfigModel;

  constructor(worldModel: WorldModel, configModel: ConfigModel) {
    this._worldModel = worldModel;
    this._configModel = configModel;
  }

  public tick(): void {
    const cellsToKill = new Set<Cell>();
    const cellsToSpawn = new Set<Cell>();

    // Mark cells to kill
    for (const [cellHash, cell] of this._worldModel.cells) {
      const neighborCount = this._worldModel.neighborCounts.get(cellHash);

      if (!neighborCount || !this._configModel.survivalRule.has(neighborCount)) {
        cellsToKill.add(cell);
      }
    }

    // Mark cells to spawn
    for (const [cellHash, count] of this._worldModel.neighborCounts) {
      if (this._configModel.birthRule.has(count) && !this._worldModel.cells.has(cellHash)) {
        const cell = Cell.fromHash(cellHash);
        cellsToSpawn.add(cell);
      }
    }

    // Kill cells
    for (const cell of cellsToKill) {
      this._worldModel.kill(cell);
    }

    // Spawn cells
    for (const cell of cellsToSpawn) {
      this._worldModel.spawn(cell);
    }
  }
}
