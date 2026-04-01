import { Cell } from "../core/Cell.ts";

import type { LifeAlgorithm } from "./LifeAlgorithm.ts";

/**
 * Sparse life-like CA using a **chunk map** (fixed-size square blocks).
 *
 * Stepping builds a **one-cell padded neighborhood** (9 chunks → `(CHUNK_SIZE+2)²` grid)
 * and advances the inner `CHUNK_SIZE²` block with **direct array indexing** (no per-cell
 * `Map` lookups). **Per-chunk live counts** skip work when all nine neighbors are empty.
 * **Next state** uses a **18-entry lookup table** (dead/alive × neighbor count 0–8) for
 * outer-totalistic rules instead of `Set.has` in the hot loop.
 *
 * This is **not** a full port of Golly’s `qlifealgo` (bricks, staggered even/odd slices,
 * tile/supertile dirty flags, `ruletable` slice indexing); see `GollyQuickLife` for the
 * naming entry point and `gollybase/qlifealgo.cpp` for the reference implementation.
 * `forEachCellInRect` only walks chunks that overlap the query rectangle.
 */
const CHUNK_SIZE = 64;

/** Index of last row/column in the padded grid (one past inner chunk edge). */
const PADDED_LAST = CHUNK_SIZE + 1;

const PADDED_SIZE = CHUNK_SIZE + 2;

function chunkKey(chunkX: number, chunkY: number): string {
  return `${chunkX},${chunkY}`;
}

function parseChunkKey(key: string): [number, number] {
  const comma = key.indexOf(",");
  return [Number.parseInt(key.slice(0, comma), 10), Number.parseInt(key.slice(comma + 1), 10)];
}

/**
 * Assemble the `(CHUNK_SIZE+2)²` padded grid for stepping `chunk (chunkX, chunkY)`:
 * center = `c`, eight neighbors = compass names. Missing chunks are treated as all dead.
 */
function fillPaddedNeighborhood(
  pad: Uint8Array,
  nw: Uint8Array | undefined,
  n: Uint8Array | undefined,
  ne: Uint8Array | undefined,
  w: Uint8Array | undefined,
  c: Uint8Array | undefined,
  e: Uint8Array | undefined,
  sw: Uint8Array | undefined,
  s: Uint8Array | undefined,
  se: Uint8Array | undefined
): void {
  const P = PADDED_SIZE;
  pad.fill(0);

  if (c) {
    for (let localY = 0; localY < CHUNK_SIZE; localY++) {
      pad.set(c.subarray(localY * CHUNK_SIZE, (localY + 1) * CHUNK_SIZE), (1 + localY) * P + 1);
    }
  }
  if (n) {
    const northBottomRow = (CHUNK_SIZE - 1) * CHUNK_SIZE;
    pad.set(n.subarray(northBottomRow, northBottomRow + CHUNK_SIZE), 1);
  }
  if (s) {
    pad.set(s.subarray(0, CHUNK_SIZE), PADDED_LAST * P + 1);
  }
  if (w) {
    for (let localY = 0; localY < CHUNK_SIZE; localY++) {
      pad[(1 + localY) * P + 0] = w[localY * CHUNK_SIZE + CHUNK_SIZE - 1];
    }
  }
  if (e) {
    for (let localY = 0; localY < CHUNK_SIZE; localY++) {
      pad[(1 + localY) * P + PADDED_LAST] = e[localY * CHUNK_SIZE];
    }
  }
  if (nw) {
    pad[0] = nw[(CHUNK_SIZE - 1) * CHUNK_SIZE + CHUNK_SIZE - 1];
  }
  if (ne) {
    pad[PADDED_LAST] = ne[(CHUNK_SIZE - 1) * CHUNK_SIZE];
  }
  if (sw) {
    pad[PADDED_LAST * P] = sw[(CHUNK_SIZE - 1) * CHUNK_SIZE + CHUNK_SIZE - 1];
  }
  if (se) {
    pad[PADDED_LAST * P + PADDED_LAST] = se[0];
  }
}

