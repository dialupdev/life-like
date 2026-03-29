import { createContext } from "@lit/context";
import { makeObservable, observable, action } from "mobx";

import { parseRule, getRuleKeyByValue } from "../utils/RuleUtils.ts";
import { getUserConfig, setUserConfig } from "../utils/UserConfigUtils.ts";
import { Cell } from "./Cell.ts";
import { Rule } from "./Rules.ts";

import type { RuleKey } from "../utils/RuleUtils.ts";

export const worldContext = createContext<World>("world");

export class World {
  private _birthSet!: Set<number>;
  private _survivalSet!: Set<number>;

  private _neighborCountsStartState = new Map<number, number>();
  private _cellsStartState = new Map<number, Cell>();

  // If JS had a way to hash entities for value comparison within a
  // map/set (rather than using reference equality), we would use
  // Cell as the Map key which would remove the need for Cell.fromHash().
  // Instead, the map key is the Szudzik pair for each cell's (x, y).
  private _neighborCounts = new Map<number, number>();

  // Same here - ideally we would use a Set for cells instead of a Map.
  // Instead, the map key is the Szudzik pair for each cell's (x ,y).
  public cells = new Map<number, Cell>();

  @observable public accessor generation = 0;
  @observable public accessor population = 0;

  @observable public accessor rule = Rule.life;
  @observable public accessor randomizeFieldSize = 100;
  @observable public accessor randomizeAverageDensity = 0.5;

  constructor() {
    [this._birthSet, this._survivalSet] = parseRule(this.rule);

    this.setRule = this.setRule.bind(this);
    this.setRandomizeFieldSize = this.setRandomizeFieldSize.bind(this);
    this.setRandomizeAverageDensity = this.setRandomizeAverageDensity.bind(this);

    getUserConfig("rule", (value: string) => Rule[value as RuleKey], this.setRule);
    getUserConfig("randomizeFieldSize", (value: string) => parseInt(value, 10), this.setRandomizeFieldSize);
    getUserConfig("randomizeAverageDensity", (value: string) => parseFloat(value), this.setRandomizeAverageDensity);

    makeObservable(this);
  }

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

  @action
  public setRule(rule: Rule): void {
    [this._birthSet, this._survivalSet] = parseRule(rule);

    this.rule = rule;

    setUserConfig("rule", getRuleKeyByValue(rule));
  }

  @action
  public setRandomizeFieldSize(randomizeFieldSize: number): void {
    this.randomizeFieldSize = randomizeFieldSize;

    setUserConfig("randomizeFieldSize", randomizeFieldSize.toString());
  }

  @action
  public setRandomizeAverageDensity(randomizeAverageDensity: number): void {
    this.randomizeAverageDensity = randomizeAverageDensity;

    setUserConfig("randomizeAverageDensity", randomizeAverageDensity.toString());
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

  public randomize(): void {
    this.clear();

    const min = Math.floor(this.randomizeFieldSize / 2) * -1;
    const max = min + this.randomizeFieldSize;

    for (let worldX = min; worldX < max; worldX++) {
      for (let worldY = min; worldY < max; worldY++) {
        if (Math.random() < this.randomizeAverageDensity) {
          this.addCell(worldX, worldY);
        }
      }
    }

    this.saveStartState();
  }

  @action
  public saveStartState(): void {
    this._neighborCountsStartState = new Map(this._neighborCounts);
    this._cellsStartState = new Map(this.cells);

    this.generation = 0;
    this.population = this.cells.size;
  }

  @action
  public rewind(): void {
    this._neighborCounts = new Map(this._neighborCountsStartState);
    this.cells = new Map(this._cellsStartState);

    this.generation = 0;
    this.population = this.cells.size;
  }

  @action
  public tick(): void {
    const cellsToKill = new Set<Cell>();
    const cellsToSpawn = new Set<Cell>();

    // Mark cells to kill
    for (const [hash, cell] of this.cells) {
      const neighborCount = this._neighborCounts.get(hash);

      if (!neighborCount || !this._survivalSet.has(neighborCount)) {
        cellsToKill.add(cell);
      }
    }

    // Mark cells to spawn
    for (const [hash, count] of this._neighborCounts) {
      if (this._birthSet.has(count) && !this.cells.has(hash)) {
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

    this.generation++;
    this.population = this.cells.size;
  }

  public getBounds(): [number, number, number, number] {
    let min_x = Number.MAX_VALUE;
    let max_x = Number.MAX_VALUE * -1;
    let min_y = Number.MAX_VALUE;
    let max_y = Number.MAX_VALUE * -1;

    this.cells.forEach((cell) => {
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
