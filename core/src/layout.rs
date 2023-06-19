use super::world::World;
use wasm_bindgen::prelude::*;
use web_sys::HtmlCanvasElement;

const ZOOM_INTENSITY: f64 = 0.01;
const MIN_ZOOM_SCALE: f64 = 0.1; // 10%
const MAX_ZOOM_SCALE: f64 = 64.0; // 6400%
const ZOOM_TO_FIT_PADDING: f64 = 20.0;

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
        let (canvas_width, canvas_height) = self.get_actual_canvas_size();

        let horizontal_fit_scale = (canvas_width - ZOOM_TO_FIT_PADDING * 2.0) / natural_world_width;
        let vertical_fit_scale = (canvas_height - ZOOM_TO_FIT_PADDING * 2.0) / natural_world_height;

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
        self.offset_x = canvas_width / 2.0 + actual_world_center_x * -1.0;
        self.offset_y = canvas_height / 2.0 + actual_world_center_y * -1.0;

        self.zoom_scale = new_zoom_scale;

        new_zoom_scale
    }
}

impl Layout {
    pub fn get_canvas_size(&self) -> (u32, u32) {
        (self.canvas.width(), self.canvas.height())
    }

    pub fn get_actual_canvas_size(&self) -> (f64, f64) {
        let pixel_ratio = self.pixel_ratio as f64;

        (
            self.canvas.width() as f64 / pixel_ratio,
            self.canvas.height() as f64 / pixel_ratio,
        )
    }
}
