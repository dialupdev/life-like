import { szudzikPairSigned, szudzikUnpairSigned } from "../utils/MathUtils";

export class Cell {
  public x: number;
  public y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  public static fromHash(hash: number): Cell {
    const [x, y] = szudzikUnpairSigned(hash);

    return new Cell(x, y);
  }

  public hash(): number {
    return szudzikPairSigned(this.x, this.y);
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
