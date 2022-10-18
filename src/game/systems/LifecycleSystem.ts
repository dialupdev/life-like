import World from "../World";
import Cell from "../Cell";
import type { System } from "./System";

export default class LifecycleSystem implements System {
  private _world: World;

  constructor(world: World) {
    this._world = world;
  }

  public tick(): void {
    const cellsToKill = new Set<Cell>();
    const cellsToSpawn = new Set<Cell>();

    // Mark cells to kill
    for (const [cellHash, cell] of this._world.cells) {
      const neighborCount = this._world.neighborCounts.get(cellHash);

      if (!neighborCount || !this._world.survivalRule.has(neighborCount)) {
        cellsToKill.add(cell);
      }
    }

    // Mark cells to spawn
    for (const [cellHash, count] of this._world.neighborCounts) {
      if (this._world.birthRule.has(count) && !this._world.cells.has(cellHash)) {
        const cell = Cell.fromHash(cellHash);
        cellsToSpawn.add(cell);
      }
    }

    // Kill cells
    for (const cell of cellsToKill) {
      this._world.kill(cell);
    }

    // Spawn cells
    for (const cell of cellsToSpawn) {
      this._world.spawn(cell);
    }
  }
}
