import throttle from "lodash.throttle";
import { PIXEL_RATIO, SIDEBAR_WIDTH } from "../../Constants";
import RenderSystem from "../systems/RenderSystem";

export enum ArrowKeys {
  ArrowUp = "ArrowUp",
  ArrowRight = "ArrowRight",
  ArrowDown = "ArrowDown",
  ArrowLeft = "ArrowLeft",
}

export default class DimensionsController {
  private _renderSystem: RenderSystem;
  private _canvas: HTMLCanvasElement;
  private _lastMouseX: number;
  private _lastMouseY: number;

  constructor(renderSystem: RenderSystem, canvas: HTMLCanvasElement) {
    this._renderSystem = renderSystem;
    this._canvas = canvas;

    this._calculateCanvasSize = this._calculateCanvasSize.bind(this);
    this._keyDown = this._keyDown.bind(this);
    this._startDrag = this._startDrag.bind(this);
    this._drag = this._drag.bind(this);
    this._stopDrag = this._stopDrag.bind(this);
  }

  private _setCanvasSize(): void {
    const width = window.innerWidth - SIDEBAR_WIDTH;
    const height = window.innerHeight;

    // Increase the pixel density of the canvas to match the device
    this._canvas.width = Math.round(PIXEL_RATIO * width);
    this._canvas.height = Math.round(PIXEL_RATIO * height);

    this._canvas.style.width = `${width}px`;
    this._canvas.style.height = `${height}px`;
  }

  private _calculateCanvasSizeAndDefaultOffset(): void {
    this._setCanvasSize();
    this.recenterOffset();
  }

  private _calculateCanvasSize(): void {
    this._setCanvasSize();
    this._renderSystem.tick();
  }

  private _keyDown(e: KeyboardEvent): void {
    const panIncrement = this._renderSystem.getCellSize() * 4;
    let x = 0;
    let y = 0;

    switch (e.key) {
      case ArrowKeys.ArrowUp:
        y -= panIncrement;
        break;
      case ArrowKeys.ArrowRight:
        x += panIncrement;
        break;
      case ArrowKeys.ArrowDown:
        y += panIncrement;
        break;
      case ArrowKeys.ArrowLeft:
        x -= panIncrement;
        break;
    }

    this._renderSystem.translateOffset(x, y);
    this._renderSystem.tick();
  }

  private _startDrag(e: MouseEvent): void {
    this._lastMouseX = e.clientX;
    this._lastMouseY = e.clientY;

    document.body.style.setProperty("cursor", "grabbing");
    window.addEventListener("mousemove", this._drag);
  }

  private _drag(e: MouseEvent): void {
    const deltaX = e.clientX - this._lastMouseX;
    const deltaY = e.clientY - this._lastMouseY;

    this._lastMouseX = e.clientX;
    this._lastMouseY = e.clientY;

    this._renderSystem.translateOffset(deltaX, deltaY);
    this._renderSystem.tick();
  }

  private _stopDrag(): void {
    document.body.style.removeProperty("cursor");
    window.removeEventListener("mousemove", this._drag);
  }

  public recenterOffset(): void {
    const width = window.innerWidth - SIDEBAR_WIDTH;
    const height = window.innerHeight;

    const cellSize = this._renderSystem.getCellSize();
    const x = Math.round((width - cellSize) / 2);
    const y = Math.round((height - cellSize) / 2);

    this._renderSystem.setOffset(x, y);
    this._renderSystem.tick();
  }

  public listen(): void {
    // Initial setup
    this._calculateCanvasSizeAndDefaultOffset();

    // Resize events
    window.addEventListener("resize", throttle(this._calculateCanvasSize, 500));

    // Keyboard events
    window.addEventListener("keydown", this._keyDown);

    // Mouse events
    this._canvas.addEventListener("mousedown", this._startDrag);
    window.addEventListener("mouseup", this._stopDrag);
  }
}
