import throttle from "lodash.throttle";
import { PIXEL_RATIO, SIDEBAR_WIDTH } from "../../Constants";
import RenderSystem from "../systems/RenderSystem";

export default class DimensionsController {
  private _renderSystem: RenderSystem;
  private _canvas: HTMLCanvasElement;

  constructor(renderSystem: RenderSystem, canvas: HTMLCanvasElement) {
    this._renderSystem = renderSystem;
    this._canvas = canvas;

    this._calculateCanvasSize = this._calculateCanvasSize.bind(this);
  }

  private _setCanvasSize(width: number, height: number): void {
    // Increase the pixel density of the canvas to match the device
    this._canvas.width = Math.round(PIXEL_RATIO * width);
    this._canvas.height = Math.round(PIXEL_RATIO * height);

    this._canvas.style.width = `${width}px`;
    this._canvas.style.height = `${height}px`;
  }

  private _calculateCanvasSizeAndDefaultOffset(): void {
    const width = window.innerWidth - SIDEBAR_WIDTH;
    const height = window.innerHeight;

    this._setCanvasSize(width, height);

    const cellSize = this._renderSystem.getCellSize();
    const x = Math.round((width - cellSize) / 2);
    const y = Math.round((height - cellSize) / 2);

    this._renderSystem.translateOffset(x, y);
  }

  private _calculateCanvasSize(): void {
    const width = window.innerWidth - SIDEBAR_WIDTH;
    const height = window.innerHeight;

    this._setCanvasSize(width, height);
    this._renderSystem.tick();
  }

  public listen(): void {
    // Initial setup
    this._calculateCanvasSizeAndDefaultOffset();

    // Resize events
    window.addEventListener("resize", throttle(this._calculateCanvasSize, 500));
  }
}
