import { Renderer } from "core";
import { PIXEL_RATIO, NATURAL_CELL_SIZE } from "../../Constants";
import { LayoutModel } from "../models/LayoutModel";
import { PlaybackModel } from "../models/PlaybackModel";
import { WorldModel } from "../models/WorldModel";
import type { System } from "./System";

let renderer: Renderer;

export class RenderSystem implements System {
  private _worldModel: WorldModel;
  private _layoutModel: LayoutModel;
  private _playbackModel: PlaybackModel;
  private _context!: CanvasRenderingContext2D;

  constructor(
    worldModel: WorldModel,
    layoutModel: LayoutModel,
    playbackModel: PlaybackModel,
    canvasPromise: Promise<HTMLCanvasElement>
  ) {
    this._worldModel = worldModel;
    this._layoutModel = layoutModel;
    this._playbackModel = playbackModel;

    canvasPromise.then(canvas => {
      this._context = canvas.getContext("2d", { alpha: false })!;

      renderer = Renderer.new(canvas, PIXEL_RATIO, NATURAL_CELL_SIZE, "lightblue");
    });
  }

  private _clear(): void {
    this._context.fillStyle = "#fff";
    this._context.fillRect(0, 0, this._context.canvas.width, this._context.canvas.height);
  }

  private _drawCell(worldX: number, worldY: number): void {
    this._context.fillStyle = "rgb(10, 90, 70)";

    const cellSize = NATURAL_CELL_SIZE * this._layoutModel.zoomScale;

    this._context.fillRect(
      PIXEL_RATIO * cellSize * worldX + PIXEL_RATIO * this._layoutModel.offsetX,
      PIXEL_RATIO * cellSize * worldY + PIXEL_RATIO * this._layoutModel.offsetY,
      PIXEL_RATIO * cellSize,
      PIXEL_RATIO * cellSize
    );
  }

  public tick(): void {
    this._clear();

    for (const cell of this._worldModel.cells.values()) {
      this._drawCell(cell.x, cell.y);
    }

    renderer.update(this._layoutModel.offsetX, this._layoutModel.offsetY, this._layoutModel.zoomScale);
  }

  public tickLazy(): void {
    if (!this._playbackModel.playing) {
      this.tick();
    }
  }
}
