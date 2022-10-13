import Cell, { CellHash } from "./Cell";
import type { System } from "./systems/System";

export default class World {
  private _systems = new Set<System>();

  // If JS had a way to hash entities for comparison within a Set,
  // we could use a Set for cells instead of a Map.
  public cells = new Map<CellHash, Cell>();
  // Same here - if we could, we would use Cell as the Map key,
  // which would remove the need for Cell.fromHash().
  public cellNeighborCounts = new Map<CellHash, number>();

  private _incrementNeighborCount(cell: Cell): void {
    const neighborCount = this.cellNeighborCounts.get(cell.hash());
    this.cellNeighborCounts.set(cell.hash(), neighborCount ? neighborCount + 1 : 1);
  }

  private _decrementNeighborCount(cell: Cell): void {
    const neighborCountMinusOne = this.cellNeighborCounts.get(cell.hash()) - 1;

    if (neighborCountMinusOne === 0) {
      this.cellNeighborCounts.delete(cell.hash());
    } else {
      this.cellNeighborCounts.set(cell.hash(), neighborCountMinusOne);
    }
  }

  public spawn(cell: Cell): void {
    for (const neighbor of cell.generateNeighbors()) {
      this._incrementNeighborCount(neighbor);
    }

    this.cells.set(cell.hash(), cell);
  }

  public kill(cell: Cell): void {
    for (const neighbor of cell.generateNeighbors()) {
      this._decrementNeighborCount(neighbor);
    }

    this.cells.delete(cell.hash());
  }

  public createCell(x: number, y: number): Cell {
    const cell = new Cell(x, y);
    this.spawn(cell);

    return cell;
  }

  public registerSystem(system: any): void {
    this._systems.add(system);
  }

  public tick(): void {
    for (const system of this._systems) {
      system.tick();
    }
  }
}
