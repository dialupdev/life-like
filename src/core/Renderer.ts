import { createContext } from "@lit/context";
import { makeObservable, observable, action } from "mobx";

import { PIXEL_RATIO, NATURAL_CELL_SIZE } from "../Constants.ts";
import { clamp } from "../utils/MathUtils.ts";

import type { World } from "./World.ts";

const ZOOM_INTENSITY = 0.01;
const MIN_ZOOM_SCALE = 0.1; // 10%
const MAX_ZOOM_SCALE = 64.0; // 6400%
const ZOOM_SCALE_STEPS = [0.1, 0.15, 0.25, 0.33, 0.5, 0.75, 1.0, 1.5, 2.0, 3.0, 4.0, 8.0, 12.0, 16.0, 32.0, 64.0];
const ZOOM_TO_FIT_PADDING = 0.15; // 15%

export enum PanDirection {
  up,
  right,
  down,
  left,
}

export enum ZoomDirection {
  in,
  out,
}

type ShouldSkipUpdate = () => boolean;

export const rendererContext = createContext<Renderer>("renderer");

export class Renderer {
  private _canvas: HTMLCanvasElement;
  private _context: CanvasRenderingContext2D;
  private _world: World;
  private _color: string;

  public offsetX = 0.0; // Not including pixel ratio
  public offsetY = 0.0; // Not including pixel ratio

  public shouldSkipUpdate: ShouldSkipUpdate | undefined;

  @observable public accessor zoomScale = 1.0; // 100%

  constructor(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D, world: World, color: string) {
    this._canvas = canvas;
    this._context = context;
    this._world = world;
    this._color = color;

    this.translateOffset = this.translateOffset.bind(this);
    this.panInDirection = this.panInDirection.bind(this);
    this.zoomToScale = this.zoomToScale.bind(this);
    this.zoomByStep = this.zoomByStep.bind(this);
    this.zoomAt = this.zoomAt.bind(this);
    this.zoomToFit = this.zoomToFit.bind(this);

    makeObservable(this);
  }

  private _getCanvasSize(): [number, number] {
    return [this._canvas.width / PIXEL_RATIO, this._canvas.height / PIXEL_RATIO];
  }

  private _getCanvasCenterOffset(): [number, number] {
    const [canvasWidth, canvasHeight] = this._getCanvasSize();

    const canvasCenterX = canvasWidth / 2.0 - this.offsetX;
    const canvasCenterY = canvasHeight / 2.0 - this.offsetY;

    return [canvasCenterX, canvasCenterY];
  }

  private _computeZoomTranslation(zoomPointX: number, zoomPointY: number, newZoomScale: number): [number, number] {
    const oldZoomScale = this.zoomScale;
    const zoomScaleRatio = newZoomScale / oldZoomScale;

    // Get the canvas position of the mouse after scaling
    const newX = zoomPointX * zoomScaleRatio;
    const newY = zoomPointY * zoomScaleRatio;

    // Reverse the translation caused by scaling
    return [zoomPointX - newX, zoomPointY - newY];
  }

  private _drawCell(worldX: number, worldY: number): void {
    const actualCellSize = NATURAL_CELL_SIZE * this.zoomScale;
    const scaledCellSize = PIXEL_RATIO * actualCellSize;

    const baseX = PIXEL_RATIO * this.offsetX;
    const baseY = PIXEL_RATIO * this.offsetY;

    const left = Math.round(scaledCellSize * worldX + baseX);
    const top = Math.round(scaledCellSize * worldY + baseY);
    const right = Math.round(scaledCellSize * (worldX + 1) + baseX);
    const bottom = Math.round(scaledCellSize * (worldY + 1) + baseY);

    this._context.fillRect(left, top, right - left, bottom - top);
  }

  private _clear(): void {
    const [canvasWidth, canvasHeight] = this._getCanvasSize();

    this._context.fillStyle = "#fff";
    this._context.fillRect(0.0, 0.0, canvasWidth * PIXEL_RATIO, canvasHeight * PIXEL_RATIO);
  }

  public translateOffset(deltaX: number, deltaY: number): void {
    this.offsetX += deltaX;
    this.offsetY += deltaY;

    this.update();
  }

