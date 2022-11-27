import PositionController, { Direction } from "../controllers/PositionController";
import PlaybackController from "../controllers/PlaybackController";
import EditController from "../controllers/EditController";
import PluginBuilder, { ResizePlugin, WheelPlugin, DragPlugin, KeyboardPlugin, Plugin } from "./PluginBuilder";

export enum PluginGroup {
  Default = "Default",
  Playback = "Playback",
  Edit = "Edit",
}

export default class PluginManager {
  private _pluginBuilder: PluginBuilder;
  private _positionController: PositionController;
  private _playbackController: PlaybackController;
  private _editController: EditController;
  private _pluginGroups = new Map<PluginGroup, Plugin[]>();

  constructor(
    pluginBuilder: PluginBuilder,
    positionController: PositionController,
    playbackController: PlaybackController,
    editController: EditController
  ) {
    this._pluginBuilder = pluginBuilder;
    this._positionController = positionController;
    this._playbackController = playbackController;
    this._editController = editController;

    this._pluginGroups.set(PluginGroup.Default, [
      new ResizePlugin(this._positionController.fitCanvasToWindow),
      new WheelPlugin(this._positionController.zoomAt),
      new KeyboardPlugin("ArrowUp", () => this._positionController.panInDirection(Direction.Up)),
      new KeyboardPlugin("ArrowRight", () => this._positionController.panInDirection(Direction.Right)),
      new KeyboardPlugin("ArrowDown", () => this._positionController.panInDirection(Direction.Down)),
      new KeyboardPlugin("ArrowLeft", () => this._positionController.panInDirection(Direction.Left)),
    ]);

    this._pluginGroups.set(PluginGroup.Playback, [
      new DragPlugin((_x, _y, deltaX, deltaY) => this._positionController.translateOffset(deltaX, deltaY), {
        cursor: "grabbing",
      }),
      new KeyboardPlugin("t", this._playbackController.tick),
      new KeyboardPlugin("p", this._playbackController.togglePlaying),
      new KeyboardPlugin("c", this._positionController.recenterOffset),
    ]);

    this._pluginGroups.set(PluginGroup.Edit, [new DragPlugin(this._editController.draw)]);
  }

  public activateGroup(pluginGroup: PluginGroup): void {
    const plugins = this._pluginGroups.get(pluginGroup);

    for (const plugin of plugins) {
      this._pluginBuilder.activate(plugin);
    }
  }

  public deactivateGroup(pluginGroup: PluginGroup): void {
    const plugins = this._pluginGroups.get(pluginGroup);

    for (const plugin of plugins) {
      this._pluginBuilder.deactivate(plugin);
    }
  }
}
