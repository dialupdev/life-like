import { ContextProvider } from "@lit/context";
import { configure } from "mobx";

import { Layout, layoutContext } from "./core/Layout.ts";
import { Playback, playbackContext } from "./core/Playback.ts";
import { Renderer, rendererContext } from "./core/Renderer.ts";
import { World, worldContext } from "./core/World.ts";
import { PluginBuilder } from "./plugins/PluginBuilder.ts";
import { PluginGroup } from "./plugins/PluginManager.ts";
import { PluginManager } from "./plugins/PluginManager.ts";
import { AppStore, appStoreContext } from "./stores/AppStore.ts";
import { DrawerStore, drawerStoreContext } from "./stores/DrawerStore.ts";
import { PatternStore, patternStoreContext } from "./stores/PatternStore.ts";

import "./ui/x-app.ts";

configure({
  enforceActions: "always",
});

const canvas = document.createElement("canvas");
const context = canvas.getContext("2d", { alpha: false })!;

const world = new World();
const layout = new Layout(canvas, context, world);
const renderer = new Renderer(context, layout, world, "#0065fd");
const playback = new Playback(world, renderer);

const drawerStore = new DrawerStore();
const patternStore = new PatternStore(world, layout);
const appStore = new AppStore(world, layout, playback);

new ContextProvider(document.body, {
  context: worldContext,
  initialValue: world,
});

new ContextProvider(document.body, {
  context: layoutContext,
  initialValue: layout,
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
  context: patternStoreContext,
  initialValue: patternStore,
});

new ContextProvider(document.body, {
  context: appStoreContext,
  initialValue: appStore,
});

const pluginBuilder = new PluginBuilder(canvas);
const pluginManager = new PluginManager(layout, renderer, playback, drawerStore, appStore, pluginBuilder);

pluginManager.activateGroup(PluginGroup.default);
pluginManager.activateGroup(PluginGroup.playback);

const app = document.createElement("x-app");
app.appendChild(canvas);

document.body.appendChild(app);
