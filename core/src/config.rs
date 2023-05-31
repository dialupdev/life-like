use super::rule::Rule;
use std::collections::HashSet;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct Config {
    rule: Rule,
    birth_set: HashSet<u8>,
    survival_set: HashSet<u8>,
}

#[wasm_bindgen]
impl Config {
    pub fn new() -> Config {
        let rule = Rule::Life;
        let [birth_set, survival_set] = rule.parse();

        Config {
            rule,
            birth_set,
            survival_set,
        }
    }

    pub fn get_rule(&self) -> Rule {
        return self.rule;
    }

    pub fn set_rule(&mut self, rule: Rule) {
        [self.birth_set, self.survival_set] = rule.parse();
        self.rule = rule;
    }
}

impl Config {
    pub fn get_birth_set(&self) -> &HashSet<u8> {
        return &self.birth_set;
    }

    pub fn get_survival_set(&self) -> &HashSet<u8> {
        return &self.survival_set;
    }
}
