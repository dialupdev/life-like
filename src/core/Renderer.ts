import { Layout } from "./Layout";
import { World } from "./World";

export class Renderer {
  private _layout: Layout;
  private _context: CanvasRenderingContext2D;
  private _color: string;

  constructor(layout: Layout, context: CanvasRenderingContext2D, color: string) {
    this._layout = layout;
    this._context = context;
    this._color = color;
  }

  private _drawCell(worldX: number, worldY: number): void {
    const pixelRatio = this._layout.pixelRatio;
    const actualCellSize = this._layout.naturalCellSize * this._layout.zoomScale;
    const scaledCellSize = pixelRatio * actualCellSize;

    const baseX = pixelRatio * this._layout.offsetX;
    const baseY = pixelRatio * this._layout.offsetY;

    const left = Math.round(scaledCellSize * worldX + baseX);
    const top = Math.round(scaledCellSize * worldY + baseY);
    const right = Math.round(scaledCellSize * (worldX + 1) + baseX);
    const bottom = Math.round(scaledCellSize * (worldY + 1) + baseY);

    this._context.fillRect(left, top, right - left, bottom - top);
  }

  private _clear(): void {
    const [canvasWidth, canvasHeight] = this._layout.getCanvasSize();

    this._context.fillStyle = "#fff";
    this._context.fillRect(0.0, 0.0, canvasWidth * this._layout.pixelRatio, canvasHeight * this._layout.pixelRatio);
  }

  public update(world: World): void {
    this._clear();
    this._context.fillStyle = this._color;

    world.cells.forEach(cell => {
      this._drawCell(cell.x, cell.y);
    });
  }
}
