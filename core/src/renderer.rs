use std::f64;
use wasm_bindgen::prelude::*;
use web_sys::{CanvasRenderingContext2d, HtmlCanvasElement};

#[wasm_bindgen]
pub struct Renderer {
    canvas: HtmlCanvasElement,
    context: CanvasRenderingContext2d,
    pixel_ratio: u32,
    color: JsValue,
}

#[wasm_bindgen]
impl Renderer {
    pub fn new(canvas: HtmlCanvasElement, pixel_ratio: u32, color: JsValue) -> Self {
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
            color,
        }
    }

    pub fn update(&self, offset_x: u32, offset_y: u32) {
        self.clear();

        self.context.begin_path();
        self.context
            .arc(
                (self.pixel_ratio * offset_x - 25).into(),
                (self.pixel_ratio * offset_y - 25).into(),
                (self.pixel_ratio * 50).into(),
                0.0,
                f64::consts::PI * 2.0,
            )
            .unwrap();
        self.context.fill();
    }

    fn clear(&self) {
        self.context.set_fill_style(&JsValue::from_str("#fff"));
        self.context.fill_rect(
            0.0,
            0.0,
            self.canvas.width().into(),
            self.canvas.height().into(),
        );
        self.context.set_fill_style(&self.color);
    }
}
