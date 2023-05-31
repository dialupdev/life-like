use std::collections::HashSet;
use wasm_bindgen::prelude::*;

// https://en.wikipedia.org/wiki/Life-like_cellular_automaton
// http://www.mirekw.com/ca/rullex_life.html
// https://conwaylife.com/wiki/Run_Length_Encoded
#[derive(Clone, Copy)]
#[wasm_bindgen]
pub enum Rule {
    Amoeba,
    Assimilation,
    Coral,
    DayAndNight,
    Diamoeba,
    DryLife,
    Flakes,
    Gnarl,
    HighLife,
    Life,
    LongLife,
    Maze,
    MazeAlt1,
    MazeAlt2,
    Move,
    Seeds,
    Serviettes,
    Stains,
    ThreeFourLife,
    TwoByTwo,
    WalledCities,
}

// // It would be nice to use impl Rule {} for the following functions,
// // but this won't work since enums in JS can't have methods.
pub fn parse(rule: &Rule) -> [HashSet<u8>; 2] {
    let value = value(&rule);
    let mut halves = value.split('/');

    let birth_set = halves
        .next()
        .unwrap()
        .chars()
        .skip(1)
        .map(|char| char.to_digit(10).unwrap() as u8)
        .collect();

    let survival_set = halves
        .next()
        .unwrap()
        .chars()
        .skip(1)
        .map(|char| char.to_digit(10).unwrap() as u8)
        .collect();

    return [birth_set, survival_set];
}

fn value(rule: &Rule) -> &'static str {
    match rule {
        Rule::Amoeba => "B357/S1358",
        Rule::Assimilation => "B345/S4567",
        Rule::Coral => "B3/S45678",
        Rule::DayAndNight => "B3678/S34678",
        Rule::Diamoeba => "B35678/S5678",
        Rule::DryLife => "B37/S23",
        Rule::Flakes => "B3/S012345678",
        Rule::Gnarl => "B1/S1",
        Rule::HighLife => "B36/S23",
        Rule::Life => "B3/S23",
        Rule::LongLife => "B345/S5",
        Rule::Maze => "B3/S12345",
        Rule::MazeAlt1 => "B3/S1234",
        Rule::MazeAlt2 => "B37/S12345",
        Rule::Move => "B368/S245",
        Rule::Seeds => "B2/S",
        Rule::Serviettes => "B234/S",
        Rule::Stains => "B3678/S235678",
        Rule::ThreeFourLife => "B34/S34",
        Rule::TwoByTwo => "B36/S125",
        Rule::WalledCities => "B45678/S2345",
    }
}
