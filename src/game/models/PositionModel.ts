import { PIXEL_RATIO } from "../../Constants";

export default class PositionModel {
  public offsetX = 0;
  public offsetY = 0;
  public cellSize = 5;

  public setOffset(x: number, y: number): void {
    this.offsetX = PIXEL_RATIO * x;
    this.offsetY = PIXEL_RATIO * y;
  }

  public translateOffset(deltaX: number, deltaY: number): void {
    this.offsetX += PIXEL_RATIO * deltaX;
    this.offsetY += PIXEL_RATIO * deltaY;
  }

  public zoomAt(delta: number, x: number, y: number): void {
    if (delta < 0) {
      this.offsetX -= Math.round((this.offsetX - PIXEL_RATIO * x) / 2);
      this.offsetY -= Math.round((this.offsetY - PIXEL_RATIO * y) / 2);
      this.cellSize /= 2;
    } else {
      this.offsetX += Math.round(this.offsetX - PIXEL_RATIO * x);
      this.offsetY += Math.round(this.offsetY - PIXEL_RATIO * y);
      this.cellSize *= 2;
    }
  }

  public resetCellSize(): void {
    this.cellSize = 5;
  }
}
