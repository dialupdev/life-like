import { makeObservable, action } from "mobx";
import { PIXEL_RATIO, SIDEBAR_WIDTH } from "../../Constants";
import Cell from "../Cell";
import WorldModel from "../models/WorldModel";
import PositionModel from "../models/PositionModel";
import EditModel from "../models/EditModel";
import RenderSystem from "../systems/RenderSystem";

export default class EditController extends EventTarget {
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

    makeObservable(this, {
      start: action,
      stop: action,
    });
  }

  public draw(windowX: number, windowY: number): void {
    const worldX = PIXEL_RATIO * (windowX - SIDEBAR_WIDTH) - this._positionModel.offsetX;
    const worldY = PIXEL_RATIO * windowY - this._positionModel.offsetY;

    const x = Math.floor(worldX / this._positionModel.cellSize / PIXEL_RATIO);
    const y = Math.floor(worldY / this._positionModel.cellSize / PIXEL_RATIO);

    this._worldModel.spawn(new Cell(x, y));
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

  public get model(): Readonly<EditModel> {
    return this._editModel;
  }
}
