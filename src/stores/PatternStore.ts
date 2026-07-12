import { createContext } from "@lit/context";
import { makeObservable, observable, runInAction } from "mobx";

import { parseRlePattern } from "../utils/PatternUtils.ts";

import type { Layout } from "../core/Layout.ts";
import type { Playback } from "../core/Playback.ts";
import type { World } from "../core/World.ts";

export interface Pattern {
  name: string;
  path: string;
}

export interface Category {
  name: string;
  patterns: Pattern[];
}

interface GetResponseTextOptions {
  isGzipped: boolean;
}

export const patternStoreContext = createContext<PatternStore>("patternStore");

export class PatternStore {
  private _world: World;
  private _layout: Layout;
  private _playback: Playback;

  public categories = observable.array<Category>([]);

  constructor(world: World, layout: Layout, playback: Playback) {
    this._world = world;
    this._layout = layout;
    this._playback = playback;

    this.downloadLibrary = this.downloadLibrary.bind(this);

    makeObservable(this);
  }

  private async _fetchPatternLibrary(): Promise<Maybe<Category[]>> {
    try {
      const response = await fetch("/patterns.json");

      return response.json();
    } catch (error) {
      // oxlint-disable-next-line eslint/no-console
      console.error(error);
    }
  }

  private async _getResponseText(response: Response, options: GetResponseTextOptions): Promise<string> {
    if (options?.isGzipped) {
      const blob = await response.blob();
      const compressedReadableStream = blob.stream().pipeThrough(new DecompressionStream("gzip"));
      const decompressedResponse = new Response(compressedReadableStream);

      return decompressedResponse.text();
    } else {
      return response.text();
    }
  }

  public async downloadLibrary(): Promise<void> {
    if (this.categories.length > 0) {
      return;
    }

    const categories = await this._fetchPatternLibrary();

    if (categories) {
      runInAction(() => {
        this.categories.replace(categories);
      });
    }
  }

  public async importFromString(patternString: string): Promise<void> {
    patternString = patternString.replace(/\r/g, "");

    this._playback.pause();

    this._world.clear();

    parseRlePattern(patternString, this._world.setRule, this._world.addCell);

    this._world.saveStartState();

    this._layout.zoomToFit();
  }

  // Only supports RLE format for now
  public async importFromLibrary(path: string): Promise<void> {
    try {
      const isGzipped = path.endsWith(".gz");
      const response = await fetch(path);

      let patternString = await this._getResponseText(response, { isGzipped });

      await this.importFromString(patternString);
    } catch (error) {
      // oxlint-disable-next-line eslint/no-console
      console.error(error);
    }
  }
}