function countChunkPopulation(chunk: Uint8Array): number {
  let count = 0;
  for (let i = 0; i < chunk.length; i++) {
    if (chunk[i]) {
      count++;
    }
  }
  return count;
}

export class QuickLife implements LifeAlgorithm {
  private _birthSet!: Set<number>;
  private _survivalSet!: Set<number>;

  private _chunks = new Map<string, Uint8Array>();
  /** Cached live-cell count per chunk key (only keys with count > 0). */
  private _chunkPop = new Map<string, number>();
  private _population = 0;

  /** Index: dead → [0..8] = neighbor count; alive → [9..17] = 9 + neighbor count. Values 0/1. */
  private _nextTable = new Uint8Array(18);

  private _chunksSnapshot = new Map<string, Uint8Array>();
  private _populationSnapshot = 0;

  constructor() {
    this._birthSet = new Set();
    this._survivalSet = new Set();
    this._rebuildNextStateTable();
  }

  public setRule(birthSet: Set<number>, survivalSet: Set<number>): void {
    this._birthSet = birthSet;
    this._survivalSet = survivalSet;
    this._rebuildNextStateTable();
  }

  private _rebuildNextStateTable(): void {
    const table = new Uint8Array(18);
    for (let alive = 0; alive <= 1; alive++) {
      for (let neighborCount = 0; neighborCount <= 8; neighborCount++) {
        const idx = alive ? 9 + neighborCount : neighborCount;
        const next =
          alive !== 0
            ? this._survivalSet.has(neighborCount)
            : this._birthSet.has(neighborCount);
        table[idx] = next ? 1 : 0;
      }
    }
    this._nextTable = table;
  }

  private _rebuildChunkPopFromChunks(): void {
    this._chunkPop.clear();
    for (const [key, arr] of this._chunks) {
      const population = countChunkPopulation(arr);
      if (population > 0) {
        this._chunkPop.set(key, population);
      }
    }
  }

  public addCell(worldX: number, worldY: number): void {
    const chunkX = Math.floor(worldX / CHUNK_SIZE);
    const chunkY = Math.floor(worldY / CHUNK_SIZE);
    const key = chunkKey(chunkX, chunkY);
    let chunk = this._chunks.get(key);
    if (!chunk) {
      chunk = new Uint8Array(CHUNK_SIZE * CHUNK_SIZE);
      this._chunks.set(key, chunk);
    }
    const localX = worldX - chunkX * CHUNK_SIZE;
    const localY = worldY - chunkY * CHUNK_SIZE;
    const cellIndex = localY * CHUNK_SIZE + localX;
    if (chunk[cellIndex]) {
      return;
    }
    chunk[cellIndex] = 1;
    this._population++;
    const previousPop = this._chunkPop.get(key) ?? 0;
    this._chunkPop.set(key, previousPop + 1);
  }

  public removeCell(worldX: number, worldY: number): void {
    const chunkX = Math.floor(worldX / CHUNK_SIZE);
    const chunkY = Math.floor(worldY / CHUNK_SIZE);
    const key = chunkKey(chunkX, chunkY);
    const chunk = this._chunks.get(key);
    if (!chunk) {
      return;
    }
    const localX = worldX - chunkX * CHUNK_SIZE;
    const localY = worldY - chunkY * CHUNK_SIZE;
    const cellIndex = localY * CHUNK_SIZE + localX;
    if (!chunk[cellIndex]) {
      return;
    }
    chunk[cellIndex] = 0;
    this._population--;

    const previousPop = this._chunkPop.get(key) ?? 1;
    const nextPop = previousPop - 1;
    if (nextPop <= 0) {
      this._chunkPop.delete(key);
    } else {
      this._chunkPop.set(key, nextPop);
    }

    let chunkIsEmpty = true;
    for (let i = 0; i < chunk.length; i++) {
      if (chunk[i]) {
        chunkIsEmpty = false;
        break;
      }
    }
    if (chunkIsEmpty) {
      this._chunks.delete(key);
    }
  }

