import WorldStore from "../stores/WorldStore";
import ConfigStore from "../stores/ConfigStore";
import DimensionsStore from "../stores/DimensionsStore";
import type { System } from "./System";

export default class RenderSystem implements System {
  private _worldStore: WorldStore;
  private _configStore: ConfigStore;
  private _dimensionsStore: DimensionsStore;
  private _context: CanvasRenderingContext2D;

  constructor(
    worldStore: WorldStore,
    configStore: ConfigStore,
    dimensionsStore: DimensionsStore,
    context: CanvasRenderingContext2D
  ) {
    this._worldStore = worldStore;
    this._configStore = configStore;
    this._dimensionsStore = dimensionsStore;
    this._context = context;

    this._context.strokeStyle = "#eee";
    this._context.textBaseline = "top";
    this._context.font = "22px monospace";
  }

  private _clearBoard(): void {
    this._context.clearRect(
      0,
      0,
      this._dimensionsStore.gridWidth * this._dimensionsStore.cellSize,
      this._dimensionsStore.gridHeight * this._dimensionsStore.cellSize
    );
  }

  private _drawGridLines(): void {
    // Horizontal grid lines
    for (let i = 1; i < this._dimensionsStore.gridHeight; i++) {
      this._context.beginPath();
      this._context.moveTo(0, i * this._dimensionsStore.cellSize);
      this._context.lineTo(
        this._dimensionsStore.gridWidth * this._dimensionsStore.cellSize,
        i * this._dimensionsStore.cellSize
      );
      this._context.stroke();
    }

    // Vertical grid lines
    for (let i = 1; i < this._dimensionsStore.gridWidth; i++) {
      this._context.beginPath();
      this._context.moveTo(i * this._dimensionsStore.cellSize, 0);
      this._context.lineTo(
        i * this._dimensionsStore.cellSize,
        this._dimensionsStore.gridHeight * this._dimensionsStore.cellSize
      );
      this._context.stroke();
    }
  }

  private _drawCell(x: number, y: number): void {
    this._context.fillStyle = "rgb(10, 90, 70)";
    this._context.fillRect(
      this._dimensionsStore.cellSize * x,
      this._dimensionsStore.cellSize * y,
      this._dimensionsStore.cellSize,
      this._dimensionsStore.cellSize
    );
  }

  private _printInfo(ticks: number, minX: number, maxX: number, minY: number, maxY: number): void {
    this._context.fillStyle = "black";
    this._context.fillText(`Rule: ${this._configStore.rule}`, 0, 0);
    this._context.fillText(`Ticks: ${ticks}`, 0, 22);
    this._context.fillText(`Cells: ${this._worldStore.cells.size}`, 0, 44);
    this._context.fillText(`Horizontal bounds: ${minX}, ${maxX}`, 0, 66);
    this._context.fillText(`Vertical bounds: ${minY}, ${maxY}`, 0, 88);
  }

  public tick(ticks: number): void {
    this._clearBoard();
    this._drawGridLines();

    let minX = 0;
    let maxX = 0;
    let minY = 0;
    let maxY = 0;

    for (const cell of this._worldStore.cells.values()) {
      this._drawCell(cell.x, cell.y);

      minX = Math.min(minX, cell.x);
      maxX = Math.max(maxX, cell.x);
      minY = Math.min(minY, cell.y);
      maxY = Math.max(maxY, cell.y);
    }

    this._printInfo(ticks, minX, maxX, minY, maxY);
  }
}
