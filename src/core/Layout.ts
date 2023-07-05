import { World } from "./World";
import { MathUtils } from "../utils/MathUtils";

const ZOOM_INTENSITY = 0.01;
const MIN_ZOOM_SCALE = 0.1; // 10%
const MAX_ZOOM_SCALE = 64.0; // 6400%
const ZOOM_SCALE_STEPS = [0.1, 0.15, 0.25, 0.33, 0.5, 0.75, 1.0, 1.5, 2.0, 3.0, 4.0, 8.0, 12.0, 16.0, 32.0, 64.0];
const ZOOM_TO_FIT_PADDING = 0.15; // 15%

export enum PanDirection {
  Up = "Up",
  Right = "Right",
  Down = "Down",
  Left = "Left",
}

export enum ZoomDirection {
  In,
  Out,
}

export class Layout {
  private _canvas: HTMLCanvasElement;
  public pixelRatio: number; // window.devicePixelRatio
  public naturalCellSize: number; // Cell size at 100% zoom
  public offsetX: number; // Not including pixel ratio
  public offsetY: number; // Not including pixel ratio
  public zoomScale: number;

  constructor(canvas: HTMLCanvasElement, pixelRatio: number, naturalCellSize: number) {
    this._canvas = canvas;
    this.pixelRatio = pixelRatio;
    this.naturalCellSize = naturalCellSize;
    this.offsetX = 0.0;
    this.offsetY = 0.0;
    this.zoomScale = 1.0; // 100%
  }

  public getCanvasSize(): [number, number] {
    const pixelRatio = this.pixelRatio;

    return [this._canvas.width / pixelRatio, this._canvas.height / pixelRatio];
  }

  public setCanvasSize(width: number, height: number) {
    this._canvas.width = width;
    this._canvas.height = height;
  }

  public setOffset(x: number, y: number) {
    this.offsetX = x;
    this.offsetY = y;
  }

  public translateOffset(deltaX: number, deltaY: number) {
    this.offsetX += deltaX;
    this.offsetY += deltaY;
  }

  public zoomToScale(scale: number) {
    // Clamp zoom scale within valid range
    const newZoomScale = MathUtils.clamp(scale, MIN_ZOOM_SCALE, MAX_ZOOM_SCALE);

    const [canvasX, canvasY] = this._getCanvasCenterOffset();

    const [tx, ty] = this._computeZoomTranslation(canvasX, canvasY, newZoomScale);

    this.offsetX += tx;
    this.offsetY += ty;

    this.zoomScale = newZoomScale;
  }

  public zoomByStep(direction: ZoomDirection): number {
    const isZoomOut = direction === ZoomDirection.Out;
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

    return scaleCandidate;
  }

  public zoomAt(delta: number, canvasX: number, canvasY: number): number {
    // Use canvas offset instead of true canvas position
    canvasX = canvasX - this.offsetX;
    canvasY = canvasY - this.offsetY;

    // I don't understand the next line, but it works...
    let newZoomScale = this.zoomScale * Math.exp(delta * ZOOM_INTENSITY);

    // Clamp zoom scale within valid range
    newZoomScale = MathUtils.clamp(newZoomScale, MIN_ZOOM_SCALE, MAX_ZOOM_SCALE);

    const [tx, ty] = this._computeZoomTranslation(canvasX, canvasY, newZoomScale);

    this.offsetX += tx;
    this.offsetY += ty;

    this.zoomScale = newZoomScale;

    return newZoomScale;
  }

  public zoomToFit(world: World): number {
    const [worldX, worldY, worldWidth, worldHeight] = world.getBounds();

    const naturalCellSize = this.naturalCellSize;

    const naturalWorldWidth = naturalCellSize * worldWidth;
    const naturalWorldHeight = naturalCellSize * worldHeight;

    const [canvasWidth, canvasHeight] = this.getCanvasSize();

    const horizontalFitScale = (canvasWidth * (1.0 - ZOOM_TO_FIT_PADDING)) / naturalWorldWidth;
    const verticalFitScale = (canvasHeight * (1.0 - ZOOM_TO_FIT_PADDING)) / naturalWorldHeight;

    // Use the minimum of horizontal or vertical fit to ensure everything is visible
    let newZoomScale = Math.min(horizontalFitScale, verticalFitScale);

    // Clamp zoom scale within valid range
    newZoomScale = MathUtils.clamp(newZoomScale, MIN_ZOOM_SCALE, MAX_ZOOM_SCALE);

    // After the new zoom scale is computed, we can use it to compute the new offset
    const actualCellSize = naturalCellSize * newZoomScale;

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

    return newZoomScale;
  }

  private _getCanvasCenterOffset(): [number, number] {
    const [canvasWidth, canvasHeight] = this.getCanvasSize();

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
}
