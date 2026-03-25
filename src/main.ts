import { ContextProvider } from "@lit/context";
import { configure } from "mobx";

import { Playback, playbackContext } from "./core/Playback.ts";
import { Renderer, rendererContext } from "./core/Renderer.ts";
import { World, worldContext } from "./core/World.ts";
import { PluginBuilder } from "./plugins/PluginBuilder.ts";
import { PluginGroup } from "./plugins/PluginManager.ts";
import { PluginManager } from "./plugins/PluginManager.ts";
import { AppStore, appStoreContext } from "./stores/AppStore.ts";
import { DrawerStore, drawerStoreContext } from "./stores/DrawerStore.ts";
import { LayoutStore } from "./stores/LayoutStore.ts";
import { LibraryStore, libraryStoreContext } from "./stores/LibraryStore.ts";

import "./ui/x-app.ts";

configure({
  enforceActions: "always",
});

const canvas = document.createElement("canvas");
const context = canvas.getContext("2d", { alpha: false })!;

const world = new World();
const renderer = new Renderer(canvas, context, world, "oklch(0.5523 0.2476 256.83)");
const playback = new Playback(world, renderer);

const drawerStore = new DrawerStore();
const layoutStore = new LayoutStore(canvas, renderer);
const libraryStore = new LibraryStore(world, renderer);
const appStore = new AppStore(world, renderer, playback);

new ContextProvider(document.body, {
  context: worldContext,
  initialValue: world,
});

new ContextProvider(document.body, {
  context: rendererContext,
  initialValue: renderer,
});

new ContextProvider(document.body, {
  context: playbackContext,
  initialValue: playback,
});

new ContextProvider(document.body, {
  context: drawerStoreContext,
  initialValue: drawerStore,
});

new ContextProvider(document.body, {
  context: libraryStoreContext,
  initialValue: libraryStore,
});

new ContextProvider(document.body, {
  context: appStoreContext,
  initialValue: appStore,
});

const pluginBuilder = new PluginBuilder(canvas);
const pluginManager = new PluginManager(pluginBuilder, renderer, playback, drawerStore, layoutStore, appStore);

pluginManager.activateGroup(PluginGroup.default);
pluginManager.activateGroup(PluginGroup.playback);

const app = document.createElement("x-app");
app.appendChild(canvas);

document.body.appendChild(app);
