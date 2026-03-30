import { PIXEL_RATIO, SIDEBAR_WIDTH } from "../Constants.ts";

type RequestUpdate = () => void;

export class Layout {
  private _canvas: HTMLCanvasElement;

  public requestUpdate: RequestUpdate | undefined;

  constructor(canvas: HTMLCanvasElement) {
    this._canvas = canvas;

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

    this.requestUpdate?.();
  }
}
