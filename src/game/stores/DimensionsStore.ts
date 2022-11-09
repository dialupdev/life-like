export default class DimensionsStore {
  public cellSize: number; // Size of each cell in pixels
  public gridWidth: number; // Number of cells horizontally
  public gridHeight: number; // Number of cells vertically

  constructor() {
    this.cellSize = 5 * devicePixelRatio;
    this.gridWidth = 120;
    this.gridHeight = 120;
  }
  public get gridDisplayWidth(): number {
    return this.cellSize * this.gridWidth;
  }

  public get gridDisplayHeight(): number {
    return this.cellSize * this.gridHeight;
  }
}
