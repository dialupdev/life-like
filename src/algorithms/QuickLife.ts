import { Cell } from "../core/Cell.ts";

import type { LifeAlgorithm } from "./LifeAlgorithm.ts";

/**
 * Sparse life-like CA using a **chunk map** (fixed-size square blocks). This matches
 * the plan’s “hierarchical blocks + B/S stepping” goal without porting Golly’s full
 * qlifealgo C++ tree (separate block sizes, stability flags, etc.).
 *
 * Each chunk is `CHUNK_SIZE × CHUNK_SIZE` cells (`Uint8Array`, 0/1). Stepping reads
 * the previous generation across chunk borders; `forEachCellInRect` only walks chunks
 * that overlap the query rectangle.
 */
const CHUNK_SIZE = 64;

const NEIGHBOR_OFFSETS: [number, number][] = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1],
];

function chunkKey(chunkX: number, chunkY: number): string {
  return `${chunkX},${chunkY}`;
}

function parseChunkKey(key: string): [number, number] {
  const comma = key.indexOf(",");
  return [Number.parseInt(key.slice(0, comma), 10), Number.parseInt(key.slice(comma + 1), 10)];
}

export class QuickLife implements LifeAlgorithm {
  private _birthSet!: Set<number>;
  private _survivalSet!: Set<number>;

  private _chunks = new Map<string, Uint8Array>();
  private _population = 0;

  private _chunksSnapshot = new Map<string, Uint8Array>();
  private _populationSnapshot = 0;

  constructor() {
    this._birthSet = new Set();
    this._survivalSet = new Set();
  }

  public setRule(birthSet: Set<number>, survivalSet: Set<number>): void {
    this._birthSet = birthSet;
    this._survivalSet = survivalSet;
  }

  private _getCell(worldX: number, worldY: number): number {
    const chunkX = Math.floor(worldX / CHUNK_SIZE);
    const chunkY = Math.floor(worldY / CHUNK_SIZE);
    const chunk = this._chunks.get(chunkKey(chunkX, chunkY));
    if (!chunk) {
      return 0;
    }
    const localX = worldX - chunkX * CHUNK_SIZE;
    const localY = worldY - chunkY * CHUNK_SIZE;
    return chunk[localY * CHUNK_SIZE + localX] ?? 0;
  }

  private _nextAlive(alive: boolean, neighborCount: number): boolean {
    if (alive) {
      return this._survivalSet.has(neighborCount);
    }
    return this._birthSet.has(neighborCount);
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
    let nextPopulation = 0;

    for (const chunkKeyString of chunkKeysToProcess) {
      const [chunkX, chunkY] = parseChunkKey(chunkKeyString);
      const nextChunk = new Uint8Array(CHUNK_SIZE * CHUNK_SIZE);
      let chunkHasLiveCells = false;

      for (let localY = 0; localY < CHUNK_SIZE; localY++) {
        for (let localX = 0; localX < CHUNK_SIZE; localX++) {
          const worldX = chunkX * CHUNK_SIZE + localX;
          const worldY = chunkY * CHUNK_SIZE + localY;
          const alive = this._getCell(worldX, worldY) !== 0;
          let neighborCount = 0;
          for (const [offsetX, offsetY] of NEIGHBOR_OFFSETS) {
            if (this._getCell(worldX + offsetX, worldY + offsetY)) {
              neighborCount++;
            }
          }
          if (this._nextAlive(alive, neighborCount)) {
            nextChunk[localY * CHUNK_SIZE + localX] = 1;
            chunkHasLiveCells = true;
            nextPopulation++;
          }
        }
      }

      if (chunkHasLiveCells) {
        nextChunks.set(chunkKeyString, nextChunk);
      }
    }

    this._chunks = nextChunks;
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
