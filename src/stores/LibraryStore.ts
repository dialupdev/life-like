import { createContext } from "@lit/context";
import { makeObservable, observable, runInAction } from "mobx";

import { Rule } from "../core/Rules.ts";
import { parseRlePattern } from "../utils/PatternUtils.ts";

import type { Layout } from "../core/Layout.ts";
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

export const libraryStoreContext = createContext<LibraryStore>("libraryStore");

export class LibraryStore {
  private _world: World;
  private _layout: Layout;

  public categories = observable.array<Category>([]);

  constructor(world: World, layout: Layout) {
    this._world = world;
    this._layout = layout;

    this.loadPatterns = this.loadPatterns.bind(this);

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

  public async loadPatterns(): Promise<void> {
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

  // Only supports RLE format for now
  public async loadPattern(path: string): Promise<void> {
    this._world.setRule(Rule.life);

    try {
      const isGzipped = path.endsWith(".gz");
      const response = await fetch(path);

      let patternString = await this._getResponseText(response, { isGzipped });
      patternString = patternString.replace(/\r/g, "");

      this._world.clear();

      parseRlePattern(patternString, this._world.addCell.bind(this._world));

      this._world.saveStartState();

      this._layout.zoomToFit();
    } catch (error) {
      // oxlint-disable-next-line eslint/no-console
      console.error(error);
    }
  }
}
