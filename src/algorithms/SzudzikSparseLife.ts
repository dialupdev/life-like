import { Cell } from "../core/Cell.ts";

import type { LifeAlgorithm } from "./LifeAlgorithm.ts";

export class SzudzikSparseLife implements LifeAlgorithm {
  private _birthSet!: Set<number>;
  private _survivalSet!: Set<number>;

  // If JS had a way to hash entities for value comparison within a
  // map/set (rather than using reference equality), we would use
  // Cell as the Map key which would remove the need for Cell.fromHash().
  // Instead, the map key is the Szudzik pair for each cell's (x, y).
  private _neighborCounts = new Map<number, number>();

  // Same here - ideally we would use a Set for cells instead of a Map.
  // Instead, the map key is the Szudzik pair for each cell's (x ,y).
  private _cells = new Map<number, Cell>();

  private _neighborCountsSnapshot = new Map<number, number>();
  private _cellsSnapshot = new Map<number, Cell>();

  constructor() {
    this._birthSet = new Set();
    this._survivalSet = new Set();
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

  private _spawn(cell: Cell): void {
    for (const neighborHash of cell.generateNeighborHashes()) {
      this._incrementNeighborCount(neighborHash);
    }

    this._cells.set(cell.hash(), cell);
  }

  private _kill(cell: Cell): void {
    for (const neighborHash of cell.generateNeighborHashes()) {
      this._decrementNeighborCount(neighborHash);
    }

    this._cells.delete(cell.hash());
  }

  public setRule(birthSet: Set<number>, survivalSet: Set<number>): void {
    this._birthSet = birthSet;
    this._survivalSet = survivalSet;
  }

  public addCell(worldX: number, worldY: number): void {
    const cell = new Cell(worldX, worldY);
    this._spawn(cell);
  }

  public removeCell(worldX: number, worldY: number): void {
    const cell = new Cell(worldX, worldY);
    this._kill(cell);
  }

  public tick(): void {
    const cellsToKill = new Set<Cell>();
    const cellsToSpawn = new Set<Cell>();

    // Mark cells to kill
    for (const [hash, cell] of this._cells) {
      const neighborCount = this._neighborCounts.get(hash);

      if (!neighborCount || !this._survivalSet.has(neighborCount)) {
        cellsToKill.add(cell);
      }
    }

    // Mark cells to spawn
    for (const [hash, count] of this._neighborCounts) {
      if (this._birthSet.has(count) && !this._cells.has(hash)) {
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

  public forEachCellInRect(
    minX: number,
    minY: number,
    maxX: number,
    maxY: number,
    callback: (cell: Cell) => void
  ): void {
    for (const [, cell] of this._cells) {
      if (cell.x >= minX && cell.x <= maxX && cell.y >= minY && cell.y <= maxY) {
        callback(cell);
      }
    }
  }

  public clear(): void {
    this._cells.clear();
    this._neighborCounts.clear();
  }

  public saveSnapshot(): void {
    this._neighborCountsSnapshot = new Map(this._neighborCounts);
    this._cellsSnapshot = new Map(this._cells);
  }

  public restoreSnapshot(): void {
    this._neighborCounts = new Map(this._neighborCountsSnapshot);
    this._cells = new Map(this._cellsSnapshot);
  }

  public getPopulation(): number {
    return this._cells.size;
  }

  public getBounds(): [number, number, number, number] {
    let minX = Number.MAX_VALUE;
    let maxX = Number.MAX_VALUE * -1;
    let minY = Number.MAX_VALUE;
    let maxY = Number.MAX_VALUE * -1;

    for (const [, cell] of this._cells) {
      minX = Math.min(minX, cell.x);
      maxX = Math.max(maxX, cell.x);
      minY = Math.min(minY, cell.y);
      maxY = Math.max(maxY, cell.y);
    }

    // Add 1 to each of these to account for the size of the final cell in the row or column
    const width = maxX - minX + 1;
    const height = maxY - minY + 1;

    // x, y, width, height
    return [minX, minY, width, height];
  }
}
