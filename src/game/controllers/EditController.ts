import { makeObservable, action } from "mobx";
import { PIXEL_RATIO, NATURAL_CELL_SIZE, SIDEBAR_WIDTH } from "../../Constants";
import { Cell } from "../Cell";
import { WorldModel } from "../models/WorldModel";
import { PositionModel } from "../models/PositionModel";
import { EditModel, Tool } from "../models/EditModel";
import { RenderSystem } from "../systems/RenderSystem";

export class EditController extends EventTarget {
  private _worldModel: WorldModel;
  private _positionModel: PositionModel;
  private _editModel: EditModel;
  private _renderSystem: RenderSystem;

  constructor(worldModel: WorldModel, positionModel: PositionModel, editModel: EditModel, renderSystem: RenderSystem) {
    super();

    this._worldModel = worldModel;
    this._positionModel = positionModel;
    this._editModel = editModel;
    this._renderSystem = renderSystem;

    this.draw = this.draw.bind(this);
    this.start = this.start.bind(this);
    this.stop = this.stop.bind(this);

    makeObservable(this, {
      start: action,
      stop: action,
    });
  }

  public draw(windowX: number, windowY: number): void {
    const canvasX = PIXEL_RATIO * (windowX - SIDEBAR_WIDTH) - PIXEL_RATIO * this._positionModel.offsetX;
    const canvasY = PIXEL_RATIO * windowY - PIXEL_RATIO * this._positionModel.offsetY;

    const cellSize = NATURAL_CELL_SIZE * this._positionModel.zoomScale;

    const worldX = Math.floor(canvasX / cellSize / PIXEL_RATIO);
    const worldY = Math.floor(canvasY / cellSize / PIXEL_RATIO);

    const cell = new Cell(worldX, worldY);
    const cellExists = this._worldModel.cells.has(cell.hash());

    switch (this._editModel.activeTool) {
      case Tool.Pencil:
        if (!cellExists) this._worldModel.spawn(cell);
        break;
      case Tool.Eraser:
        if (cellExists) this._worldModel.kill(cell);
        break;
    }

    this._renderSystem.tickLazy();
  }

  public start(): void {
    this.dispatchEvent(new Event("start"));

    this._editModel.editing = true;
  }

  public stop(): void {
    this.dispatchEvent(new Event("stop"));

    this._editModel.editing = false;
  }

  public setActiveTool(tool: Tool): void {
    this._editModel.activeTool = tool;
  }

  public get model(): Readonly<EditModel> {
    return this._editModel;
  }
}
