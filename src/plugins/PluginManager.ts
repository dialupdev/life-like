import { SIDEBAR_WIDTH } from "../Constants.ts";
import { PanDirection, ZoomDirection } from "../core/Renderer.ts";
import { DrawerMode } from "../stores/DrawerStore.ts";
import { ResizePlugin, WheelPlugin, DragPlugin, KeyboardPlugin } from "./PluginBuilder.ts";

import type { Playback } from "../core/Playback.ts";
import type { Renderer } from "../core/Renderer.ts";
import type { AppStore } from "../stores/AppStore.ts";
import type { DrawerStore } from "../stores/DrawerStore.ts";
import type { LayoutStore } from "../stores/LayoutStore.ts";
import type { PluginBuilder, Plugin } from "./PluginBuilder.ts";

export enum PluginGroup {
  default,
  playback,
}

export class PluginManager {
  private _pluginBuilder: PluginBuilder;
  private _renderer: Renderer;
  private _playback: Playback;
  private _drawerStore: DrawerStore;
  private _layoutStore: LayoutStore;
  private _appStore: AppStore;
  private _pluginGroups = new Map<PluginGroup, Plugin[]>();

  constructor(
    pluginBuilder: PluginBuilder,
    renderer: Renderer,
    playback: Playback,
    drawerStore: DrawerStore,
    layoutStore: LayoutStore,
    appStore: AppStore
  ) {
    this._pluginBuilder = pluginBuilder;
    this._renderer = renderer;
    this._playback = playback;
    this._drawerStore = drawerStore;
    this._layoutStore = layoutStore;
    this._appStore = appStore;

    this._pluginGroups.set(PluginGroup.default, [
      new ResizePlugin(this._layoutStore.fitCanvasToWindow),
      new WheelPlugin((delta: number, windowX: number, windowY: number) => {
        // Zoom point relative to world offset
        const canvasX = windowX - SIDEBAR_WIDTH;
        const canvasY = windowY;

        const normalizedDelta = -delta;

        this._renderer.zoomAt(normalizedDelta, canvasX, canvasY);
      }),
      new KeyboardPlugin("mod+=", () => this._renderer.zoomByStep(ZoomDirection.in), { preventDefault: true }),
      new KeyboardPlugin("mod+-", () => this._renderer.zoomByStep(ZoomDirection.out), { preventDefault: true }),
      new KeyboardPlugin("mod+1", () => this._renderer.zoomToScale(1), { preventDefault: true }),
      new KeyboardPlugin("mod+2", () => this._renderer.zoomToScale(2), { preventDefault: true }),
      new KeyboardPlugin("mod+0", this._renderer.zoomToFit),
      new KeyboardPlugin("ArrowUp", () => this._renderer.panInDirection(PanDirection.up), { preventDefault: true }),
      new KeyboardPlugin("ArrowRight", () => this._renderer.panInDirection(PanDirection.right), {
        preventDefault: true,
      }),
      new KeyboardPlugin("ArrowDown", () => this._renderer.panInDirection(PanDirection.down), {
        preventDefault: true,
      }),
      new KeyboardPlugin("ArrowLeft", () => this._renderer.panInDirection(PanDirection.left), {
        preventDefault: true,
      }),
      new KeyboardPlugin("d", () => this._renderer.toggleDebugMode()),
      new KeyboardPlugin("s", () => this._drawerStore.toggleDrawer(DrawerMode.settings)),
      new KeyboardPlugin("l", () => this._drawerStore.toggleDrawer(DrawerMode.patternLibrary)),
      new KeyboardPlugin("Escape", this._drawerStore.closeDrawer),
    ]);

    this._pluginGroups.set(PluginGroup.playback, [
      new DragPlugin((_x, _y, deltaX, deltaY) => this._renderer.translateOffset(deltaX, deltaY), {
        cursor: "move",
      }),
      new KeyboardPlugin(" ", this._playback.togglePlaying, { preventDefault: true, stopPropagation: true }), // So that the space bar doesn't click buttons
      new KeyboardPlugin("t", this._playback.tickLazy),
      new KeyboardPlugin("f", this._renderer.zoomToFit),
      new KeyboardPlugin("w", this._appStore.randomize),
      new KeyboardPlugin("r", this._appStore.rewind),
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
