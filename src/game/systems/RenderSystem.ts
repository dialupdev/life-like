import WorldStore from "../stores/WorldStore";
import DimensionsStore from "../stores/DimensionsStore";
import type { System } from "./System";

export default class RenderSystem implements System {
  private _worldStore: WorldStore;
  private _dimensionsStore: DimensionsStore;
  private _context: CanvasRenderingContext2D;

  constructor(worldStore: WorldStore, dimensionsStore: DimensionsStore, context: CanvasRenderingContext2D) {
    this._worldStore = worldStore;
    this._dimensionsStore = dimensionsStore;
    this._context = context;

    this._context.textBaseline = "top";
    this._context.font = "22px monospace";
  }

  private _clearBoard(): void {
    this._context.clearRect(
      0,
      0,
      this._dimensionsStore.gridWidth * this._dimensionsStore.cellSize,
      this._dimensionsStore.gridHeight * this._dimensionsStore.cellSize
    );
  }

  private _drawCell(x: number, y: number): void {
    this._context.fillStyle = "rgb(10, 90, 70)";
    this._context.fillRect(
      this._dimensionsStore.cellSize * x,
      this._dimensionsStore.cellSize * y,
      this._dimensionsStore.cellSize,
      this._dimensionsStore.cellSize
    );
  }

  public tick(): void {
    this._clearBoard();

    for (const cell of this._worldStore.cells.values()) {
      this._drawCell(cell.x, cell.y);
    }
  }
}
