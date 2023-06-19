use super::world::World;
use wasm_bindgen::prelude::*;
use web_sys::HtmlCanvasElement;

#[derive(PartialEq)]
#[wasm_bindgen]
pub enum ZoomDirection {
    In,
    Out,
}

const ZOOM_INTENSITY: f64 = 0.01;
const MIN_ZOOM_SCALE: f64 = 0.1; // 10%
const MAX_ZOOM_SCALE: f64 = 64.0; // 6400%
const ZOOM_SCALE_STEPS: [f64; 16] = [
    0.1, 0.15, 0.25, 0.33, 0.5, 0.75, 1.0, 1.5, 2.0, 3.0, 4.0, 8.0, 12.0, 16.0, 32.0, 64.0,
];
const ZOOM_TO_FIT_PADDING: f64 = 0.15; // 15%

#[wasm_bindgen]
pub struct Layout {
    canvas: HtmlCanvasElement,
    pub pixel_ratio: u8,       // window.devicePixelRatio
    pub natural_cell_size: u8, // Cell size at 100% zoom
    pub offset_x: f64,         // Not including pixel ratio
    pub offset_y: f64,         // Not including pixel ratio
    pub zoom_scale: f64,
}

#[wasm_bindgen]
impl Layout {
    pub fn new(canvas: HtmlCanvasElement, pixel_ratio: u8, natural_cell_size: u8) -> Self {
        Layout {
            canvas,
            pixel_ratio,
            natural_cell_size,
            offset_x: 0.0,
            offset_y: 0.0,
            zoom_scale: 1.0, // 100%
        }
    }

    #[wasm_bindgen(js_name = setCanvasSize)]
    pub fn set_canvas_size(&self, width: u32, height: u32) {
        self.canvas.set_width(width);
        self.canvas.set_height(height);
    }

    #[wasm_bindgen(js_name = setOffset)]
    pub fn set_offset(&mut self, x: f64, y: f64) {
        self.offset_x = x;
        self.offset_y = y;
    }

    #[wasm_bindgen(js_name = translateOffset)]
    pub fn translate_offset(&mut self, delta_x: f64, delta_y: f64) {
        self.offset_x += delta_x;
        self.offset_y += delta_y;
    }

    #[wasm_bindgen(js_name = setZoomScale)]
    pub fn set_zoom_scale(&mut self, scale: f64) {
        self.zoom_scale = scale;
    }

    #[wasm_bindgen(js_name = zoomByStep)]
    pub fn zoom_by_step(&mut self, direction: ZoomDirection) -> f64 {
        let is_zoom_out = direction == ZoomDirection::Out;
        let increment: isize = if is_zoom_out { -1 } else { 1 };
        let last_step_index = ZOOM_SCALE_STEPS.len() as isize - 1;
        let mut step_index: isize = if is_zoom_out { last_step_index } else { 0 };
        let mut scale_candidate = if is_zoom_out {
            MAX_ZOOM_SCALE
        } else {
            MIN_ZOOM_SCALE
        };

        while step_index >= 0 && step_index <= last_step_index {
            scale_candidate = ZOOM_SCALE_STEPS[step_index as usize];

            // Return the next closest scale step
            if (is_zoom_out && scale_candidate < self.zoom_scale)
                || (!is_zoom_out && scale_candidate > self.zoom_scale)
            {
                break;
            }

            step_index += increment;
        }

        self.zoom_scale = scale_candidate;

        scale_candidate
    }

    #[wasm_bindgen(js_name = zoomAt)]
    pub fn zoom_at(&mut self, delta: f64, canvas_x: f64, canvas_y: f64) -> f64 {
        let old_zoom_scale = self.zoom_scale;
        // I don't understand the next line, but it works...
        let new_zoom_scale = self.zoom_scale * ((delta * ZOOM_INTENSITY).exp());

        // Clamp zoom scale within valid range
        let new_zoom_scale = new_zoom_scale.clamp(MIN_ZOOM_SCALE, MAX_ZOOM_SCALE);

        // Get the canvas position of the mouse after scaling
        let new_x = canvas_x * (new_zoom_scale / old_zoom_scale);
        let new_y = canvas_y * (new_zoom_scale / old_zoom_scale);

        // Reverse the translation caused by scaling
        self.offset_x += canvas_x - new_x;
        self.offset_y += canvas_y - new_y;

        self.zoom_scale = new_zoom_scale;

        new_zoom_scale
    }

    #[wasm_bindgen(js_name = zoomToFit)]
    pub fn zoom_to_fit(&mut self, world: &World) -> f64 {
        let (world_x, world_y, world_width, world_height) = world.get_bounds();

        let natural_cell_size = self.natural_cell_size as f64;

        let natural_world_width = natural_cell_size * world_width as f64;
        let natural_world_height = natural_cell_size * world_height as f64;

        // We're using the actual canvas size here (not including pixel ratio)
        let (canvas_width, canvas_height) = self.get_canvas_size();

        let horizontal_fit_scale =
            (canvas_width as f64 * (1.0 - ZOOM_TO_FIT_PADDING)) / natural_world_width;
        let vertical_fit_scale =
            (canvas_height as f64 * (1.0 - ZOOM_TO_FIT_PADDING)) / natural_world_height;

        // Use the minimum of horizontal or vertical fit to ensure everything is visible
        let new_zoom_scale = f64::min(horizontal_fit_scale, vertical_fit_scale);

        // Clamp zoom scale within valid range
        let new_zoom_scale = new_zoom_scale.clamp(MIN_ZOOM_SCALE, MAX_ZOOM_SCALE);

        // After the new zoom scale is computed, we can use it to compute the new offset
        let actual_cell_size = natural_cell_size * new_zoom_scale;

        let actual_world_x = actual_cell_size * world_x as f64;
        let actual_world_y = actual_cell_size * world_y as f64;
        let actual_world_width = actual_cell_size * world_width as f64;
        let actual_world_height = actual_cell_size * world_height as f64;

        let actual_world_center_x = actual_world_x + actual_world_width / 2.0;
        let actual_world_center_y = actual_world_y + actual_world_height / 2.0;

        // Offset should be the center of the canvas,
        // plus the difference between the world center and true center
        self.offset_x = canvas_width as f64 / 2.0 + actual_world_center_x * -1.0;
        self.offset_y = canvas_height as f64 / 2.0 + actual_world_center_y * -1.0;

        self.zoom_scale = new_zoom_scale;

        new_zoom_scale
    }
}

impl Layout {
    pub fn get_canvas_size(&self) -> (u32, u32) {
        let pixel_ratio = self.pixel_ratio as u32;

        (
            self.canvas.width() as u32 / pixel_ratio,
            self.canvas.height() as u32 / pixel_ratio,
        )
    }
}
