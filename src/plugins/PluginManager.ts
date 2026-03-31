import { SIDEBAR_WIDTH } from "../Constants.ts";
import { PanDirection, ZoomDirection } from "../core/Layout.ts";
import { DrawerMode } from "../stores/DrawerStore.ts";
import {
  ResizePlugin,
  WheelPlugin,
  MouseMovePlugin,
  MouseOutPlugin,
  DragPlugin,
  KeyboardPlugin,
} from "./PluginBuilder.ts";

import type { Layout } from "../core/Layout.ts";
import type { Playback } from "../core/Playback.ts";
import type { Renderer } from "../core/Renderer.ts";
import type { AppStore } from "../stores/AppStore.ts";
import type { DrawerStore } from "../stores/DrawerStore.ts";
import type { PluginBuilder, Plugin } from "./PluginBuilder.ts";

export enum PluginGroup {
  default,
  playback,
}

export class PluginManager {
  private _layout: Layout;
  private _renderer: Renderer;
  private _playback: Playback;
  private _drawerStore: DrawerStore;
  private _appStore: AppStore;
  private _pluginBuilder: PluginBuilder;

  private _pluginGroups = new Map<PluginGroup, Plugin[]>();

  constructor(
    layout: Layout,
    renderer: Renderer,
    playback: Playback,
    drawerStore: DrawerStore,
    appStore: AppStore,
    pluginBuilder: PluginBuilder
  ) {
    this._layout = layout;
    this._renderer = renderer;
    this._playback = playback;
    this._drawerStore = drawerStore;
    this._appStore = appStore;
    this._pluginBuilder = pluginBuilder;

    this._pluginGroups.set(PluginGroup.default, [
      new ResizePlugin(this._layout.fitCanvasToWindow),
      new WheelPlugin((delta: number, viewportX: number, viewportY: number) =>
        this._layout.zoomAt(delta, viewportX - SIDEBAR_WIDTH, viewportY)
      ),
      new KeyboardPlugin("mod+=", () => this._layout.zoomByStep(ZoomDirection.in), { preventDefault: true }),
      new KeyboardPlugin("mod+-", () => this._layout.zoomByStep(ZoomDirection.out), { preventDefault: true }),
      new KeyboardPlugin("mod+1", () => this._layout.zoomToScale(1), { preventDefault: true }),
      new KeyboardPlugin("mod+2", () => this._layout.zoomToScale(2), { preventDefault: true }),
      new KeyboardPlugin("mod+0", this._layout.zoomToFit),
      new KeyboardPlugin("ArrowUp", () => this._layout.panInDirection(PanDirection.up), { preventDefault: true }),
      new KeyboardPlugin("ArrowRight", () => this._layout.panInDirection(PanDirection.right), {
        preventDefault: true,
      }),
      new KeyboardPlugin("ArrowDown", () => this._layout.panInDirection(PanDirection.down), {
        preventDefault: true,
      }),
      new KeyboardPlugin("ArrowLeft", () => this._layout.panInDirection(PanDirection.left), {
        preventDefault: true,
      }),
      new MouseMovePlugin((viewportX, viewportY) =>
        this._layout.updateHoverPosition(viewportX - SIDEBAR_WIDTH, viewportY)
      ),
      new MouseOutPlugin(() => this._layout.resetHoverPosition()),
      new KeyboardPlugin("d", () => this._renderer.toggleDebugMode()),
      new KeyboardPlugin("s", () => this._drawerStore.toggleDrawer(DrawerMode.settings)),
      new KeyboardPlugin("l", () => this._drawerStore.toggleDrawer(DrawerMode.patternLibrary)),
      new KeyboardPlugin("Escape", this._drawerStore.closeDrawer),
    ]);

    this._pluginGroups.set(PluginGroup.playback, [
      new DragPlugin((_viewportX, _viewportY, deltaX, deltaY) => this._layout.translateOffset(deltaX, deltaY), {
        cursor: "move",
      }),
      new KeyboardPlugin(" ", this._playback.togglePlaying, { preventDefault: true, stopPropagation: true }), // So that the space bar doesn't click buttons
      new KeyboardPlugin("t", this._playback.tickLazy),
      new KeyboardPlugin("f", this._layout.zoomToFit),
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
