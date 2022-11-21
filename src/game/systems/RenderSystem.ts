import { PIXEL_RATIO } from "../../Constants";
import WorldModel from "../models/WorldModel";
import PositionModel from "../models/PositionModel";
import PlaybackModel from "../models/PlaybackModel";
import type { System } from "./System";

export default class RenderSystem implements System {
  private _worldModel: WorldModel;
  private _positionModel: PositionModel;
  private _playbackModel: PlaybackModel;
  private _context: CanvasRenderingContext2D;

  constructor(
    worldModel: WorldModel,
    positionModel: PositionModel,
    playbackModel: PlaybackModel,
    canvasPromise: Promise<HTMLCanvasElement>
  ) {
    this._worldModel = worldModel;
    this._positionModel = positionModel;
    this._playbackModel = playbackModel;

    canvasPromise.then(canvas => {
      this._context = canvas.getContext("2d", { alpha: false });
    });
  }

  private _clear(): void {
    this._context.fillStyle = "#fff";
    this._context.fillRect(0, 0, this._context.canvas.width, this._context.canvas.height);
  }

  private _drawCell(x: number, y: number): void {
    this._context.fillStyle = "rgb(10, 90, 70)";
    this._context.fillRect(
      PIXEL_RATIO * this._positionModel.cellSize * x + this._positionModel.offsetX,
      PIXEL_RATIO * this._positionModel.cellSize * y + this._positionModel.offsetY,
      PIXEL_RATIO * this._positionModel.cellSize,
      PIXEL_RATIO * this._positionModel.cellSize
    );
  }

  public tick(): void {
    this._clear();

    for (const cell of this._worldModel.cells.values()) {
      this._drawCell(cell.x, cell.y);
    }
  }

  public tickLazy(): void {
    if (!this._playbackModel.playing) {
      this.tick();
    }
  }
}
