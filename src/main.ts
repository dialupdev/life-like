import { configure } from "mobx";
import { PIXEL_RATIO, NATURAL_CELL_SIZE, SIDEBAR_WIDTH } from "./Constants";
import { AppController } from "./controllers/AppController";
import { ConfigController } from "./controllers/ConfigController";
import { LayoutController } from "./controllers/LayoutController";
import { Config } from "./core/Config";
import { Layout } from "./core/Layout";
import { Renderer } from "./core/Renderer";
import { World } from "./core/World";
import { PluginBuilder } from "./plugins/PluginBuilder";
import { PluginManager, PluginGroup } from "./plugins/PluginManager";
import "./ui/x-app";

configure({
  enforceActions: "always",
});

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const context = canvas.getContext("2d", { alpha: false })!;

canvas.style.left = `${SIDEBAR_WIDTH}px`;

const world = new World();
const config = new Config();
const layout = new Layout(canvas, PIXEL_RATIO, NATURAL_CELL_SIZE);
const renderer = new Renderer(context, "#A76FDE");

const configController = new ConfigController(config);
const layoutController = new LayoutController(canvas, layout, world, renderer);
const appController = new AppController(world, config, layout, renderer, layoutController);

const pluginBuilder = new PluginBuilder(canvas);
const pluginManager = new PluginManager(pluginBuilder, layoutController, appController);

pluginManager.activateGroup(PluginGroup.Default);
pluginManager.activateGroup(PluginGroup.Playback);

const app = document.createElement("x-app");

app.configController = configController;
app.layoutController = layoutController;
app.appController = appController;

document.body.appendChild(app);