  public tick(): void {
    const chunkKeysToProcess = new Set<string>();
    for (const existingKey of this._chunks.keys()) {
      const [chunkX, chunkY] = parseChunkKey(existingKey);
      for (let neighborChunkDeltaY = -1; neighborChunkDeltaY <= 1; neighborChunkDeltaY++) {
        for (let neighborChunkDeltaX = -1; neighborChunkDeltaX <= 1; neighborChunkDeltaX++) {
          chunkKeysToProcess.add(chunkKey(chunkX + neighborChunkDeltaX, chunkY + neighborChunkDeltaY));
        }
      }
    }

    const nextChunks = new Map<string, Uint8Array>();
    const nextChunkPop = new Map<string, number>();
    let nextPopulation = 0;
    const pad = new Uint8Array(PADDED_SIZE * PADDED_SIZE);
    const P = PADDED_SIZE;
    const nextTable = this._nextTable;

    for (const chunkKeyString of chunkKeysToProcess) {
      const [chunkX, chunkY] = parseChunkKey(chunkKeyString);

      const kNw = chunkKey(chunkX - 1, chunkY - 1);
      const kN = chunkKey(chunkX, chunkY - 1);
      const kNe = chunkKey(chunkX + 1, chunkY - 1);
      const kW = chunkKey(chunkX - 1, chunkY);
      const kC = chunkKey(chunkX, chunkY);
      const kE = chunkKey(chunkX + 1, chunkY);
      const kSw = chunkKey(chunkX - 1, chunkY + 1);
      const kS = chunkKey(chunkX, chunkY + 1);
      const kSe = chunkKey(chunkX + 1, chunkY + 1);

      const nw = this._chunks.get(kNw);
      const n = this._chunks.get(kN);
      const ne = this._chunks.get(kNe);
      const w = this._chunks.get(kW);
      const c = this._chunks.get(kC);
      const e = this._chunks.get(kE);
      const sw = this._chunks.get(kSw);
      const s = this._chunks.get(kS);
      const se = this._chunks.get(kSe);

      let neighborhoodPop = 0;
      const addPop = (key: string, chunk: Uint8Array | undefined): void => {
        if (!chunk) {
          return;
        }
        neighborhoodPop += this._chunkPop.get(key) ?? countChunkPopulation(chunk);
      };
      addPop(kNw, nw);
      addPop(kN, n);
      addPop(kNe, ne);
      addPop(kW, w);
      addPop(kC, c);
      addPop(kE, e);
      addPop(kSw, sw);
      addPop(kS, s);
      addPop(kSe, se);

      if (neighborhoodPop === 0) {
        continue;
      }

      fillPaddedNeighborhood(pad, nw, n, ne, w, c, e, sw, s, se);

      if (!pad.includes(1)) {
        continue;
      }

      const nextChunk = new Uint8Array(CHUNK_SIZE * CHUNK_SIZE);
      let chunkHasLiveCells = false;
      let chunkLiveCount = 0;

      for (let localY = 0; localY < CHUNK_SIZE; localY++) {
        for (let localX = 0; localX < CHUNK_SIZE; localX++) {
          const cellIndex = (localY + 1) * P + (localX + 1);
          const alive = pad[cellIndex] !== 0;
          const neighborCount =
            pad[cellIndex - P - 1] +
            pad[cellIndex - P] +
            pad[cellIndex - P + 1] +
            pad[cellIndex - 1] +
            pad[cellIndex + 1] +
            pad[cellIndex + P - 1] +
            pad[cellIndex + P] +
            pad[cellIndex + P + 1];

          const tableIndex = alive ? 9 + neighborCount : neighborCount;
          if (nextTable[tableIndex]) {
            nextChunk[localY * CHUNK_SIZE + localX] = 1;
            chunkHasLiveCells = true;
            chunkLiveCount++;
            nextPopulation++;
          }
        }
      }

      if (chunkHasLiveCells) {
        nextChunks.set(chunkKeyString, nextChunk);
        nextChunkPop.set(chunkKeyString, chunkLiveCount);
      }
    }

    this._chunks = nextChunks;
    this._chunkPop = nextChunkPop;
    this._population = nextPopulation;
  }

