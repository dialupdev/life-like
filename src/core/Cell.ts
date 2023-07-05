export class Cell {
  public x: number;
  public y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  public static fromHash(hash: string): Cell {
    const splitHash = hash.split(",");

    return new Cell(parseInt(splitHash[0], 10), parseInt(splitHash[1], 10));
  }

  public hash(): string {
    return `${this.x},${this.y}`;
  }

  public generateNeighbors(): [Cell, Cell, Cell, Cell, Cell, Cell, Cell, Cell] {
    return [
      new Cell(this.x - 1, this.y - 1),
      new Cell(this.x - 1, this.y),
      new Cell(this.x - 1, this.y + 1),
      new Cell(this.x, this.y - 1),
      new Cell(this.x, this.y + 1),
      new Cell(this.x + 1, this.y - 1),
      new Cell(this.x + 1, this.y),
      new Cell(this.x + 1, this.y + 1),
    ];
  }
}
