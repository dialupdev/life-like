use wasm_bindgen::prelude::*;

pub mod cell;
pub mod layout;
pub mod renderer;
pub mod world;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    pub fn log(s: &str);
}
