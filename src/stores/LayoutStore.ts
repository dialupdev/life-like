import { PIXEL_RATIO, SIDEBAR_WIDTH } from "../Constants";
import { Renderer } from "../core/Renderer";

export class LayoutStore {
  private _canvas: HTMLCanvasElement;
  private _renderer: Renderer;

  constructor(canvas: HTMLCanvasElement, renderer: Renderer) {
    this._canvas = canvas;
    this._renderer = renderer;

    this.fitCanvasToWindow = this.fitCanvasToWindow.bind(this);

    this.fitCanvasToWindow();
  }

  public fitCanvasToWindow(): void {
    const width = window.innerWidth - SIDEBAR_WIDTH;
    const height = window.innerHeight;

    // Increase pixel density of canvas to match device
    this._canvas.width = Math.round(PIXEL_RATIO * width);
    this._canvas.height = Math.round(PIXEL_RATIO * height);

    // Scale canvas back down to its actual size
    this._canvas.style.width = `${width}px`;
    this._canvas.style.height = `${height}px`;

    this._renderer.update();
  }
}