  public forEachCellInRect(
    minX: number,
    minY: number,
    maxX: number,
    maxY: number,
    callback: (cell: Cell) => void
  ): void {
    if (maxX < minX || maxY < minY) {
      return;
    }

    const minChunkX = Math.floor(minX / CHUNK_SIZE);
    const maxChunkX = Math.floor(maxX / CHUNK_SIZE);
    const minChunkY = Math.floor(minY / CHUNK_SIZE);
    const maxChunkY = Math.floor(maxY / CHUNK_SIZE);

    for (let chunkY = minChunkY; chunkY <= maxChunkY; chunkY++) {
      for (let chunkX = minChunkX; chunkX <= maxChunkX; chunkX++) {
        const chunk = this._chunks.get(chunkKey(chunkX, chunkY));
        if (!chunk) {
          continue;
        }

        const chunkOriginWorldX = chunkX * CHUNK_SIZE;
        const chunkOriginWorldY = chunkY * CHUNK_SIZE;
        const rectMinX = Math.max(minX, chunkOriginWorldX);
        const rectMaxX = Math.min(maxX, chunkOriginWorldX + CHUNK_SIZE - 1);
        const rectMinY = Math.max(minY, chunkOriginWorldY);
        const rectMaxY = Math.min(maxY, chunkOriginWorldY + CHUNK_SIZE - 1);

        for (let worldY = rectMinY; worldY <= rectMaxY; worldY++) {
          for (let worldX = rectMinX; worldX <= rectMaxX; worldX++) {
            const localX = worldX - chunkOriginWorldX;
            const localY = worldY - chunkOriginWorldY;
            if (chunk[localY * CHUNK_SIZE + localX]) {
              callback(new Cell(worldX, worldY));
            }
          }
        }
      }
    }
  }

  public clear(): void {
    this._chunks.clear();
    this._chunkPop.clear();
    this._population = 0;
  }

  public saveSnapshot(): void {
    this._chunksSnapshot = new Map();
    for (const [key, arr] of this._chunks) {
      this._chunksSnapshot.set(key, new Uint8Array(arr));
    }
    this._populationSnapshot = this._population;
  }

  public restoreSnapshot(): void {
    this._chunks = new Map();
    for (const [key, arr] of this._chunksSnapshot) {
      this._chunks.set(key, new Uint8Array(arr));
    }
    this._population = this._populationSnapshot;
    this._rebuildChunkPopFromChunks();
  }

  public getPopulation(): number {
    return this._population;
  }

  public getBounds(): [number, number, number, number] {
    if (this._population === 0) {
      return [0, 0, 0, 0];
    }

    let minX = Number.MAX_VALUE;
    let maxX = Number.MAX_VALUE * -1;
    let minY = Number.MAX_VALUE;
    let maxY = Number.MAX_VALUE * -1;

    for (const [key, chunk] of this._chunks) {
      const [chunkX, chunkY] = parseChunkKey(key);
      const chunkOriginWorldX = chunkX * CHUNK_SIZE;
      const chunkOriginWorldY = chunkY * CHUNK_SIZE;
      for (let localY = 0; localY < CHUNK_SIZE; localY++) {
        for (let localX = 0; localX < CHUNK_SIZE; localX++) {
          if (chunk[localY * CHUNK_SIZE + localX]) {
            const worldX = chunkOriginWorldX + localX;
            const worldY = chunkOriginWorldY + localY;
            minX = Math.min(minX, worldX);
            maxX = Math.max(maxX, worldX);
            minY = Math.min(minY, worldY);
            maxY = Math.max(maxY, worldY);
          }
        }
      }
    }

    const width = maxX - minX + 1;
    const height = maxY - minY + 1;

    return [minX, minY, width, height];
  }
}
