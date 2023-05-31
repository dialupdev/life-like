import { PluginBuilder, ResizePlugin, WheelPlugin, DragPlugin, KeyboardPlugin, Plugin } from "./PluginBuilder";
import { LayoutController, Direction } from "../controllers/LayoutController";
import { PlaybackController } from "../controllers/PlaybackController";

export enum PluginGroup {
  Default = "Default",
  Playback = "Playback",
}

export class PluginManager {
  private _pluginBuilder: PluginBuilder;
  private _layoutController: LayoutController;
  private _playbackController: PlaybackController;
  private _pluginGroups = new Map<PluginGroup, Plugin[]>();

  constructor(
    pluginBuilder: PluginBuilder,
    layoutController: LayoutController,
    playbackController: PlaybackController
  ) {
    this._pluginBuilder = pluginBuilder;
    this._layoutController = layoutController;
    this._playbackController = playbackController;

    this._pluginGroups.set(PluginGroup.Default, [
      new ResizePlugin(this._layoutController.fitCanvasToWindow),
      new WheelPlugin(this._layoutController.zoomAt),
      new KeyboardPlugin("ArrowUp", () => this._layoutController.panInDirection(Direction.Up)),
      new KeyboardPlugin("ArrowRight", () => this._layoutController.panInDirection(Direction.Right)),
      new KeyboardPlugin("ArrowDown", () => this._layoutController.panInDirection(Direction.Down)),
      new KeyboardPlugin("ArrowLeft", () => this._layoutController.panInDirection(Direction.Left)),
    ]);

    this._pluginGroups.set(PluginGroup.Playback, [
      new DragPlugin((_x, _y, deltaX, deltaY) => this._layoutController.translateOffset(deltaX, deltaY), {
        cursor: "move",
      }),
      new KeyboardPlugin("t", this._playbackController.tick),
      new KeyboardPlugin("p", this._playbackController.togglePlaying),
      new KeyboardPlugin("c", this._layoutController.reset),
    ]);
  }

  public activateGroup(pluginGroup: PluginGroup): void {
    const plugins = this._pluginGroups.get(pluginGroup)!;

    for (const plugin of plugins) {
      this._pluginBuilder.activate(plugin);
    }
  }

  public deactivateGroup(pluginGroup: PluginGroup): void {
    const plugins = this._pluginGroups.get(pluginGroup)!;

    for (const plugin of plugins) {
      this._pluginBuilder.deactivate(plugin);
    }
  }
}
