# Life-like

https://github.com/copy/life
https://github.com/raganwald/cafeaulife
https://github.com/raganwald/hashlife
https://en.wikipedia.org/wiki/Hashlife

## Architecture

### Model

- Only stores data
- May be reactive

### System

- Has access to Models
- Defines a `tick()` method to operate on Models

### Controller

- Has access to Models and Systems

### Plugin (?)

- Has access to a single Model and Controller
- Defines an `activate()` method to bind Controller behaviors
- Optional: Defines a `deactivate()` method to unbind Controller behaviors

## Versions

V1 game engine (JS via ECS):
http://vasir.net/blog/game-development/how-to-build-entity-component-system-in-javascript

V2 game engine (JS via hash tables):
https://pzemtsov.github.io/2015/04/24/game-of-life-hash-tables-and-hash-codes.html

V3 game engine (Rust via hash tables):
https://rustwasm.github.io/docs/book/game-of-life/introduction.html

Reference:
http://www.mirekw.com/ca/rullex_life.html
https://conwaylife.com/ref/lexicon/lex.htm
https://conwaylife.com/wiki/Plaintext

## Art series

Life-like: Maze
Life-like: Coral
Life-like: Stains?

## Rule ideas

Favorites

- life
- coral
- maze + alts
- move
- dayAndNight

// hm = "B2/S278",
// hm = "B34/S34678",
