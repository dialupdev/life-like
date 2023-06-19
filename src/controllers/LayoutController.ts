import { makeObservable, observable, runInAction } from "mobx";
import { Layout, World, Renderer, ZoomDirection } from "core";
import { PIXEL_RATIO, NATURAL_CELL_SIZE, SIDEBAR_WIDTH } from "../Constants";

// Re-export for UI
export { ZoomDirection } from "core";

export enum Direction {
  Up = "Up",
  Right = "Right",
  Down = "Down",
  Left = "Left",
}

export class LayoutController {
  private _canvas: HTMLCanvasElement;
  private _layout: Layout;
  private _world: World;
  private _renderer: Renderer;

  public zoomScale = 1;

  constructor(canvas: HTMLCanvasElement, layout: Layout, world: World, renderer: Renderer) {
    this._canvas = canvas;
    this._layout = layout;
    this._world = world;
    this._renderer = renderer;

    this.fitCanvasToWindow = this.fitCanvasToWindow.bind(this);
    this.translateOffset = this.translateOffset.bind(this);
    this.zoomAt = this.zoomAt.bind(this);
    this.zoomToFit = this.zoomToFit.bind(this);

    makeObservable(this, {
      zoomScale: observable,
    });

    this.fitCanvasToWindow();
    this.zoomToFit();
  }

  private _setZoomScaleTruncated(zoomScale: number): void {
    // Multiply by 100 and truncate number to two decimal places for nicer UI
    const zoomScaleTruncated = Math.round((zoomScale + Number.EPSILON) * 100);

    runInAction(() => {
      this.zoomScale = zoomScaleTruncated;
    });
  }

  public fitCanvasToWindow(): void {
    const width = window.innerWidth - SIDEBAR_WIDTH;
    const height = window.innerHeight;

    // Increase pixel density of canvas to match device
    this._layout.setCanvasSize(Math.round(PIXEL_RATIO * width), Math.round(PIXEL_RATIO * height));

    // Scale canvas back down to its actual size
    this._canvas.style.width = `${width}px`;
    this._canvas.style.height = `${height}px`;

    this._renderer.update(this._layout, this._world); // make this lazy
  }

  public translateOffset(deltaX: number, deltaY: number): void {
    this._layout.translateOffset(deltaX, deltaY);
    this._renderer.update(this._layout, this._world); // make this lazy
  }

  public panInDirection(direction: Direction): void {
    const cellSize = NATURAL_CELL_SIZE * this._layout.zoom_scale;
    const panIncrement = cellSize * 10;

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

  public zoomToScale(scale: number): void {
    this._layout.setZoomScale(scale);

    this._setZoomScaleTruncated(scale);

    this._renderer.update(this._layout, this._world); // make this lazy
  }

  public zoomByStep(direction: ZoomDirection): void {
    const scale = this._layout.zoomByStep(direction);

    this._setZoomScaleTruncated(scale);

    this._renderer.update(this._layout, this._world); // make this lazy
  }

  public zoomAt(delta: number, windowX: number, windowY: number): void {
    // Zoom point relative to world offset
    const canvasX = windowX - SIDEBAR_WIDTH - this._layout.offset_x;
    const canvasY = windowY - this._layout.offset_y;

    const normalizedDelta = -delta;

    const scale = this._layout.zoomAt(normalizedDelta, canvasX, canvasY);

    this._setZoomScaleTruncated(scale);

    this._renderer.update(this._layout, this._world); // make this lazy
  }

  public zoomToFit(): void {
    const scale = this._layout.zoomToFit(this._world);

    this._setZoomScaleTruncated(scale);

    this._renderer.update(this._layout, this._world); // make this lazy
  }
}
