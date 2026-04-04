import { createContext } from "@lit/context";
import { makeObservable, observable, action } from "mobx";

import { PIXEL_RATIO, NATURAL_CELL_SIZE } from "../Constants.ts";
import { parseHexColor } from "../utils/ColorUtils.ts";
import { getUserConfig, setUserConfig } from "../utils/UserConfigUtils.ts";

import type { Layout } from "./Layout.ts";
import type { World } from "./World.ts";

type ShouldSkipUpdate = () => boolean;

export const rendererContext = createContext<Renderer>("renderer");

export class Renderer {
  private _context: CanvasRenderingContext2D;
  private _layout: Layout;
  private _world: World;
  private _colorRGBA: [number, number, number, number];

  private _visibleWorldWidth: number = 0;
  private _visibleWorldHeight: number = 0;

  private _offscreenCanvas: HTMLCanvasElement;
  private _offscreenContext: CanvasRenderingContext2D;
  private _imageData: ImageData | undefined = undefined;

  @observable public accessor debugMode = false;

  public shouldSkipUpdate: ShouldSkipUpdate | undefined;

  constructor(context: CanvasRenderingContext2D, layout: Layout, world: World, color: string) {
    this._context = context;
    this._layout = layout;
    this._world = world;
    this._colorRGBA = parseHexColor(color);

    // We need an offscreen canvas because we can't draw individual pixels directly onto
    // the main canvas - they need to be scaled, which requires drawing to an offscreen canvas first
    // and then drawing the offscreen canvas onto the main canvas, scaled appropriately.
    this._offscreenCanvas = document.createElement("canvas");
    this._offscreenContext = this._offscreenCanvas.getContext("2d", { alpha: false })!;

    this.setDebugMode = this.setDebugMode.bind(this);

    getUserConfig("debugMode", (value: string) => value === "true", this.setDebugMode);

    this._layout.requestUpdate = this.update.bind(this);

    makeObservable(this);
  }

  // minX, minY, width, height
  private _getVisibleWorldRect(): [number, number, number, number] {
    const [canvasWidth, canvasHeight] = this._layout.getCanvasSize();
    const actualCellSize = NATURAL_CELL_SIZE * this._layout.zoomScale;

    const minVisibleWorldX = Math.floor((this._layout.offsetX * -1) / actualCellSize);
    const minVisibleWorldY = Math.floor((this._layout.offsetY * -1) / actualCellSize);

    const maxVisibleWorldX = Math.ceil((canvasWidth - this._layout.offsetX) / actualCellSize);
    const maxVisibleWorldY = Math.ceil((canvasHeight - this._layout.offsetY) / actualCellSize);

    return [
      minVisibleWorldX,
      minVisibleWorldY,
      maxVisibleWorldX - minVisibleWorldX,
      maxVisibleWorldY - minVisibleWorldY,
    ];
  }

  // If the visible world rect has changed, build a new ImageData object
  // _imageData width/height must match the visible world width/height
  private _maybeBuildImageData(visibleWorldWidth: number, visibleWorldHeight: number): void {
    if (this._visibleWorldWidth === visibleWorldWidth && this._visibleWorldHeight === visibleWorldHeight) {
      return;
    }

    this._visibleWorldWidth = visibleWorldWidth;
    this._visibleWorldHeight = visibleWorldHeight;
    this._offscreenCanvas.width = visibleWorldWidth;
    this._offscreenCanvas.height = visibleWorldHeight;

    this._imageData = new ImageData(visibleWorldWidth, visibleWorldHeight);
  }

  private _drawGridOverlay(): void {
    const actualCellSize = NATURAL_CELL_SIZE * this._layout.zoomScale;
    const scaledCellSize = PIXEL_RATIO * actualCellSize;

    const baseX = PIXEL_RATIO * this._layout.offsetX;
    const baseY = PIXEL_RATIO * this._layout.offsetY;

    const gridSize = this._world.randomizeFieldSize;
    const min = Math.floor(gridSize / 2) * -1;
    const max = min + gridSize;

    this._context.strokeStyle = "#ccc";
    this._context.lineWidth = 1;

    // Horizontal grid lines
    for (let worldY = min; worldY <= max; worldY++) {
      const y = Math.round(scaledCellSize * worldY + baseY);
      const x0 = Math.round(scaledCellSize * min + baseX);
      const x1 = Math.round(scaledCellSize * max + baseX);

      this._context.beginPath();
      this._context.moveTo(x0, y);
      this._context.lineTo(x1, y);
      this._context.stroke();
    }

    // Vertical grid lines
    for (let worldX = min; worldX <= max; worldX++) {
      const x = Math.round(scaledCellSize * worldX + baseX);
      const y0 = Math.round(scaledCellSize * min + baseY);
      const y1 = Math.round(scaledCellSize * max + baseY);

      this._context.beginPath();
      this._context.moveTo(x, y0);
      this._context.lineTo(x, y1);
      this._context.stroke();
    }

    // Centered dark dot
    const dotRadius = this._layout.zoomScale;

    this._context.fillStyle = "#20073A";
    this._context.beginPath();
    this._context.arc(
      PIXEL_RATIO * this._layout.offsetX,
      PIXEL_RATIO * this._layout.offsetY,
      dotRadius,
      0.0,
      2.0 * Math.PI
    );
    this._context.fill();
  }

  public forceUpdate(): void {
    const [minVisibleWorldX, minVisibleWorldY, visibleWorldWidth, visibleWorldHeight] = this._getVisibleWorldRect();

    this._maybeBuildImageData(visibleWorldWidth, visibleWorldHeight);

    const buffer = this._imageData!.data;

    // Fill buffer with white background
    buffer.fill(255);

    const [r, g, b, a] = this._colorRGBA;

    // Write visible cells as single pixels into the buffer
    // Each pixel is 4 bytes (RGBA)
    this._world.forEachCellInRect(minVisibleWorldX, minVisibleWorldY, visibleWorldWidth, visibleWorldHeight, (cell) => {
      const bufferX = cell.x - minVisibleWorldX;
      const bufferY = cell.y - minVisibleWorldY;

      const offset = (bufferY * visibleWorldWidth + bufferX) * 4;

      buffer[offset] = r;
      buffer[offset + 1] = g;
      buffer[offset + 2] = b;
      buffer[offset + 3] = a;
    });

    // Write buffer to offscreen canvas
    this._offscreenContext.putImageData(this._imageData!, 0, 0);

    const actualCellSize = NATURAL_CELL_SIZE * this._layout.zoomScale;

    // Draw offscreen canvas onto main canvas, scaled appropriately
    this._context.drawImage(
      this._offscreenCanvas,
      0,
      0,
      visibleWorldWidth,
      visibleWorldHeight,
      PIXEL_RATIO * (this._layout.offsetX + minVisibleWorldX * actualCellSize),
      PIXEL_RATIO * (this._layout.offsetY + minVisibleWorldY * actualCellSize),
      PIXEL_RATIO * visibleWorldWidth * actualCellSize,
      PIXEL_RATIO * visibleWorldHeight * actualCellSize
    );

    if (this.debugMode) {
      this._drawGridOverlay();
    }
  }

  public update(): void {
    if (this.shouldSkipUpdate?.()) {
      return;
    }

    this.forceUpdate();
  }

  @action
  public setDebugMode(debugMode: boolean): void {
    this.debugMode = debugMode;

    this.update();

    setUserConfig("debugMode", debugMode.toString());
  }

  public toggleDebugMode(): void {
    this.setDebugMode(!this.debugMode);
  }
}
