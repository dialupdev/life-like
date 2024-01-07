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

  public update(world: World): void {
    this._clear();
    this._context.fillStyle = this._color;

    world.cells.forEach(cell => {
      this._drawCell(cell.x, cell.y);
    });
  }

  private _drawCell(world_x: number, world_y: number): void {
    const pixelRatio = this._layout.pixelRatio;
    const actualCellSize = this._layout.naturalCellSize * this._layout.zoomScale;

    this._context.fillRect(
      pixelRatio * actualCellSize * world_x + pixelRatio * this._layout.offsetX,
      pixelRatio * actualCellSize * world_y + pixelRatio * this._layout.offsetY,
      pixelRatio * actualCellSize,
      pixelRatio * actualCellSize
    );
  }

  private _clear(): void {
    const [canvasWidth, canvasHeight] = this._layout.getCanvasSize();

    this._context.fillStyle = "#fff";
    this._context.fillRect(0.0, 0.0, canvasWidth * this._layout.pixelRatio, canvasHeight * this._layout.pixelRatio);
  }
}
