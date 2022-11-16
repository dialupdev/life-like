import throttle from "lodash.throttle";
import RenderSystem from "../systems/RenderSystem";

export const SIDEBAR_WIDTH = 280;

export default class DimensionsController {
  private _renderSystem: RenderSystem;
  private _canvas: HTMLCanvasElement;

  constructor(renderSystem: RenderSystem, canvas: HTMLCanvasElement) {
    this._renderSystem = renderSystem;
    this._canvas = canvas;

    this._calculateCanvasSize = this._calculateCanvasSize.bind(this);
  }

  private _calculateCanvasSizeAndDefaultOffset(): void {
    const width = window.innerWidth - SIDEBAR_WIDTH;
    const height = window.innerHeight;

    this._canvas.width = width;
    this._canvas.height = height;

    const x = Math.round(this._canvas.width / 2);
    const y = Math.round(this._canvas.height / 2);

    this._renderSystem.translateOffset(x, y);
  }

  private _calculateCanvasSize(): void {
    const width = window.innerWidth - SIDEBAR_WIDTH;
    const height = window.innerHeight;

    this._canvas.width = width;
    this._canvas.height = height;

    this._renderSystem.tick();
  }

  public listen(): void {
    // Initial setup
    this._calculateCanvasSizeAndDefaultOffset();

    // Resize events
    window.addEventListener("resize", throttle(this._calculateCanvasSize, 500));
  }
}
