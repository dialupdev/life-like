import type { Cell } from "../core/Cell.ts";

export interface LifeAlgorithm {
  setRule(birthSet: Set<number>, survivalSet: Set<number>): void;

  addCell(worldX: number, worldY: number): void;
  removeCell(worldX: number, worldY: number): void;

  tick(): void;
  forEachCellInRect(minX: number, minY: number, maxX: number, maxY: number, callback: (cell: Cell) => void): void;

  clear(): void;
  saveSnapshot(): void;
  restoreSnapshot(): void;

  getPopulation(): number;
  getBounds(): [number, number, number, number];
}
