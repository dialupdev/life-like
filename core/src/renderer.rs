use std::f64;
use wasm_bindgen::prelude::*;
use web_sys::{CanvasRenderingContext2d, HtmlCanvasElement};

#[wasm_bindgen]
pub struct Renderer {
    canvas: HtmlCanvasElement,
    context: CanvasRenderingContext2d,
    pixel_ratio: u8,
    natural_cell_size: f64,
    color: JsValue,
}

#[wasm_bindgen]
impl Renderer {
    pub fn new(
        canvas: HtmlCanvasElement,
        pixel_ratio: u8,
        natural_cell_size: f64,
        color: JsValue,
    ) -> Self {
        let context = canvas
            .get_context("2d")
            .unwrap()
            .unwrap()
            .dyn_into::<CanvasRenderingContext2d>()
            .unwrap();

        Renderer {
            canvas,
            context,
            pixel_ratio,
            natural_cell_size,
            color,
        }
    }

    pub fn update(&self, canvas_offset_x: f64, canvas_offset_y: f64, zoom_scale: f64) {
        self.clear();

        let world_x = 0.0;
        let world_y = 0.0;

        self.context.set_fill_style(&self.color);
        self.draw_cell(
            world_x,
            world_y,
            canvas_offset_x,
            canvas_offset_y,
            zoom_scale,
        );
    }

    fn draw_cell(
        &self,
        world_x: f64,
        world_y: f64,
        canvas_offset_x: f64,
        canvas_offset_y: f64,
        zoom_scale: f64,
    ) {
        let pixel_ratio = self.pixel_ratio as f64;
        let actual_cell_size = self.natural_cell_size * zoom_scale;

        self.context.fill_rect(
            pixel_ratio * actual_cell_size * world_x + pixel_ratio * canvas_offset_x,
            pixel_ratio * actual_cell_size * world_y + pixel_ratio * canvas_offset_y,
            pixel_ratio * actual_cell_size,
            pixel_ratio * actual_cell_size,
        );
    }

    fn clear(&self) {
        self.context.set_fill_style(&JsValue::from_str("#fff"));
        self.context.fill_rect(
            0.0,
            0.0,
            self.canvas.width().into(),
            self.canvas.height().into(),
        );
    }
}
