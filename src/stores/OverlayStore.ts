import { createContext } from "@lit/context";
import { makeObservable, observable, action } from "mobx";

export enum OverlayMode {
  import = "Import",
}

export const overlayStoreContext = createContext<OverlayStore>("overlayStore");

export class OverlayStore {
  @observable public accessor overlayMode: OverlayMode | undefined = undefined;

  constructor() {
    this.openOverlay = this.openOverlay.bind(this);
    this.closeOverlay = this.closeOverlay.bind(this);
    this.toggleOverlay = this.toggleOverlay.bind(this);

    makeObservable(this);
  }

  @action
  public openOverlay(overlayMode: OverlayMode): void {
    this.overlayMode = overlayMode;
  }

  @action
  public closeOverlay(): void {
    this.overlayMode = undefined;
  }

  @action
  public toggleOverlay(overlayMode: OverlayMode): void {
    if (this.overlayMode === overlayMode) {
      this.closeOverlay();
    } else {
      this.openOverlay(overlayMode);
    }
  }
}
