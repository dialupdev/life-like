import { World } from "./World";
import { Layout } from "./Layout";

export class Renderer {
  private _context: CanvasRenderingContext2D;
  private _color: string;

  constructor(context: CanvasRenderingContext2D, color: string) {
    this._context = context;
    this._color = color;
  }

  public update(layout: Layout, world: World) {
    this._clear(layout);
    this._context.fillStyle = this._color;

    world.cells.forEach(cell => {
      this._drawCell(layout, cell.x, cell.y);
    });
  }

  private _drawCell(layout: Layout, world_x: number, world_y: number) {
    const pixelRatio = layout.pixelRatio;
    const actualCellSize = layout.naturalCellSize * layout.zoomScale;

    this._context.fillRect(
      pixelRatio * actualCellSize * world_x + pixelRatio * layout.offsetX,
      pixelRatio * actualCellSize * world_y + pixelRatio * layout.offsetY,
      pixelRatio * actualCellSize,
      pixelRatio * actualCellSize
    );
  }

  private _clear(layout: Layout) {
    const [canvasWidth, canvasHeight] = layout.getCanvasSize();

    this._context.fillStyle = "#fff";
    this._context.fillRect(0.0, 0.0, canvasWidth * layout.pixelRatio, canvasHeight * layout.pixelRatio);
  }
}
