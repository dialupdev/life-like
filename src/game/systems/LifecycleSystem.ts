import World from "../World";
import Cell from "../Cell";
import type { System } from "./System";

export default class LifecycleSystem implements System {
  private _world: World;

  constructor(world: World) {
    this._world = world;
  }

  private _incrementNeighborCount(cell: Cell): void {
    const neighborCount = this._world.neighborCounts.get(cell.hash());
    this._world.neighborCounts.set(cell.hash(), neighborCount ? neighborCount + 1 : 1);
  }

  private _decrementNeighborCount(cell: Cell): void {
    const neighborCountMinusOne = this._world.neighborCounts.get(cell.hash()) - 1;

    if (neighborCountMinusOne === 0) {
      this._world.neighborCounts.delete(cell.hash());
    } else {
      this._world.neighborCounts.set(cell.hash(), neighborCountMinusOne);
    }
  }

  private _kill(cell: Cell): void {
    for (const neighbor of cell.generateNeighbors()) {
      this._decrementNeighborCount(neighbor);
    }

    this._world.cells.delete(cell.hash());
  }

  public spawn(cell: Cell): void {
    for (const neighbor of cell.generateNeighbors()) {
      this._incrementNeighborCount(neighbor);
    }

    this._world.cells.set(cell.hash(), cell);
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
      this._kill(cell);
    }

    // Spawn cells
    for (const cell of cellsToSpawn) {
      this.spawn(cell);
    }
  }
}
