import { PluginBuilder, ResizePlugin, WheelPlugin, DragPlugin, KeyboardPlugin, Plugin } from "./PluginBuilder";
import { PanDirection, ZoomDirection } from "../core/Layout";
import { AppStore } from "../stores/AppStore";
import { LayoutStore } from "../stores/LayoutStore";
import { PlaybackStore } from "../stores/PlaybackStore";

export enum PluginGroup {
  default,
  playback,
}

export class PluginManager {
  private _pluginBuilder: PluginBuilder;
  private _layoutStore: LayoutStore;
  private _playbackStore: PlaybackStore;
  private _appStore: AppStore;
  private _pluginGroups = new Map<PluginGroup, Plugin[]>();

  constructor(
    pluginBuilder: PluginBuilder,
    layoutStore: LayoutStore,
    playbackStore: PlaybackStore,
    appStore: AppStore
  ) {
    this._pluginBuilder = pluginBuilder;
    this._layoutStore = layoutStore;
    this._playbackStore = playbackStore;
    this._appStore = appStore;

    this._pluginGroups.set(PluginGroup.default, [
      new ResizePlugin(this._layoutStore.fitCanvasToWindow),
      new WheelPlugin(this._layoutStore.zoomAt),
      new KeyboardPlugin("mod+=", () => this._layoutStore.zoomByStep(ZoomDirection.in)),
      new KeyboardPlugin("mod+-", () => this._layoutStore.zoomByStep(ZoomDirection.out)),
      new KeyboardPlugin("mod+1", () => this._layoutStore.zoomToScale(1)),
      new KeyboardPlugin("mod+2", () => this._layoutStore.zoomToScale(2)),
      new KeyboardPlugin("mod+0", () => this._layoutStore.zoomToFit()),
      new KeyboardPlugin("ArrowUp", () => this._layoutStore.panInDirection(PanDirection.up)),
      new KeyboardPlugin("ArrowRight", () => this._layoutStore.panInDirection(PanDirection.right)),
      new KeyboardPlugin("ArrowDown", () => this._layoutStore.panInDirection(PanDirection.down)),
      new KeyboardPlugin("ArrowLeft", () => this._layoutStore.panInDirection(PanDirection.left)),
    ]);

    this._pluginGroups.set(PluginGroup.playback, [
      new DragPlugin((_x, _y, deltaX, deltaY) => this._layoutStore.translateOffset(deltaX, deltaY), {
        cursor: "move",
      }),
      new KeyboardPlugin(" ", this._playbackStore.togglePlaying, { stopPropagation: true }), // So that the space bar doesn't click buttons
      new KeyboardPlugin("t", this._playbackStore.tickLazy),
      new KeyboardPlugin("f", this._layoutStore.zoomToFit),
      new KeyboardPlugin("r", this._appStore.reset),
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
