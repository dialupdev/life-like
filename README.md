# Life-like

## Download pattern file from server (entropymine.com)

```sh
npm run patterns:download
```

## Install patterns from source file

```sh
npm run patterns:install
```

## Architecture

### Core modules

- Classes essential to building and rendering the world
- May contain state for these purposes
- May be reactive

### Stores

- Contain state used to render the UI
- May be reactive
- May modify state in core modules using public APIs

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

## References

- https://github.com/copy/life
- https://github.com/raganwald/cafeaulife
- https://github.com/raganwald/hashlife
- https://en.wikipedia.org/wiki/Hashlife
