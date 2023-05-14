import Cell from "../Cell";

export default class WorldModel {
  // If JS had a way to hash entities for comparison within a Set,
  // we could use a Set for cells instead of a Map.
  public cells = new Map<string, Cell>();
  // Same here - if we could, we would use Cell as the Map key,
  // which would remove the need for Cell.fromHash().
  public neighborCounts = new Map<string, number>();

  private _incrementNeighborCount(cell: Cell): void {
    const neighborCount = this.neighborCounts.get(cell.hash());
    this.neighborCounts.set(cell.hash(), neighborCount ? neighborCount + 1 : 1);
  }

  private _decrementNeighborCount(cell: Cell): void {
    const neighborCountMinusOne = this.neighborCounts.get(cell.hash())! - 1;

    if (neighborCountMinusOne === 0) {
      this.neighborCounts.delete(cell.hash());
    } else {
      this.neighborCounts.set(cell.hash(), neighborCountMinusOne);
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
}
