import { makeObservable, observable, runInAction } from "mobx";

import { Rule } from "../core/Rules";
import { parseRlePattern } from "../utils/PatternUtils";

import type { Renderer } from "../core/Renderer";
import type { World } from "../core/World";

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

export class LibraryStore {
  private _world: World;
  private _renderer: Renderer;

  public categories = observable.array<Category>([]);

  constructor(world: World, renderer: Renderer) {
    this._world = world;
    this._renderer = renderer;

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

  public loadPatterns(): void {
    if (this.categories.length === 0) {
      void this._fetchPatternLibrary().then(categories => {
        runInAction(() => {
          this.categories.replace(categories!);
        });
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

      this._renderer.zoomToFit();
    } catch (error) {
      // oxlint-disable-next-line eslint/no-console
      console.error(error);
    }
  }
}
