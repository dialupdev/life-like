import { observable, makeObservable, action } from "mobx";
import Cell from "./Cell";
import LifecycleSystem from "./systems/LifecycleSystem";
import RenderSystem, { RenderConstants } from "./systems/RenderSystem";
import { Rule } from "./Rules";
import { downloadImageFromBase64 } from "../utils/DownloadUtils";

export default class World {
  private _canvas: HTMLCanvasElement;
  private _lifecycleSystem: LifecycleSystem;
  private _renderSystem: RenderSystem;

  // If JS had a way to hash entities for comparison within a Set,
  // we could use a Set for cells instead of a Map.
  public cells = new Map<string, Cell>();
  // Same here - if we could, we would use Cell as the Map key,
  // which would remove the need for Cell.fromHash().
  public neighborCounts = new Map<string, number>();

  public ticks = 0;

  @observable
  public isPlaying: boolean = false;

  constructor(rule: Rule, canvas: HTMLCanvasElement, constants: RenderConstants) {
    this._canvas = canvas;
    this._lifecycleSystem = new LifecycleSystem(this, rule);
    this._renderSystem = new RenderSystem(this, canvas.getContext("2d"), constants);

    makeObservable(this);
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

  public createCell(x: number, y: number): Cell {
    const cell = new Cell(x, y);
    this.spawn(cell);

    return cell;
  }

  public renderBeforeFirstTick(): void {
    if (this.ticks > 0) {
      return;
    }

    this._renderSystem.tick();
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

  public downloadImage(): void {
    const base64Data = this._canvas.toDataURL("image/png");
    downloadImageFromBase64(base64Data, `life-like-${this.ticks}.png`);
  }
}