  public panInDirection(direction: PanDirection): void {
    const cellSize = NATURAL_CELL_SIZE * this.zoomScale;
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

  @action
  public zoomToScale(scale: number): void {
    // Clamp zoom scale within valid range
    const newZoomScale = clamp(scale, MIN_ZOOM_SCALE, MAX_ZOOM_SCALE);

    const [canvasX, canvasY] = this._getCanvasCenterOffset();

    const [tx, ty] = this._computeZoomTranslation(canvasX, canvasY, newZoomScale);

    this.offsetX += tx;
    this.offsetY += ty;

    this.zoomScale = newZoomScale;

    this.update();
  }

  @action
  public zoomByStep(direction: ZoomDirection): void {
    const isZoomOut = direction === ZoomDirection.out;
    const increment = isZoomOut ? -1 : 1;
    const lastStepIndex = ZOOM_SCALE_STEPS.length - 1;

    let stepIndex = isZoomOut ? lastStepIndex : 0;
    let scaleCandidate = isZoomOut ? MAX_ZOOM_SCALE : MIN_ZOOM_SCALE;

    while (stepIndex >= 0 && stepIndex <= lastStepIndex) {
      scaleCandidate = ZOOM_SCALE_STEPS[stepIndex];

      // Return the next closest scale step
      if ((isZoomOut && scaleCandidate < this.zoomScale) || (!isZoomOut && scaleCandidate > this.zoomScale)) {
        break;
      }

      stepIndex += increment;
    }

    const [canvasX, canvasY] = this._getCanvasCenterOffset();

    const [tx, ty] = this._computeZoomTranslation(canvasX, canvasY, scaleCandidate);

    this.offsetX += tx;
    this.offsetY += ty;

    this.zoomScale = scaleCandidate;

    this.update();
  }

  @action
  public zoomAt(delta: number, canvasX: number, canvasY: number): void {
    // Use canvas offset instead of true canvas position
    canvasX = canvasX - this.offsetX;
    canvasY = canvasY - this.offsetY;

    // I don't understand the next line, but it works...
    let newZoomScale = this.zoomScale * Math.exp(delta * ZOOM_INTENSITY);

    // Clamp zoom scale within valid range
    newZoomScale = clamp(newZoomScale, MIN_ZOOM_SCALE, MAX_ZOOM_SCALE);

    const [tx, ty] = this._computeZoomTranslation(canvasX, canvasY, newZoomScale);

    this.offsetX += tx;
    this.offsetY += ty;

    this.zoomScale = newZoomScale;

    this.update();
  }

  @action
  public zoomToFit(): void {
    const [worldX, worldY, worldWidth, worldHeight] = this._world.getBounds();

    const naturalWorldWidth = NATURAL_CELL_SIZE * worldWidth;
    const naturalWorldHeight = NATURAL_CELL_SIZE * worldHeight;

    const [canvasWidth, canvasHeight] = this._getCanvasSize();

    const horizontalFitScale = (canvasWidth * (1.0 - ZOOM_TO_FIT_PADDING)) / naturalWorldWidth;
    const verticalFitScale = (canvasHeight * (1.0 - ZOOM_TO_FIT_PADDING)) / naturalWorldHeight;

    // Use the minimum of horizontal or vertical fit to ensure everything is visible
    let newZoomScale = Math.min(horizontalFitScale, verticalFitScale);

    // Clamp zoom scale within valid range
    newZoomScale = clamp(newZoomScale, MIN_ZOOM_SCALE, MAX_ZOOM_SCALE);

    // After the new zoom scale is computed, we can use it to compute the new offset
    const actualCellSize = NATURAL_CELL_SIZE * newZoomScale;

    const actualWorldX = actualCellSize * worldX;
    const actualWorldY = actualCellSize * worldY;
    const actualWorldWidth = actualCellSize * worldWidth;
    const actualWorldHeight = actualCellSize * worldHeight;

    const actualWorldCenterX = actualWorldX + actualWorldWidth / 2.0;
    const actualWorldCenterY = actualWorldY + actualWorldHeight / 2.0;

    // Offset should be the center of the canvas,
    // plus the difference between the world center and true center
    this.offsetX = canvasWidth / 2.0 + actualWorldCenterX * -1.0;
    this.offsetY = canvasHeight / 2.0 + actualWorldCenterY * -1.0;

    this.zoomScale = newZoomScale;

    this.update();
  }

  public forceUpdate(): void {
    this._clear();
    this._context.fillStyle = this._color;

    this._world.cells.forEach((cell) => {
      this._drawCell(cell.x, cell.y);
    });
  }

  public update(): void {
    if (this.shouldSkipUpdate?.()) {
      return;
    }

    this.forceUpdate();
  }
}
