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

      if (!neighborCount || neighborCount < 2 || neighborCount > 3) {
        cellsToKill.add(cell);
      }
    }

    // Mark cells to spawn
    for (const [cellHash, count] of this._world.neighborCounts) {
      if (count === 3 && !this._world.cells.has(cellHash)) {
        const cell = Cell.fromHash(cellHash);
        cellsToSpawn.add(cell);
      }
    }

    for (const cell of cellsToKill) {
      this._world.kill(cell);
    }

    for (const cell of cellsToSpawn) {
      this._world.spawn(cell);
    }
  }
}
