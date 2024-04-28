import { configure } from "mobx";
import { PIXEL_RATIO, NATURAL_CELL_SIZE, SIDEBAR_WIDTH } from "./Constants";
import { Config } from "./core/Config";
import { Layout } from "./core/Layout";
import { Library } from "./core/Library";
import { Playback } from "./core/Playback";
import { Renderer } from "./core/Renderer";
import { World } from "./core/World";
import { PluginBuilder } from "./plugins/PluginBuilder";
import { PluginManager, PluginGroup } from "./plugins/PluginManager";
import { AppStore } from "./stores/AppStore";
import { ConfigStore } from "./stores/ConfigStore";
import { LayoutStore } from "./stores/LayoutStore";
import { LibraryStore } from "./stores/LibraryStore";
import { PlaybackStore } from "./stores/PlaybackStore";
import "./ui/x-app";

configure({
  enforceActions: "always",
});

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const context = canvas.getContext("2d", { alpha: false })!;

canvas.style.left = `${SIDEBAR_WIDTH}px`;

const config = new Config();
const world = new World();
const layout = new Layout(canvas, PIXEL_RATIO, NATURAL_CELL_SIZE);
const renderer = new Renderer(layout, context, "#A76FDE");
const playback = new Playback(config, world, renderer);
const library = new Library(world);

const configStore = new ConfigStore(config, playback);
const layoutStore = new LayoutStore(canvas, world, layout, renderer);
const playbackStore = new PlaybackStore(playback);
const libraryStore = new LibraryStore(library, configStore, layoutStore, playbackStore);
const appStore = new AppStore(world, layoutStore, playbackStore);

const pluginBuilder = new PluginBuilder(canvas);
const pluginManager = new PluginManager(pluginBuilder, layoutStore, playbackStore, appStore);

pluginManager.activateGroup(PluginGroup.default);
pluginManager.activateGroup(PluginGroup.playback);

const app = document.createElement("x-app");

app.configStore = configStore;
app.layoutStore = layoutStore;
app.playbackStore = playbackStore;
app.libraryStore = libraryStore;
app.appStore = appStore;

document.body.appendChild(app);
