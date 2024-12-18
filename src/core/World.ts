import { Cell } from "./Cell";
import { Config } from "./Config";

export class World {
  // If JS had a way to hash entities for value comparison within a
  // map/set (rather than using reference equality), we would use
  // Cell as the Map key which would remove the need for Cell.fromHash().
  // Instead, the map key is the Szudzik pair for each cell's (x, y).
  private _neighborCounts = new Map<number, number>();

  // Same here - ideally we would use a Set for cells instead of a Map.
  // Instead, the map key is the Szudzik pair for each cell's (x ,y).
  public cells = new Map<number, Cell>();

  private _spawn(cell: Cell): void {
    for (const neighborHash of cell.generateNeighborHashes()) {
      this._incrementNeighborCount(neighborHash);
    }

    this.cells.set(cell.hash(), cell);
  }

  private _kill(cell: Cell): void {
    for (const neighborHash of cell.generateNeighborHashes()) {
      this._decrementNeighborCount(neighborHash);
    }

    this.cells.delete(cell.hash());
  }

  private _incrementNeighborCount(hash: number): void {
    const neighborCount = this._neighborCounts.get(hash);

    this._neighborCounts.set(hash, neighborCount ? neighborCount + 1 : 1);
  }

  private _decrementNeighborCount(hash: number): void {
    const neighborCountMinusOne = this._neighborCounts.get(hash)! - 1;

    if (neighborCountMinusOne === 0) {
      this._neighborCounts.delete(hash);
    } else {
      this._neighborCounts.set(hash, neighborCountMinusOne);
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
    for (const [hash, cell] of this.cells) {
      const neighborCount = this._neighborCounts.get(hash);

      if (!neighborCount || !config.survivalSet.has(neighborCount)) {
        cellsToKill.add(cell);
      }
    }

    // Mark cells to spawn
    for (const [hash, count] of this._neighborCounts) {
      if (config.birthSet.has(count) && !this.cells.has(hash)) {
        const cell = Cell.fromHash(hash);
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
