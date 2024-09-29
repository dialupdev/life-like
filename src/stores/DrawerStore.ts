import { makeObservable, observable, computed, action } from "mobx";

export enum DrawerMode {
  settings = "Settings",
  patternLibrary = "Library",
}

export class DrawerStore {
  public drawerMode: DrawerMode | undefined = undefined;

  constructor() {
    this.openDrawer = this.openDrawer.bind(this);
    this.closeDrawer = this.closeDrawer.bind(this);
    this.toggleDrawer = this.toggleDrawer.bind(this);

    makeObservable(this, {
      drawerMode: observable,
      drawerOpen: computed,
      openDrawer: action,
      closeDrawer: action,
      toggleDrawer: action,
    });
  }

  public get drawerOpen(): boolean {
    return this.drawerMode !== undefined;
  }

  public openDrawer(drawerMode: DrawerMode): void {
    this.drawerMode = drawerMode;
  }

  public closeDrawer(): void {
    this.drawerMode = undefined;
  }

  public toggleDrawer(drawerMode: DrawerMode): void {
    if (this.drawerMode === drawerMode) {
      this.closeDrawer();
    } else {
      this.openDrawer(drawerMode);
    }
  }
}
