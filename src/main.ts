import World from "./game/World";
import "./components/x-controls";

// Device pixel ratio
const PIXEL_RATIO = devicePixelRatio;
// Size of each cell
const CELL_SIZE_PIXELS = 5 * PIXEL_RATIO;
// Number of cells horizontally
const GRID_WIDTH = 120;
// Number of cells vertically
const GRID_HEIGHT = 120;
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

const world = new World(canvas, {
  CELL_SIZE_PIXELS,
  GRID_WIDTH,
  GRID_HEIGHT,
  GRID_WIDTH_PIXELS,
  GRID_HEIGHT_PIXELS,
});

const controls = document.createElement("x-controls");
controls.world = world;

document.body.appendChild(controls);
document.body.appendChild(canvas);
