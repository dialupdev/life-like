export type CellHash = string;

export default class Cell {
  public x: number;
  public y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  public static fromHash(hash: CellHash): Cell {
    const splitHash = hash.split(",");
    return new Cell(parseInt(splitHash[0], 10), parseInt(splitHash[1], 10));
  }

  public hash(): CellHash {
    return `${this.x},${this.y}`;
  }

  public generateNeighbors(): Set<Cell> {
    return new Set<Cell>([
      new Cell(this.x - 1, this.y - 1),
      new Cell(this.x - 1, this.y),
      new Cell(this.x - 1, this.y + 1),
      new Cell(this.x, this.y - 1),
      new Cell(this.x, this.y + 1),
      new Cell(this.x + 1, this.y - 1),
      new Cell(this.x + 1, this.y),
      new Cell(this.x + 1, this.y + 1),
    ]);
  }
}
