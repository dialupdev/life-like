import World from "../World";
import { ComponentKey } from "../Components";
import type { System } from "./System";

interface SizeConstants {
  CELL_SIZE_PIXELS: number;
  GRID_WIDTH: number;
  GRID_HEIGHT: number;
  GRID_WIDTH_PIXELS: number;
  GRID_HEIGHT_PIXELS: number;
}

export default class RenderSystem implements System {
  private _world: World;
  private _ctx: CanvasRenderingContext2D;
  private _constants: SizeConstants;

  constructor(world: World, ctx: CanvasRenderingContext2D, constants: SizeConstants) {
    this._world = world;
    this._ctx = ctx;
    this._constants = constants;

    this._ctx.strokeStyle = "#ddd";
    this._ctx.font = "12px monospace";
    this._ctx.textBaseline = "hanging";
  }

  private _clearBoard(): void {
    this._ctx.clearRect(0, 0, this._constants.GRID_WIDTH_PIXELS, this._constants.GRID_HEIGHT_PIXELS);
  }

  private _drawGridLines(): void {
    // Horizontal grid lines
    for (let i = 1; i < this._constants.GRID_HEIGHT; i++) {
      this._ctx.beginPath();
      this._ctx.moveTo(0, i * this._constants.CELL_SIZE_PIXELS);
      this._ctx.lineTo(this._constants.GRID_WIDTH_PIXELS, i * this._constants.CELL_SIZE_PIXELS);
      this._ctx.stroke();
    }

    // Vertical grid lines
    for (let i = 1; i < this._constants.GRID_WIDTH; i++) {
      this._ctx.beginPath();
      this._ctx.moveTo(i * this._constants.CELL_SIZE_PIXELS, 0);
      this._ctx.lineTo(i * this._constants.CELL_SIZE_PIXELS, this._constants.GRID_HEIGHT_PIXELS);
      this._ctx.stroke();
    }
  }

  private _drawCell(x: number, y: number): void {
    const pixelX = x * this._constants.CELL_SIZE_PIXELS;
    const pixelY = y * this._constants.CELL_SIZE_PIXELS;

    this._ctx.fillStyle = "rgb(200, 130, 190)";
    this._ctx.fillRect(pixelX, pixelY, this._constants.CELL_SIZE_PIXELS, this._constants.CELL_SIZE_PIXELS);
    this._ctx.fillStyle = "white";
    this._ctx.fillText(`${x},${y}`, pixelX + 2, pixelY + 2);
  }

  public tick(): void {
    this._clearBoard();
    this._drawGridLines();

    const entities = this._world.getAllEntities();

    for (const entity of entities) {
      if (entity.hasComponent(ComponentKey.Alive)) {
        const { x, y } = entity.getComponent(ComponentKey.Position);
        this._drawCell(x, y);
      }
    }
  }
}
