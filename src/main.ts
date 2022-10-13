import World from "./game/World";
import LifecycleSystem from "./game/systems/LifecycleSystem";
import RenderSystem from "./game/systems/RenderSystem";
import "./components/x-world-controls";

// Device pixel ratio
const PIXEL_RATIO = devicePixelRatio;
// Size of each cell
const CELL_SIZE_PIXELS = 10 * PIXEL_RATIO;
// Number of cells horizontally
const GRID_WIDTH = 60;
// Number of cells vertically
const GRID_HEIGHT = 60;
// Grid width in pixels
const GRID_WIDTH_PIXELS = GRID_WIDTH * CELL_SIZE_PIXELS;
// Grid height in pixels
const GRID_HEIGHT_PIXELS = GRID_HEIGHT * CELL_SIZE_PIXELS;

const canvas = document.createElement("canvas");
canvas.width = GRID_WIDTH_PIXELS;
canvas.height = GRID_HEIGHT_PIXELS;
canvas.setAttribute(
  "style",
  `
    border: 1px solid #eee;
    height: ${GRID_HEIGHT_PIXELS / PIXEL_RATIO}px;
    image-rendering: pixelated;
    width: ${GRID_WIDTH_PIXELS / PIXEL_RATIO}px;
  `
);
const ctx = canvas.getContext("2d");

const world = new World();

// Randomized grid
for (let x = 0; x < GRID_WIDTH; x++) {
  for (let y = 0; y < GRID_HEIGHT; y++) {
    if (Math.random() < 0.5) {
      world.createCell(x, y);
    }
  }
}

world.registerSystem(new LifecycleSystem(world));
world.registerSystem(
  new RenderSystem(world, ctx, {
    CELL_SIZE_PIXELS,
    GRID_WIDTH,
    GRID_HEIGHT,
    GRID_WIDTH_PIXELS,
    GRID_HEIGHT_PIXELS,
  })
);

world.renderBeforeFirstTick();

const worldControls = document.createElement("x-world-controls");
worldControls.addEventListener("tick", world.tick.bind(world));
worldControls.addEventListener("play", world.play.bind(world));
worldControls.addEventListener("pause", world.pause.bind(world));

document.body.appendChild(worldControls);
document.body.appendChild(canvas);
