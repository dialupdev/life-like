import { makeObservable, observable, computed, action } from "mobx";

export enum DrawerMode {
  settings = "Settings",
  patternLibrary = "Library",
}

export class DrawerStore {
  @observable public accessor drawerMode: DrawerMode | undefined = undefined;

  constructor() {
    this.openDrawer = this.openDrawer.bind(this);
    this.closeDrawer = this.closeDrawer.bind(this);
    this.toggleDrawer = this.toggleDrawer.bind(this);

    makeObservable(this);
  }

  @computed
  public get drawerOpen(): boolean {
    return this.drawerMode !== undefined;
  }

  @action
  public openDrawer(drawerMode: DrawerMode): void {
    this.drawerMode = drawerMode;
  }

  @action
  public closeDrawer(): void {
    this.drawerMode = undefined;
  }

  @action
  public toggleDrawer(drawerMode: DrawerMode): void {
    if (this.drawerMode === drawerMode) {
      this.closeDrawer();
    } else {
      this.openDrawer(drawerMode);
    }
  }
}
