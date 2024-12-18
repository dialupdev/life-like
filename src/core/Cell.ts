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

  public generateNeighborHashes(): [number, number, number, number, number, number, number, number] {
    return [
      szudzikPairSigned(this.x - 1, this.y - 1),
      szudzikPairSigned(this.x - 1, this.y),
      szudzikPairSigned(this.x - 1, this.y + 1),
      szudzikPairSigned(this.x, this.y - 1),
      szudzikPairSigned(this.x, this.y + 1),
      szudzikPairSigned(this.x + 1, this.y - 1),
      szudzikPairSigned(this.x + 1, this.y),
      szudzikPairSigned(this.x + 1, this.y + 1),
    ];
  }
}
