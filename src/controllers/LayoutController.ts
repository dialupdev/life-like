import { Layout, World, Renderer } from "core";
import { makeObservable, observable } from "mobx";
import { PIXEL_RATIO, NATURAL_CELL_SIZE, SIDEBAR_WIDTH } from "../Constants";

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
    this.reset = this.reset.bind(this);

    makeObservable(this, {
      zoomScale: observable,
    });

    this.fitCanvasToWindow();
    this.reset();
  }

  private _calculateCanvasSize(): [number, number] {
    return [window.innerWidth - SIDEBAR_WIDTH, window.innerHeight];
  }

  public fitCanvasToWindow(): void {
    const [width, height] = this._calculateCanvasSize();

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

    this.zoomScale = scale;

    this._renderer.update(this._layout, this._world); // make this lazy
  }

  public zoomAt(delta: number, windowX: number, windowY: number): void {
    // Zoom point relative to world offset
    const canvasX = windowX - SIDEBAR_WIDTH - this._layout.offset_x;
    const canvasY = windowY - this._layout.offset_y;

    const normalizedDelta = -delta;

    const scale = this._layout.zoomAt(normalizedDelta, canvasX, canvasY);

    this.zoomScale = scale;

    this._renderer.update(this._layout, this._world); // make this lazy
  }

  public reset(): void {
    const [width, height] = this._calculateCanvasSize();

    const cellSize = NATURAL_CELL_SIZE * this._layout.zoom_scale;

    const x = Math.round((width - cellSize) / 2);
    const y = Math.round((height - cellSize) / 2);

    this._layout.setOffset(x, y);
    this._layout.setZoomScale(1);

    this.zoomScale = 1;

    this._renderer.update(this._layout, this._world); // make this lazy
  }
}
