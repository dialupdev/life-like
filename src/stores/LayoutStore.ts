import { makeObservable, observable, runInAction } from "mobx";
import { PIXEL_RATIO, NATURAL_CELL_SIZE, SIDEBAR_WIDTH } from "../Constants";
import { Layout, PanDirection, ZoomDirection } from "../core/Layout";
import { Renderer } from "../core/Renderer";
import { World } from "../core/World";

export class LayoutStore {
  private _canvas: HTMLCanvasElement;
  private _layout: Layout;
  private _world: World;
  private _renderer: Renderer;

  public zoomScale = 1;

  constructor(canvas: HTMLCanvasElement, world: World, layout: Layout, renderer: Renderer) {
    this._canvas = canvas;
    this._world = world;
    this._layout = layout;
    this._renderer = renderer;

    this.fitCanvasToWindow = this.fitCanvasToWindow.bind(this);
    this.translateOffset = this.translateOffset.bind(this);
    this.zoomAt = this.zoomAt.bind(this);
    this.zoomToFit = this.zoomToFit.bind(this);

    makeObservable(this, {
      zoomScale: observable,
    });

    this.fitCanvasToWindow();
  }

  private _setZoomScaleTruncated(zoomScale: number): void {
    // Multiply by 100 and truncate number to two decimal places for nicer UI
    const zoomScaleTruncated = Math.round((zoomScale + Number.EPSILON) * 100);

    runInAction(() => {
      this.zoomScale = zoomScaleTruncated;
    });
  }

  public zoomToScale(scale: number): void {
    this._layout.zoomToScale(scale);

    this._setZoomScaleTruncated(scale);

    this._renderer.update(this._world); // make this lazy
  }

  public zoomByStep(direction: ZoomDirection): void {
    const scale = this._layout.zoomByStep(direction);

    this._setZoomScaleTruncated(scale);

    this._renderer.update(this._world); // make this lazy
  }

  public zoomAt(delta: number, windowX: number, windowY: number): void {
    // Zoom point relative to world offset
    const canvasX = windowX - SIDEBAR_WIDTH;
    const canvasY = windowY;

    const normalizedDelta = -delta;

    const scale = this._layout.zoomAt(normalizedDelta, canvasX, canvasY);

    this._setZoomScaleTruncated(scale);

    this._renderer.update(this._world); // make this lazy
  }

  public zoomToFit(): void {
    const scale = this._layout.zoomToFit(this._world);

    this._setZoomScaleTruncated(scale);

    this._renderer.update(this._world); // make this lazy
  }

  public translateOffset(deltaX: number, deltaY: number): void {
    this._layout.translateOffset(deltaX, deltaY);
    this._renderer.update(this._world); // make this lazy
  }

  public panInDirection(direction: PanDirection): void {
    const cellSize = NATURAL_CELL_SIZE * this._layout.zoomScale;
    const panIncrement = cellSize * 10;

    let deltaX = 0;
    let deltaY = 0;

    switch (direction) {
      case PanDirection.up:
        deltaY += panIncrement;
        break;
      case PanDirection.right:
        deltaX -= panIncrement;
        break;
      case PanDirection.down:
        deltaY -= panIncrement;
        break;
      case PanDirection.left:
        deltaX += panIncrement;
        break;
    }

    this.translateOffset(deltaX, deltaY);
  }

  public fitCanvasToWindow(): void {
    const width = window.innerWidth - SIDEBAR_WIDTH;
    const height = window.innerHeight;

    // Increase pixel density of canvas to match device
    this._layout.setCanvasSize(Math.round(PIXEL_RATIO * width), Math.round(PIXEL_RATIO * height));

    // Scale canvas back down to its actual size
    this._canvas.style.width = `${width}px`;
    this._canvas.style.height = `${height}px`;

    this._renderer.update(this._world); // make this lazy
  }
}
