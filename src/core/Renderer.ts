import { createContext } from "@lit/context";
import { makeObservable, observable, action } from "mobx";

import { PIXEL_RATIO, NATURAL_CELL_SIZE } from "../Constants.ts";
import { getUserConfig, setUserConfig } from "../utils/UserConfigUtils.ts";

import type { Layout } from "./Layout.ts";
import type { World } from "./World.ts";

type ShouldSkipUpdate = () => boolean;

export const rendererContext = createContext<Renderer>("renderer");

export class Renderer {
  private _context: CanvasRenderingContext2D;
  private _layout: Layout;
  private _world: World;
  private _color: string;

  @observable public accessor debugMode = false;

  public shouldSkipUpdate: ShouldSkipUpdate | undefined;

  constructor(context: CanvasRenderingContext2D, layout: Layout, world: World, color: string) {
    this._context = context;
    this._layout = layout;
    this._world = world;
    this._color = color;

    this.setDebugMode = this.setDebugMode.bind(this);

    getUserConfig("debugMode", (value: string) => value === "true", this.setDebugMode);

    this._layout.requestUpdate = this.update.bind(this);

    makeObservable(this);
  }

  private _clear(): void {
    const [canvasWidth, canvasHeight] = this._layout.getCanvasSize();

    this._context.fillStyle = "#fff";
    this._context.fillRect(0.0, 0.0, canvasWidth * PIXEL_RATIO, canvasHeight * PIXEL_RATIO);
  }

  private _drawCell(worldX: number, worldY: number): void {
    const actualCellSize = NATURAL_CELL_SIZE * this._layout.zoomScale;
    const scaledCellSize = PIXEL_RATIO * actualCellSize;

    const baseX = PIXEL_RATIO * this._layout.offsetX;
    const baseY = PIXEL_RATIO * this._layout.offsetY;

    const left = Math.round(scaledCellSize * worldX + baseX);
    const top = Math.round(scaledCellSize * worldY + baseY);
    const right = Math.round(scaledCellSize * (worldX + 1) + baseX);
    const bottom = Math.round(scaledCellSize * (worldY + 1) + baseY);

    this._context.fillRect(left, top, right - left, bottom - top);

    if (this.debugMode) {
      // Draw cell coordinates as text
      const fontSize = this._layout.zoomScale;
      const textPadding = this._layout.zoomScale;

      this._context.fillStyle = "white";
      this._context.font = `${fontSize}px monospace`;
      this._context.textBaseline = "bottom";
      this._context.fillText(`${worldX},${worldY}`, left + textPadding, bottom - textPadding);
      this._context.fillStyle = this._color;
    }
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
    this._clear();
    this._context.fillStyle = this._color;

    for (const [, cell] of this._world.cells) {
      this._drawCell(cell.x, cell.y);
    }

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
