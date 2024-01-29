import { makeAutoObservable, observable, runInAction } from "mobx";
import { LayoutStore } from "./LayoutStore";
import { PlaybackStore } from "./PlaybackStore";
import { Library, Category } from "../core/Library";

export class LibraryStore {
  private _library: Library;
  private _layoutStore: LayoutStore;
  private _playbackStore: PlaybackStore;

  public categories = observable.array<Category>([]);

  constructor(library: Library, layoutStore: LayoutStore, playbackStore: PlaybackStore) {
    this._library = library;
    this._layoutStore = layoutStore;
    this._playbackStore = playbackStore;

    this.loadPatterns = this.loadPatterns.bind(this);

    makeAutoObservable(this);
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
}
