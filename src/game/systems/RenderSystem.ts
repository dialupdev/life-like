import { PIXEL_RATIO } from "../../Constants";
import type { System } from "./System";
import WorldStore from "../stores/WorldStore";

export default class RenderSystem implements System {
  private _worldStore: WorldStore;
  private _context: CanvasRenderingContext2D;

  private _offsetX: number;
  private _offsetY: number;
  private _cellSize: number;

  constructor(worldStore: WorldStore, context: CanvasRenderingContext2D) {
    this._worldStore = worldStore;
    this._context = context;
  }

  private _clear(): void {
    this._context.fillStyle = "#fff";
    this._context.fillRect(0, 0, this._context.canvas.width, this._context.canvas.height);
  }

  private _drawCell(x: number, y: number): void {
    this._context.fillStyle = "rgb(10, 90, 70)";
    this._context.fillRect(
      PIXEL_RATIO * this._cellSize * x + this._offsetX,
      PIXEL_RATIO * this._cellSize * y + this._offsetY,
      PIXEL_RATIO * this._cellSize,
      PIXEL_RATIO * this._cellSize
    );
  }

  public getCellSize(): number {
    return this._cellSize;
  }

  public setOffset(x: number, y: number): void {
    this._offsetX = PIXEL_RATIO * x;
    this._offsetY = PIXEL_RATIO * y;
  }

  public translateOffset(deltaX: number, deltaY: number): void {
    this._offsetX += PIXEL_RATIO * deltaX;
    this._offsetY += PIXEL_RATIO * deltaY;
  }

  public resetZoom(): void {
    this._cellSize = 5;
  }

  public zoomAt(delta: number, x: number, y: number): void {
    if (delta < 0) {
      this._offsetX -= Math.round((this._offsetX - PIXEL_RATIO * x) / 2);
      this._offsetY -= Math.round((this._offsetY - PIXEL_RATIO * y) / 2);
      this._cellSize /= 2;
    } else {
      this._offsetX += Math.round(this._offsetX - PIXEL_RATIO * x);
      this._offsetY += Math.round(this._offsetY - PIXEL_RATIO * y);
      this._cellSize *= 2;
    }
  }

  public tick(): void {
    this._clear();

    for (const cell of this._worldStore.cells.values()) {
      this._drawCell(cell.x, cell.y);
    }
  }
}
