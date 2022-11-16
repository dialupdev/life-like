import WorldStore from "../stores/WorldStore";
import type { System } from "./System";

export default class RenderSystem implements System {
  private _worldStore: WorldStore;
  private _context: CanvasRenderingContext2D;

  private _offsetX = 0;
  private _offsetY = 0;
  private _cellSize = 5;

  constructor(worldStore: WorldStore, context: CanvasRenderingContext2D) {
    this._worldStore = worldStore;
    this._context = context;
  }

  private _clear(): void {
    this._context.clearRect(0, 0, this._context.canvas.width, this._context.canvas.height);
  }

  private _drawCell(x: number, y: number): void {
    this._context.fillStyle = "rgb(10, 90, 70)";
    this._context.fillRect(
      this._cellSize * x + this._offsetX,
      this._cellSize * y + this._offsetY,
      this._cellSize,
      this._cellSize
    );
  }

  public translateOffset(deltaX: number, deltaY: number): void {
    this._offsetX += deltaX;
    this._offsetY += deltaY;
  }

  public tick(): void {
    this._clear();

    for (const cell of this._worldStore.cells.values()) {
      this._drawCell(cell.x, cell.y);
    }
  }
}
