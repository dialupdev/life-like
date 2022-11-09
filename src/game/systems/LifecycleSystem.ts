import Cell from "../Cell";
import WorldStore from "../stores/WorldStore";
import ConfigStore from "../stores/ConfigStore";
import type { System } from "./System";

export default class LifecycleSystem implements System {
  private _worldStore: WorldStore;
  private _configStore: ConfigStore;

  constructor(worldStore: WorldStore, configStore: ConfigStore) {
    this._worldStore = worldStore;
    this._configStore = configStore;
  }

  public tick(): void {
    const cellsToKill = new Set<Cell>();
    const cellsToSpawn = new Set<Cell>();

    // Mark cells to kill
    for (const [cellHash, cell] of this._worldStore.cells) {
      const neighborCount = this._worldStore.neighborCounts.get(cellHash);

      if (!neighborCount || !this._configStore.survivalRule.has(neighborCount)) {
        cellsToKill.add(cell);
      }
    }

    // Mark cells to spawn
    for (const [cellHash, count] of this._worldStore.neighborCounts) {
      if (this._configStore.birthRule.has(count) && !this._worldStore.cells.has(cellHash)) {
        const cell = Cell.fromHash(cellHash);
        cellsToSpawn.add(cell);
      }
    }

    // Kill cells
    for (const cell of cellsToKill) {
      this._worldStore.kill(cell);
    }

    // Spawn cells
    for (const cell of cellsToSpawn) {
      this._worldStore.spawn(cell);
    }
  }
}
