import { configure } from "mobx";
import { World, Layout, Config, Renderer } from "core";
import { PIXEL_RATIO, NATURAL_CELL_SIZE, SIDEBAR_WIDTH } from "./Constants";
import { ConfigController } from "./controllers/ConfigController";
import { GameController } from "./controllers/GameController";
import { LayoutController } from "./controllers/LayoutController";
import { WorldController } from "./controllers/WorldController";
import { PluginBuilder } from "./plugins/PluginBuilder";
import { PluginManager, PluginGroup } from "./plugins/PluginManager";
import "./ui/x-app";

configure({
  enforceActions: "always",
});

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const context = canvas.getContext("2d", { alpha: false })!;

canvas.style.left = `${SIDEBAR_WIDTH}px`;

const world = World.new();
const config = Config.new();
const layout = Layout.new(canvas, PIXEL_RATIO, NATURAL_CELL_SIZE);
const renderer = Renderer.new(context, "#A76FDE");

const worldController = new WorldController(world);
const configController = new ConfigController(config);
const layoutController = new LayoutController(canvas, layout, world, renderer);
const gameController = new GameController(world, config, layout, renderer);

const pluginBuilder = new PluginBuilder(canvas);
const pluginManager = new PluginManager(pluginBuilder, layoutController, gameController);

pluginManager.activateGroup(PluginGroup.Default);
pluginManager.activateGroup(PluginGroup.Playback);

const app = document.createElement("x-app");

app.worldController = worldController;
app.configController = configController;
app.layoutController = layoutController;
app.gameController = gameController;

document.body.appendChild(app);
