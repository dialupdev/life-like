import { World, Layout, Renderer } from "core";
import { configure } from "mobx";
import { PIXEL_RATIO, NATURAL_CELL_SIZE, SIDEBAR_WIDTH } from "./Constants";
import { ConfigController } from "./game/controllers/ConfigController";
import { LayoutController } from "./game/controllers/LayoutController";
import { PlaybackController } from "./game/controllers/PlaybackController";
import { WorldController } from "./game/controllers/WorldController";
import { ConfigModel } from "./game/models/ConfigModel";
import { PlaybackModel } from "./game/models/PlaybackModel";
import { PluginBuilder } from "./game/plugins/PluginBuilder";
import { PluginManager, PluginGroup } from "./game/plugins/PluginManager";
import "./components/x-app";

configure({
  enforceActions: "always",
});

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const context = canvas.getContext("2d", { alpha: false })!;

canvas.style.left = `${SIDEBAR_WIDTH}px`;

const world = World.new();
const layout = Layout.new(canvas, PIXEL_RATIO, NATURAL_CELL_SIZE);
const renderer = Renderer.new(context, "lightblue");

const configModel = new ConfigModel();
const playbackModel = new PlaybackModel();

const worldController = new WorldController(world);
const configController = new ConfigController(configModel);
const layoutController = new LayoutController(canvas, layout, world, renderer);
const playbackController = new PlaybackController(layout, world, playbackModel, renderer);

const pluginBuilder = new PluginBuilder(canvas);
const pluginManager = new PluginManager(pluginBuilder, layoutController, playbackController);

pluginManager.activateGroup(PluginGroup.Default);
pluginManager.activateGroup(PluginGroup.Playback);

const app = document.createElement("x-app");

app.worldController = worldController;
app.configController = configController;
app.layoutController = layoutController;
app.playbackController = playbackController;

document.body.appendChild(app);
