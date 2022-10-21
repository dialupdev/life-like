import { observable, makeObservable, action } from "mobx";
import Cell from "./Cell";
import LifecycleSystem from "./systems/LifecycleSystem";
import RenderSystem, { RenderConstants } from "./systems/RenderSystem";
import { Rule } from "./Rules";
import { parseRule } from "../utils/RuleUtils";
import { downloadImageFromBase64 } from "../utils/DownloadUtils";

export default class World {
  private _canvas: HTMLCanvasElement;
  private _lifecycleSystem: LifecycleSystem;
  private _renderSystem: RenderSystem;
  private _constants: RenderConstants;

  public birthRule: Set<number>;
  public survivalRule: Set<number>;

  // If JS had a way to hash entities for comparison within a Set,
  // we could use a Set for cells instead of a Map.
  public cells: Map<string, Cell>;
  // Same here - if we could, we would use Cell as the Map key,
  // which would remove the need for Cell.fromHash().
  public neighborCounts: Map<string, number>;

  public ticks: number;

  @observable
  public rule: Rule;

  @observable
  public showGridLines: boolean = true;

  @observable
  public isPlaying: boolean = false;

  constructor(canvas: HTMLCanvasElement, constants: RenderConstants) {
    this._canvas = canvas;
    this._lifecycleSystem = new LifecycleSystem(this);
    this._renderSystem = new RenderSystem(this, canvas.getContext("2d"), constants);
    this._constants = constants;

    this.setRule(Rule.life);
    this.reset();

    makeObservable(this);
  }

  private _createCell(x: number, y: number): Cell {
    const cell = new Cell(x, y);
    this.spawn(cell);

    return cell;
  }

  private _autoTick() {
    if (this.isPlaying) {
      this.tick();
      requestAnimationFrame(this._autoTick.bind(this));
    }
  }

  private _incrementNeighborCount(cell: Cell): void {
    const neighborCount = this.neighborCounts.get(cell.hash());
    this.neighborCounts.set(cell.hash(), neighborCount ? neighborCount + 1 : 1);
  }

  private _decrementNeighborCount(cell: Cell): void {
    const neighborCountMinusOne = this.neighborCounts.get(cell.hash()) - 1;

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

  public tick(): void {
    this.ticks++;

    this._lifecycleSystem.tick();
    this._renderSystem.tick();
  }

  @action
  public play(): void {
    this.isPlaying = true;
    requestAnimationFrame(this._autoTick.bind(this));
  }

  @action
  public pause(): void {
    this.isPlaying = false;
  }

  @action
  public setRule(rule: Rule): void {
    this.rule = rule;

    [this.birthRule, this.survivalRule] = parseRule(rule);
  }

  @action
  public setShowGridLines(showGridLines: boolean): void {
    this.showGridLines = showGridLines;

    this._renderSystem.tick();
  }

  public reset(): void {
    this.ticks = 0;
    this.cells = new Map<string, Cell>();
    this.neighborCounts = new Map<string, number>();

    // Randomized grid
    for (let x = 0; x < this._constants.GRID_WIDTH; x++) {
      for (let y = 0; y < this._constants.GRID_HEIGHT; y++) {
        if (Math.random() < 0.5) {
          this._createCell(x, y);
        }
      }
    }

    this._renderSystem.tick();
  }

  public downloadImage(): void {
    const base64Data = this._canvas.toDataURL("image/png");
    downloadImageFromBase64(base64Data, `life-like-${this.ticks}.png`);
  }
}
