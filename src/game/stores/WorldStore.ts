import Cell from "../Cell";

export default class WorldStore {
  // public ticks: number;
  // If JS had a way to hash entities for comparison within a Set,
  // we could use a Set for cells instead of a Map.
  public cells: Map<string, Cell>;
  // Same here - if we could, we would use Cell as the Map key,
  // which would remove the need for Cell.fromHash().
  public neighborCounts: Map<string, number>;

  constructor() {
    this.reset();
  }

  public reset(): void {
    this.cells = new Map<string, Cell>();
    this.neighborCounts = new Map<string, number>();
  }
}
