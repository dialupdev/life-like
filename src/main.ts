import World from "./ECS/World";
import { ComponentKey } from "./ECS/Components";
import RenderSystem from "./ECS/systems/RenderSystem";

// Size of each cell
const CELL_SIZE_PIXELS = 20;
// Number of cells horizontally
const GRID_WIDTH = 30;
// Number of cells vertically
const GRID_HEIGHT = 30;

const GRID_WIDTH_PIXELS = GRID_WIDTH * CELL_SIZE_PIXELS;
const GRID_HEIGHT_PIXELS = GRID_HEIGHT * CELL_SIZE_PIXELS;

const canvas = document.createElement("canvas");
canvas.width = GRID_WIDTH_PIXELS;
canvas.height = GRID_HEIGHT_PIXELS;
canvas.setAttribute("style", `border: 1px solid #aaa; image-rendering: pixelated; width: ${GRID_WIDTH_PIXELS}px;`);
document.body.appendChild(canvas);
const ctx = canvas.getContext("2d");

const world = new World();

world.createEntity().addComponent(ComponentKey.Position, { x: 0, y: 0 }).addComponent(ComponentKey.Alive, {});

world.registerSystem(
  new RenderSystem(world, ctx, {
    CELL_SIZE_PIXELS,
    GRID_WIDTH,
    GRID_HEIGHT,
    GRID_WIDTH_PIXELS,
    GRID_HEIGHT_PIXELS,
  })
);

world.tick();
