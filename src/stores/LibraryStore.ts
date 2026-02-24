import { makeObservable, observable, runInAction } from "mobx";
import { ConfigStore } from "./ConfigStore";
import { Rule } from "../core/Config";
import { Library, Category } from "../core/Library";
import { Playback } from "../core/Playback";
import { Renderer } from "../core/Renderer";

interface GetResponseTextOptions {
  isGzipped: boolean;
}

export class LibraryStore {
  private _renderer: Renderer;
  private _playback: Playback;
  private _library: Library;
  private _configStore: ConfigStore;

  public categories = observable.array<Category>([]);

  constructor(renderer: Renderer, playback: Playback, library: Library, configStore: ConfigStore) {
    this._renderer = renderer;
    this._playback = playback;
    this._library = library;
    this._configStore = configStore;

    this.loadPatterns = this.loadPatterns.bind(this);

    makeObservable(this);
  }

  private async _fetchPatternLibrary(): Promise<Maybe<Category[]>> {
    try {
      const response = await fetch("/patterns.json");

      return response.json();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    }
  }

  private async _getResponseText(response: Response, options: GetResponseTextOptions): Promise<string> {
    if (options?.isGzipped) {
      const blob = await response.blob();
      const compressedReadableStream = blob.stream().pipeThrough(new DecompressionStream("gzip"));
      const decompressedResponse = await new Response(compressedReadableStream);

      return decompressedResponse.text();
    } else {
      return response.text();
    }
  }

  public loadPatterns(): void {
    if (this.categories.length === 0) {
      this._fetchPatternLibrary().then(categories => {
        runInAction(() => {
          this.categories.replace(categories!);
        });
      });
    }
  }

  public async loadPattern(path: string): Promise<void> {
    this._playback.pause();
    this._configStore.setRule(Rule.life);

    try {
      const isGzipped = path.endsWith(".gz");
      const response = await fetch(path);
      const patternString = await this._getResponseText(response, { isGzipped });

      this._library.loadPattern(patternString);

      this._renderer.zoomToFit();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    }
  }
}
