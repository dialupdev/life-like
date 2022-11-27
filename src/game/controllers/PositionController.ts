import { PIXEL_RATIO, SIDEBAR_WIDTH } from "../../Constants";
import PositionModel from "../models/PositionModel";
import RenderSystem from "../systems/RenderSystem";

export enum Direction {
  Up = "Up",
  Right = "Right",
  Down = "Down",
  Left = "Left",
}

export default class PositionController {
  private _positionModel: PositionModel;
  private _renderSystem: RenderSystem;
  private _canvas: HTMLCanvasElement;

  constructor(positionModel: PositionModel, renderSystem: RenderSystem, canvasPromise: Promise<HTMLCanvasElement>) {
    this._positionModel = positionModel;
    this._renderSystem = renderSystem;

    canvasPromise.then(canvas => {
      this._canvas = canvas;

      this.fitCanvasToWindow();
      this.recenterOffset();
    });

    this.fitCanvasToWindow = this.fitCanvasToWindow.bind(this);
    this.translateOffset = this.translateOffset.bind(this);
    this.recenterOffset = this.recenterOffset.bind(this);
    this.zoomAt = this.zoomAt.bind(this);
  }

  private _calculateCanvasSize(): [number, number] {
    return [window.innerWidth - SIDEBAR_WIDTH, window.innerHeight];
  }

  public fitCanvasToWindow(): void {
    const [width, height] = this._calculateCanvasSize();

    // Increase pixel density of canvas to match device
    this._canvas.width = Math.round(PIXEL_RATIO * width);
    this._canvas.height = Math.round(PIXEL_RATIO * height);

    this._canvas.style.width = `${width}px`;
    this._canvas.style.height = `${height}px`;

    this._renderSystem.tickLazy();
  }

  public setOffset(x: number, y: number): void {
    this._positionModel.offsetX = PIXEL_RATIO * x;
    this._positionModel.offsetY = PIXEL_RATIO * y;
  }

  public translateOffset(deltaX: number, deltaY: number): void {
    this._positionModel.offsetX += PIXEL_RATIO * deltaX;
    this._positionModel.offsetY += PIXEL_RATIO * deltaY;

    this._renderSystem.tickLazy();
  }

  public panInDirection(direction: Direction): void {
    const panIncrement = this._positionModel.cellSize * 10;

    let deltaX = 0;
    let deltaY = 0;

    switch (direction) {
      case Direction.Up:
        deltaY += panIncrement;
        break;
      case Direction.Right:
        deltaX -= panIncrement;
        break;
      case Direction.Down:
        deltaY -= panIncrement;
        break;
      case Direction.Left:
        deltaX += panIncrement;
        break;
    }

    this.translateOffset(deltaX, deltaY);
  }

  public recenterOffset(): void {
    const [width, height] = this._calculateCanvasSize();

    const x = Math.round((width - this._positionModel.cellSize) / 2);
    const y = Math.round((height - this._positionModel.cellSize) / 2);

    this.setOffset(x, y);
    this.resetZoom();

    this._renderSystem.tickLazy();
  }

  public zoomAt(delta: number, windowX: number, windowY: number): void {
    const [x, y] = [windowX - SIDEBAR_WIDTH, windowY];

    if (delta < 0) {
      this._positionModel.offsetX -= Math.round((this._positionModel.offsetX - PIXEL_RATIO * x) / 2);
      this._positionModel.offsetY -= Math.round((this._positionModel.offsetY - PIXEL_RATIO * y) / 2);
      this._positionModel.cellSize /= 2;
    } else {
      this._positionModel.offsetX += Math.round(this._positionModel.offsetX - PIXEL_RATIO * x);
      this._positionModel.offsetY += Math.round(this._positionModel.offsetY - PIXEL_RATIO * y);
      this._positionModel.cellSize *= 2;
    }

    this._renderSystem.tickLazy();
  }

  public resetZoom(): void {
    this._positionModel.cellSize = 4;
  }
}
