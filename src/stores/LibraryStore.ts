import { makeAutoObservable, observable, runInAction } from "mobx";
import { LayoutStore } from "./LayoutStore";
import { PlaybackStore } from "./PlaybackStore";
import { Library, Pattern } from "../core/Library";

export class LibraryStore {
  private _library: Library;
  private _layoutStore: LayoutStore;
  private _playbackStore: PlaybackStore;

  public patterns = observable.array<Pattern>([]);

  constructor(library: Library, layoutStore: LayoutStore, playbackStore: PlaybackStore) {
    this._library = library;
    this._layoutStore = layoutStore;
    this._playbackStore = playbackStore;

    this.loadPatterns = this.loadPatterns.bind(this);

    makeAutoObservable(this);
  }

  public loadPatterns(): void {
    if (this.patterns.length === 0) {
      this._fetchPatternList().then(patternList => {
        runInAction(() => {
          this.patterns.replace(patternList!);
        });
      });
    }
  }

  public async loadPattern(path: string): Promise<void> {
    this._playbackStore.pause();

    try {
      const response = await fetch(path);
      const patternString = await response.text();

      this._library.loadPattern(patternString);

      this._layoutStore.zoomToFit();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    }
  }

  private async _fetchPatternList(): Promise<Maybe<Pattern[]>> {
    try {
      const response = await fetch("/patterns.json");
      const responseJson = await response.json();

      return responseJson.patterns;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    }
  }
}
