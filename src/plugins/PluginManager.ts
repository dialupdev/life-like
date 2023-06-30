import { PluginBuilder, ResizePlugin, WheelPlugin, DragPlugin, KeyboardPlugin, Plugin } from "./PluginBuilder";
import { AppController } from "../controllers/AppController";
import { LayoutController, Direction, ZoomDirection } from "../controllers/LayoutController";

export enum PluginGroup {
  Default = "Default",
  Playback = "Playback",
}

export class PluginManager {
  private _pluginBuilder: PluginBuilder;
  private _layoutController: LayoutController;
  private _appController: AppController;
  private _pluginGroups = new Map<PluginGroup, Plugin[]>();

  constructor(pluginBuilder: PluginBuilder, layoutController: LayoutController, appController: AppController) {
    this._pluginBuilder = pluginBuilder;
    this._layoutController = layoutController;
    this._appController = appController;

    this._pluginGroups.set(PluginGroup.Default, [
      new ResizePlugin(this._layoutController.fitCanvasToWindow),
      new WheelPlugin(this._layoutController.zoomAt),
      new KeyboardPlugin("mod+=", () => this._layoutController.zoomByStep(ZoomDirection.In)),
      new KeyboardPlugin("mod+-", () => this._layoutController.zoomByStep(ZoomDirection.Out)),
      new KeyboardPlugin("mod+0", () => this._layoutController.zoomToFit()),
      new KeyboardPlugin("ArrowUp", () => this._layoutController.panInDirection(Direction.Up)),
      new KeyboardPlugin("ArrowRight", () => this._layoutController.panInDirection(Direction.Right)),
      new KeyboardPlugin("ArrowDown", () => this._layoutController.panInDirection(Direction.Down)),
      new KeyboardPlugin("ArrowLeft", () => this._layoutController.panInDirection(Direction.Left)),
    ]);

    this._pluginGroups.set(PluginGroup.Playback, [
      new DragPlugin((_x, _y, deltaX, deltaY) => this._layoutController.translateOffset(deltaX, deltaY), {
        cursor: "move",
      }),
      new KeyboardPlugin("t", this._appController.tick),
      new KeyboardPlugin("p", this._appController.togglePlaying),
      new KeyboardPlugin("c", this._layoutController.zoomToFit),
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
