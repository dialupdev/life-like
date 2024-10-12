import { Cell } from "./Cell";
import { Config } from "./Config";

export class World {
  // Same here - if we could, we would use Cell as the Map key,
  // which would remove the need for Cell.fromHash().
  private _neighborCounts = new Map<string, number>();

  // If JS had a way to hash entities for comparison within a Set,
  // we could use a Set for cells instead of a Map.
  public cells = new Map<string, Cell>();

  private _spawn(cell: Cell): void {
    for (const neighbor of cell.generateNeighbors()) {
      this._incrementNeighborCount(neighbor);
    }

    this.cells.set(cell.hash(), cell);
  }

  private _kill(cell: Cell): void {
    for (const neighbor of cell.generateNeighbors()) {
      this._decrementNeighborCount(neighbor);
    }

    this.cells.delete(cell.hash());
  }

  private _incrementNeighborCount(cell: Cell): void {
    const neighborCount = this._neighborCounts.get(cell.hash());
    this._neighborCounts.set(cell.hash(), neighborCount ? neighborCount + 1 : 1);
  }

  private _decrementNeighborCount(cell: Cell): void {
    const neighborCountMinusOne = this._neighborCounts.get(cell.hash())! - 1;

    if (neighborCountMinusOne === 0) {
      this._neighborCounts.delete(cell.hash());
    } else {
      this._neighborCounts.set(cell.hash(), neighborCountMinusOne);
    }
  }

  public addCell(worldX: number, worldY: number): void {
    const cell = new Cell(worldX, worldY);
    this._spawn(cell);
  }

  public removeCell(worldX: number, worldY: number): void {
    const cell = new Cell(worldX, worldY);
    this._kill(cell);
  }

  public clear(): void {
    this.cells.clear();
    this._neighborCounts.clear();
  }

  public randomize(fieldSize: number, averageDensity: number): void {
    this.clear();

    const halfFieldSize = fieldSize / 2;

    for (let x = -halfFieldSize; x < halfFieldSize; x++) {
      for (let y = -halfFieldSize; y < halfFieldSize; y++) {
        if (Math.random() < averageDensity) {
          this.addCell(x, y);
        }
      }
    }
  }

  public tick(config: Config): void {
    const cellsToKill = new Set<Cell>();
    const cellsToSpawn = new Set<Cell>();

    // Mark cells to kill
    for (const [cellHash, cell] of this.cells) {
      const neighborCount = this._neighborCounts.get(cellHash);

      if (!neighborCount || !config.survivalSet.has(neighborCount)) {
        cellsToKill.add(cell);
      }
    }

    // Mark cells to spawn
    for (const [cellHash, count] of this._neighborCounts) {
      if (config.birthSet.has(count) && !this.cells.has(cellHash)) {
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
      this._spawn(cell);
    }
  }

  public getBounds(): [number, number, number, number] {
    let min_x = Number.MAX_VALUE;
    let max_x = Number.MAX_VALUE * -1;
    let min_y = Number.MAX_VALUE;
    let max_y = Number.MAX_VALUE * -1;

    this.cells.forEach(cell => {
      min_x = Math.min(min_x, cell.x);
      max_x = Math.max(max_x, cell.x);
      min_y = Math.min(min_y, cell.y);
      max_y = Math.max(max_y, cell.y);
    });

    // Add 1 to each of these to account for the size of the final cell in the row or column
    const width = max_x - min_x + 1;
    const height = max_y - min_y + 1;

    // x, y, width, height
    return [min_x, min_y, width, height];
  }
}
