use super::layout::Layout;
use super::world::World;
use std::f64;
use wasm_bindgen::prelude::*;
use web_sys::CanvasRenderingContext2d;

#[wasm_bindgen]
pub struct Renderer {
    context: CanvasRenderingContext2d,
    color: JsValue,
}

#[wasm_bindgen]
impl Renderer {
    pub fn new(context: CanvasRenderingContext2d, color: JsValue) -> Self {
        Renderer { context, color }
    }

    pub fn update(&self, layout: &Layout, world: &World) {
        self.clear(layout);
        self.context.set_fill_style(&self.color);

        world.cells.iter().for_each(|cell| {
            self.draw_cell(layout, cell.x, cell.y);
        });
    }
}

impl Renderer {
    fn draw_cell(&self, layout: &Layout, world_x: i32, world_y: i32) {
        let pixel_ratio = layout.pixel_ratio as f64;
        let actual_cell_size = layout.natural_cell_size as f64 * layout.zoom_scale;

        self.context.fill_rect(
            pixel_ratio * actual_cell_size * world_x as f64 + pixel_ratio * layout.offset_x as f64,
            pixel_ratio * actual_cell_size * world_y as f64 + pixel_ratio * layout.offset_y as f64,
            pixel_ratio * actual_cell_size,
            pixel_ratio * actual_cell_size,
        );
    }

    fn clear(&self, layout: &Layout) {
        let (canvas_width, canvas_height) = layout.get_canvas_size();

        self.context.set_fill_style(&JsValue::from_str("#fff"));
        self.context
            .fill_rect(0.0, 0.0, canvas_width.into(), canvas_height.into());
    }
}
